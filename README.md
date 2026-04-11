# Flight Booking System

A full-stack flight booking app

## Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js + Express, TypeScript
- **Database**: MongoDB (Mongoose)

## Features

- Flights search page (/flights)
- Select and save flights
- Book Selected Flights (/traveller)
- Confirmation page (/confirmation)

```
flight-booking/
├── client/          # Next.js frontend
│   └── src/
│       ├── app/     # pages: /flights, /traveller, /confirmation, ...
│       ├── components/
│       ├── services/
│       └── types/
│
└── server/          # Express backend
    └── src/
        ├── routes/  # search, flight, booking
        ├── models/  # Booking, SelectedFlight
        └── data/    # flights.json (static data source)
```

## Getting Started

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## API Endpoints

| POST | `/api/search` | Search flights by route, date, passengers |
| POST | `/api/flight/select` | Store selected flight |
| GET | `/api/flight/selected` | Get all selected flights |
| POST | `/api/booking` | Create booking with traveller details |
| GET | `/api/booking` | Get all bookings |
| GET | `/api/search/airports` | Get all airports |

## Environment Variables

**Server** (`server/.env`):

```
MONGODB_URI=mongodb+srv://...
PORT=3001
NODE_ENV=development
```

**Client** (`client/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```
