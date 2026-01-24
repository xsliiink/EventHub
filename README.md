![CI Status](https://github.com/xsliiink/Social-Project/actions/workflows/tests.yml/badge.svg)

# 🧩 EventHub — Social Event Platform

**EventHub** is a full-stack web application for discovering, creating, and filtering events by hobbies and location.  
Users can create their own events, attach images, select hobbies, and browse official events nearby.

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- **React + TypeScript**
- **Vite** — fast build & hot reload
- **TailwindCSS** — modern styling
- **shadcn/ui + Lucide icons** — prebuilt UI components
- **Framer Motion** — smooth animations
- **React Router** — client-side routing
- **React Hook Form** — form management
- **JWT** — authentication
- **Fetch API** — communication with backend

### 🧩 Backend
- **Node.js + Express** — backend logic
- **Jest + Supertest** — automated integration testing
- **Multer** — image uploads (events & avatars)
- **SQLite3** — lightweight database
- **bcrypt** — password hashing
- **jsonwebtoken (JWT)** — user authorization
- **CORS + dotenv** — environment configuration

---
###Recent Updates
## 🏗 Architecture & Design Patterns
* **Modular Routing:** Migrated from a monolithic `app.ts` to a decoupled **Routes & Middlewares** architecture. This ensures high maintainability and scalability.
* **Asynchronous Integrity:** Optimized database interactions by replacing legacy callbacks with modern `async/await` patterns, eliminating potential race conditions in SQLite.
* **Strict Type Safety:** * Achieved **0% `any` usage** across the backend.
    * Implemented robust interface definitions and unknown-type narrowing for error handling.

## 🛡 Code Quality & DX (Developer Experience)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) 
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

* **Linting & Formatting:** Integrated **ESLint** and **Prettier** to enforce consistent coding standards and catch bugs before they reach production.
* **Standardized API Contracts:** Unified field naming (e.g., `eventImage`) across the stack to ensure seamless Frontend-Backend communication.

## 📦 Media Handling
* **Typed Multer Middleware:** Refactored file upload logic into a dedicated middleware with strict validation, ensuring secure and predictable image processing.

---

## 🗃️ Database Structure

| Table | Description |
|--------|--------------|
| `users` | User information |
| `hobbies` | List of all hobbies |
| `events` | Main event data |
| `event_hobbies` | Many-to-many relation between events and hobbies |
| `user_hobbies` | User-hobby relations |
| `friends` | Friend requests and connections |

---

## 🚀 Features

✅ User registration and JWT authentication  
✅ Create events with image upload  
✅ Attach multiple hobbies per event  
✅ Filter events by location and hobbies  
✅ Browse official & community events  
✅ Adaptive event cards grid layout  
✅ Component-based architecture (`EventCard`, `Home`, `EventModal`, etc.)  
✅ Smooth page routing (Home, Profile, Friends)

## 🧪 Testing

The project is covered by automated integration tests to ensure API stability and correct data flow.

- **Tools:** Jest, Supertest
- **Coverage:** Auth (Register/Login), Event management, Hobby associations.
- **Data Safety:** Uses a separate test database and sequential execution (`--runInBand`).

Run backend tests:
```bash
cd server && npx jest --runInBand
```
---

## 🧠 Project Architecture

```text
📁 Project Structure
├── 📱 client (Frontend)
│   ├── src
│   │   ├── components   # Reusable UI components
│   │   ├── pages        # App views (Home, Profile, etc.)
│   │   └── App.tsx      # Main logic & routing
│   └── vite.config.ts
├── ⚙️ server (Backend)
│   ├── app.ts           # Express & API logic
│   ├── db.ts            # SQLite connection
│   ├── middleware       # JWT & Auth logic
│   ├── tests            # Jest integration tests
│   └── uploads          # User images (Avatars/Events)
├── 🖼️ screenshots       # UI previews
└── 📄 package.json
```
---

## 🖼️ UI & UX

- Clean and modern interface  
- Event cards with images, location, date, and hobbies  
- Smooth transitions and animations  
- Mobile responsive design  

**Example UI:**
| Home Page | Event Details |
|------------|----------------|
| ![Home Page](./screenshots/3main.png) | ![Add Event](./screenshots/3add_event.png) |

---

## 💾 How to Run Locally

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Run backend and frontend
cd server && npm start
cd ../client && npm run dev
App will be available at:
📍 Frontend → http://localhost:5173
📍 Backend → http://localhost:3007

cd ../frontend && npm run dev
App will be available at:
📍 Frontend → http://localhost:5173
📍 Backend → http://localhost:5000
