const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

require('./config/firebase'); // initializes Firebase once

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
