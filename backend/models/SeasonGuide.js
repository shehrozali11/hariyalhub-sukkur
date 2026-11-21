const mongoose = require('mongoose');

const seasonGuideSchema = new mongoose.Schema(
  {
    season: { type: String, required: true },
    tempRange: { type: String, required: true },
    recommendedPlants: { type: String, required: true },
    instructions: [{ type: String, required: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SeasonGuide', seasonGuideSchema);
