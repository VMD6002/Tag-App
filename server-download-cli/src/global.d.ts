type preset = {
  label: string;
  value: string;
  cookies?: true;
};

interface ContentDownload {
  type: "yt-dlp" | "curl";
  flags?: preset | string;
}

interface DownloadItem {
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

interface contentJsonType
  extends Omit<DownloadItem, "Download" | "Url" | "CoverUrl"> {
  CoverUrl?: string;
  Download?: any;
  Url?: string;
}
