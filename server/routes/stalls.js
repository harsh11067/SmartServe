const express = require("express");

const FoodStall = require("../models/FoodStall");
const protect = require("../middleware/protect");
const authorise = require("../middleware/authorise");

const router = express.Router();

router.use(protect);

router.get("/", authorise("customer", "kitchen", "admin"), async (_req, res, next) => {
  try {
    const stalls = await FoodStall.find().populate("managed_by", "email role");
    return res.json(stalls);
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorise("admin"), async (req, res, next) => {
  try {
    const stall = await FoodStall.create(req.body);
    return res.status(201).json(stall);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", authorise("admin"), async (req, res, next) => {
  try {
    const stall = await FoodStall.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!stall) {
      return res.status(404).json({ message: "Food stall not found" });
    }

    return res.json(stall);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authorise("admin"), async (req, res, next) => {
  try {
    const stall = await FoodStall.findByIdAndDelete(req.params.id);
    if (!stall) {
      return res.status(404).json({ message: "Food stall not found" });
    }

    return res.json({ message: "Food stall deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
