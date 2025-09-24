const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    },
    {
        timestamps: true,
    }
);

const tenantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, required: true }, // dynamic, no enum restriction
        teams: [teamSchema], // embedded teams
    },
    {
        timestamps: true,
    }
);

const tenantModel = mongoose.model("Tenant", tenantSchema);

module.exports = tenantModel;
