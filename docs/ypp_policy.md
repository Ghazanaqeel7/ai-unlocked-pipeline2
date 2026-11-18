# YouTube monetisation rulebook (AI Unlocked)

Sources: YouTube Channel Monetisation Policies (support.google.com/youtube/answer/1311392) and YouTube Partner
Programme overview & eligibility (support.google.com/youtube/answer/72851), read 19 Nov 2026. Re-read both in the
Monday learning run once a month (first Monday) and update this file if anything changed.

## The goal
- **Fan funding (step 1):** 500 subscribers + 3 public uploads in 90 days + 3M qualified public views in 90 days.
- **Ad revenue:** 1,000 subscribers + 4,000 public watch hours in the last 12 months (long-form path — this
  channel's videos are 4-8 minutes, not Shorts, so the watch-hours path applies, not the Shorts-views path).
  New applicants from 1 Feb 2027: check the current threshold again at that point — YouTube has signalled changes
  to Shorts-view requirements; the long-form watch-hours threshold (4,000 hrs) has not been reported as changing,
  but re-verify via a web search in the first Monday review of February 2027.
- Meeting the numbers does not guarantee acceptance: the **whole channel** is reviewed (≈1 month). First rejection:
  appeal within 21 days or reapply after 30 days; later rejections: 90 days. So the channel must be clean
  **before** we qualify.

## What reviewers look at (keep these perfect)
Main theme of the channel · most-viewed videos · newest videos · biggest share of watch time · titles, thumbnails,
descriptions · the About section.

## Rules every video must pass (checked by `pipeline/scripts/policy_check.py`)
1. **Original + authentic (the "inauthentic content" policy).** Each video is our own script, our own voice, our
   own motion-graphics build — not a templated rehash of a competitor's video with the same structure and
   examples swapped. AI assistance (scriptwriting, voice, motion graphics) is fine; the final video must show our
   own perspective and editorial choices, not generic AI output with nothing added.
2. **No reused content.** Never use other creators' footage, screen recordings, or voice. Never read someone
   else's article/script aloud. Our scripts are written in our own words from verified sources (the tool's own
   docs/changelog, reputable coverage). Never recreate a real tool's exact UI pixel-for-pixel or use its logo —
   describe/illustrate it abstractly instead.
3. **No deceptive or shock content.** Titles and thumbnails must match what the video actually delivers — in this
   niche that means never promising a result ("10x your output", "AI secret nobody knows") the video doesn't
   genuinely show how to achieve. No fake "leaked"/"banned" bait.
4. **No AI "expert" persona giving financial, medical, legal or political advice.** The narrator explains tools and
   techniques; it never gives financial/investment, medical, legal advice, even when a trick relates to money or
   productivity. If a trick touches earnings/business use, add a line making clear it's general information, not
   professional advice.
5. **Facts:** every claim (a feature exists, a benchmark, a price, a quote) is checked against the tool's own
   current docs/changelog or a reputable, recent source — AI tools change fast, so re-verify even things Claude
   "knows," since training knowledge can be stale. Sources listed in the description.
6. **Metadata:** title ≤ 100 chars (we aim ≤ 60), ≤ 15 hashtags, tags ≤ 500 chars, accurate description.
7. **Creator integrity:** never buy or swap views/subs/likes, no engagement groups, no bots, no "sub4sub." Never
   ask viewers to engage with a video that breaks policy.
8. **Community Guidelines + advertiser-friendly:** no hate, harassment, graphic violence, sexual content,
   dangerous acts, misinformation; keep language and themes ad-friendly.
9. **Made for kids:** our audience is general/adult → "No, not made for kids" on every upload.

## Channel-level (Monday learning run)
- One clear theme: real, verified AI-tool tricks and implementation knowledge for a broad, non-technical-friendly
  audience. Avoid it looking templated (vary tools, formats, angles across videos).
- Check the 5 newest + 5 most-viewed videos against the rules above; anything weak → note in the playbook and tell
  the owner.
- About section must say what the channel is (practical AI tool tricks, sourced from official docs/changelogs,
  for every type of user).
- Keep uploading: channels with no uploads for 6 months can lose monetisation.

## Owner-only actions
Listed in `state.json` → `owner_todos` and shown on the dashboard ("Only you can do these"). The production run
adds a to-do when a milestone is reached (500 subs + 3M views → apply for fan funding; 1,000 subs + 4,000 watch
hours → apply for ad revenue).
