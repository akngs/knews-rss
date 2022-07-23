import { fetchFeeds, loadFeedSpecs } from "./parser.ts";

const feedSpecs = await loadFeedSpecs(
  "./data/publishers.csv",
  "./data/feed_specs.csv",
);

for (const feedSpec of feedSpecs) {
  const feeds = await fetchFeeds(feedSpec);
  console.log(feeds[0]);
}
