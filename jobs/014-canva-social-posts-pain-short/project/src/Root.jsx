import React from 'react';
import {Composition, Still} from 'remotion';
import {Doc} from './Doc.jsx';
import {Thumb} from './Thumb.jsx';
import timing from './timing.json';
import {W, H, SW, SH, FPS} from './theme.js';
// Same `Doc` component renders both formats — only the canvas size differs (meta.json type:long uses
// `Doc`, type:short uses `ShortDoc`; new_job.sh / validate_short.py decide which one a job targets).
const dur = Math.max(30, Math.round(timing.duration * FPS));
export const Root = () => (
  <>
    <Composition id="Doc" component={Doc} width={W} height={H} fps={FPS} durationInFrames={dur} />
    <Composition id="ShortDoc" component={Doc} width={SW} height={SH} fps={FPS} durationInFrames={dur} />
    <Still id="Thumb" component={Thumb} width={1280} height={720} />
  </>
);
