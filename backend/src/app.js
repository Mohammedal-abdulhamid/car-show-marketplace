const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const app = express();
const carRoutes = require("./routes/carRoutes");

app.use(cors());
app.use(express.json());

//  use routes
app.use("/api/auth", authRoutes);

// DB test route
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});
// Test route
app.get("/", (req, res) => {
    res.send("Car Show API is running");
});
// static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/cars", carRoutes);


module.exports = app;