const express = require("express");
const Team = require("../models/Team");

const router = express.Router();

// Create a new team
router.post("/create", async (req, res) => {
    try {
        const { teamId, teamName } = req.body;

        if (!teamId || !teamName) {
            return res.status(400).json({
                success: false,
                message: "Team ID and Team Name are required"
            });
        }

        const existingTeam = await Team.findOne({ teamId });

        if (existingTeam) {
            return res.status(409).json({
                success: false,
                message: "Team ID already exists"
            });
        }

        const team = await Team.create({
            teamId,
            teamName
        });

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            team
        });

    } catch (error) {
        console.error("Create team error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;