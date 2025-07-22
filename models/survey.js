import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema({
  // ✅ ข้อมูลร้าน (Step 1)
  store_info: {
    store_name: { type: String, required: true },
    store_number_address: { type: String },
    store_number_moo: { type: String },
    store_province: { type: String },
    store_district: { type: String },
    store_subdistrict: { type: String },
    store_freezer: { type: String },
    store_shelf: { type: String },
    photo_store: { type: String },
    photo_freezer: { type: String },
    photo_shelf: { type: String }, // path หรือ URL
    shop_size: { type: String }, // A-F
    special_type: [{ type: String }], // ร้านธงฟ้า, ร้านติดดาว
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
   location_address:{type:String} ,
    permission:{type:String}
  },

  // ✅ ข้อมูลสินค้า (Step 2)
  products: [
    {
      product_id: { type: String }, // หรือชื่อสินค้า
      name: { type: String },
      size: { type: String },
      brand: { type: String },
      owner: { type: String },
      category: { type: String },
      flavor: { type: String },
      status: { type: String, enum: ["available", "out_of_stock", "discontinued", "never_sold", ""] },
      priceBox: { type: Number },
      pricePack: { type: Number },
      priceCarton: { type: Number }
    }
  ],

  // ✅ ข้อมูลเชิงการตลาด (Step 3)
  market_info: {
    reason: { type: String }, // ที่มาของสินค้า
    demand: { type: String, enum: ["buy", "not_buy", ""] }, // ความต้องการซื้อ
    contact: { type: String },
    phone: { type: String },
    interest_products: [
      {
        name: { type: String },
        qty: { type: Number }
      }
    ]
  },

  // ✅ Meta Info
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // คนคีย์ข้อมูล
  status: { type: String, enum: ["completed", "pending"], default: "pending" }
}, { timestamps: true });

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema, "surveyReport");
