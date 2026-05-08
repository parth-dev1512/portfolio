/* global React */
const { useEffect, useRef, useState } = React;

// ============================================================================
// Shared wireframe primitives
// ============================================================================

// A placeholder image tile with diagonal stripes + a label
const Tile = ({ label, w = 1, h = 1, dense = false }) => {
  const stripe = dense ? 6 : 8;
  return (
    <div
      style={{
        position: 'relative',
        gridColumn: `span ${w}`,
        gridRow: `span ${h}`,
        border: '1.5px solid #1a1a1a',
        background: `repeating-linear-gradient(45deg, #f4f1ea 0 ${stripe}px, #e8e2d4 ${stripe}px ${stripe * 2}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 9,
        color: '#3a3a3a',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          background: '#f4f1ea',
          padding: '2px 5px',
          border: '1px dashed #6a6a6a',
        }}
      >
        {label}
      </span>
    </div>
  );
};

// Sketchy underline used for headings
const Sketch = ({ children, style }) => (
  <span
    style={{
      display: 'inline-block',
      position: 'relative',
      ...style,
    }}
  >
    {children}
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -3,
        width: '100%',
        height: 5,
      }}
    >
      <path
        d="M2,4 Q25,1 50,3 T98,3"
        stroke="#1a1a1a"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  </span>
);

// Annotation arrow + caption (the "sketchy notes" layer)
const Note = ({ x, y, w = 140, children, dir = 'left' }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      fontFamily: '"Caveat", "Comic Sans MS", cursive',
      fontSize: 16,
      color: '#b8431a',
      lineHeight: 1.15,
      pointerEvents: 'none',
      transform: dir === 'right' ? 'none' : 'none',
      zIndex: 5,
    }}
  >
    {children}
  </div>
);

const Arrow = ({ x1, y1, x2, y2, curve = 0 }) => {
  const mx = (x1 + x2) / 2 + curve;
  const my = (y1 + y2) / 2 - Math.abs(curve) * 0.5;
  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 4,
        overflow: 'visible',
      }}
    >
      <path
        d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
        stroke="#b8431a"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d={`M${x2},${y2} l-7,-2 m7,2 l-3,-7`}
        stroke="#b8431a"
        strokeWidth="1.4"
        fill="none"
        transform={`rotate(${
          (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI
        }, ${x2}, ${y2})`}
      />
    </svg>
  );
};

// ============================================================================
// Background grid (the blurred scrolling photos / projects)
// ============================================================================

const BG_TILES = [
  { label: 'photo · venice 22', w: 2, h: 2 },
  { label: 'project · synth', w: 1, h: 1 },
  { label: 'sketch', w: 1, h: 2 },
  { label: 'photo · studio', w: 2, h: 1 },
  { label: 'essay · on time', w: 1, h: 1 },
  { label: 'project · garden', w: 1, h: 1 },
  { label: 'photo · roof', w: 1, h: 2 },
  { label: 'project · type', w: 2, h: 1 },
  { label: 'film still 04', w: 1, h: 1 },
  { label: 'photo · self', w: 1, h: 1 },
  { label: 'project · loop', w: 2, h: 2 },
  { label: 'photo · night', w: 1, h: 1 },
  { label: 'sketch · birds', w: 1, h: 1 },
  { label: 'essay · craft', w: 2, h: 1 },
  { label: 'photo · field', w: 1, h: 1 },
  { label: 'project · bot', w: 1, h: 1 },
  { label: 'photo · river', w: 1, h: 2 },
  { label: 'project · zine', w: 1, h: 1 },
  { label: 'sketch · hand', w: 1, h: 1 },
  { label: 'photo · sky', w: 2, h: 1 },
  { label: 'project · lab', w: 1, h: 1 },
  { label: 'photo · door', w: 1, h: 1 },
  { label: 'film still 11', w: 1, h: 1 },
  { label: 'project · tea', w: 1, h: 1 },
];

const BgGrid = ({
  blur = 4,
  cols = 6,
  cellSize = 70,
  motion = 'vertical',
  dense = false,
  paused = false,
  seed = 0,
}) => {
  // Repeat tile list to fill plenty of vertical space
  const tiles = [...BG_TILES, ...BG_TILES, ...BG_TILES];
  const rotated = [...tiles.slice(seed % tiles.length), ...tiles.slice(0, seed % tiles.length)];

  const animClass = paused
    ? ''
    : motion === 'vertical'
    ? 'bg-scroll-v'
    : motion === 'diagonal'
    ? 'bg-scroll-d'
    : motion === 'marquee'
    ? 'bg-scroll-h'
    : '';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        filter: `blur(${blur}px)`,
        background: '#ece6d8',
      }}
    >
      <div
        className={animClass}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
          gap: 8,
          padding: 8,
          width: cols * cellSize + (cols - 1) * 8 + 16,
          willChange: 'transform',
        }}
      >
        {rotated.map((t, i) => (
          <Tile key={i} label={t.label} w={t.w} h={t.h} dense={dense} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Card content blocks (composed differently per variation)
// ============================================================================

const PhotoBox = ({ shape = 'square', size = 110 }) => (
  <div
    style={{
      width: size,
      height: shape === 'tall' ? size * 1.25 : size,
      borderRadius: shape === 'circle' ? '50%' : 0,
      border: '1.5px solid #1a1a1a',
      background:
        'repeating-linear-gradient(45deg, #f4f1ea 0 6px, #e0d9c8 6px 12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'ui-monospace, monospace',
      fontSize: 9,
      color: '#3a3a3a',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      flexShrink: 0,
    }}
  >
    photo
  </div>
);

const ContactList = ({ size = 'sm' }) => {
  const fs = size === 'sm' ? 11 : 13;
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontFamily: 'ui-monospace, monospace',
        fontSize: fs,
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}
    >
      <li>→ name@mail.com</li>
      <li>→ linkedin / @handle</li>
      <li>→ github / @handle</li>
      <li>→ instagram / @handle</li>
    </ul>
  );
};

const ResumeLink = ({ size = 'sm' }) => (
  <a
    style={{
      display: 'inline-block',
      fontFamily: 'ui-monospace, monospace',
      fontSize: size === 'sm' ? 11 : 13,
      color: '#1a1a1a',
      border: '1.5px solid #1a1a1a',
      padding: '4px 10px',
      textDecoration: 'none',
      background: '#fff',
    }}
  >
    [ download résumé.pdf ↗ ]
  </a>
);

// ============================================================================
// Variation 1 — Centered horizontal card
// ============================================================================

const V1 = ({ tweaks }) => (
  <div style={frameStyle}>
    <BgGrid blur={tweaks.blur} motion={tweaks.motion} paused={tweaks.paused} seed={0} />
    <div style={vignette} />

    <div style={centerWrap}>
      <div
        style={{
          ...cardBase,
          width: 560,
          padding: 28,
          display: 'grid',
          gridTemplateColumns: '140px 1fr',
          gap: 24,
          background: tweaks.frosted ? 'rgba(255,255,255,0.86)' : '#ffffff',
          backdropFilter: tweaks.frosted ? 'blur(2px)' : 'none',
        }}
      >
        <PhotoBox shape="square" size={140} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={cardEyebrow}>visiting card</div>
          <h1 style={cardName}>
            <Sketch>your name</Sketch>
          </h1>
          <p style={cardLine}>
            polymath. designer · engineer · writer · maker.
            <br />
            building strange tools at the edges of fields.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', marginTop: 4 }}>
            <ContactList />
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="Portfolio Tunable Index.html"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: '"Caveat", "Comic Sans MS", cursive',
                fontSize: 20,
                lineHeight: 1,
                color: '#f6f1e6',
                background: '#1a1a1a',
                border: '1.5px solid #1a1a1a',
                padding: '8px 16px 9px',
                textDecoration: 'none',
                boxShadow: '3px 3px 0 #b8431a',
              }}
            >
              enter portfolio
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14 }}>→</span>
            </a>
            <ResumeLink />
          </div>
        </div>
      </div>
    </div>

    <Note x={26} y={26} w={170}>
      blurred bg = scrolling
      <br />
      photos + project tiles
    </Note>
    <Arrow x1={120} y1={70} x2={210} y2={170} curve={-30} />

    <Note x={620} y={420} w={170}>
      primary CTA →
      <br />
      enters the portfolio
    </Note>
    <Arrow x1={620} y1={460} x2={560} y2={445} curve={10} />

    <Note x={620} y={300} w={150}>
      everything in one
      <br />
      tidy rectangle ↓
    </Note>
    <Arrow x1={640} y1={340} x2={580} y2={370} curve={20} />

    <FooterTag>v1 · centered horizontal</FooterTag>
  </div>
);

// ============================================================================
// Variation 2 — Tall card, photo on top
// ============================================================================

const V2 = ({ tweaks }) => (
  <div style={frameStyle}>
    <BgGrid blur={tweaks.blur} motion={tweaks.motion} paused={tweaks.paused} seed={4} cols={7} />
    <div style={vignette} />

    <div style={centerWrap}>
      <div
        style={{
          ...cardBase,
          width: 320,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          alignItems: 'center',
          textAlign: 'center',
          background: tweaks.frosted ? 'rgba(255,255,255,0.86)' : '#ffffff',
          backdropFilter: tweaks.frosted ? 'blur(2px)' : 'none',
        }}
      >
        <PhotoBox shape="square" size={150} />
        <h1 style={{ ...cardName, marginTop: 4 }}>
          <Sketch>your name</Sketch>
        </h1>
        <p style={{ ...cardLine, textAlign: 'center' }}>
          polymath — design, code, prose, sound.
          <br />
          curious about everything that bends.
        </p>
        <div style={dividerLine} />
        <ContactList />
        <ResumeLink />
      </div>
    </div>

    <Note x={26} y={26} w={180}>
      tall portrait card —
      <br />
      reads top→bottom
    </Note>
    <Arrow x1={130} y1={70} x2={300} y2={150} curve={20} />

    <Note x={26} y={500} w={200}>
      bg keeps scrolling behind ↑
      <br />
      ambient, not loud
    </Note>

    <FooterTag>v2 · tall · stacked</FooterTag>
  </div>
);

// ============================================================================
// Variation 3 — Off-center card with disciplines list as nav
// ============================================================================

const V3 = ({ tweaks }) => (
  <div style={frameStyle}>
    <BgGrid blur={tweaks.blur} motion={tweaks.motion === 'vertical' ? 'diagonal' : tweaks.motion} paused={tweaks.paused} seed={9} />
    <div style={vignette} />

    {/* top tag strip */}
    <div
      style={{
        position: 'absolute',
        top: 18,
        left: 24,
        right: 24,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        color: '#1a1a1a',
        zIndex: 3,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      <span>your name · est. ’xx</span>
      <span>portfolio / index</span>
    </div>

    <div
      style={{
        position: 'absolute',
        left: 60,
        top: 90,
        right: 60,
        bottom: 90,
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: 30,
        zIndex: 3,
      }}
    >
      <div
        style={{
          ...cardBase,
          padding: 28,
          alignSelf: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: tweaks.frosted ? 'rgba(255,255,255,0.86)' : '#ffffff',
          backdropFilter: tweaks.frosted ? 'blur(2px)' : 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 18 }}>
          <PhotoBox size={100} />
          <div>
            <div style={cardEyebrow}>hello —</div>
            <h1 style={cardName}>
              <Sketch>your name</Sketch>
            </h1>
            <p style={cardLine}>
              polymath. i make things across
              <br />
              code, type, music, and gardens.
            </p>
          </div>
        </div>
        <div style={dividerLine} />
        <ContactList />
        <div>
          <ResumeLink />
        </div>
      </div>

      {/* right column: disciplines as a sketchy index */}
      <div
        style={{
          alignSelf: 'center',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          color: '#1a1a1a',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(2px)',
          border: '1.5px dashed #1a1a1a',
          padding: '16px 18px',
        }}
      >
        <div style={{ ...cardEyebrow, marginBottom: 8 }}>what's inside →</div>
        <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>design + interfaces</li>
          <li>writing &amp; essays</li>
          <li>photography</li>
          <li>music / sound</li>
          <li>code experiments</li>
          <li>research notes</li>
          <li>misc / sketches</li>
        </ol>
      </div>
    </div>

    <Note x={520} y={26} w={160}>
      hint at what's next
      <br />
      without a real nav ↓
    </Note>
    <Arrow x1={620} y1={70} x2={680} y2={210} curve={20} />

    <FooterTag>v3 · card + index</FooterTag>
  </div>
);

// ============================================================================
// Variation 4 — Polaroid-style card, slightly rotated
// ============================================================================

const V4 = ({ tweaks }) => (
  <div style={frameStyle}>
    <BgGrid blur={tweaks.blur} motion={tweaks.motion} paused={tweaks.paused} seed={2} cellSize={64} cols={8} />
    <div style={vignette} />

    <div style={centerWrap}>
      <div
        style={{
          transform: 'rotate(-2deg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            ...cardBase,
            width: 280,
            padding: '18px 18px 22px',
            background: tweaks.frosted ? 'rgba(255,255,255,0.92)' : '#ffffff',
            boxShadow: '4px 6px 0 rgba(0,0,0,0.15)',
          }}
        >
          <PhotoBox size={244} />
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <h1
              style={{
                ...cardName,
                fontSize: 22,
                marginBottom: 4,
              }}
            >
              <Sketch>your name</Sketch>
            </h1>
            <p style={{ ...cardLine, fontSize: 12, marginTop: 6 }}>
              a polymath, mostly. design /
              <br />
              code / words / images / sound.
            </p>
          </div>
        </div>

        {/* second tag card under the polaroid */}
        <div
          style={{
            transform: 'rotate(1.5deg)',
            background: tweaks.frosted ? 'rgba(255,255,255,0.92)' : '#fff',
            border: '1.5px solid #1a1a1a',
            padding: '10px 14px',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
          }}
        >
          <span>name@mail.com</span>
          <span style={{ color: '#999' }}>·</span>
          <span>@handle</span>
          <span style={{ color: '#999' }}>·</span>
          <ResumeLink />
        </div>
      </div>
    </div>

    <Note x={26} y={26} w={170}>
      polaroid-style —
      <br />
      tilted, casual ↘
    </Note>
    <Arrow x1={140} y1={70} x2={290} y2={180} curve={-20} />

    <Note x={620} y={520} w={160}>
      contact strip pinned
      <br />
      under the photo ↑
    </Note>

    <FooterTag>v4 · polaroid · tilted</FooterTag>
  </div>
);

// ============================================================================
// Variation 5 — Wide letterboxed card, low and quiet
// ============================================================================

const V5 = ({ tweaks }) => (
  <div style={frameStyle}>
    <BgGrid blur={tweaks.blur} motion={tweaks.motion === 'vertical' ? 'marquee' : tweaks.motion} paused={tweaks.paused} seed={6} cols={8} cellSize={62} />
    <div style={vignette} />

    {/* tiny top mark */}
    <div
      style={{
        position: 'absolute',
        top: 22,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        color: '#1a1a1a',
        zIndex: 3,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}
    >
      ✦ a portfolio of many things ✦
    </div>

    <div style={{ ...centerWrap, alignItems: 'flex-end', paddingBottom: 80 }}>
      <div
        style={{
          ...cardBase,
          width: 640,
          padding: '20px 26px',
          display: 'grid',
          gridTemplateColumns: '90px 1fr auto',
          gap: 22,
          alignItems: 'center',
          background: tweaks.frosted ? 'rgba(255,255,255,0.86)' : '#ffffff',
          backdropFilter: tweaks.frosted ? 'blur(2px)' : 'none',
        }}
      >
        <PhotoBox size={90} />
        <div>
          <h1 style={{ ...cardName, fontSize: 22, marginBottom: 2 }}>
            <Sketch>your name</Sketch>
          </h1>
          <p style={{ ...cardLine, fontSize: 12, marginTop: 4 }}>
            polymath. design, code, words, images, sound.
            <br />
            collecting fragments → calling them a practice.
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
            <span>name@mail.com</span>
            <span style={{ color: '#999' }}>/</span>
            <span>@handle</span>
            <span style={{ color: '#999' }}>/</span>
            <span>@handle</span>
          </div>
        </div>
        <ResumeLink />
      </div>
    </div>

    <Note x={26} y={26} w={170}>
      wide letterbox —
      <br />
      sits low, lets bg breathe
    </Note>
    <Arrow x1={140} y1={70} x2={250} y2={490} curve={-60} />

    <Note x={620} y={120} w={150}>
      bg dominates ↑
      <br />
      card is a footer
    </Note>

    <FooterTag>v5 · wide · low-quiet</FooterTag>
  </div>
);

// ============================================================================
// Shared styles
// ============================================================================

const frameStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: '#ece6d8',
  overflow: 'hidden',
  fontFamily: '"Caveat", "Comic Sans MS", cursive',
  color: '#1a1a1a',
};

const vignette = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(ellipse at center, rgba(236,230,216,0) 30%, rgba(236,230,216,0.55) 100%)',
  pointerEvents: 'none',
  zIndex: 1,
};

const centerWrap = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
};

const cardBase = {
  background: '#ffffff',
  border: '1.5px solid #1a1a1a',
  boxShadow: '3px 4px 0 rgba(0,0,0,0.12)',
};

const cardEyebrow = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#6a6a6a',
};

const cardName = {
  fontFamily: '"Caveat", "Comic Sans MS", cursive',
  fontSize: 30,
  fontWeight: 600,
  margin: 0,
  lineHeight: 1,
  color: '#1a1a1a',
  whiteSpace: 'nowrap',
};

const cardLine = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 13,
  lineHeight: 1.45,
  margin: 0,
  color: '#2a2a2a',
};

const dividerLine = {
  height: 0,
  borderTop: '1px dashed #1a1a1a',
  width: '100%',
};

const FooterTag = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 14,
      textAlign: 'center',
      fontFamily: 'ui-monospace, monospace',
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: '#6a6a6a',
      zIndex: 3,
    }}
  >
    {children}
  </div>
);

// expose
window.V1 = V1;
window.V2 = V2;
window.V3 = V3;
window.V4 = V4;
window.V5 = V5;
