import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {BookOpen, CheckCircle2} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Bespoke journal-log card for 903-claude-trading-desk-short: entries tick in one by one (sourced
// pattern — MindStudio's journal/ folder) instead of a frozen list, real BookOpen/CheckCircle icons.
const ENTRIES = ['Researched 6 tickers', 'Logged decision: hold', 'Daily loss limit: OK', 'Next run in 4h'];

export const JournalCard = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30}}>
        <GlassPanel radius={26} pad={narrow ? '32px 30px' : '26px 32px'} glow={t.accent} tn={tName}
          style={{display: 'flex', flexDirection: 'column', gap: narrow ? 20 : 16, width: narrow ? '86%' : '70%'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <BookOpen size={narrow ? 34 : 26} color={t.accent} strokeWidth={2.2} />
            <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 22 : 16, color: t.fg, letterSpacing: 1}}>journal/latest.log</div>
          </div>
          {ENTRIES.map((e, i) => {
            const k = prog(f, 8 + i * 10, 14, ease);
            return (
              <div key={e} style={{opacity: k, transform: `translateY(${(1 - k) * 12}px)`, display: 'flex', alignItems: 'center', gap: 12}}>
                <CheckCircle2 size={narrow ? 26 : 20} color={'#34d399'} strokeWidth={2.4} />
                <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 18, color: t.fg}}>{e}</div>
              </div>
            );
          })}
        </GlassPanel>
      </div>
    </>
  );
};
