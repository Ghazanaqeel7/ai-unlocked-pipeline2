import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Bot, LineChart, ShieldCheck, BookOpen} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel, springPop} from '../scenes/common.jsx';

// Bespoke hero for 903-claude-trading-desk-short (render_guide.md "bespoke per-job scenes are now the
// default"): a central Claude node with real lucide-react icons for the 3 systems it's wired to, dense
// enough to fill the vertical hero stage instead of one card in empty space.
export const TradingDeskHero = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const hubK = springPop(f, 0, {damping: 15});
  const nodes = [
    {Icon: LineChart, label: 'Market data'},
    {Icon: ShieldCheck, label: 'Broker + risk rules'},
    {Icon: BookOpen, label: 'Journal'},
  ];
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 36 : 26}}>
        <div style={{opacity: Math.min(1, hubK * 1.3), transform: `scale(${0.9 + Math.min(1, hubK) * 0.1})`}}>
          <GlassPanel radius={28} pad={narrow ? '30px 36px' : '24px 30px'} glow={t.accent} tn={tName}
            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <Bot size={narrow ? 72 : 54} color={t.accent} strokeWidth={2} />
            <div style={{fontFamily: F.display, fontSize: narrow ? 30 : 22, color: t.fg, letterSpacing: 1}}>CLAUDE</div>
          </GlassPanel>
        </div>
        <div style={{display: 'flex', gap: narrow ? 22 : 28, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '88%'}}>
          {nodes.map(({Icon, label}, i) => {
            const k = prog(f, 10 + i * 9, 16, ease);
            return (
              <GlassPanel key={label} radius={20} pad={narrow ? '22px 20px' : '18px 18px'} glow={t.accent2 || t.accent} tn={tName}
                style={{opacity: k, transform: `translateY(${(1 - k) * 20}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: narrow ? 210 : 160}}>
                <Icon size={narrow ? 46 : 34} color={t.accent2 || t.accent} strokeWidth={2.1} />
                <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 20 : 15, color: t.fg, textAlign: 'center'}}>{label}</div>
              </GlassPanel>
            );
          })}
        </div>
        <div style={{opacity: prog(f, 42, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 30 : 22, color: t.sub, textAlign: 'center', maxWidth: '82%'}}>
          One agent, wired to all four.
        </div>
      </div>
    </>
  );
};
