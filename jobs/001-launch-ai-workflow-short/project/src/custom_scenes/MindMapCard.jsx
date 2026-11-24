import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Network} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Output #3 zoom-in: NotebookLM's real Studio "Mind Map" output — a central-node + branch diagram
// drawn as inline SVG (deterministic layout, no Math.random), lines drawing in before each node pops.
const BRANCHES = ['Key idea', 'Supporting fact', 'Open question', 'Next step'];

export const MindMapCard = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w, height: h} = useVideoConfig(); const narrow = w < 1600;
  const R = narrow ? 300 : 170;
  const cx = narrow ? 430 : 320, cy = narrow ? 360 : 220;
  const nodes = BRANCHES.map((label, i) => {
    const angle = (Math.PI * 2 * i) / BRANCHES.length - Math.PI / 2;
    return {label, x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R};
  });
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 44 : 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Network size={narrow ? 34 : 28} color={t.accent} strokeWidth={2.2} />
          <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 24 : 18, color: t.fg, letterSpacing: 1}}>MIND MAP</div>
        </div>
        <GlassPanel radius={24} pad={narrow ? '20px' : '18px'} glow={t.accent2 || t.accent} tn={tName}>
          <svg width={narrow ? 860 : 640} height={narrow ? 760 : 440}>
            {nodes.map((n, i) => {
              const lineK = prog(f, 6 + i * 6, 12, ease);
              return (
                <line key={`l${i}`} x1={cx} y1={cy} x2={cx + (n.x - cx) * lineK} y2={cy + (n.y - cy) * lineK}
                  stroke={t.accent2 || t.accent} strokeWidth={3} opacity={0.6} />
              );
            })}
            <circle cx={cx} cy={cy} r={narrow ? 58 : 44} fill={t.accent} opacity={prog(f, 0, 10, ease)} />
            <text x={cx} y={cy + 6} textAnchor="middle" fontFamily={F.display} fontSize={narrow ? 18 : 14} fill="#071018" fontWeight="700">PDF</text>
            {nodes.map((n, i) => {
              const k = prog(f, 12 + i * 6, 12, ease);
              return (
                <g key={`n${i}`} style={{opacity: k}} transform={`translate(${n.x},${n.y}) scale(${0.7 + k * 0.3})`}>
                  <circle r={narrow ? 46 : 36} fill={t.card || 'rgba(16,26,46,.75)'} stroke={t.accent2 || t.accent} strokeWidth={2} />
                  <text textAnchor="middle" y={5} fontFamily={F.sans} fontWeight="700" fontSize={narrow ? 13 : 10.5} fill={t.fg}>{n.label}</text>
                </g>
              );
            })}
          </svg>
        </GlassPanel>
        <div style={{opacity: prog(f, 36, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 30 : 22, color: t.sub, textAlign: 'center', maxWidth: '82%'}}>
          Output #3: the whole PDF, mapped visually.
        </div>
      </div>
    </>
  );
};
