import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import replay from "../data/replay.json";
import "../styles/replay.css";

// Post-event replays: every match from the stream, searchable by athlete or
// division, with photos. Data comes from scripts/replay/build_data.py, which
// reads match starts + the Smoothcomp scoreboard strip off the YouTube stream.

interface ReplayMatch {
  id: string; t: number; end: number; mat: number;
  red: string; blue: string; division: string; round: string;
}
interface Photo { src: string; m: ReplayMatch }

const YT = replay.event.youtube;
const M = replay.matches as ReplayMatch[];
const FRAMES = `${import.meta.env.BASE_URL}replay/frames/`;

const ATH = new Map<string, ReplayMatch[]>();
for (const m of M) for (const n of [m.red, m.blue]) ATH.set(n, [...(ATH.get(n) ?? []), m]);
const DIVS = [...new Set(M.map((m) => m.division).filter(Boolean))];
const catOf = (m: ReplayMatch) => m.division.split(" / ")[0];
const CATS = Object.entries(
  M.reduce<Record<string, number>>((a, m) => (m.division && (a[catOf(m)] = (a[catOf(m)] ?? 0) + 1), a), {}),
).sort((a, b) => b[1] - a[1]).map(([c]) => c);
const PHOTOS: Photo[] = M.flatMap((m) => ["a", "b"].map((k) => ({ src: `${FRAMES}${m.id}-${k}.jpg`, m })));
const SPAN = M[M.length - 1].end - M[0].t;

