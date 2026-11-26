import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChevronDown, Search, Check} from 'lucide-react';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {StudioBg, StudioCard} from '../common.jsx';
import {StudioHeadline} from './StudioHeadline.jsx';

// `InteractiveUiCard`: a single generic (trademark-safe) app-UI card that animates one of three
// interaction kinds — never a frozen screenshot. Replaces the old BrowserSim "app" mode's chrome-window
// look with the flatter, denser editorial UI-card style from the reference videos.
// params:
//   kicker, headline, accent
//   kind — 'dropdown' (a select opens and an option gets picked) | 'typing' (search bar types a live
//          query) | 'checklist' (items tick green one by one)
//   dropdown — {label, options:[string], picked: index}
//   query    — string (for kind:'typing')
//   items    — [{text}] (for kind:'checklist')
//   theme
export const InteractiveUiCard = ({kicker, headline, accent = [], kind = 'dropdown', dropdown, query = '', items = [], theme}) => {
  const f = useCurrentFrame(); const tn = studioTheme(theme); const t = tone(tn); const {width: w, height: h} = useVideoConfig();
  const narrow = w < 1600;
  const cardH = Math.round(h * (kind === 'checklist' ? 0.5 : 0.42)); // full-bleed stage (style_reference.md fix #2: 42-55% vh)
  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: narrow ? 30 : 36, padding: '0 60px', paddingTop: '12%'}}>
        {headline && <StudioHeadline text={headline} accent={accent} kicker={kicker} theme={tn} />}
        <StudioCard radius={22} pad={narrow ? '28px 26px' : '30px 36px'} tn={tn} style={{width: '88%', minHeight: cardH, display: 'flex', flexDirection: 'column', justifyContent: kind === 'checklist' ? 'stretch' : 'center'}} glow={t.accent}>
          {kind === 'dropdown' && <DropdownDemo spec={dropdown} t={t} f={f} narrow={narrow} />}
          {kind === 'typing' && <TypingDemo query={query} t={t} f={f} narrow={narrow} />}
          {kind === 'checklist' && <ChecklistDemo items={items} t={t} f={f} narrow={narrow} />}
        </StudioCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const DropdownDemo = ({spec = {}, t, f, narrow}) => {
  const {label = 'Select an option', options = [], picked = 0} = spec;
  const openK = prog(f, 8, 14, ease);
  const closeAt = 24 + options.length * 8;
  const closeK = prog(f, closeAt, 10, ease);
  const isOpen = openK > 0.2 && closeK < 0.5;
  return (
    <div>
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 22 : 18, color: t.sub, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5}}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: narrow ? '26px 28px' : '22px 26px',
        borderRadius: 16, border: `2px solid ${t.accent}`, background: t.light ? '#FFFFFF' : 'rgba(255,255,255,.04)',
      }}>
        <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 34 : 28, color: t.fg}}>{options[picked] || options[0] || '—'}</span>
        <ChevronDown size={30} color={t.accent} style={{transform: `rotate(${isOpen ? 180 : 0}deg)`}} />
      </div>
      <div style={{maxHeight: isOpen ? 400 : 0, overflow: 'hidden', transition: 'none', marginTop: isOpen ? 8 : 0}}>
        {options.map((o, i) => {
          const isPicked = i === picked;
          const rowK = prog(f, 14 + i * 4, 8, ease);
          return (
            <div key={i} style={{
              opacity: isOpen ? rowK : 0, padding: narrow ? '20px 24px' : '16px 20px', borderRadius: 10,
              background: isPicked && closeK > 0.3 ? `${t.accent}1f` : 'transparent',
              border: isPicked && closeK > 0.3 ? `1px solid ${t.accent}` : '1px solid transparent',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 28 : 22, color: t.fg,
            }}>
              {o}{isPicked && closeK > 0.3 && <Check size={22} color={t.accent} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TypingDemo = ({query, t, f, narrow}) => {
  const typeK = prog(f, 10, Math.max(14, query.length * 2.6), ease);
  const typed = query.slice(0, Math.round(query.length * typeK));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: narrow ? '32px 32px' : '26px 30px', borderRadius: 18, border: `2px solid ${t.line}`, background: t.light ? '#FFFFFF' : 'rgba(255,255,255,.04)'}}>
      <Search size={30} color={t.accent} />
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 36 : 28, color: t.fg}}>
        {typed}<span style={{opacity: typeK < 1 ? (f % 20 < 10 ? 1 : 0) : 0}}>|</span>
      </div>
    </div>
  );
};

const DEFAULT_SUBS = ['Choose the engine that fits', 'Paste or write the narration', 'One click, video starts building'];
const ChecklistDemo = ({items, t, f, narrow}) => {
  const list = items.slice(0, 6).map((it) => (typeof it === 'string' ? {text: it} : it));
  const ticks = list.map((_, i) => prog(f, 14 + i * 10, 10, ease) > 0.5);
  const done = ticks.filter(Boolean).length;
  const allDone = done === list.length;
  const bar = list.length ? Math.min(1, (done + (ticks[done] === false ? prog(f, 14 + done * 10, 10, ease) : 0)) / list.length) : 0;
  const surface = t.light ? '#F8FAFC' : '#16181D';
  const pill = allDone ? '#34d399' : t.accent;
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18}}>
      {/* Card header bar */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
        <div style={{background: t.accent, color: t.onAccent, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 20 : 17, letterSpacing: 2, padding: '10px 18px', borderRadius: 10}}>WORKFLOW PIPELINE</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, flex: 1, justifyContent: 'flex-end'}}>
          <div style={{width: narrow ? 120 : 160, height: 10, borderRadius: 6, background: t.light ? 'rgba(15,23,42,.1)' : 'rgba(255,255,255,.12)', overflow: 'hidden'}}>
            <div style={{width: `${bar * 100}%`, height: '100%', background: pill}} />
          </div>
          <div style={{background: `${pill}26`, color: allDone ? '#0f9d6b' : t.accent, border: `2px solid ${pill}`, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 20 : 17, padding: '8px 16px', borderRadius: 999, whiteSpace: 'nowrap'}}>{done} / {list.length} READY</div>
        </div>
      </div>
      {list.map((spec, i) => {
        const k = prog(f, 8 + i * 10, 12, ease);
        const ok = ticks[i];
        return (
          <div key={i} style={{
            opacity: k, display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', borderRadius: 16,
            background: surface, border: `1.5px solid ${t.line}`, boxShadow: t.light ? '0 6px 18px rgba(15,23,42,.08)' : '0 6px 18px rgba(0,0,0,.4)',
            transform: `translateX(${(1 - k) * -14}px)`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              background: ok ? t.accent : 'transparent', border: `2.5px solid ${t.accent}`, fontFamily: F.display, fontSize: 30, color: t.accent,
            }}>
              {ok ? <Check size={36} color={t.onAccent} strokeWidth={3} /> : i + 1}
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 36 : 30, color: t.fg, lineHeight: 1.1}}>{spec.text}</div>
              <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: narrow ? 22 : 19, color: t.sub, marginTop: 6}}>{spec.sub || DEFAULT_SUBS[i] || 'Runs automatically'}</div>
            </div>
            <div style={{
              flex: '0 0 auto', fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 18 : 16, letterSpacing: 1.5, padding: '8px 14px', borderRadius: 999,
              background: ok ? '#34d39926' : `${t.accent}26`, color: ok ? '#0f9d6b' : t.accent, border: `1.5px solid ${ok ? '#34d399' : t.accent}`,
            }}>{ok ? 'DONE' : 'ACTIVE'}</div>
          </div>
        );
      })}
    </div>
  );
};
