const express = require("express");
const Team = require("../models/Team");
const Attempt = require("../models/Attempt");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();
// ==========================================
// ADMIN LOGIN
// ==========================================

router.post("/login", adminAuth, (req, res) => {
    res.json({
        success: true,
        message: "Admin login successful"
    });
});


// ==========================================
// GET LEADERBOARD
// ==========================================

router.get("/leaderboard", adminAuth, async (req, res) => {
    try {
        // Automatically close teams whose time has expired
await Team.updateMany(
    {
        roundActive: true,
        roundEndsAt: {
            $lte: new Date()
        }
    },
    {
        $set: {
            roundActive: false
        }
    }
);

        const teams = await Team.find(
            {},
            {
                _id: 0,
                teamId: 1,
                teamName: 1,
                assignedImage: 1,
                bestScore: 1,
                bestScoreElapsedSeconds: 1,
                bestScoreAchievedAt: 1,
                attemptCount: 1,
                roundActive: 1,
                roundStartedAt: 1,
                roundEndsAt: 1
            }
                
        
        )
        .sort({
            bestScore: -1,
            bestScoreElapsedSeconds: 1,
            bestScoreAchievedAt: 1
        });

        res.json({
            success: true,
            count: teams.length,
            teams
        });

    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load leaderboard"
        });
    }
});


// ==========================================
// GET TEAM ATTEMPTS
// ==========================================

router.get("/team/:teamId/attempts", adminAuth, async (req, res) => {

    try {

        const { teamId } = req.params;

        const attempts = await Attempt.find(
            { teamId },
            {
                _id: 0,
                teamId: 1,
                imageId: 1,
                prompt: 1,
                score: 1,
                elapsedSeconds: 1,
                isNewBest: 1,
                attemptedAt: 1
            }
        )
        .sort({
            attemptedAt: 1
        });

        res.json({
            success: true,
            teamId,
            count: attempts.length,
            attempts
        });

    } catch (error) {

        console.error(
            "Team attempts error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load team attempts"
        });
    }
});
// ==========================================
// END TEAM ROUND
// ==========================================

router.post("/team/:teamId/end-round", adminAuth, async (req, res) => {

    try {

        const { teamId } = req.params;

        const team = await Team.findOneAndUpdate(
            { teamId: teamId },

            {
                $set: {
                    roundActive: false,
                    roundEndsAt: new Date()
                }
            },

            {
                new: true
            }
        );

        if (!team) {

            return res.status(404).json({
                success: false,
                message: "Team not found"
            });

        }

        res.json({
            success: true,
            message: "Team round ended successfully",
            team: {
                teamId: team.teamId,
                teamName: team.teamName,
                roundActive: team.roundActive,
                roundEndsAt: team.roundEndsAt
            }
        });

    } catch (error) {

        console.error(
            "End round error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to end team round"
        });

    }

});


module.exports = router;