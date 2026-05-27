"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle2, XCircle, AlertCircle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useLeads, getAuthUser } from "@/hooks/useSupabaseData";
import { createClient } from "@/lib/supabase/client";

type ParsedLead = {
  row: number;
  name: string;
  phone: string;
  email: string;
  status: "valid" | "error" | "duplicate";
  error?: string;
};

const statusIcon: Record<string, React.ReactNode> = {
  valid: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  duplicate: <AlertCircle className="w-4 h-4 text-amber-400" />,
};

const statusBadge = {
  valid: "success",
  error: "destructive",
  duplicate: "warning",
} as const;

// Lightweight CSV parser supporting quoted fields.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { cur.push(field); field = ""; }
      else if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (ch === "\r") { /* skip */ }
      else field += ch;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function parseLeads(text: string): ParsedLead[] {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h === "name" || h === "full name" || h === "first name");
  const phoneIdx = headers.findIndex((h) => h === "phone" || h === "phone number" || h === "mobile");
  const emailIdx = headers.findIndex((h) => h === "email" || h === "e-mail");

  const seen = new Set<string>();
  const result: ParsedLead[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = (nameIdx >= 0 ? r[nameIdx] : "")?.trim() || "";
    const phone = (phoneIdx >= 0 ? r[phoneIdx] : "")?.trim() || "";
    const email = (emailIdx >= 0 ? r[emailIdx] : "")?.trim() || "";
    let status: ParsedLead["status"] = "valid";
    let error: string | undefined;

    if (!name) { status = "error"; error = "Missing name"; }
    else if (!phone) { status = "error"; error = "Missing phone"; }
    else if (seen.has(phone)) { status = "duplicate"; error = "Duplicate phone"; }
    else { seen.add(phone); }

    result.push({ row: i, name, phone, email, status, error });
  }
  return result;
}

