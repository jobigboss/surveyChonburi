import mongoose from "mongoose";

const ProvinceSchema = new mongoose.Schema({
  postcode: { type: String, required: true },
  sub_district: { type: String, required: true },  // ตำบล/แขวง
  district: { type: String, required: true },      // อำเภอ/เขต
  province: { type: String, required: true },
  Route:{type: String},
}, { timestamps: true });

export default mongoose.models.Province || mongoose.model("Province", ProvinceSchema, "province");
