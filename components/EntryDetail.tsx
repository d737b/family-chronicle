'use client';

import { useEffect } from 'react';
import { X, ExternalLink, MapPin, Calendar } from 'lucide-react';
import type { Entry, MemberConfig } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  photo: '📷 照片', video: '🎬 影片', text: '✏️ 文字',
  link: '🔗 網頁', place: '📍 地點', social: '💬 社群',
};

interface Props {
  entry: Entry;
  member?: MemberConfig;
  onClose: () => void;
}

export default function EntryDetail({ entry: e, member, onClose }: Props) {
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(50,40,35,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FDFAF7] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl"
           style={{ animation: 'slideUp 0.2s ease-out' }}>

        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-[#3D3530]/15" />
        </div>

        {/* Cover */}
        {e.coverUrl && (
          <img src={e.coverUrl} alt="" className="w-full max-h-52 object-cover" />
        )}

        <div className="p-5">
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#E8EDE7] flex items-center justify-center text-[#6B5F58] hover:bg-[#F0E8E4] transition-colors">
            <X size={13} />
          </button>

          {/* Type + member */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] text-[#9B8F88]">{TYPE_LABELS[e.type]}</span>
            {member && (
              <>
                <span className="text-[#9B8F88] text-[11px]">·</span>
                <span className="flex items-center gap-1 text-[11px] text-[#9B8F88]">
                  {member.emoji} {member.name}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="text-[18px] font-bold text-[#3D3530] leading-snug mb-3">{e.title}</h2>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 mb-4">
            {e.date && (
              <div className="flex items-center gap-1 text-[11px] text-[#9B8F88]">
                <Calendar size={11} /> {e.date}
              </div>
            )}
            {e.location && (
              <div className="flex items-center gap-1 text-[11px] text-[#9B8F88]">
                <MapPin size={11} /> {e.location}
              </div>
            )}
            {e.platform && (
              <div className="text-[11px] text-[#9B8F88] bg-[#E8EDE7] px-2 py-0.5 rounded-full">
                {e.platform}
              </div>
            )}
          </div>

          {/* Body */}
          {e.body && (
            <p className="text-[13px] text-[#6B5F58] leading-relaxed mb-4 whitespace-pre-wrap">{e.body}</p>
          )}

          {/* Tags */}
          {e.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {e.tags.map(t => (
                <span key={t} className="text-[11px] bg-[#F0E8E4] text-[#7A6B5E] px-2.5 py-1 rounded-full font-medium">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Source link */}
          {e.sourceUrl && (
            <a
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-xl bg-[#E8EDE7] text-[12px] text-[#6B5F58] hover:bg-[#DDE5DC] transition-colors"
            >
              <ExternalLink size={13} />
              <span className="flex-1 truncate">{e.sourceUrl}</span>
            </a>
          )}

          {/* Notion link */}
          <a
            href={`https://notion.so/${e.notionPageId.replace(/-/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-[#F5F2EE] text-[11px] text-[#9B8F88] hover:bg-[#EAE7E3] transition-colors"
          >
            <div className="w-3.5 h-3.5 rounded-sm bg-[#37352F] flex-shrink-0" />
            在 Notion 中查看
          </a>
        </div>
      </div>

      <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:.6}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
