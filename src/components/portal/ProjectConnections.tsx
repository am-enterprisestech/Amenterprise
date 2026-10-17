import { useEffect, useState } from "react";
import { Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Member = {
  name: string;
  am_id: string | null;
  department: string | null;
  role_on_project: string | null;
  job_title: string | null;
  avatar_url: string | null;
};

type Client = {
  name: string;
  company: string | null;
  am_id?: string | null;
  avatar_url?: string | null;
};

/** Shows the team assigned to a project, and (for staff/admin) the client it belongs to. */
export function ProjectConnections({
  projectId,
  showClient = true,
}: {
  projectId: string;
  showClient?: boolean;
}) {
  const [team, setTeam] = useState<Member[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      // 1. Fetch team assignments
      try {
        const { data: assignments, error } = await supabase
          .from("project_assignments")
          .select(`
            role_on_project,
            department_slug,
            staff_members (
              name,
              am_id,
              department,
              job_title,
              avatar_url
            )
          `)
          .eq("project_id", projectId);

        if (!error && assignments && assignments.length > 0) {
          const members: Member[] = assignments
            .map((a: any) => {
              const s = a.staff_members;
              if (!s) return null;
              return {
                name: s.name || "Team Member",
                am_id: s.am_id ?? null,
                department: s.department ?? a.department_slug ?? null,
                role_on_project: a.role_on_project ?? null,
                job_title: s.job_title ?? null,
                avatar_url: s.avatar_url ?? null,
              };
            })
            .filter(Boolean) as Member[];

          if (active && members.length > 0) {
            setTeam(members);
          }
        } else {
          // Fallback: try RPC in case it's defined on some deployments
          const { data: rpcData } = await supabase.rpc("project_team", { _project: projectId });
          if (active && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
            setTeam(rpcData as Member[]);
          }
        }
      } catch {
        // Silent catch to preserve clean UI
      }

      // 2. Fetch client if needed
      if (showClient) {
        try {
          const { data: proj } = await supabase
            .from("projects")
            .select("client_id")
            .eq("id", projectId)
            .maybeSingle();

          if (proj?.client_id) {
            const { data: clientData } = await supabase
              .from("portal_clients")
              .select("name, company")
              .eq("id", proj.client_id)
              .maybeSingle();

            if (active && clientData) {
              setClient({
                name: clientData.name,
                company: clientData.company,
              });
            }
          }
        } catch {
          // Silent catch
        }
      }
    }

    if (projectId) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [projectId, showClient]);

  if (!team.length && !client) return null;

  return (
    <div className="mt-4 space-y-2.5 border-t border-[#ECEBE8] pt-3 text-xs">
      {client && (
        <p className="inline-flex items-center gap-2 text-[#85858D]">
          {client.avatar_url ? (
            <img src={client.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover border border-[#ECEBE8]" />
          ) : (
            <Building2 className="h-3.5 w-3.5 text-[#85BBD6]" />
          )}
          <span>Client:</span>
          <b className="font-semibold text-[#24262B]">{client.name}</b>
          {client.company && <span className="text-[#85858D]">· {client.company}</span>}
        </p>
      )}

      {team.length > 0 && (
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 font-semibold text-[#24262B]">
            <Users className="h-3.5 w-3.5 text-[#85BBD6]" />
            <span>Assigned Team</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {team.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ECEBE8] bg-[#FAFAF8] py-1 pl-1 pr-2.5 text-[#24262B]"
              >
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#E5F3FA] text-[10px] font-bold text-[#85BBD6]">
                    {m.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="font-medium">{m.name}</span>
                <span className="text-[11px] text-[#85858D]">
                  · {m.job_title || m.role_on_project || m.department || "Specialist"}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
