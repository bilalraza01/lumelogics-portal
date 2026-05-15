export interface ImportSummary {
  created: number;
  skipped: number;
  errors: { row: number; email: string | null; error: string }[];
}

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

export const importsApi = {
  uploadProspects: async (apiFetch: Fetcher, file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append("file", file);
    // Crucial: do NOT set Content-Type — the browser/runtime will set the
    // multipart boundary. apiFetch only injects Content-Type when missing AND
    // a body is present; we explicitly leave it absent here.
    const res = await apiFetch("/api/v1/admin/outreel/imports/prospects", {
      method: "POST",
      body: formData,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(`import_failed_${res.status}`) as Error & {
        error?: string;
      };
      err.error = body.error;
      throw err;
    }
    return body as ImportSummary;
  },
};
