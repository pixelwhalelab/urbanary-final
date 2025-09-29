import mongoose, { Schema, Document } from "mongoose";

interface DeviceInfo {
  ua?: string;
  browser?: any;
  os?: any;
  device?: any;
}

interface LocationInfo {
  country?: string;
  regionName?: string;
  city?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

export interface ComingSoonDoc extends Document {
  email: string;
  ip: string;
  mac: string;
  device?: DeviceInfo;
  location?: LocationInfo;
  createdAt: Date;
}

const ComingSoonSchema = new Schema<ComingSoonDoc>(
  {
    email: { type: String, required: true },
    ip: { type: String },
    mac: { type: String },
    device: { type: Schema.Types.Mixed },
    location: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.ComingSoonData ||
  mongoose.model<ComingSoonDoc>("ComingSoonData", ComingSoonSchema);
