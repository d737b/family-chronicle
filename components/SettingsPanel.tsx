'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, Plus, Trash2, Info } from 'lucide-react';
import type { AppConfig, MemberConfig } from '@/lib/types';
import { saveConfig, DEFAULT_MEMBERS } from '@/lib/config';

interface Props {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
  onClose: () => void;
}

const MORANDI_COLORS = [
  '#9BA89A','#C4A89B','#B5A99A','#8E9BAB','#A89BAB',
  '#ABB59A','#C4B8A8','#A8B8C4','#C4A8B8','#B8C4A8',
];
const EMOJI_OPTIONS = ['👴','👵','👨','👩','🙋','👧','👦','👶','🧓','🧑','👱','🧔'];

export default function SettingsPanel({ config, onSave, onClose }: Props) {
  const [apiKey, setApiKey]   = useState(config.notionApiKey);
  const [showKey, setShowKey] = useState(false);
  const [members, setMembers] = useState<MemberConfig[]>(
    config.members.length ? config.members : [...DEFAULT_MEMBERS]
  );

  const updateMember = (idx: number, patch: Partial<MemberConfig>) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  };
  const addMember = () => {
    const id = `member_${Date.now()}`;
    setMembers(prev => [...prev, {
      id, name: '新成員', emoji: '🙋',
      color: MORANDI_COLORS[prev.length % MORANDI_COLORS.length],
      notionDbId: '',
    }]);
  };
  const removeMember = (idx: number) => {
    setMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const newConfig: AppConfig = { notionApiKey: apiKey.trim(), members };
    saveConfig(newConfig);
    onSave(newConfig);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(50,40,35,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FDFAF7] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-[#3D3530]/15" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[#3D3530]">⚙️ 設定</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#E8EDE7] flex items-center justify-center text-[#6B5F58] hover:bg-[#F0E8E4]">
              <X size={13} />
            </button>
          </div>

          {/* API Key */}
          <section className="mb-6">
            <div className="flex items-center gap-1.5 mb-2">
              <h3 className="text-[11px] font-bold text-[#9B8F88] tracking-widest uppercase">Notion API Key</h3>
              <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noopener noreferrer"
                 className="text-[#9B8F88] hover:text-[#3D3530]">
                <Info size={11} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="secret_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-[#F2EDE6] border border-[#3D3530]/12 text-[12px] text-[#3D3530] outline-none focus:border-[#9BA89A] font-mono transition-colors"
              />
              <button onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8F88]">
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <p className="text-[10px] text-[#9B8F88] mt-1.5">
              前往 notion.so/profile/integrations 建立 Integration，取得 secret_… 開頭的金鑰
            </p>
          </section>

          {/* Members */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-[#9B8F88] tracking-widest uppercase">家族成員 × Notion DB</h3>
              <button onClick={addMember}
                className="flex items-center gap-1 text-[11px] text-[#9BA89A] hover:text-[#7A6B5E] font-medium">
                <Plus size={12} /> 新增成員
              </button>
            </div>

            <div className="space-y-3">
              {members.map((m, idx) => (
                <div key={m.id} className="bg-[#F2EDE6] rounded-xl p-3 border border-[#3D3530]/8">
                  {/* Row 1: emoji + name + color + delete */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Emoji picker */}
                    <div className="relative group">
                      <button className="text-xl w-9 h-9 rounded-lg bg-white border border-[#3D3530]/12 flex items-center justify-center">
                        {m.emoji}
                      </button>
                      <div className="hidden group-focus-within:grid absolute top-10 left-0 z-10 grid-cols-6 gap-1 p-2 bg-white rounded-xl border border-[#3D3530]/12 shadow-lg">
                        {EMOJI_OPTIONS.map(e => (
                          <button key={e} onClick={() => updateMember(idx, { emoji: e })}
                            className={`text-lg w-7 h-7 rounded hover:bg-[#E8EDE7] ${m.emoji === e ? 'bg-[#E8EDE7]' : ''}`}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <input
                      value={m.name}
                      onChange={e => updateMember(idx, { name: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#3D3530]/12 text-[12px] text-[#3D3530] outline-none focus:border-[#9BA89A]"
                      placeholder="成員名稱"
                    />

                    {/* Color */}
                    <div className="flex gap-1 flex-wrap w-28">
                      {MORANDI_COLORS.slice(0, 5).map(c => (
                        <button key={c} onClick={() => updateMember(idx, { color: c })}
                          className={`w-4 h-4 rounded-full border-2 transition-transform ${m.color === c ? 'border-[#3D3530] scale-125' : 'border-transparent'}`}
                          style={{ background: c }} />
                      ))}
                    </div>

                    {/* Delete */}
                    <button onClick={() => removeMember(idx)}
                      className="text-[#9B8F88] hover:text-[#C44] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* DB ID */}
                  <div>
                    <label className="text-[9px] text-[#9B8F88] font-medium tracking-wide uppercase block mb-1">
                      Notion DB ID
                    </label>
                    <input
                      value={m.notionDbId}
                      onChange={e => updateMember(idx, { notionDbId: e.target.value.trim() })}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#3D3530]/12 text-[11px] text-[#3D3530] font-mono outline-none focus:border-[#9BA89A]"
                    />
                    <p className="text-[9px] text-[#9B8F88] mt-1">
                      從 Notion DB 頁面 URL 複製：notion.so/…/<strong>這段32字元的ID</strong>?v=…
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notion DB 欄位說明 */}
          <section className="mb-6 p-3 rounded-xl bg-[#E8EDE7] text-[11px] text-[#6B5F58]">
            <div className="font-semibold mb-1.5">📋 Notion DB 建議欄位名稱</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
              {[['標題','Title（必填）'],['內容','多行文字'],['日期','Date'],['類型','Select'],
                ['標籤','Multi-select'],['連結','URL'],['平台','Text'],['地點','Text']].map(([k,v]) => (
                <div key={k}><span className="text-[#3D3530] font-semibold">{k}</span>：{v}</div>
              ))}
            </div>
            <div className="mt-2 text-[9px] text-[#9B8F88]">
              「類型」值可為：照片、影片、文字、網頁、地點、社群
            </div>
          </section>

          {/* Save */}
          <button onClick={handleSave}
            className="w-full py-3 rounded-xl bg-[#C4A89B] text-white text-[14px] font-bold hover:opacity-90 transition-opacity">
            💾 儲存設定並載入資料
          </button>
          <button onClick={onClose}
            className="w-full py-2.5 mt-2 rounded-xl border border-[#3D3530]/12 text-[12px] text-[#9B8F88] hover:bg-[#E8EDE7] transition-colors">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
