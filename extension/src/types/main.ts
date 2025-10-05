interface ContentDownload {
  type: "yt-dlp" | "curl";
  flags: preset | string;
}

interface ContentType {
  id: string;
  Title: string;
  CoverUrl?: string;
  Tags: string[];
  Download?: ContentDownload;
  Url?: string;
  Added: number;
  LastUpdated: number;
  extraData: string;
  Type?: "img" | "video" | "ImgSet" | "VideoSet";
  ext?: string[];
}

type ContentDataType = Record<string, ContentType>;

interface FilterDataType {
  any?: string[];
  all?: string[];
  none?: string[];
  search?: string;
  types?: string[];
  orderByLatest?: boolean;
}

interface TitleIdObject {
  id: string;
  Title: string;
}

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

type preset = {
  label: string;
  value: string;
  cookies?: true;
};

interface SiteContentData {
  Downloader: "yt-dlp" | "curl";
  Site: string;
  Title: string;
  CoverUrl: string;
  Identifier: string;
  Url: string;
  defaultTags: string[];
  OgImage?: string;
}
