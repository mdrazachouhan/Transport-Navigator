# My Load 24

A complete transport and logistics mobile application built with **React Native (Expo)** and **Express** backend, similar to Rapido/Porter. It connects customers who need goods transported with drivers who operate vehicles (Auto, Tempo, Truck).

---

## Features

### Customer App
- Phone + OTP login
- Select pickup & delivery locations (Indore region)
- Choose vehicle type (Auto, Tempo, Truck)
- View estimated pricing before booking
- Real-time ride tracking
- OTP-based pickup verification
- Rate drivers after delivery
- Booking history

### Driver App
- Phone + OTP login with vehicle registration
- Go online/offline toggle
- Receive real-time booking requests via Socket.IO
- Accept/reject ride requests
- OTP verification at pickup point
- Mark delivery as complete
- View earnings and trip history

### Admin Panel (Web)
- Dashboard with live statistics
- User management (customers & drivers)
- Driver approval system
- Booking management
- Vehicle pricing editor
- Live driver tracking

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native, Expo SDK 54, TypeScript |
| Navigation | expo-router (file-based routing) |
| Backend | Express 5, Node.js, TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (7-day expiry) + OTP verification |
| Real-time | Socket.IO |
| Admin Panel | Pure HTML/CSS/JS (served from Express) |

---

## Prerequisites

Before running this project on your system, make sure you have:

