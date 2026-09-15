import * as Icons from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { useLiveList } from "@/lib/use-live-list";

type BadgeRow = { id: string; label: string; sublabel: string | null; icon: string };

function iconFor(name: string) {
  const key = name
    .split(/[-_\s]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const found =
    (Icons as unknown as Record<string, unknown>)[key] ??
    (Icons as unknown as Record<string, unknown>)[name];
  return (found as typeof ShieldCheck) ?? ShieldCheck;
}

export function TrustBar() {
  const { rows } = useLiveList<BadgeRow>("badges", { orderBy: { column: "sort_order" } });
  if (rows.length === 0) return null;
  const loop = [...rows, ...rows];

  return (
    <section className="border-b border-[#DCEAF5] bg-[#F5FAFF] py-5">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#526273]">
        Trusted by businesses across the UK, Pakistan and beyond
      </p>
      <div className="marquee-mask marquee-pause overflow-hidden">
        <div className="marquee-track flex w-max gap-3 px-4">
          {loop.map((b, i) => {
            const Icon = iconFor(b.icon);
            return (
              <div
                key={`${b.id}-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-[#DCEAF5] bg-white px-4 py-2 shadow-soft transition hover:border-[#2F8FFF]/30 hover:bg-[#EAF6FF]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#2F8FFF]" />
                <div>
                  <p className="whitespace-nowrap text-xs font-bold text-[#0B1726]">{b.label}</p>
                  {b.sublabel && (
                    <p className="whitespace-nowrap text-[10px] text-[#526273]">{b.sublabel}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
