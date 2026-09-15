import { createFileRoute } from "@tanstack/react-router";
import { StaffShell, StaffHeading, StaffEmpty } from "@/components/portal/StaffShell";
import { useStaffRows } from "@/lib/use-staff";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/staff/documents")({
  head: () => ({
    meta: [
      { title: "Resources — AYMOXI Team Portal" },
      { name: "description", content: "Guides, brand assets and documents shared with you by the team." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <StaffShell module="documents">{(staff) => <Docs staffId={staff.id} />}</StaffShell>,
});

interface Doc { id: string; name: string; description: string | null; file_type: string | null; url: string; created_at: string }

function Docs({ staffId }: { staffId: string }) {
  const { rows, loading } = useStaffRows<Doc>("staff_documents", staffId, { orderBy: "created_at" });

  return (
    <div>
      <StaffHeading title="Resources" subtitle={`${rows.length} file${rows.length === 1 ? "" : "s"} shared with you`} />
      {loading ? <StaffEmpty label="Loading resources…" /> : rows.length === 0 ? <StaffEmpty label="No resources shared yet." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((d) => (
            <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
              className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span>
                <Download className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <p className="mt-4 truncate text-sm font-bold text-foreground">{d.name}</p>
              {d.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>}
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d.file_type || "file"} · {new Date(d.created_at).toLocaleDateString()}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
