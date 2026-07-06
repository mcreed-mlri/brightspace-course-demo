

**Overall Feel**
Clean, calm, “studio” interface. Use cool grey page backgrounds, white cards, thin borders, restrained shadows, and blue only for primary actions or active states. Avoid heavy gradients, beige/tan palettes, loud color blocks, and decorative clutter.

**Core Colors**

| Use | Hex |
|---|---:|
| Page background | `#f5f6f8` |
| Deeper section background | `#eef0f4` |
| Card / surface | `#ffffff` |
| Hover tint | `#f5f6f8` |
| Primary text | `#14161b` |
| Body / muted text | `#565c69` |
| Metadata / soft text | `#8b909d` |
| Border | `#e4e7ed` |
| Strong border | `#d3d8e0` |
| Soft divider | `#edeff3` |
| Primary brand blue | `#1c3fb0` |
| Primary fill / progress blue | `#2a5bff` |
| Brand tint | `#eaf0ff` |

**Typography**
Use a modern sans-serif stack:

```css
font-family: "Geist", "Segoe UI Variable", "Segoe UI", "Inter", system-ui, sans-serif;
```

Fallback if Brightspace limits fonts:

```css
font-family: "Segoe UI Variable", "Segoe UI", Arial, sans-serif;
```

Recommended sizes:

| Element | Size / Weight |
|---|---|
| Body | `15px`, line-height `1.6`, weight `400` |
| Page heading | `28-34px`, weight `700`, tight line-height |
| Section heading | `20-24px`, weight `700` |
| Card title | `16-19px`, weight `700-750` |
| Card body | `14-15px`, line-height `1.55-1.6` |
| Metadata / chips | `12-13px`, weight `600` |

**Cards / Panels**
Use white surfaces with subtle borders.

```css
.lh-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(20, 22, 27, 0.04);
  padding: 18px;
}

.lh-card:hover {
  background: #f5f6f8;
  border-color: #d3d8e0;
  box-shadow: 0 1px 2px rgba(20, 22, 27, 0.04), 0 6px 18px rgba(20, 22, 27, 0.06);
}
```

**Buttons**
Primary buttons can use either dark ink or brand blue depending on context. The Hub often uses dark ink for strong actions and blue for progress/active signals.

```css
.lh-button-primary {
  background: #14161b;
  color: #ffffff;
  border-radius: 999px;
  font-weight: 700;
  padding: 10px 18px;
}

.lh-button-blue {
  background: #2a5bff;
  color: #ffffff;
  border-radius: 9px;
  font-weight: 700;
  padding: 10px 16px;
}

.lh-button-secondary {
  background: #ffffff;
  color: #565c69;
  border: 1px solid #e4e7ed;
  border-radius: 9px;
  font-weight: 700;
}
```

**Topic Accent Palette**
Use these as small accents only: top bars, dots, icon wells, chips, progress bars.

| Topic / Hue | Solid | Tint |
|---|---:|---:|
| Blue | `#2a5bff` | `#e9f0ff` |
| Violet | `#7a4fe0` | `#efeafd` |
| Pink | `#d24d83` | `#fce9f1` |
| Amber | `#c8791b` | `#fbf0dc` |
| Green | `#179a72` | `#e2f4ed` |
| Sky | `#3a8ec9` | `#e7f3fb` |
| Indigo | `#5563d6` | `#ebedfc` |
| Rust | `#bb573b` | `#fbe8e2` |

**Status Colors**

| Status | Solid | Tint | Text |
|---|---:|---:|---:|
| In progress / Done | `#179a72` | `#e2f4ed` | `#0f6e51` |
| Next up | `#2a5bff` | `#eaf0ff` | `#1c3fb0` |
| New / Updated | `#c8791b` | `#fbf0dc` | `#99610f` |
| Changed | `#c8493b` | `#fbe9e6` | `#9c3528` |
| Later / inactive | `#8b909d` | `#eef0f4` | `#565c69` |

**Brightspace Quick CSS Starter**

```css
body {
  background: #f5f6f8;
  color: #14161b;
  font-family: "Segoe UI Variable", "Segoe UI", Arial, sans-serif;
  font-size: 15px;
  line-height: 1.6;
}

h1, h2, h3 {
  color: #14161b;
  font-weight: 700;
  letter-spacing: -0.02em;
}

a {
  color: #1c3fb0;
  font-weight: 600;
}

.card, .widget, .homepage-container {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(20, 22, 27, 0.04);
}

.badge, .chip {
  border: 1px solid #e4e7ed;
  border-radius: 999px;
  background: #ffffff;
  color: #565c69;
  font-size: 12px;
  font-weight: 600;
}

.primary-action {
  background: #14161b;
  color: #ffffff;
  border-radius: 999px;
  font-weight: 700;
}
```

