import { useEffect, useState } from "react";
import { Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Member = { name: string; am_id: string | null; department: string | null; role_on_project: string | null; job_title: string | null; avatar_url: string | null };
type Client = { name: string; company: string | null; am_id: string | null; avatar_url: string | null };

/** Shows the team assigned to a project, and (for staff/admin) the client it belongs to. */
export function ProjectConnections({ projectId, showClient = true }: { projectId: string; showClient?: boolean }) {
  const [team, setTeam] = useState<Member[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  useEffect(() => {
    supabase.rpc("project_team", { _project: projectId }).then(({ data }) => setTeam((data as Member[]) ?? []));
    if (showClient) supabase.rpc("project_client", { _project: projectId }).then(({ data }) => setClient(((data as Client[]) ?? [])[0] ?? null));
  }, [projectId, showClient]);
  if (!team.length && !client) return null;
  return (
    <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
      {client && (
        <p className="inline-flex items-center gap-1.5 text-muted-foreground">{client.avatar_url ? <img src={client.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" /> : <Building2 className="h-3.5 w-3.5" />} Client: <b className="text-foreground">{client.name}</b>{client.company ? ` · ${client.company}` : ""}{client.am_id ? ` · ${client.am_id}` : ""}</p>
      )}
      {team.length > 0 && (
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1.5 font-bold text-foreground"><Users className="h-3.5 w-3.5" /> Project team</p>
          <div className="flex flex-wrap gap-1.5">
            {team.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pl-1 pr-2.5 text-foreground/80">{m.avatar_url ? <img src={m.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{m.name.slice(0, 1)}</span>}
                {m.name} <span className="text-muted-foreground">· {m.job_title || m.role_on_project || m.department || "team"}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
