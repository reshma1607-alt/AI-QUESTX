const express = require("express");
const Image = require("../models/Image");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Add a competition image
router.post("/create",adminAuth, async (req, res) => {
    try {
        const {
            imageId,
            filename,
            keywords,
            description
        } = req.body;

        // Validate required fields
        if (
            !imageId ||
            !filename ||
            !Array.isArray(keywords) ||
            keywords.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "imageId, filename and keywords are required"
            });
        }

        // Check if image already exists
        const existingImage = await Image.findOne({ imageId });

        if (existingImage) {
            return res.status(409).json({
                success: false,
                message: "Image ID already exists"
            });
        }

        // Create image
        const image = await Image.create({
            imageId,
            filename,
            keywords,
            description: description || ""
        });

        res.status(201).json({
            success: true,
            message: "Image added successfully",
            imageId: image.imageId,
            filename: image.filename
        });

    } catch (error) {
        console.error("Create image error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// Update image criteria
router.put("/:imageId",adminAuth, async (req, res) => {
    try {
        const { imageId } = req.params;

        const {
            keywords,
            objects,
            scene,
            colors,
            details,
            description
        } = req.body;

        const image = await Image.findOne({ imageId });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        if (keywords !== undefined) {
            image.keywords = keywords;
        }

        if (objects !== undefined) {
            image.objects = objects;
        }

        if (scene !== undefined) {
            image.scene = scene;
        }

        if (colors !== undefined) {
            image.colors = colors;
        }

        if (details !== undefined) {
            image.details = details;
        }

        if (description !== undefined) {
            image.description = description;
        }

        await image.save();

        res.json({
            success: true,
            message: "Image criteria updated successfully",
            imageId: image.imageId
        });

    } catch (error) {
        console.error("Update image error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update image"
        });
    }
});

module.exports = router;