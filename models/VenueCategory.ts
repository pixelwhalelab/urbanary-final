import mongoose, { Schema, models, model } from "mongoose";

const VenueCategorySchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default models.VenueCategory ||
  model("VenueCategory", VenueCategorySchema);
