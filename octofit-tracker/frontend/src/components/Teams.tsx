import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };
type TeamsResponse = { teams: Team[] };

const loadTeams = () => getJson<TeamsResponse>('/api/teams');

export default function Teams() {
  return (
    <CapabilityCard<TeamsResponse>
      title="Teams"
      description="Manage teams and members."
      load={loadTeams}
      emptyMessage="No teams yet."
      isEmpty={({ teams }) => teams.length === 0}
      renderContent={({ teams }) => (
        <ul>
          {teams.map((team, index) => (
            <li key={`${team.name}-${index}`}>
              {team.name} — Members: {team.members.join(', ') || 'None'}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
