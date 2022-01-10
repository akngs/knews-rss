import { loadFeedSpecs } from "./parser.ts";

const feedSpecs = await loadFeedSpecs(
  "./data/publishers.csv",
  "./data/feed_specs.csv",
);

for (const feedSpec of feedSpecs) {
  console.log(feedSpec);
}
