// Invented placeholder data for the dev-only mock pages. No network, no real people or sites' content.
import type {
  ContentWebType,
  ParentTagsType,
  TagsType,
} from "@tagapp/utils/types";

export type Scenario = "normal" | "stress" | "empty";

// ── Covers: CSS-gradient SVGs as data URIs, in assorted aspect ratios ──────────
const RATIOS: [number, number][] = [
  [16, 9],
  [4, 3],
  [1, 1],
  [9, 16],
  [21, 9],
  [2, 3],
  [3, 2],
  [16, 9],
];

export function cover(seed: number, label = ""): string {
  const [w, h] = RATIOS[seed % RATIOS.length] as [number, number];
  const hue = (seed * 47) % 360;
  const W = w * 40;
  const H = h * 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 45%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360} 60% 28%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="white" fill-opacity=".7" font-family="monospace" font-size="${Math.round(Math.min(W, H) / 8)}" text-anchor="middle" dominant-baseline="middle">${label || `${w}:${h}`}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ── Tags ───────────────────────────────────────────────────────────────────────
const BASE_TAGS = [
  "Type:Video",
  "Type:Gallery",
  "Type:GIF",
  "Type:Short_Clip",
  "Site:YouTube",
  "Site:Sample_Video",
  "Site:Example_Gallery",
  "Topic:Cooking",
  "Topic:Travel",
  "Topic:Gardening",
  "Topic:Photography",
  "Topic:Fitness",
  "Mood:Relaxing",
  "Mood:Energetic",
  "Tag:Watched",
  "Tag:To-Watch",
];

export function makeTags(scenario: Scenario): {
  tags: TagsType;
  parentTags: ParentTagsType;
} {
  if (scenario === "empty")
    return { tags: {}, parentTags: { Type: {}, Tag: {}, Site: {} } };
  const names = [...BASE_TAGS];
  if (scenario === "stress") {
    for (let i = 1; i <= 40; i++) names.push(`Topic:Sample_Topic_Number_${i}`);
    for (let i = 1; i <= 14; i++) names.push(`Collection:Placeholder_${i}`);
    names.push(`Topic:${"A_very_long_tag_name_without_spaces_".repeat(3)}`);
  }
  const tags: TagsType = {};
  names.forEach((n, i) => {
    tags[n] = { count: scenario === "stress" ? (i * 7) % 130 : (i * 3) % 14 };
  });
  tags["Topic:Cooking"] = { count: 12, cover: cover(2, "Cooking") };
  tags["Type:Video"] = { count: 134 % 100 };
  tags["Mood:Energetic"] = { count: 0 };
  const parentTags: ParentTagsType = {};
  for (const n of names) parentTags[n.split(":")[0] as string] = {};
  parentTags.Empty_Group = {};
  return { tags, parentTags };
}

// ── Content ────────────────────────────────────────────────────────────────────
const TITLES = [
  "Homemade pasta in 20 minutes",
  "A weekend in a small mountain village",
  "Balcony herb garden for beginners",
  "Ten stretches to do at your desk",
  "Street photography without a zoom lens",
  "Slow-cooked tomato sauce, start to finish",
  "Packing light: one bag for two weeks",
  "How to repot a root-bound plant",
  "Sunrise timelapse over the harbour",
  "Beginner sourdough: the first three days",
  "Morning mobility routine (12 minutes)",
  "Hiking the coastal path in autumn",
  "Understanding aperture, shutter and ISO",
  "A tiny kitchen makeover on a budget",
  "Fresh spring rolls with peanut sauce",
  "Night market food tour, part two",
  "Growing tomatoes in small containers",
  "Interval training you can do at home",
  "Film photography: developing your first roll",
  "The quiet streets of an old town",
];

const LONG_TITLE =
  "A very long placeholder title that keeps going to check how the card wraps whole words across several lines instead of breaking in the middle of a word, including some numbers like 2024 and a few extra words at the end";
const UNBROKEN_TITLE =
  "Unbrokenplaceholdertitlewithnospacesatalltotestoverflowhandlingincardsandlists_0123456789_abcdefghijklmnopqrstuvwxyz";
const LONG_ID = `sample_${"a1b2c3d4e5f6".repeat(7)}_${"9f8e7d6c".repeat(4)}`;

const pick = <T>(arr: T[], i: number) => arr[i % arr.length] as T;

