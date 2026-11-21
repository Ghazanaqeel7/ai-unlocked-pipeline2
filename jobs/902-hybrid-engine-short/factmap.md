# Factmap — 902-hybrid-engine-short (demo:true, internal pipeline test render)

This is a behind-the-scenes demo render exercising two new engine features (see
`docs/render_guide.md`): `liveclipcard` (real Playwright screen recording) and `custom_scenes/`
(per-job bespoke components). No outside claims, benchmarks, or quotes are made — every line describes
our own pipeline's own behavior, so no external sourcing is required.

- The recorded clip targets a public GitHub repository URL (allowed by `record_clips.py`'s own
  host allow-list) — self-verifying: either a real recording appears, or the generic fallback card
  does, per the component's own design.
- "Record → Patch → Ship" (HybridBadge, custom_scenes) is a stylized restatement of this render's own
  pipeline steps, not an external claim.
