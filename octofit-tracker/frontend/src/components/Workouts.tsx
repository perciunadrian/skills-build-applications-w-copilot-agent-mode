import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; reason: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
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
