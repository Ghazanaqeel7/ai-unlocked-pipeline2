# Fact map

| Claim | Status | Sources |
|---|---|---|
| An execution is a single run of the entire workflow; only production executions count toward quota; manual runs do not | Verified | n8n pricing page (execution definition); n8n Docs: Executions |
| Chat Trigger starts the workflow on each chat message; hosted chat provided; 'Make Chat Publicly Available' option | Verified | n8n Docs: Chat Trigger node; freeCodeCamp: How to build AI workflows with n8n |
| Schedule Trigger: seconds to months or custom cron; uses workflow timezone else instance timezone; workflow must be published to run on schedule | Verified | n8n Docs: Schedule Trigger node; n8n Docs: Executions |

Left out on purpose: prices (the page is undated and in euros), model names/versions (they change), the agent System Message option label (not confirmed in the docs: the script says 'the agent's options'; confirm the label at build time), and any memory-node claim.
