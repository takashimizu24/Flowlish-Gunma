import { NextResponse } from "next/server";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;

// A browser-like UA — the management API sits behind Cloudflare, which 403s
// the default server/undici user-agent.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function uploadMedia(file: File): Promise<string> {
  const up = new FormData();
  up.append("file", file, file.name || "photo");
  const mr = await fetch(`https://${DOMAIN}.microcms-management.io/api/v1/media`, {
    method: "POST",
    headers: { "X-MICROCMS-API-KEY": KEY as string, "User-Agent": UA },
    body: up,
  });
  const md = await mr.json().catch(() => ({}));
  if (!mr.ok) throw new Error(md?.message || "画像アップロードに失敗しました");
  return md.url as string;
}

export async function POST(req: Request) {
  if (!DOMAIN || !KEY) {
    return NextResponse.json({ ok: false, error: "CMS未設定" }, { status: 500 });
  }
  const form = await req.formData();
  const nameJa = String(form.get("nameJa") || "").trim();
  if (!nameJa) {
    return NextResponse.json({ ok: false, error: "選手名（日本語）は必須です" }, { status: 400 });
  }
  const id = String(form.get("id") || "").trim();

  const str = (k: string) => String(form.get(k) || "").trim();
  const numRaw = str("number");
  const orderRaw = str("order");
  const birthdate = str("birthdate");

  const payload: Record<string, unknown> = {
    nameJa,
    nameEn: str("nameEn"),
    position: str("position"),
    height: str("height"),
    hometown: str("hometown"),
    nationality: str("nationality"),
    bio: str("bio"),
    snsInstagram: str("snsInstagram"),
    snsX: str("snsX"),
    fibaUrl: str("fibaUrl"),
    active: form.get("active") != null, // checkbox present => true
  };
  if (numRaw !== "") payload.number = Number(numRaw);
  if (orderRaw !== "") payload.order = Number(orderRaw);
  if (birthdate) payload.birthdate = new Date(`${birthdate}T00:00:00+09:00`).toISOString(); // JST midnight

  try {
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) payload.photo = await uploadMedia(photo);
    const photoDetail = form.get("photoDetail");
    if (photoDetail instanceof File && photoDetail.size > 0) payload.photoDetail = await uploadMedia(photoDetail);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }

  const r = await fetch(
    `https://${DOMAIN}.microcms.io/api/v1/players${id ? `/${id}` : ""}`,
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
