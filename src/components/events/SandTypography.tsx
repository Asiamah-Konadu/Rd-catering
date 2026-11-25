"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  onCTAClick?: string;
  backgroundImageSrc?: string;
}

export default function SandTypographyHero({
  heading = "Make your gathering worth gathering for.",
  subheading = "From intimate dinners to milestone celebrations in Accra, we plan a menu that feels generous, considered, and unmistakably Ghanaian.",
  ctaLabel = "Plan your event ↓",
  onCTAClick = "#appointment",
  backgroundImageSrc = "/events-banquet.jpg",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Parallax scroll effect
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (rect.bottom > 0 && rect.top < windowHeight) {
            const scrollY = -rect.top;

            // Background banquet image moves slowly downward for true focal depth
            if (imgRef.current) {
              imgRef.current.style.transform = `translate3d(0, ${Math.max(0, scrollY * 0.28)}px, 0) scale(1.08)`;
            }

            // Foreground text and sand relief move upward slightly faster
            if (copyRef.current) {
              copyRef.current.style.transform = `translate3d(0, ${scrollY * -0.16}px, 0)`;
            }
            if (canvasRef.current) {
              canvasRef.current.style.transform = `translate3d(0, ${scrollY * -0.16}px, 0)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // WebGL Shaders & Interactive Sand Simulation
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = (canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    }) ||
      canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      })) as WebGLRenderingContext | null;

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // Blend mode for crisp volcanic & white sand over the photo scrim
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // ─── Shaders ────────────────────────────────────────────────────────────
    const vsSource = `
      attribute vec2 a_pos;
      attribute vec3 a_color;
      attribute float a_alpha;
      attribute float a_size;
      attribute float a_type; // 0 = core glyph grain, 1 = crest grain, 2 = drift wind grain
      uniform vec2 u_resolution;
      uniform float u_dpr;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_type;

      void main() {
        vec2 ndc = vec2(
          (a_pos.x / u_resolution.x) * 2.0 - 1.0,
          1.0 - (a_pos.y / u_resolution.y) * 2.0
        );
        gl_Position = vec4(ndc, 0.0, 1.0);
        gl_PointSize = max(2.5, a_size * u_dpr);
        v_color = a_color;
        v_alpha = a_alpha;
        v_type = a_type;
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_type;

      void main() {
        // Crisp multifaceted faceted mineral/sand grain
        vec2 coord = gl_PointCoord - vec2(0.5);
        float r2 = dot(coord, coord);
        if (r2 > 0.25) discard;

        float r = sqrt(r2) * 2.0;

        // Mineral facets shimmer based on angle
        float angle = atan(coord.y, coord.x);
        float facet = 0.88 + 0.12 * sin(angle * 5.0);

        // Core density falloff with crisp edge (not a blurry blur circle)
        float edge = smoothstep(1.0, 0.25, r);
        float alpha = edge * facet * v_alpha;

        gl_FragColor = vec4(v_color, alpha);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const s = glCtx.createShader(type);
      if (!s) return null;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    const aPosLoc = gl.getAttribLocation(program, "a_pos");
    const aColorLoc = gl.getAttribLocation(program, "a_color");
    const aAlphaLoc = gl.getAttribLocation(program, "a_alpha");
    const aSizeLoc = gl.getAttribLocation(program, "a_size");
    const aTypeLoc = gl.getAttribLocation(program, "a_type");

    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");

    // ─── Particle Density & Sampling ─────────────────────────────────────────
    const BASE_TEXT_GRAINS = isMobile ? 4200 : 8500;
    const DUNE_RIDGE_GRAINS = isMobile ? 1200 : 2500;
    const WIND_DRIFT_GRAINS = isMobile ? 300 : 800;
    const TOTAL_GRAINS = BASE_TEXT_GRAINS + DUNE_RIDGE_GRAINS + WIND_DRIFT_GRAINS;

    let width = container.clientWidth;
    let height = container.clientHeight;

    /**
     * Contrast Palette: Tactile Black & White Sand with Golden Specular Flecks
     * - Pure Quartz White (Primary crisp body, stands out bold against the dark scrim)
     * - Silver Pearl Sand
     * - Charcoal Basalt / Black volcanic beach sand (creates relief depth and shading)
     * - Gold Specular mica fleck (Ashanti ceremonial warmth)
     */
    const SAND_COLORS = {
      white: [1.0, 1.0, 1.0],
      pearl: [0.93, 0.94, 0.96],
      charcoal: [0.18, 0.18, 0.20],
      black: [0.06, 0.06, 0.08],
      goldFleck: [1.0, 0.86, 0.45],
    };

    /**
     * Samples the typography into two distinct physical sand layers:
     * 1. The letter body (sculpted pure white quartz & pearl grains)
     * 2. The dune crest/shadow ridge (offset black basalt grains forming a 3D physical sand edge)
     */
    const sampleSandRelief = (w: number, h: number) => {
      const offCanvas = document.createElement("canvas");
      const ctx = offCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return { glyphs: [], ridges: [] };

      const mobile = w < 768;
      const leftMargin = mobile ? Math.max(24, w * 0.06) : Math.min(150, Math.max(36, w * 0.09));
      const maxTextWidth = mobile ? w * 0.88 : Math.min(700, w * 0.52);

      const fontSize = mobile
        ? Math.max(36, Math.min(56, w * 0.095))
        : Math.max(50, Math.min(76, w * 0.05));

      const font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
      ctx.font = font;

      const words = heading.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width <= maxTextWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = fontSize * 1.14;
      const textBlockHeight = lines.length * lineHeight;

      offCanvas.width = Math.ceil(maxTextWidth + 60);
      offCanvas.height = Math.ceil(textBlockHeight + 60);

      ctx.font = font;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      lines.forEach((line, idx) => {
        ctx.fillText(line, 10, 10 + idx * lineHeight);
      });

      const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const pixels = imgData.data;

      const glyphPoints: { x: number; y: number; density: number }[] = [];
      const ridgePoints: { x: number; y: number }[] = [];

      const topOffset = Math.max(90, (h - textBlockHeight) * 0.42);

      // Fine resolution sampling
      const step = mobile ? 3 : 2;
      for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
          const idx = (y * offCanvas.width + x) * 4;
          const alpha = pixels[idx + 3];

          if (alpha > 75) {
            const absX = leftMargin + x;
            const absY = topOffset + y;

            glyphPoints.push({
              x: absX,
              y: absY,
              density: alpha / 255,
            });

            // Detect outer stroke edges to create the embossed black basalt dune ridge
            const isEdge =
              x < 2 ||
              x >= offCanvas.width - 2 ||
              y < 2 ||
              y >= offCanvas.height - 2 ||
              pixels[((y + 2) * offCanvas.width + x) * 4 + 3] < 50 ||
              pixels[((y - 2) * offCanvas.width + x) * 4 + 3] < 50 ||
              pixels[(y * offCanvas.width + (x + 2)) * 4 + 3] < 50;

            if (isEdge) {
              // Cast shadow/dune crest down-right (+2.5px x, +3.5px y)
              ridgePoints.push({
                x: absX + 2.5 + (Math.random() - 0.5) * 1.5,
                y: absY + 3.2 + (Math.random() - 0.5) * 1.5,
              });
            }
          }
        }
      }

      return { glyphs: glyphPoints, ridges: ridgePoints };
    };

    let sampleData = sampleSandRelief(width, height);

    // Buffers for WebGL
    const pos = new Float32Array(TOTAL_GRAINS * 2);
    const vel = new Float32Array(TOTAL_GRAINS * 2);
    const homePos = new Float32Array(TOTAL_GRAINS * 2);
    const colors = new Float32Array(TOTAL_GRAINS * 3);
    const alphas = new Float32Array(TOTAL_GRAINS);
    const sizes = new Float32Array(TOTAL_GRAINS);
    const types = new Float32Array(TOTAL_GRAINS);

    // 1. Initialize Primary White/Pearl Quartz Glyph Grains
    const gLen = sampleData.glyphs.length || 1;
    for (let i = 0; i < BASE_TEXT_GRAINS; i++) {
      const g = sampleData.glyphs[i % gLen] || { x: width * 0.25, y: height * 0.4, density: 1 };

      // Micro-jitter for real sand grain grouping
      const jx = g.x + (Math.random() - 0.5) * 1.8;
      const jy = g.y + (Math.random() - 0.5) * 1.8;

      pos[i * 2 + 0] = jx;
      pos[i * 2 + 1] = jy;
      homePos[i * 2 + 0] = jx;
      homePos[i * 2 + 1] = jy;

      // Quartz white mix with occasional subtle gold mica spark
      const r = Math.random();
      const col =
        r < 0.72 ? SAND_COLORS.white : r < 0.92 ? SAND_COLORS.pearl : SAND_COLORS.goldFleck;

      colors[i * 3 + 0] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];

      alphas[i] = 0.94 + Math.random() * 0.06;
      // 1.5x larger sand particles: 3.2px – 5.6px
      sizes[i] = (3.2 + Math.random() * 2.4) * (g.density || 1);
      types[i] = 0.0;
    }

    // 2. Initialize Embossed Dune Ridge & Shadow Basalt Grains (Black & Charcoal)
    const rLen = sampleData.ridges.length || 1;
    const ridgeStart = BASE_TEXT_GRAINS;
    const ridgeEnd = BASE_TEXT_GRAINS + DUNE_RIDGE_GRAINS;
    for (let i = ridgeStart; i < ridgeEnd; i++) {
      const pt = sampleData.ridges[(i - ridgeStart) % rLen] || {
        x: width * 0.25,
        y: height * 0.4,
      };

      const jx = pt.x + (Math.random() - 0.5) * 2.0;
      const jy = pt.y + (Math.random() - 0.5) * 2.0;

      pos[i * 2 + 0] = jx;
      pos[i * 2 + 1] = jy;
      homePos[i * 2 + 0] = jx;
      homePos[i * 2 + 1] = jy;

      // Volcanic dark mix: Jet black & deep charcoal basalt
      const isBlack = Math.random() < 0.65;
      const col = isBlack ? SAND_COLORS.black : SAND_COLORS.charcoal;

      colors[i * 3 + 0] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];

      alphas[i] = 0.92 + Math.random() * 0.08;
      sizes[i] = 3.0 + Math.random() * 2.2;
      types[i] = 1.0;
    }

    // 3. Ambient Sand Dust / Atmospheric Drift Grains (B&W mixed)
    for (let i = ridgeEnd; i < TOTAL_GRAINS; i++) {
      pos[i * 2 + 0] = Math.random() * width;
      pos[i * 2 + 1] = Math.random() * height;
      homePos[i * 2 + 0] = pos[i * 2 + 0];
      homePos[i * 2 + 1] = pos[i * 2 + 1];

      const isWhite = Math.random() < 0.6;
      const col = isWhite ? SAND_COLORS.pearl : SAND_COLORS.charcoal;

      colors[i * 3 + 0] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];

      alphas[i] = 0.4 + Math.random() * 0.4;
      sizes[i] = 2.4 + Math.random() * 2.0;
      types[i] = 2.0;
    }

    // Allocate GPU buffers
    const posBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const alphaBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const typeBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, typeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, types, gl.STATIC_DRAW);

    // ─── Interaction & Sand Grain Cascade Physics ───────────────────────────
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      vx: 0,
      vy: 0,
      lastX: -2000,
      lastY: -2000,
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (mouse.lastX > -1000) {
        mouse.vx = clientX - mouse.lastX;
        mouse.vy = clientY - mouse.lastY;
      }
      mouse.lastX = clientX;
      mouse.lastY = clientY;
      mouse.targetX = clientX;
      mouse.targetY = clientY;
    };

    const handlePointerLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.lastX = -2000;
      mouse.lastY = -2000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // Handle Resize
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const updateSize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      sampleData = sampleSandRelief(width, height);
      const glCount = sampleData.glyphs.length || 1;
      const rdCount = sampleData.ridges.length || 1;

      for (let i = 0; i < BASE_TEXT_GRAINS; i++) {
        const g = sampleData.glyphs[i % glCount];
        if (g) {
          homePos[i * 2 + 0] = g.x + (Math.random() - 0.5) * 1.8;
          homePos[i * 2 + 1] = g.y + (Math.random() - 0.5) * 1.8;
        }
      }

      for (let i = ridgeStart; i < ridgeEnd; i++) {
        const pt = sampleData.ridges[(i - ridgeStart) % rdCount];
        if (pt) {
          homePos[i * 2 + 0] = pt.x + (Math.random() - 0.5) * 2.0;
          homePos[i * 2 + 1] = pt.y + (Math.random() - 0.5) * 2.0;
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // ─── Render Loop with Cascading Sand Dune Physics ────────────────────────
    let animationFrameId: number;

    const STIFFNESS = 0.075;
    const DAMPING = 0.82;
    const GRAVITY = 0.055; // Gentle downward tumble on agitated sand
    const RADIUS = isMobile ? 95 : 135;
    const RADIUS_SQ = RADIUS * RADIUS;

    const render = () => {
      if (isVisible) {
        mouse.x += (mouse.targetX - mouse.x) * 0.25;
        mouse.y += (mouse.targetY - mouse.y) * 0.25;

        // Simulate physical grain cascade
        const activeTextCount = ridgeEnd;
        for (let i = 0; i < activeTextCount; i++) {
          const idx = i * 2;
          const px = pos[idx + 0];
          const py = pos[idx + 1];
          const hx = homePos[idx + 0];
          const hy = homePos[idx + 1];

          let fx = (hx - px) * STIFFNESS;
          let fy = (hy - py) * STIFFNESS;

          // When displaced away from home, gravity pulls sand downward like a dune trickle
          const dyHome = py - hy;
          if (dyHome < 20.0) {
            fy += GRAVITY;
          }

          // Cursor blast & wake
          if (mouse.x > -1000) {
            const dx = px - mouse.x;
            const dy = py - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < RADIUS_SQ && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const factor = 1.0 - dist / RADIUS;
              const force = factor * factor * 5.6;

              // Rakes the sand grains along cursor movement path with natural dispersal
              fx += (dx / dist) * force + mouse.vx * 0.1 * factor;
              fy += (dy / dist) * force + mouse.vy * 0.1 * factor;
            }
          }

          // Micro sand-grain Brownian vibration
          fx += (Math.random() - 0.5) * 0.08;
          fy += (Math.random() - 0.5) * 0.08;

          vel[idx + 0] = (vel[idx + 0] + fx) * DAMPING;
          vel[idx + 1] = (vel[idx + 1] + fy) * DAMPING;

          pos[idx + 0] += vel[idx + 0];
          pos[idx + 1] += vel[idx + 1];
        }

        // Ambient wind drift grains
        for (let i = ridgeEnd; i < TOTAL_GRAINS; i++) {
          const idx = i * 2;
          pos[idx + 0] += 0.35 + (i % 3) * 0.1;
          pos[idx + 1] -= 0.3 + (i % 4) * 0.1;

          if (pos[idx + 0] > width) pos[idx + 0] = 0;
          if (pos[idx + 1] < 0) {
            pos[idx + 1] = height;
            pos[idx + 0] = Math.random() * width;
          }
        }

        mouse.vx *= 0.85;
        mouse.vy *= 0.85;

        // Draw Call
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.uniform2f(uResolutionLoc, width, height);
        gl.uniform1f(uDprLoc, dpr);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(aColorLoc);
        gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
        gl.enableVertexAttribArray(aAlphaLoc);
        gl.vertexAttribPointer(aAlphaLoc, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.enableVertexAttribArray(aSizeLoc);
        gl.vertexAttribPointer(aSizeLoc, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, typeBuffer);
        gl.enableVertexAttribArray(aTypeLoc);
        gl.vertexAttribPointer(aTypeLoc, 1, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, TOTAL_GRAINS);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (posBuffer) gl.deleteBuffer(posBuffer);
      if (colorBuffer) gl.deleteBuffer(colorBuffer);
      if (alphaBuffer) gl.deleteBuffer(alphaBuffer);
      if (sizeBuffer) gl.deleteBuffer(sizeBuffer);
      if (typeBuffer) gl.deleteBuffer(typeBuffer);
      if (program) gl.deleteProgram(program);
    };
  }, [heading]);

  const handleScrollToAppointment = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("appointment");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "appointment";
    }
  };

  return (
    <section
      ref={containerRef}
      className="events-photo-hero relative w-full overflow-hidden flex items-center select-none"
      aria-label="Event catering in Accra"
    >
      {/* ── 1. The Authentic Background Banquet Image (Parallax Background) ── */}
      <img
        ref={imgRef}
        src={backgroundImageSrc}
        alt="A beautifully arranged Rich-Dons Catering banquet with golden chafing dishes"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform"
        style={{
          objectPosition: "center 54%",
          zIndex: 0,
          transform: "scale(1.08)",
          transition: "transform 0.08s ease-out",
        }}
      />

      {/* ── 2. Atmospheric Directional Scrim ── */}
      <div
        className="events-photo-shade absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* ── 3. High-Contrast Dual-Layer Sand Typography WebGL Canvas ── */}
      {hasWebGL && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-auto cursor-crosshair will-change-transform"
          style={{
            zIndex: 2,
            transition: "transform 0.08s ease-out",
          }}
          aria-hidden="true"
        />
      )}

      {/* ── 4. Editorial Copy & Accessible HTML (Parallax Foreground) ── */}
      <div
        ref={copyRef}
        className="events-photo-copy relative z-10 pointer-events-none will-change-transform"
        style={{
          zIndex: 3,
          transition: "transform 0.08s ease-out",
        }}
      >
        <span className="inline-block text-[#ffd28a] font-extrabold text-sm sm:text-base tracking-widest uppercase mb-2">
          Event catering in Accra
        </span>

        {/* 
          Heading rendered with opacity 0 for WebGL canvas overlay alignment,
          while remaining fully accessible to crawlers and screen readers.
        */}
        <h1
          className={`font-serif font-bold text-white tracking-tight ${
            hasWebGL ? "opacity-0 select-none" : "opacity-100"
          }`}
          style={{
            fontSize: "clamp(2.8rem, 6vw, 5.6rem)",
            lineHeight: 1.04,
            margin: "18px 0",
            maxWidth: "700px",
          }}
        >
          {heading}
        </h1>

        <p
          className="text-white text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-7"
          style={{ maxWidth: "590px" }}
        >
          {subheading}
        </p>

        <a
          href={onCTAClick}
          onClick={handleScrollToAppointment}
          className="pointer-events-auto inline-flex items-center gap-3 min-h-[52px] px-6 rounded-full bg-[#c74325] hover:bg-[#96351e] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl transition-colors duration-200"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
