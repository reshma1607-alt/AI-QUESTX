const express = require("express");
const Team = require("../models/Team");
const Image = require("../models/Image");

const router = express.Router();
// ==========================================
// CONNECT TEAM DEVICE
// ==========================================

router.post("/connect-device", async (req, res) => {

    try {

        const { teamId } = req.body;

        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "Team ID is required"
            });
        }

        const team = await Team.findOne({ teamId });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.json({
            success: true,
            message: "Team device connected",
            teamId: team.teamId
        });

    } catch (error) {

        console.error(
            "Connect device error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to connect team device"
        });
    }

});

const ROUND_DURATION_SECONDS = 10 * 60;


// ==========================================
// START COMPETITION ROUND
// ==========================================

router.post("/start", async (req, res) => {

    try {

        const { teamId } = req.body;

        if (!teamId) {

            return res.status(400).json({
                success: false,
                message: "Team ID is required"
            });

        }


        const team = await Team.findOne({
            teamId
        });

        if (!team) {

            return res.status(404).json({
                success: false,
                message: "Team not found"
            });

        }


        // ==========================================
        // CHECK EXISTING ROUND
        // ==========================================

        if (
            team.roundStartedAt &&
            team.roundEndsAt
        ) {

            const now = new Date();


            // Round is still active
            if (now < team.roundEndsAt) {

                const remainingSeconds =
                    Math.max(
                        0,
                        Math.floor(
                            (
                                team.roundEndsAt.getTime() -
                                now.getTime()
                            ) / 1000
                        )
                    );


                let existingImage = null;


                if (team.assignedImage) {

                    existingImage =
                        await Image.findOne({
                            imageId:
                                team.assignedImage
                        });

                }


                return res.json({

                    success: true,

                    message:
                        "Round already started",

                    teamId:
                        team.teamId,

                    imageId:
                        existingImage
                            ? existingImage.imageId
                            : null,

                    filename:
                        existingImage
                            ? existingImage.filename
                            : null,

                    roundStartedAt:
                        team.roundStartedAt,

                    roundEndsAt:
                        team.roundEndsAt,

                    remainingSeconds,

                    roundActive: true

                });

            }


            // ==========================================
            // ROUND HAS EXPIRED
            // ==========================================

            team.roundActive = false;

            await team.save();

        }


        // ==========================================
        // MARK ALL EXPIRED ROUNDS INACTIVE
        // ==========================================

        const now = new Date();


        await Team.updateMany(

            {
                roundActive: true,

                roundEndsAt: {
                    $lte: now
                }
            },

            {
                $set: {
                    roundActive: false
                }
            }

        );


        // ==========================================
        // FIND IMAGES CURRENTLY IN USE
        // ==========================================

        const assignedTeams =
            await Team.find(

                {
                    assignedImage: {
                        $ne: null
                    },

                    roundActive: true
                },

                {
                    assignedImage: 1
                }

            );


        const usedImageIds =
            assignedTeams
                .map(
                    team =>
                        team.assignedImage
                )
                .filter(Boolean);


        // ==========================================
        // FIND AVAILABLE IMAGES
        // ==========================================

        const images =
            await Image.find(

                {
                    imageId: {
                        $nin:
                            usedImageIds
                    }
                },

                {
                    imageId: 1,
                    filename: 1
                }

            );


        if (images.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "No competition images available"

            });

        }


        // ==========================================
        // SELECT RANDOM IMAGE
        // ==========================================

        const randomIndex =
            Math.floor(
                Math.random() *
                images.length
            );


        const selectedImage =
            images[randomIndex];


        // ==========================================
        // CREATE ROUND TIMER
        // ==========================================

        const startTime =
            new Date();


        const endTime =
            new Date(

                startTime.getTime() +
                ROUND_DURATION_SECONDS *
                1000

            );


        // ==========================================
        // SAVE ROUND
        // ==========================================

        team.assignedImage =
            selectedImage.imageId;

        team.roundStartedAt =
            startTime;

        team.roundEndsAt =
            endTime;

        team.roundActive =
            true;


        await team.save();


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            success: true,

            message:
                "Competition round started",

            teamId:
                team.teamId,

            imageId:
                selectedImage.imageId,

            filename:
                selectedImage.filename,

            roundStartedAt:
                startTime,

            roundEndsAt:
                endTime,

            remainingSeconds:
                ROUND_DURATION_SECONDS,

            roundActive:
                true

        });


    } catch (error) {

        console.error(
            "Start competition error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to start competition"

        });

    }

});


// ==========================================
// GET CURRENT ROUND STATUS
// ==========================================

router.get(
    "/status/:teamId",
    async (req, res) => {

        try {

            const { teamId } =
                req.params;


            const team =
                await Team.findOne({
                    teamId
                });


            if (!team) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Team not found"

                });

            }


            if (
                !team.roundStartedAt ||
                !team.roundEndsAt
            ) {

                return res.json({

                    success: true,

                    roundActive: false,

                    message:
                        "Round has not started"

                });

            }


            const now =
                new Date();


            const remainingSeconds =
                Math.max(

                    0,

                    Math.floor(

                        (
                            team.roundEndsAt.getTime() -
                            now.getTime()
                        ) / 1000

                    )

                );


            const isActive =
                remainingSeconds > 0;


            if (
                !isActive &&
                team.roundActive
            ) {

                team.roundActive =
                    false;

                await team.save();

            }


            res.json({

                success: true,

                roundActive:
                    isActive,

                roundStartedAt:
                    team.roundStartedAt,

                roundEndsAt:
                    team.roundEndsAt,

                remainingSeconds

            });


        } catch (error) {

            console.error(
                "Round status error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to get round status"

            });

        }

    }
);
// ==========================================
// CHECK QR STATUS FOR TEAM
// ==========================================

router.get("/qr-status/:teamId", async (req, res) => {

    try {

        const teamId =
            req.params.teamId.toUpperCase();

        const team =
            await Team.findOne({ teamId });

        if (!team) {

            return res.status(404).json({
                success: false,
                message: "Team not found"
            });

        }

        res.json({

            success: true,

            teamId: team.teamId,

            teamName: team.teamName,

            qrSent:
                team.qrSent === true,

            roomNumber:
                team.roomNumber || null

        });

    } catch (error) {

        console.error(
            "QR status error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to check QR status"

        });

    }

});


module.exports = router;