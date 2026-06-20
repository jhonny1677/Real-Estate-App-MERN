# 🏠 EstateHub

[![CI](https://github.com/jhonny1677/Real-Estate-App-MERN/actions/workflows/ci.yml/badge.svg)](https://github.com/jhonny1677/Real-Estate-App-MERN/actions/workflows/ci.yml)

A full stack real estate web app where you can search properties, chat with agents, and explore neighborhoods.

---

## Features

- Search and filter properties by location and price
- View property details with photos and a map
- See nearby schools, hospitals, and shops with walking distances
- Chat with agents in real time
- Save favorite properties
- Schedule property visits
- Mortgage calculator
- Weather at the property location
- Dark and light mode
- Multiple currencies and languages

---

## Tech Stack

| Part | What it uses |
|---|---|
| Frontend | React, Vite, React Router, SCSS |
| Backend | Node.js, Express |
| Database | MongoDB, Prisma |
| Real-time chat | Socket.io |
| Maps | Leaflet, React Leaflet |
| Auth | JWT, Clerk (optional) |
| Payments | Stripe |
| Testing | Jest (API), Vitest (client), Cypress (E2E) |
| Containers | Docker, Docker Compose |
| CI | GitHub Actions |

---

## How to run

### With Docker

Make sure Docker is running, then from the project root:

```bash
docker compose up --build
```

The client will be at http://localhost:80 and the API at http://localhost:8800.

### Manually

You need Node 18 or later and a MongoDB instance running locally.

**Start the API** (port 8800):

```bash
cd api
cp .env.example .env
# edit .env and fill in your values
npm install
npm run dev
```

**Start the client** (port 5174):

```bash
cd client
cp .env.example .env
# edit .env and fill in your values
npm install
npm run dev
```

The socket server is optional for local development. If you want real-time chat, run it too:

```bash
cd socket
npm install
npm start
```

---

## Environment variables

**`api/.env`**

```
DATABASE_URL=mongodb://localhost:27017/real-estate
JWT_SECRET_KEY=change_this_to_something_long_and_random
CLIENT_URL=http://localhost:5174

# Email — used for account verification and password reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=you@gmail.com

# Only needed if you want payments or Clerk auth
STRIPE_SECRET_KEY=sk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**`client/.env`**

```
VITE_API_URL=http://localhost:8800
VITE_SOCKET_URL=http://localhost:4000

# Only needed if you want Clerk auth or weather
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_WEATHER_API_KEY=your_key
VITE_OPENWEATHER_API_KEY=your_key
```

---

## Running the tests

**API tests** (Jest):

```bash
cd api
npm test
```

**Client unit tests** (Vitest):

```bash
cd client
npm test
```

**End-to-end tests** (Cypress) — the client dev server needs to be running first:

```bash
cd client
npm run cy:run
```

---

## Screenshots

### Home Page
![Home Page](screenshots/Screenshot%202026-06-19%20195345.png)

### Property Listings
![Property Listings](screenshots/Screenshot%202026-06-19%20195822.png)

### Property Detail — Overview
![Property Detail](screenshots/Screenshot%202026-06-19%20195910.png)

### Property Detail — Info & Policies
![Property Overview Tab](screenshots/Screenshot%202026-06-19%20200014.png)

### Features & Amenities
![Features and Amenities](screenshots/Screenshot%202026-06-19%20200048.png)

### Mortgage Calculator
![Mortgage Calculator](screenshots/Screenshot%202026-06-19%20200129.png)

### Weather at Property Location
![Weather](screenshots/Screenshot%202026-06-19%20200208.png)

### Nearby Places Map
![Nearby Places](screenshots/Screenshot%202026-06-19%20200254.png)

### Recently Viewed
![Recently Viewed](screenshots/Screenshot%202026-06-19%20195515.png)

### Notifications Center
![Notifications](screenshots/Screenshot%202026-06-19%20195644.png)

### Real-time Chat
![Chat](screenshots/Screenshot%202026-06-19%20201333.png)

### Add New Listing
![Add Listing](screenshots/Screenshot%202026-06-19%20201040.png)
![Add Listing Form](screenshots/Screenshot%202026-06-19%20201134.png)

### Login Page
![Login](screenshots/Screenshot%202026-06-19%20200353.png)
