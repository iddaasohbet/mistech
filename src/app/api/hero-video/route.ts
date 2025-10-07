export const dynamic = "force-static";
export const revalidate = 0;
export async function GET(req: Request) {
  const upstream = process.env.NEXT_PUBLIC_HERO_VIDEO || "https://cihatsoft.com/app.mp4";
  const range = req.headers.get("range") || undefined;
  const res = await fetch(upstream, {
    headers: range ? { range } : undefined,
    cache: "no-store",
  });
  const headers = new Headers(res.headers);
  // Ensure CORS not required (same-origin), keep essential streaming headers
  headers.set("cache-control", "no-store");
  return new Response(res.body, {
    status: res.status,
    headers,
  });
}


