export type DocumentStatus = "indexed" | "processing" | "selected";

export interface LibraryDocument {
  id: string;
  name: string;
  format: string;
  size: string;
  status: DocumentStatus;
  sample?: boolean;
}

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_FORMATS = ["pdf", "txt", "md", "docx"] as const;

export const SAMPLE_DOCUMENTS: LibraryDocument[] = [
  {
    id: "sample-mental-health-guide",
    name: "Mental Health Guide.pdf",
    format: "PDF",
    size: "2.4 MB",
    status: "indexed",
    sample: true,
  },
  {
    id: "sample-anxiety-support",
    name: "Anxiety Support.docx",
    format: "DOCX",
    size: "1.2 MB",
    status: "processing",
    sample: true,
  },
  {
    id: "sample-wellness-handbook",
    name: "Wellness Handbook.pdf",
    format: "PDF",
    size: "3.8 MB",
    status: "indexed",
    sample: true,
  },
];

export type FileCheck =
  | { ok: true; extension: string; format: string; size: string }
  | { ok: false; message: string };

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function checkDocumentFile(file: {
  name: string;
  size: number;
}): FileCheck {
  const extension = extensionOf(file.name);
  if (!ACCEPTED_FORMATS.includes(extension as (typeof ACCEPTED_FORMATS)[number])) {
    return {
      ok: false,
      message: `${file.name} isn’t a supported file. Use PDF, TXT, MD or DOCX.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, message: `${file.name} is empty. Choose a file with content.` };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return {
      ok: false,
      message: `${file.name} is ${formatFileSize(file.size)}. The limit is 10 MB.`,
    };
  }
  return {
    ok: true,
    extension,
    format: extension.toUpperCase(),
    size: formatFileSize(file.size),
  };
}
