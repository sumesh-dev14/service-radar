# Service Radar Backend - Setup & Testing Guide

## Overview

This is a fully functional backend API for the Service Radar application. It provides:
- User authentication (register/login)
- Provider profiles and search
- Booking management
- Review system
- Advanced ranking engine using Skip Lists

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v14+)
- MongoDB instance (cloud or local)
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd service-radar/backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already configured in the repository:

```env
MONGO_URI=mongodb+srv://blackgray1425_db_user:UeBiieNAwsjf3eOu@cluster0.6lhupcq.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=fRfkgUKzHwqUBwVbtmYyGgfgCRWxqrdIcvdkoGOMTaKnfFrVCpWyhrnRxJx
JWT_EXPIRES_IN=7d
```

**To use your own MongoDB:**
1. Update `MONGO_URI` with your MongoDB connection string
2. Generate a secure JWT_SECRET (or keep the existing one)

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode (compiled):**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Health Check

Verify the server is running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "db": "connected"
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/             # Database configuration
│   ├── controllers/        # Route handlers
│   ├── engine/             # Ranking engine (Skip List)
│   ├── middleware/         # Auth & role middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── types/              # TypeScript types
│   ├── utils/              # Utilities (scoring, distance)
│   ├── index.ts            # Express app setup
│   └── test-ranking.ts     # Ranking engine test
├── .env                    # Environment variables
├── package.json
└── tsconfig.json
```

## Key Features

### 1. Authentication
- User registration with email validation
- JWT-based login
- Role-based access control (customer/provider)
- Secure password hashing with bcryptjs

### 2. Provider Management
- Create and update provider profiles
- Toggle availability
- Location-based service (latitude/longitude)
- Pricing management

### 3. Booking System
- Customers can book services
- Providers can accept/reject bookings
- Booking lifecycle: pending → accepted → completed → reviewable
- Support for cancellations

### 4. Reviews & Ratings
- Customers review completed bookings
- Automatic rating aggregation
- 1-5 star rating system

### 5. Advanced Ranking Engine
- Skip List data structure for O(log n) operations
- Score calculation based on: rating, price, distance
- Formula: `(rating × 40) - (price × 0.5) - (distance × 2)`
- Real-time ranking updates

## Database Models

### User
- name, email, password (hashed), role (customer/provider)

### ProviderProfile
- userId, categoryId, bio, price, rating, totalReviews
- isAvailable, location (lat/lng)

### Booking
- customerId, providerId, categoryId, status, scheduledDate
- Status: pending, accepted, completed, cancelled

### Review
- bookingId, customerId, providerId, rating, comment
- Auto-updates provider rating on creation

### Category
- name, description

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - List all categories

### Providers
- `POST /api/providers/profile` - Create provider profile
- `PUT /api/providers/profile` - Update profile
- `PATCH /api/providers/availability` - Toggle availability
- `GET /api/providers` - Search providers by category + location
- `GET /api/providers/:id` - Get provider details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/me` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/accept` - Accept booking (provider)
- `PATCH /api/bookings/:id/cancel` - Cancel booking (customer)
- `PATCH /api/bookings/:id/complete` - Complete booking (provider)

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/provider/:id` - Get provider reviews

## Testing the Backend

### Using Postman

See **POSTMAN_API_GUIDE.md** for detailed testing instructions with curl examples and expected responses.

### Quick Test Workflow

1. **Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register User:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "SecurePass123",
       "role": "customer"
     }'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "SecurePass123"
     }'
   ```

4. **Save the token from response and use in subsequent requests**

### Test Ranking Engine

```bash
npm run dev  # In one terminal
# In another terminal:
npx ts-node src/test-ranking.ts
```

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request** - Missing/invalid fields
```json
{ "message": "Missing required fields" }
```

**401 Unauthorized** - Missing or invalid token
```json
{ "message": "Unauthorized" }
```

**403 Forbidden** - Insufficient permissions
```json
{ "message": "Forbidden: Insufficient permissions" }
```

**404 Not Found** - Resource doesn't exist
```json
{ "message": "Provider not found" }
```

**409 Conflict** - Resource already exists
```json
{ "message": "User already exists" }
```

**500 Server Error** - Unexpected error
```json
{ "message": "Failed to create booking" }
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost` (any port)
- `http://127.0.0.1` (any port)
- Postman and curl requests (no origin)

For production, update the `allowedOrigins` in `src/index.ts`

## Authentication Flow

1. **Register** → Get JWT token
2. **Save token** → Use in Authorization header
3. **Send requests** → Include `Authorization: Bearer {token}`

Token expires in 7 days (configurable via `JWT_EXPIRES_IN`)

## Ranking Algorithm

The ranking engine uses a **Skip List** data structure:

- **Time Complexity**: O(log n) average case
- **Data Structure**: Probabilistic linked list
- **Purpose**: Efficiently get top K providers

Score formula:
```
Score = (Rating × 40) - (Price × 0.5) - (Distance × 2)
```

Example scores:
- Provider A: rating 5, price $100 → score = 5×40 - 100×0.5 = 150
- Provider B: rating 4, price $50 → score = 4×40 - 50×0.5 = 135

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: 
- Check MONGO_URI in .env
- Ensure MongoDB instance is running
- Verify network access if using MongoDB Atlas

### Issue: Port 5000 Already in Use
**Solution**:
```bash
# Change PORT in .env to another port (e.g., 5001)
PORT=5001
npm run dev
```

### Issue: CORS Error in Postman
**Solution**: This shouldn't happen - backend allows all Postman requests. Check if server is running.

### Issue: Token Expired
**Solution**: Re-login to get a new token. Token expires in 7 days.

### Issue: Provider Not Appearing in Search
**Solution**:
- Ensure provider profile exists
- Check `isAvailable` is true
- Verify category ID matches

## Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **TypeScript auto-compiles** (with ts-node-dev)
3. **Server auto-reloads** when files change
4. **Test endpoints** in Postman or curl

## Type Safety

The project uses TypeScript for full type safety:

```bash
# Check for type errors
npm run type-check
```

## Building for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Output directory: dist/

# Run production build
npm start
```

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Express server port | `5000` |
| `JWT_SECRET` | Token signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` (7 days) |

## Security Considerations

1. **Passwords**: Hashed with bcryptjs (salt rounds: 10)
2. **Tokens**: Signed with JWT_SECRET, expires after 7 days
3. **Authorization**: Role-based access control (middleware)
4. **Input Validation**: All endpoint inputs are validated
5. **MongoDB**: Data validated and sanitized before storage

## Next Steps

1. ✅ **Backend is ready** - All endpoints functional
2. **Frontend Development**: Build React/Vue frontend
3. **Connect to Backend**: Use endpoints from POSTMAN_API_GUIDE.md
4. **Environment Variables**: Update API base URL in frontend

## Support & Testing

For detailed Postman testing instructions, see:
- **POSTMAN_API_GUIDE.md** - Complete API reference with examples
- **POSTMAN_REVIEW_TESTING_GUIDE.md** - Specific review system testing

## Removed Components

- ❌ Frontend connections removed from backend
- ❌ Frontend tokens/localStorage references cleaned
- ✅ Backend is pure API - ready for any frontend framework
