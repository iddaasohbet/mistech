export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <article key={i} className="border rounded-lg p-4">
            <div className="aspect-video rounded bg-muted" />
            <h2 className="mt-3 font-medium">Yazı Başlığı {i + 1}</h2>
            <p className="text-sm text-muted-foreground">Kısa özet...</p>
          </article>
        ))}
      </div>
    </div>
  );
}


