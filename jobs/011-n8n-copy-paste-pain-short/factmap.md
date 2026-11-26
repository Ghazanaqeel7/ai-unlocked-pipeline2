# Fact map

| Claim | Status | Sources |
|---|---|---|
| Workflows are chains of nodes; a trigger starts them and each node's output feeds the next | Verified | n8n Docs (workflow/nodes basics); KodeKloud n8n AI agent build-along; n8n template: Build your first AI agent |
| Community Edition is free, self-hosted, runs without a license key (some features need paid plans) | Verified, current | n8n Docs: Community Edition features; n8n pricing page |
| AI Agent node: connect a chat model and tools; agent decides which tools to call; works as a Tools Agent (agent type deprecated since n8n 1.82.0) | Verified | n8n Docs: AI Agent node; n8n AI tutorial workflow JSON (chatTrigger -> AI Agent -> OpenAI Chat Model) |
| Create a credential in the model node and paste the API key; beginners forget it | Verified (procedure), qualitative (pitfall) | n8n template 'Build your first AI agent'; Ascendient Learning n8n tutorial; community tutorials |
| An execution is a single run of the entire workflow; only production executions count toward quota; manual runs do not | Verified | n8n pricing page (execution definition); n8n Docs: Executions |

Left out on purpose: prices (the page is undated and in euros), model names/versions (they change), the agent System Message option label (not confirmed in the docs: the script says 'the agent's options'; confirm the label at build time), and any memory-node claim.
