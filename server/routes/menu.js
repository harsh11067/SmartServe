const express = require("express");

const MenuItem = require("../models/MenuItem");
const protect = require("../middleware/protect");
const authorise = require("../middleware/authorise");

const router = express.Router();

router.use(protect);

router.get("/", authorise("customer", "kitchen", "admin"), async (_req, res, next) => {
  try {
    const items = await MenuItem.find().populate("stall_id", "stall_name cuisine_type");
    return res.json(items);
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorise("admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", authorise("admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/availability", authorise("kitchen", "admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.is_available = typeof req.body.is_available === "boolean" ? req.body.is_available : !item.is_available;
    await item.save();
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authorise("admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.json({ message: "Menu item deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
