import { RawFeed, readCSVObjects } from "./deps.ts";

/** 언론사 */
export type Publisher = {
  readonly name: string;
  readonly type: string;
  readonly url: string;
};

/** 피드 명세 */
export type FeedSpec = {
  readonly publisher: Publisher;
  readonly title: string;
  readonly categories: readonly string[];
  readonly url: string;
};

/** 표준화된 피드 항목 */
export type FeedItem = {
  readonly spec: FeedSpec;
  readonly title: string;
  readonly partialText: string;
  readonly date: string;
  readonly url: string;
};

/** CSV 파일들로부터 피드 명세 목록 읽어오기 */
export async function loadFeedSpecs(
  publishersPath: string,
  feedSpecsPath: string,
): Promise<readonly FeedSpec[]> {
  const fPublishers = await Deno.open(publishersPath);
  const fFeedSpecs = await Deno.open(feedSpecsPath);
  const publishers = await parsePublishers(fPublishers);
  const feedSpecs = await parseFeedSpecs(publishers, fFeedSpecs);
  return feedSpecs;
}

/** 언론사 목록을 파싱 */
export async function parsePublishers(
  f: Deno.Reader,
): Promise<Publisher[]> {
  const results: Publisher[] = [];
  for await (const row of readCSVObjects(f)) {
    results.push({
      name: row.name || "",
      type: row.type || "",
      url: row.url || "",
    });
  }
  return results;
}

/** RSS 피드 명세 목록을 파싱 */
export async function parseFeedSpecs(
  publishers: Publisher[],
  f: Deno.Reader,
): Promise<FeedSpec[]> {
  const publisherMap = new Map(publishers.map((p) => [p.name, p]));

  const results: FeedSpec[] = [];
  for await (const row of readCSVObjects(f)) {
    const publisher = publisherMap.get(row.publisher);
    if (publisher === undefined) {
      throw new Error(`Unknown publisher: ${row.publisher}`);
    }

    results.push({
      publisher,
      title: row.title || "",
      categories: row.categories ? row.categories.split("|") : [],
      url: row.url || "",
    });
  }
  return results;
}

/** XML 인코딩 정보를 스니핑하여 ArrayBuffer를 string으로 디코딩 */
export function decodeXml(buf: ArrayBuffer): string {
  const sniff = new TextDecoder().decode(buf.slice(0, 50));
  const m = sniff.match(/\sencoding="(.+?)"/);
  const encoding = m ? m[1] : "utf-8";
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buf);
}

/** https://deno.land/x/rss 의 Feed 형식을 FeedItem[] 형식으로 통일 */
export function standardizeFeed(spec: FeedSpec, feed: RawFeed): FeedItem[] {
  return feed.entries.map((item) => {
    const rawDate = item["dc:dateRaw"] || item.publishedRaw;
    if (!rawDate) throw new Error("No date");

    return {
      spec,
      title: item.title?.value || "",
      partialText: item.description?.value || "",
      date: parseFuzzyDate(rawDate).toISOString(),
      url: item.links?.[0]?.href || "",
    };
  });
}

/**
 * 다양한 형식의 문자열을 Date 객체로 파싱한다. 실패하면 예외를 던진다.
 */
export function parseFuzzyDate(raw: string): Date {
  const parsers = [parseDateFormat0, parseDateFormat1];
  for (const parser of parsers) {
    const result = parser(raw);
    if (result) return result;
  }
  throw new Error(`Invalid format: ${raw}`);
}

/** 로컬 컴퓨터의 타임존 오프셋(minutes) */
const TZ_OFFSET = new Date().getTimezoneOffset();

/**
 * 아래 형식의 날짜를 파싱
 *
 * 2022-07-15T22:01:07+09:00
 * 2022-07-15 07:30:10
 */
function parseDateFormat0(raw: string): Date | null {
  const p =
    /^(\d\d\d\d)-(\d\d)-(\d\d)[T\s](\d\d):(\d\d):(\d\d)(?:\+\d\d:\d\d)?$/;

  const m = raw.match(p);
  if (!m) return null;

  const parts = m.slice(1).map((part) => +part);
  const [yyyy, mm, dd, hour, min, sec] = parts;
  return new Date(yyyy, mm - 1, dd, hour, min, sec);
}

/**
 * 아래 형식의 날짜를 파싱
 *
 * Sat, 16 07 2022 10:35:04 +0900
 * Sat, 16 Jul 2022 10:10:25 +0900
 * Fri, 15 Jul 2022 17:34:14 GMT
 * Sat,16 Jul 2022 10:48:43 +0900
 * 16 Jul 2022 10:48:43 +0900
 * 16 Jul  2022 10:48:43 +0900
 */
function parseDateFormat1(raw: string): Date | null {
  const p =
    /^(?:\w+,\s*)?(\d+)\s+(\d+|\w+)\s+(\d+)\s(\d\d):(\d\d):(\d\d)\s+(.+)$/;
  const word2month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const m = raw.match(p);
  if (!m) return null;

  const dd = +m[1];
  const mm = +m[2] || (word2month.indexOf(m[2]) + 1);
  const yyyy = +m[3];
  const [hour, min, sec] = [+m[4], +m[5], +m[6]];
  const tzOffset = m[7] === "GMT" ? TZ_OFFSET : 0;
  return new Date(yyyy, mm - 1, dd, hour, min - tzOffset, sec);
}
