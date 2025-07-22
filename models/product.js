const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  img: { type: String, required: true }, // URL รูป
  category: { type: String }, // เช่น นม, ขนม ฯลฯ
  isActive: { type: Boolean, default: true } // ใช้ซ่อนสินค้าได้
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema,"product");

