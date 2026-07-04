function inlineFormat(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function MarkdownBody({ body }: { body: string }) {
  const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className="space-y-4 leading-relaxed text-[color:var(--color-fg-muted)]">
      {lines.map((line, index) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="pt-6 text-3xl text-[color:var(--color-fg)]">
              {line.replace(/^## /, "")}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={index} className="pt-6 text-3xl text-[color:var(--color-fg)]">
              {line.replace(/^# /, "")}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={index} className="pl-4">
              <span className="mr-2 text-[color:var(--color-accent)]">•</span>
              {inlineFormat(line.replace(/^- /, ""))}
            </p>
          );
        }
        return <p key={index}>{inlineFormat(line)}</p>;
      })}
    </div>
  );
}
