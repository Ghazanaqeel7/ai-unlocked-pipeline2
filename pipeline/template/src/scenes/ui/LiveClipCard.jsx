import React from 'react';
import {OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, springPop} from '../common.jsx';

// A recorded, real screen-capture clip (record_clips.py, Playwright) framed inside the same glass
// browser-window chrome as BrowserSim, with a Ken Burns pan/zoom and a drifting soft spotlight glow so
// a static recording never reads as a frozen screenshot.
//
// params:
//   url      — the page that was (attempted to be) recorded; shown in the title bar even on fallback.
//   label    — short caption under the window, e.g. "github.com/foo/bar" or "live demo". Optional.
//   resolved — set by record_clips.py at render time: {file: "assets/clips/<id>.mp4"}. Absent/undefined
//              means recording never happened or failed — render falls back to a generic static card
//              (same trademark-safe generic-chrome rule as BrowserSim) instead of a blank frame.
//   polarity / tone — same dark|light switch as every other primary component.
export const LiveClipCard = ({url, label, resolved, polarity, tone: tn, frames}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w, height: h} = useVideoConfig(); const narrow = w < 1600;
  const kIn = springPop(f, 0, {damping: 16});
  const dur = Math.max(1, frames || 90);
  // Ken Burns: slow continuous pan+zoom across the WHOLE beat (on top of Doc.jsx's own beat-level zoom).
  const kb = f / dur; // 0..1 over the beat's life
  const kbScale = 1.06 + kb * 0.1; // 1.06 -> 1.16
  const kbX = -2 + kb * 4, kbY = 1 - kb * 3; // gentle drift, percent
  const src = resolved && resolved.file ? staticFile(resolved.file) : null;
  const contentMinH = narrow ? Math.round(h * 0.52) : undefined;
  const winW = narrow ? '90%' : '74%';
  const domain = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url || 'live demo'; } })();

  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          width: winW, maxWidth: narrow ? 980 : 1500, position: 'relative',
          opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.94 + Math.min(1, kIn) * 0.06}) translateY(${(1 - Math.min(1, kIn)) * 30}px)`,
        }}>
          <GlassPanel radius={18} pad="0" glow={t.accent} tn={tName} style={{overflow: 'hidden'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: narrow ? '14px 18px' : '16px 22px', background: 'rgba(255,255,255,.04)', borderBottom: `1px solid ${t.line || 'rgba(255,255,255,.08)'}`}}>
              <div style={{width: 11, height: 11, borderRadius: '50%', background: '#f0506e'}} />
              <div style={{width: 11, height: 11, borderRadius: '50%', background: '#fbbf24'}} />
              <div style={{width: 11, height: 11, borderRadius: '50%', background: '#34d399'}} />
              <div style={{marginLeft: 12, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 20 : 15, color: t.sub, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{domain}</div>
            </div>
            <div style={{position: 'relative', minHeight: contentMinH, overflow: 'hidden', background: '#000'}}>
              {src ? (
                <>
                  <div style={{position: 'absolute', inset: 0, transform: `scale(${kbScale}) translate(${kbX}%, ${kbY}%)`}}>
                    {/* OffthreadVideo (not Video): Remotion extracts frames via ffmpeg out-of-band instead of
                        seeking a real <video> element per rendered frame — the latter was found to render at
                        roughly 1/30th normal speed under this pipeline's headless/software-GL render flags
                        (render_chunk.sh's --gl=swangle), turning a ~1min Short into a 2h+ render. */}
                    <OffthreadVideo src={src} style={{width: '100%', height: contentMinH ? contentMinH : 'auto', objectFit: 'cover', display: 'block'}} muted />
                  </div>
                  <SpotlightGlow f={f} dur={dur} />
                </>
              ) : (
                <FallbackBody f={f} t={t} narrow={narrow} domain={domain} label={label} minHeight={contentMinH} />
              )}
            </div>
          </GlassPanel>
          {label && (
            <div style={{marginTop: 16, textAlign: 'center', fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 22 : 17, color: t.sub, opacity: prog(f, 10, 16, ease)}}>{label}</div>
          )}
        </div>
      </div>
    </>
  );
};

// soft drifting radial highlight so a real recorded clip (which may have long static stretches between
// its own scripted actions) still reads as "alive" per render_guide.md's sub-beat-motion rule — a
// decorative spotlight, not a literal simulated cursor (we don't control the real page's coordinates).
const SpotlightGlow = ({f, dur}) => {
  const x = 50 + Math.sin(f / 70) * 18, y = 45 + Math.cos(f / 90) * 14;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen',
      background: `radial-gradient(circle 420px at ${x}% ${y}%, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 70%)`,
    }} />
  );
};

// Generic trademark-safe fallback when the clip couldn't be recorded (blocked, timed out, no headless
// access) — same "never a blank frame" rule fetch_assets.py/BrowserSim already follow, reusing the exact
// generic repo-card look rather than inventing a second placeholder style.
const FallbackBody = ({f, t, narrow, domain, label, minHeight}) => {
  const k = prog(f, 6, 14, ease);
  return (
    <div style={{minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: narrow ? '28px' : '36px'}}>
      <div style={{opacity: k, transform: `translateY(${(1 - k) * 12}px)`, fontFamily: F.mono, fontSize: narrow ? 24 : 18, color: t.sub, textAlign: 'center'}}>
        <span style={{color: t.accent}}>▸</span> {domain}
      </div>
      <div style={{opacity: k, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 30 : 24, color: t.fg, textAlign: 'center', maxWidth: '80%'}}>
        {label || 'Live demo'}
      </div>
    </div>
  );
};
