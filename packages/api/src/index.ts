import * as download from "./routers/download.js";
import * as fix from "./routers/fix.js";
import * as main from "./routers/main.js";
import * as webSync from "./routers/webSync.js";
import * as gallery from "./routers/gallery.js";
import * as text from "./routers/text.js";
import * as audio from "./routers/audio.js";
import * as video from "./routers/video.js";

export const router = {
  download,
  fix,
  main,
  video,
  gallery,
  text,
  audio,
  webSync,
};

export type router = typeof router;
