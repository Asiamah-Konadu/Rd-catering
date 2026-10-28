"use client";

import React, { useEffect, useRef } from "react";

// Color palettes for different sections
const SECTION_PALETTES: Record<string, [number, number, number]> = {
  hero: [0.97, 0.26, 0.15], // Accra Fire #f74326
  dishes: [0.92, 0.38, 0.08], // Warm Terracotta #ea580c
  pick: [0.96, 0.62, 0.07], // Golden Hearth #f59e0b
  howToOrder: [0.91, 0.68, 0.33], // Amber Gold #e7ad54
  delivery: [0.09, 0.54, 0.4], // Garden Herb #178a68
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [0.97, 0.26, 0.15];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export default function HomepageWebGLBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // RGB target & current for continuous buttery crossfade
  const targetRgbRef = useRef<[number, number, number]>([0.97, 0.26, 0.15]);
  const currentRgbRef = useRef<[number, number, number]>([0.97, 0.26, 0.15]);
  const activeColorHexRef = useRef("#f74326");

  // Scroll & velocity tracking
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const velocityRef = useRef(0);

  // Mouse parallax tracking
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  // Active showcase dish color override when user is interacting with showcase
  const showcaseColorRef = useRef<[number, number, number] | null>(null);

  // ── 1. Listen for Showcase Dish Changes ─────────────────────────────
  useEffect(() => {
    const handleDishChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ color?: string; slug?: string }>;
      if (customEvent.detail?.color) {
        const rgb = hexToRgb(customEvent.detail.color);
        showcaseColorRef.current = rgb;
        activeColorHexRef.current = customEvent.detail.color;
        rootRef.current?.style.setProperty("--accent-color", customEvent.detail.color);
      }
    };

    window.addEventListener("rd-showcase-dish", handleDishChange);
    return () => {
      window.removeEventListener("rd-showcase-dish", handleDishChange);
    };
  }, []);

  // ── 2. Scroll, Velocity & Pointer Listeners (Zero Layout Thrashing) ──
  useEffect(() => {
    let cachedMaxScroll = 1;
    const updateDimensions = () => {
      cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const computeScroll = () => {
      const scrolled = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrolled / cachedMaxScroll));
      targetScrollRef.current = progress;

      // Section-based color transitions if not explicitly focused in showcase
      if (!showcaseColorRef.current) {
        let hex = "#f74326";
        if (progress < 0.2) {
          targetRgbRef.current = SECTION_PALETTES.hero;
          hex = "#f74326";
        } else if (progress < 0.45) {
          targetRgbRef.current = SECTION_PALETTES.dishes;
          hex = "#ea580c";
        } else if (progress < 0.65) {
          targetRgbRef.current = SECTION_PALETTES.pick;
          hex = "#f59e0b";
        } else if (progress < 0.85) {
          targetRgbRef.current = SECTION_PALETTES.howToOrder;
          hex = "#e7ad54";
        } else {
          targetRgbRef.current = SECTION_PALETTES.delivery;
          hex = "#178a68";
        }
        if (hex !== activeColorHexRef.current) {
          activeColorHexRef.current = hex;
          rootRef.current?.style.setProperty("--accent-color", hex);
        }
      } else {
        targetRgbRef.current = showcaseColorRef.current;
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouseRef.current = { x: nx, y: ny };
    };

    window.addEventListener("scroll", computeScroll, { passive: true });
    window.addEventListener("resize", () => {
      updateDimensions();
      computeScroll();
    }, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    updateDimensions();
    computeScroll();

    return () => {
      window.removeEventListener("scroll", computeScroll);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  // ── 3. WebGL High-Performance 3D Scene ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    }) || canvas.getContext("experimental-webgl", { alpha: true })) as WebGLRenderingContext | null;

    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Vertex shader: 3D perspective particle cloud with scroll warp and mouse parallax
    const vsSource = `
      attribute vec3 a_pos;       // x, y, z (-1 to 1)
      attribute float a_size;     // individual particle scale
      attribute float a_phase;    // random phase
      attribute float a_speed;    // drift speed

      uniform float u_scroll;     // 0 -> 1 continuous page scroll
      uniform float u_velocity;   // instant scroll velocity
      uniform float u_time;       // elapsed seconds
      uniform vec2 u_mouse;       // -1 -> 1 mouse coords

      varying float v_alpha;
      varying float v_depth;

      void main() {
        float swirl = (a_pos.z + 1.2) * (u_scroll * 1.6 + 0.2);

        float x = a_pos.x * cos(swirl) - a_pos.y * sin(swirl);
        float y = a_pos.x * sin(swirl) + a_pos.y * cos(swirl);

        // Continuous Z depth traversal
        float z = mod(a_pos.z - u_scroll * 3.2 + a_speed * u_time * 0.05, 2.0) - 1.0;

        // Subtle organic Brownian floating
        x += sin(u_time * 0.8 + a_phase * 6.28) * 0.04 + u_mouse.x * 0.1 * (1.0 - z * 0.4);
        y += cos(u_time * 0.6 + a_phase * 4.0) * 0.04 - u_mouse.y * 0.07 * (1.0 - z * 0.4);

        // Velocity warp elongation when scrolling fast
        y -= (u_velocity * 0.03 * (1.0 - z));

        // Perspective camera projection
        float pz = z + 1.7;
        gl_Position = vec4(x / pz, y / pz, 0.0, 1.0);

        // Size scaling with depth + stretch with velocity
        float sz = (1.0 - z * 0.5) * a_size * (3.8 + u_velocity * 3.2);
        gl_PointSize = clamp(sz, 2.0, 22.0);

        // Depth fog attenuation
        v_alpha = smoothstep(-1.0, 0.4, z) * (0.35 + 0.65 * (1.0 - abs(z)));
        v_depth = z;
      }
    `;

    // Fragment shader: Hot white-gold ember core with chromatic corona
    const fsSource = `
      precision mediump float;
      uniform vec3 u_color;
      varying float v_alpha;
      varying float v_depth;

      void main() {
        vec2 pt = gl_PointCoord - 0.5;
        float d = length(pt);
        if (d > 0.5) discard;

        float glow = 1.0 - smoothstep(0.12, 0.5, d);
        vec3 emberCore = vec3(1.0, 0.98, 0.90);
        vec3 col = mix(emberCore, u_color, smoothstep(0.0, 0.46, d));
        float depthBoost = clamp(1.2 - v_depth * 0.35, 0.7, 1.35);

        gl_FragColor = vec4(col, glow * v_alpha * depthBoost);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vert = compileShader(gl.VERTEX_SHADER, vsSource);
    const frag = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vert || !frag) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    // ── Optimal 120 3D Volumetric Ember Particles for buttery 60fps scrolling ──
    const N = 120;
    const STRIDE = 6 * 4;
    const data = new Float32Array(N * 6);

    for (let i = 0; i < N; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * 1.35;
      data[i * 6 + 0] = Math.cos(angle) * dist * 1.35;
      data[i * 6 + 1] = (Math.random() * 2 - 1) * 1.2;
      data[i * 6 + 2] = Math.random() * 2 - 1;
      data[i * 6 + 3] = 0.8 + Math.random() * 1.4;
      data[i * 6 + 4] = Math.random() * Math.PI * 2;
      data[i * 6 + 5] = 0.4 + Math.random() * 1.1;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const uScroll = gl.getUniformLocation(prog, "u_scroll");
    const uVel = gl.getUniformLocation(prog, "u_velocity");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aSize = gl.getAttribLocation(prog, "a_size");
    const aPhase = gl.getAttribLocation(prog, "a_phase");
    const aSpeed = gl.getAttribLocation(prog, "a_speed");

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0); // Cap at 1.0 for smooth 60fps
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    handleResize();

    let animFrame = 0;
    const t0 = performance.now();
    let lastScroll = 0;
    let lastGlowUpdate = 0;
    let frameCount = 0;

    // ── Continuous 60/120fps Animation Loop (Zero Layout Thrashing) ──
    const render = () => {
      // Pause drawing when tab is backgrounded to preserve device battery and CPU
      if (typeof document !== "undefined" && document.hidden) {
        animFrame = requestAnimationFrame(render);
        return;
      }

      const targetS = targetScrollRef.current;
      const currentS = currentScrollRef.current;
      const nextS = currentS + (targetS - currentS) * 0.16;
      currentScrollRef.current = nextS;

      const deltaS = Math.abs(nextS - lastScroll);
      velocityRef.current = deltaS * 50;
      lastScroll = nextS;

      const targetM = targetMouseRef.current;
      const currentM = currentMouseRef.current;
      currentMouseRef.current = {
        x: currentM.x + (targetM.x - currentM.x) * 0.08,
        y: currentM.y + (targetM.y - currentM.y) * 0.08,
      };

      const targetC = targetRgbRef.current;
      const currentC = currentRgbRef.current;
      currentRgbRef.current = [
        currentC[0] + (targetC[0] - currentC[0]) * 0.06,
        currentC[1] + (targetC[1] - currentC[1]) * 0.06,
        currentC[2] + (targetC[2] - currentC[2]) * 0.06,
      ];

      // Update ambient glow positions smoothly at lower frequency (every ~250ms)
      const now = performance.now();
      if (now - lastGlowUpdate > 250 && rootRef.current) {
        lastGlowUpdate = now;
        const elapsed = (now - t0) / 1000;
        const glowX1 = Math.round(65 + Math.sin(elapsed * 0.4) * 12 + currentM.x * 8);
        const glowY1 = Math.round(30 + Math.cos(elapsed * 0.3) * 10 + currentM.y * 6);
        const glowX2 = Math.round(28 + Math.cos(elapsed * 0.35) * 10 - currentM.x * 6);
        const glowY2 = Math.round(68 + Math.sin(elapsed * 0.45) * 8 - currentM.y * 8);

        rootRef.current.style.setProperty("--glow-x1", `${glowX1}%`);
        rootRef.current.style.setProperty("--glow-y1", `${glowY1}%`);
        rootRef.current.style.setProperty("--glow-x2", `${glowX2}%`);
        rootRef.current.style.setProperty("--glow-y2", `${glowY2}%`);
      }

      // Draw WebGL particles
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);

      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0);

      gl.enableVertexAttribArray(aSize);
      gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, STRIDE, 3 * 4);

      gl.enableVertexAttribArray(aPhase);
      gl.vertexAttribPointer(aPhase, 1, gl.FLOAT, false, STRIDE, 4 * 4);

      gl.enableVertexAttribArray(aSpeed);
      gl.vertexAttribPointer(aSpeed, 1, gl.FLOAT, false, STRIDE, 5 * 4);

      const elapsed = (now - t0) / 1000;
      gl.uniform1f(uScroll, nextS);
      gl.uniform1f(uVel, velocityRef.current);
      gl.uniform1f(uTime, elapsed);
      gl.uniform3f(uColor, currentC[0], currentC[1], currentC[2]);
      gl.uniform2f(uMouse, currentM.x, currentM.y);

      gl.drawArrays(gl.POINTS, 0, N);

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      if (prog) gl.deleteProgram(prog);
      if (buf) gl.deleteBuffer(buf);
      if (vert) gl.deleteShader(vert);
      if (frag) gl.deleteShader(frag);
    };
  }, []);

  return (
    <div ref={rootRef} className="homepage-webgl-root" aria-hidden="true">
      {/* 1. Deep space WebGL Canvas */}
      <canvas ref={canvasRef} className="homepage-webgl-canvas" />

      {/* 2. CrazyGL Perspective Depth Grid */}
      <div ref={gridRef} className="homepage-grid-overlay" />

      {/* 3. Volumetric Ambient Color Blooms */}
      <div className="homepage-ambient-glow" />

      {/* 4. Subtle Edge Vignette */}
      <div className="homepage-vignette-overlay" />
    </div>
  );
}
