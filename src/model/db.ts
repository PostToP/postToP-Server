import Database from "better-sqlite3";
console.log(process.env.DB_PATH);
const db = new Database(process.env.DB_PATH || "./db.sqlite");
db.pragma("journal_mode = WAL");

initializeDB();
function initializeDB() {
  db.exec(`
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
  CREATE TABLE IF NOT EXISTS video_genre (
    videoID TEXT,
    genre TEXT,
    PRIMARY KEY (videoID, genre),
    FOREIGN KEY (videoID) REFERENCES video(ID)
  );
`);
}

export interface IVideo {
  ID: string;
  artistID: string;
  isMusic: boolean;
}
interface IWatched {
  musicID: string;
  datetime: string;
}
interface IFilter {
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
  return NonQuery(
    `INSERT INTO video (ID, artistID, isMusic)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM video WHERE ID = ?)`,
    [videoID, artistID, isMusic, videoID]
  );
}

export function insertMusicWatched(musicID: string) {
  return NonQuery(`INSERT INTO watched (musicID) VALUES (?)`, [musicID]);
}

export function insertGenres(videoID: string, genres: string[]) {
  const values = genres.map((genre) => `('${videoID}', '${genre}')`).join(", ");
  return NonQuery(
    `INSERT INTO video_genre (videoID, genre)
    SELECT * FROM (VALUES ${values})
    WHERE NOT EXISTS (SELECT 1 FROM video_genre WHERE videoID = ? AND genre IN (${genres
      .map(() => "?")
      .join(", ")}))`,
    [videoID, ...genres]
  );
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

export function fetchTopGenres(limit: number = 5, from: Date, to: Date) {
  return Query<{ genre: string; times: number }>(
    ` SELECT genre,
        Count(genre) as times
      FROM   (SELECT genre
        FROM   video_genre
        JOIN watched ON video_genre.videoID = watched.musicID
        WHERE  datetime >= ?
               AND datetime <= ?)
      GROUP  BY genre
      ORDER  BY Count(genre) DESC
      LIMIT  ?`,
    [to.toISOString(), from.toISOString(), limit]
  );
}

export function all() {
  const watched = Query<IWatched>(`SELECT * FROM watched`);
  const video = Query<IWatched>(`SELECT * FROM video`);
  const filter = Query<IWatched>(`SELECT * FROM filter`);
  const genres = Query<IWatched>(`SELECT * FROM video_genre`);
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

function Query<T>(query: string, args: any[] = []) {
  return db.prepare(query).all(...TransformParams(args)) as T[];
}

function Single<T>(query: string, args: any[] = []) {
  return db.prepare(query).get(...TransformParams(args)) as T;
}

function NonQuery(query: string, args: any[] = []) {
  return db.prepare(query).run(...TransformParams(args));
}
