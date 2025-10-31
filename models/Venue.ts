import mongoose, { Schema, models, model } from "mongoose";

const HourSchema = new Schema({
  day: { type: String, required: true },
  open: { type: String, required: true },
  close: { type: String, required: true },
});

const VenueSchema = new Schema(
  {
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    mapLink: {
      type: String,
      required: [true, "Map link is required"],
      trim: true,
    },
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
      set: (vals: string[]) => vals.map((v) => v.toLowerCase()),
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      required: [true, "Number of reviews is required"],
      min: 0,
    },
    hours: {
      type: [HourSchema],
      required: [true, "Hours are required"],
    },
  },
  { timestamps: true }
);

export default models.Venue || model("Venue", VenueSchema);
