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
  const cardH = Math.round(h * 0.42); // full-bleed stage (style_reference.md fix #2: 42-55% vh)
  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: narrow ? 30 : 36, padding: '0 60px', paddingTop: '12%'}}>
        {headline && <StudioHeadline text={headline} accent={accent} kicker={kicker} theme={tn} />}
        <StudioCard radius={22} pad={narrow ? '28px 26px' : '30px 36px'} tn={tn} style={{width: '88%', minHeight: cardH, display: 'flex', flexDirection: 'column', justifyContent: 'center'}} glow={t.accent}>
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

const ChecklistDemo = ({items, t, f, narrow}) => (
  <div>
    {items.slice(0, 6).map((it, i) => {
      const spec = typeof it === 'string' ? {text: it} : it;
      const k = prog(f, 8 + i * 10, 12, ease);
      const tickK = prog(f, 14 + i * 10, 10, ease);
      return (
        <div key={i} style={{opacity: k, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 26, transform: `translateX(${(1 - k) * -14}px)`}}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: tickK > 0.5 ? t.accent : 'transparent', border: `2.5px solid ${t.accent}`,
          }}>
            {tickK > 0.5 && <Check size={26} color={t.onAccent} strokeWidth={3} />}
          </div>
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 32 : 26, color: t.fg}}>{spec.text}</div>
        </div>
      );
    })}
  </div>
);
