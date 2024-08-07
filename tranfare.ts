import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const db = new DB("./db.sqlite");

const all = db.query("SELECT * FROM watched");
const db2 = new DB("./db2.sqlite");
db2.execute(`
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
for (const a of all) {
  console.log(a);
  db2.query(
    `INSERT INTO video (ID, artistID, isMusic)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM video WHERE ID = ?)`,
    [a[0] as string, a[1] as string, true, a[0] as string]
  );
  db2.query("INSERT INTO watched (musicID, datetime) VALUES (?, ?)", [
    a[0] as string,
    a[2] as string,
  ]);
}
