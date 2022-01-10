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
      date: rawDate,
      url: item.links?.[0]?.href || "",
    };
  });
}
