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
// ==========================================
// ASSIGN TOP TEAMS TO ROOMS
// ==========================================

router.post("/assign-rooms", async (req, res) => {

    try {

        const { count } = req.body;

        // --------------------------------------
        // Validate count
        // --------------------------------------

        if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > 50
        ) {

            return res.status(400).json({
                success: false,
                message: "Count must be between 1 and 50"
            });

        }


        // --------------------------------------
        // Get all teams
        // --------------------------------------

        const teams = await Team.find({})
            .sort({
                bestScore: -1,
                bestScoreElapsedSeconds: 1
            });


        if (!teams.length) {

            return res.status(404).json({
                success: false,
                message: "No teams found"
            });

        }


        // --------------------------------------
        // Select TOP N
        // --------------------------------------

        const topTeams =
            teams.slice(0, count);


        // --------------------------------------
        // Divide rooms
        // --------------------------------------

        const room404Count =
            Math.ceil(topTeams.length / 2);


        const room404Teams =
            topTeams.slice(
                0,
                room404Count
            );


        const room405Teams =
            topTeams.slice(
                room404Count
            );


        // --------------------------------------
        // Save Room 404
        // --------------------------------------

        await Promise.all(
            room404Teams.map(team =>
                Team.updateOne(
                    { _id: team._id },
                    {
                        $set: {
                            roomNumber: 404
                        }
                    }
                )
            )
        );


        // --------------------------------------
        // Save Room 405
        // --------------------------------------

        await Promise.all(
            room405Teams.map(team =>
                Team.updateOne(
                    { _id: team._id },
                    {
                        $set: {
                            roomNumber: 405
                        }
                    }
                )
            )
        );


        // --------------------------------------
        // Response
        // --------------------------------------

        res.json({

            success: true,

            message:
                `${topTeams.length} teams assigned successfully`,

            totalTeams:
                topTeams.length,

            room404Count:
                room404Teams.length,

            room405Count:
                room405Teams.length,

            room404Teams:
                room404Teams.map(team => ({
                    teamId: team.teamId,
                    teamName: team.teamName,
                    score: team.bestScore,
                    roomNumber: 404
                })),

            room405Teams:
                room405Teams.map(team => ({
                    teamId: team.teamId,
                    teamName: team.teamName,
                    score: team.bestScore,
                    roomNumber: 405
                }))

        });

    } catch (error) {

        console.error(
            "Assign rooms error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to assign rooms"

        });

    }

});

module.exports = router;