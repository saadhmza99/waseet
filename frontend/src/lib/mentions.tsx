import { Link } from "react-router-dom";

const MENTION_RE = /@([A-Za-z0-9._]+)/g;

export const extractMentionUsernames = (text: string): string[] => {
  const found = new Set<string>();
  const source = text || "";
  for (const match of source.matchAll(MENTION_RE)) {
    const slug = (match[1] || "").replace(/\.+$/, "").trim();
    if (slug) found.add(slug.toLowerCase());
  }
  return [...found];
};

export const TaggedText = ({ text }: { text: string }) => {
  const source = text || "";
  const parts: { key: string; value: string; mention: boolean }[] = [];
  let last = 0;
  let index = 0;
  for (const match of source.matchAll(MENTION_RE)) {
    const start = match.index ?? 0;
    if (start > last) {
      parts.push({ key: `t${index++}`, value: source.slice(last, start), mention: false });
    }
    parts.push({ key: `m${index++}`, value: match[0], mention: true });
    last = start + match[0].length;
  }
  if (last < source.length) {
    parts.push({ key: `t${index++}`, value: source.slice(last), mention: false });
  }
  if (!parts.length) return <>{source}</>;

  return (
    <>
      {parts.map((part) =>
        part.mention ? (
          <Link
            key={part.key}
            to={`/profile/${encodeURIComponent(part.value.replace(/^@/, ""))}`}
            className="font-semibold text-blue-600 hover:underline"
          >
            {part.value}
          </Link>
        ) : (
          <span key={part.key}>{part.value}</span>
        )
      )}
    </>
  );
};
