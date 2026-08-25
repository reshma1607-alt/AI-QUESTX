const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        teamId: {
            type: String,
            required: true,
            index: true
        },

        imageId: {
            type: String,
            required: true
        },

        prompt: {
            type: String,
            required: true
        },

        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        elapsedSeconds: {
            type: Number,
            required: true,
            min: 0
        },

        isNewBest: {
            type: Boolean,
            default: false
        },

        attemptedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Attempt", attemptSchema);