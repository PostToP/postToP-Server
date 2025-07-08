import { Insertable, Selectable, Updateable } from "kysely";


export interface Database {
    video: VideoTable;
    watched: WatchedTable;
    filter: FilterTable;
    video_genre: VideoGenreTable;
}

export interface VideoTable {
    ID: string;
    artistID: string;
    isMusic: number;
}

export type Video = Selectable<VideoTable>;
export type NewVideo = Insertable<VideoTable>;
export type VideoUpdate = Updateable<VideoTable>;

export interface WatchedTable {
    musicID: string;
    datetime: string;
}

export type Watched = Selectable<WatchedTable>;
export type NewWatched = Insertable<WatchedTable>;
export type WatchedUpdate = Updateable<WatchedTable>;

export interface FilterTable {
    videoID: string;
}

export type Filter = Selectable<FilterTable>;
export type NewFilter = Insertable<FilterTable>;
export type FilterUpdate = Updateable<FilterTable>;

export interface VideoGenreTable {
    videoID: string;
    genre: string;
}

export type VideoGenre = Selectable<VideoGenreTable>;
export type NewVideoGenre = Insertable<VideoGenreTable>;
export type VideoGenreUpdate = Updateable<VideoGenreTable>;
