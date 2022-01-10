import { assertEquals, StringReader } from "../dev_deps.ts";
import {
  type FeedSpec,
  parse_feed_specs,
  parse_publishers,
  type Publisher,
} from "../parser.ts";

Deno.test("parse_publishers()", async () => {
  const raw = new StringReader([
    "name,type,url",
    "n0,t0,https://n0.com",
    "n1,t1,https://n1.com",
  ].join("\n"));

  const expected: Publisher[] = [
    { name: "n0", type: "t0", url: "https://n0.com" },
    { name: "n1", type: "t1", url: "https://n1.com" },
  ];
  const actual = await parse_publishers(raw);
  assertEquals(actual, expected);
});

Deno.test("parse_feed_specs()", async () => {
  const raw = new StringReader([
    "publisher,title,categories,url",
    "p0,t0,c0,https://p0.com/c0.xml",
    "p1,t1,c1|c2,https://p1.com/c1.xml",
  ].join("\n"));

  const publishers = [
    { name: "p0", type: "t0", url: "https://p0.com" },
    { name: "p1", type: "t1", url: "https://p1.com" },
  ];

  const expected: FeedSpec[] = [
    {
      publisher: publishers[0],
      title: "t0",
      categories: ["c0"],
      url: "https://p0.com/c0.xml",
    },
    {
      publisher: publishers[1],
      title: "t1",
      categories: ["c1", "c2"],
      url: "https://p1.com/c1.xml",
    },
  ];
  const actual = await parse_feed_specs(publishers, raw);
  assertEquals(actual, expected);
});
