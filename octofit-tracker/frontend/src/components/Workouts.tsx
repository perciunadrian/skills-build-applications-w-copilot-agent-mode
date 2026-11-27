import { CapabilityCard } from './CapabilityCard.js';
import { getJson, workoutSuggestionsPath } from '../api/client.js';

type WorkoutSuggestion = { title: string; reason: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

const loadWorkouts = () => getJson<WorkoutResponse>(workoutSuggestionsPath('mona@example.com'));

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      load={loadWorkouts}
      emptyMessage="No workout suggestions yet."
      isEmpty={({ suggestions }) => suggestions.length === 0}
      renderContent={({ suggestions }) => (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.title}-${index}`}>
              {suggestion.title}: {suggestion.reason}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
