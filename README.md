# 🏨 Drifthaus — Hotel Booking System

> A full-stack hotel listings and booking web app built as a major project.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-6c63ff?style=for-the-badge&logo=render)](https://drifthaus-hotel-booking-system.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Aayush-Karthikeyan/drifthaus-hotel-booking-system)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)

---

## 🌐 Live Site

**[https://drifthaus-hotel-booking-system.onrender.com](https://drifthaus-hotel-booking-system.onrender.com)**

> ⚠️ Hosted on Render's free tier — may take 30–60 seconds to wake up on first visit.

---

## ✨ Features

### 🏠 Listings
- Browse hotel listings with interactive **Leaflet maps**
- 🔍 **Search** by title, location, or country
- 🏷️ **Filter by category** — Trending, Rooms, Mountains, Castles, Boats, Domes & more
- 📸 **Image upload** via Cloudinary
- ➕ Create, edit, and delete your own listings
- ⭐ **Reviews & star ratings** on every listing

### 📅 Booking System
- Date picker with **live price calculator** — shows nights × price + total instantly
- **Book Now** — saves booking instantly and redirects to My Bookings
- 📧 **Confirmation email** sent automatically with full booking details
- 📋 **My Bookings** page — Upcoming / Active / Completed badges
- ❌ Cancel upcoming bookings before check-in
- 🔥 **Booking count** shown on every listing card
- 🚫 **Double booking prevention** — red warning shown instantly for conflicting dates, blocked on server too

### 🔐 Authentication
- Secure signup / login with **Passport.js** (Local Strategy)
- Session management with **MongoDB-backed sessions**
- Owner-only edit/delete controls on listings

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas, Mongoose |
| **Templating** | EJS, EJS-Mate |
| **Authentication** | Passport.js, passport-local-mongoose |
| **Image Storage** | Cloudinary, Multer |
| **Maps** | Leaflet.js + OpenStreetMap (Nominatim geocoding) |
| **Email** | Brevo HTTP API |
| **Session Store** | connect-mongo |
| **Validation** | Joi |
| **Hosting** | Render |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v22+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Brevo account (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/Aayush-Karthikeyan/drifthaus-hotel-booking-system.git
cd drifthaus-hotel-booking-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
ATLAS_URL=your_mongodb_atlas_connection_string
SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

BREVO_LOGIN=your_brevo_smtp_login
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_API_KEY=your_brevo_api_key

SITE_URL=http://localhost:8080
```

### 4. Seed the database (optional)

```bash
npm run seed
```

### 5. Run the development server

```bash
npm run dev
```

Visit **[http://localhost:8080](http://localhost:8080)**

---

## 📁 Project Structure

```
drifthaus-hotel-booking-system/
├── app.js                  # Entry point
├── middleware.js            # Auth & validation middleware
├── schema.js               # Joi validation schemas
├── cloudConfig.js          # Cloudinary config
│
├── models/
│   ├── listing.js          # Listing schema
│   ├── review.js           # Review schema
│   ├── user.js             # User schema
│   └── booking.js          # Booking schema
│
├── controllers/
│   ├── listings.js         # Listing logic
│   ├── reviews.js          # Review logic
│   ├── users.js            # Auth logic
│   └── bookings.js         # Booking logic
│
├── routes/
│   ├── listing.js          # Listing routes
│   ├── review.js           # Review routes
│   ├── user.js             # Auth routes
│   └── booking.js          # Booking routes
│
├── views/
│   ├── layouts/            # EJS boilerplate layout
│   ├── includes/           # Navbar, footer, flash messages
│   ├── listings/           # Listing pages (index, show, new, edit)
│   ├── users/              # Signup & login pages
│   └── bookings/           # My Bookings page
│
├── public/
│   ├── css/                # Stylesheets
│   └── js/                 # Client-side JS (map, filters)
│
├── utils/
│   ├── ExpressError.js     # Custom error class
│   ├── wrapAsync.js        # Async error wrapper
│   └── mailer.js           # Brevo email utility
│
└── init/
    └── index.js            # Database seeder
```

---

## 📧 How the Booking System Works

1. User opens any listing's show page
2. Picks **check-in** and **check-out** dates — total price updates live
3. Clicks **Book Now** — booking saved to MongoDB instantly
4. **Confirmation email** sent via Brevo API with listing photo, dates, and total
5. Redirected to **My Bookings** page
6. Upcoming bookings can be **cancelled** at any time before check-in

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `ATLASDB_URL` | MongoDB Atlas connection string |
| `SECRET` | Session secret key |
| `CLOUD_NAME` | Cloudinary cloud name |
| `CLOUD_API_KEY` | Cloudinary API key |
| `CLOUD_API_SECRET` | Cloudinary API secret |
| `BREVO_LOGIN` | Brevo SMTP login email |
| `BREVO_SMTP_KEY` | Brevo SMTP key |
| `BREVO_API_KEY` | Brevo API key |
| `SITE_URL` | Your live site URL |
| `NODE_ENV` | Set to `production` on Render |

---

## 👨‍💻 Author

**Aayush Karthikeyan**  
Built as a Major Project — full-stack web development with Node.js, Express, and MongoDB.

---

## 📄 License

This project is for educational purposes.
