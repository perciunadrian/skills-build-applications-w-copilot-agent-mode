import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

const loadLeaderboard = () => getJson<LeaderboardResponse>('/api/leaderboard');

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      load={loadLeaderboard}
      emptyMessage="No leaderboard scores yet."
      isEmpty={({ leaderboard }) => leaderboard.length === 0}
      renderContent={({ leaderboard }) => (
        <ol>
          {leaderboard.map((entry) => (
            <li key={entry.rank}>
              {entry.teamName}: {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    />
  );
}
