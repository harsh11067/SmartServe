const express = require("express");

const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const protect = require("../middleware/protect");
const authorise = require("../middleware/authorise");

const router = express.Router();

router.use(protect);

router.get("/", authorise("customer", "admin"), async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const payments = await Payment.find().populate("order_id");
      return res.json(payments);
    }

    const customer = await Customer.findOne({ user_id: req.user.id });
    const orders = await Order.find({ customer_id: customer ? customer._id : null }).select("_id");
    const payments = await Payment.find({ order_id: { $in: orders.map((order) => order._id) } }).populate("order_id");
    return res.json(payments);
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorise("customer", "admin"), async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    return res.status(201).json(payment);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
