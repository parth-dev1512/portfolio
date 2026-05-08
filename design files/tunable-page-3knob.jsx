/* global React */
const { useState, useRef, useEffect } = React;

// ─────────────────────────────────────────────────────────────────────────────
// AXES: each knob owns one. 3 stops per knob = 27 combos; we feature 5 presets.
// ─────────────────────────────────────────────────────────────────────────────

const AXES = [
  {
    key: 'discipline',
    label: 'discipline',
    icon: 'brackets', // left-end icon
    iconRight: 'scribble', // right-end icon
    stops: ['tech', 'craft', 'creative'],
    hint: 'how the work is framed',
  },
  {
    key: 'density',
    label: 'density',
    icon: 'sparse',
    iconRight: 'dense',
    stops: ['sparse', 'regular', 'packed'],
    hint: 'how much fits on screen',
  },
  {
    key: 'tone',
    label: 'tone',
    icon: 'serious',
    iconRight: 'playful',
    stops: ['serious', 'studio', 'playful'],
    hint: 'voice + visual mood',
  },
];

// 5 named presets — combos of (discipline, density, tone) indices 0..2
const PRESETS = [
  { id: 'p1', name: 'engineer\'s log',  combo: [0, 2, 0], blurb: 'tech · packed · serious' },
  { id: 'p2', name: 'studio index',     combo: [1, 1, 1], blurb: 'craft · regular · studio' },
  { id: 'p3', name: 'gallery',          combo: [2, 0, 1], blurb: 'creative · sparse · studio' },
  { id: 'p4', name: 'sketchbook',       combo: [2, 2, 2], blurb: 'creative · packed · playful' },
  { id: 'p5', name: 'whitepaper',       combo: [0, 0, 0], blurb: 'tech · sparse · serious' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Icons (tiny SVG glyphs for the knob faces + endpoint markers)
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
    case 'scribble':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 13 Q5 7 8 11 Q10 15 12 9 Q14 4 17 11" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'sparse':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="6" cy="6" r="1.4" fill={c} />
          <circle cx="14" cy="14" r="1.4" fill={c} />
        </svg>
      );
    case 'dense':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          {[3, 7, 11, 15].map((x) =>
            [3, 7, 11, 15].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill={c} />
            ))
          )}
        </svg>
      );
    case 'serious':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <line x1="3" y1="10" x2="17" y2="10" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'playful':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 12 Q7 6 10 12 Q13 18 17 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return null;
  }
};

// Sketchy wavy underline (reused)
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
// The control bar
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_PAD = 56; // px from each end of the track to the first/last stop

const ControlBar = ({ values, onChange, presetId }) => {
  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #1a1a1a',
        boxShadow: '4px 5px 0 rgba(0,0,0,0.12)',
        padding: '24px 28px 22px',
        position: 'relative',
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
          <h2
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 30,
              margin: '4px 0 0',
              lineHeight: 1,
            }}
          >
            <Sketch>three knobs, one site</Sketch>
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
            flexShrink: 0,
          }}
        >
          preset: {presetId ? presetId : '— custom —'}
        </div>
      </div>

      {AXES.map((axis, i) => (
        <Track
          key={axis.key}
          axis={axis}
          value={values[i]}
          onChange={(v) => {
            const next = [...values];
            next[i] = v;
            onChange(next);
          }}
        />
      ))}
    </div>
  );
};

