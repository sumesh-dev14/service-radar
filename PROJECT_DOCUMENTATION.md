# Service Radar - Complete Project Documentation

**Last Updated:** March 3, 2026  
**Project Version:** 1.0.0  
**Status:** Active Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Frontend Structure](#frontend-structure)
7. [Design System](#design-system)
8. [Navigation & Routes](#navigation--routes)
9. [User Journey Flows](#user-journey-flows)
10. [UI/UX Design Patterns](#uiux-design-patterns)
11. [Accessibility Requirements](#accessibility-requirements)
12. [Performance Optimization](#performance-optimization)
13. [Mobile-First Design](#mobile-first-design-principles)
14. [Success Metrics & KPIs](#success-metrics--kpis)
15. [Future Features Roadmap](#future-features-roadmap)
16. [Installation & Setup](#installation--setup)
17. [Project Structure](#project-structure)
18. [Key Features](#key-features)
19. [Authentication Flow](#authentication-flow)
20. [Deployment Guide](#deployment-guide)
21. [Database Indexing](#database-indexing-strategy)
22. [Testing](#testing)
23. [Troubleshooting](#troubleshooting)

---

## 📱 Project Overview

**Service Radar** is a modern location-based service booking platform that connects customers with service providers. The application allows customers to discover, view, and book services from plumbers, electricians, cleaners, and other service providers based on their location, ratings, and availability.

### Core Features
- **User Authentication:** Role-based authentication (Customer/Provider)
- **Provider Discovery:** Search and filter providers by category, distance, rating, and price
- **Booking System:** Create, manage, and track service bookings
- **Review System:** Rate and review completed services
- **Ranking Engine:** Advanced ranking algorithm using Skip Lists for optimal provider ranking
- **Location-Based Search:** Geolocation support with distance calculation
- **Real-time Status Updates:** Track booking status in real-time
- **Provider Management:** Providers can manage profiles, availability, and bookings

---

## 🛠️ Tech Stack

### Backend
```
Runtime:        Node.js (v14+)
Language:       TypeScript 5.3.3
Framework:      Express.js 4.18.2
Database:       MongoDB 7.1.0 (Mongoose ODM 8.0.0)
Authentication: JWT (jsonwebtoken 9.0.3)
Password Hash:  bcryptjs 3.0.3
Distance Calc:  haversine-distance 1.2.4
Environment:    dotenv 16.4.5
CORS:           cors 2.8.5
Cookies:        cookie-parser 1.4.7
```

### Frontend
```
Framework:      React 19.2.0
Language:       TypeScript
Build Tool:     Vite 7.3.1
Styling:        Tailwind CSS 3.4.19
Component Lib:  Shadcn/UI
State Mgmt:     Zustand 5.0.11
Routing:        React Router DOM 7.13.1
HTTP Client:    Axios 1.13.6
Animations:     Framer Motion 12.34.4
Icons:          Lucide React 0.576.0
CSS:            PostCSS 8.5.8
Linting:        ESLint 9.39.1
```

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Frontend                       │
│  (React 19 + TypeScript + Tailwind CSS + Zustand)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                  ┌────▼────┐
                  │ Vite    │
                  │ Dev/Prod│
                  └────┬────┘
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend API Server                             │
│        (Express.js + TypeScript on Node.js)                │
├──────────────────────────────────────────────────────────────┤
│  Routes Layer          Middleware Layer                     │
│  ├─ /api/auth          ├─ Authentication                   │
│  ├─ /api/providers     ├─ Authorization (Role-based)       │
│  ├─ /api/bookings      ├─ CORS                             │
│  ├─ /api/reviews       └─ Error Handling                   │
│  └─ /api/categories                                        │
├──────────────────────────────────────────────────────────────┤
│  Controllers Layer (Business Logic)                         │
│  ├─ AuthController     ├─ BookingController               │
│  ├─ ProviderController ├─ ReviewController               │
│  └─ CategoryController                                     │
├──────────────────────────────────────────────────────────────┤
│  Services/Utils                                            │
│  ├─ RankingEngine          ├─ ScoreCalculator             │
│  ├─ SkipList              ├─ ResponseHandler              │
│  └─ Distance Calculation   └─ Haversine Distance          │
├──────────────────────────────────────────────────────────────┤
│  Models Layer (Mongoose Schemas)                           │
│  ├─ User          ├─ Review       ├─ Category            │
│  ├─ ProviderProfile  └─ Booking                          │
├──────────────────────────────────────────────────────────────┤
│  Database Config & Utilities                               │
│  ├─ MongoDB Connection   └─ Error Handlers                │
└──────────────────────────┬───────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  MongoDB    │
                    │  Database   │
                    │  (Cloud)    │
                    └─────────────┘
```

### Data Flow

```
User Action (React Component)
         ↓
Zustand Store (useAuthStore, useProviderStore, etc.)
         ↓
Axios API Client with Interceptors
         ↓
Express Route Handler
         ↓
Middleware (Auth, Role Check)
         ↓
Controller (Business Logic)
         ↓
Mongoose Model (Database Operation)
         ↓
MongoDB Document
         ↓
Response back through layers
         ↓
React Component State Update
         ↓
UI Render
```

---

## 💾 Database Design

### MongoDB Collections & Schemas

#### 1. **Users Collection**
Stores user account information.

```typescript
{
  _id: ObjectId,
  name: String,              // User's full name
  email: String,             // Unique email (lowercase, trimmed)
  password: String,          // Hashed password (bcryptjs)
  role: String,              // "customer" | "provider"
  createdAt: Date,           // AutoTimestamp
  updatedAt: Date            // AutoTimestamp
}

Indexes:
- email (unique)
- role
```

**Size Estimate:** 100-200 bytes per document

#### 2. **ProviderProfiles Collection**
Stores professional profiles for service providers.

```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to User (unique)
  categoryId: ObjectId,      // Reference to Category
  bio: String,               // Professional description
  price: Number,             // Hourly rate in dollars
  rating: Number,            // Average rating (0-5)
  totalReviews: Number,      // Count of reviews
  isAvailable: Boolean,      // Availability status
  location: {
    lat: Number,             // Latitude coordinate
    lng: Number              // Longitude coordinate
  },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- userId (unique)
- categoryId
- isAvailable
- location (2dsphere - geospatial)
- rating (for sorting)
```

**Size Estimate:** 300-500 bytes per document

#### 3. **Bookings Collection**
Stores service booking information.

```typescript
{
  _id: ObjectId,
  customerId: ObjectId,      // Reference to Customer User
  providerId: ObjectId,      // Reference to ProviderProfile
  categoryId: ObjectId,      // Reference to Category (optional)
  status: String,            // "pending" | "accepted" | "completed" | "cancelled"
  scheduledDate: Date,       // When the service is scheduled
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- customerId + status (compound)
- providerId + status (compound)
- scheduledDate
- status
```

**Size Estimate:** 200-300 bytes per document

#### 4. **Reviews Collection**
Stores customer reviews and ratings.

```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,       // Reference to Booking
  customerId: ObjectId,      // Reference to Customer User
  providerId: ObjectId,      // Reference to ProviderProfile (for queries)
  rating: Number,            // 1-5 star rating
  comment: String,           // Review text
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- bookingId (unique)
- providerId (for getting provider reviews)
- customerId
- rating
```

**Size Estimate:** 250-400 bytes per document

#### 5. **Categories Collection**
Stores service categories.

```typescript
{
  _id: ObjectId,
  name: String,              // "Plumbing", "Cleaning", etc.
  description: String,       // Category description
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- name (unique)
```

**Size Estimate:** 150-250 bytes per document

### Entity Relationships

```
User (1) ──── (1) ProviderProfile
  │
  ├─── (n) Booking ──── (1) ProviderProfile
  │         │
  │         └──── (1) Review
  │
  └─── (n) Review


Category (1) ──── (n) ProviderProfile
         │
         └─── (n) Booking

ProviderProfile (1) ──── (n) Booking
                │
                └─── (n) Review
```

---

## 🔌 API Documentation

### Base URL
**Development:** `http://localhost:5000/api`  
**Production:** `https://api.serviceradar.com/api`

### Response Format
All API responses follow a consistent format:

**Success Response (2xx):**
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data
  }
}
```

**Error Response (4xx, 5xx):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

### Authentication
- **Method:** JWT Bearer Token (in Authorization header)
- **Token Storage:** HttpOnly Cookie + localStorage
- **Token Expiration:** 7 days
- **Header Format:** `Authorization: Bearer <token>`

---

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "customer"  // or "provider"
}

Success Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}

Error Responses:
- 400: Missing required fields
- 409: User already exists
- 500: Registration failed
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Success Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}

Error Responses:
- 400: Invalid credentials
- 404: User not found
```

#### Logout User
```
POST /api/auth/logout
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

---

### Provider Endpoints

#### Create Provider Profile
```
POST /api/providers/profile
Authorization: Bearer <token>
Content-Type: application/json
Role Required: provider

Request Body:
{
  "categoryId": "507f1f77bcf86cd799439011",
  "bio": "Professional plumber with 10 years experience",
  "price": 75,
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}

Success Response (201):
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "categoryId": "507f1f77bcf86cd799439010",
      "bio": "Professional plumber with 10 years experience",
      "price": 75,
      "rating": 0,
      "totalReviews": 0,
      "isAvailable": true,
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    }
  }
}
```

#### Update Provider Profile
```
PUT /api/providers/profile
Authorization: Bearer <token>
Content-Type: application/json
Role Required: provider

Request Body:
{
  "bio": "Updated bio",
  "price": 85
}

Success Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated profile */ }
}
```

#### Toggle Availability
```
PATCH /api/providers/availability
Authorization: Bearer <token>
Role Required: provider

Success Response (200):
{
  "success": true,
  "message": "Availability updated",
  "data": {
    "isAvailable": true
  }
}
```

#### Get All Providers
```
GET /api/providers?category=<categoryId>&lat=40.7128&lng=-74.0060&limit=20
Query Parameters (optional):
- category: Filter by service category
- lat, lng: User coordinates (for distance calculation)
- limit: Number of results (default: 20)

Success Response (200):
{
  "success": true,
  "message": "Providers retrieved",
  "data": {
    "providers": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "categoryId": {
          "_id": "507f1f77bcf86cd799439010",
          "name": "Plumbing"
        },
        "price": 75,
        "rating": 4.8,
        "totalReviews": 25,
        "isAvailable": true,
        "location": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      }
    ]
  }
}
```

#### Get Provider by ID
```
GET /api/providers/:id

Success Response (200):
{
  "success": true,
  "message": "Provider retrieved",
  "data": {
    "provider": { /* provider object */ }
  }
}
```

---

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json
Role Required: customer

Request Body:
{
  "providerId": "507f1f77bcf86cd799439012",
  "categoryId": "507f1f77bcf86cd799439010",
  "scheduledAt": "2026-03-15T10:00:00Z"
}

Success Response (201):
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439013",
      "customerId": "507f1f77bcf86cd799439011",
      "providerId": "507f1f77bcf86cd799439012",
      "categoryId": "507f1f77bcf86cd799439010",
      "status": "pending",
      "scheduledDate": "2026-03-15T10:00:00Z"
    }
  }
}
```

#### Get User's Bookings
```
GET /api/bookings
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Bookings retrieved",
  "data": {
    "bookings": [ /* array of bookings */ ]
  }
}
```

#### Get Booking by ID
```
GET /api/bookings/:id
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Booking retrieved",
  "data": { /* booking object */ }
}
```

#### Update Booking Status
```
PATCH /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "status": "accepted"  // or "completed", "cancelled"
}

Success Response (200):
{
  "success": true,
  "message": "Booking status updated",
  "data": { /* updated booking */ }
}
```

---

### Review Endpoints

#### Submit Review
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json
Role Required: customer

Request Body:
{
  "bookingId": "507f1f77bcf86cd799439013",
  "rating": 5,
  "comment": "Excellent service, very professional!"
}

Success Response (201):
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439014",
      "bookingId": "507f1f77bcf86cd799439013",
      "customerId": "507f1f77bcf86cd799439011",
      "providerId": "507f1f77bcf86cd799439012",
      "rating": 5,
      "comment": "Excellent service, very professional!",
      "createdAt": "2026-03-15T15:30:00Z"
    }
  }
}
```

#### Get Provider Reviews
```
GET /api/providers/:id/reviews

Success Response (200):
{
  "success": true,
  "message": "Reviews retrieved",
  "data": {
    "reviews": [
      {
        "rating": 5,
        "comment": "Great service",
        "customerId": {
          "name": "Jane Doe"
        },
        "createdAt": "2026-03-15T15:30:00Z"
      }
    ],
    "stats": {
      "count": 25,
      "providerRating": 4.8,
      "totalReviews": 25
    }
  }
}
```

---

### Category Endpoints

#### Get All Categories
```
GET /api/categories

Success Response (200):
{
  "success": true,
  "message": "Categories retrieved",
  "data": {
    "categories": [
      {
        "_id": "507f1f77bcf86cd799439010",
        "name": "Plumbing",
        "description": "Plumbing services"
      },
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Cleaning",
        "description": "Cleaning services"
      }
    ]
  }
}
```

---

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PATCH/PUT request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Authenticated but lacks permission (role) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., email taken) |
| 500 | Server Error | Unexpected server error |

---

## 🎨 Frontend Structure

### Component Architecture

```
src/
├── components/
│   ├── Common/                 # Shared UI components
│   │   ├── Navbar.tsx
│   │   ├── NavbarEnhanced.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── Layout/                 # Layout components
│   │   └── SplitLayout.tsx
│   │
│   ├── Provider/               # Provider-related components
│   │   ├── ProviderCard.tsx
│   │   └── ProviderList.tsx
│   │
│   ├── Booking/                # Booking components
│   │   ├── BookingCard.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingFormEnhanced.tsx
│   │
│   ├── Review/                 # Review components
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewFormEnhanced.tsx
│   │   └── ReviewList.tsx
│   │
│   └── Map/                    # Map components
│       ├── MapContainer.tsx
│       └── MapContainerEnhanced.tsx
│
├── pages/                      # Page components
│   ├── Home.tsx                # Landing page
│   ├── NotFound.tsx            # 404 page
│   │
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   │
│   ├── Customer/
│   │   ├── Dashboard.tsx       # Customer main dashboard
│   │   ├── MyBookings.tsx      # View user's bookings
│   │   ├── BookingDetails.tsx  # Booking detail page
│   │   ├── ProviderDetail.tsx  # Provider profile page
│   │   └── SearchProviders.tsx # Search & browse
│   │
│   └── Provider/
│       ├── Dashboard.tsx       # Provider main dashboard
│       ├── Profile.tsx         # Create/edit profile
│       └── AvailableBookings.tsx # Incoming bookings
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Auth operations
│   └── useGeolocation.ts       # Geolocation hook
│
├── store/                      # Zustand stores
│   ├── authStore.ts            # Auth state
│   ├── bookingStore.ts         # Booking state
│   └── providerStore.ts        # Provider state
│
├── services/                   # API client
│   └── api.ts                  # Axios instance & interceptors
│
├── types/                      # TypeScript types
│   └── models.ts               # Frontend type definitions
│
├── utils/                      # Utility functions
├── providers/                  # Context providers
│   └── ThemeProvider.tsx
│
├── App.tsx                     # Main App component
├── main.tsx                    # React entry point
└── index.css                   # Global styles
```

### State Management (Zustand)

**authStore.ts:**
```typescript
- user: User | null              // Current logged-in user
- isLoading: boolean             // Loading state
- error: string | null           // Error messages
- initialized: boolean

Methods:
- login(email, password)         // Login user
- register(name, email, password, role)
- logout()                       // Clear auth
- setUser(user)                  // Manual user set
- initializeAuth()               // Init from localStorage
```

**bookingStore.ts:**
```typescript
- bookings: Booking[]            // User's bookings
- currentBooking: Booking | null
- isLoading: boolean
- error: string | null

Methods:
- fetchBookings()
- createBooking(details)
- updateBookingStatus(id, status)
- getBookingDetail(id)
```

**providerStore.ts:**
```typescript
- providers: ProviderProfile[]   // Search results
- currentProvider: ProviderProfile | null
- filters: FilterOptions         // Applied filters
- isLoading: boolean

Methods:
- searchProviders(filters)
- getProviderDetail(id)
- applyFilters(filters)
```

### Custom Hooks

**useAuth:**
```typescript
Returns:
{
  user: User | null
  isAuthenticated: boolean
  login(email, password): Promise<void>
  register(name, email, password, role): Promise<void>
  logout(): Promise<void>
}
```

**useGeolocation:**
```typescript
Returns:
{
  location: { lat: number, lng: number } | null
  isLoading: boolean
  error: string | null
}
```

---

## 🎨 Design System

### Color Palette

#### Light Mode
```
Primary Colors:
- Primary:              #d04f99 (Pink/Magenta) - Main CTAs, highlights
- Secondary:            #8acfd1 (Teal/Cyan) - Accents, hover states
- Accent:               #fbe2a7 (Soft Yellow) - Highlights, badges

Status Colors:
- Destructive/Error:    #f96f70 (Coral Red) - Errors, cancellations
- Success:              #10B981 (Green) - Available, approved
- Warning:              #F59E0B (Orange) - Pending, alerts

Neutral Colors:
- Background:           #f6e6ee (Light Mauve)
- Foreground:           #5b5b5b (Dark Gray)
- Card:                 #fdedc9 (Soft Cream)
- Border:               #d04f99 (Pink/Magenta)
- Input:                #e4e4e4 (Light Gray)
```

#### Dark Mode
```
Primary Colors:
- Primary:              #fbe2a7 (Soft Yellow)
- Secondary:            #e4a2b1 (Mauve/Rose)
- Accent:               #c67b96 (Dusty Rose)

Status Colors:
- Destructive:          #e35ea4 (Hot Pink)
- Success:              #10B981 (Green)
- Warning:              #F59E0B (Orange)

Neutral Colors:
- Background:           #12242e (Dark Navy)
- Foreground:           #f3e3ea (Light Mauve)
- Card:                 #1c2e38 (Dark Blue)
- Border:               #324859 (Slate Blue)
- Input:                #20333d (Dark Slate)
```

### Typography

```
Font Stack (imported):
- Sans Serif:   Poppins (primary font, UI elements)
- Serif:        Lora (headings, accents)
- Monospace:    Fira Code (code blocks, technical text)

Scales:
Headers:
  - H1: 2rem (32px), Bold, Line-height 1.2
  - H2: 1.5rem (24px), SemiBold, Line-height 1.3
  - H3: 1.25rem (20px), SemiBold, Line-height 1.4

Body:
  - Large:  1rem (16px), Regular, Line-height 1.5
  - Normal: 0.875rem (14px), Regular, Line-height 1.5
  - Small:  0.75rem (12px), Regular, Line-height 1.4

Letter Spacing:
  - Normal: 0em
  - Wide:   0.02em
```

### Spacing System

```
Base Unit: 0.25rem (4px)

Scale:
- xs:   0.25rem (4px)
- sm:   0.5rem (8px)
- md:   1rem (16px)
- lg:   1.5rem (24px)
- xl:   2rem (32px)
- 2xl:  3rem (48px)
```

### Shadows

```
Custom shadows with pink accent (HSL 325.78, 58.18%, 56.86%):
- shadow-2xs: 3px 3px 0px with 50% opacity
- shadow-xs:  3px 3px 0px
- shadow-sm:  3px 3px 0px + 3px 1px 2px
- shadow-md:  3px 3px 0px + 3px 2px 4px
- shadow-lg:  3px 3px 0px + 3px 4px 6px
- shadow-xl:  3px 3px 0px + 3px 8px 10px
- shadow-2xl: 3px 3px 0px (2.5x spread)

Dark Mode:
- Same structure, #324859 (Slate Blue) shadow color
```

### Border Radius

```
Radius Scale:
- xs:  0.05rem (~1px)
- sm:  0.35rem (~6px)
- md:  0.4rem (base)
- lg:  0.4rem + 4px  (~8px)
```

### Component Design Guidelines

**Buttons:**
- Primary: Pink background (#d04f99), white text
- Secondary: Teal background (#8acfd1), dark text
- Outline: Transparent bg, pink border
- Hover: Scale up slightly, shadow increase
- Disabled: Opacity 50%, cursor not-allowed

**Cards:**
- Background: Card color with border
- Padding: 1.5rem (24px)
- Hover: Subtle shadow increase, slight scale
- Transitions: 200ms ease

**Inputs:**
- Background: Input color (#e4e4e4)
- Border: 1px Border color
- Focus: Ring color glow, border change to primary
- Placeholder: Muted text color

**Navigation:**
- Primary color accent for active routes
- Secondary color for hover states
- Muted text for inactive

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 14+
- npm or yarn
- MongoDB instance (local or cloud)
- Git

### Backend Setup

**1. Navigate to backend:**
```bash
cd service-radar/backend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure environment variables:**
Create a `.env` file in `backend/`:

```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-generate-a-secure-one
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**4. Start development server:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

**Verify health:**
```bash
curl http://localhost:5000/api/health
```

### Frontend Setup

**1. Navigate to frontend:**
```bash
cd service-radar/frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create `.env.local` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

**4. Start development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (or `http://localhost:3000`)

**5. Open in browser:**
```
http://localhost:5173
```

### Production Build

**Frontend:**
```bash
npm run build    # Creates dist/ folder
npm run preview  # Preview production build
```

**Backend:**
```bash
npm run build    # Compiles TypeScript
npm start        # Run compiled JavaScript
```

---

## 📁 Project Structure

### Full Directory Tree

```
service-radar/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts         # Auth logic
│   │   │   ├── provider.controller.ts     # Provider logic
│   │   │   ├── booking.controller.ts      # Booking logic
│   │   │   ├── review.controller.ts       # Review logic
│   │   │   └── category.controller.ts     # Category logic
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts         # JWT validation
│   │   │   └── role.middleware.ts         # Role authorization
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts                    # User schema
│   │   │   ├── ProviderProfile.ts         # Provider schema
│   │   │   ├── Booking.ts                 # Booking schema
│   │   │   ├── Review.ts                  # Review schema
│   │   │   └── Category.ts                # Category schema
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts             # Auth endpoints
│   │   │   ├── provider.routes.ts         # Provider endpoints
│   │   │   ├── booking.routes.ts          # Booking endpoints
│   │   │   ├── review.routes.ts           # Review endpoints
│   │   │   └── category.routes.ts         # Category endpoints
│   │   │
│   │   ├── engine/
│   │   │   ├── RankingEngine.ts           # Advanced ranking logic
│   │   │   └── SkipList.ts                # Skip List data structure
│   │   │
│   │   ├── types/
│   │   │   ├── index.ts                   # Type exports
│   │   │   └── models.ts                  # Frontend-ready types
│   │   │
│   │   ├── utils/
│   │   │   ├── responseHandler.ts         # API response formatting
│   │   │   └── scoreCalculator.ts         # Ranking score calculation
│   │   │
│   │   ├── index.ts                       # Express app setup
│   │   └── test-ranking.ts                # Ranking engine tests
│   │
│   ├── .env                       # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── NavbarEnhanced.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   └── SplitLayout.tsx
│   │   │   │
│   │   │   ├── Provider/
│   │   │   │   ├── ProviderCard.tsx
│   │   │   │   └── ProviderList.tsx
│   │   │   │
│   │   │   ├── Booking/
│   │   │   │   ├── BookingCard.tsx
│   │   │   │   ├── BookingForm.tsx
│   │   │   │   └── BookingFormEnhanced.tsx
│   │   │   │
│   │   │   ├── Review/
│   │   │   │   ├── ReviewForm.tsx
│   │   │   │   ├── ReviewFormEnhanced.tsx
│   │   │   │   └── ReviewList.tsx
│   │   │   │
│   │   │   └── Map/
│   │   │       ├── MapContainer.tsx
│   │   │       └── MapContainerEnhanced.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── NotFound.tsx
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   │
│   │   │   ├── Customer/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── MyBookings.tsx
│   │   │   │   ├── BookingDetails.tsx
│   │   │   │   ├── ProviderDetail.tsx
│   │   │   │   └── SearchProviders.tsx
│   │   │   │
│   │   │   └── Provider/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Profile.tsx
│   │   │       └── AvailableBookings.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useGeolocation.ts
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── bookingStore.ts
│   │   │   └── providerStore.ts
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── models.ts
│   │   │
│   │   ├── utils/
│   │   │
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── .env.local
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.js
│   ├── index.html
│   └── README.md
│
├── package.json               # Root package.json
└── PROJECT_DOCUMENTATION.md   # This file
```

---

## ✨ Key Features

### 1. Authentication System
- **User Registration:** Customers and Providers can register
- **JWT Authentication:** Secure token-based authentication
- **Role-Based Access:** Different features for customers vs providers
- **HttpOnly Cookies:** Secure token storage
- **Auto-logout:** Automatic logout on token expiration

### 2. Provider Discovery
- **Advanced Search:** Filter by category, price, rating
- **Distance-Based Ranking:** Haversine formula for accurate distance
- **Geolocation Support:** Auto-detect user location
- **Ranking Engine:** Skip List data structure for optimal sorting
- **Real-time Availability:** See provider availability instantly

### 3. Booking System
- **Easy Booking:** Simple multi-step booking process
- **Status Tracking:** Pending → Accepted → Completed/Cancelled
- **Schedule Management:** Calendar date/time selection
- **Booking History:** View past and current bookings
- **Booking Details:** Full information about each booking

### 4. Review & Rating System
- **Star Ratings:** 1-5 star rating system
- **Written Reviews:** Add comments for providers
- **Provider Ratings:** Auto-calculated average rating
- **Review Count:** Track number of reviews

### 5. Provider Management Dashboard
- **Profile Management:** Create and update provider profile
- **Availability Toggle:** Easy on/off availability
- **Booking Management:** Accept/reject incoming bookings
- **Performance Analytics:** View ratings and review feedback
- **Service Management:** Update pricing and bio

### 6. Customer Dashboard
- **Booking Overview:** See all active and past bookings
- **Quick Actions:** Fast booking and review options
- **Search History:** Recent searches
- **Saved Providers:** Favorite providers (future feature)

### 7. Advanced Ranking Engine
- **Skip List Implementation:** O(log n) search and insertion
- **Multi-factor Scoring:** Rating, price, distance calculation
- **Category-based Ranking:** Separate ranking per service category
- **Real-time Updates:** Rankings update as providers get reviews

---

## 🔐 Authentication Flow

### Registration Flow

```
User selects role (Customer/Provider)
         ↓
Fills registration form (name, email, password)
         ↓
Frontend validates input (client-side)
         ↓
Sends POST /api/auth/register
         ↓
Backend validates fields
         ↓
Check if email already exists
         ↓
Hash password with bcryptjs (10 rounds)
         ↓
Create User document in MongoDB
         ↓
Generate JWT token (7 day expiry)
         ↓
Set HttpOnly cookie with token
         ↓
Return token + user data to frontend
         ↓
Frontend saves user to localStorage + Zustand
         ↓
Redirect based on role (Customer/Provider)
```

### Login Flow

```
User enters email and password
         ↓
Frontend validates (non-empty, email format)
         ↓
Sends POST /api/auth/login
         ↓
Backend finds user by email
         ↓
Compare password with bcryptjs
         ↓
Generate JWT token
         ↓
Set HttpOnly cookie
         ↓
Return token + user to frontend
         ↓
Frontend saves and stores state
         ↓
Redirect to dashboard
```

### Protected Route Flow

```
User navigates to protected page
         ↓
Check Zustand authStore for user
         ↓
If no user, redirect to /login
         ↓
If user exists, render protected component
         ↓
Component makes API call with JWT header
         ↓
Backend middleware verifies token
         ↓
If valid, process request
         ↓
If expired/invalid, return 401
         ↓
Frontend interceptor catches 401
         ↓
Clear localStorage, logout user
         ↓
Redirect to login
```

### Token Validation

```
Authorization: Bearer <jwt_token>
         ↓
Backend JWT middleware
         ↓
Verify signature with JWT_SECRET
         ↓
Check expiration time
         ↓
Extract payload (id, email, role)
         ↓
Attach to request object
         ↓
Pass to next middleware/controller
```

---

## 🚀 Deployment Guide

### Backend Deployment (Heroku/Railway/Render)

**1. Prepare for production:**
```bash
npm run build
```

**2. Set production environment variables:**
```env
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=generate-a-very-secure-secret-key
NATO_ENV=production
PORT=process.env.PORT (let platform assign)
ALLOWED_ORIGINS=https://yourdomain.com
```

**3. Deploy:**
```bash
# Using Heroku CLI
heroku login
heroku create your-app-name
heroku config:set MONGO_URI=...
git push heroku main

# Using Railway
railway login
railway link
railway up

# Using Render
# Use deploy.yaml or connect GitHub repo
```

### Frontend Deployment (Vercel/Netlify)

**1. Build frontend:**
```bash
npm run build
```

**2. Create `.env.production`:**
```env
VITE_API_URL=https://your-backend-api.com/api
```

**3. Deploy with Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**OR Deploy with Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

**4. Configure environment:**
- Set `VITE_API_URL` in platform env vars
- Set build command: `npm run build`
- Set publish directory: `dist`

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create cluster
3. Add IP whitelist (allow 0.0.0.0/0 for development)
4. Create database user
5. Copy connection string
6. Add to `.env` as `MONGO_URI`

### Domain & DNS

**For custom domain:**
1. Purchase domain (GoDaddy, Namecheap, etc.)
2. Point to deployment platform
3. Enable HTTPS/SSL
4. Update `ALLOWED_ORIGINS` in backend

---

## 📊 Database Indexing Strategy

### Recommended MongoDB Indexes

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })

// ProviderProfiles Collection
db.providerprofiles.createIndex({ userId: 1 }, { unique: true })
db.providerprofiles.createIndex({ categoryId: 1 })
db.providerprofiles.createIndex({ isAvailable: 1 })
db.providerprofiles.createIndex({ location: "2dsphere" })
db.providerprofiles.createIndex({ rating: -1 })

// Bookings Collection
db.bookings.createIndex({ customerId: 1, status: 1 })
db.bookings.createIndex({ providerId: 1, status: 1 })
db.bookings.createIndex({ scheduledDate: 1 })
db.bookings.createIndex({ status: 1 })

// Reviews Collection
db.reviews.createIndex({ bookingId: 1 }, { unique: true })
db.reviews.createIndex({ providerId: 1 })
db.reviews.createIndex({ customerId: 1 })
db.reviews.createIndex({ rating: -1 })

// Categories Collection
db.categories.createIndex({ name: 1 }, { unique: true })
```

### Performance Tips

- Use lean queries in RankingEngine for read-only operations
- Compound indexes for multi-field WHERE clauses
- 2dsphere index essential for geospatial queries
- Regular index analysis and optimization

---

## 🔍 Testing

### Backend Testing

```bash
# Run TypeScript type check
npm run type-check

# Test ranking engine
npm run dev
# Then visit: http://localhost:5000/test-ranking
```

### Frontend Testing

```bash
# ESLint check
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Database Connection Error**
```
Solution:
1. Check MONGO_URI is correct
2. Verify IP whitelist in MongoDB Atlas
3. Ensure MongoDB user has correct password
4. Check network connectivity
```

**Issue: CORS Errors**
```
Solution:
1. Update ALLOWED_ORIGINS in backend .env
2. Include frontend URL (with port)
3. Ensure credentials: true in both sides
```

**Issue: JWT Token Expired**
```
Solution:
1. Clear localStorage
2. Login again
3. Check JWT_EXPIRES_IN setting
```

**Issue: Provider Not Found in Search**
```
Solution:
1. Verify provider isAvailable = true
2. Check distance calculation (lat/lng)
3. Verify category assignment
4. Check ranking engine bootstrap
```

---

## �️ Navigation & Routes

### Frontend Route Structure

```
/                                    ← Landing/Home (Public)
├─ /login                            ← Login page (Public)
├─ /register                         ← Registration (Public)
│  ├─ ?role=customer                 ← Register as Customer
│  └─ ?role=provider                 ← Register as Provider
│
├─ /search                           ← Browse providers (Public/Authenticated)
│  ├─ ?category=<id>                 ← Filter by category
│  ├─ ?lat=<lat>&lng=<lng>           ← Geolocation search
│  ├─ ?price=<min>-<max>             ← Price range filter
│  └─ ?rating=<min>                  ← Minimum rating filter
│
├─ /provider/:id                     ← Provider detail view (Public/Authenticated)
│  └─ /reviews                       ← Provider reviews (nested)
│
├─ /customer                         ← Customer dashboard (Protected)
│  ├─ /dashboard                     ← Overview
│  ├─ /bookings                      ← My bookings list
│  │  ├─ /:id                        ← Booking details
│  │  └─ /:id/review                 ← Leave review
│  ├─ /search                        ← Advanced search
│  └─ /profile                       ← Customer profile settings
│
├─ /provider                         ← Provider dashboard (Protected)
│  ├─ /dashboard                     ← Overview & stats
│  ├─ /profile                       ← Create/edit provider profile
│  │  ├─ /edit                       ← Edit profile
│  │  └─ /availability               ← Manage availability
│  ├─ /bookings                      ← Incoming bookings
│  │  └─ /:id                        ← Booking details
│  └─ /reviews                       ← Customer reviews
│
└─ /404                              ← Page not found
```

### Route Protection Logic

```typescript
// Public Routes - No auth needed
- Home (/)
- Login (/login)
- Register (/register)
- Search (/search)
- Provider Details (/provider/:id)

// Customer-Only Routes - Auth + customer role
- /customer/** 
- /customer/bookings (view own bookings)
- /customer/reviews/:bookingId (submit review)

// Provider-Only Routes - Auth + provider role
- /provider/**
- /provider/profile (manage profile)
- /provider/bookings (view incoming bookings)

// Authenticated Routes - Any logged-in user
- /auth/me (current user)
- Token-protected API calls
```

---

## 👥 User Journey Flows

### Customer Journey Flow

```
1. DISCOVERY PHASE
   ↓
   Landing Page → Browse Services → View Categories
   ↓
   Search Results → Filter Options → Sort by (Rating/Price/Distance)
   ↓

2. EVALUATION PHASE
   ↓
   Select Provider → View Profile → Read Reviews → Check Availability
   ↓

3. BOOKING PHASE
   ↓
   Click "Book Now" → Multi-step Form:
     Step 1: Confirm service details
     Step 2: Pick date/time (calendar)
     Step 3: Review & confirm
   ↓
   Booking submitted (Status: Pending)
   ↓

4. WAITING PHASE
   ↓
   View Booking Status → Provider reviews and accepts/rejects
   ↓
   If Accepted: Status → Accepted
   If Rejected: Status → Cancelled (can rebook)
   ↓

5. COMPLETION PHASE
   ↓
   Service Date Arrives → Status Updates → Completed
   ↓

6. REVIEW PHASE
   ↓
   Leave Rating (1-5 stars) → Write Comment → Submit Review
   ↓
   View Updated Provider Rating
```

### Provider Journey Flow

```
1. ONBOARDING PHASE
   ↓
   Register (role: provider) → Create Profile:
     - Bio/description
     - Service category
     - Hourly rate
     - Location (auto-detect or manual)
   ↓

2. AVAILABILITY SETUP
   ↓
   Set Initial Status (Available/Not Available)
   ↓

3. BOOKING MANAGEMENT PHASE
   ↓
   Receive Booking Notifications → Review Booking Details
   ↓
   Decision: Accept or Reject
   ↓
   If Accepted: Status → Accepted (confirmed with customer)
   If Rejected: Booking cancelled, customer can search others
   ↓

4. SERVICE DELIVERY PHASE
   ↓
   Service Date/Time → Provide Service → Mark as Completed
   ↓

5. REPUTATION PHASE
   ↓
   Receive Customer Review → View Rating Impact
   ↓
   Profile rating updates automatically
   ↓

6. PROFILE OPTIMIZATION
   ↓
   View Reviews → Update Bio/Price → Manage Availability
   ↓
   Toggle on/off based on demand
```

### Guest Journey Flow

```
Landing Page → Browse Categories → Search Services
↓
View Provider List → View Provider Details
↓
Attempt to Book → Authentication Prompt
↓
Options: Login or Register
↓
Complete Auth → Return to Booking Flow
```

---

## 🎭 UI/UX Design Patterns

### Loading States

```typescript
// Skeleton Screens
- Provider cards: Shimmer placeholder
- Lists: Multiple skeleton items
- Forms: Placeholder blocks

// Spinners
- Page transitions: Centered spinner
- API calls: Subtle loading indicator
- Form submission: Button transforms to spinner

// Progress Indicators
- Multi-step forms: Progress bar
- Uploads: Percentage display
- Long operations: Estimated time remaining
```

### Error Handling

```typescript
// Toast Notifications (top-right)
- Success (green): "Booking created successfully!"
- Error (red): "Failed to update profile"
- Warning (orange): "This action cannot be undone"
- Info (blue): "Check your email for confirmation"

// Form Validation Errors
- Inline error messages below input fields
- Red border/background on invalid fields
- Auto-focus to first error on submit
- Clear error messages (not technical jargon)

// Page-level Errors
- 404 page with navigation back to home
- 500 page with retry button
- Network error with offline indicator
- Timeout error with manual retry

// Error States
- Empty searches: "No providers found, try adjusting filters"
- No bookings: "Start by booking a service"
- Network issues: "Connection lost, retrying..."
```

### Animations & Transitions

```typescript
// Page Transitions
- Fade in: 0.3s ease-in-out
- Route changes: Fade + slide (200ms)

// Component Animations
- Cards: Hover scale 1.02 + shadow increase
- Buttons: Hover scale 1.05 + shadow
- Lists: Stagger animation for items (100ms delay each)

// Micro-interactions
- Checkboxes: Scale bounce on toggle
- Buttons: Subtle press animation
- Modals: Scale from center on open
- Sidebars: Slide-in from left/right

// Feedback Animations
- Button clicked: Color pulse
- Success: Checkmark pulse
- Error shake: Horizontal wobble (3x)

// Transitions
- All color changes: 200ms ease
- Scale changes: 150ms ease
- Position changes: 200ms ease-out
```

### Modal & Dialog Patterns

```typescript
// Desktop Modals
- Center screen
- Semi-transparent backdrop (dark overlay)
- Smooth scale-up entrance
- Escape key to close

// Mobile Bottom Sheets
- Slide up from bottom
- Full-width layout
- Draggable handle to dismiss
- Fills 70-80% of screen height

// Dialog Types
- Confirmation: "Are you sure?"
- Action: Multi-step wizard
- Alert: Single action required
- Forms: Data input/editing
```

### Responsive Patterns

```typescript
// Breakpoints
- Mobile: 320px - 640px (single column)
- Tablet: 641px - 1024px (2 columns)
- Desktop: 1025px+ (3+ columns)

// Layout Shifts
- Navigation: Drawer → Sidebar → Navbar
- Cards: Stack vertical → 2-column grid → 3-column grid
- Forms: Full width → side-by-side fields → multi-column

// Touch-friendly UI
- Buttons: Min 44x44px for touch targets
- Spacing: More padding on mobile
- Text: Larger font sizes on mobile (16px min)
- Modals: Bottom sheets instead of centered modals
```

---

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance

```
Color Contrast:
- Text vs background: Minimum 4.5:1 ratio
- UI components: Minimum 3:1 ratio
- Large text (18px+): Minimum 3:1 ratio

Keyboard Navigation:
- Tab order: Logical, left-to-right, top-to-bottom
- Focus visible: Clear 2px outline or highlight
- Escape key: Close modals, escape forms
- Enter key: Submit forms, click buttons
- Skip links: Jump to main content

Focus Indicators:
- Ring color: #d04f99 (primary color) or high-contrast alternative
- Width: 2px
- Offset: 2px from element
- Always visible on :focus-visible state
```

### ARIA & Semantic HTML

```typescript
// Semantic Elements
- <button> for clickable actions (not <div onClick>)
- <a> for navigation (not <div> with routing)
- <form> for form inputs
- <nav> for navigation sections
- <main> for main content area
- <article> for independent content
- <section> for thematic content grouping

// ARIA Attributes
- aria-label: Hidden descriptive text for icons
- aria-describedby: Link to description element
- aria-live="polite": Announce dynamic content
- aria-hidden="true": Hide visual decorations
- role="alert": Emergency announcements
- role="progressbar": Progress indicators
- aria-disabled="true": Disabled state
- aria-current="page": Active nav link

// Form Accessibility
- <label htmlFor="input-id"> for all inputs
- aria-required="true" for required fields
- aria-invalid="true" on errors
- aria-describedby pointing to error message
- Placeholder ≠ Label (use both)
```

### Screen Reader Support

```
Announcements:
- Form submitted successfully
- Booking created with ID
- Error: Please check required fields
- Review submitted, thank you!

Page Structure:
- H1: Page title (one per page)
- H2: Section headings
- H3: Subsections
- Hierarchical structure (no skipping levels)

Alternative Text:
- Images: <img alt="Provider avatar for John Doe">
- Icons: <Icon aria-label="Star rating">
- Decorative: <Icon aria-hidden="true">
```

---

## ⚡ Performance Optimization

### Frontend Performance

```
Image Optimization:
- Provider avatars: webp format, max 200x200px
- Category icons: SVG preferred, fallback PNG
- Hero image: 1920px max, multiple sizes via srcset
- Lazy loading: Intersection Observer API

Code Splitting:
- Route-based chunks: /customer/* separate bundle
- Component lazy loading: Dynamic imports
- Vendor splitting: React, utilities in separate chunks

Caching Strategy:
- API responses: 5-minute cache (bookings), 1-hour (providers)
- Provider details: Cache with stale-while-revalidate
- Images: Long-lived cache headers (1 month)
- localStorage: Persist user auth and preferences

Bundling:
- Minification: Enable for production
- Tree-shaking: Remove unused code
- Compression: gzip/brotli enabled on server
```

### Network Optimization

```
API Optimization:
- Debounce search input: 300ms
- Debounce filter changes: 500ms
- Batch requests where possible
- Request compression: gzip enabled

Pagination:
- Search results: Load 20 at a time
- Bookings: Load 10, infinite scroll
- Reviews: Load 5, paginate reviews

Data Fetching:
- Parallel requests: getProvider + getReviews together
- Sequential where needed: Login → fetch user → redirect
```

### Backend Performance

```
Database Optimization:
- Indexes on: email, categoryId, rating, location
- Lean queries: .lean() for read-only operations
- Connection pooling: Mongoose default (100 connections)
- Query optimization: Select only needed fields

Ranking Engine:
- Skip List: O(log n) insertion and search
- Category-based: Separate lists per category
- Cache top results: In-memory cache for frequent searches
- Update on review: Upsert scores efficiently

Response Compression:
- gzip middleware enabled
- JSON minification
- Response caching for GET requests (5-minute TTL)
```

---

## 📱 Mobile-First Design Principles

### Responsive Breakpoints

```
Mobile First Approach:
- Start with 375px (iPhone SE)
- Enhance for 640px (larger phones)
- Optimize for 1024px (tablets)
- Polish for 1920px+ (desktops)

Breakpoints:
- sm: 320px (minimum width)
- md: 640px (tablets)
- lg: 1024px (small laptops)
- xl: 1280px (desktops)
- 2xl: 1536px (large desktops)
```

### Touch-First Interactions

```
Touch Targets:
- Minimum size: 44x44px (iOS guideline)
- Spacing: 8px between touch targets
- Buttons: 48-52px height for main actions
- Checkboxes: 40x40px hit area

Gestures:
- Tap: Primary action (button click)
- Long-press: Context menu (maybe)
- Swipe: Navigate between pages/tabs
- Pinch: Zoom (maps, images)
- Double-tap: Like/favorite (future)

Avoid:
- Hover effects (no hover on touch)
- Double-click required actions
- Tiny UI elements < 40px
```

### Mobile Navigation

```
Navigation Patterns:
- Top Navbar: Logo + hamburger menu (mobile)
- Drawer Menu: Slide from left, full height
- Bottom Tab Bar: Tabs for major sections (optional)
- Breadcrumbs: Show path on mobile too

Mobile Optimizations:
- Full-screen modals instead of centered
- Bottom sheets for filters/actions
- Full-width forms, not side-by-side
- Large text: 16px minimum
- Adequate spacing: 16px gutters
```

---

## 📊 Success Metrics & KPIs

### User Engagement Metrics

```
Acquisition:
- Monthly sign-ups (target: 500/month)
- Registration completion rate (target: >80%)
- Customer/Provider split ratio

Engagement:
- Booking creation rate (% of users who book)
- Average bookings per customer (target: 2-3/month)
- Active provider ratio (% with availability = true)
- Review submission rate (target: 60% of completions)

Retention:
- Month-over-month user retention (target: 60%+)
- Return booking rate (customers who rebook)
- Provider churn rate (should be <10%/month)

Revenue (if paid):
- Average booking value (ADV)
- Bookings per day
- Customer lifetime value (CLV)
```

### Platform Quality Metrics

```
Performance:
- Page load time < 2 seconds (target)
- API response time < 200ms (target)
- 99.9% uptime
- Mobile Lighthouse score > 90

Search Quality:
- Search-to-booking time (target: <3 minutes)
- Search result click-through rate
- No search result rate (should be <5%)

Provider Quality:
- Average provider rating (target: >4.5/5)
- Review count per provider (target: >10)
- Provider response rate to bookings

Booking Quality:
- Booking completion rate (accepted → completed)
- Booking cancellation rate (target: <10%):
- Customer satisfaction score (NPS)
```

### User Experience Metrics

```
Conversion Funnel:
1. Browse providers: 100%
2. View provider detail: 60%
3. Click book: 40%
4. Complete booking: 25%
5. Complete service: 20%
6. Submit review: 12%

Key Metrics:
- Bounce rate (target: <40%)
- Scroll depth (target: >50% avg)
- Form abandonment rate (target: <20%)
- Error rate (target: <1%)
- Accessibility audit score (target: 95+)
```

---

## 🚀 Future Features Roadmap

### Phase 2 (Q2 2026)

```
Booking Enhancements:
- Recurring bookings (weekly/monthly)
- Booking time slots (pre-defined times)
- Service add-ons (premium options)
- Instant booking (no provider approval needed)

Provider Enhancements:
- Multiple service categories per provider
- Work schedule management
- Team management (sub-providers)
- Bulk availability management
- Earnings dashboard with analytics

Communication:
- In-app messaging (customer ↔ provider)
- Notifications (SMS/email)
- Booking reminders (24hrs before)
- Chat history with each provider
```

### Phase 3 (Q3 2026)

```
Payment Integration:
- Stripe/PayPal payment gateway
- Payment upon booking or completion
- Refund management
- Wallet/credit system
- Invoice generation

Provider Tools:
- Rating/review response system
- Service portfolio (photos/videos)
- Calendar integration (Google Calendar)
- Booking calendar view
- Invoice and payment tracking

Customer Features:
- Saved favorite providers
- Service wishlist
- Referral program
- Payment history
- Digital receipts
```

### Phase 4 (Q4 2026)

```
Advanced Features:
- AI-powered provider recommendations
- Dynamic pricing based on demand
- Insurance/verification system
- Background check integration
- Provider certification badges

Analytics:
- Admin dashboard
- User analytics
- Provider performance analytics
- Revenue analytics
- Heatmaps and user behavior analysis

Mobile Apps:
- Native iOS app (React Native)
- Native Android app (React Native)
- Push notifications
- Offline support (cached data)
- Deep linking for bookings
```

---

## �📝 License

MIT License - Free for educational and commercial use

---

## 👥 Support & Contact

For issues or questions:
- Create GitHub issue
- Email: support@serviceradar.com
- Documentation: /docs

---

**Last Updated:** March 3, 2026  
**Maintained By:** Development Team  
**Version:** 1.0.0
