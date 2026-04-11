# Flight Booking System

A full-stack flight booking application built with Next.js, Node.js/Express, TypeScript, and MongoDB. This system implements a complete airline booking engine with flight search, selection, traveller details, and booking confirmation.

## Features

✅ **Flight Search**

- Search flights by source/destination with city name autocomplete
- Filter by price range, stops, departure time
- Real-time flight result filtering
- Display detailed flight information

✅ **Flight Selection**

- Select flights with all details (airline, times, price, stops)
- Store selected flight securely
- Navigate to traveller details form

✅ **Traveller Details**

- Collect passenger information (name, email, phone, DOB, gender, passport)
- Form validation with react-hook-form
- Display selected flight summary

✅ **Booking Creation**

- Create booking with locked price
- Store booking in MongoDB
- Generate unique booking ID
- Save complete flight and fare data

✅ **Booking Confirmation**

- Display booking details
- Show confirmation with booking ID
- Print booking option
- Book another flight option

## Tech Stack

### Frontend

- **Framework**: Next.js 16.2.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: react-hook-form
- **HTTP Client**: Axios
- **State Management**: React Hooks + localStorage

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **API**: RESTful JSON
- **Middleware**: CORS, express.json

### Database

- **Provider**: MongoDB Atlas
- **Collections**: SelectedFlights, Bookings
- **Connection**: Mongoose with TypeScript types

## Project Structure

```
flight-booking/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home (redirects to /flights)
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── flights/
│   │   │   │   └── page.tsx        # Flight search & results
│   │   │   ├── traveller/
│   │   │   │   └── page.tsx        # Traveller details form
│   │   │   └── confirmation/
│   │   │       └── page.tsx        # Booking confirmation
│   │   ├── components/
│   │   │   ├── FlightCard.tsx      # Individual flight display
│   │   │   ├── SearchFilters.tsx   # Filter sidebar
│   │   │   └── CitySearch.tsx      # City autocomplete
│   │   ├── services/
│   │   │   └── flightService.ts    # API integration
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css         # Tailwind setup
│   ├── .env.local                  # Environment variables
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── index.ts                # Express app & routes
│   │   ├── routes/
│   │   │   ├── search.ts           # Flight search endpoint
│   │   │   ├── flight.ts           # Flight selection endpoint
│   │   │   └── booking.ts          # Booking creation endpoint
│   │   ├── models/
│   │   │   ├── Booking.ts          # Booking schema
│   │   │   └── SelectedFlight.ts   # Selected flight schema
│   │   ├── utils/
│   │   │   └── flightUtils.ts      # Flight processing & filtering
│   │   └── data/
│   │       └── flights.json        # Flight data source
│   ├── .env                        # Environment variables
│   ├── .env.example                # Environment template
│   └── package.json
│
├── TESTING_GUIDE.md                # Complete testing documentation
└── README.md                       # This file
```

## Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account with cluster
- VS Code or similar editor

### Backend Setup

1. **Navigate to server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3001`

### Frontend Setup

1. **Navigate to client directory**

   ```bash
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Verify environment**
   - `.env.local` should have `NEXT_PUBLIC_API_URL=http://localhost:3001`

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## API Endpoints

### Search Flights

- **POST** `/api/search`
- **Request Body**:
  ```json
  {
    "sourceCity": "DEL",
    "destinationCity": "SHJ",
    "departureDate": "2026-03-02",
    "tripType": "roundtrip",
    "passengers": 2,
    "priceRange": { "min": 1000, "max": 50000 }
  }
  ```
- **Response**: Array of flight objects with all details + metadata

### Select Flight

- **POST** `/api/flight/select`
- **Request Body**:
  ```json
  {
    "searchId": "SEARCH-123456",
    "flightKey": "DEL-DOH-QR-...",
    "fareId": "FARE_FAMILY-ECONOMY-..."
  }
  ```
- **Response**: Confirmation with stored flight data

### Create Booking

- **POST** `/api/booking`
- **Request Body**:
  ```json
  {
    "searchId": "SEARCH-123456",
    "traveller": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "dob": "1990-01-01",
      "gender": "Male",
      "passport": "ABC123456"
    }
  }
  ```
