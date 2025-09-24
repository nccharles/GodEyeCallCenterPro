const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema(
    {
        id: { type: String, required: false }, // Google sub or internal ID
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 200,
            unique: true,
        },
        picture: { type: String },

        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },

        role: {
            type: String,
            enum: ["ADMIN", "AGENT", "USER"],
            default: "USER",
            required: true,
        },
        isAvailable: { type: Boolean, default: true },
        onCall: { type: Boolean, default: false },

        password: { type: String, minlength: 3, maxlength: 1024 },
        first_name: { type: String },
        last_name: { type: String },
    },
    {
        timestamps: true,
    }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
