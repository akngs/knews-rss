import { fetchFeeds, loadFeedSpecs, serialize } from "./parser.ts";

const feedSpecs = await loadFeedSpecs(
  "./data/publishers.csv",
  "./data/feed_specs.csv",
);

await Deno.mkdir("rss", { recursive: true });

let i = 1;
for (const spec of feedSpecs) {
  try {
    const feeds = await fetchFeeds(spec);
    const xml = serialize(spec, feeds);
    const categories = spec.categories.join("-");

    const filename = `rss/${spec.publisher.id}-${categories}.xml`;
    console.log(`Writing ${filename} ... ${i++}/${feedSpecs.length}`);
    await Deno.writeTextFile(filename, xml);
  } catch (e) {
    console.log(e);
  }
}
