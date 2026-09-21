import { AdminChrome } from "@/components/admin/AdminChrome";

const card: React.CSSProperties = {
  display: "block", background: "#fff", borderRadius: 14, padding: "22px 24px",
  textDecoration: "none", color: "#141414", boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)",
};

export default function AdminHome() {
  return (
    <AdminChrome title="コンテンツ入力">
      <p style={{ color: "#666", fontSize: 14, marginTop: 0 }}>入力したい種類を選んでください。</p>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <a href="/admin/match" style={card}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>🏀 試合を追加</div>
          <div style={{ color: "#777", fontSize: 13, marginTop: 6 }}>ラウンド・結果・出場選手・スコア</div>
        </a>
        <a href="/admin/news" style={card}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>📰 お知らせを追加</div>
          <div style={{ color: "#777", fontSize: 13, marginTop: 6 }}>タイトル・日付・カテゴリ・画像</div>
        </a>
        <a href="/admin/players" style={card}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>👤 選手を追加・編集</div>
          <div style={{ color: "#777", fontSize: 13, marginTop: 6 }}>名前・背番号・写真・SNS・現役/過去</div>
        </a>
      </div>
    </AdminChrome>
  );
}
