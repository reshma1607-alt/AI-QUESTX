const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
    {
        imageId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        filename: {
            type: String,
            required: true,
            trim: true
        },

        keywords: {
            type: [String],
            default: []
        },

        objects: {
            type: [String],
            default: []
        },

        scene: {
            type: [String],
            default: []
        },

        colors: {
            type: [String],
            default: []
        },

        details: {
            type: [String],
            default: []
        },

        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Image", imageSchema);