import { mkdirSync } from "node:fs";

const AppDirs = [
  "Sync",
  "UnSyncable",
  "Download",
  "media/Videos/Covers",
  "media/Images/Covers",
  "media/ImgSets",
  "media/VideoSets",
  "webSync",
];

export default function createAppDirs() {
  for (const dir of AppDirs) {
    mkdirSync(dir, { recursive: true });
  }
}
