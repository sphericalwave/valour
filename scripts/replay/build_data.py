#!/usr/bin/env python3
"""Build src/data/replay.json + public/replay/frames for the Replays page.

Inputs come from the match-chapters tool (~/Documents/apps/match-chapters):
a chapters file (`H:MM:SS Red vs Blue` per line) and the cached stream video.
For each match it grabs two frames (a thumbnail and a mid-match "action"
shot) and OCRs the Smoothcomp scoreboard strip for the division + round.

Run with match-chapters' venv (it has pyobjc Vision):
  ~/Documents/apps/match-chapters/.venv/bin/python scripts/replay/build_data.py \
      --chapters ~/Documents/apps/match-chapters/cache/mat1.txt \
      --video ~/Documents/apps/match-chapters/cache/Y-NREI4XfJg_134.mp4 \
      --youtube Y-NREI4XfJg --mat 1
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path

MC = Path.home() / "Documents/apps/match-chapters"
sys.path.insert(0, str(MC))
from match_chapters import vision_ocr  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/replay"
STRIP_Y = 0.83
ROUND_RE = re.compile(r"(QUARTER ?FINALS?|SEMI ?FINALS?|FINALS?|ROUND \d+|BRONZE|3RD PLACE)", re.I)
MAX_LEN = 600  # cap a match's span when it's the last one on the mat


def frame(video, t, dst, vf="scale=640:-2"):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(t), "-i", str(video),
                    "-frames:v", "1", "-vf", vf, "-q:v", "5", str(dst)], check=True)


def division(video, t, tmp):
    """Most common (division, round) read from the strip's second line."""
    divs, rounds = Counter(), Counter()
    for dt in (15, 25, 40):
        png = Path(tmp) / f"div{t + dt}.png"
        frame(video, t + dt, png, f"crop=iw:ih*{1 - STRIP_Y}:0:ih*{STRIP_Y},scale=iw*2:-1")
        for _, _, s in vision_ocr(png):
            if s.count("/") >= 2:  # "KIDS GI / MIGHTY MITE (5-6YRS) / WHITE / -45.00 LBS"
                divs[re.sub(r"\s*/\s*", " / ", s.strip()).upper()] += 1
            if m := ROUND_RE.search(s):
                rounds[m[1].upper().replace("  ", " ")] += 1
    return (divs.most_common(1)[0][0] if divs else "",
            rounds.most_common(1)[0][0].title() if rounds else "")


TAIL_RE = re.compile(r"\s*[-·]?\s*(MA.CH\s*\d\s*/\s*\d|REPECHAGE|BRONZE|FINAL|SEMI|QUARTER|MAT\s*\d).*$")
# OCR digit look-alikes inside numbers: "-$3.00", "-S8.00", "(7-BYRS)", "(2-S YEARS)"
NUM_RE = re.compile(r"(?<![A-Z])[\d$SBO][\d$SBO.,\-]*[\d$SBO](?=\s*(LBS|L8S|YRS|YEARS|\)))")
SERIES_RE = re.compile(r"MA.CH\s*(\d)\s*/\s*(\d)|REPECHAGE\s*(\d)\s*OF\s*(\d)")


def fix_field(f):
    f = NUM_RE.sub(lambda m: m[0].translate(str.maketrans("$SBO,", "5580.")), f)
    f = re.sub(r"\.0[1-9]\b", ".00", f.replace("L8S", "LBS"))
    return re.sub(r"^(\d+\.\d\d LBS)", r"-\1", f)  # dropped minus: "45.00 LBS"


def snap(values):
    """Map each value to the most common near-identical spelling: same digits,
    length within 1, >=70% similar. The digit rule keeps -53 vs -58 LBS apart,
    the length rule keeps KIDS GI vs KIDS NO-GI apart."""
    from difflib import SequenceMatcher
    counts = Counter(values)
    digits = lambda v: re.sub(r"\D", "", v)
    out = {}
    for v in counts:
        near = [c for c in counts if digits(c) == digits(v) and abs(len(c) - len(v)) <= 1
                and SequenceMatcher(None, c, v).ratio() >= 0.7]
        out[v] = max(near, key=lambda c: (counts[c], c == v))
    return out


def clean(matches):
    """Strip the round/match-number tail OCR glued onto the division, fix digit
    look-alikes, then snap each " / " field to its most common spelling."""
    for m in matches:
        raw = m["division"]
        if s := SERIES_RE.search(raw):
            m["round"] = m["round"] or (f"Match {s[1]} of {s[2]}" if s[1] else f"Repechage {s[3]} of {s[4]}")
        raw = TAIL_RE.sub("", raw.replace("[", "(")).strip(" -/•·")
        m["fields"] = [fix_field(f.strip()) for f in raw.split(" / ")] if raw else []
    width = max(len(m["fields"]) for m in matches)
    for i in range(width):
        fix = snap([m["fields"][i] for m in matches if len(m["fields"]) > i])
        for m in matches:
            if len(m["fields"]) > i:
                m["fields"][i] = fix[m["fields"][i]]
    for m in matches:
        m["division"] = " / ".join(m.pop("fields"))
    return matches


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapters", required=True)
    ap.add_argument("--video", required=True)
    ap.add_argument("--youtube", required=True)
    ap.add_argument("--mat", type=int, default=1)
    a = ap.parse_args()

    rows = []
    for line in Path(a.chapters).read_text().splitlines():
        ts, _, title = line.partition(" ")
        if " vs " not in title:
            continue
        h, m, s = map(int, ts.split(":"))
        red, blue = title.split(" vs ", 1)
        rows.append({"t": h * 3600 + m * 60 + s, "red": red.strip(), "blue": blue.strip()})

    (OUT / "frames").mkdir(parents=True, exist_ok=True)
    matches = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, r in enumerate(rows):
            end = rows[i + 1]["t"] if i + 1 < len(rows) else r["t"] + MAX_LEN
            mid = r["t"] + min(90, (end - r["t"]) // 2)
            mid_id = f"m{a.mat}-{i + 1:03d}"
            frame(a.video, r["t"] + 20, OUT / f"frames/{mid_id}-a.jpg")
            frame(a.video, mid, OUT / f"frames/{mid_id}-b.jpg")
            div, rnd = division(a.video, r["t"], tmp)
            matches.append({**r, "id": mid_id, "end": end, "mat": a.mat, "division": div, "round": rnd})
            print(f"{i + 1}/{len(rows)} {r['red']} vs {r['blue']} · {div} · {rnd}", file=sys.stderr)

    data = {"event": {"youtube": a.youtube}, "matches": clean(matches)}
    (ROOT / "src/data/replay.json").write_text(json.dumps(data, indent=1) + "\n")


if __name__ == "__main__":
    main()
