import { useState } from "react";
import Badge from "../Badge.jsx";
import Panel from "../Panel.jsx";
import { api } from "../../api.js";

export function Eligibility({ drivers, refresh }) {
  const [loadingId, setLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const updateStatus = async (id, status) => {
    try {
      setLoadingId(id);
      setStatusMessage("");

      const res = await api.patch(`/admin/drivers/${id}/status`, {
        status
      });

      setStatusMessage(res.data.message || "Status updated.");
      refresh?.();
    } catch (err) {
      console.error(err);
      setStatusMessage(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoadingId(null);
    }
  };

  const getTone = (status) => {
    switch (status) {
      case "Banned":
      case "Disqualified":
        return "red";
      case "Restricted":
        return "yellow";
      case "Penalized":
        return "orange";
      default:
        return "green";
    }
  };

  return (
    <Panel title="Driver Eligibility">
      {statusMessage && (
        <div className="mb-4 rounded-lg border border-neonBlue/20 bg-neonBlue/10 px-4 py-3 text-sm text-neonBlue">
          {statusMessage}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {drivers.map((driver) => {
          const isDanger =
            driver.status === "Banned" ||
            driver.status === "Disqualified";

          const isLoading = loadingId === driver._id;

          return (
            <div
              key={driver._id}
              className={`p-4 rounded-xl border transition-all
                ${
                  isDanger
                    ? "border-red-500/40 bg-red-500/10"
                    : driver.status === "Penalized"
                    ? "border-orange-500/40 bg-orange-500/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">
                    {driver.alias}
                  </p>
                  <p className="text-xs text-slate-400">
                    {driver.teamId?.crewName} / {driver.role}
                  </p>
                </div>

                <Badge tone={getTone(driver.status)}>
                  {driver.status || "Eligible"}
                </Badge>
              </div>

              {driver.status === "Penalized" && (
                <p className="mt-2 text-xs text-orange-400">
                  ⚠ Penalty applied (points deducted)
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  disabled={isLoading}
                  onClick={() => updateStatus(driver._id, "Eligible")}
                  className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs disabled:opacity-40"
                >
                  {isLoading ? "..." : "Reset"}
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => updateStatus(driver._id, "Restricted")}
                  className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs disabled:opacity-40"
                >
                  Restrict
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => updateStatus(driver._id, "Penalized")}
                  className="px-3 py-1 rounded bg-orange-500/20 text-orange-400 text-xs disabled:opacity-40"
                >
                  Penalty
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => updateStatus(driver._id, "Disqualified")}
                  className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-xs disabled:opacity-40"
                >
                  DQ
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => updateStatus(driver._id, "Banned")}
                  className="px-3 py-1 rounded bg-red-600/30 text-red-500 text-xs font-semibold disabled:opacity-40"
                >
                  Ban
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
