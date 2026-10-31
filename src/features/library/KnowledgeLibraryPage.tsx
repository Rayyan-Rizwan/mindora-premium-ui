import { useRef, useState, type DragEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button } from "@/components/ui";
import { ArrowLeftIcon, BookIcon, SettingsIcon } from "@/components/ui/icons";
import {
  ChevronDownIcon,
  CircleAlertIcon,
  CloudUploadIcon,
  DocumentIcon,
} from "@/components/ui/screenIcons";
import { classNames } from "@/lib/utils";
import {
  ACCEPTED_FORMATS,
  SAMPLE_DOCUMENTS,
  checkDocumentFile,
  type DocumentStatus,
  type LibraryDocument,
} from "./documents";

const STATUS_TONE: Record<DocumentStatus, "success" | "warning" | "info"> = {
  indexed: "success",
  processing: "warning",
  selected: "info",
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  indexed: "Indexed",
  processing: "Processing",
  selected: "Selected",
};

export default function KnowledgeLibraryPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [documents, setDocuments] = useState<LibraryDocument[]>(SAMPLE_DOCUMENTS);
  const [expanded, setExpanded] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  const openPicker = () => inputRef.current?.click();

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;

    const next: LibraryDocument[] = [];
    const problems: string[] = [];

    for (const file of incoming) {
      const check = checkDocumentFile(file);
      if (!check.ok) {
        problems.push(check.message);
        continue;
      }
      next.push({
        id: `local-${file.name}-${file.size}-${next.length}-${Date.now()}`,
        name: file.name,
        format: check.format,
        size: check.size,
        status: "selected",
      });
    }

    if (next.length) {
      setDocuments((current) => [...current, ...next]);
      setExpanded(true);
      setAdded(
        next.length === 1
          ? `${next[0].name} was added to this browser-only list.`
          : `${next.length} files were added to this browser-only list.`,
      );
    } else {
      setAdded("");
    }

    setError(problems.join(" "));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <section className="kl-screen" aria-labelledby="kl-title">
      <nav className="kl-rail" aria-label="Knowledge base sections">
        <button
          type="button"
          className="kl-rail__item kl-rail__item--active"
          aria-current="page"
          aria-label="Library"
          title="Library"
        >
          <BookIcon size={20} />
        </button>
        <button
          type="button"
          className="kl-rail__item"
          aria-label="Add a document"
          title="Add a document"
          onClick={openPicker}
        >
          <CloudUploadIcon size={20} />
        </button>
        <button
          type="button"
          className="kl-rail__item"
          aria-label="Uploaded documents"
          title="Uploaded documents"
          onClick={() => {
            setExpanded(true);
            listRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          <DocumentIcon size={20} />
        </button>
        <Link
          to="/settings"
          className="kl-rail__item kl-rail__item--last"
          aria-label="Settings"
          title="Settings"
        >
          <SettingsIcon size={20} />
        </Link>
      </nav>

      <div className="kl-main">
        <button
          type="button"
          className="asg-back kl-back"
          aria-label="Go back"
          onClick={goBack}
        >
          <ArrowLeftIcon size={18} />
        </button>

        <header className="kl-head">
          <h1 id="kl-title">Knowledge Base</h1>
          <p>Upload books and documents for the RAG system.</p>
        </header>

        <label
          className={classNames("kl-drop", dragging && "kl-drop--dragging")}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false);
            }
          }}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            multiple
            accept=".pdf,.txt,.md,.docx"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
            }}
          />
          <span className="kl-drop__icon" aria-hidden="true">
            <CloudUploadIcon size={26} />
          </span>
          <span className="kl-drop__title">Drag &amp; drop your file here</span>
          <span className="kl-drop__action">or click to browse</span>
          <span className="kl-drop__meta">
            Supported formats: PDF, TXT, MD, DOCX
          </span>
          <span className="kl-drop__meta">Max size: 10MB</span>
        </label>

        {error ? (
          <p className="kl-error" role="alert">
            <CircleAlertIcon size={16} />
            <span>{error}</span>
          </p>
        ) : null}
        {added ? (
          <p className="kl-added" role="status">
            {added} Nothing was uploaded and no indexing was started.
          </p>
        ) : null}

        <div className="kl-docs" ref={listRef}>
          <button
            type="button"
            className="kl-docs__toggle"
            aria-expanded={expanded}
            aria-controls="kl-doc-list"
            onClick={() => setExpanded((value) => !value)}
          >
            <span>Uploaded Documents</span>
            <span className="kl-docs__count">{documents.length}</span>
            <ChevronDownIcon
              size={18}
              className={classNames(
                "kl-docs__chevron",
                expanded && "kl-docs__chevron--open",
              )}
            />
          </button>

          {expanded ? (
            <div id="kl-doc-list" className="kl-docs__body">
              <ul className="kl-doc-list">
                {documents.map((document) => (
                  <li key={document.id} className="kl-doc">
                    <span className="kl-doc__icon" aria-hidden="true">
                      <DocumentIcon size={19} />
                    </span>
                    <span className="kl-doc__meta">
                      <strong>{document.name}</strong>
                      <small>
                        {document.format} · {document.size}
                        {document.sample ? " · Example" : ""}
                      </small>
                    </span>
                    <Badge tone={STATUS_TONE[document.status]} dot>
                      {STATUS_LABEL[document.status]}
                    </Badge>
                  </li>
                ))}
              </ul>

              <p className="kl-docs__note">
                The three example rows demonstrate the index lifecycle. Files
                you choose stay in this browser list only — Mindora does not
                upload, parse or index them in this interface.
              </p>
            </div>
          ) : null}
        </div>

        <Button className="kl-add" size="lg" fullWidth onClick={openPicker}>
          Add Document
        </Button>

        <p className="kl-fineprint">
          Accepted types: {ACCEPTED_FORMATS.map((item) => item.toUpperCase()).join(", ")}.
          The 10MB limit is checked before a file is added. RAG indexing is not
          connected on this screen.
        </p>
      </div>
    </section>
  );
}
