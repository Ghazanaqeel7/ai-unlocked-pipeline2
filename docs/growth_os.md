# Growth OS wiring (YouTube + Instagram + Facebook)

| Module | File | Runs |
|---|---|---|
| Daily package (1 long + 2 shorts) | `pipeline/research/package.py` | research.yml, daily 06:00 PKT |
| Top-100 backlog | `research/backlog.json` (`build_backlog.py`) | refreshed daily |
| Script rules | `pipeline/script/check_script.py` | on `set_status ... script_ready` |
| Guide PDF + conversion block | `pipeline/video/make_guide.py`, `monetization.json` | render.yml |
| PDF Vault | `docs/vault.html`, `pipeline/scripts/build_vault.py` | vault.yml on state change |
| Gates to Slack | `pipeline/gates/gates.py` | gates.yml on state/calendar change |
| Scheduler | `pipeline/publish/schedule_all.py` | publish.yml every 30 min |
| Comment funnel | `pipeline/social/comment_responder.py` | responder.yml every 15 min |
| Weekly review | `pipeline/analytics/weekly_review.py` | analytics.yml Mondays 09:00 PKT |

Publishing and replies are **dry-run** until the repo variable `PUBLISH_LIVE` is `1` (Settings, Secrets and variables, Variables).
Vault link for viewers: `https://aigraphictv.vercel.app/vault.html` (change `vault_url` in `monetization.json` if you use a Vercel domain).
Offers/affiliates appear nowhere until you fill `url` and set `live: true` in `monetization.json`.

## GitHub Secrets
- Existing: `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`, `YT_API_KEY`
- YouTube OAuth (upload, comments, analytics): `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`
  (scopes: youtube.upload, youtube.force-ssl, yt-analytics.readonly)
- Meta: `META_PAGE_ACCESS_TOKEN`, `IG_USER_ID`, `FB_PAGE_ID` (IG needs instagram_content_publish + instagram_manage_messages/comments)

## Known platform limits
- YouTube API cannot pin comments: the bridge comment is posted and Slack asks you to pin it.
- Instagram has no native scheduled Reels via API: Reels publish when their PKT window arrives (publish.yml polls).
- Follow-gate is verified on Instagram (`is_user_follow_business`); Facebook cannot verify, so DONE unlocks on trust.
- Approval via Slack buttons needs a hosted endpoint; Slack gets the cards, approval stays in the Dashboard / Telegram.
