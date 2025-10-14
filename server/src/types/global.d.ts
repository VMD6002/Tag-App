type preset = {
  label: string;
  value: string;
  cookies?: true;
};

interface ContentDownload {
  type: "yt-dlp" | "curl";
  flags: preset | string;
}

export interface ContentJsonType {
  id: string;
  Title: string;
  CoverUrl: string;
  Tags: string[];
  Download: ContentDownload;
  Url: string;
  Added: number;
  LastUpdated: number;
  extraData: string;
}
