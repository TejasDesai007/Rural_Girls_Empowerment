require("dotenv").config(); // ✅ Load environment variables from .env

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");

const toolkitRoutes = require("./routes/toolkitRoute");



const chatRoutes = require("./routes/chatRoutes"); // Import the chat route


const app = express();
const PORT = 5000;

// ✅ Allow multiple localhost ports (e.g., 5173, 5174) during development
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session setup
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` in production with HTTPS
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.use('/api/toolkit', toolkitRoutes);

app.use("/api/chat", chatRoutes); // Chat route

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
