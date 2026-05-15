import {
  CheckCircle2,
  CloudUpload,
  Download,
  Film,
  Image as ImageIcon,
  Loader2,
  XCircle,
} from "lucide-react";

type Status =
  | "pending"
  | "downloading"
  | "uploading_mp4"
  | "generating_gif"
  | "uploading_gif"
  | "ready"
  | "failed";

const COPY: Record<Status, string> = {
  pending:        "Queued",
  downloading:    "Downloading video",
  uploading_mp4:  "Uploading MP4",
  generating_gif: "Creating GIF",
  uploading_gif:  "Uploading GIF",
  ready:          "Ready",
  failed:         "Failed",
};

const TONE: Record<Status, string> = {
  pending:        "bg-black/[0.06] text-foreground",
  downloading:    "bg-amber-50 text-amber-700",
  uploading_mp4:  "bg-amber-50 text-amber-700",
  generating_gif: "bg-amber-50 text-amber-700",
  uploading_gif:  "bg-amber-50 text-amber-700",
  ready:          "bg-emerald-50 text-emerald-700",
  failed:         "bg-red-50 text-red-700",
};

function Icon({ status }: { status: Status }) {
  const size = 13;
  switch (status) {
    case "pending":        return <Loader2 size={size} />;
    case "downloading":    return <Download size={size} />;
    case "uploading_mp4":  return <CloudUpload size={size} />;
    case "generating_gif": return <Film size={size} />;
    case "uploading_gif":  return <ImageIcon size={size} />;
    case "ready":          return <CheckCircle2 size={size} />;
    case "failed":         return <XCircle size={size} />;
  }
}

interface Props {
  status: Status;
  className?: string;
  /** Inline error from the Video record — only shown on failed. */
  errorMessage?: string | null;
}

export function VideoStatusBadge({ status, className, errorMessage }: Props) {
  const inFlight = status !== "ready" && status !== "failed";

  const title = status === "failed" && errorMessage ? errorMessage : COPY[status];

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${TONE[status]} ${className ?? ""}`}
    >
      {inFlight ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Icon status={status} />
      )}
      {COPY[status]}
    </span>
  );
}