export function makeContent(scenario: Scenario): ContentWebType[] {
  if (scenario === "empty") return [];
  const count = scenario === "stress" ? 60 : 18;
  const now = Math.floor(Date.now() / 1000);
  const items: ContentWebType[] = [];
  for (let i = 0; i < count; i++) {
    const tags = [
      pick(["Type:Video", "Type:Gallery", "Type:GIF", "Type:Short_Clip"], i),
      pick(["Site:YouTube", "Site:Sample_Video", "Site:Example_Gallery"], i),
      pick(
        [
          "Topic:Cooking",
          "Topic:Travel",
          "Topic:Gardening",
          "Topic:Photography",
          "Topic:Fitness",
        ],
        i,
      ),
    ];
    if (i % 3 === 0) tags.push("Mood:Relaxing");
    if (i % 4 === 1) tags.push("Tag:To-Watch");
    items.push({
      id: `sample_${(i + 1).toString(36)}${(i * 7919).toString(36)}`,
      title: pick(TITLES, i),
      tags,
      extraData: "",
      cover: cover(i, `#${i + 1}`),
      url: `https://example.test/item/${i + 1}`,
      scraper: "Sample Video",
      added: now - i * 86400 * 2 - 3600,
      lastUpdated: now - i * 86400,
    });
  }
  // Stress cases, placed first so they show on the first screen.
  const base = { extraData: "", scraper: "Sample Video", lastUpdated: now };
  const stress: ContentWebType[] = [
    {
      ...base,
      id: "stress_long_title",
      title: LONG_TITLE,
      tags: ["Type:Video", "Topic:Travel"],
      cover: cover(1, "long title"),
      url: "https://example.test/long",
      added: now - 60,
    },
    {
      ...base,
      id: "stress_unbroken_title",
      title: UNBROKEN_TITLE,
      tags: ["Type:Gallery"],
      cover: cover(3, "tall 9:16"),
      url: "https://example.test/unbroken",
      added: now - 120,
    },
    {
      ...base,
      id: LONG_ID,
      title: "Item with a very long unwrapped ID",
      tags: ["Type:Video", "Site:YouTube"],
      cover: cover(4, "ultrawide"),
      url: "https://example.test/long-id",
      added: now - 180,
    },
    {
      ...base,
      id: "stress_many_tags",
      title: "Item with a lot of tags",
      tags: [
        ...BASE_TAGS,
        ...Array.from(
          { length: 14 },
          (_, k) => `Topic:Sample_Topic_Number_${k + 1}`,
        ),
        ...Array.from(
          { length: 6 },
          (_, k) => `Collection:Placeholder_${k + 1}`,
        ),
      ],
      cover: cover(0, "many tags"),
      url: "https://example.test/many-tags",
      added: now - 240,
    },
    {
      ...base,
      id: "stress_no_tags",
      title: "Item with no tags and no cover",
      tags: [],
      url: "https://example.test/no-tags",
      added: now - 300,
    },
  ];
  return [...stress, ...items];
}

// ── Supported sites ────────────────────────────────────────────────────────────
export type MockSite = {
  name: string;
  hosts: string[];
  script: string;
  afterAddScript?: string;
  afterRemoveScript?: string;
  matchPatterns?: string[];
  download?: {
    presets: { label: string; value: string }[];
    defaultPreset: { label: string; value: string };
  };
};

const SAMPLE_SCRIPT = `ctdls.downloadType = "yt-dlp"
ctdls.title = document.title
ctdls.url = location.href
ctdls.identifier = \`sample_\${location.pathname.split("/").pop()}\`
ctdls.cover = sh.getOgImage()
sh.ready = true`;

export function makeSites(scenario: Scenario): Record<string, MockSite> {
  if (scenario === "empty") return {};
  const n = scenario === "stress" ? 34 : 7;
  const sites: Record<string, MockSite> = {};
  const names = [
    "Sample Video",
    "Example Gallery",
    "Placeholder Clips",
    "Demo Recipes",
    "Test Travel Journal",
    "Mock Photo Board",
    "Dummy Podcasts",
  ];
  for (let i = 0; i < n; i++) {
    const name = names[i] ?? `Placeholder Site ${i + 1}`;
    const slug = name.toLowerCase().replaceAll(" ", "-");
    sites[name] = {
      name,
      hosts: [
        `www.${slug}.example.test`,
        ...(i % 3 === 0
          ? [`m.${slug}.example.test`, `${slug}.example.test`]
          : []),
      ],
      script: SAMPLE_SCRIPT,
      afterAddScript: i === 0 ? "console.log('added', data)" : undefined,
      matchPatterns: ["/*"],
      download: {
        presets: [
          { label: "720p", value: "-f b[height<=720]" },
          { label: "480p", value: "-f b[height<=480]" },
        ],
        defaultPreset: { label: "720p", value: "-f b[height<=720]" },
      },
    };
  }
  if (scenario === "stress")
    sites["A site with a very long name that should truncate in the list"] = {
      name: "A site with a very long name that should truncate in the list",
      hosts: [`www.${"very-long-hostname-".repeat(4)}example.test`],
      script: SAMPLE_SCRIPT,
    };
  return sites;
}

export const MOCK_CONSTANTS = {
  CDN: "https://cdn.example.test/covers",
  VIDEO: "https://www.sample-video.example.test",
};
