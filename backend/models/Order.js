// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    note: String,
    pickupTime: String,
    status: { type: String, default: "Pendiente" },
    items: [
      {
        productId: String,
        name: String,
        quantity: Number,
        unit: String,
        price: Number,
      },
    ],
    totalCLP: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paymentDate: { type: Date, default: null },

    // 👇 Nuevo campo
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
