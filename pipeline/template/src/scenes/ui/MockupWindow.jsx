import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, C, tone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, springPop} from '../common.jsx';

// Simulated app interface: a glass browser/app chrome with a prompt box whose text types in, plus optional
// "picker" rows (model/tool selector chips) and a response area. Never mimics a specific real app's exact
// chrome/branding — generic traffic-light dots + a plain title bar, so it reads as "an AI tool" not any one product.
// params:
//   title     — window title bar text, e.g. "New chat"
//   prompt    — text that types in character-by-character inside the input box
//   chips     — array of strings for small selector pills under the title bar (e.g. model names) — rendered
//               as plain text chips, not real logos
//   response  — optional line(s) of "output" that fade in after the prompt finishes typing (string or string[])
//   tone
export const MockupWindow = ({title = 'New chat', prompt = '', chips = [], response, tone: tn = 'glass'}) => {
  const f = useCurrentFrame(); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const panelW = narrow ? 880 : 1360;
  const kIn = springPop(f, 0, {damping: 18});
  const typeSpeed = 1.1; // chars per frame
  const shown = Math.max(0, Math.floor((f - 18) * typeSpeed));
  const typedPrompt = prompt.slice(0, shown);
  const promptDone = shown >= prompt.length;
  const caretOn = Math.floor(f / 8) % 2 === 0 && !promptDone;
  const responseLines = Array.isArray(response) ? response : response ? [response] : [];
  const respStart = 24 + Math.ceil(prompt.length / typeSpeed);
  return (
    <AbsoluteFill>
      <GridBg tn={tn} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: panelW, opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.92 + Math.min(1, kIn) * 0.08}) translateY(${(1 - Math.min(1, kIn)) * 40}px)`}}>
          <GlassPanel radius={22} pad="0" glow={t.accent} style={{overflow: 'hidden'}}>
            {/* title bar */}
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '18px 26px', borderBottom: `1px solid ${C.glassLine}`}}>
              <span style={{width: 14, height: 14, borderRadius: 7, background: '#ff5f57', display: 'inline-block'}} />
              <span style={{width: 14, height: 14, borderRadius: 7, background: '#febc2e', display: 'inline-block'}} />
              <span style={{width: 14, height: 14, borderRadius: 7, background: '#28c840', display: 'inline-block'}} />
              <span style={{marginLeft: 16, fontFamily: F.sans, fontWeight: 600, fontSize: 24, color: t.sub}}>{title}</span>
            </div>
            {/* chips */}
            {!!chips.length && (
              <div style={{display: 'flex', gap: 10, flexWrap: 'wrap', padding: '18px 26px 0'}}>
                {chips.map((c, i) => {
                  const k = springPop(f, 8 + i * 5);
                  return (
                    <span key={i} style={{opacity: Math.min(1, k * 1.4), transform: `scale(${Math.min(1, k)})`, fontFamily: F.mono, fontSize: 20, color: t.accent, background: `${t.accent}1f`, border: `1px solid ${t.accent}55`, borderRadius: 999, padding: '6px 16px'}}>{c}</span>
                  );
                })}
              </div>
            )}
            {/* prompt box */}
            <div style={{margin: '22px 26px', background: 'rgba(0,0,0,.28)', border: `1px solid ${C.glassLine}`, borderRadius: 14, padding: '20px 24px', minHeight: 70, fontFamily: F.sans, fontSize: 28, color: t.fg}}>
              {typedPrompt}{caretOn && <span style={{color: t.accent}}>▍</span>}
            </div>
            {/* response */}
            {!!responseLines.length && (
              <div style={{margin: '0 26px 26px', display: 'flex', flexDirection: 'column', gap: 10}}>
                {responseLines.map((line, i) => {
                  const k = prog(f, respStart + i * 10, 14, ease);
                  return <div key={i} style={{opacity: k, transform: `translateY(${(1 - k) * 14}px)`, fontFamily: F.sans, fontSize: 24, color: t.sub, background: `${t.accent2 || t.accent}14`, borderRadius: 10, padding: '12px 18px'}}>{line}</div>;
                })}
              </div>
            )}
          </GlassPanel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
