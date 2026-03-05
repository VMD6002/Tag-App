type TagType = Record<string, { Count: number; CoverUrl?: string }>;

interface MultiSelectOption {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

type ServerTagType = Record<string, number>;

interface SiteContentData {
  downloader: "yt-dlp" | "curl";
  site: string;
  title: string;
  coverUrl: string;
  identifier: string;
  url: string;
  defaultTags: string[];
  ogImage?: string;
  extraData?: string;
}
