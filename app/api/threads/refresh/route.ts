export async function GET() {
  const token = process.env.THREADS_LONG_LIVED_TOKEN;
  if (!token) return new Response("Missing THREADS_LONG_LIVED_TOKEN", { status: 400 });

  const url = new URL("https://graph.threads.net/refresh_access_token");
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", token);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    return new Response(`Failed to refresh: ${text}`, { status: 500 });
  }

  const body = await res.text();
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
