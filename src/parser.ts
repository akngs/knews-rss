import { readCSVObjects } from "https://deno.land/x/csv@v0.7.2/mod.ts";

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

/** CSV 파일들로부터 피드 명세 목록 읽어오기 */
export async function loadFeedSpecs(
  publishersPath: string,
  feedSpecsPath: string,
): Promise<readonly FeedSpec[]> {
  const fPublishers = await Deno.open(publishersPath);
  const fFeedSpecs = await Deno.open(feedSpecsPath);
  const publishers = await parse_publishers(fPublishers);
  const feedSpecs = await parse_feed_specs(publishers, fFeedSpecs);
  return feedSpecs;
}

/**
 * 언론사 목록을 파싱
 */
export async function parse_publishers(
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

/**
 * RSS 피드 명세 목록을 파싱
 */
export async function parse_feed_specs(
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