- **Response**: Booking confirmation with ID and locked price

### Get Booking

- **GET** `/api/booking/:bookingId`
- **Response**: Full booking details with flight and fare data

## Data Models

### SelectedFlight

```typescript
{
  searchId: string;
  flightKey: string;
  fareId: string;
  flightData: object; // Full flight JSON
  selectedFareData: object; // Selected fare details
  createdAt: Date;
}
```

### Booking

```typescript
{
  bookingId: string (unique)
  searchId: string
  flightKey: string
  traveller: {
    name: string
    email: string
    phone: string
    dob: string
    gender: string
    passport?: string
  }
  lockedPrice: string
  flightData: object
  fareData: object
  createdAt: Date
}
```

## Key Features Implemented

### 1. City Search Autocomplete

- Type city name or airport code
- Shows matching airports with city name and code
- Keyboard navigation (arrow keys, Enter, Escape)
- Real-time filtering from 20+ airports

### 2. Dynamic Flight Display

- Shows all required flight information
- Airport names and codes
- Route with city names (e.g., "New Delhi → Doha → Sharjah")
- Refundable/Non-refundable badges
- Cabin class information
- Available seats count

### 3. Complete Data Flow

- Search extracts flights from flights.json
- Enriches with airport and airline metadata
- Preserves fareId for accurate pricing
- Locks price at booking time
- Stores all data in MongoDB

### 4. Form Validation

- Email pattern validation
- Phone number digit validation (10 digits required)
- Required fields validation
- Error messages display

### 5. Error Handling

- API error responses
- Network error handling
- Form validation errors
- MongoDB connection errors
- Graceful error messages to users

## Environment Variables

### Server (.env)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flight-booking
PORT=3001
NODE_ENV=development
```

### Client (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running Tests

See `TESTING_GUIDE.md` for comprehensive testing procedures including:

- API endpoint testing
- Frontend flow testing
- Database verification
- Edge cases and error handling
- Performance checks

## Build & Deployment

### Frontend Build

```bash
cd client
npm run build
npm start
```

### Backend Build

```bash
cd server
npm run build
npm start
```

## Known Issues & Limitations

1. **Flight Data**: Currently uses static JSON file. In production, integrate with real airline APIs
2. **Authentication**: No user authentication implemented
3. **Multiple Passengers**: Form handles single traveller. Multi-passenger booking needs enhancement
4. **Search Filters**: Basic filtering by price and stops. Can be enhanced with date range, airline filters
5. **Notifications**: No email confirmation implemented

## Future Enhancements

- [ ] User authentication and login
- [ ] Multiple passenger booking
- [ ] Payment gateway integration
- [ ] Email confirmations
- [ ] Real-time flight data from airlines
- [ ] Seat selection interface
- [ ] Baggage options
- [ ] Travel insurance options
- [ ] Admin dashboard
- [ ] Booking management/cancellation
- [ ] Notifications (SMS/Email)

## Performance Metrics

- Search response: < 2s
- City autocomplete: < 200ms
- Booking creation: < 3s
- Frontend bundle size: Optimized with Turbopack
- Database queries: Indexed for fast lookups

## Security Considerations

- [ ] CORS properly configured (allow specific origins in production)
- [ ] Input validation on both frontend and backend
- [ ] MongoDB connection with authentication
- [ ] Environment variables for sensitive data
- [ ] No sensitive data exposed in responses
- [ ] Production: Enable HTTPS, add rate limiting, add authentication

## Support & Troubleshooting

### MongoDB Connection Issues

- Verify connection string in .env
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### API Not Found (404)

- Verify server is running on port 3001
- Check API_URL in .env.local
- Verify routes are properly mounted

### City Search Not Working

- Check airports metadata is being returned from search endpoint
- Verify localStorage is working
- Check browser console for errors

### Booking Not Saving

- Verify MongoDB connection
- Check traveller data includes all required fields
- Verify fareId is being passed correctly

## License

This project is part of a full-stack developer assignment with zero AI usage tolerance.

---

**Last Updated**: April 11, 2026
**Status**: ✅ Ready for Review
