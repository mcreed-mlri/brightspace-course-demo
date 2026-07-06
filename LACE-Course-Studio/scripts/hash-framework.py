import pathlib

def djb2(s):
    h = 5381
    for c in s:
        h = ((h << 5) + h) ^ ord(c)
    return format(h & 0xFFFFFFFF, "x")

root = pathlib.Path(__file__).resolve().parents[2]
for rel in ["Blank-Course/course-nav.js", "Blank-Course/course-style.css"]:
    text = (root / rel).read_text(encoding="utf-8")
    print(rel, djb2(text))
