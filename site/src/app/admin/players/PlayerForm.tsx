"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { Section, Field, PickList, PickRow, PickHeading, SaveBar, inputStyle as input, ORANGE } from "@/components/admin/ui";
import { PLAYER_POSITIONS, NATIONALITIES } from "@/lib/adminOptions";
import type { Player } from "@/lib/types";

type PlayerListItem = { id: string; nameJa: string; number: number; active: boolean };

// Birthdays are stored as JST midnight; format the stored instant in JST for the date input.
const bdVal = (s?: string) => (s ? new Date(new Date(s).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10) : "");

const narrow: React.CSSProperties = { ...input, maxWidth: 280 };

function PhotoField({ name, label, hint, current }: { name: string; label: string; hint: string; current?: string }) {
  return (
    <Field label={label} hint={current ? `${hint} 変更するときだけ選んでください。` : hint}>
      {current && <img src={`${current}?w=240`} alt="" style={{ width: 120, aspectRatio: "3/4", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 10 }} />}
      <input name={name} type="file" accept="image/*" style={{ ...input, padding: 10 }} />
    </Field>
  );
}

export default function PlayerForm({ players, editing }: { players: PlayerListItem[]; editing: Player | null }) {
  const [active, setActive] = useState<boolean>(() => editing?.active !== false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    if (editing) form.set("id", editing.id);
    const r = await fetch("/api/admin/players", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setMsg({ ok: true, text: editing ? "選手を更新しました ✓" : "選手を追加しました ✓" });
      if (!editing) { (e.target as HTMLFormElement).reset(); setActive(true); }
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  const current = players.filter((p) => p.active);
  const former = players.filter((p) => !p.active);

  return (
    <AdminChrome title={editing ? "選手を編集" : "選手を追加"}>
      <PickList title={`既存の選手から選んで編集${editing ? "中" : ""}`} count={players.length} newHref="/admin/players" newLabel="新規追加" editing={!!editing} defaultOpen>
        {players.length === 0 ? (
          <p style={{ fontSize: 13, color: "#999", margin: 0 }}>まだ選手がいません。</p>
        ) : (
          [{ t: "現役", list: current }, { t: "過去の選手", list: former }].map(({ t, list }, gi) =>
            list.length === 0 ? null : (
              <div key={t}>
                <PickHeading first={gi === 0}>{t}（{list.length}）</PickHeading>
                {list.map((p) => (
                  <PickRow key={p.id} href={`/admin/players?id=${p.id}`} active={editing?.id === p.id}>
                    <span style={{ flex: "none", minWidth: 34, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>#{p.number}</span>
                    <span style={{ fontWeight: 700 }}>{p.nameJa}</span>
                  </PickRow>
                ))}
              </div>
            )
          )
        )}
      </PickList>

      <form onSubmit={submit}>
        <Section title="基本情報">
          <Field label="選手名（日本語）" required hint="姓と名の間は半角スペース（例：横井 美沙）。">
            <input name="nameJa" required defaultValue={editing?.nameJa ?? ""} placeholder="例：横井 美沙" style={input} />
          </Field>
          <Field label="選手名（英語）" required hint="サイトの選手カードに大きく表示されます。">
            <input name="nameEn" required defaultValue={editing?.nameEn ?? ""} placeholder="例：MISA YOKOI" style={input} />
          </Field>
          <Field label="背番号" required>
            <input name="number" type="number" inputMode="numeric" required defaultValue={editing?.number ?? ""} placeholder="7" style={narrow} />
          </Field>
          <Field label="在籍" required hint="オフにすると「過去の選手」になり、トップのロースターに表示されなくなります（過去の試合の出場記録は残ります）。">
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontWeight: 700, fontSize: 15, padding: "12px 14px", border: "1px solid #d6d6d6", borderRadius: 10, background: active ? "#fff6f0" : "#fafafa", borderColor: active ? ORANGE : "#d6d6d6" }}>
              <input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ width: 22, height: 22, accentColor: ORANGE }} />
              {active ? "現役ロースターに表示する" : "過去の選手（ロースターに表示しない）"}
            </label>
          </Field>
          <Field label="表示順" hint="ロースターの並び順。小さい数字ほど先に表示されます。">
            <input name="order" type="number" inputMode="numeric" defaultValue={(editing as { order?: number } | null)?.order ?? ""} placeholder="1" style={narrow} />
          </Field>
        </Section>

        <Section title="プロフィール" desc="選手の詳細画面に表示されます。空欄の項目は表示されません。">
          <Field label="ポジション">
            <input name="position" list="positions" defaultValue={editing?.position ?? ""} placeholder="Guard" style={narrow} />
            <datalist id="positions">{PLAYER_POSITIONS.map((p) => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label="身長" hint="数字だけ（cm）">
            <input name="height" inputMode="numeric" defaultValue={editing?.height ?? ""} placeholder="170" style={narrow} />
          </Field>
          <Field label="生年月日">
            <input name="birthdate" type="date" defaultValue={bdVal(editing?.birthdate)} style={narrow} />
          </Field>
          <Field label="出身">
            <input name="hometown" defaultValue={editing?.hometown ?? ""} placeholder="例：長野県上田市" style={input} />
          </Field>
          <Field label="国籍">
            <input name="nationality" list="nats" defaultValue={editing?.nationality ?? ""} placeholder="Japan" style={narrow} />
            <datalist id="nats">{NATIONALITIES.map((n) => <option key={n} value={n} />)}</datalist>
          </Field>
          <Field label="プロフィール / 経歴">
            <textarea name="bio" rows={4} defaultValue={editing?.bio ?? ""} style={{ ...input, resize: "vertical", lineHeight: 1.7 }} />
          </Field>
        </Section>

        <Section title="SNS・リンク" desc="入力したものだけ、選手の詳細画面にアイコンで表示されます。URL はそのまま貼り付けてください。">
          <Field label="Instagram URL">
            <input name="snsInstagram" defaultValue={editing?.snsInstagram ?? ""} placeholder="https://www.instagram.com/..." style={input} />
          </Field>
          <Field label="X URL">
            <input name="snsX" defaultValue={editing?.snsX ?? ""} placeholder="https://x.com/..." style={input} />
          </Field>
          <Field label="FIBA 3x3 個人ページ URL">
            <input name="fibaUrl" defaultValue={editing?.fibaUrl ?? ""} placeholder="https://play.fiba3x3.com/players/..." style={input} />
          </Field>
        </Section>

        <Section title="写真">
          <PhotoField name="photo" label="ロースター写真" hint="トップのロースターに表示。縦長 3:4 の画像。" current={editing?.photo?.url} />
          <PhotoField name="photoDetail" label="詳細画面用ポートレート" hint="選手をタップしたときの詳細画面に表示。縦長の画像。" current={editing?.photoDetail?.url} />
        </Section>

        <SaveBar busy={busy} editing={!!editing} msg={msg} />
      </form>
    </AdminChrome>
  );
}
