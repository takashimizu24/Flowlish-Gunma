import { NextResponse } from "next/server";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;
// browser-like UA — the management API sits behind Cloudflare, which 403s the default UA
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function POST(req: Request) {
  if (!DOMAIN || !KEY) return NextResponse.json({ ok: false, error: "CMS未設定" }, { status: 500 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "画像が選択されていません" }, { status: 400 });
  }
  const up = new FormData();
  up.append("file", file, file.name || "image");
  const r = await fetch(`https://${DOMAIN}.microcms-management.io/api/v1/media`, {
    method: "POST",
    headers: { "X-MICROCMS-API-KEY": KEY, "User-Agent": UA },
    body: up,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json({ ok: false, error: d?.message || "アップロードに失敗しました" }, { status: 502 });
  return NextResponse.json({ ok: true, url: d.url });
}
