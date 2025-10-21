// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const {
      shippingInfo,
      orderedItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (
      !shippingInfo ||
      !orderedItems ||
      !paymentInfo ||
      itemsPrice === undefined ||
      taxPrice === undefined ||
      shippingPrice === undefined ||
      totalPrice === undefined
    ) {
      return next(new ErrorHandler(400, "All order fields are required"));
    }

    const orderData = {
      shippingInfo,
      orderedItems,
      user: req.user._id,
      paymentInfo,
      paidAt: new Date(),
      itemsPrice,
      taxPrice,
      totalPrice,
    };

    const newOrder = await createNewOrderRepo(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    next(err);
  }
};
