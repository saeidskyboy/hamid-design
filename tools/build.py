#!/usr/bin/env python3
"""Build index.html: inline Three.js, src/js/*.js (in name order), the Vazirmatn font and the reference photos into src/app.html.

The result is one self-contained HTML file that works offline and can be sent as-is.
Vendor files are downloaded once into tools/.cache (pinned versions).
"""
import base64
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / "tools" / ".cache"
VENDOR = {
    "three.min.js": "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js",
    "Vazirmatn-Bold.woff2": "https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn-Bold.woff2",
    "Vazirmatn-Medium.woff2": "https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn-Medium.woff2",
}


def vendor(name):
    path = CACHE / name
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(VENDOR[name], path)
    return path.read_bytes()


def b64(data):
    return base64.b64encode(data).decode()


def main():
    html = (ROOT / "src" / "app.html").read_text(encoding="utf-8")
    three = vendor("three.min.js").decode()
    assert "</script" not in three
    parts = {
        "__FONT_BOLD__": b64(vendor("Vazirmatn-Bold.woff2")),
        "__FONT_MED__": b64(vendor("Vazirmatn-Medium.woff2")),
    }
    for key, value in parts.items():
        assert key in html, key
        html = html.replace(key, value)
    app = "\n".join(p.read_text(encoding="utf-8") for p in sorted((ROOT / "src" / "js").glob("*.js")))
    assert "</script" not in app
    html = html.replace("/*__THREE__*/", three, 1).replace("/*__APP__*/", app, 1)
    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
