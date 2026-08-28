const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        teamName: {
            type: String,
            required: true,
            trim: true
        },

        assignedImage: {
            type: String,
            default: null
        },

        bestScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        bestScoreElapsedSeconds: {
            type: Number,
            default: null
        },

        bestScoreAchievedAt: {
            type: Date,
            default: null
        },

        attemptCount: {
            type: Number,
            default: 0
        },

        roundStartedAt: {
            type: Date,
            default: null
        },

        roundEndsAt: {
            type: Date,
            default: null
        },

        roundActive: {
            type: Boolean,
            default: false
        },
         roomNumber: {
            type: Number,
            default: null
        },
        systemNumber: {
    type: Number,
    default: null
},
        qrSent: {
    type: Boolean,
    default: false
}

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Team", teamSchema);