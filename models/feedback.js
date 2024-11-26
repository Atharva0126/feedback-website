
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Reference to the user
    feedback: { type: String, required: true }, // Feedback content
    createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;



