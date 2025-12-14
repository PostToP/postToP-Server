export interface YouTubeApiResponse {
  kind: string;
  etag: string;
  items: Item[];
  pageInfo: PageInfo;
}

export interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
  contentDetails: ContentDetails;
  topicDetails: TopicDetails;
  localizations?: Localizations;
}

export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  channelTitle: string;
  categoryId: string;
  liveBroadcastContent: string;
  localized: Localized;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
}
export interface Localized {
  title: string;
  description: string;
}

export interface ContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  projection: string;
}

// biome-ignore lint/complexity/noBannedTypes: <explanation> Using empty object type for ContentRating as it can have various properties </explanation>
export type ContentRating = {};

export interface TopicDetails {
  topicCategories: string[];
}

export interface Localizations {
  [key: string]: LocalizationThing;
}

export interface LocalizationThing {
  title: string | null;
  description: string;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YoutubeChannelApiResponse {
  kind: string;
  etag: string;
  pageInfo: PageInfo;
  items: Item[];
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
  contentDetails: ContentDetails;
  topicDetails: TopicDetails;
}

export interface Snippet {
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  localized: Localized;
  country: string;
}

export interface Thumbnails {
  default: Default;
  medium: Medium;
  high: High;
}

export interface Default {
  url: string;
  width: number;
  height: number;
}

export interface Medium {
  url: string;
  width: number;
  height: number;
}

export interface High {
  url: string;
  width: number;
  height: number;
}

export interface Localized {
  title: string;
  description: string;
}

export interface ContentDetails {
  relatedPlaylists: RelatedPlaylists;
}

export interface RelatedPlaylists {
  likes: string;
  uploads: string;
}

export interface TopicDetails {
  topicIds: string[];
  topicCategories: string[];
}
