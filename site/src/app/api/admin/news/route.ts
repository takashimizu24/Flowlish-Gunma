import { NextResponse } from "next/server";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;

export async function POST(req: Request) {
  if (!DOMAIN || !KEY) {
    return NextResponse.json({ ok: false, error: "CMS未設定" }, { status: 500 });
  }
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  if (!title) {
    return NextResponse.json({ ok: false, error: "タイトルは必須です" }, { status: 400 });
  }
  const id = String(form.get("id") || "").trim();
  const publishedDate = String(form.get("publishedDate") || "");
  const body = String(form.get("body") || "");
  const categories = form.getAll("categories").map(String).filter(Boolean);
  const file = form.get("thumbnail");

  // Optional thumbnail -> upload to microCMS media (management API).
  let thumbnailUrl: string | undefined;
  if (file && file instanceof File && file.size > 0) {
    const up = new FormData();
    up.append("file", file, file.name || "thumbnail");
    const mr = await fetch(`https://${DOMAIN}.microcms-management.io/api/v1/media`, {
      method: "POST",
      headers: { "X-MICROCMS-API-KEY": KEY },
      body: up,
    });
    const md = await mr.json().catch(() => ({}));
    if (!mr.ok) {
      return NextResponse.json({ ok: false, error: md?.message || "画像アップロードに失敗しました" }, { status: 502 });
    }
    thumbnailUrl = md.url;
  }

  const payload: Record<string, unknown> = {
    title,
    body,
    categories,
    publishedDate: publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString(),
  };
  if (thumbnailUrl) payload.thumbnail = thumbnailUrl; // only replace image if a new one was uploaded

  const r = await fetch(
    `https://${DOMAIN}.microcms.io/api/v1/news${id ? `/${id}` : ""}`,
    {
      method: id ? "PATCH" : "POST",
      headers: { "X-MICROCMS-API-KEY": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: data?.message || "保存に失敗しました" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: data.id || id });
}
