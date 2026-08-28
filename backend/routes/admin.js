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
// ASSIGN TOP TEAMS TO ROOMS + SYSTEMS
// ==========================================

router.post("/assign-rooms", adminAuth, async (req, res) => {

    try {

        const { count } = req.body;

        // --------------------------------------
        // Always select maximum 30 teams
        // --------------------------------------

        const totalCount = 30;

        // --------------------------------------
        // System numbers for each room
        // --------------------------------------

        const SYSTEM_NUMBERS = [
            3, 16, 27, 40, 49,
            52, 61, 64, 6, 21,
            32, 44, 56, 59, 69
        ];

        // --------------------------------------
        // Get all teams by final best score
        // --------------------------------------

        const teams = await Team.find({})
            .sort({
                bestScore: -1,
                bestScoreElapsedSeconds: 1,
                bestScoreAchievedAt: 1
            });

        if (!teams.length) {

            return res.status(404).json({
                success: false,
                message: "No teams found"
            });

        }

        // --------------------------------------
        // TOP 30 ONLY
        // --------------------------------------

        const topTeams = teams.slice(0, totalCount);

        // --------------------------------------
        // Assign Room + System
        // --------------------------------------

        const assignedTeams = [];

        for (let i = 0; i < topTeams.length; i++) {

            const team = topTeams[i];

            // Rank 1-15 → Room 404
            // Rank 16-30 → Room 405
            const roomNumber =
                i < 15 ? 404 : 405;

            // System position inside the room
            const systemIndex =
                i < 15 ? i : i - 15;

            const systemNumber =
                SYSTEM_NUMBERS[systemIndex];

            team.roomNumber = roomNumber;
            team.systemNumber = systemNumber;

            // QR becomes available
            team.qrSent = true;

            await team.save();

            assignedTeams.push({
                rank: i + 1,
                teamId: team.teamId,
                teamName: team.teamName,
                score: team.bestScore,
                roomNumber: roomNumber,
                systemNumber: systemNumber
            });

            console.log(
                `Rank ${i + 1}: ${team.teamId} → Room ${roomNumber} → System ${systemNumber}`
            );
        }

        // --------------------------------------
        // RESPONSE
        // --------------------------------------

        res.json({

            success: true,

            message:
                "Top 30 teams assigned to rooms and systems",

            totalTeams:
                assignedTeams.length,

            room404Teams:
                assignedTeams.filter(
                    team => team.roomNumber === 404
                ),

            room405Teams:
                assignedTeams.filter(
                    team => team.roomNumber === 405
                )

        });

    } catch (error) {

        console.error(
            "Assign rooms/systems error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to assign rooms and systems"

        });

    }

});
// ==========================================
// SEND QR TO QUALIFIED TEAM
// ==========================================

router.post("/send-qr/:teamId", async (req, res) => {

    try {

        const { teamId } = req.params;

        // Find the team
        const team = await Team.findOne({
            teamId: teamId.toUpperCase()
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Team must have a room
        if (!team.roomNumber) {
            return res.status(400).json({
                success: false,
                message: "Room has not been assigned to this team"
            });
        }

        // Mark QR as sent
        team.qrSent = true;

        await team.save();

        res.json({
            success: true,
            message: "QR sent successfully",
            teamId: team.teamId,
            roomNumber: team.roomNumber,
            qrSent: true
        });

    } catch (error) {

        console.error(
            "Send QR error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to send QR"
        });
    }

});
// ==========================================
// END TEST FOR ALL TEAMS
// ==========================================

router.post("/end-test", adminAuth, async (req, res) => {

    try {

        const result = await Team.updateMany(
            {},
            {
                $set: {
                    roundActive: false,
                    roundEndsAt: new Date()
                }
            }
        );

        console.log(
            `Test ended for ${result.modifiedCount} teams`
        );

        res.json({
            success: true,
            message: "Test ended successfully",
            teamsUpdated: result.modifiedCount
        });

    } catch (error) {

        console.error(
            "End test error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to end test"
        });

    }

});
// ==========================================
// END TEST FOR ALL TEAMS
// ==========================================

router.post("/end-test", adminAuth, async (req, res) => {

    try {

        const result = await Team.updateMany(
            {},
            {
                $set: {
                    roundActive: false,
                    roundEndsAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: "Test ended successfully",
            teamsUpdated: result.modifiedCount
        });

    } catch (error) {

        console.error("End test error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to end test"
        });

    }

});
module.exports = router;