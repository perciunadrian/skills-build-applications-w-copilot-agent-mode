import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

const loadActivities = () => getJson<ActivitiesResponse>('/api/activities');

export default function Activities() {
  return (
    <CapabilityCard<ActivitiesResponse>
      title="Activities"
      description="Track student activity minutes and points."
      load={loadActivities}
      emptyMessage="No activities yet."
      isEmpty={({ activities }) => activities.length === 0}
      renderContent={({ activities }) => (
        <ul>
          {activities.map((activity, index) => (
            <li key={`${activity.type}-${index}`}>
              {activity.type}: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    />
  );
}
