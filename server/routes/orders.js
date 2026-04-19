const express = require("express");
const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const MenuItem = require("../models/MenuItem");
const protect = require("../middleware/protect");
const authorise = require("../middleware/authorise");

const router = express.Router();

router.use(protect);

const attachOrderItems = async (orders, stallId) => {
  if (!orders.length) {
    return [];
  }

  const orderIds = orders.map((order) => order._id);
  const itemQuery = { order_id: { $in: orderIds } };

  if (stallId) {
    itemQuery.stall_id = stallId;
  }

  const orderItems = await OrderItem.find(itemQuery)
    .populate({
      path: "menu_item_id",
      populate: {
        path: "stall_id",
        select: "stall_name cuisine_type",
      },
    })
    .lean();

  const itemsByOrderId = new Map();

  for (const item of orderItems) {
    const key = item.order_id.toString();
    const existing = itemsByOrderId.get(key) || [];
    existing.push(item);
    itemsByOrderId.set(key, existing);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order._id.toString()) || [],
  }));
};

// Get orders for current customer
router.get("/my", authorise("customer"), async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user_id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }
    
    const orders = await Order.find({ customer_id: customer._id })
      .populate("customer_id")
      .populate("table_id")
      .lean()
      .sort({ order_date: -1 });
    return res.json(await attachOrderItems(orders));
  } catch (error) {
    return next(error);
  }
});

// Get orders for current kitchen stall
router.get("/stall", authorise("kitchen", "admin"), async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const orders = await Order.find({
        status: { $in: ["pending", "preparing"] }
      })
        .populate("customer_id")
        .populate("table_id")
        .sort({ order_date: -1 })
        .lean();
      return res.json(await attachOrderItems(orders));
    }

    const stallId = req.user.stall_id;
    if (!stallId) {
      return res.json([]);
    }

    const orderItems = await OrderItem.find({ stall_id: stallId })
      .populate("order_id")
      .populate("menu_item_id");
    
    const orderIds = [...new Set(orderItems.map(item => item.order_id?._id?.toString()).filter(Boolean))];
    const orders = await Order.find({ 
      _id: { $in: orderIds },
      status: { $in: ["pending", "preparing"] }
    })
      .populate("customer_id")
      .populate("table_id")
      .sort({ order_date: -1 })
      .lean();

    return res.json(await attachOrderItems(orders, stallId));
  } catch (error) {
    return next(error);
  }
});

// Get all orders (admin only)
router.get("/all", authorise("admin"), async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("customer_id")
      .populate("table_id")
      .sort({ order_date: -1 })
      .lean();
    return res.json(await attachOrderItems(orders));
  } catch (error) {
    return next(error);
  }
});

router.get("/", authorise("customer", "kitchen", "admin"), async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const orders = await Order.find()
        .populate("customer_id")
        .populate("table_id")
        .sort({ created_at: -1 })
        .lean();
      return res.json(await attachOrderItems(orders));
    }

    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ user_id: req.user.id });
      const orders = await Order.find({ customer_id: customer ? customer._id : null })
        .populate("customer_id")
        .populate("table_id")
        .sort({ created_at: -1 })
        .lean();
      return res.json(await attachOrderItems(orders));
    }

    const orderItems = await OrderItem.find({ stall_id: req.user.stall_id }).select("order_id");
    const orderIds = orderItems.map((item) => item.order_id);
    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("customer_id")
      .populate("table_id")
      .sort({ created_at: -1 })
      .lean();
    return res.json(await attachOrderItems(orders, req.user.stall_id));
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorise("customer", "admin"), async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer_id, table_id, items } = req.body;

    if (!Array.isArray(items) || !items.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "items are required" });
    }

    let customerId = customer_id;
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ user_id: req.user.id }).session(session);
      if (!customer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Customer profile not found" });
      }
      customerId = customer._id;
    }

    let subtotalAmount = 0;
    const preparedItems = [];

    for (const entry of items) {
      const menuItem = await MenuItem.findById(entry.menu_item_id).session(session);
      if (!menuItem) {
        throw new Error("Menu item not found");
      }

      const quantity = Number(entry.quantity || 1);
      const unitPrice = Number(menuItem.price);
      const subtotal = unitPrice * quantity;

      subtotalAmount += subtotal;
      preparedItems.push({
        menu_item_id: menuItem._id,
        stall_id: menuItem.stall_id,
        quantity,
        unit_price: unitPrice,
        subtotal
      });
    }

    const totalAmount = Number((subtotalAmount * 1.05).toFixed(2));

    const [order] = await Order.create(
      [
        {
          customer_id: customerId,
          table_id: table_id || null,
          total_amount: totalAmount
        }
      ],
      { session }
    );

    await OrderItem.insertMany(
      preparedItems.map((item) => ({
        order_id: order._id,
        menu_item_id: item.menu_item_id,
        stall_id: item.stall_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      })),
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

router.patch("/:id/status", authorise("kitchen", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["preparing", "ready", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role === "kitchen") {
      const linkedItem = await OrderItem.findOne({
        order_id: order._id,
        stall_id: req.user.stall_id
      });

      if (!linkedItem) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    order.status = status;
    await order.save();
    return res.json(order);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
