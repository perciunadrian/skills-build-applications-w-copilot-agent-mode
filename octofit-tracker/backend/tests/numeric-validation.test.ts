import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Activity, Workout } from '../src/models/index.js';
import { createActivity } from '../src/services/octofitService.js';

describe('fitness duration validation', () => {
  it('accepts whole-minute activities only within 1 to 1440 minutes', () => {
    const user = new mongoose.Types.ObjectId();
    const team = new mongoose.Types.ObjectId();
    const activity = (minutes: number) => new Activity({
      user,
      team,
      type: 'run',
      minutes,
      points: minutes,
      occurredAt: new Date(),
    });

    expect(activity(1).validateSync()).toBeUndefined();
    expect(activity(1440).validateSync()).toBeUndefined();
    expect(activity(0).validateSync()?.errors.minutes).toBeDefined();
    expect(activity(1441).validateSync()?.errors.minutes).toBeDefined();
    expect(activity(1.5).validateSync()?.errors.minutes).toBeDefined();
  });

  it('accepts whole-minute workouts only within 1 to 240 minutes', () => {
    const workout = (minutes: number) => new Workout({
      title: 'Intervals',
      focus: 'endurance',
      minutes,
      difficulty: 'moderate',
    });

    expect(workout(1).validateSync()).toBeUndefined();
    expect(workout(240).validateSync()).toBeUndefined();
    expect(workout(0).validateSync()?.errors.minutes).toBeDefined();
    expect(workout(241).validateSync()?.errors.minutes).toBeDefined();
    expect(workout(1.5).validateSync()?.errors.minutes).toBeDefined();
  });

  it('rejects fractional activity minutes as a client error', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    await expect(createActivity({ userId: id, teamId: id, type: 'run', minutes: 1.5 }))
      .rejects.toMatchObject({ status: 400 });
  });
});
