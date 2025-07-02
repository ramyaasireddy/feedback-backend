const express = require("express");
const jwt = require("jsonwebtoken");
const Feedback = require("../models/Feedback");

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

router.post("/submit", authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.create({
      userId: req.user.userId,
      feedbackText: req.body.feedbackText,
      formVersion: req.body.formVersion || "v1",
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/all", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  try {
    const feedbacks = await Feedback.find().populate("userId", "name email");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
