import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';

// Route files
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/question.js';
import examRoutes from './routes/examRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js'; // Import submission routes

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000', // For local development
  process.env.FRONTEND_URL, // For deployed/preview environments
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));

// Body parser middleware - to accept req.body
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/submissions', submissionRoutes); // Mount submission routes

// Use the custom error handler middleware
app.use(errorHandler);

// A simple test route to check the proxy
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Hello from the Express backend! The proxy is working!' });
});

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

// Use port 5000
const port = parseInt(process.env.PORT) || 5000;
const server = app.listen(port, () => {
  console.log(`Backend server is listening on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
