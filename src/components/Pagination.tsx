type Props = {
  current: number;
  total: number;
  makeHref: (page: number) => string;
};

function rangeWithEllipsis(current: number, total: number) {
  const delta = 2; // neighbors on each side
  const pages: (number | string)[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  pages.push(1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  if (total > 1) pages.push(total);
  return pages;
}

export default function Pagination({ current, total, makeHref }: Props) {
  if (total <= 1) return null;
  const items = rangeWithEllipsis(current, total);
  const prev = Math.max(1, current - 1);
  const next = Math.min(total, current + 1);
  return (
    <nav className="mt-4 flex items-center justify-center gap-1 flex-wrap">
      <a href={makeHref(prev)} aria-label="Önceki" className={`h-9 px-3 inline-flex items-center justify-center rounded border text-sm hover:bg-accent/50 ${current===1? 'pointer-events-none opacity-50':''}`}>Önceki</a>
      {items.map((it, idx) => {
        if (typeof it === 'string') return <span key={`e-${idx}`} className="h-9 px-2 inline-flex items-center justify-center text-sm text-muted-foreground">{it}</span>;
        const active = it === current;
        return (
          <a key={it} href={makeHref(it)} className={`h-9 min-w-9 px-2 inline-flex items-center justify-center rounded border text-sm ${active? 'bg-foreground text-background' : 'hover:bg-accent/50'}`}>{it}</a>
        );
      })}
      <a href={makeHref(next)} aria-label="Sonraki" className={`h-9 px-3 inline-flex items-center justify-center rounded border text-sm hover:bg-accent/50 ${current===total? 'pointer-events-none opacity-50':''}`}>Sonraki</a>
    </nav>
  );
}


