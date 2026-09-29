# Gallery AI cloud deployment

The production agents run in the managed n8n Cloud workspace:

- Workspace: `https://nex3.app.n8n.cloud/home/workflows`
- Workflow execution, scheduling, credentials, and logs are managed by n8n Cloud.
- The public website links directly to the matching n8n Cloud workflows.
- No additional cloud runtime, database, volume, or private network is required.

## After deployment

1. Sign in to the n8n Cloud workspace.
2. Add Google Sheets, Gmail, and Calendar OAuth credentials.
3. Select those credentials in the relevant Google nodes.
4. Confirm the spreadsheet ID and owner email in each Configuration node.
5. Run every workflow manually using labeled demo data.
6. Activate triggers and schedules only after the manual tests pass.

## Security

- Google OAuth secrets stay in n8n Cloud's encrypted credential store.
- Workflows create Gmail drafts for human review.
- Never commit `.env`, OAuth secrets, webhook secrets, or API keys.

## Verified workspace state

The workspace contains all five website agents. Artist Relations is published;
the four legacy agents are present but should only be published after their
credentials, triggers, and draft outputs have been tested in n8n Cloud.
