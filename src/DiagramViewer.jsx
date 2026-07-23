import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

// Initialised once — subsequent renders reuse the same mermaid instance.
mermaid.initialize({
  startOnLoad: false, // we call render() manually so we control timing
  theme: 'dark',
  securityLevel: 'loose', // required for clickable nodes in flowcharts
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

let uid = 0; // monotonically increasing id to guarantee unique diagram element ids

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.15; // per button click
const WHEEL_FACTOR = 0.001; // wheel delta → scale delta

// Clamp a value between lo and hi.
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

export function DiagramViewer({ code }) {
  const containerRef = useRef(null); // outer clip region (overflow:hidden)
  const svgWrapRef   = useRef(null); // inner element that receives the CSS transform
  const dragRef      = useRef(null); // { startX, startY, ox, oy } while dragging

  const [error, setError]   = useState(null); // parse/render error from mermaid
  const [ready, setReady]   = useState(false); // true once the SVG is injected
  const [tf, setTf] = useState({ scale: 1, x: 0, y: 0 }); // current transform

  // Render the mermaid diagram whenever the code prop changes.
  useEffect(() => {
    if (!svgWrapRef.current || !code) return;
    const id = `mermaid-${++uid}`;
    setError(null);
    setReady(false);
    setTf({ scale: 1, x: 0, y: 0 }); // reset pan/zoom on diagram switch

    mermaid.render(id, code)
      .then(({ svg }) => {
        if (svgWrapRef.current) {
          svgWrapRef.current.innerHTML = svg; // inject rendered SVG
          const el = svgWrapRef.current.querySelector('svg');
          if (el) el.style.maxWidth = '300%'; // override mermaid's px max-width
          setReady(true);
        }
      })
      .catch(err => {
        setError(err?.message ?? 'Diagram render error');
        if (svgWrapRef.current) svgWrapRef.current.innerHTML = '';
      });
  }, [code]);

  // Zoom towards a focal point (cx, cy) in container-relative coords.
  const zoomAt = useCallback((cx, cy, delta) => {
    setTf(prev => {
      const next = clamp(prev.scale + delta, MIN_SCALE, MAX_SCALE);
      const ratio = next / prev.scale;
      return {
        scale: next,
        x: cx - ratio * (cx - prev.x), // keep the point under the cursor fixed
        y: cy - ratio * (cy - prev.y),
      };
    });
  }, []);

  // Wheel handler — zoom centred on the cursor position.
  const onWheel = useCallback(e => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, -e.deltaY * WHEEL_FACTOR);
  }, [zoomAt]);

  // Attach wheel as a non-passive listener so preventDefault works.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Drag-to-pan handlers.
  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return; // left button only
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: tf.x, oy: tf.y };
  }, [tf]);

  const onMouseMove = useCallback(e => {
    if (!dragRef.current) return;
    const { startX, startY, ox, oy } = dragRef.current;
    setTf(prev => ({ ...prev, x: ox + e.clientX - startX, y: oy + e.clientY - startY }));
  }, []);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  // Button zoom controls.
  function zoomIn()    { zoomAt(containerRef.current.offsetWidth / 2, containerRef.current.offsetHeight / 2,  ZOOM_STEP); }
  function zoomOut()   { zoomAt(containerRef.current.offsetWidth / 2, containerRef.current.offsetHeight / 2, -ZOOM_STEP); }
  function zoomReset() { setTf({ scale: 1, x: 0, y: 0 }); }

  if (error) {
    return (
      <div style={s.error}>
        <strong>Diagram error:</strong> {error}
      </div>
    );
  }

  const isDragging = !!dragRef.current;

  return (
    <div style={s.root}>
      {/* Zoom control toolbar */}
      {ready && (
        <div style={s.toolbar}>
          <button onClick={zoomOut}  style={s.btn} title="Zoom out">−</button>
          <span style={s.scaleLabel}>{Math.round(tf.scale * 100)}%</span>
          <button onClick={zoomIn}   style={s.btn} title="Zoom in">+</button>
          <button onClick={zoomReset} style={{ ...s.btn, ...s.resetBtn }} title="Reset zoom">⊡ Reset</button>
        </div>
      )}

      {/* Pannable / zoomable viewport */}
      <div
        ref={containerRef}
        style={{ ...s.viewport, cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp} // release drag when pointer leaves the viewport
      >
        {/* Transform target — only the SVG wrapper moves, not the container */}
        <div
          ref={svgWrapRef}
          style={{
            ...s.svgWrap,
            transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.scale})`,
          }}
        />
      </div>
    </div>
  );
}

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    gap: '4px',
  },
  btn: {
    alignItems: 'center',
    background: '#1e293b',   // slate-800
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    fontSize: '16px',
    fontWeight: 700,
    height: '28px',
    justifyContent: 'center',
    lineHeight: 1,
    padding: '0 10px',
    transition: 'background 0.1s, color 0.1s',
    userSelect: 'none',
  },
  resetBtn: {
    fontSize: '12px',
    marginLeft: '4px',
  },
  scaleLabel: {
    color: '#64748b',
    fontFamily: 'monospace',
    fontSize: '11px',
    minWidth: '36px',
    textAlign: 'center',
  },
  viewport: {
    border: '1px solid #1e293b',
    borderRadius: '8px',
    minHeight: '320px',
    overflow: 'hidden', // clips the SVG when zoomed/panned outside bounds
    position: 'relative',
    userSelect: 'none',
  },
  svgWrap: {
    display: 'inline-block',
    padding: '24px',
    transformOrigin: '0 0', // scale from top-left; zoomAt() compensates the offset
  },
  error: {
    background: '#2d1a1a',
    border: '1px solid #7f1d1d',
    borderRadius: '8px',
    color: '#fca5a5',
    padding: '12px 16px',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
};
