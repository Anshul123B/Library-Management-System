# Library Management System

A full-stack web application for managing library operations, including book inventory, member management, issue tracking, and membership handling. 

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Library Managment System"
```

### 2. Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Install Dependencies

```bash
npm install
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/library_management?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=library_mgmt_super_secret_key_2024
JWT_EXPIRE=7d

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

**Note**: Replace `<username>` and `<password>` with your MongoDB credentials.

#### 2.4 Start Backend Server

```bash
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

#### 3.1 Navigate to Frontend Directory (from project root)

```bash
cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Configure API Endpoint

Update the API endpoint in `src/services/api.js` if needed. By default, it should point to `http://localhost:5000`.

#### 3.4 Start Frontend Development Server

```bash
npm start
```

The frontend will open in your browser at `http://localhost:3000`

## Running the Application

### Development Mode (Both Frontend and Backend)

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```


