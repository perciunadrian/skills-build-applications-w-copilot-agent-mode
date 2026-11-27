import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: String,
  focus: { type: String, required: true },
  minutes: {
    type: Number,
    required: true,
    min: 1,
    max: 240,
    validate: { validator: Number.isInteger, message: 'Workout minutes must be a whole number' },
  },
  difficulty: { type: String, required: true },
});

export const Workout = model('Workout', workoutSchema);