- **Node.js** v18 or higher (recommended: v22) — [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **Expo CLI** — installed globally (`npm install -g expo-cli`)
- **Expo Go App** — installed on your phone from App Store / Play Store (for mobile testing)
- **MongoDB Atlas Account** — free tier works fine — [Sign up](https://www.mongodb.com/atlas)
- **Git** — [Download](https://git-scm.com/)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nimbleraipur/my-load-24.git
cd my-load-24
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root folder:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secret_key_here
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Click "Connect" > "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `myload24`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myload24?retryWrites=true&w=majority
```

For `SESSION_SECRET`, use any random string (e.g., `myload24secretkey123`).

### 4. Set Up App Mode

The app runs in two modes controlled by an environment variable:

- **Customer App**: `EXPO_PUBLIC_APP_MODE=customer`
- **Driver App**: `EXPO_PUBLIC_APP_MODE=driver`

This is already configured in the npm scripts. By default it runs as the Customer app.

To switch to Driver mode, set the variable before running:
```bash
# Linux/Mac
export EXPO_PUBLIC_APP_MODE=driver

# Windows (PowerShell)
$env:EXPO_PUBLIC_APP_MODE="driver"

# Windows (CMD)
set EXPO_PUBLIC_APP_MODE=driver
```

---

## Running the App

You need to run **two terminals** — one for the backend server and one for the mobile app.

### Terminal 1: Start the Backend Server

```bash
npm run server:dev
```

This starts the Express server on **port 5000**. You should see:
```
Connected to MongoDB Atlas
express server serving on port 5000
```

### Terminal 2: Start the Mobile App (Expo)

```bash
npx expo start
```

This starts the Expo development server. You will see a QR code in the terminal.

**To test on your phone:**
1. Open the **Expo Go** app on your phone
2. Scan the QR code shown in the terminal
3. The app will load on your phone

**To test on web browser:**
- Press `w` in the terminal to open the web version at `http://localhost:8081`

**Important:** Make sure your phone and computer are on the **same WiFi network**.

If testing on a physical device, update the API URL. Open `lib/query-client.ts` and change the domain to your computer's local IP address:
```typescript
// Replace with your computer's IP (find it using ipconfig/ifconfig)
const API_URL = 'http://192.168.x.x:5000';
```

---

## Accessing the Admin Panel

The admin panel is a web dashboard accessible at:

```
http://localhost:5000/admin
```

**Login credentials:**
- Phone: `9999999999`
- Password: `admin123`

---

## Project Structure

```
my-load-24/
├── app/                        # Mobile app screens (expo-router)
│   ├── index.tsx               # Login screen (Phone + OTP)
│   ├── register.tsx            # Profile completion
│   ├── _layout.tsx             # Root layout with providers
│   ├── customer/               # Customer screens
│   │   ├── home.tsx            # Customer dashboard
│   │   ├── new-booking.tsx     # Create new booking
│   │   ├── track-ride.tsx      # Track active ride
│   │   ├── history.tsx         # Booking history
│   │   ├── rate-ride.tsx       # Rate driver
│   │   └── menu.tsx            # Customer menu/profile
│   └── driver/                 # Driver screens
│       ├── dashboard.tsx       # Driver dashboard
│       ├── requests.tsx        # Incoming ride requests
│       ├── active-ride.tsx     # Active ride management
│       └── menu.tsx            # Driver menu/profile
├── server/                     # Backend (Express)
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # All API routes
│   ├── auth.ts                 # JWT auth & middleware
│   ├── models.ts               # Mongoose schemas
│   ├── storage.ts              # Database operations
│   └── templates/              # HTML templates
│       ├── landing-page.html   # Landing page
│       └── admin-panel.html    # Admin dashboard
├── contexts/                   # React contexts
│   ├── AuthContext.tsx          # Authentication state
│   └── BookingContext.tsx       # Booking state
├── lib/                        # Utilities
│   ├── app-config.ts           # App mode configuration
│   └── query-client.ts         # API client setup
├── constants/                  # App constants
│   └── colors.ts               # Color theme
├── assets/                     # Images, fonts, icons
│   └── images/
│       └── logo.png            # App logo
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
└── app.json                    # Expo configuration
```

---

## Vehicle Types & Pricing

| Vehicle | Base Fare | Per KM Charge | Capacity |
|---------|-----------|---------------|----------|
| Auto    | ₹50       | ₹12/km        | 200 kg   |
| Tempo   | ₹150      | ₹18/km        | 1000 kg  |
| Truck   | ₹300      | ₹25/km        | 5000 kg  |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP & login |
| POST | `/api/auth/register` | Complete registration |
| POST | `/api/auth/admin-login` | Admin login |
| GET | `/api/auth/me` | Get current user |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get user's bookings |
| GET | `/api/bookings/pending` | Get pending requests (driver) |
| PUT | `/api/bookings/:id/accept` | Accept booking |
| PUT | `/api/bookings/:id/start` | Start trip (OTP required) |
| PUT | `/api/bookings/:id/complete` | Complete delivery |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |
| PUT | `/api/bookings/:id/rate` | Rate booking |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/approve` | Approve driver |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/bookings` | All bookings |
| GET | `/api/admin/vehicles` | All vehicles |
| PUT | `/api/admin/vehicles/:id` | Update pricing |

---

## How the App Works

### Customer Flow
1. Open Customer App > Login with phone number > Enter OTP
2. Complete profile (name)
3. Select pickup location > Select delivery location
4. Choose vehicle type (Auto/Tempo/Truck)
5. View price estimate > Confirm booking
6. Wait for driver to accept
7. Share OTP with driver at pickup
8. Track ride in real-time
9. Rate driver after delivery

### Driver Flow
1. Open Driver App > Login with phone number > Enter OTP
2. Complete profile (name, vehicle type, vehicle number)
3. Go online from dashboard
4. Receive booking requests in real-time
5. Accept a request > Navigate to pickup location
6. Enter customer's OTP to start trip
7. Complete delivery > Earn money

---

## Development Notes

- **OTP is mock**: In development mode, OTP is returned in the API response so you don't need SMS service
- **Locations are mock**: 10 predefined Indore city locations are used
- **Drivers auto-approved**: New drivers are automatically approved
- **Admin auto-created**: Default admin user is created on first server start

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to MongoDB` | Check your `MONGODB_URI` in `.env`. Make sure your IP is whitelisted in MongoDB Atlas (Network Access > Add IP > Allow Access from Anywhere). |
| `Expo app can't reach backend` | Make sure both devices are on same WiFi. Use your computer's local IP instead of `localhost` in the API URL. |
| `OTP not received` | OTP is shown in the API response and server console (dev mode). No real SMS is sent. |
| `Module not found` | Run `npm install` again. |
| `Port 5000 already in use` | Kill the process using port 5000: `npx kill-port 5000` |
| `Expo Go version mismatch` | Update Expo Go app from App Store / Play Store. |

---

## License

This project is for educational and personal use.

---

## Contact

Built with care for the logistics industry. For questions or feedback, open an issue on GitHub.
