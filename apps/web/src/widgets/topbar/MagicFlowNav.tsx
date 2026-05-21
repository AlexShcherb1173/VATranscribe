import { Link, useLocation } from "react-router-dom";

type SourceKind = "files" | "downloads";

type MagicFlowStep = {
  key: string;
  label: string;
  href?: string | ((location: ReturnType<typeof useLocation>) => string);
  disabled?: boolean;
  match: (pathname: string) => boolean;
};

const SOURCE_STORAGE_KEY = "vatranscribe:last-source";

function isSourceKind(value: string | null): value is SourceKind {
  return value === "files" || value === "downloads";
}

function getStoredSource(): SourceKind | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(SOURCE_STORAGE_KEY);

  return isSourceKind(value) ? value : null;
}

function rememberSource(source: SourceKind) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SOURCE_STORAGE_KEY, source);
}

function getSourceHref(location: ReturnType<typeof useLocation>): string {
  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);
  const sourceFromUrl = params.get("source");

  if (pathname.includes("/downloads")) {
    rememberSource("downloads");
    return "/app/downloads";
  }

  if (pathname.includes("/files")) {
    rememberSource("files");
    return "/app/files";
  }

  if (isSourceKind(sourceFromUrl)) {
    rememberSource(sourceFromUrl);
    return `/app/${sourceFromUrl}`;
  }

  const storedSource = getStoredSource();

  if (storedSource) {
    return `/app/${storedSource}`;
  }

  return "/app/files";
}

const steps: MagicFlowStep[] = [
  {
    key: "source",
    label: "Источник",
    href: getSourceHref,
    match: (pathname) =>
      pathname === "/app" ||
      pathname.includes("/dashboard") ||
      pathname.includes("/downloads") ||
      pathname.includes("/files"),
  },
  {
    key: "processing",
    label: "Обработка",
    href: "/app/jobs",
    match: (pathname) => pathname.includes("/jobs"),
  },
  {
    key: "text",
    label: "Текст",
    href: "/app/transcriptions",
    match: (pathname) =>
      pathname.includes("/transcriptions") ||
      pathname.includes("/transcripts") ||
      pathname.includes("/result"),
  },
  {
    key: "subtitles",
    label: "Субтитры",
    href: "/app/transcriptions",
    match: (pathname) =>
      pathname.includes("/transcriptions") ||
      pathname.includes("/transcripts") ||
      pathname.includes("/result"),
  },
  {
    key: "content",
    label: "Контент",
    disabled: true,
    match: () => false,
  },
];

export function MagicFlowNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-300"
      aria-label="VATranscribe workflow navigation"
    >
      {steps.map((step, index) => {
        const isActive = step.match(pathname);
        const href = typeof step.href === "function" ? step.href(location) : step.href;

        return (
          <span key={step.key} className="inline-flex items-center gap-2">
            {step.disabled || !href ? (
              <span
                aria-disabled="true"
                title="Coming soon"
                className="cursor-not-allowed rounded-lg px-2 py-1 text-slate-500 opacity-70"
              >
                {step.label}
              </span>
            ) : (
              <Link
                to={href}
                aria-label={`Перейти к этапу: ${step.label}`}
                className={[
                  "rounded-lg px-2 py-1 transition",
                  isActive
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {step.label}
              </Link>
            )}

            {index < steps.length - 1 ? (
              <span className="select-none text-slate-500" aria-hidden="true">
                →
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
