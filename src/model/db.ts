import { DB, RowObject } from "https://deno.land/x/sqlite@v3.8/mod.ts";
console.log(Deno.env.get("DB_PATH"));
const db = new DB(Deno.env.get("DB_PATH") || "./db.sqlite");
initializeDB();

function initializeDB() {
  db.execute(`
  CREATE TABLE IF NOT EXISTS watched (
    musicID TEXT,
    datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (musicID) REFERENCES video(ID),
    PRIMARY KEY (datetime)
  );
  CREATE TABLE IF NOT EXISTS video (
    ID TEXT,
    artistID TEXT,
    isMusic BOOLEAN,
    PRIMARY KEY (ID)
  );
  CREATE TABLE IF NOT EXISTS filter (
    videoID TEXT,
    PRIMARY KEY (videoID)
  );
`);
}

interface IVideo extends RowObject {
  ID: string;
  artistID: string;
  isMusic: boolean;
}
interface IWatched extends RowObject {
  musicID: string;
  datetime: string;
}
interface IFilter extends RowObject {
  videoID: string;
}

export function createFilterIfNotExists(videoID: string) {
  NonQuery(
    `INSERT INTO filter (videoID)
    SELECT ?
    WHERE NOT EXISTS (SELECT 1 FROM filter WHERE videoID = ?)`,
    [videoID, videoID]
  );
}

export function selectVideo(videoID: string) {
  return Single<IVideo>(`SELECT * FROM video WHERE ID = ?`, [videoID]);
}

export function insertVideo(
  videoID: string,
  artistID: string,
  isMusic: boolean
) {
  return db.query(
    `INSERT INTO video (ID, artistID, isMusic)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM video WHERE ID = ?)`,
    [videoID, artistID, isMusic, videoID]
  );
}

export function insertMusicWatched(musicID: string) {
  return db.query(`INSERT INTO watched (musicID) VALUES (?)`, [musicID]);
}

export function fetchTopMusic(limit: number, from: Date, to: Date) {
  return Query<{ musicID: string; times: number }>(
    ` SELECT musicID,
        Count(musicID) as times
      FROM   (SELECT musicID
        FROM   watched
        WHERE  datetime >= ?
               AND datetime <= ?
               AND musicID NOT IN (SELECT videoID FROM filter))
      GROUP  BY musicID
      ORDER  BY Count(musicID) DESC
      LIMIT  ?`,
    [to.toISOString(), from.toISOString(), limit]
  );
}

export function fetchLatestMusic(limit: number) {
  return Query<{ musicID: string }>(
    ` SELECT musicID
      FROM   watched
        WHERE musicID NOT IN (SELECT videoID FROM filter)
      ORDER  BY datetime DESC
      LIMIT  ?`,
    [limit]
  );
}

export function fetchTopArtists(limit: number = 5, from: Date, to: Date) {
  return Query<{ artistID: string; times: number }>(
    ` SELECT artistID,
        Count(artistID) as times
      FROM   (SELECT artistID
        FROM   video
        JOIN watched ON video.ID = watched.musicID
        WHERE  datetime >= ?
               AND datetime <= ?)
      GROUP  BY artistID
      ORDER  BY Count(artistID) DESC
      LIMIT  ?`,
    [to.toISOString(), from.toISOString(), limit]
  );
}

export function all() {
  const watched = Query<IWatched>(`SELECT * FROM watched`);
  const video = Query<IWatched>(`SELECT * FROM video`);
  const filter = Query<IWatched>(`SELECT * FROM filter`);
  return { watched, video, filter };
}

function Query<T extends RowObject>(query: string, args: any[] = []) {
  return db.queryEntries<T>(query, args) as T[];
}

function Single<T extends RowObject>(query: string, args: any[] = []) {
  return Query<T>(query, args)[0];
}

function NonQuery(query: string, args: any[] = []) {
  db.query(query, args);
}
