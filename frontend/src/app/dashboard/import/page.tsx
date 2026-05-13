"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { toast } from "sonner";

const sampleLeads = [
  { row: 1, name: "Amit Sharma", phone: "+91 98765 43210", email: "amit@gmail.com", status: "valid" },
  { row: 2, name: "Priya Kumar", phone: "+91 87654 32109", email: "priya@outlook.com", status: "valid" },
  { row: 3, name: "", phone: "+91 76543 21098", email: "test@example.com", status: "error" },
  { row: 4, name: "Sunita Patel", phone: "+91 65432 10987", email: "amit@gmail.com", status: "duplicate" },
  { row: 5, name: "Vikram Singh", phone: "+91 54321 09876", email: "vikram@company.com", status: "valid" },
  { row: 6, name: "Deepa Nair", phone: "", email: "deepa@example.com", status: "error" },
  { row: 7, name: "Rajesh Verma", phone: "+91 32109 87654", email: "rajesh@email.com", status: "valid" },
  { row: 8, name: "Anjali Reddy", phone: "+91 21098 76543", email: "anjali@work.com", status: "valid" },
];

const statusIcon: Record<string, React.ReactNode> = {
  valid: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  duplicate: <AlertCircle className="w-4 h-4 text-amber-400" />,
};

const statusBadge: Record<string, any> = {
  valid: "success",
  error: "destructive",
  duplicate: "warning",
};

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const validCount = sampleLeads.filter((l) => l.status === "valid").length;
  const errorCount = sampleLeads.filter((l) => l.status === "error").length;
  const dupCount = sampleLeads.filter((l) => l.status === "duplicate").length;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setFileName(file.name);
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 80));
      setUploadProgress(i);
    }

    setUploading(false);
    setUploaded(true);
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setUploaded(false);
    setFileName("");
    setUploadProgress(0);
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
                    Drag & drop or click to browse
                  </p>
                </div>
                <div className="text-xs text-[#71717A]">
                  Supports: Name, Phone, Email columns
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{fileName}</div>
                    <div className="text-xs text-[#71717A]">{sampleLeads.length} rows processed</div>
                  </div>
                </div>
                <button onClick={reset} className="text-[#71717A] hover:text-white" data-testid="reset-upload-btn">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Progress value={100} className="mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                  </span>
                  <span className="text-white font-semibold">{validCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Errors
                  </span>
                  <span className="text-white font-semibold">{errorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Duplicates
                  </span>
                  <span className="text-white font-semibold">{dupCount}</span>
                </div>
              </div>
              <Button
                className="w-full mt-4 gap-2"
                onClick={() => toast.success(`${validCount} leads imported to your account!`)}
                data-testid="import-leads-btn"
              >
                Import {validCount} Valid Leads
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
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Lead Preview</h3>
                  <div className="flex gap-2">
                    <Badge variant="success">{validCount} Valid</Badge>
                    <Badge variant="destructive">{errorCount} Errors</Badge>
                    <Badge variant="warning">{dupCount} Dups</Badge>
                  </div>
                </div>
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
                    {sampleLeads.map((lead) => (
                      <TableRow key={lead.row} data-testid={`preview-row-${lead.row}`}>
                        <TableCell className="text-xs text-[#71717A]">{lead.row}</TableCell>
                        <TableCell className={`text-sm ${!lead.name ? "text-red-400 italic" : "text-white"}`}>
                          {lead.name || "Missing"}
                        </TableCell>
                        <TableCell className={`text-sm ${!lead.phone ? "text-red-400 italic" : ""}`}>
                          {lead.phone || "Missing"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{lead.email}</TableCell>
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
              </motion.div>
            )}
          </AnimatePresence>

          {!uploaded && (
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
