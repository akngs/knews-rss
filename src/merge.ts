import { groupBy } from "./deps.ts";
import { FeedItem, FeedSpec, Publisher, serialize } from "./parser.ts";

const allFeeds: FeedItem[] = [];
for await (const file of Deno.readDir(`rss/jsons`)) {
  const content = Deno.readTextFileSync(`rss/jsons/${file.name}`);
  const feeds = JSON.parse(content) as unknown as FeedItem[];
  feeds.forEach((f) => allFeeds.push(f));
}
console.log(`Loaded ${allFeeds.length} feed items`);

const feedsByPublishers = groupBy((f) => f.spec.publisher.id, allFeeds);
const feedsByCategories: Record<string, FeedItem[]> = {};
allFeeds.forEach((f) => {
  f.spec.categories.forEach((c) => {
    const feeds = feedsByCategories[c] || [];
    feeds.push(f);
    feedsByCategories[c] = feeds;
  });
});

await Deno.mkdir("rss/publishers", { recursive: true });
await Deno.mkdir("rss/categories", { recursive: true });

// 전체 피드 저장
console.log(`Saving all feeds...`);
const publisher: Publisher = {
  id: "all",
  name: "전체",
  type: "종합일간지",
  url: "https://github.com/akngs/knews-rss",
};
const spec: FeedSpec = {
  publisher,
  title: publisher.name,
  categories: [],
  url: publisher.url,
};
const xml = serialize(spec, allFeeds.sort(sortByDate));
await Deno.writeTextFile("rss/all.xml", xml);

// 퍼블리셔별 피드 저장
console.log(`Saving feeds by publishers...`);
for await (const entry of Object.entries(feedsByPublishers)) {
  const publisher = entry[0];
  const feeds = entry[1];
  const xml = serialize(feeds[0].spec, feeds.sort(sortByDate));
  await Deno.writeTextFile(`rss/publishers/${publisher}.xml`, xml);
}

// 카테고리별 피드 저장
console.log(`Saving feeds by categories...`);
for await (const entry of Object.entries(feedsByCategories)) {
  const category = entry[0];
  const feeds = entry[1];
  const xml = serialize(feeds[0].spec, feeds.sort(sortByDate));
  await Deno.writeTextFile(`rss/categories/${category}.xml`, xml);
}

function sortByDate(a: FeedItem, b: FeedItem) {
  return (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0);
}
