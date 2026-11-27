import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, required: true },
  minutes: {
    type: Number,
    required: true,
    min: 1,
    max: 1440,
    validate: { validator: Number.isInteger, message: 'Activity minutes must be a whole number' },
  },
  points: { type: Number, required: true },
  occurredAt: { type: Date, required: true },
});

export const Activity = model('Activity', activitySchema);
