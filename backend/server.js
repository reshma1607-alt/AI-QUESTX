const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const teamRoutes = require("./routes/teams");
const imageRoutes = require("./routes/images");
const competitionRoutes = require("./routes/competition");
const evaluationRoutes = require("./routes/evaluation");
const adminRoutes = require("./routes/admin");
dotenv.config();
console.log("Admin username loaded:", process.env.ADMIN_USERNAME ? "YES" : "NO");
console.log("Admin password loaded:", process.env.ADMIN_PASSWORD ? "YES" : "NO");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/teams", teamRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/competition", competitionRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/admin", adminRoutes);
// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));
// Serve admin files
app.use(
    "/admin",
    express.static(path.join(__dirname, "../admin"))
);
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/html/index.html")
    );
});
app.get("/admin", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../admin/index.html")
    );
});

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "AI QUESTX backend is working"
    });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB Connected");
        })
        .catch((error) => {
            console.error("MongoDB Connection Error:", error.message);
        });
} else {
    console.log("MongoDB URI not configured yet");
}

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`AI QUESTX Server running on port ${PORT}`);
});