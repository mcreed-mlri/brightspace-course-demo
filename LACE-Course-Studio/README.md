# LACE Course Studio

Local browser app for creating and maintaining LACE Brightspace course packages without writing HTML.

## Open

Open `index.html` in a browser (Chrome recommended). Templates load from `templates/blank-shell/`.

## Tabs

| Tab | Purpose |
| --- | --- |
| **Courses** | Create shells, import folders, select active draft |
| **Outline** | Shell Factory — course identity, module, topic list, regenerate files |
| **Topics** | Structured editor for the five author sections + live preview |
| **Preflight** | Brightspace Ready checks (embedded) + optional Content URL paste |
| **Export** | Download ZIP, copy checklist and config URL snippet |
| **Hub bridge** | Sync to release demo, export hub manifest, optional API proxy fetch |

## Related

- [Brightspace Ready](../Brightspace-Ready/index.html) — standalone preflight
- [Sustainability Demo](../Sustainability-Demo/admin-release-demo.html) — release workflow mock

## Brightspace API (Level 2)

Browser CORS blocks direct Brightspace API calls. Use **Preflight → paste Content URLs** or configure an **API proxy** on the Hub bridge tab. The proxy should accept `{ orgUnitId, action: "listContentTopics" }` and return a JSON array of `{ file, url }`.