const Track = ({ axis, value, onChange }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // drag handler
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const rect = trackRef.current.getBoundingClientRect();
      const usable = rect.width - TRACK_PAD * 2;
      const ratio = Math.max(0, Math.min(1, (x - rect.left - TRACK_PAD) / usable));
      const idx = Math.round(ratio * (axis.stops.length - 1));
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
  }, [dragging, axis, onChange]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px', alignItems: 'center', gap: 18, marginBottom: 14 }}>
      {/* left label */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}
        >
          {axis.label}
        </div>
        <div style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: '#6a6a6a', lineHeight: 1.1 }}>
          {axis.hint}
        </div>
      </div>

      {/* the track itself */}
      <div
        ref={trackRef}
        onMouseDown={(e) => {
          setDragging(true);
          // jump-to-click
          const rect = trackRef.current.getBoundingClientRect();
          const usable = rect.width - TRACK_PAD * 2;
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left - TRACK_PAD) / usable));
          const idx = Math.round(ratio * (axis.stops.length - 1));
          onChange(idx);
        }}
        style={{
          position: 'relative',
          height: 56,
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
            height: 2,
            background: '#1a1a1a',
            transform: 'translateY(-50%)',
          }}
        />

        {/* stops */}
        {axis.stops.map((stop, i) => {
          const ratio = i / (axis.stops.length - 1);
          return (
            <div
              key={stop}
              style={{
                position: 'absolute',
                left: `calc(${TRACK_PAD}px + ${ratio} * (100% - ${TRACK_PAD * 2}px))`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#1a1a1a',
              }}
            />
          );
        })}

        {/* stop labels — placed ABOVE the track so the knob doesn't cover them */}
        {axis.stops.map((stop, i) => {
          const ratio = i / (axis.stops.length - 1);
          return (
            <div
              key={stop + '-l'}
              style={{
                position: 'absolute',
                left: `calc(${TRACK_PAD}px + ${ratio} * (100% - ${TRACK_PAD * 2}px))`,
                top: 4,
                transform: 'translateX(-50%)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 9,
                color: i === value ? '#1a1a1a' : '#9a9a9a',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: i === value ? 700 : 400,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {stop}
            </div>
          );
        })}

        {/* endpoint icons */}
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>
          <Icon kind={axis.icon} size={20} />
        </div>
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
          <Icon kind={axis.iconRight} size={20} />
        </div>

        {/* the knob */}
        <Knob
          ratio={value / (axis.stops.length - 1)}
          axis={axis}
          stop={axis.stops[value]}
          dragging={dragging}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging(true);
          }}
        />
      </div>

      {/* right value readout */}
      <div
        style={{
          fontFamily: '"Caveat", cursive',
          fontSize: 22,
          color: '#b8431a',
          lineHeight: 1,
        }}
      >
        <Sketch>{axis.stops[value]}</Sketch>
      </div>
    </div>
  );
};

