// models/Survey.js
import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema({
  surID: { type: String, unique: true, required: true },
  store_info: {
    store_name: { type: String, required: true },
    store_number_address: { type: String },
    store_number_moo: { type: String },
    store_province: { type: String },
    store_district: { type: String },
    store_subdistrict: { type: String },
    store_postcode: { type: String },
    store_freezer: { type: String }, // มี/ไม่มี
    store_shelf: { type: String },   // มี/ไม่มี
    photo_store: { type: String },   // URL หรือ base64
    photo_freezer: { type: String },
    photo_shelf: { type: String },
    shop_size: { type: String },     // A-F
    special_type: [{ type: String }],// เช่น ธงฟ้า, ติดดาว
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }
    },
    permission: { type: String, default: "อนุญาต" }
  },
  products: [
    {
      product_id: { type: String },
      status: { type: String },
      priceBox: { type: Number },
      pricePack: { type: Number },
      priceCarton: { type: Number },
      
    }
  ],
  market_info: {
    reason: { type: String },
    demand: { type: String, enum: ["buy", "not_buy", ""] },
    contact: { type: String },
    phone: { type: String },
    interest_products: [
      {
        name: { type: String },
        qty: { type: Number }
      }
    ]
  },
  statusFMFR: { type: String },
  statusOMG: { type: String },
  user_id: { type: String  },
}, { timestamps: true });

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema, "surveyReport");