const fmt = (t: number) =>
  `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^\w\s]/g, "");
const prettyDiv = (d: string) =>
  d ? d.split(" / ").map((p) => p.toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (_, a, b) => a + b.toUpperCase())
    .replace(/Lbs/g, "lbs").replace(/Yrs|Years/g, "yrs")).join(" · ") : "Division unknown";
const shortDiv = (d: string) => (d ? prettyDiv(d).split(" · ").slice(0, 3).join(" · ") : "");

type Suggestion = { kind: string; label: string; meta: string; go: () => void };

export default function Replays() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "photos" ? "photos" : "matches";
  const athlete = ATH.has(params.get("athlete") ?? "") ? params.get("athlete")! : null;
  const cat = CATS.includes(params.get("cat") ?? "") ? params.get("cat")! : null;
  const division = DIVS.includes(params.get("division") ?? "") ? params.get("division")! : null;
  const playing = M.find((m) => m.id === params.get("match")) ?? null;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(-1);
  const [lb, setLb] = useState<{ list: Photo[]; i: number } | null>(null);
  const [toast, setToast] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);

  // Every view is a shareable URL; replace (not push) so Back leaves the page.
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    let l = athlete ? ATH.get(athlete)! : M;
    if (cat) l = l.filter((m) => catOf(m) === cat);
    if (division) l = l.filter((m) => m.division === division);
    if (!athlete && q.trim()) { const n = norm(q.trim()); l = l.filter((m) => norm(`${m.red} ${m.blue} ${m.division}`).includes(n)); }
    return l;
  }, [athlete, cat, division, q]);

  const suggestions: Suggestion[] = (() => {
    const words = norm(q.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const hit = (s: string) => words.every((w) => norm(s).split(/\s+/).some((t) => t.startsWith(w)));
    return [
      ...[...ATH.keys()].filter(hit).sort().slice(0, 6).map((n) => ({
        kind: "Athlete", label: n, meta: `${ATH.get(n)!.length} matches`, go: () => pickAthlete(n),
      })),
      ...DIVS.filter((d) => hit(prettyDiv(d))).slice(0, 3).map((d) => ({
        kind: "Division", label: shortDiv(d), meta: `${M.filter((m) => m.division === d).length} matches`, go: () => pickDivision(d),
      })),
    ];
  })();

  const pickAthlete = (n: string) => {
    setQ(""); setOpen(false);
    update({ athlete: n, cat: null, division: null, match: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pickDivision = (d: string) => { setQ(""); setOpen(false); update({ division: d, cat: null, athlete: null }); };
  const play = (m: ReplayMatch) => {
    update({ match: m.id });
    setLb(null);
    requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 1800); };
  const share = async (title: string) => {
    try {
      if (navigator.share) { await navigator.share({ title, url: location.href }); return; }
      await navigator.clipboard.writeText(location.href);
      flash("Link copied");
    } catch (err) {
      if ((err as Error).name !== "AbortError") flash("Couldn't copy, use the address bar link");
    }
  };

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowLeft") setLb((s) => s && { ...s, i: Math.max(0, s.i - 1) });
      if (e.key === "ArrowRight") setLb((s) => s && { ...s, i: Math.min(s.list.length - 1, s.i + 1) });
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [lb]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length) setSel((s) => (s + (e.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") suggestions[sel >= 0 ? sel : 0]?.go();
    else if (e.key === "Escape") setOpen(false);
  };

  const searchValue = athlete ?? (division && !q ? shortDiv(division) : q);
  const pi = playing ? list.indexOf(playing) : -1;
  const shownPhotos = PHOTOS.filter((p) => list.includes(p.m));

  const card = (m: ReplayMatch) => (
    <button key={m.id} className={`rp-card${playing === m ? " playing" : ""}`} onClick={() => play(m)}>
      <div className="rp-thumb">
        <img loading="lazy" src={`${FRAMES}${m.id}-a.jpg`} alt="" />
        {m.round && <span className="rp-round">{m.round}</span>}
        <span className="rp-ts">{fmt(m.t)}</span>
        <div className="rp-play"><span /></div>
      </div>
      <div className="rp-body">
        <div className="rp-vs">
          <span className={`rp-n${athlete === m.red ? " me" : ""}`}>{m.red}</span>
          <span className={`rp-n b${athlete === m.blue ? " me" : ""}`}>{m.blue}</span>
        </div>
        <div className="rp-div">{shortDiv(m.division)}</div>
      </div>
    </button>
  );

  const photoGrid = (photos: Photo[], cls: string) => (
    <div className={cls}>
      {photos.map((p, i) => (
        <button key={p.src} onClick={() => setLb({ list: photos, i })}>
          <img loading="lazy" src={p.src} alt={`${p.m.red} vs ${p.m.blue}`} />
        </button>
      ))}
    </div>
  );

  const lbPhoto = lb && lb.list[lb.i];

  return (
    <div className="container rp">
      <div className="rp-head">
        <h1>Replays &amp; photos</h1>
        <p>Every match, searchable. Find your athlete and jump straight to their roll.</p>
      </div>
      <div className="rp-stats">
        {([[M.length, "matches"], [ATH.size, "athletes"], [DIVS.length, "divisions"],
          [`${Math.floor(SPAN / 3600)}h ${Math.floor(SPAN / 60) % 60}m`, "of mat time"], [PHOTOS.length, "photos"]] as const)
          .map(([n, l]) => <span key={l} className="rp-stat"><b>{n}</b> {l}</span>)}
      </div>

      <div className="rp-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          type="search" placeholder="Search an athlete or division…" autoComplete="off" aria-label="Search athletes or divisions"
          value={searchValue}
          onChange={(e) => {
            setQ(e.target.value); setOpen(true); setSel(-1);
            if (athlete || division) update({ athlete: null, division: null });
          }}
          onKeyDown={onKey}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
        />
        {searchValue && (
          <button className="rp-clear" aria-label="Clear search"
            onClick={() => { setQ(""); update({ athlete: null, division: null, cat: null }); }}>×</button>
        )}
        {open && suggestions.length > 0 && (
          <div className="rp-suggest" role="listbox">
            {suggestions.map((s, i) => (
              <button key={s.kind + s.label} className={i === sel ? "on" : ""} onMouseDown={(e) => { e.preventDefault(); s.go(); }}>
                <span><span className="rp-kind">{s.kind}</span>{s.label}</span><small>{s.meta}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="rp-tabs">
        <button className={view === "matches" ? "on" : ""} onClick={() => update({ view: null })}>Matches</button>
        <button className={view === "photos" ? "on" : ""} onClick={() => update({ view: "photos" })}>Photos</button>
      </nav>

      {athlete && (() => {
        const ms = ATH.get(athlete)!;
        const divs = [...new Set(ms.map((m) => m.division).filter(Boolean))];
        return (
          <section className="rp-profile">
            <h2>{athlete}</h2>
            <div className="muted" style={{ fontSize: 14 }}>
              {ms.length} match{ms.length > 1 ? "es" : ""} · Mat {ms[0].mat}{divs.length ? " · " + divs.map(prettyDiv).join("; ") : ""}
            </div>
            <div className="row wrap" style={{ marginTop: 10, gap: 8 }}>
              <button className="btn primary" onClick={() => play(ms[0])}>▶ Watch all {ms.length}</button>
              <button className="btn" onClick={() => share(`${athlete}'s matches`)}>Share profile</button>
            </div>
          </section>
        );
      })()}

      {playing && (
        <section className="rp-player" ref={playerRef}>
          <div className="rp-video">
            <iframe key={playing.id}
              src={`https://www.youtube-nocookie.com/embed/${YT}?start=${playing.t}&autoplay=1&rel=0&playsinline=1`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
              title={`${playing.red} vs ${playing.blue}`} />
          </div>
          <div className="rp-meta">
            <div className="rp-title">
              {playing.red} vs {playing.blue}
              <span className="rp-sub">
                {[playing.round, prettyDiv(playing.division), `Mat ${playing.mat}`, fmt(playing.t)].filter(Boolean).join(" · ")}
              </span>
            </div>
            <button className="btn sm" disabled={pi <= 0} onClick={() => play(list[pi - 1])}>‹ Prev</button>
            <button className="btn sm" disabled={pi < 0 || pi >= list.length - 1} onClick={() => play(list[pi + 1])}>Next ›</button>
            <button className="btn sm" onClick={() => share(`${playing.red} vs ${playing.blue}`)}>Share</button>
            <a className="btn sm" href={`https://www.youtube.com/watch?v=${YT}&t=${playing.t}s`} target="_blank" rel="noopener">YouTube ↗</a>
          </div>
        </section>
      )}

      {!athlete && (
        <div className="rp-chips">
          {division && <button className="rp-chip on" onClick={() => update({ division: null })}>{shortDiv(division)} ×</button>}
          <button className={`rp-chip${cat || division ? "" : " on"}`} onClick={() => update({ cat: null, division: null })}>All</button>
          {CATS.map((c) => (
            <button key={c} className={`rp-chip${cat === c && !division ? " on" : ""}`}
              onClick={() => { setQ(""); update({ cat: c, division: null }); }}>{prettyDiv(c)}</button>
          ))}
        </div>
      )}

      {view === "matches" ? (
        <>
          {list.length ? (
            <>
              <div className="rp-section-h">
                <h3>{athlete ? "Matches" : division ? prettyDiv(division) : cat ? prettyDiv(cat) : "All matches"}</h3>
                <small>{list.length} · in stream order</small>
              </div>
              <div className="rp-grid">{list.map(card)}</div>
            </>
          ) : (
            <div className="rp-empty">No matches for “{q}”. Try a first or last name.</div>
          )}
          {athlete && (
            <>
              <div className="rp-section-h"><h3>Photos of {athlete.split(" ")[0]}</h3><small>{shownPhotos.length}</small></div>
              {photoGrid(shownPhotos, "rp-strip")}
            </>
          )}
        </>
      ) : (
        <>
          <div className="rp-note">
            <b>Stand-in photos:</b> these are frames pulled from the stream. At a real event, the photographer's shots get
            auto-tagged to each athlete by matching the photo's timestamp to the match time.
          </div>
          {shownPhotos.length ? photoGrid(shownPhotos, "rp-photos") : <div className="rp-empty">No photos match.</div>}
        </>
      )}

      <div className="rp-next">
        <h4>Proof of concept — what's next</h4>
        <ul>
          <li>All mats, every event: chapters and divisions are read automatically from the scoreboard on the stream, no manual tagging.</li>
          <li>Photographer uploads auto-tagged to athletes by matching photo timestamps to match times.</li>
          <li>Results and medals next to each match, straight from the bracket.</li>
          <li>"My matches" highlight reel and a notification when an athlete's videos are ready.</li>
          <li>Parent opt-out for kids' photos and names.</li>
        </ul>
      </div>

      {lbPhoto && (
        <div className="rp-lb" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setLb(null)}>
          <button className="rp-lb-x" aria-label="Close" onClick={() => setLb(null)}>×</button>
          <button className="rp-lb-nav prev" aria-label="Previous photo" disabled={lb.i === 0}
            onClick={() => setLb({ ...lb, i: lb.i - 1 })}>‹</button>
          <img src={lbPhoto.src} alt="" />
          <div className="rp-lb-cap">
            <div>{lbPhoto.m.red} vs {lbPhoto.m.blue}</div>
            <div className="muted" style={{ fontSize: 13 }}>{prettyDiv(lbPhoto.m.division)} · {fmt(lbPhoto.m.t)}</div>
            <div className="rp-lb-row">
              <button className="btn primary" onClick={() => play(lbPhoto.m)}>▶ Watch this match</button>
              <a className="btn" href={lbPhoto.src} download>Download</a>
            </div>
          </div>
          <button className="rp-lb-nav next" aria-label="Next photo" disabled={lb.i === lb.list.length - 1}
            onClick={() => setLb({ ...lb, i: lb.i + 1 })}>›</button>
        </div>
      )}

      {toast && <div className="rp-toast">{toast}</div>}
    </div>
  );
}
