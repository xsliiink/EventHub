import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database.db");

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
    const hobbies = ["Football", "Reading", "Gaming", "Music", "Traveling", "Coding"];
    const stmt = db.prepare("INSERT OR IGNORE INTO hobbies (name) VALUES (?)");
    hobbies.forEach((h) => stmt.run(h));
    stmt.finalize();
});
