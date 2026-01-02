# MERN Stack Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│              (http://localhost:5173 - Vite Dev)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST with JWT Token
                         │ Authorization: Bearer <token>
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Components                                              │   │
│  │  ├─ Login.jsx          (Public)                          │   │
│  │  ├─ Register.jsx       (Public)                          │   │
│  │  └─ Dashboard.jsx      (Protected)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AuthContext (Global State)                              │   │
│  │  ├─ user object                                          │   │
│  │  ├─ token (JWT)                                          │   │
│  │  ├─ login() function                                     │   │
│  │  ├─ register() function                                  │   │
│  │  └─ logout() function                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Axios Client (utils/api.js)                             │   │
│  │  └─ Interceptors for token injection                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Router                                            │   │
│  │  ├─ / → /dashboard (redirect)                            │   │
│  │  ├─ /login → Login page                                  │   │
│  │  ├─ /register → Register page                            │   │
│  │  └─ /dashboard → Dashboard (protected)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Tailwind CSS + Lucide React Icons                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API Calls
                         │ JSON payloads
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND                             │
│              (http://localhost:5000 - Node.js)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes & Controllers                                    │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Auth Routes (/api/auth)                             │ │   │
│  │  │ ├─ POST /register                                   │ │   │
│  │  │ │   ├─ Validate input                               │ │   │
│  │  │ │   ├─ Hash password (bcryptjs)                     │ │   │
│  │  │ │   ├─ Save to MongoDB                              │ │   │
│  │  │ │   └─ Generate JWT token                           │ │   │
│  │  │ ├─ POST /login                                      │ │   │
│  │  │ │   ├─ Find user by email                           │ │   │
│  │  │ │   ├─ Compare password                             │ │   │
│  │  │ │   └─ Generate JWT token                           │ │   │
│  │  │ └─ GET /me (Protected)                              │ │   │
│  │  │     ├─ Verify JWT token                             │ │   │
│  │  │     └─ Return user data                             │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Todo Routes (/api/todos) - All Protected            │ │   │
│  │  │ ├─ GET / - Get all todos for user                   │ │   │
│  │  │ ├─ POST / - Create new todo                         │ │   │
│  │  │ ├─ PUT /:id - Update todo                           │ │   │
│  │  │ └─ DELETE /:id - Delete todo                        │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware                                              │   │
│  │  ├─ CORS - Enable cross-origin requests                 │   │
│  │  ├─ express.json() - Parse JSON bodies                  │   │
│  │  └─ verifyToken - Check JWT on protected routes         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Models (Mongoose Schemas)                               │   │
│  │  ├─ User                                                │   │
│  │  │  ├─ name (String)                                   │   │
│  │  │  ├─ email (String, Unique)                          │   │
│  │  │  ├─ password (String, Hashed)                       │   │
│  │  │  ├─ role (String: user/admin)                       │   │
│  │  │  └─ timestamps                                       │   │
│  │  └─ Todo                                                │   │
│  │     ├─ title (String)                                  │   │
│  │     ├─ description (String)                            │   │
│  │     ├─ completed (Boolean)                             │   │
│  │     ├─ priority (String: low/medium/high)              │   │
│  │     ├─ userId (Reference to User)                      │   │
│  │     ├─ dueDate (Date, Optional)                        │   │
│  │     └─ timestamps                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Config                                                  │   │
│  │  └─ db.js - MongoDB connection                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         │ CRUD operations
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│         (MongoDB Atlas - Cloud Database)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Collections                                             │   │
│  │  ├─ users                                               │   │
│  │  │  ├─ Document 1: {name, email, password_hash, role}   │   │
│  │  │  └─ Document 2: {name, email, password_hash, role}   │   │
│  │  └─ todos                                               │   │
│  │     ├─ Document 1: {title, desc, completed, userId}    │   │
│  │     └─ Document 2: {title, desc, completed, userId}    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   REGISTRATION FLOW                              │
└─────────────────────────────────────────────────────────────────┘

User Browser                    Backend                  Database
    │                             │                          │
    │──── Click "Sign Up" ─────────→                          │
    │                             │                          │
    │─ Enter name, email, pwd ─→  │                          │
    │                             │                          │
    │                          [Validate]                    │
    │                             │                          │
    │                          [Hash Password]               │
    │                             │                          │
    │                             │──── Save User ──────────→│
    │                             │                          │
    │                             │←── User Saved ──────────│
    │                             │                          │
    │                      [Generate JWT]                    │
    │                             │                          │
    │←─ JWT Token + User Data ────│                          │
    │                             │                          │
    │ [Store Token in localStorage]                          │
    │                             │                          │
    │ [Redirect to Dashboard]     │                          │
    │                             │                          │

┌─────────────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

User Browser                    Backend                  Database
    │                             │                          │
    │──── Click "Sign In" ────────→                          │
    │                             │                          │
    │─ Enter email, password ─→   │                          │
    │                             │                          │
    │                      [Validate Input]                  │
    │                             │                          │
    │                             │──── Find User ──────────→│
    │                             │                          │
    │                             │←── User Data ───────────│
    │                             │                          │
    │                      [Compare Password]                │
    │                             │                          │
    │                      [Generate JWT]                    │
    │                             │                          │
    │←─ JWT Token + User Data ────│                          │
    │                             │                          │
    │ [Store Token in localStorage]                          │
    │                             │                          │
    │ [Redirect to Dashboard]     │                          │
    │                             │                          │

┌─────────────────────────────────────────────────────────────────┐
│                PROTECTED REQUEST FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User Browser                    Backend                  Database
    │                             │                          │
    │ [Get Token from localStorage]                          │
    │                             │                          │
    │─ GET /api/todos ────────────→                          │
    │ + Header: Authorization: Bearer <token>                │
    │                             │                          │
    │                      [Verify JWT]                      │
    │                             │                          │
    │                      [Extract userId]                  │
    │                             │                          │
    │                             │── Query todos ─────────→│
    │                             │   WHERE userId = X       │
    │                             │                          │
    │                             │←── Todos Array ────────│
    │                             │                          │
    │←─ Todos JSON Response ──────│                          │
    │                             │                          │
    │ [Display todos on Dashboard]                           │
    │                             │                          │
```

## Data Flow - Creating a Todo

```
Step 1: User enters todo title/description in form
        │
        ▼
Step 2: Frontend validates form data
        │
        ▼
Step 3: Frontend makes POST request to /api/todos
        - Includes JWT token in Authorization header
        - Sends: { title, description, priority }
        │
        ▼
Step 4: Backend receives request
        - Middleware checks JWT token
        - Extracts userId from token
        │
        ▼
Step 5: Backend validates input
        - Checks required fields
        - Validates priority enum
        │
        ▼
Step 6: Backend creates Todo document
        - Sets userId (from token)
        - Sets timestamps
        - Prepares data for MongoDB
        │
        ▼
Step 7: Mongoose saves to MongoDB
        - Validates against schema
        - Generates _id
        - Stores document
        │
        ▼
Step 8: MongoDB confirms save
        - Returns saved document
        │
        ▼
Step 9: Backend returns 201 + todo data
        │
        ▼
Step 10: Frontend receives response
         - Adds todo to state
         - Refreshes UI
         │
         ▼
Step 11: User sees new todo in dashboard
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────┘

Frontend Security:
├─ Token stored in localStorage (not httpOnly for Vite demo)
├─ Protected routes with ProtectedRoute component
├─ Automatic redirect to login on 401 error
└─ HTTPS in production (Vercel enforces)

Backend Security:
├─ Password Hashing
│  └─ bcryptjs with 10 salt rounds
│     └─ Password never stored in plain text
│
├─ JWT Authentication
│  ├─ Token includes userId
│  ├─ Signed with JWT_SECRET
│  ├─ Expires after 7 days
│  └─ Verified on every protected request
│
├─ Input Validation
│  ├─ Email format validation
│  ├─ Required fields check
│  ├─ Enum validation (priority, role)
│  └─ String trimming
│
├─ Authorization
│  ├─ User can only access their own todos
│  ├─ verifyToken middleware on protected routes
│  └─ userId comparison before operations
│
├─ CORS
│  └─ Only frontend origin allowed
│
└─ Environment Variables
   ├─ MongoDB credentials not in code
   ├─ JWT_SECRET not exposed
   └─ Database URI protected
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRODUCTION DEPLOYMENT                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   VERCEL (Frontend)       │
│  https://your-app        │
│  ├─ React (dist folder)  │
│  ├─ Tailwind CSS         │
│  ├─ React Router         │
│  └─ Axios (pointing to   │
│     backend URL)         │
└────────┬─────────────────┘
         │
         │ HTTPS API calls
         │ to backend
         │
┌────────▼─────────────────┐
│   RENDER (Backend)        │
│  https://api.your-app    │
│  ├─ Express.js server    │
│  ├─ Node.js runtime      │
│  ├─ Middleware           │
│  ├─ Controllers          │
│  └─ Mongoose models      │
└────────┬─────────────────┘
         │
         │ Native driver
         │ connection
         │
┌────────▼─────────────────┐
│ MONGODB ATLAS (Cloud DB)  │
│  mongodb+srv://...       │
│  ├─ users collection     │
│  ├─ todos collection     │
│  └─ Automatic backups    │
└──────────────────────────┘
```

## Key Components Interaction

```
AuthContext.jsx (Provider)
├─ Manages global auth state
├─ Provides login/register functions
├─ Stores user and token
└─ Used by: ProtectedRoute, Dashboard, all pages

ProtectedRoute.jsx
├─ Wraps protected pages
├─ Checks isAuthenticated from context
└─ Redirects to /login if not authenticated

Dashboard.jsx (Protected Page)
├─ Uses AuthContext for user info
├─ Uses Axios to fetch todos
├─ Displays todo list
├─ Handles create, update, delete
└─ Shows loading states

API Client (utils/api.js)
├─ Axios instance with interceptors
├─ Automatically adds token to requests
├─ Handles 401 redirects
└─ Used by all API calls
```

## Error Handling Flow

```
Error Occurs
    │
    ├─ Network Error
    │  └─ Axios catch block
    │     └─ Display error message
    │
    ├─ Validation Error (400)
    │  └─ Backend returns specific message
    │     └─ Frontend shows in form
    │
    ├─ Authentication Error (401)
    │  └─ Token invalid/expired
    │     └─ Clear localStorage
    │     └─ Redirect to /login
    │
    ├─ Authorization Error (403)
    │  └─ User not allowed
    │     └─ Show error message
    │
    ├─ Server Error (500)
    │  └─ Backend error
    │     └─ Console log + display error
    │
    └─ Unknown Error
       └─ Show generic message
       └─ Log to console
```

## Database Schema Relationships

```
Users Collection                Todos Collection
┌─────────────────┐            ┌────────────────┐
│ _id (ObjectId)  │◄───────────│ userId (ref)   │
│ name            │            │ _id (ObjectId) │
│ email (unique)  │            │ title          │
│ password        │            │ description    │
│ role            │            │ completed      │
│ createdAt       │            │ priority       │
│ updatedAt       │            │ dueDate        │
└─────────────────┘            │ createdAt      │
                               │ updatedAt      │
                               └────────────────┘

One User  ──────→ Many Todos (One-to-Many relationship)
```

This architecture provides:
✅ Clear separation of concerns
✅ Scalable structure
✅ Security best practices
✅ Production-ready design
✅ Easy to understand and modify
