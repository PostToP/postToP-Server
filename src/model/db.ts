import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const db = new DB(Deno.env.get("DB_PATH") || "./db.sqlite");
initializeDB();

function initializeDB() {
  db.execute(`
  CREATE TABLE IF NOT EXISTS watched (
    musicID TEXT,
    artistID TEXT,
    datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (musicID, datetime)
  )
`);
}

export function insertMusic(musicID: string, artistID: string) {
  return db.query(`INSERT INTO watched (musicID,artistID) VALUES (?, ?)`, [
    musicID,
    artistID,
  ]);
}

export function fetchdb() {
  return db.query(`SELECT * FROM watched`);
}

export function fetchTopMusic(limit: number = 5, from: Date, to: Date) {
  return db.query(
    ` SELECT musicID,
        Count(musicID)
      FROM   (SELECT musicID
        FROM   watched
        WHERE  datetime >= ?
               AND datetime <= ?)
      GROUP  BY musicID
      ORDER  BY Count(musicID) DESC
      LIMIT  ?`,
    [to.toISOString(), from.toISOString(), limit]
  );
}

export function fetchLatestMusic(limit: number = 5, from: Date, to: Date) {
  return db.query(
    ` SELECT musicID,
      FROM   watched
        WHERE  datetime >= ?
               AND datetime < ?
      ORDER  BY datetime DESC
      LIMIT  ?`,
    [to.toISOString(), from.toISOString(), limit]
  );
}

export function fetchTopArtists(limit: number = 5, from: Date, to: Date) {
  return db.query(
    ` SELECT artistID,
        Count(artistID)
      FROM   (SELECT artistID
        FROM   watched
        WHERE  datetime >= ?
               AND datetime <= ?)
      GROUP  BY artistID
      ORDER  BY Count(artistID) DESC
      LIMIT  ?`,
    [to.toISOString(), from.toISOString(), limit]
  );
}
