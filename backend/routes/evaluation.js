const express = require("express");
const Team = require("../models/Team");
const Image = require("../models/Image");
const Attempt = require("../models/Attempt");

const router = express.Router();


// ==========================================
// Normalize text
// ==========================================

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================
// Check whether concept exists in prompt
// ==========================================

function conceptMatches(prompt, concept) {

    const normalizedPrompt = normalizeText(prompt);
    const normalizedConcept = normalizeText(concept);

    if (!normalizedConcept) {
        return false;
    }

    // Exact phrase
    if (normalizedPrompt.includes(normalizedConcept)) {
        return true;
    }

    // Individual words
    const conceptWords = normalizedConcept.split(" ");

    const matchedWords = conceptWords.filter(word =>
        normalizedPrompt.includes(word)
    );

    // For a multi-word concept, require most words
    if (conceptWords.length > 1) {
        return matchedWords.length >= Math.ceil(
            conceptWords.length * 0.6
        );
    }

    return false;
}


// ==========================================
// Calculate category score
// ==========================================

function calculateCategoryScore(prompt, concepts, maxScore) {

    if (!Array.isArray(concepts) || concepts.length === 0) {
        return 0;
    }

    let matched = 0;

    for (const concept of concepts) {

        if (conceptMatches(prompt, concept)) {
            matched++;
        }
    }

    return Math.round(
        (matched / concepts.length) * maxScore
    );
}


// ==========================================
// Evaluate Prompt
// ==========================================

router.post("/evaluate", async (req, res) => {

    try {

        const { teamId, prompt } = req.body;


        // ------------------------------------------
        // Validate Team ID
        // ------------------------------------------

        if (!teamId) {

            return res.status(400).json({
                success: false,
                message: "Team ID is required"
            });
        }


        // ------------------------------------------
        // Validate Prompt
        // ------------------------------------------

        if (
            !prompt ||
            typeof prompt !== "string" ||
            prompt.trim().length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }


        // ------------------------------------------
        // Find Team
        // ------------------------------------------

        const team = await Team.findOne({
            teamId
        });

        if (!team) {

            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }


        // ------------------------------------------
// Check Round
// ------------------------------------------

if (
    !team.roundStartedAt ||
    !team.roundEndsAt ||
    !team.roundActive
) {

    return res.status(400).json({
        success: false,
        message: "Competition round is not active"
    });
}

        // ------------------------------------------
        // Server-controlled time
        // ------------------------------------------

        const now = new Date();

        const elapsedSeconds = Math.floor(
            (
                now.getTime() -
                team.roundStartedAt.getTime()
            ) / 1000
        );

        const remainingSeconds = Math.max(
            0,
            Math.floor(
                (
                    team.roundEndsAt.getTime() -
                    now.getTime()
                ) / 1000
            )
        );


        // ------------------------------------------
        // Time expired
        // ------------------------------------------

        if (now >= team.roundEndsAt) {

            team.roundActive = false;

            await team.save();

            return res.status(403).json({
                success: false,
                message: "Competition time has ended",
                remainingSeconds: 0
            });
        }


        // ------------------------------------------
        // Assigned Image
        // ------------------------------------------

        if (!team.assignedImage) {

            return res.status(400).json({
                success: false,
                message: "No image assigned to this team"
            });
        }


        // ------------------------------------------
        // Get hidden image criteria
        // ------------------------------------------

        const image = await Image.findOne({
            imageId: team.assignedImage
        });

        if (!image) {

            return res.status(404).json({
                success: false,
                message: "Assigned image not found"
            });
        }


        // ==========================================
        // CATEGORY SCORING
        // ==========================================

        // Objects → 40 points
        const objectScore = calculateCategoryScore(
            prompt,
            image.objects,
            40
        );


        // Scene → 25 points
        const sceneScore = calculateCategoryScore(
            prompt,
            image.scene,
            25
        );


        // Colors → 15 points
        const colorScore = calculateCategoryScore(
            prompt,
            image.colors,
            15
        );


        // Details → 10 points
        const detailScore = calculateCategoryScore(
            prompt,
            image.details,
            10
        );


        // General keywords → 10 points
        const keywordScore = calculateCategoryScore(
            prompt,
            image.keywords,
            10
        );


        // ------------------------------------------
        // Final score
        // ------------------------------------------

        let score =
            objectScore +
            sceneScore +
            colorScore +
            detailScore +
            keywordScore;


        score = Math.max(
            0,
            Math.min(100, score)
        );


        // ------------------------------------------
        // Update attempt count
        // ------------------------------------------

        team.attemptCount += 1;


        // ------------------------------------------
        // Check Best Score
        // ------------------------------------------

        const isNewBest =
            score > team.bestScore;


        if (isNewBest) {

            team.bestScore = score;

            team.bestScoreElapsedSeconds =
                elapsedSeconds;

            team.bestScoreAchievedAt =
                now;
        }


        await team.save();


        // ------------------------------------------
        // Save attempt
        // ------------------------------------------

        await Attempt.create({

            teamId: team.teamId,

            imageId: image.imageId,

            prompt: prompt.trim(),

            score: score,

            elapsedSeconds: elapsedSeconds,

            isNewBest: isNewBest
        });


        // ------------------------------------------
        // Safe response
        // ------------------------------------------

        res.json({

            success: true,

            score: score,

            bestScore: team.bestScore,

            bestScoreElapsedSeconds:
                team.bestScoreElapsedSeconds,

            isNewBest: isNewBest,

            attemptCount:
                team.attemptCount,

            elapsedSeconds:
                elapsedSeconds,

            remainingSeconds:
                remainingSeconds
        });


    } catch (error) {

        console.error(
            "Prompt evaluation error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to evaluate prompt"
        });
    }
});


module.exports = router;