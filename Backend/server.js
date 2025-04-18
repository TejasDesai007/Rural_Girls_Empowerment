const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");


const app = express();
const PORT = 5000;
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` in production with HTTPS
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
