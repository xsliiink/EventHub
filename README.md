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
- **Multer** — image uploads (events & avatars)
- **SQLite3** — lightweight database
- **bcrypt** — password hashing
- **jsonwebtoken (JWT)** — user authorization
- **CORS + dotenv** — environment configuration

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

---

## 🧠 Project Architecture

project/
├── backend/
│ ├── server.js # Express entry point
│ ├── db.js # SQLite initialization
│ ├── routes/ # API routes
│ ├── middleware/ # JWT / Multer middlewares
│ └── uploads/ # Stored images
│
└── frontend/
├── src/
│ ├── components/ # UI components (EventCard, Navbar, etc.)
│ ├── pages/ # Pages (Home, Profile, Login, Register)
│ ├── hooks/ # Custom hooks
│ ├── assets/ # Icons, styles
│ └── App.tsx
└── package.json

yaml
Copy code

---

## 🖼️ UI & UX

- Clean and modern interface  
- Event cards with images, location, date, and hobbies  
- Smooth transitions and animations  
- Mobile responsive design  

**Example UI:**
| Home Page | Event Details |
|------------|----------------|
| ![Home Page](./screenshots/home.png) | ![Event Details](./screenshots/event-details.png) |

---

## 💾 How to Run Locally

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Run backend and frontend
cd backend && npm start
cd ../frontend && npm run dev
App will be available at:
📍 Frontend → http://localhost:5173
📍 Backend → http://localhost:5000
