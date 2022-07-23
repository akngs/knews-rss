import { fetchFeeds, loadFeedSpecs, serialize } from "./parser.ts";
import { sleep } from "./deps.ts";
const feedSpecs = await loadFeedSpecs(
  "./data/publishers.csv",
  "./data/feed_specs.csv",
);

await Deno.mkdir("rss", { recursive: true });

feedSpecs.forEach(async (spec) => {
  try {
    // 임시로 랜덤 시간 지연을 넣어서 rate limit 우회
    await sleep.sleepRandomAmountOfSeconds(1, 20);

    const categories = spec.categories.join("-");
    const filename = `rss/${spec.publisher.id}-${categories}.xml`;
    const feeds = await fetchFeeds(spec);
    const xml = serialize(spec, feeds);
    await Deno.writeTextFile(filename, xml);
  } catch (e) {
    console.log(e);
  }
});
