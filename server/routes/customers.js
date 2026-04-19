const express = require("express");

const Customer = require("../models/Customer");
const protect = require("../middleware/protect");
const authorise = require("../middleware/authorise");

const router = express.Router();

router.use(protect);

router.get("/", authorise("admin"), async (_req, res, next) => {
  try {
    const customers = await Customer.find().populate("user_id", "email role");
    return res.json(customers);
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authorise("customer", "admin"), async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user_id: req.user.id }).populate("user_id", "email role");
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    return res.json(customer);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
