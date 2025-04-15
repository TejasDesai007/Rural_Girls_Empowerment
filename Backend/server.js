const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` in production with HTTPS
  })
);

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
