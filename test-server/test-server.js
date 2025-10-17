import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к базе, которая уже есть
const dbPath = path.join(__dirname, "..", "server", "database.db");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("❌ Ошибка открытия базы:", err.message);
  } else {
    console.log("✅ База открыта успешно:", dbPath);
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// Проверим таблицы
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) console.error("❌ Ошибка запроса таблиц:", err.message);
  else console.log("Таблицы в базе:", tables.map(t => t.name));
});

// Попробуем достать данные из users
db.all("SELECT * FROM users", [], (err, users) => {
  if (err) console.error("❌ Ошибка выборки пользователей:", err.message);
  else console.log("Пользователи:", users);
});

// Попробуем достать данные из hobbies
db.all("SELECT * FROM hobbies", [], (err, hobbies) => {
  if (err) console.error("❌ Ошибка выборки хобби:", err.message);
  else console.log("Хобби:", hobbies.map(h => h.name));
});

const PORT = 3007;
app.listen(PORT, () => {
    console.log(`Тестовый сервер запущен на порту ${PORT}`);
});