// models/user.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  user_password: { type: String, required: true },   // hash ก่อนเก็บ!
  user_first_name: { type: String, required: true },
  user_last_name: { type: String, required: true },
  user_tel: { type: String },
  role: { type: String, enum: ["admin", "member","customer"], default: "member" },
  Route:{type: String},
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema, "user");
