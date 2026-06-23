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

interface SiteContentDetails {
  downloadType?: string;
  site: string;
  title: string;
  cover?: string;
  identifier: string;
  url: string;
  defaultTags: string[];
  contentUrl?: string;
  extraData?: string;
}
