const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./models/Message');
const path = require('path'); // Added for static file serving

require('dotenv').config({ path: '../.env' });
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Configure CORS for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
};

const io = socketIo(server, {
  cors: corsOptions
});

// 🚀 Trip Auto-Completion Service
const TripAutoCompletionService = require('./services/tripAutoCompletion');
let tripAutoCompletionService;

// Routers
const { router: authRoutes } = require('./routes/auth');
const { router: tripRoutes, setSocketIO: setTripSocketIO } = require('./routes/trip');
const { router: joinedTripsRoutes, setSocketIO: setJoinedTripsSocketIO } = require('./routes/joinedTrips');
const { router: notificationRoutes, setSocketIO: setNotificationSocketIO } = require('./routes/notification');
const { router: messageRoutes, setSocketIO: setMessageSocketIO } = require('./routes/message');
const profileRoutes = require('./routes/profile');
const memoryRoutes = require('./routes/memory');
const adminRoutes = require('./routes/admin');
const { router: leaderboardRoutes, setSocketIO: setLeaderboardSocketIO } = require('./routes/leaderboard');
const publicRoutes = require('./routes/public');

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with production settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Log requests with more details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// MongoDB connection monitoring with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  });
};

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  if (process.env.NODE_ENV !== 'test') {
    connectWithRetry();
  }
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/joined-trips', joinedTripsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Default profile generator
app.get('/api/default-profile', (req, res) => {
  try {
    const defaultProfile = {
      fullName: req.query.name || "New User",
      bio: "",
      location: "",
      phone: "",
      joinedDate: new Date().toISOString().split('T')[0],
      connections: 0,
      followers: 0,
      following: 0,
      tripsPosted: 0,
      tripsJoined: 0,
      upcomingTrips: 0,
      totalCountries: 0,
      totalCities: 0,
      travelCategories: [],
      languages: [],
      verified: false,
      responseRate: "0%",
      responseTime: "N/A",
      avatar: "/assets/images/default-avatar.webp",
      rating: 0
    };
    res.json({ success: true, profile: defaultProfile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create default profile' });
  }
});

// Trip Auto-Completion APIs
app.get('/api/trip-completion/status', (req, res) => {
  if (!tripAutoCompletionService) {
    return res.status(503).json({ error: 'Auto-completion service not initialized' });
  }
  res.json(tripAutoCompletionService.getStatus());
});

app.post('/api/trip-completion/check', async (req, res) => {
  if (!tripAutoCompletionService) {
    return res.status(503).json({ error: 'Auto-completion service not initialized' });
  }
  try {
    await tripAutoCompletionService.checkAndCompleteTrips();
    res.json({ success: true, message: 'Trip completion check triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check trip completions', details: error.message });
  }
});

// Fetch messages (legacy)
app.get('/api/messages/:tripId', async (req, res) => {
  try {
    const messages = await Message.find({ tripId: req.params.tripId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Socket.IO Setup
setTripSocketIO(io);
setJoinedTripsSocketIO(io);
setNotificationSocketIO(io);
setMessageSocketIO(io);
setLeaderboardSocketIO(io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', async (tripId, userId) => {
    const roomName = `trip_${tripId}`;
    socket.join(roomName);
    console.log(`User ${userId} joined room ${roomName}`);
    socket.to(roomName).emit('userJoined', { userId, message: 'joined the chat' });
  });

  // Handle trip room joining for participant updates
  socket.on('joinTripRoom', (tripId) => {
    const roomName = `trip_${tripId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined trip room ${roomName} for participant updates`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const newMsg = new Message({
        tripId: data.tripId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        message: data.message,
        timestamp: new Date().toISOString(),
        type: data.type || 'text'
      });

      await newMsg.save();
      const roomName = `trip_${data.tripId}`;
      io.to(roomName).emit('receiveMessage', newMsg);
    } catch (err) {
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('typing', (data) => {
    const roomName = `trip_${data.tripId}`;
    socket.to(roomName).emit('userTyping', { userId: data.userId, userName: data.userName });
  });

  socket.on('stopTyping', (data) => {
    const roomName = `trip_${data.tripId}`;
    socket.to(roomName).emit('userStoppedTyping', { userId: data.userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Endpoint to list all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [];

  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({ path: middleware.route.path, method: Object.keys(middleware.route.methods)[0].toUpperCase() });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({ path: handler.route.path, method });
        }
      });
    }
  });

  res.json({ routes });
});

// Connect to MongoDB and start server
connectWithRetry();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV === 'production') {
    console.log(`Frontend should be available at ${process.env.FRONTEND_URL}`);
  } else {
    console.log('Frontend should be available at http://localhost:5173');
  }

  // 🚀 Start trip auto-completion service
  tripAutoCompletionService = new TripAutoCompletionService(io);
  tripAutoCompletionService.start();
  console.log('🚀 Trip auto-completion service initialized');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
