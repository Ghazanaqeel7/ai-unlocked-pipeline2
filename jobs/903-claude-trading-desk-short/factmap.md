# Fact map — 903-claude-trading-desk-short

## Core claims and sources

1. **Claude Code + scheduled routines can run as a 24/7 autonomous trading agent** (research → decide →
   log → sleep loop), built from a `CLAUDE.md` persona file, `watchlist.json`, a `journal/` folder, and a
   `research.js`/`research.py` data-fetch script.
   Source: MindStudio, "How to Build a 24/7 AI Trading Agent with Claude Code and Alpaca" /
   "...Claude Code Routines" (2026). <https://mindstudio.ai/blog/build-ai-trading-agent-claude-code-alpaca>

2. **Brokers now expose trading as agent-callable tools via MCP, so Claude can place real orders**, not
   just give commentary — e.g. Robinhood's "Agentic Trading" beta (MCP servers exposing the brokerage
   platform) and Interactive Brokers opening accounts to Claude.
   Sources: Medium/@0xnakamura, "Claude Can Now Trade Directly In Your Brokerage" (Robinhood Agentic
   Trading beta, May 2026); HackerNoon, "How To Build An Autonomous AI Trading Agent On Robinhood";
   FinanceMagnates, "Interactive Brokers Opens Accounts to Claude, Letting AI Draft Trades for Client
   Sign-Off" (01/06/2026).

3. **Broker AI-agent access is graded into three tiers**: read-only (agent can see the account but not
   trade it), human-approved (agent drafts orders, a person signs off on each one), and autonomous (agent
   trades inside a walled-off sub-account with no per-order approval).
   Source: FinanceMagnates, "Claude Powers Nine of Ten Broker AI Agents That Now Trade Live Accounts"
   (08/06/2026) — <https://www.financemagnates.com/forex/analysis/claude-powers-nine-of-ten-broker-ai-agents-that-now-trade-live-accounts/>

4. **Interactive Brokers' Claude integration requires a manual approval on every single order** — this is
   the guardrail that separates it from the fully autonomous tier above.
   Source: FinanceMagnates, "Interactive Brokers Opens Accounts to Claude..." (01/06/2026).

5. **Built-in risk guardrails commonly used in these agents: daily loss limits, maximum position size
   rules, and volatility filters** that halt or restrict trading automatically.
   Source: AnalyticsInsight, "How to Create Trading Strategies With Claude Code in 2026."

## What was left out / phrased carefully
- No specific win-rate, return percentage, or dollar figure is claimed anywhere in the script — none of
  the sources above give a verifiable, source-backed performance number for these agents, and the script
  never invents one (per `PIPELINE.md` — never fabricate a benchmark).
- The script does not claim Anthropic itself built or operates any trading product; Claude is used here
  as the underlying model inside third-party agent setups (Robinhood, Interactive Brokers, independent
  Claude Code builds) — the script's wording keeps that distinction ("developers wired Claude into...",
  "brokers now connect Claude to...") rather than implying an official Anthropic trading feature.
- This is a behind-the-scenes explainer of a real, current pattern, not investment advice — the script
  doesn't recommend using real money and the closing beat is the channel's standard comment-to-DM CTA, not
  a call to go trade.

## Wording to watch
- "Autonomous" always paired with "inside a walled sub-account" or "one of three access tiers" so it
  doesn't read as "fully unsupervised with your whole account" — that overstates what even the most
  permissive real deployments described above actually allow.
