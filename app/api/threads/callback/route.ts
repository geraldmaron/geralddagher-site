import { NextRequest } from "next/server";

type ShortLivedResp = { access_token: string; user_id: string };
type LongLivedResp = { access_token: string; token_type: string; expires_in: number };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) return new Response(`OAuth error: ${error}`, { status: 400 });
  if (!code) return new Response("Missing ?code=", { status: 400 });

  const client_id = process.env.THREADS_APP_ID!;
  const client_secret = process.env.THREADS_APP_SECRET!;
  const redirect_uri = process.env.THREADS_REDIRECT_URI!;

  const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id,
      client_secret,
      grant_type: "authorization_code",
      redirect_uri,
      code,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new Response(`Failed to get short-lived token: ${text}`, { status: 500 });
  }
  const shortData = (await tokenRes.json()) as ShortLivedResp;

  const exchange = new URL("https://graph.threads.net/access_token");
  exchange.searchParams.set("grant_type", "th_exchange_token");
  exchange.searchParams.set("client_secret", client_secret);
  exchange.searchParams.set("access_token", shortData.access_token);

  const longRes = await fetch(exchange.toString(), { cache: "no-store" });
  if (!longRes.ok) {
    const text = await longRes.text();
    return new Response(`Failed to get long-lived token: ${text}`, { status: 500 });
  }
  const longData = (await longRes.json()) as LongLivedResp;

  const html = `
    <html>
      <body style="font-family:system-ui; padding:24px; max-width:720px">
        <h1>Threads OAuth complete ✅</h1>
        <p>Paste these into your environment variables:</p>
        <pre><code>THREADS_LONG_LIVED_TOKEN=${longData.access_token}</code></pre>
        <pre><code>THREADS_USER_ID=${shortData.user_id}</code></pre>
        <p><strong>Next:</strong> Add them to .env / Vercel env and reload your app.</p>
      </body>
    </html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
