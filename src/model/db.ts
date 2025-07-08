import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect, sql } from "kysely";
import { Database, Watched } from "./types";

console.log(process.env.DB_PATH);
const dialect = new SqliteDialect({
  database: new SQLite(process.env.DB_PATH || "./db.sqlite"),
});
export const db = new Kysely<Database>({
  dialect,
});

initializeDB();

async function initializeDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS watched (
      musicID TEXT,
      datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (musicID) REFERENCES video(ID),
      PRIMARY KEY (datetime)
    )
  `.execute(db);
  
  await sql`
    CREATE TABLE IF NOT EXISTS video (
      ID TEXT,
      artistID TEXT,
      isMusic INTEGER,
      PRIMARY KEY (ID)
    )
  `.execute(db);
  
  await sql`
    CREATE TABLE IF NOT EXISTS filter (
      videoID TEXT,
      PRIMARY KEY (videoID)
    )
  `.execute(db);
  
  await sql`
    CREATE TABLE IF NOT EXISTS video_genre (
      videoID TEXT,
      genre TEXT,
      PRIMARY KEY (videoID, genre),
      FOREIGN KEY (videoID) REFERENCES video(ID)
    )
  `.execute(db);
}

export async function createFilterIfNotExists(videoID: string) {
  return db.insertInto('filter')
    .values({ videoID })
    .onConflict((oc) => oc.doNothing())
    .execute(); 
}

export async function selectVideo(videoID: string) {
  return db
    .selectFrom('video')
    .selectAll()
    .where('ID', '=', videoID)
    .executeTakeFirst();
}

export async function insertVideo(
  videoID: string,
  artistID: string,
  isMusic: boolean
) {
  return db
    .insertInto('video')
    .values({ ID: videoID, artistID, isMusic: isMusic ? 1 : 0 })
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function insertMusicWatched(musicID: string) {
  return db
    .insertInto('watched')
    .values({ musicID, datetime: new Date().toISOString() })
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function insertGenres(videoID: string, genres: string[]) {
  return db
    .insertInto('video_genre')
    .values(genres.map((genre) => ({
      videoID,
      genre,
    })))
    .onConflict((oc) => oc.doNothing())
    .execute(); 
}

export function fetchTopMusic(limit: number, from: Date, to: Date) {
  return db.selectFrom('watched')
    .select(['musicID', db.fn.count('musicID').as('times')])
    .where('datetime', '>=', from.toISOString())
    .where('datetime', '<=', to.toISOString())
    .where('musicID', 'not in', db.selectFrom('filter').select('videoID'))
    .groupBy('musicID')
    .orderBy('times', 'desc')
    .limit(limit)
    .execute();
}

export function fetchLatestMusic(limit: number) {
  return db.selectFrom('watched')
    .select('musicID')
    .where('musicID', 'not in', db.selectFrom('filter').select('videoID'))
    .orderBy('datetime', 'desc')
    .limit(limit)
    .execute();
}

export function fetchTopArtists(limit: number = 5, from: Date, to: Date) {
  return db.selectFrom('video')
    .select(['artistID', db.fn.count('artistID').as('times')])
    .innerJoin('watched', 'video.ID', 'watched.musicID')
    .where('watched.datetime', '>=', from.toISOString())
    .where('watched.datetime', '<=', to.toISOString())
    .groupBy('artistID')
    .orderBy('times', 'desc')
    .limit(limit)
    .execute();
}

export function fetchTopGenres(limit: number = 5, from: Date, to: Date) {
  return db.selectFrom('video_genre')
    .select(['genre', db.fn.count('genre').as('times')])
    .innerJoin('watched', 'video_genre.videoID', 'watched.musicID')
    .where('watched.datetime', '>=', from.toISOString())
    .where('watched.datetime', '<=', to.toISOString())
    .groupBy('genre')
    .orderBy('times', 'desc')
    .limit(limit)
    .execute();
}

export async function all() {
  const watched = await db.selectFrom('watched').selectAll().execute();
  const video = await db.selectFrom('video').selectAll().execute();
  const filter = await db.selectFrom('filter').selectAll().execute();
  const genres = await db.selectFrom('video_genre').selectAll().execute();
  return { watched, video, filter, genres };
}

function TransformParams(params: any[] = []) {
  return params.map((param) => {
    if (param instanceof Date) {
      return param.toISOString();
    }
    if (typeof param === "boolean") {
      return param ? 1 : 0;
    }
    return param;
  });
}
