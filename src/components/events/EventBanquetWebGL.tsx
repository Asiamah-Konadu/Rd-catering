"use client";

import React, { useEffect, useRef, useState } from "react";

export default function EventBanquetWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check WebGL support
    const gl = (canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    }) ||
      canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: true,
      })) as WebGLRenderingContext | null;

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // Enable additive blending for glowing embers
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // ----------------------------------------------------
    // 1. Shaders for Celebratory Silk & Spices Waves
    // ----------------------------------------------------
    const waveVsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const waveFsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_interaction;

      // Ghanaian celebratory banquet color palette
      const vec3 COLOR_MIDNIGHT = vec3(0.09, 0.07, 0.05);   // Warm deep mahogany
      const vec3 COLOR_TERRACOTTA = vec3(0.85, 0.28, 0.12); // Rich Ghanaian pepper / terracotta
      const vec3 COLOR_AMBER = vec3(0.96, 0.58, 0.11);      // Spiced saffron honey
      const vec3 COLOR_GOLD = vec3(1.0, 0.85, 0.42);       // Ceremonial banquet gold

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = (st - 0.5) * vec2(aspect, 1.0);

        // Distance from smoothed mouse cursor with concentric celebratory ripples
        vec2 mouseP = (u_mouse - 0.5) * vec2(aspect, 1.0);
        float mouseDist = length(p - mouseP);
        float mouseWave = sin(mouseDist * 18.0 - u_time * 5.5) * exp(-mouseDist * 2.8) * u_interaction;

        // Fluid undulating ceremonial silk drapery
        float t = u_time * 0.42;
        float wave1 = sin(p.x * 2.6 + p.y * 1.8 + t) * 0.48;
        float wave2 = cos(p.x * 1.8 - p.y * 2.2 - t * 0.75) * 0.38;
        float wave3 = sin(p.y * 3.8 + t * 1.1 + wave1) * 0.28;

        float drape = wave1 + wave2 + wave3 + mouseWave * 0.65;

        // Folds and caustic highlights
        float fold = smoothstep(-0.35, 0.55, drape);
        float highlight = pow(smoothstep(0.22, 0.72, drape), 2.2);
        float rim = pow(1.0 - abs(drape), 3.0) * 0.45;

        // Layer color blend
        vec3 base = mix(COLOR_MIDNIGHT, COLOR_TERRACOTTA, fold * 0.9);
        vec3 color = mix(base, COLOR_AMBER, highlight * 0.88);
        color += COLOR_GOLD * (highlight * 0.85 + rim * 0.5);

        // Soft atmospheric edge vignette
        float vignette = smoothstep(1.3, 0.2, length(st - 0.5));
        float alpha = clamp((fold * 0.8 + highlight * 0.65 + 0.22) * vignette, 0.0, 0.95);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    // ----------------------------------------------------
    // 2. Shaders for Golden Spice Embers / Floating Aroma
    // ----------------------------------------------------
    const emberVsSource = `
      attribute vec2 a_position;
      attribute float a_size;
      attribute float a_alpha;
      varying float v_alpha;
      void main() {
        v_alpha = a_alpha;
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = a_size;
      }
    `;

    const emberFsSource = `
      precision mediump float;
      varying float v_alpha;

      void main() {
        // Soft glowing circular radial particle
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // Core gold to outer fiery amber halo
        float glow = exp(-dist * 5.2);
        vec3 coreColor = vec3(1.0, 0.95, 0.75);
        vec3 haloColor = vec3(0.98, 0.62, 0.15);
        vec3 color = mix(haloColor, coreColor, glow);

        gl_FragColor = vec4(color, glow * v_alpha);
      }
    `;

    // Shader compilation helper
    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(
      glCtx: WebGLRenderingContext,
      vsSrc: string,
      fsSrc: string
    ) {
      const vs = createShader(glCtx, glCtx.VERTEX_SHADER, vsSrc);
      const fs = createShader(glCtx, glCtx.FRAGMENT_SHADER, fsSrc);
      if (!vs || !fs) return null;

      const program = glCtx.createProgram();
      if (!program) return null;
      glCtx.attachShader(program, vs);
      glCtx.attachShader(program, fs);
      glCtx.linkProgram(program);

      if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
        console.error("Program link error:", glCtx.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    const waveProgram = createProgram(gl, waveVsSource, waveFsSource);
    const emberProgram = createProgram(gl, emberVsSource, emberFsSource);

    if (!waveProgram || !emberProgram) {
      setHasWebGL(false);
      return;
    }

    // Quad geometry for wave shader
    const quadVertices = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    // Uniform locations for wave program
    const wavePosLoc = gl.getAttribLocation(waveProgram, "a_position");
    const uResolutionLoc = gl.getUniformLocation(waveProgram, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(waveProgram, "u_time");
    const uMouseLoc = gl.getUniformLocation(waveProgram, "u_mouse");
    const uInteractionLoc = gl.getUniformLocation(waveProgram, "u_interaction");

    // Uniform and attribute locations for ember program
    const emberPosLoc = gl.getAttribLocation(emberProgram, "a_position");
    const emberSizeLoc = gl.getAttribLocation(emberProgram, "a_size");
    const emberAlphaLoc = gl.getAttribLocation(emberProgram, "a_alpha");

    // Initialize 70 organic floating spice embers
    const EMBER_COUNT = 70;
    interface Ember {
      x: number;
      y: number;
      baseSize: number;
      speedY: number;
      speedX: number;
      phase: number;
      vx: number;
      vy: number;
      alpha: number;
    }

    const embers: Ember[] = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push({
        x: (Math.random() * 2 - 1) * 0.95,
        y: Math.random() * 2 - 1,
        baseSize: 5 + Math.random() * 14,
        speedY: 0.002 + Math.random() * 0.004,
        speedX: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * Math.PI * 2,
        vx: 0,
        vy: 0,
        alpha: 0.2 + Math.random() * 0.75,
      });
    }

    const emberData = new Float32Array(EMBER_COUNT * 4); // [x, y, size, alpha]
    const emberBuffer = gl.createBuffer();

    // Interaction & Animation state
    let animationFrameId: number;
    let isVisible = true;
    let startTime = performance.now();
    let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    let interactionStrength = 0.0;
    let targetInteractionStrength = 0.0;

    // Resize handler
    const updateSize = () => {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(container);

    // Mouse movement listener
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.targetX = Math.max(0, Math.min(1, clientX / rect.width));
      mouse.targetY = Math.max(0, Math.min(1, 1.0 - clientY / rect.height));
      targetInteractionStrength = 1.0;
      setHasInteracted(true);

      // Add gentle impulse to nearby spice embers
      const clipX = (mouse.targetX * 2 - 1);
      const clipY = (mouse.targetY * 2 - 1);

      embers.forEach((ember) => {
        const dx = ember.x - clipX;
        const dy = ember.y - clipY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 0.25) {
          const factor = (0.25 - distSq) * 0.035;
          ember.vx += (dx / Math.sqrt(distSq || 0.001)) * factor;
          ember.vy += (dy / Math.sqrt(distSq || 0.001)) * factor;
        }
      });
    };

    const handlePointerLeave = () => {
      targetInteractionStrength = 0.2;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // Pause animation when scrolled off-screen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Main Render Loop (Smooth 60fps)
    const render = () => {
      if (isVisible) {
        const currentTime = (performance.now() - startTime) * 0.001;

        // Smooth cursor interpolation
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
        interactionStrength += (targetInteractionStrength - interactionStrength) * 0.05;

        // Fade down target interaction when idle
        targetInteractionStrength *= 0.985;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // ----------------------------------------------------
        // Pass 1: Render Undulating Silk & Spice Waves
        // ----------------------------------------------------
        gl.useProgram(waveProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(wavePosLoc);
        gl.vertexAttribPointer(wavePosLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform1f(uTimeLoc, currentTime);
        gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
        gl.uniform1f(uInteractionLoc, interactionStrength);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // ----------------------------------------------------
        // Pass 2: Render Rising Golden Spice Embers
        // ----------------------------------------------------
        gl.useProgram(emberProgram);

        // Update physics of embers
        for (let i = 0; i < EMBER_COUNT; i++) {
          const em = embers[i];
          em.phase += 0.03;
          em.x += Math.sin(em.phase) * 0.0012 + em.speedX + em.vx;
          em.y += em.speedY + em.vy;

          // Drag / friction on mouse impulses
          em.vx *= 0.92;
          em.vy *= 0.92;

          // Wrap around top/sides
          if (em.y > 1.1) {
            em.y = -1.1;
            em.x = (Math.random() * 2 - 1) * 0.95;
            em.vx = 0;
            em.vy = 0;
          }
          if (em.x < -1.1) em.x = 1.1;
          if (em.x > 1.1) em.x = -1.1;

          // Pulse size slightly
          const dynamicSize =
            (em.baseSize + Math.sin(em.phase * 1.5) * 3) * (canvas.width > 768 ? 1.4 : 1.0);

          emberData[i * 4 + 0] = em.x;
          emberData[i * 4 + 1] = em.y;
          emberData[i * 4 + 2] = dynamicSize;
          emberData[i * 4 + 3] = em.alpha * (0.6 + Math.sin(em.phase) * 0.4);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, emberBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, emberData, gl.DYNAMIC_DRAW);

        const stride = 4 * 4; // 4 floats: x, y, size, alpha
        gl.enableVertexAttribArray(emberPosLoc);
        gl.vertexAttribPointer(emberPosLoc, 2, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(emberSizeLoc);
        gl.vertexAttribPointer(emberSizeLoc, 1, gl.FLOAT, false, stride, 2 * 4);

        gl.enableVertexAttribArray(emberAlphaLoc);
        gl.vertexAttribPointer(emberAlphaLoc, 1, gl.FLOAT, false, stride, 3 * 4);

        gl.drawArrays(gl.POINTS, 0, EMBER_COUNT);
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
      if (quadBuffer) gl.deleteBuffer(quadBuffer);
      if (emberBuffer) gl.deleteBuffer(emberBuffer);
      if (waveProgram) gl.deleteProgram(waveProgram);
      if (emberProgram) gl.deleteProgram(emberProgram);
    };
  }, []);

  if (!hasWebGL) {
    return null; // Graceful fallback: renders the static photo without disruption
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto cursor-crosshair select-none"
      style={{ touchAction: "none" }}
      aria-hidden="true"
    >
      {/* Real-time WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block absolute inset-0 mix-blend-screen opacity-90 transition-opacity duration-700"
      />

      {/* Gentle interactive guidance badge that fades away after user interaction */}
      <div
        className={`absolute top-4 left-4 z-20 pointer-events-none transition-all duration-700 ${
          hasInteracted ? "opacity-0 translate-y-[-4px]" : "opacity-90 translate-y-0"
        }`}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-200 bg-black/40 backdrop-blur-md border border-amber-400/30 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Interactive · Move cursor to stir banquet embers & silk
        </span>
      </div>
    </div>
  );
}
