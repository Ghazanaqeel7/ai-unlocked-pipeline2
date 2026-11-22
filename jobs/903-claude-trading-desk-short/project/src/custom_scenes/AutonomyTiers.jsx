import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Eye, UserCheck, Bot} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Bespoke "three access tiers" stack for 903-claude-trading-desk-short (sourced: Finance Magnates,
// "Claude Powers Nine of Ten Broker AI Agents That Now Trade Live Accounts" — read-only /
// human-approved / autonomous sub-account). Tiers light up top-to-bottom, real lucide icons per tier.
export const AutonomyTiers = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const tiers = [
    {Icon: Eye, label: 'Read-only', sub: 'Sees the account, can’t trade it'},
    {Icon: UserCheck, label: 'Human-approved', sub: 'Drafts orders, you sign off'},
    {Icon: Bot, label: 'Autonomous', sub: 'Trades inside a walled sub-account'},
  ];
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 20 : 16, padding: 30}}>
        {tiers.map(({Icon, label, sub}, i) => {
          const k = prog(f, 6 + i * 12, 16, ease);
          return (
            <GlassPanel key={label} radius={22} pad={narrow ? '22px 26px' : '16px 22px'} glow={t.accent2 || t.accent} tn={tName}
              style={{opacity: k, transform: `translateX(${(1 - k) * -30}px)`, display: 'flex', alignItems: 'center', gap: narrow ? 20 : 16, width: narrow ? '88%' : '76%'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: narrow ? 64 : 48, height: narrow ? 64 : 48, borderRadius: '50%', background: `${t.accent}22`, flexShrink: 0}}>
                <Icon size={narrow ? 36 : 26} color={t.accent2 || t.accent} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 26 : 19, color: t.fg}}>{label}</div>
                <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 18 : 14, color: t.sub}}>{sub}</div>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </>
  );
};
