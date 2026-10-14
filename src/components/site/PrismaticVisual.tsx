import { Activity, Layers3, Play, type LucideIcon } from "lucide-react";

export function PrismaticVisual({
  icon: Icon = Layers3,
  image,
  title,
  eyebrow = "Delivery system",
  status = "Build in motion",
}: {
  icon?: LucideIcon;
  image?: string | null;
  title: string;
  eyebrow?: string;
  status?: string;
}) {
  return (
    <div className="prism-scene" aria-label={`${title} visual`}> 
      <div className="prism-grid" aria-hidden="true" />
      <div className="prism-glow" aria-hidden="true" />

      <div className="prism-plane prism-plane-back" aria-hidden="true">
        <span className="prism-loader" />
        <span className="prism-micro-label">{eyebrow}</span>
      </div>

      <div className="prism-plane prism-plane-main">
        <div className="prism-media">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <div className="prism-icon-wrap">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <span className="prism-ring prism-ring-one" aria-hidden="true" />
              <span className="prism-ring prism-ring-two" aria-hidden="true" />
            </>
          )}
        </div>
        <div className="mt-6 w-full space-y-2" aria-hidden="true">
          <span className="block h-1.5 w-2/3 rounded-full bg-primary/25" />
          <span className="block h-1.5 w-full rounded-full bg-secondary" />
          <span className="block h-1.5 w-1/2 rounded-full bg-secondary" />
        </div>
      </div>

      <div className="prism-control">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live status</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
        </div>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 flex-[2] rounded-full bg-primary" />
          <span className="h-1.5 flex-1 rounded-full bg-primary/35" />
          <span className="h-1.5 flex-1 rounded-full bg-primary/15" />
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" /> {status}
        </p>
      </div>

      <div className="prism-float-mark" aria-hidden="true">
        {image ? <Play className="h-4 w-4 fill-current" /> : <Icon className="h-4 w-4" />}
      </div>
    </div>
  );
}