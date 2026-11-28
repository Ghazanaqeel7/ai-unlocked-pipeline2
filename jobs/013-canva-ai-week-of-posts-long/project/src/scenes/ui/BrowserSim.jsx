import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, Pill, Cursor, springPop} from '../common.jsx';

// Replaces MockupWindow: a simulated, TRADEMARK-SAFE (generic chrome, never a real app's exact UI or
// logo) app/repo/terminal window with internal sub-beat motion every ~1s so nothing sits frozen.
// params (shared):
//   mode     — "app" (default, back-compat with the old MockupWindow shape) | "repo" | "terminal"
//   polarity — 'dark' (default) | 'light'; tone overrides polarity if given
// params (mode:"app" — generic AI-tool chat/generator window):
//   prompt, chips:[string], responseLines:[string], cursor:[{x,y,at}] (0-100% coords, simulated click),
//   dropdown:{label,options:[string],selectedAt}, uploadProgress:{pct,at}
// params (mode:"repo" — generic GitHub-style card):
//   title, stars, tags:[string], tree:[string] (filenames)
// params (mode:"terminal" — generic CLI):
//   lines:[{text, status:"ok"|"running", at}]
export const BrowserSim = ({
  mode = 'app', polarity, tone: tn,
  prompt, chips = [], responseLines = [], cursor = [], dropdown, uploadProgress,
  title, stars, tags = [], tree = [],
  lines = [],
}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w, height: h} = useVideoConfig(); const narrow = w < 1600;
  const winW = narrow ? '90%' : '74%';
  const kIn = springPop(f, 0, {damping: 16});
  // narrow (Shorts) canvas: fill the middle 55-65% vertical "hero stage" (~1050px of 1920) rather than
  // a small horizontal strip floating in dead space — the window's content area gets an explicit
  // minHeight so the title bar + body together occupy that band.
  const contentMinH = narrow ? Math.round(h * 0.52) : undefined;

  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          width: winW, maxWidth: narrow ? 980 : 1500, position: 'relative',
          opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.94 + Math.min(1, kIn) * 0.06}) translateY(${(1 - Math.min(1, kIn)) * 30}px)`,
        }}>
          <GlassPanel radius={18} pad="0" glow={t.accent} tn={tName} style={{overflow: 'hidden'}}>
            <TitleBar narrow={narrow} t={t} label={mode === 'repo' ? (title || 'repository') : mode === 'terminal' ? '~/project' : 'New chat'} />
            <div style={{padding: narrow ? '28px 28px 34px' : '30px 36px 36px', position: 'relative', minHeight: contentMinH, display: 'flex', flexDirection: 'column', justifyContent: narrow ? 'space-between' : 'flex-start'}}>
              {mode === 'repo' && <RepoBody f={f} t={t} narrow={narrow} title={title} stars={stars} tags={tags} tree={tree} />}
              {mode === 'terminal' && <TerminalBody f={f} t={t} narrow={narrow} lines={lines} />}
              {(mode === 'app' || !mode) && (
                <AppBody f={f} t={t} narrow={narrow} prompt={prompt} chips={chips} responseLines={responseLines} dropdown={dropdown} uploadProgress={uploadProgress} />
              )}
            </div>
            {!!cursor.length && <Cursor frame={f} keyframes={cursor} color={narrow ? '#1a2235' : '#1a2235'} />}
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

const TitleBar = ({narrow, t, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: narrow ? '14px 18px' : '16px 22px', background: 'rgba(255,255,255,.04)', borderBottom: `1px solid ${t.line || 'rgba(255,255,255,.08)'}`}}>
    <div style={{width: 11, height: 11, borderRadius: '50%', background: '#f0506e'}} />
    <div style={{width: 11, height: 11, borderRadius: '50%', background: '#fbbf24'}} />
    <div style={{width: 11, height: 11, borderRadius: '50%', background: '#34d399'}} />
    <div style={{marginLeft: 12, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 22 : 15, color: t.sub}}>{label}</div>
  </div>
);

const AppBody = ({f, t, narrow, prompt, chips, responseLines, dropdown, uploadProgress}) => {
  const chipK = (i) => prog(f, 10 + i * 5, 12, ease);
  const promptK = prog(f, 4, 14, ease);
  const genClickAt = 30;
  const respStart = genClickAt + 14;
  return (
    <>
      {!!chips.length && (
        <div style={{display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap'}}>
          {chips.map((c, i) => (
            <div key={i} style={{opacity: chipK(i), transform: `translateY(${(1 - chipK(i)) * 10}px)`}}>
              <Pill text={c} color={t.accent} size={narrow ? 18 : 20} />
            </div>
          ))}
        </div>
      )}
      {dropdown && (
        <div style={{marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.06)', border: `1px solid ${t.line}`, borderRadius: 10, padding: '8px 14px', fontFamily: F.mono, fontSize: narrow ? 15 : 14, color: t.fg}}>
          <span style={{color: t.sub}}>{dropdown.label}:</span>
          <b>{dropdown.options[Math.min(dropdown.options.length - 1, Math.floor(prog(f, dropdown.selectedAt || 20, 1) * dropdown.options.length))]}</b>
        </div>
      )}
      {prompt && (
        <div style={{background: 'rgba(0,0,0,.25)', border: `1px solid ${t.line}`, borderRadius: 12, padding: narrow ? '16px 18px' : '18px 22px', fontFamily: F.sans, fontSize: narrow ? 26 : 19, color: t.fg, minHeight: narrow ? 90 : 50}}>
          {prompt.slice(0, Math.round(prompt.length * promptK))}
          <span style={{opacity: promptK < 1 ? (f % 20 < 10 ? 1 : 0) : 0}}>|</span>
        </div>
      )}
      {uploadProgress && (
        <div style={{marginTop: 14}}>
          <div style={{width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${Math.min(100, prog(f, uploadProgress.at || 10, 30, ease) * (uploadProgress.pct || 100))}%`, background: t.accent}} />
          </div>
        </div>
      )}
      <div style={{marginTop: 18, display: 'flex', justifyContent: 'flex-end'}}>
        <div style={{
          opacity: 0.85 + springPop(f, genClickAt, {damping: 20}) * 0.15,
          transform: `scale(${1 - Math.max(0, 1 - springPop(f, genClickAt, {damping: 10})) * 0.08})`,
          background: `linear-gradient(90deg, ${t.accent}, ${t.accent2 || t.accent})`, color: '#071018', fontFamily: F.sans, fontWeight: 800,
          fontSize: narrow ? 23 : 17, padding: narrow ? '16px 30px' : '10px 22px', borderRadius: 10, boxShadow: `0 0 24px ${t.accent}66`,
        }}>Generate ⚡</div>
      </div>
      {!!responseLines.length && (
        <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8}}>
          {responseLines.map((l, i) => {
            const k = prog(f, respStart + i * 8, 10, ease);
            return (
              <div key={i} style={{opacity: k, transform: `translateX(${(1 - k) * -14}px)`, fontFamily: F.mono, fontSize: narrow ? 21 : 15, color: '#34d399'}}>
                ✓ {l}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const RepoBody = ({f, t, narrow, title, stars, tags, tree}) => {
  const starK = springPop(f, 12, {damping: 14});
  return (
    <>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14}}>
        <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 32 : 26, color: t.fg}}>{title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, transform: `scale(${Math.min(1.2, starK)})`, color: t.gold || t.accent, fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 18 : 17}}>
          ★ {stars}
        </div>
      </div>
      {!!tags.length && (
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
          {tags.map((tg, i) => {
            const k = prog(f, 16 + i * 4, 10, ease);
            return <div key={i} style={{opacity: k}}><Pill text={tg} color={t.accent} size={narrow ? 16 : 17} dark={false} /></div>;
          })}
        </div>
      )}
      {!!tree.length && (
        <div style={{background: 'rgba(0,0,0,.25)', borderRadius: 10, padding: narrow ? '14px 16px' : '16px 20px', fontFamily: F.mono, fontSize: narrow ? 21 : 15}}>
          {tree.map((file, i) => {
            const k = prog(f, 26 + i * 6, 8, ease);
            return (
              <div key={i} style={{opacity: k, transform: `translateX(${(1 - k) * -10}px)`, color: t.sub, padding: '3px 0'}}>
                <span style={{color: t.accent}}>▸</span> {file}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const TerminalBody = ({f, t, narrow, lines}) => (
  <div style={{fontFamily: F.mono, fontSize: narrow ? 24 : 16, lineHeight: 2}}>
    {lines.map((l, i) => {
      const k = prog(f, l.at != null ? l.at : i * 16, 8, ease);
      const running = l.status === 'running';
      return (
        <div key={i} style={{opacity: k, transform: `translateX(${(1 - k) * -8}px)`}}>
          <span style={{color: '#34d399'}}>$</span>{' '}
          <span style={{color: t.fg}}>{l.text}</span>
          {l.status && (
            <span style={{marginLeft: 10, color: running ? (t.gold || t.accent) : '#34d399'}}>
              {running ? '● running' : '✓ done'}
            </span>
          )}
        </div>
      );
    })}
  </div>
);