export default function ImportPage() {
  const { batchInsert } = useLeads();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedLead[]>([]);
  const [storagePath, setStoragePath] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const validCount = parsed.filter((l) => l.status === "valid").length;
  const errorCount = parsed.filter((l) => l.status === "error").length;
  const dupCount = parsed.filter((l) => l.status === "duplicate").length;
  const uploaded = parsed.length > 0;

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setFileName(file.name);
    setUploading(true);
    setUploadProgress(0);
    setParsed([]);

    try {
      // Read file
      const text = await file.text();
      setUploadProgress(40);

      // Parse
      const rows = parseLeads(text);
      setUploadProgress(70);

      // Try uploading to per-user Supabase storage path (optional; non-fatal if bucket missing)
      try {
        const user = await getAuthUser();
        if (user) {
          const supabase = createClient();
          const path = `${user.id}/imports/${Date.now()}_${file.name}`;
          const { error: upErr } = await supabase.storage
            .from("csv-imports")
            .upload(path, file, { upsert: false, contentType: "text/csv" });
          if (!upErr) {
            setStoragePath(path);
          }
        }
      } catch {
        // Storage bucket may not exist; skip silently.
      }

      setUploadProgress(100);
      setParsed(rows);
      toast.success(`${file.name} parsed: ${rows.length} rows`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to parse CSV");
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    const valid = parsed.filter((l) => l.status === "valid");
    if (valid.length === 0) {
      toast.error("No valid leads to import");
      return;
    }
    setImporting(true);
    try {
      const payload = valid.map((l) => ({
        name: l.name,
        phone: l.phone,
        email: l.email || null,
        source: "csv_import",
        status: "new",
      }));
      await batchInsert(payload);
      toast.success(`${valid.length} leads imported to your account`);
      setParsed([]);
      setFileName("");
      setStoragePath("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to import");
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setParsed([]);
    setFileName("");
    setUploadProgress(0);
    setStoragePath("");
  };

  return (
    <div className="space-y-6" data-testid="import-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload area */}
        <div className="lg:col-span-1 space-y-4">
          {!uploaded ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card border-2 border-dashed transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-[#00F0FF]/60 bg-[#00F0FF]/5"
                  : "border-white/10 hover:border-white/20"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              data-testid="csv-dropzone"
            >
              <div className="p-10 flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                  isDragging ? "bg-[#00F0FF]/10 border-[#00F0FF]/40" : "bg-white/5 border-white/10"
                }`}>
                  <Upload className={`w-6 h-6 ${isDragging ? "text-[#00F0FF]" : "text-[#71717A]"}`} />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">
                    {isDragging ? "Drop your CSV here" : "Upload CSV file"}
                  </p>
                  <p className="text-[#71717A] text-xs mt-1">
                    Drag &amp; drop or click to browse
                  </p>
                </div>
                <div className="text-xs text-[#71717A]">
                  Supports: name, phone, email columns
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                data-testid="csv-file-input"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{fileName}</div>
                    <div className="text-xs text-[#71717A]">{parsed.length} rows processed</div>
                  </div>
                </div>
                <button onClick={reset} className="text-[#71717A] hover:text-white shrink-0" data-testid="reset-upload-btn">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Progress value={100} className="mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                  </span>
                  <span className="text-white font-semibold" data-testid="valid-count">{validCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Errors
                  </span>
                  <span className="text-white font-semibold" data-testid="error-count">{errorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Duplicates
                  </span>
                  <span className="text-white font-semibold" data-testid="duplicate-count">{dupCount}</span>
                </div>
              </div>
              {storagePath && (
                <p className="text-[10px] text-[#52525B] mt-3 truncate" title={storagePath}>
                  Stored privately at: {storagePath}
                </p>
              )}
              <Button
                className="w-full mt-4 gap-2"
                onClick={handleImport}
                disabled={importing || validCount === 0}
                data-testid="import-leads-btn"
              >
                {importing ? "Importing…" : `Import ${validCount} Valid Leads`}
              </Button>
            </motion.div>
          )}

          {uploading && (
            <div className="glass-card p-4">
              <p className="text-sm text-white mb-2">Processing {fileName}...</p>
              <Progress value={uploadProgress} />
              <p className="text-xs text-[#71717A] mt-1">{uploadProgress}% complete</p>
            </div>
          )}

          {/* Instructions */}
          <div className="glass-card p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white">CSV Format</h4>
            <p className="text-xs text-[#71717A]">Required columns:</p>
            <div className="font-mono text-xs bg-black/30 rounded-lg p-3 text-[#A1A1AA] border border-white/5">
              name, phone, email
            </div>
            <p className="text-xs text-[#71717A]">First row should be headers.</p>
          </div>
        </div>

        {/* Preview Table */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {uploaded && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card overflow-hidden"
                data-testid="leads-preview-table"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-white text-sm">Lead Preview</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="success">{validCount} Valid</Badge>
                    <Badge variant="destructive">{errorCount} Errors</Badge>
                    <Badge variant="warning">{dupCount} Dups</Badge>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsed.map((lead) => (
                        <TableRow key={lead.row} data-testid={`preview-row-${lead.row}`}>
                          <TableCell className="text-xs text-[#71717A]">{lead.row}</TableCell>
                          <TableCell className={`text-sm ${!lead.name ? "text-red-400 italic" : "text-white"}`}>
                            {lead.name || "Missing"}
                          </TableCell>
                          <TableCell className={`text-sm ${!lead.phone ? "text-red-400 italic" : ""}`}>
                            {lead.phone || "Missing"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{lead.email || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {statusIcon[lead.status]}
                              <Badge variant={statusBadge[lead.status]} className="capitalize text-xs">
                                {lead.status}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!uploaded && !uploading && (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center border-dashed">
              <FileText className="w-12 h-12 text-[#71717A]/40 mb-3" />
              <p className="text-[#71717A] text-sm">Upload a CSV file to preview leads here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
