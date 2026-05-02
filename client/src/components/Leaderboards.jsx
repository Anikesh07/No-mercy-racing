import Badge from "./Badge.jsx";
import Panel from "./Panel.jsx";

export default function Leaderboards({ data }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Team Leaderboard">
        <div className="table-scroll">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3">Rank</th>
                <th>Crew</th>
                <th>Leader</th>
                <th className="text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {data.teams?.map((team) => (
                <tr key={team._id} className="border-t border-white/10">
                  <td className="py-3"><Badge tone={team.rank <= 3 ? "pink" : "blue"}>#{team.rank}</Badge></td>
                  <td className="font-semibold">{team.crewName}</td>
                  <td className="text-slate-300">{team.leaderName}</td>
                  <td className="text-right text-neonBlue">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Top Drivers Rating">
        <div className="table-scroll">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3">Rank</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Rating</th>
                <th>Win %</th>
                <th>Avg Pos</th>
              </tr>
            </thead>
            <tbody>
              {data.drivers?.slice(0, 12).map((driver) => (
                <tr key={driver._id} className="border-t border-white/10">
                  <td className="py-3"><Badge tone={driver.rank <= 3 ? "purple" : "blue"}>#{driver.rank}</Badge></td>
                  <td className="font-semibold">{driver.alias}</td>
                  <td className="text-slate-300">{driver.teamId?.crewName || "Pending"}</td>
                  <td className="text-neonPink">{driver.ratingPoints}</td>
                  <td>{driver.winRate}%</td>
                  <td>{driver.avgPosition || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
