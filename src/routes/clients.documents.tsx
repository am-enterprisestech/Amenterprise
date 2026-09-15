import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { FileText, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/clients/documents")({
  head: () => ({
    meta: [
      { title: "Documents â€” AM Enterprises Client Portal" },
      { name: "description", content: "Download contracts, briefs, design files and deliverables shared with your account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Documents clientId={client.id} />}</PortalShell>,
});

interface Doc { id: string; name: string; description: string | null; file_type: string | null; file_size: number | null; url: string; created_at: string }

function size(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Documents({ clientId }: { clientId: string }) {
  const { rows, loading } = usePortalRows<Doc>("client_documents", clientId, { orderBy: "created_at" });

  return (
    <div>
      <PortalHeading title="Documents" subtitle={`${rows.length} file${rows.length === 1 ? "" : "s"} shared with you`} />
      {loading ? <EmptyState label="Loading documentsâ€¦" /> : rows.length === 0 ? <EmptyState label="No documents shared yet." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((d) => (
            <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
              className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
              <p className="font-semibold text-foreground">{d.name}</p>
              {d.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{[d.file_type, size(d.file_size)].filter(Boolean).join(" Â· ") || new Date(d.created_at).toLocaleDateString()}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
