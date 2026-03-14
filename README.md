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

### Production Build

Build the frontend for production:
```bash
cd frontend
npm run build
```

## Project Structure

```
Library Management System/
├── backend/
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware (auth, error handling)
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── package.json
│   ├── server.js           # Main server file
│   └── .env                 # Environment variables (local only)
│
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── build/              # Production build (auto-generated)
│
├── README.md               # This file
└── LICENSE
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create new book
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Issue a book
- `GET /api/issues/:id` - Get issue by ID
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Return book

### Members
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Memberships
- `GET /api/memberships` - Get all memberships
- `POST /api/memberships` - Create membership
- `PUT /api/memberships/:id` - Update membership

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:

**For Backend:**
```bash
# Windows: Find process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env file
```

**For Frontend:**
```bash
# Either kill the process or set PORT environment variable
set PORT=3001 && npm start
```

### MongoDB Connection Error
- Ensure MongoDB service is running
- Verify MONGO_URI in `.env` file
- Check network access in MongoDB Atlas (if using cloud)
- Ensure IP whitelist includes your current IP

### Module Not Found
Delete `node_modules` folder and reinstall:
```bash
rm -r node_modules  # or rmdir /s node_modules on Windows
npm install
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues or questions, please create an issue in the GitHub repository.

---

**Last Updated**: March 2026
