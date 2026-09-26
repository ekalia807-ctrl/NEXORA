"use client";

function renderMethodBadge(method) {
  if (method === "GET") {
    return (
      <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#93C5FD] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
        GET
      </span>
    );
  }
  if (method === "POST") {
    return (
      <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#86EFAC] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
        POST
      </span>
    );
  }
  if (method === "PUT") {
    return (
      <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#FDE047] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
        PUT
      </span>
    );
  }
  if (method === "DELETE") {
    return (
      <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#FCA5A5] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
        DELETE
      </span>
    );
  }
  return null;
}

export default function EndpointSection({
  title,
  badgeUri,
  icon,
  endpoints,
  results,
  loading,
  onTestEndpoint,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-zinc-950 bg-[#FAF9F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-10">
      <div className="flex items-center gap-3 border-b-2 border-zinc-950 bg-[#F4F2EA] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none font-bold text-zinc-950">{icon}</span>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 font-display">
            {title}
          </h2>
        </div>
        <span className="rounded-full border-2 border-zinc-950 bg-[#67E8F9] px-3 py-0.5 text-xs sm:text-sm font-mono font-bold text-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          {badgeUri}
        </span>
      </div>

      <div className="divide-y-2 divide-zinc-950">
        {endpoints.map((ep) => {
          const res = results[ep.id];
          const isLoad = loading[ep.id];

          return (
            <div key={ep.id} className="p-4 sm:p-5 hover:bg-white/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  {renderMethodBadge(ep.method)}

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-base font-bold font-mono text-zinc-950">
                        {ep.path}
                      </code>
                      {res && (
                        <span
                          className={`rounded border px-2 py-0.5 text-[11px] font-mono font-bold ${
                            res.success
                              ? "border-emerald-600 bg-emerald-100 text-emerald-800"
                              : "border-red-600 bg-red-100 text-red-800"
                          }`}
                        >
                          HTTP {res.status} ({res.duration}ms)
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">
                      {ep.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start pl-16 md:pl-0">
                  <button
                    onClick={() => onTestEndpoint(ep.id, ep.method, ep.path)}
                    disabled={isLoad}
                    className={`rounded-lg border-2 border-zinc-950 px-3.5 py-1.5 text-xs font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                      isLoad
                        ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                        : "bg-white hover:bg-zinc-100 text-zinc-950"
                    }`}
                  >
                    {isLoad ? "Menguji..." : "Uji Endpoint"}
                  </button>
                </div>
              </div>

              {res && (
                <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-900 p-4 text-zinc-100 font-mono text-xs overflow-x-auto">
                  <div className="flex items-center justify-between border-b border-zinc-700 pb-2 mb-2">
                    <span className="text-zinc-400">Response Payload • {res.timestamp}</span>
                    <span className={res.success ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      Status: {res.status} {res.statusText}
                    </span>
                  </div>
                  <pre className="text-emerald-300 whitespace-pre-wrap leading-tight">
                    {JSON.stringify(res.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
