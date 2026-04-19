const express = require("express");

const SeatingTable = require("../models/SeatingTable");
const protect = require("../middleware/protect");
const authorise = require("../middleware/authorise");

const router = express.Router();

router.use(protect);

router.get("/", authorise("customer", "admin"), async (_req, res, next) => {
  try {
    const tables = await SeatingTable.find().sort({ table_number: 1 });
    return res.json(tables);
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorise("admin"), async (req, res, next) => {
  try {
    const table = await SeatingTable.create(req.body);
    return res.status(201).json(table);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", authorise("admin"), async (req, res, next) => {
  try {
    const table = await SeatingTable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!table) {
      return res.status(404).json({ message: "Seating table not found" });
    }

    return res.json(table);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authorise("admin"), async (req, res, next) => {
  try {
    const table = await SeatingTable.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Seating table not found" });
    }

    return res.json({ message: "Seating table deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
