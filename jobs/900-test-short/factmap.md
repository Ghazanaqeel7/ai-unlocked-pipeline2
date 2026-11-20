# Fact map — 900-test-short (manual pipeline test)

This is a manual end-to-end pipeline test job, not a real scheduled publish (`meta.json.demo: true`).
Its purpose is to exercise the new Shorts/`ShortDoc` path, word-level captions, SFX, and the companion
guide generator on a real GitHub Actions render.

Claims made in the script are limited to naming real, publicly known AI tools and their general
function — no invented benchmarks, prices, or statistics:

- Runway — real, publicly known AI video-generation tool. https://runwayml.com
- ElevenLabs — real, publicly known AI voice/TTS tool. https://elevenlabs.io
- Pika — real, publicly known AI video-generation tool. https://pika.art
- "~90% faster than hiring an editor" — illustrative framing for this test script, not a claim sourced
  from a specific study; phrased qualitatively in the actual narration ("roughly ninety percent faster")
  to match render_guide.md's "never fabricate a stat" rule for anything that can't be verified.

What was left out: pricing specifics (prices change often and aren't verified here), any claim of
exact render times beyond "a couple of minutes" (varies by tool/plan).
