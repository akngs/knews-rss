import { parseFeed } from "https://deno.land/x/rss/mod.ts";

const response = await fetch(
  "http://static.userland.com/gems/backend/rssTwoExample2.xml",
);
const xml = await response.text();
const feed = await parseFeed(xml);
console.log(feed);
