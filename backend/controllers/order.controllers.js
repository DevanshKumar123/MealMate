import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount, userId } =
      req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.text ||
      !deliveryAddress.latitude == null ||
      !deliveryAddress.longitude == null
    ) {
      return res
        .status(400)
        .json({ message: "Send Complete Delivery Address" });
    }

    // Group items by shop
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shopId;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          return res.status(400).json({ message: "Shop Not Found" });
        }
        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );
        return {
          shop: shop._id,
          owner: shop.owner._id,
          subTotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );

    if (paymentMethod == "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      const newOrder = await Order.create({
        user: userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false,
      });
      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });
    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            createdAt: newOrder.createdAt,
            shopOrders: shopOrder,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment,
          });
        }
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    return res.status(500).json({ message: `Place Order Error ${error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status != "captured") {
      return res.status(400).json({ message: "Payment Not Captured" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order Not Found" });
    }
    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    const io = req.app.get("io");

    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            createdAt: order.createdAt,
            shopOrders: shopOrder,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
          });
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Verify Payment Order Error ${error}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    }

    if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        createdAt: order.createdAt,
        shopOrders: order.shopOrders.filter(
          (o) => o.owner._id.toString() === req.userId.toString()
        ),
        deliveryAddress: order.deliveryAddress,
        payment: order.payment,
      }));

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: `Get User Order Error ${error}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    let { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.find(
      (o) => String(o.shop) === String(shopId)
    );
    if (!shopOrder)
      return res.status(400).json({ message: "Shop Order Not Found" });

    if (status === "out of delivery") status = "out of delivery";

    shopOrder.status = status;
    let deliveryBoysPayload = [];

    const isOutDelivery = status === "out of delivery";

    if (isOutDelivery) {
      if (shopOrder.assignment) {
        const existingAssignment = await DeliveryAssignment.findById(
          shopOrder.assignment
        ).lean();
        if (
          existingAssignment &&
          Array.isArray(existingAssignment.brodcastedTo) &&
          existingAssignment.brodcastedTo.length
        ) {
          const users = await User.find({
            _id: { $in: existingAssignment.brodcastedTo },
          }).select("fullName mobile location socketId");
          availableBoys = users;

          deliveryBoysPayload = users.map((b) => ({
            id: b._id,
            fullName: b.fullName,
            longitude: b.location?.coordinates?.[0],
            latitude: b.location?.coordinates?.[1],
            mobile: b.mobile,
            socketId: b.socketId,
          }));
        } else {
          deliveryBoysPayload = [];
        }
      } else {
        const { latitude, longitude } = order.deliveryAddress || {};
        if (latitude == null || longitude == null) {
          order.markModified("shopOrders");
          await order.save();
          return res
            .status(400)
            .json({ message: "Order delivery coordinates missing" });
        }

        const nearByDeliveryBoys = await User.find({
          role: "deliveryBoy",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              // $maxDistance: 5000,
              $maxDistance: 5000000,
            },
          },
        }).select("fullName mobile location");

        if (!nearByDeliveryBoys || nearByDeliveryBoys.length === 0) {
          order.markModified("shopOrders");
          await order.save();
          return res.json({
            message:
              "Order Status Updated But There is No Nearby Delivery Boys",
            shopOrder,
            availableBoys: [],
          });
        }

        const nearByIds = nearByDeliveryBoys.map((b) => b._id);

        const activeAssignments = await DeliveryAssignment.find({
          $or: [
            { assignedTo: { $in: nearByIds } },
            { brodcastedTo: { $in: nearByIds } },
          ],
          status: { $ne: "completed" },
        });

        const busyIdSet = new Set();
        activeAssignments.forEach((a) => {
          if (a.assignedTo) busyIdSet.add(String(a.assignedTo));
          if (Array.isArray(a.brodcastedTo))
            a.brodcastedTo.forEach((id) => busyIdSet.add(String(id)));
        });

        const availableBoys = nearByDeliveryBoys.filter(
          (b) => !busyIdSet.has(String(b._id))
        );
        const candidates = availableBoys.map((b) => b._id);

        console.log("nearByDeliveryBoys:", nearByDeliveryBoys.length, "found");
        console.log("busyIds:", Array.from(busyIdSet));
        console.log(
          "availableBoys count:",
          availableBoys.length,
          "candidates:",
          candidates.length
        );

        if (candidates.length === 0) {
          order.markModified("shopOrders");
          await order.save();
          return res.json({
            message:
              "Order Status Updated But There is No Available Delivery Boys",
            shopOrder,
            availableBoys: [],
          });
        }

        const deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          shop: shopOrder.shop,
          shopOrderId: shopOrder._id,
          brodcastedTo: candidates,
          status: "brodcasted",
        });

        shopOrder.assignment = deliveryAssignment._id;

        deliveryBoysPayload = availableBoys.map((b) => ({
          id: b._id,
          fullName: b.fullName,
          longitude: b.location?.coordinates?.[0],
          latitude: b.location?.coordinates?.[1],
          mobile: b.mobile,
        }));
        await deliveryAssignment.populate("order");
        await deliveryAssignment.populate("shop");
      }

      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
              sentTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order?._id || null,
              shopName:
                deliveryAssignment.shop?.name ||
                deliveryAssignment.order?.shopOrders?.[0]?.shop?.name ||
                "Shop",
              deliveryAddress: deliveryAssignment.order?.deliveryAddress || {},
              items:
                shopOrder && shopOrder.shopOrderItems
                  ? shopOrder.shopOrderItems
                  : [],
              subTotal: shopOrder?.subTotal || 0,
            });
          }
        });
      }
    }

    order.markModified("shopOrders");
    await order.save();

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile"
    );
    await order.populate("user", "socketId");

    const updatedShopOrder = order.shopOrders.find(
      (o) => String(o.shop) === String(shopId)
    );

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment || null,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res
      .status(500)
      .json({ message: `Update Order Status Error ${error.message || error}` });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      brodcastedTo: { $in: [deliveryBoyId] },
      status: "brodcasted",
    })

      .populate({
        path: "order",
        populate: [
          {
            path: "shopOrders.shopOrderItems.item",
            select: "name image price",
          },
          { path: "shopOrders.shop", select: "name" },
        ],
      })
      .populate("shop");

    const formated = assignments.map((a) => {
      const shopOrder = a.order?.shopOrders?.find(
        (so) => String(so._id) === String(a.shopOrderId)
      );
      return {
        assignmentId: a._id,
        orderId: a.order?._id || null,
        shopName:
          a.shop?.name || a.order?.shopOrders?.[0]?.shop?.name || "Shop",
        deliveryAddress: a.order?.deliveryAddress || {},
        items:
          shopOrder && shopOrder.shopOrderItems ? shopOrder.shopOrderItems : [],
        subTotal: shopOrder?.subTotal || 0,
      };
    });
    return res.status(200).json(formated);
  } catch (error) {
    console.error("Get Assignment Error:", error);
    return res
      .status(500)
      .json({ message: `Get Assignment Error ${error.message || error}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" });
    }
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "Assignment is Expired" });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You are already assigned to another order" });
    }
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }
    let shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();
    await order.populate("shopOrders.assignedDeliveryBoy");

    return res.status(200).json({ message: "Order Accepted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Accept Order Error ${error.message || error}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" });
    }
    if (!assignment.order) {
      return res.status(400).json({ message: "Order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId)
    );
    if (!shopOrder) {
      return res.status(400).json({ message: "ShopOrder not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }
    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Current Order Error ${error.message || error}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `GetOrderById Error ${error.message || error}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(404).json({ message: "Enter Valid Order/ShopOrderId" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    await sendDeliveryOtpMail(order.user, otp);
    return res
      .status(200)
      .json({ message: `OTP send successfully to ${order?.user?.fullName}` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Delivery OTP Error ${error.message || error}` });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(404).json({ message: "Enter Valid Order/ShopOrderId" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/Expired Otp" });
    }
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.status(200).json({ message: "Order Delivered Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Verify Delivery OTP Error ${error.message || error}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);
    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();

    let todaysDeliveries = [];
    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy == deliveryBoyId &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
            todaysDeliveries.push(shopOrder)
        }
      });
    });

    let stats = {}
    todaysDeliveries.forEach(shopOrder => {
      const hour = new Date(shopOrder.deliveredAt).getHours()
      stats[hour] = (stats[hour] || 0) + 1
    })

    let formattedStats = Object.keys(stats).map(hour => ({
      hour: parseInt(hour),
      count: stats[hour]
    }))

    formattedStats.sort((a,b) => a.hour-b.hour)

    return res.status(200).json(formattedStats)

  } catch (error) {
    return res
      .status(500)
      .json({ message: `Todays Deliveries Error ${error.message || error}` });
  }
};