const Knob = ({ ratio, axis, stop, dragging, onMouseDown }) => {
  // pick which icon to show on the knob face based on stop position
  const iconKind =
    stop === axis.stops[0]
      ? axis.icon
      : stop === axis.stops[axis.stops.length - 1]
      ? axis.iconRight
      : null;

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      style={{
        position: 'absolute',
        left: `calc(${TRACK_PAD}px + ${ratio} * (100% - ${TRACK_PAD * 2}px))`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: '#1a1a1a',
        border: '1.5px solid #1a1a1a',
        boxShadow: dragging
          ? '4px 4px 0 #b8431a'
          : '2px 2px 0 #b8431a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        transition: dragging ? 'none' : 'left 0.25s cubic-bezier(0.4, 1.6, 0.6, 1), box-shadow 0.15s',
        zIndex: 4,
      }}
    >
      {iconKind ? (
        <Icon kind={iconKind} size={18} color="#f6f1e6" />
      ) : (
        <span
          style={{
            fontFamily: '"Caveat", cursive',
            fontSize: 14,
            color: '#f6f1e6',
            lineHeight: 1,
          }}
        >
          {stop[0]}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Preset chips
// ─────────────────────────────────────────────────────────────────────────────

const PresetRow = ({ activeId, onPick }) => (
  <div
    style={{
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '12px 0 18px',
    }}
  >
    <span
      style={{
        fontFamily: 'ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#6a6a6a',
        marginRight: 4,
      }}
    >
      jump to →
    </span>
    {PRESETS.map((p) => {
      const active = p.id === activeId;
      return (
        <button
          key={p.id}
          onClick={() => onPick(p)}
          style={{
            fontFamily: '"Caveat", cursive',
            fontSize: 18,
            padding: '4px 12px 5px',
            background: active ? '#1a1a1a' : '#fff',
            color: active ? '#f6f1e6' : '#1a1a1a',
            border: '1.5px solid #1a1a1a',
            cursor: 'pointer',
            boxShadow: active ? '2px 2px 0 #b8431a' : '2px 2px 0 rgba(0,0,0,0.12)',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
          title={p.blurb}
        >
          {p.name}
        </button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Preview area — adapts to the (discipline, density, tone) combo
// ─────────────────────────────────────────────────────────────────────────────

const TILE_LABELS = [
  'project · synth',
  'photo · venice',
  'essay · craft',
  'project · garden',
  'sketch · birds',
  'photo · roof',
  'project · loop',
  'essay · time',
  'film still 04',
  'project · type',
  'photo · river',
  'project · zine',
  'sketch · hand',
  'photo · sky',
  'project · lab',
  'photo · door',
  'film still 11',
  'project · tea',
  'essay · noise',
  'photo · field',
  'project · bot',
  'sketch · hat',
  'photo · night',
  'project · map',
];

const Preview = ({ values, presetId }) => {
  const [discipline, density, tone] = values; // each 0..2
  const isTech = discipline === 0;
  const isCraft = discipline === 1;
  const isCreative = discipline === 2;

  // density -> grid cols + visible items
  const cols = density === 0 ? 3 : density === 1 ? 5 : 7;
  const items = density === 0 ? 6 : density === 1 ? 15 : 28;

  // tone -> font + color accent
  const heading =
    tone === 0
      ? { fontFamily: 'Georgia, serif', fontStyle: 'normal' }
      : tone === 1
      ? { fontFamily: '"Caveat", cursive', fontStyle: 'normal' }
      : { fontFamily: '"Caveat", cursive', fontStyle: 'italic' };

  const accent = tone === 0 ? '#1a1a1a' : tone === 1 ? '#b8431a' : '#3a6e3f';

  // discipline -> framing copy
  const eyebrow = isTech ? '/index/' : isCraft ? 'studio' : '~ a small museum ~';
  const title = isTech ? 'works.json' : isCraft ? 'selected works' : 'things i made';
  const subtitle = isTech
    ? 'sorted by year. filterable. checksum verified.'
    : isCraft
    ? 'a working catalogue. updated on the slow cadence.'
    : 'photos, sounds, gardens, code, and other small inventions.';

  // discipline -> tile treatment
  const tileBg = isTech
    ? 'repeating-linear-gradient(0deg, #f4f1ea 0 2px, #e0d9c8 2px 4px)'
    : isCreative
    ? 'repeating-linear-gradient(45deg, #f4f1ea 0 8px, #e0d9c8 8px 16px)'
    : 'repeating-linear-gradient(90deg, #f4f1ea 0 6px, #e8e2d4 6px 12px)';

  const meta = (i) =>
    isTech
      ? `id:${String(i).padStart(3, '0')}.${(2020 + (i % 6))}`
      : isCraft
      ? TILE_LABELS[i % TILE_LABELS.length]
      : TILE_LABELS[i % TILE_LABELS.length];

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #1a1a1a',
        boxShadow: '4px 5px 0 rgba(0,0,0,0.12)',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* header band */}
      <div
        style={{
          padding: density === 2 ? '14px 22px' : '20px 26px 18px',
          borderBottom: '1.5px solid #1a1a1a',
          background: isTech ? '#f6f1e6' : isCreative ? '#fff' : '#fbf6e8',
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
              color: '#6a6a6a',
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              ...heading,
              fontSize: tone === 0 ? 28 : 36,
              margin: '4px 0 4px',
              lineHeight: 1,
              color: accent,
            }}
          >
            {tone === 0 ? title : <Sketch>{title}</Sketch>}
          </h1>
          <p
            style={{
              fontFamily: isTech
                ? 'ui-monospace, monospace'
                : 'Georgia, serif',
              fontSize: 12,
              margin: 0,
              color: '#3a3a3a',
              maxWidth: 480,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* nav strip — varies by discipline */}
        <nav
          style={{
            display: 'flex',
            gap: isTech ? 4 : 12,
            fontFamily: isTech ? 'ui-monospace, monospace' : '"Caveat", cursive',
            fontSize: isTech ? 11 : 16,
            color: '#1a1a1a',
            alignItems: 'center',
          }}
        >
          {(isTech
            ? ['/code', '/writing', '/photo', '/about']
            : ['code', 'writing', 'photos', 'about']
          ).map((n, i) => (
            <span
              key={n}
              style={{
                padding: isTech ? '2px 6px' : '0 4px',
                border: isTech ? '1px solid #1a1a1a' : 'none',
                borderBottom: !isTech ? '1.5px solid transparent' : undefined,
                ...(i === 0 && !isTech ? { borderBottom: `1.5px solid ${accent}` } : {}),
              }}
            >
              {n}
            </span>
          ))}
        </nav>
      </div>

      {/* filter strip — only at higher density */}
      {density >= 1 && (
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
            filter:
          </span>
          {(isTech
            ? ['all', 'web', 'systems', 'ml', 'tools', 'open-source']
            : ['all', 'visual', 'sound', 'words', 'objects', 'gardens']
          ).map((f, i) => (
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
          {density === 2 && (
            <span style={{ marginLeft: 'auto', color: '#6a6a6a' }}>
              showing {items} of 142
            </span>
          )}
        </div>
      )}

      {/* the work grid */}
      <div
        style={{
          padding: density === 2 ? 14 : density === 1 ? 22 : 32,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: density === 2 ? 6 : density === 1 ? 12 : 20,
        }}
      >
        {Array.from({ length: items }).map((_, i) => (
          <WorkTile
            key={i}
            i={i}
            label={meta(i)}
            tileBg={tileBg}
            isTech={isTech}
            isCreative={isCreative}
            density={density}
            tone={tone}
            accent={accent}
          />
        ))}
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
        <span>preset · {presetId || 'custom'}</span>
        <span>
          {AXES.map((a, i) => `${a.label}:${a.stops[values[i]]}`).join('  /  ')}
        </span>
      </div>
    </div>
  );
};

const WorkTile = ({ i, label, tileBg, isTech, isCreative, density, tone, accent }) => {
  // creative tone gets a couple of bigger "feature" tiles for rhythm
  const featured = isCreative && density !== 2 && (i === 0 || i === 7);
  const aspectH = density === 2 ? 60 : density === 1 ? 90 : 130;
  const h = featured ? aspectH * 1.4 : aspectH;

  return (
    <div
      style={{
        position: 'relative',
        height: h,
        gridColumn: featured ? 'span 2' : 'span 1',
        border: '1.5px solid #1a1a1a',
        background: tileBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        ...(tone === 2 ? { transform: `rotate(${(i % 5) - 2 > 0 ? 0.6 : -0.6}deg)` } : {}),
      }}
    >
      {density !== 2 && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid #1a1a1a',
            padding: '4px 7px',
            fontFamily: isTech ? 'ui-monospace, monospace' : 'Georgia, serif',
            fontSize: density === 0 ? 11 : 9,
            color: '#1a1a1a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 6,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          {density === 0 && (
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: accent }}>
              {isTech ? `[${i + 1}]` : isCreative ? '✦' : '·'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const TunablePortfolioPage = () => {
  const [values, setValues] = useState([1, 1, 1]); // start at studio middle
  const presetMatch = PRESETS.find((p) => p.combo.every((v, i) => v === values[i]));

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
        <span style={{ color: '#6a6a6a' }}>v1 · tunable index</span>
      </div>

      <ControlBar values={values} onChange={setValues} presetId={presetMatch?.name} />

      <PresetRow activeId={presetMatch?.id} onPick={(p) => setValues(p.combo)} />

      <Preview values={values} presetId={presetMatch?.name} />

      {/* sketchy annotations on the side */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 22,
          marginTop: 22,
          fontFamily: '"Caveat", cursive',
          fontSize: 16,
          color: '#b8431a',
          lineHeight: 1.2,
        }}
      >
        <div>
          ← drag knobs to retune.
          <br />
          each axis is independent.
        </div>
        <div style={{ textAlign: 'center' }}>
          presets snap all 3 at once →
          <br />
          (or leave them in custom land)
        </div>
        <div style={{ textAlign: 'right' }}>
          everything below the bar
          <br />
          re-renders live.
        </div>
      </div>
    </div>
  );
};

window.TunablePortfolioPage = TunablePortfolioPage;
