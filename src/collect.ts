import { fetchFeeds, loadFeedSpecs } from "./parser.ts";
import { sleep } from "./deps.ts";
const feedSpecs = await loadFeedSpecs(
  "./data/publishers.csv",
  "./data/feed_specs.csv",
);

await Deno.mkdir("rss/jsons", { recursive: true });

feedSpecs.forEach(async (spec, i) => {
  try {
    // 임시로 랜덤 시간 지연을 넣어서 rate limit 우회
    await sleep.sleep(1 + i % 5);

    const categories = spec.categories.join("-");
    const filename = `rss/jsons/${spec.publisher.id}-${categories}.json`;
    const feeds = await fetchFeeds(spec);
    await Deno.writeTextFile(filename, JSON.stringify(feeds));
  } catch (e) {
    console.log(e);
  }
});
