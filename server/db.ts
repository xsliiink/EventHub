import sqlite3 from "sqlite3";
import path from "path";

const isTest = process.env.NODE_ENV ==='test'

const dbPath = isTest 
    ? path.resolve(__dirname, '../test_database.db') 
    : path.resolve(__dirname, '../database.db');

const db: sqlite3.Database = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error', err.message);
    else console.log(`Connected to SQLite database: ${dbPath}`);
});

const initDb = () => {
    db.serialize(() => {
    // 1. Создаём таблицы
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT NOT NULL,
            bio TEXT,
            avatar TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS hobbies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS user_hobbies (
            user_id INTEGER,
            hobby_id INTEGER,
            PRIMARY KEY(user_id, hobby_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            creator_id INTEGER,
            official INTEGER DEFAULT 0,
            date TEXT,
            image TEXT,
            location TEXT,
            FOREIGN KEY (creator_id) REFERENCES users(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS event_hobbies (
            event_id INTEGER,
            hobby_id INTEGER,
            PRIMARY KEY (event_id,hobby_id),
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY(hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
        )
    `)

    // 2. Вставляем начальные хобби
    const hobbies : string[] = ["Football", "Reading", "Gaming", "Music", "Traveling", "Coding"];
    const stmt: sqlite3.Statement = db.prepare("INSERT OR IGNORE INTO hobbies (name) VALUES (?)");
    hobbies.forEach((h : string) => stmt.run(h));
    stmt.finalize();
    });
};

initDb();

export default db;

export const dbGet = <T = unknown>(sql: string, params: unknown[] = []) =>
    new Promise<T | undefined>((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T);
        });
    });

export const dbRun = (sql: string, params: unknown[] = []) =>
    new Promise<sqlite3.RunResult>((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

export const dbAll = <T = unknown>(sql: string, params: unknown[] = []) =>
    new Promise<T[]>((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });


export const dbExec = (sql: string) =>
    new Promise<void>((resolve, reject) => {
        db.exec(sql, err => {
            if (err) reject(err);
            else resolve();
        });
    });
