import { useState } from "react";
import Badge from "./Badge.jsx";
import Panel from "./Panel.jsx";

const ITEMS_PER_PAGE = 10;

export default function Leaderboards({ data }) {
  const [teamPage, setTeamPage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);

  // 🔥 paginate helper
  const paginate = (items, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const totalPages = (items) =>
    Math.ceil((items?.length || 0) / ITEMS_PER_PAGE);

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* ================= TEAM LEADERBOARD ================= */}
      <Panel title="🏁 Team Leaderboard">
        <div className="w-full overflow-hidden">
          <table className="w-full text-sm">

            <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 text-left">#</th>
                <th>Crew</th>
                <th>Leader</th>

                <th className="text-center hidden sm:table-cell">GP</th>
                <th className="text-center hidden sm:table-cell">Duo</th>
                <th className="text-center hidden md:table-cell">Solo</th>
                <th className="text-center hidden md:table-cell">Rival</th>

                <th className="text-right">Pts</th>
              </tr>
            </thead>

            <tbody>
              {paginate(data.teams || [], teamPage).map((team) => (
                <tr
                  key={team._id}
                  className={`
                    border-b border-white/5 transition
                    hover:bg-white/5
                    ${team.rank === 1 && "bg-neonPink/5"}
                    ${team.rank === 2 && "bg-white/[0.03]"}
                    ${team.rank === 3 && "bg-yellow-500/5"}
                  `}
                >
                  <td className="py-3">
                    <Badge tone={team.rank <= 3 ? "pink" : "blue"}>
                      #{team.rank}
                    </Badge>
                  </td>

                  <td className="font-semibold text-white">
                    {team.crewName}
                  </td>

                  <td className="text-slate-300">
                    {team.leaderName || "—"}
                  </td>

                  <td className="text-center hidden sm:table-cell">
                    {team.breakdown?.grandPrix || 0}
                  </td>

                  <td className="text-center hidden sm:table-cell">
                    {team.breakdown?.duo || 0}
                  </td>

                  <td className="text-center hidden md:table-cell">
                    {team.breakdown?.solo || 0}
                  </td>

                  <td className="text-center hidden md:table-cell">
                    {team.breakdown?.rivalry || 0}
                  </td>

                  <td className="text-right font-bold text-neonBlue">
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {/* 🔽 TEAM PAGINATION */}
          <Pagination
            current={teamPage}
            total={totalPages(data.teams)}
            setPage={setTeamPage}
          />
        </div>
      </Panel>

      {/* ================= DRIVER LEADERBOARD ================= */}
      <Panel title="🔥 Top Drivers Rating">
        <div className="w-full overflow-hidden">
          <table className="w-full text-sm">

            <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 text-left">#</th>
                <th>Driver</th>
                <th className="hidden sm:table-cell">Team</th>

                <th className="text-center">Rating</th>

                <th className="hidden sm:table-cell text-center">Win%</th>
                <th className="hidden md:table-cell text-center">Avg</th>
                <th className="hidden md:table-cell text-center">Best</th>
                <th className="hidden lg:table-cell text-center">Races</th>
                <th className="hidden lg:table-cell text-center">Wins</th>
              </tr>
            </thead>

            <tbody>
              {paginate(data.drivers || [], driverPage).map((driver) => (
                <tr
                  key={driver._id}
                  className={`
                    border-b border-white/5 transition
                    hover:bg-white/5
                    ${driver.rank === 1 && "bg-yellow-500/5"}
                    ${driver.rank === 2 && "bg-white/[0.03]"}
                    ${driver.rank === 3 && "bg-orange-500/5"}
                  `}
                >
                  <td className="py-3">
                    <Badge tone={driver.rank <= 3 ? "purple" : "blue"}>
                      #{driver.rank}
                    </Badge>
                  </td>

                  <td className="font-semibold text-white">
                    {driver.alias}
                  </td>

                  <td className="text-slate-300 hidden sm:table-cell">
                    {driver.teamId?.crewName || "No Team"}
                  </td>

                  <td className="text-neonPink font-bold text-center">
                    {driver.ratingPoints}
                  </td>

                  <td className="text-center hidden sm:table-cell">
                    {driver.winRate}%
                  </td>

                  <td className="text-center hidden md:table-cell">
                    {driver.avgPosition || "-"}
                  </td>

                  <td className="text-yellow-400 text-center hidden md:table-cell">
                    {driver.bestPosition || "-"}
                  </td>

                  <td className="text-center hidden lg:table-cell">
                    {driver.racesPlayed || 0}
                  </td>

                  <td className="text-green-400 text-center hidden lg:table-cell">
                    {driver.wins || 0}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {/* 🔽 DRIVER PAGINATION */}
          <Pagination
            current={driverPage}
            total={totalPages(data.drivers)}
            setPage={setDriverPage}
          />
        </div>
      </Panel>

    </div>
  );
}


/* ================= PAGINATION ================= */
function Pagination({ current, total, setPage }) {
  if (total <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">

      {Array.from({ length: total }).map((_, i) => {
        const page = i + 1;

        return (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`px-3 py-1 rounded text-sm transition ${
              current === page
                ? "bg-neonPink text-black"
                : "border border-white/20 hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}