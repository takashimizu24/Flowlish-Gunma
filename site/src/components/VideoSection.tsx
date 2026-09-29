"use client";

import { useState } from "react";
import { thumbLayers, type Video } from "@/lib/youtube";
import { ymdSlash } from "@/lib/date";

/**
 * トップの VIDEO。チャンネルの最新動画を並べ、押した1本をその場で再生する。
 *
 * 最初は静止画とボタンだけを置き、押されてから iframe を差し込む。YouTube の
 * 埋め込みは重く Cookie も置くので、見ているだけの人には読み込ませない。
 */
export default function VideoSection({ videos }: { videos: Video[] }) {
  const [current, setCurrent] = useState(videos[0]);
  const [playing, setPlaying] = useState(false);
  if (videos.length === 0) return null;

  const rest = videos.filter((v) => v.id !== current.id).slice(0, 4);

  function open(v: Video) {
    setCurrent(v);
    setPlaying(true);
  }

  return (
    <div className="video-grid">
      <div>
        <div className="video-stage">
          {playing ? (
            <iframe
              className="video-frame"
              src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0`}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="video-cover"
              style={{ backgroundImage: thumbLayers(current.id) }}
              onClick={() => setPlaying(true)}
              aria-label={`${current.title} を再生`}
            >
              <span className="video-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <polygon points="8,5 20,12 8,19" />
                </svg>
              </span>
            </button>
          )}
        </div>
        <p className="video-lead-date">{current.published && ymdSlash(current.published)}</p>
        <h3 className="video-lead-title">{current.title}</h3>
      </div>

      {rest.length > 0 && (
        <ul className="video-list">
          {rest.map((v) => (
            <li key={v.id}>
              <button type="button" className="video-item" onClick={() => open(v)}>
                <span className="video-item__thumb" style={{ backgroundImage: thumbLayers(v.id) }} aria-hidden="true" />
                <span className="video-item__text">
                  <span className="video-item__date">{v.published && ymdSlash(v.published)}</span>
                  <span className="video-item__title">{v.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
