"use client";

import { useState } from "react";
import type { Video } from "@/lib/youtube";

const thumbHi = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const thumbMd = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const PLAY = (
  <svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.5c-.8-3-3-5.2-6-6C55 0 34 0 34 0S13 0 7.5 1.5c-3 .8-5.2 3-6 6C0 13 0 24 0 24s0 11 1.5 16.5c.8 3 3 5.2 6 6C13 48 34 48 34 48s21 0 26.5-1.5c3-.8 5.2-3 6-6C68 35 68 24 68 24s0-11-1.5-16.5z" fill="#FF0000" /><path d="M27 34.5l18-10.5-18-10.5z" fill="#fff" /></svg>
);

function vdate(s: string) {
  const d = new Date(new Date(s).getTime() + 9 * 3600 * 1000);
  return `${d.getUTCFullYear()}/${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

/** Featured player + list; clicking any video plays it inline (YouTube embed). */
export default function VideoGallery({ videos }: { videos: Video[] }) {
  const [selId, setSelId] = useState(videos[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  if (videos.length === 0) return null;

  const feat = videos.find((v) => v.id === selId) ?? videos[0];
  const list = videos.filter((v) => v.id !== feat.id).slice(0, 4);
  const pick = (id: string) => { setSelId(id); setPlaying(true); };

  return (
    <div className="video-grid">
      <div className="video-feat">
        <div className="video-thumb">
          {playing ? (
            <iframe
              className="video-iframe"
              src={`https://www.youtube.com/embed/${feat.id}?autoplay=1&rel=0&playsinline=1`}
              title={feat.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button type="button" className="video-thumb-btn" onClick={() => setPlaying(true)} aria-label={`再生：${feat.title}`}
              style={{ background: `#000 center/cover url(${thumbHi(feat.id)})` }}>
              <span className="video-play">{PLAY}</span>
            </button>
          )}
        </div>
        <span className="video-date">{vdate(feat.date)}</span>
        <span className="video-feat-title">{feat.title}</span>
      </div>

      <div className="video-list">
        {list.map((v) => (
          <button key={v.id} type="button" className="video-item" onClick={() => pick(v.id)}>
            <span className="video-item-thumb" style={{ background: `#000 center/cover url(${thumbMd(v.id)})` }}>
              <span className="video-play video-play--sm">{PLAY}</span>
            </span>
            <span className="video-item-txt">
              <span className="video-date">{vdate(v.date)}</span>
              <span className="video-item-title">{v.title}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
