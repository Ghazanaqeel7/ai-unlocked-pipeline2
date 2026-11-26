# Fact map

| Claim | Status | Sources |
|---|---|---|
| Workflows are chains of nodes; a trigger starts them and each node's output feeds the next | Verified | n8n Docs (workflow/nodes basics); KodeKloud n8n AI agent build-along; n8n template: Build your first AI agent |
| Community Edition is free, self-hosted, runs without a license key (some features need paid plans) | Verified, current | n8n Docs: Community Edition features; n8n pricing page |
| n8n Cloud has a free trial with no credit card (Pro-level features, 1,000 executions) | Verified 2026-11-26, page undated: say 'at the time of recording', never quote prices | n8n pricing page; n8n AI tutorial intro ('there is a free trial for new users') |
| An execution is a single run of the entire workflow; only production executions count toward quota; manual runs do not | Verified | n8n pricing page (execution definition); n8n Docs: Executions |
| Chat Trigger starts the workflow on each chat message; hosted chat provided; 'Make Chat Publicly Available' option | Verified | n8n Docs: Chat Trigger node; freeCodeCamp: How to build AI workflows with n8n |
| AI Agent node: connect a chat model and tools; agent decides which tools to call; works as a Tools Agent (agent type deprecated since n8n 1.82.0) | Verified | n8n Docs: AI Agent node; n8n AI tutorial workflow JSON (chatTrigger -> AI Agent -> OpenAI Chat Model) |
| Create a credential in the model node and paste the API key; beginners forget it | Verified (procedure), qualitative (pitfall) | n8n template 'Build your first AI agent'; Ascendient Learning n8n tutorial; community tutorials |
| n8n's beginner template runs on a free Google AI API key | Verified | n8n template: Build your first AI agent (n8n.io/workflows/6270) |
| Date & Time tool can be attached to the AI Agent | Verified (tutorial) | freeCodeCamp n8n AI workflow tutorial (Date & Time tool); n8n docs sub-nodes |
| Schedule Trigger: seconds to months or custom cron; uses workflow timezone else instance timezone; workflow must be published to run on schedule | Verified | n8n Docs: Schedule Trigger node; n8n Docs: Executions |
| n8n has a template library with a 'Build your first AI agent' template | Verified | n8n.io/workflows/6270; n8n.io/workflows/5819 |

Left out on purpose: prices (the page is undated and in euros), model names/versions (they change), the agent System Message option label (not confirmed in the docs: the script says 'the agent's options'; confirm the label at build time), and any memory-node claim.
