"use client";

export default function RentalCardAuditTrail({ statusLogs }) {
  if (!statusLogs || statusLogs.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl bg-paper/40 p-3.5 border border-line/50 text-xs">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 font-semibold block mb-2">
        Rekam Jejak Status (Audit Trail)
      </span>
      <div className="space-y-1.5">
        {statusLogs.map((log, idx) => (
          <div key={idx} className="flex items-start justify-between gap-2 text-ink/70">
            <div>
              <strong className="text-ink">[{log.status}]</strong> {log.notes}
              <span className="text-ink/40 ml-1">({log.changed_by})</span>
            </div>
            <span className="font-mono text-[10px] text-ink/40 shrink-0">
              {log.created_at
                ? new Date(log.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
