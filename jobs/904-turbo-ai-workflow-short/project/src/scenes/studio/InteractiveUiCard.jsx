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
  const f = useCurrentFrame(); const tn = studioTheme(theme); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 30 : 36, padding: '0 60px'}}>
        {headline && <StudioHeadline text={headline} accent={accent} kicker={kicker} theme={tn} size={narrow ? 42 : 54} />}
        <StudioCard radius={22} pad={narrow ? '28px 26px' : '30px 36px'} style={{width: narrow ? '86%' : 560}} glow={t.accent}>
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
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 16 : 13, color: t.sub, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1}}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: narrow ? '18px 20px' : '14px 18px',
        borderRadius: 12, border: `1.5px solid ${t.accent}`, background: t.light ? '#FFFFFF' : 'rgba(255,255,255,.04)',
      }}>
        <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 19, color: t.fg}}>{options[picked] || options[0] || '—'}</span>
        <ChevronDown size={20} color={t.accent} style={{transform: `rotate(${isOpen ? 180 : 0}deg)`}} />
      </div>
      <div style={{maxHeight: isOpen ? 400 : 0, overflow: 'hidden', transition: 'none', marginTop: isOpen ? 8 : 0}}>
        {options.map((o, i) => {
          const isPicked = i === picked;
          const rowK = prog(f, 14 + i * 4, 8, ease);
          return (
            <div key={i} style={{
              opacity: isOpen ? rowK : 0, padding: narrow ? '14px 18px' : '11px 16px', borderRadius: 8,
              background: isPicked && closeK > 0.3 ? `${t.accent}1f` : 'transparent',
              border: isPicked && closeK > 0.3 ? `1px solid ${t.accent}` : '1px solid transparent',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 20 : 16, color: t.fg,
            }}>
              {o}{isPicked && closeK > 0.3 && <Check size={16} color={t.accent} />}
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
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: narrow ? '22px 24px' : '18px 22px', borderRadius: 14, border: `1.5px solid ${t.line}`, background: t.light ? '#FFFFFF' : 'rgba(255,255,255,.04)'}}>
      <Search size={22} color={t.accent} />
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 26 : 20, color: t.fg}}>
        {typed}<span style={{opacity: typeK < 1 ? (f % 20 < 10 ? 1 : 0) : 0}}>|</span>
      </div>
    </div>
  );
};

const ChecklistDemo = ({items, t, f, narrow}) => (
  <div>
    {items.slice(0, 6).map((it, i) => {
      const spec = typeof it === 'string' ? {text: it} : it;
      const k = prog(f, 8 + i * 10, 12, ease);
      const tickK = prog(f, 14 + i * 10, 10, ease);
      return (
        <div key={i} style={{opacity: k, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, transform: `translateX(${(1 - k) * -14}px)`}}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: tickK > 0.5 ? t.accent : 'transparent', border: `2px solid ${t.accent}`,
          }}>
            {tickK > 0.5 && <Check size={18} color={t.onAccent} strokeWidth={3} />}
          </div>
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 22 : 18, color: t.fg}}>{spec.text}</div>
        </div>
      );
    })}
  </div>
);
