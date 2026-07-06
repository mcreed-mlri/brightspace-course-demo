# Brightspace API proxy (optional)

LACE Course Studio cannot call the Brightspace API directly from the browser because of CORS. Deploy a small proxy your team trusts, then paste its URL on the **Hub bridge** tab.

## Expected contract

`POST /brightspace` with JSON body:

```json
{
  "orgUnitId": "6707",
  "action": "listContentTopics"
}
```

Header: `Authorization: Bearer <token>`

## Response

Array of content topics or D2L API wrapper with `Objects`:

```json
[
  { "file": "Home.html", "url": "https://mlri.brightspace.com/content/enforced/6707-demo/Home.html?ou=6707" },
  { "file": "topic-1.html", "url": "https://..." }
]
```

Studio maps results into the Preflight **Content URLs** field and runs URL diff checks.

## Without a proxy

Paste URLs manually (one per line):

```
topic-1.html -> https://...
topic-2.html -> https://...
```

Or paste raw JSON from Brightspace Data Hub exports.
