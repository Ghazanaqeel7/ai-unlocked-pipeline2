import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FileCode2, FolderOpen, ShieldAlert} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Bespoke code/file display for 903-claude-trading-desk-short, replacing `dochighlighter` for this job's
// 2 code beats: dochighlighter's single highlighted line inside a big fixed-height card leaves most of
// the card empty (exactly the "rigid blank-box" problem render_guide.md's new rule calls out) — this
// fills the same vertical hero-stage band with real line-numbered, syntax-tinted lines + a title bar +
// a caption badge, so every row of the card is real content, not empty space.
// `lines`: [{text, dim?}] rendered with line numbers; `highlight`: substring to tint gold on the last
// line; `badge`: small pill under the card (e.g. "GUARDRAIL"); `filename`: title-bar text.
export const CodeCard = ({lines = [], highlight, badge, filename = 'agent.py', icon = 'file', caption, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const Icon = icon === 'folder' ? FolderOpen : FileCode2;
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 26 : 20, padding: 30}}>
        <GlassPanel radius={24} pad={0} glow={t.accent} tn={tName} style={{width: narrow ? '90%' : '74%', overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: narrow ? '18px 24px' : '14px 20px', borderBottom: `1px solid ${t.line}`}}>
            <div style={{display: 'flex', gap: 7}}>
              {['#f0506e', '#F59E0B', '#34d399'].map((c) => <div key={c} style={{width: narrow ? 14 : 11, height: narrow ? 14 : 11, borderRadius: '50%', background: c}} />)}
            </div>
            <Icon size={narrow ? 22 : 18} color={t.sub} style={{marginLeft: 8}} />
            <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 20 : 15, color: t.sub}}>{filename}</div>
          </div>
          <div style={{padding: narrow ? '26px 28px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: narrow ? 14 : 10}}>
            {lines.map((ln, i) => {
              const text = typeof ln === 'string' ? ln : ln.text;
              const dim = typeof ln === 'object' && ln.dim;
              const k = prog(f, 6 + i * 6, 10, ease);
              const hasHi = highlight && text.includes(highlight);
              const parts = hasHi ? text.split(highlight) : [text];
              return (
                <div key={i} style={{opacity: k, display: 'flex', gap: 14, fontFamily: F.mono, fontSize: narrow ? 24 : 18, whiteSpace: 'pre'}}>
                  <span style={{color: t.sub, opacity: 0.5, width: narrow ? 28 : 22, textAlign: 'right'}}>{i + 1}</span>
                  <span style={{color: dim ? t.sub : t.fg, fontWeight: dim ? 500 : 700}}>
                    {hasHi ? (
                      <>{parts[0]}<span style={{background: '#F59E0B', color: '#1a1203', padding: '1px 6px', borderRadius: 4}}>{highlight}</span>{parts[1]}</>
                    ) : text}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassPanel>
        {badge && (
          <div style={{opacity: prog(f, 10 + lines.length * 6, 14, ease), display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(240,80,110,.14)', border: '1px solid #f0506e', borderRadius: 999, padding: narrow ? '10px 22px' : '8px 18px'}}>
            <ShieldAlert size={narrow ? 24 : 18} color="#f0506e" />
            <div style={{fontFamily: F.display, fontSize: narrow ? 24 : 18, letterSpacing: 2, color: '#f0506e'}}>{badge}</div>
          </div>
        )}
        {caption && (
          <div style={{opacity: prog(f, 16 + lines.length * 6, 14, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 28 : 20, color: t.sub, textAlign: 'center', maxWidth: '84%'}}>
            {caption}
          </div>
        )}
      </div>
    </>
  );
};
