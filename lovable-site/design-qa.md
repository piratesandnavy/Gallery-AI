# Design QA

## Reference

- Source: `https://www.lemuseedumonde.com/`
- Desktop capture: `/Users/siddharthmanchanda/Documents/Codex/2026-07-30/https-www-lemuseedumonde-com-gallery-ai/work/root-source/source-desktop.png`
- Mobile capture: `/Users/siddharthmanchanda/Documents/Codex/2026-07-30/https-www-lemuseedumonde-com-gallery-ai/work/root-source/source-mobile.png`

## Migrated implementation

- Local URL: `http://localhost:4173/`
- Desktop capture: `/Users/siddharthmanchanda/Documents/Codex/2026-07-30/https-www-lemuseedumonde-com-gallery-ai/work/root-source/implementation-desktop-root.png`
- Mobile capture: `/Users/siddharthmanchanda/Documents/Codex/2026-07-30/https-www-lemuseedumonde-com-gallery-ai/work/root-source/implementation-mobile-root.png`

## Checks

- Desktop viewport: 1440 × 900, passed.
- Mobile viewport: 390 × 844, passed with zero horizontal overflow.
- Homepage title, content hierarchy, artwork, fonts, responsive layout, and WebGL tunnel use the captured production runtime.
- Workflow carousel control changes the selected workflow.
- Assistant panel opens and closes and exposes its prompts and input.
- `/gallery-ai` serves the Gallery AI homepage.
- `/gallery-ai/artist-application` serves the complete application form.
- All homepage artwork images load from repository-hosted assets.
- The application gallery-interior image loads from a repository-hosted asset.
- No Lovable badge or Lovable project link is present.
- External Cloudflare image delivery and Google Fonts references were replaced with local assets.

## Result

Passed. The migrated routes render from the repository without the Lovable badge, analytics loader, or external image/font hosting.
