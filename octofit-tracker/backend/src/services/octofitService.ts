import { Activity, Team, User, Workout } from '../models/index.js';

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    !isObjectId(userId) ||
    !isObjectId(teamId) ||
    typeof type !== 'string' ||
    type.trim().length === 0 ||
    typeof minutes !== 'number' ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 1440
  ) {
    throw Object.assign(new Error('Activity requires valid userId, teamId, type, and minutes'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const body = input as Record<string, unknown>;
  const { name, mascot } = body;
  if (typeof name !== 'string' || name.trim().length === 0 || typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw Object.assign(new Error('Team requires a name and mascot'), { status: 400 });
  }

  if (body.members !== undefined && !Array.isArray(body.members)) {
    throw Object.assign(new Error('Team members must be an array of user IDs'), { status: 400 });
  }
  const memberIds: string[] = [];
  for (const memberId of (body.members ?? []) as unknown[]) {
    if (!isObjectId(memberId)) {
      throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
    }
    memberIds.push(memberId);
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  const existingMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id').lean();
  if (existingMembers.length !== uniqueMemberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const workouts = await Workout.find().lean();
  const goal = user.fitnessGoal.trim().toLowerCase();
  const goalMatch = workouts.find((workout) => workout.focus.toLowerCase() === goal);
  if (goalMatch) {
    return [{ ...goalMatch, reason: `Matches your ${user.fitnessGoal} fitness goal.` }];
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  if (!recentActivity) return [];

  const activityType = recentActivity.type.trim().toLowerCase();
  const activityFocus = ['run', 'cycle', 'walk'].includes(activityType) ? 'endurance' : activityType;
  const activityMatch = workouts.find((workout) => workout.focus.toLowerCase() === activityFocus);
  if (!activityMatch) return [];

  return [{ ...activityMatch, reason: `Matches your recent ${recentActivity.type} activity.` }];
}

export { User };
