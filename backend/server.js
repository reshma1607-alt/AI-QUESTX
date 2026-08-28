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
// API Routers
const apiRouter = express.Router();
apiRouter.use("/teams", teamRoutes);
apiRouter.use("/images", imageRoutes);
apiRouter.use("/competition", competitionRoutes);
apiRouter.use("/evaluation", evaluationRoutes);
apiRouter.use("/admin", adminRoutes);

// Mount API on both /api and /AiQuestx/api
app.use("/api", apiRouter);
app.use("/AiQuestx/api", apiRouter);

// Serve admin files
app.use("/AiQuestx/admin", express.static(path.join(__dirname, "../admin")));
app.use("/admin", express.static(path.join(__dirname, "../admin")));

// Serve frontend files
app.use("/AiQuestx", express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../frontend")));

// Route handlers
app.get(["/", "/AiQuestx"], (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get(["/admin", "/AiQuestx/admin"], (req, res) => {
    res.sendFile(path.join(__dirname, "../admin/index.html"));
});

// Test route
const testHandler = (req, res) => {
    res.json({
        success: true,
        message: "AI QUESTX backend is working"
    });
};
app.get("/api/test", testHandler);
app.get("/AiQuestx/api/test", testHandler);

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
const PORT = process.env.PORT || 6011;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI QUESTX Server running on port ${PORT}`);
});