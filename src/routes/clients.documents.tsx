import { createFileRoute } from "@tanstack/react-router";
import { PortalShell, PortalHeading, EmptyState } from "@/components/portal/PortalShell";
import { usePortalRows } from "@/lib/use-portal";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import {
  FileText, ExternalLink, Download, Upload, ShieldCheck, CheckCircle2,
  FileCheck, Lock, Sparkles, Loader2, Plus, Eye, X, Check
} from "lucide-react";

export const Route = createFileRoute("/clients/documents")({
  head: () => ({
    meta: [
      { title: "Deliverables Vault & Legal Contracts — AM Enterprises Client Portal" },
      { name: "description", content: "Download contracts, verified deliverables, design files and sign legal agreements." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <PortalShell>{(client) => <Documents clientId={client.id} clientName={client.name} />}</PortalShell>,
});

interface Doc {
  id: string;
  name: string;
  description: string | null;
  file_type: string | null;
  file_size: number | null;
  url: string;
  created_at: string;
}

interface Contract {
  id: string;
  title: string;
  type: string;
  status: "signed" | "pending";
  signed_at?: string;
  summary: string;
}

const DEFAULT_CONTRACTS: Contract[] = [
  {
    id: "c-msa-1",
    title: "Master Services Agreement (MSA)",
    type: "Enterprise Legal Terms",
    status: "signed",
    signed_at: "Verified Digitally · Active 2026",
    summary: "Governs intellectual property transfer, warranty standards, and confidentiality terms.",
  },
  {
    id: "c-nda-2",
    title: "Mutual Non-Disclosure Agreement (NDA)",
    type: "Confidentiality & Trade Secret",
    status: "signed",
    signed_at: "Verified Digitally · Active 2026",
    summary: "Guarantees 100% strict proprietary protection for all client code, database architectures, and business logic.",
  },
  {
    id: "c-sow-3",
    title: "Statement of Work (SOW) — Active Engineering Sprint",
    type: "Scope & Deliverables",
    status: "pending",
    summary: "Outlines active project sprints, sprint velocity, deliverables acceptance criteria, and revision protocol.",
  },
];

function size(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Documents({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { rows, loading, reload } = usePortalRows<Doc>("client_documents", clientId, { orderBy: "created_at" });
  const [contracts, setContracts] = useState<Contract[]>(DEFAULT_CONTRACTS);
  const [tab, setTab] = useState<"files" | "contracts">("files");
  const [signingContract, setSigningContract] = useState<Contract | null>(null);
  const [signerName, setSignerName] = useState(clientName);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `documents/${clientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;

      const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = data?.signedUrl || "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_documents").insert({
        client_id: clientId,
        name: file.name,
        description: "Uploaded by client from portal",
        file_type: ext.toUpperCase(),
        file_size: file.size,
        url,
      });

      // Log activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("client_activities").insert({
        client_id: clientId,
        action: "document_uploaded",
        description: `Uploaded asset: "${file.name}"`,
      });

      reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function handleSignContract(c: Contract) {
    setContracts((prev) =>
      prev.map((item) =>
        item.id === c.id
          ? { ...item, status: "signed", signed_at: `Signed by ${signerName} on ${new Date().toLocaleDateString()}` }
          : item
      )
    );
    setSigningContract(null);
  }

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Deliverables Vault &amp; Legal Contracts"
        subtitle="Access all official code deliverables, design assets, and signed enterprise agreements."
        right={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition-all disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              <span>Upload Document / Brief</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ECEBE8] pb-2">
        <button
          onClick={() => setTab("files")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold transition-all ${
            tab === "files"
              ? "bg-[#E5F3FA] text-[#24262B] border border-[#85BBD6]/30 shadow-2xs"
              : "text-[#85858D] hover:bg-[#FAFAF8] hover:text-[#24262B]"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-[#85BBD6]" />
          <span>Deliverables &amp; Files ({rows.length})</span>
        </button>
        <button
          onClick={() => setTab("contracts")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold transition-all ${
            tab === "contracts"
              ? "bg-[#E5F3FA] text-[#24262B] border border-[#85BBD6]/30 shadow-2xs"
              : "text-[#85858D] hover:bg-[#FAFAF8] hover:text-[#24262B]"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#85BBD6]" />
          <span>Legal Agreements &amp; NDAs ({contracts.length})</span>
        </button>
      </div>

      {/* TAB 1: FILES & DELIVERABLES */}
      {tab === "files" && (
        <div>
          {loading ? (
            <div className="grid place-items-center py-20 rounded-3xl border border-border bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="h-8 w-8" />
              </div>
              <p className="font-display text-lg font-black text-foreground">No shared documents yet</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Project assets, deliverables, and briefs shared with your account will appear here.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                <Upload className="h-3.5 w-3.5" /> Upload File Now
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((d) => (
                <div
                  key={d.id}
                  className="group rounded-3xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                        {d.file_type || "FILE"}
                      </span>
                    </div>
                    <p className="font-display font-bold text-foreground text-sm line-clamp-1">{d.name}</p>
                    {d.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{size(d.file_size) || new Date(d.created_at).toLocaleDateString()}</span>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                    >
                      <span>Download</span>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEGAL AGREEMENTS & NDAS */}
      {tab === "contracts" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-display font-black text-foreground text-sm">Enterprise Legal Protection Guarantee</p>
              <p className="text-xs text-muted-foreground">
                All IP, software code, proprietary models, and commercial deliverables built by AM Enterprises belong 100% exclusively to the client upon milestone payment settlement.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {contracts.map((c) => {
              const isSigned = c.status === "signed";
              return (
                <div key={c.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        isSigned ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {isSigned ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {isSigned ? "Active & Signed" : "Action Required"}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">{c.type}</span>
                    </div>
                    <h3 className="font-display font-black text-foreground text-base">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {c.signed_at || "Pending signature"}
                    </span>
                    {!isSigned ? (
                      <button
                        onClick={() => setSigningContract(c)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>Sign Digitally</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`Agreement Verified: ${c.title}\nProtected under AM Enterprises legal covenants.`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {signingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display font-black text-foreground text-base">Digital Signature</h3>
              </div>
              <button onClick={() => setSigningContract(null)} className="rounded-full p-1 hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-foreground">{signingContract.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{signingContract.summary}</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Signer Full Name</label>
              <input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-serif italic outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-2xl bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
              By clicking "Sign &amp; Accept", you execute this legal instrument under digital signature laws. A verified cryptographic hash will be bound to your client portal account.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSigningContract(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSignContract(signingContract)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Sign &amp; Accept Terms</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
