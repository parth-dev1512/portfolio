/* global React */
const { useState, useRef, useEffect } = React;

// ─────────────────────────────────────────────────────────────────────────────
// One knob, three stops. Each stop is a fully-formed portfolio "mode".
// ─────────────────────────────────────────────────────────────────────────────

const STOPS = [
  {
    id: 'code',
    label: 'code',
    icon: 'brackets',
    blurb: 'repos & systems',
    eyebrow: '/index/',
    title: 'works.json',
    subtitle: 'open-source, side projects, tools. sorted by year, filterable.',
    nav: ['/repos', '/talks', '/notes', '/about'],
    filters: ['all', 'web', 'systems', 'ml', 'tools', 'open-source'],
    cols: 6,
    items: 24,
    accent: '#1a1a1a',
    headingFont: 'Georgia, serif',
    headingItalic: false,
    bodyFont: 'ui-monospace, monospace',
    headerBg: '#f6f1e6',
    tileBg: 'repeating-linear-gradient(0deg, #f4f1ea 0 2px, #e0d9c8 2px 4px)',
    tilt: 0,
    sketchy: false,
    tilePrefix: 'repo',
    tileLabels: [
      'synth-engine', 'graph-store', 'tiny-renderer', 'webrtc-relay',
      'log-parser', 'ml-sandbox', 'cli-tools', 'dotfiles',
      'bezier-lab', 'csv-fmt', 'plot-kit', 'dns-probe',
      'shader-toy', 'ast-walker', 'ring-buffer', 'fuzz-runner',
      'pubsub-mini', 'http-trace', 'rate-limit', 'state-fsm',
      'b-tree', 'json-fix', 'site-gen', 'midi-bridge',
    ],
  },
  {
    id: 'words',
    label: 'words',
    icon: 'pen',
    blurb: 'essays & notes',
    eyebrow: '— a reading room —',
    title: 'collected writing',
    subtitle: 'essays, notes, fragments. on craft, time, and small inventions.',
    nav: ['essays', 'notes', 'reading', 'about'],
    filters: ['all', 'essays', 'notes', 'reviews', 'fragments', 'translations'],
    cols: 2,
    items: 8,
    accent: '#5a3a1a',
    headingFont: 'Georgia, serif',
    headingItalic: true,
    bodyFont: 'Georgia, serif',
    headerBg: '#fbf6e8',
    tileBg: 'linear-gradient(180deg, #fbf6e8 0%, #f4ecd8 100%)',
    tilt: 0,
    sketchy: false,
    tilePrefix: 'essay',
    tileLabels: [
      'on slow craft', 'a defense of margins', 'noise as material',
      'the shape of an hour', 'six gardens', 'on rereading',
      'against productivity', 'a small grammar of wonder',
    ],
  },
  {
    id: 'screen',
    label: 'screen',
    icon: 'film',
    blurb: 'photos & film',
    eyebrow: 'reel',
    title: 'screen & shutter',
    subtitle: 'photographs, film stills, video pieces. mostly walking, mostly slow.',
    nav: ['photos', 'film', 'video', 'about'],
    filters: ['all', '35mm', 'digital', 'film stills', 'video', 'archive'],
    cols: 4,
    items: 16,
    accent: '#1a1a1a',
    headingFont: '"Caveat", cursive',
    headingItalic: false,
    bodyFont: 'Georgia, serif',
    headerBg: '#1a1a1a',
    headerColor: '#f6f1e6',
    tileBg: 'repeating-linear-gradient(45deg, #2a2a2a 0 8px, #3a3a3a 8px 16px)',
    tileLight: false,
    tilt: 0,
    sketchy: true,
    tilePrefix: 'frame',
    tileLabels: [
      'venice 22 · roof', 'studio · 04', 'river · winter', 'door · 11',
      'sky · august', 'night · cab', 'field · dawn', 'self · 03',
      'still 01', 'still 04', 'still 09', 'still 11',
      'hallway', 'kitchen · 6am', 'bridge', 'station',
    ],
  },
  {
    id: 'venture',
    label: 'venture',
    icon: 'compass',
    blurb: 'companies & bets',
    eyebrow: '/ventures/',
    title: 'things i started',
    subtitle: 'companies, products, bets. some live, some folded, all instructive.',
    nav: ['ventures', 'investments', 'advising', 'about'],
    filters: ['all', 'founded', 'co-founded', 'advised', 'invested', 'sunset'],
    cols: 3,
    items: 9,
    accent: '#2a4a8a',
    headingFont: 'Georgia, serif',
    headingItalic: false,
    bodyFont: 'ui-monospace, monospace',
    headerBg: '#eef0f4',
    tileBg: 'linear-gradient(135deg, #f4f1ea 0%, #e0e3ea 100%)',
    tilt: 0,
    sketchy: false,
    tilePrefix: 'co',
    tileLabels: [
      'koto · ’22 · live',
      'paperhand · ’21 · sunset',
      'orbit.fm · ’23 · live',
      'meridian · ’20 · acq.',
      'long lane · ’24 · live',
      'glasswork · ’19 · sunset',
      'minim · ’23 · advised',
      'archive labs · ’22 · invested',
      'tidemark · ’24 · stealth',
    ],
  },
  {
    id: 'stage',
    label: 'stage',
    icon: 'spark',
    blurb: 'talks & performance',
    eyebrow: '★ tonight\'s programme ★',
    title: 'on stage',
    subtitle: 'talks, readings, performances, sets. the things that need a room.',
    nav: ['talks', 'readings', 'sets', 'about'],
    filters: ['all', 'talks', 'readings', 'panels', 'dj sets', 'workshops'],
    cols: 1,
    items: 7,
    accent: '#9a2a3a',
    headingFont: '"Caveat", cursive',
    headingItalic: false,
    bodyFont: 'Georgia, serif',
    headerBg: '#fbf0ec',
    tileBg: 'repeating-linear-gradient(45deg, #f4f1ea 0 8px, #e8d8d4 8px 16px)',
    tilt: 1,
    sketchy: true,
    tilePrefix: 'set',
    tileLabels: [
      'on slow software · strange loop · sept ’25',
      'the long here · poetry house · jun ’25',
      'panel · interfaces of attention · mar ’25',
      'reading · field notes · feb ’25',
      'dj set · loose · dec ’24',
      'workshop · making in public · oct ’24',
      'keynote · craft & code · sept ’24',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const Icon = ({ kind, size = 18, color = '#1a1a1a' }) => {
  const s = size;
  const c = color;
  switch (kind) {
    case 'brackets':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M7 3 Q3 5 3 10 Q3 15 7 17" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M13 3 Q17 5 17 10 Q17 15 13 17" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'pen':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M4 16 L13 7 L15 9 L6 18 Z" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round" transform="translate(0,-2)" />
          <path d="M13 5 L15 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M3 17 L17 17" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'film':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="6" width="14" height="9" stroke={c} strokeWidth="1.4" fill="none" />
          <rect x="3" y="4" width="2" height="2" fill={c} />
          <rect x="7" y="4" width="2" height="2" fill={c} />
          <rect x="11" y="4" width="2" height="2" fill={c} />
          <rect x="15" y="4" width="2" height="2" fill={c} />
          <rect x="3" y="15" width="2" height="2" fill={c} />
          <rect x="7" y="15" width="2" height="2" fill={c} />
          <rect x="11" y="15" width="2" height="2" fill={c} />
          <rect x="15" y="15" width="2" height="2" fill={c} />
        </svg>
      );
    case 'compass':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke={c} strokeWidth="1.4" fill="none" />
          <path d="M10 5 L12 10 L10 15 L8 10 Z" stroke={c} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
          <circle cx="10" cy="10" r="1.2" fill={c} />
        </svg>
      );
    case 'spark':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M10 3 L11.2 8.8 L17 10 L11.2 11.2 L10 17 L8.8 11.2 L3 10 L8.8 8.8 Z" stroke={c} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const Sketch = ({ children }) => (
  <span style={{ display: 'inline-block', position: 'relative' }}>
    {children}
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: -3, width: '100%', height: 5 }}
    >
      <path d="M2,4 Q25,1 50,3 T98,3" stroke="#1a1a1a" strokeWidth="1.2" fill="none" />
    </svg>
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// The single big knob bar
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_PAD = 60;

const ControlBar = ({ value, onChange }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = trackRef.current.getBoundingClientRect();
      const usable = rect.width - TRACK_PAD * 2;
      const ratio = Math.max(0, Math.min(1, (x - rect.left - TRACK_PAD) / usable));
      const idx = Math.round(ratio * (STOPS.length - 1));
      onChange(idx);
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, onChange]);

  const ratio = value / (STOPS.length - 1);
  const stop = STOPS[value];

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #1a1a1a',
        boxShadow: '4px 5px 0 rgba(0,0,0,0.12)',
        padding: '24px 32px 30px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6a6a6a',
            }}
          >
            tune the portfolio →
          </div>
          <h2 style={{ fontFamily: '"Caveat", cursive', fontSize: 32, margin: '4px 0 0', lineHeight: 1, whiteSpace: 'nowrap' }}>
            <Sketch>five modes, one knob</Sketch>
          </h2>
        </div>
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
            color: '#1a1a1a',
            border: '1px dashed #1a1a1a',
            padding: '4px 10px',
            background: '#f6f1e6',
            whiteSpace: 'nowrap',
          }}
        >
          mode: {stop.label} · {stop.blurb}
        </div>
      </div>

      {/* the big track */}
      <div
        ref={trackRef}
        onMouseDown={(e) => {
          setDragging(true);
          const rect = trackRef.current.getBoundingClientRect();
          const usable = rect.width - TRACK_PAD * 2;
          const r = Math.max(0, Math.min(1, (e.clientX - rect.left - TRACK_PAD) / usable));
          onChange(Math.round(r * (STOPS.length - 1)));
        }}
        style={{
          position: 'relative',
          height: 110,
          background: '#f6f1e6',
          border: '1.5px solid #1a1a1a',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* track line */}
        <div
          style={{
            position: 'absolute',
            left: TRACK_PAD,
            right: TRACK_PAD,
            top: '50%',
            height: 3,
            background: '#1a1a1a',
            transform: 'translateY(-50%)',
          }}
        />

        {/* stops */}
        {STOPS.map((s, i) => {
          const r = i / (STOPS.length - 1);
          const active = i === value;
          return (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                left: `calc(${TRACK_PAD}px + ${r} * (100% - ${TRACK_PAD * 2}px))`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* notch dot */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  border: '2px solid #f6f1e6',
                  boxShadow: '0 0 0 1.5px #1a1a1a',
                }}
              />
              {/* stop icon above */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: -34,
                  transform: 'translateX(-50%)',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: '1.5px solid #1a1a1a',
                  background: active ? '#1a1a1a' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Icon kind={s.icon} size={16} color={active ? '#f6f1e6' : '#1a1a1a'} />
              </div>
              {/* stop label below */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 18,
                  transform: 'translateX(-50%)',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: active ? '#1a1a1a' : '#9a9a9a',
                  fontWeight: active ? 700 : 400,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {s.label}
              </div>
              {/* blurb under label */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 34,
                  transform: 'translateX(-50%)',
                  fontFamily: '"Caveat", cursive',
                  fontSize: 14,
                  color: active ? '#b8431a' : '#bcbcbc',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {s.blurb}
              </div>
            </div>
          );
        })}

        {/* the big circular knob */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging(true);
          }}
          onTouchStart={(e) => {
            setDragging(true);
          }}
          style={{
            position: 'absolute',
            left: `calc(${TRACK_PAD}px + ${ratio} * (100% - ${TRACK_PAD * 2}px))`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#1a1a1a',
            border: '2px solid #1a1a1a',
            boxShadow: dragging ? '6px 6px 0 #b8431a' : '3px 3px 0 #b8431a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: dragging ? 'grabbing' : 'grab',
            transition: dragging ? 'none' : 'left 0.3s cubic-bezier(0.4, 1.5, 0.6, 1), box-shadow 0.15s',
            zIndex: 6,
          }}
        >
          {/* knob face: shows current stop's icon */}
          <Icon kind={stop.icon} size={28} color="#f6f1e6" />
          {/* small indicator dot at top of knob */}
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#b8431a',
            }}
          />
        </div>
      </div>

      {/* hint row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 14,
          fontFamily: '"Caveat", cursive',
          fontSize: 16,
          color: '#b8431a',
        }}
      >
        <span>← drag the knob, or click a stop</span>
        <span>{stop.id === 'code' ? '{ structured }' : stop.id === 'stage' ? '✦ on stage ✦' : 'one mode at a time'}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Preview — renders the page in the selected stop's mode
// ─────────────────────────────────────────────────────────────────────────────

const TILE_LABELS = [
  'project · synth', 'photo · venice', 'essay · craft', 'project · garden',
  'sketch · birds', 'photo · roof', 'project · loop', 'essay · time',
  'film still 04', 'project · type', 'photo · river', 'project · zine',
  'sketch · hand', 'photo · sky', 'project · lab', 'photo · door',
  'film still 11', 'project · tea', 'essay · noise', 'photo · field',
  'project · bot', 'sketch · hat', 'photo · night', 'project · map',
];

const Preview = ({ stop }) => {
  const isCode = stop.id === 'code';
  const isWords = stop.id === 'words';
  const isScreen = stop.id === 'screen';
  const isVenture = stop.id === 'venture';
  const isStage = stop.id === 'stage';

  const useMonoNav = isCode || isVenture;
  const headerColor = stop.headerColor || '#1a1a1a';

  const meta = (i) => {
    if (isCode) return `${stop.tileLabels[i % stop.tileLabels.length]}`;
    return stop.tileLabels[i % stop.tileLabels.length];
  };

  // tile shape varies per mode
  const tileHeight = (i) => {
    if (isWords) return 130;
    if (isStage) return 70;
    if (isVenture) return 130;
    if (isScreen) return 130;
    return 110; // code
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #1a1a1a',
        boxShadow: '4px 5px 0 rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* header band */}
      <div
        style={{
          padding: '20px 26px 18px',
          borderBottom: '1.5px solid #1a1a1a',
          background: stop.headerBg,
          color: headerColor,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: isScreen ? '#bcbcbc' : '#6a6a6a',
            }}
          >
            {stop.eyebrow}
          </div>
          <h1
            style={{
              fontFamily: stop.headingFont,
              fontStyle: stop.headingItalic ? 'italic' : 'normal',
              fontSize: isCode ? 28 : 34,
              margin: '4px 0 4px',
              lineHeight: 1,
              color: isScreen ? '#f6f1e6' : stop.accent,
              whiteSpace: 'nowrap',
            }}
          >
            {stop.sketchy ? <Sketch>{stop.title}</Sketch> : stop.title}
          </h1>
          <p
            style={{
              fontFamily: stop.bodyFont,
              fontSize: 12,
              margin: 0,
              color: isScreen ? '#cfc8b8' : '#3a3a3a',
              maxWidth: 480,
              lineHeight: 1.4,
            }}
          >
            {stop.subtitle}
          </p>
        </div>

        <nav
          style={{
            display: 'flex',
            gap: useMonoNav ? 4 : 14,
            fontFamily: useMonoNav ? 'ui-monospace, monospace' : '"Caveat", cursive',
            fontSize: useMonoNav ? 11 : 18,
            color: headerColor,
            alignItems: 'center',
          }}
        >
          {stop.nav.map((n, i) => (
            <span
              key={n}
              style={{
                padding: useMonoNav ? '2px 6px' : '0 4px',
                border: useMonoNav ? `1px solid ${headerColor}` : 'none',
                borderBottom: !useMonoNav && i === 0 ? `1.5px solid ${stop.accent}` : undefined,
              }}
            >
              {n}
            </span>
          ))}
        </nav>
      </div>

      {/* filter strip */}
      <div
        style={{
          padding: '10px 26px',
          borderBottom: '1px dashed #1a1a1a',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10,
          color: '#1a1a1a',
          background: '#fbfaf5',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {isWords ? 'index:' : isStage ? 'when:' : 'filter:'}
        </span>
        {stop.filters.map((f, i) => (
          <span
            key={f}
            style={{
              padding: '2px 7px',
              border: '1px solid #1a1a1a',
              background: i === 0 ? '#1a1a1a' : 'transparent',
              color: i === 0 ? '#f6f1e6' : '#1a1a1a',
              textTransform: 'lowercase',
            }}
          >
            {f}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#6a6a6a' }}>
          showing {stop.items} of {isCode ? 142 : isWords ? 38 : isScreen ? 220 : isVenture ? 12 : 24}
        </span>
      </div>

      {/* the work grid */}
      <div
        style={{
          padding: isStage ? '6px 22px 22px' : 22,
          display: 'grid',
          gridTemplateColumns: `repeat(${stop.cols}, 1fr)`,
          gap: isStage ? 0 : 12,
        }}
      >
        {Array.from({ length: stop.items }).map((_, i) => {
          // STAGE mode = list rows, not tiles
          if (isStage) {
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '12px 4px',
                  borderBottom: '1px dashed #1a1a1a',
                  fontFamily: 'Georgia, serif',
                  fontSize: 14,
                  gap: 16,
                }}
              >
                <span style={{ color: stop.accent, fontFamily: '"Caveat", cursive', fontSize: 22, minWidth: 28 }}>
                  ★
                </span>
                <span style={{ flex: 1, color: '#1a1a1a' }}>{stop.tileLabels[i]}</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#6a6a6a' }}>
                  [ #{String(i + 1).padStart(2, '0')} ]
                </span>
              </div>
            );
          }

          // WORDS mode = essay cards with title + read estimate
          if (isWords) {
            return (
              <div
                key={i}
                style={{
                  border: '1.5px solid #1a1a1a',
                  background: stop.tileBg,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  minHeight: tileHeight(i),
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: '#6a6a6a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  essay · 0{i + 1} · {6 + (i % 9)} min
                </span>
                <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, margin: '4px 0 0', color: stop.accent, lineHeight: 1.1 }}>
                  {stop.tileLabels[i]}
                </h3>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 11, color: '#3a3a3a' }}>
                  ——— a short opening sentence sits here, in italics, like a pull quote.
                </div>
              </div>
            );
          }

          // VENTURE mode = labeled cards with status pill
          if (isVenture) {
            const [name, year, status] = stop.tileLabels[i].split(' · ');
            return (
              <div
                key={i}
                style={{
                  border: '1.5px solid #1a1a1a',
                  background: stop.tileBg,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  minHeight: tileHeight(i),
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                <span style={{ fontSize: 9, color: '#6a6a6a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {year}
                </span>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, margin: 0, color: stop.accent, lineHeight: 1.1 }}>
                  {name}
                </h3>
                <div style={{ flex: 1 }} />
                <span
                  style={{
                    alignSelf: 'flex-start',
                    border: `1px solid ${stop.accent}`,
                    color: stop.accent,
                    padding: '1px 7px',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {status}
                </span>
              </div>
            );
          }

          // CODE / SCREEN modes = image-tile style
          const featured = isScreen && (i === 0 || i === 7);
          const h = featured ? tileHeight(i) * 1.4 : tileHeight(i);
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                height: h,
                gridColumn: featured ? 'span 2' : 'span 1',
                border: '1.5px solid #1a1a1a',
                background: stop.tileBg,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                overflow: 'hidden',
                transform: stop.tilt ? `rotate(${(i % 5) - 2 > 0 ? 0.6 : -0.6}deg)` : undefined,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderTop: '1px solid #1a1a1a',
                  padding: '4px 7px',
                  fontFamily: isCode ? 'ui-monospace, monospace' : 'Georgia, serif',
                  fontSize: 10,
                  color: '#1a1a1a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 6,
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {meta(i)}
                </span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: stop.accent }}>
                  {isCode ? `[${i + 1}]` : isScreen ? '✦' : '·'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* footer band */}
      <div
        style={{
          padding: '10px 26px',
          borderTop: '1px dashed #1a1a1a',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10,
          color: '#6a6a6a',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          background: '#fbfaf5',
        }}
      >
        <span>mode · {stop.label}</span>
        <span>{stop.blurb}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const TunablePortfolioPage = () => {
  const [value, setValue] = useState(2); // start at screen (middle of 5)
  const stop = STOPS[value];

  return (
    <div
      style={{
        background: '#ece6d8',
        minHeight: '100vh',
        padding: '36px 48px 60px',
        fontFamily: 'ui-monospace, monospace',
        color: '#1a1a1a',
      }}
    >
      {/* tiny page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#1a1a1a',
          marginBottom: 18,
        }}
      >
        <span>your name · portfolio</span>
        <span style={{ color: '#6a6a6a' }}>v2 · single-knob index</span>
      </div>

      <ControlBar value={value} onChange={setValue} />

      <div style={{ height: 22 }} />

      <Preview stop={stop} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22,
          marginTop: 22,
          fontFamily: '"Caveat", cursive',
          fontSize: 16,
          color: '#b8431a',
          lineHeight: 1.2,
        }}
      >
        <div>
          ← five notches on the bar.
          <br />
          knob snaps to the nearest one.
        </div>
        <div style={{ textAlign: 'right' }}>
          everything below re-renders →
          <br />
          type, color, layout, copy, density.
        </div>
      </div>
    </div>
  );
};

window.TunablePortfolioPage = TunablePortfolioPage;
