"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  onCTAClick?: string;
}

export default function SandTypographyHero({
  heading = "Make your gathering worth gathering for.",
  subheading = "From intimate dinners to milestone celebrations in Accra, we plan a menu that feels generous, considered, and unmistakably Ghanaian.",
  ctaLabel = "Plan your event ↓",
  onCTAClick = "#appointment",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize WebGL context
    const gl = (canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    }) ||
      canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      })) as WebGLRenderingContext | null;

    if (!gl) return;

    // Enable soft blending for sand grains
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Vertex shader
    const vsSource = `
      attribute vec2 a_pos;
      attribute vec3 a_color;
      attribute float a_alpha;
      uniform vec2 u_resolution;
      uniform float u_grainSize;
      uniform float u_dpr;
      varying vec3 v_color;
      varying float v_alpha;

      void main() {
        vec2 ndc = vec2(
          (a_pos.x / u_resolution.x) * 2.0 - 1.0,
          1.0 - (a_pos.y / u_resolution.y) * 2.0
        );
        gl_Position = vec4(ndc, 0.0, 1.0);
        gl_PointSize = max(1.0, u_grainSize * u_dpr * 3.2);
        v_color = a_color;
        v_alpha = a_alpha;
      }
    `;

    // Fragment shader: Gaussian soft sand particle
    const fsSource = `
      precision mediump float;
      varying vec3 v_color;
      varying float v_alpha;
      uniform float u_opacity;

      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d2 = dot(c, c);
        if (d2 > 0.25) discard;
        float d = sqrt(d2) * 2.0;

        float core = exp(-d * d * 8.0);
        float halo = exp(-d * d * 1.8);
        float intensity = core * 1.0 + halo * 0.32;

        float alpha = intensity * v_alpha * u_opacity;
        gl_FragColor = vec4(v_color * alpha, alpha);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, src);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
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
      console.error("Program error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const aPosLoc = gl.getAttribLocation(program, "a_pos");
    const aColorLoc = gl.getAttribLocation(program, "a_color");
    const aAlphaLoc = gl.getAttribLocation(program, "a_alpha");

    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uGrainSizeLoc = gl.getUniformLocation(program, "u_grainSize");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");
    const uOpacityLoc = gl.getUniformLocation(program, "u_opacity");

    // Sample heading text into home positions
    const GRAIN_COUNT = 8500;
    const AMBIENT_COUNT = 400;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const sampleHomes = (w: number, h: number) => {
      const offCanvas = document.createElement("canvas");
      const ctx = offCanvas.getContext("2d");
      if (!ctx) return [];

      const isMobile = w < 640;
      const targetWidth = Math.min(w * 0.9, 1140);
      const fontSize = isMobile ? Math.max(34, w * 0.088) : Math.max(52, Math.min(76, w * 0.056));
      const font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;

      ctx.font = font;

      // Split into two balanced, elegant lines for maximum letter clarity
      const lines = [
        "Make your gathering",
        "worth gathering for."
      ];

      const lineHeight = fontSize * 1.28;
      const totalTextHeight = lines.length * lineHeight;

      offCanvas.width = Math.ceil(targetWidth + 80);
      offCanvas.height = Math.ceil(totalTextHeight + 60);

      ctx.font = font;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";
      ctx.textAlign = "center";

      lines.forEach((line, idx) => {
        ctx.fillText(line, offCanvas.width / 2, idx * lineHeight + 20);
      });

      const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const pixels = imgData.data;
      const validPoints: { x: number; y: number }[] = [];

      for (let y = 0; y < offCanvas.height; y += 2) {
        for (let x = 0; x < offCanvas.width; x += 2) {
          const alpha = pixels[(y * offCanvas.width + x) * 4 + 3];
          if (alpha > 75) {
            validPoints.push({ x, y });
          }
        }
      }

      if (validPoints.length === 0) return [];

      // Center the text bounding box within display coordinates
      const textCenterX = w / 2;
      const textCenterY = h * 0.38;

      const offsetX = textCenterX - offCanvas.width / 2;
      const offsetY = textCenterY - offCanvas.height / 2;

      // Evenly distribute grains across valid points
      const result: { x: number; y: number }[] = [];
      const len = validPoints.length;
      for (let i = 0; i < GRAIN_COUNT; i++) {
        const pt = validPoints[i % len];
        result.push({
          x: pt.x + offsetX + (Math.random() - 0.5) * 1.5,
          y: pt.y + offsetY + (Math.random() - 0.5) * 1.5,
        });
      }

      return result;
    };

    let homes = sampleHomes(width, height);

    // Grain state arrays
    const totalGrains = GRAIN_COUNT + AMBIENT_COUNT;
    const pos = new Float32Array(totalGrains * 2);
    const vel = new Float32Array(totalGrains * 2);
    const homePos = new Float32Array(totalGrains * 2);
    const colors = new Float32Array(totalGrains * 3);
    const alphas = new Float32Array(totalGrains);

    // Warm Ghanaian gold & amber terracotta palette
    const goldColor = [1.0, 0.90, 0.32];
    const terracottaColor = [0.93, 0.36, 0.12];
    const saffronColor = [0.98, 0.65, 0.16];

    // Initialize headline grains — start immediately at home coordinates for instant crisp legibility
    for (let i = 0; i < GRAIN_COUNT; i++) {
      const hx = homes[i]?.x ?? width / 2;
      const hy = homes[i]?.y ?? height * 0.38;

      pos[i * 2 + 0] = hx;
      pos[i * 2 + 1] = hy;
      homePos[i * 2 + 0] = hx;
      homePos[i * 2 + 1] = hy;

      // Color variation between gold, saffron, and terracotta
      const t = Math.random();
      const col = t > 0.55 ? goldColor : t > 0.22 ? saffronColor : terracottaColor;

      colors[i * 3 + 0] = col[0] + (Math.random() - 0.5) * 0.08;
      colors[i * 3 + 1] = col[1] + (Math.random() - 0.5) * 0.08;
      colors[i * 3 + 2] = col[2] + (Math.random() - 0.5) * 0.08;

      alphas[i] = 0.65 + Math.random() * 0.35;
    }

    // Initialize ambient background spice grains
    for (let i = GRAIN_COUNT; i < totalGrains; i++) {
      pos[i * 2 + 0] = Math.random() * width;
      pos[i * 2 + 1] = Math.random() * height;
      homePos[i * 2 + 0] = pos[i * 2 + 0];
      homePos[i * 2 + 1] = pos[i * 2 + 1];

      colors[i * 3 + 0] = goldColor[0];
      colors[i * 3 + 1] = goldColor[1];
      colors[i * 3 + 2] = goldColor[2];

      alphas[i] = 0.25 + Math.random() * 0.3;
    }

    // Buffers
    const posBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const alphaBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);

    // Mouse tracking & wind force
    const mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (mouse.prevX !== -1000) {
        mouse.vx = clientX - mouse.prevX;
        mouse.vy = clientY - mouse.prevY;
      }
      mouse.prevX = clientX;
      mouse.prevY = clientY;
      mouse.x = clientX;
      mouse.y = clientY;

      setHasInteracted(true);
    };

    const handlePointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // Resize handler
    const updateCanvasSize = () => {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Re-sample homes on major resize
        homes = sampleHomes(width, height);
        for (let i = 0; i < GRAIN_COUNT; i++) {
          if (homes[i]) {
            homePos[i * 2 + 0] = homes[i].x;
            homePos[i * 2 + 1] = homes[i].y;
          }
        }
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => updateCanvasSize());
    resizeObserver.observe(container);

    // Animation loop
    let animId: number;
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    const render = () => {
      if (isVisible) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Spring stiffness & damping parameters
        const stiffness = 0.045;
        const damping = 0.88;
        const windRadius = 190;
        const windRadiusSq = windRadius * windRadius;
        const cursorSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        const windStrength = Math.min(cursorSpeed * 0.35, 9.0);

        // Physics step for headline grains
        for (let i = 0; i < GRAIN_COUNT; i++) {
          const idx = i * 2;
          const px = pos[idx + 0];
          const py = pos[idx + 1];
          const hx = homePos[idx + 0];
          const hy = homePos[idx + 1];

          // 1. Spring towards home position
          let fx = (hx - px) * stiffness;
          let fy = (hy - py) * stiffness;

          // 2. Cursor wind force
          if (mouse.x !== -1000 && cursorSpeed > 0.5) {
            const dx = px - mouse.x;
            const dy = py - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < windRadiusSq && distSq > 0.1) {
              const dist = Math.sqrt(distSq);
              const falloff = 1.0 - dist / windRadius;
              const push = falloff * windStrength;

              // Radial blast + carry in cursor velocity direction
              fx += (dx / dist) * push * 3.2 + mouse.vx * 0.15 * falloff;
              fy += (dy / dist) * push * 3.2 + mouse.vy * 0.15 * falloff;
            }
          }

          // 3. Subtle Brownian vibration
          fx += (Math.random() - 0.5) * 0.18;
          fy += (Math.random() - 0.5) * 0.18;

          // Integrate velocity and position
          vel[idx + 0] = (vel[idx + 0] + fx) * damping;
          vel[idx + 1] = (vel[idx + 1] + fy) * damping;

          pos[idx + 0] += vel[idx + 0];
          pos[idx + 1] += vel[idx + 1];
        }

        // Ambient grains drift
        for (let i = GRAIN_COUNT; i < totalGrains; i++) {
          const idx = i * 2;
          pos[idx + 0] += (Math.random() - 0.5) * 0.6 + 0.15;
          pos[idx + 1] -= 0.3 + Math.random() * 0.2;

          if (pos[idx + 1] < 0) {
            pos[idx + 1] = height;
            pos[idx + 0] = Math.random() * width;
          }
          if (pos[idx + 0] > width) pos[idx + 0] = 0;
        }

        // Decay mouse velocity
        mouse.vx *= 0.85;
        mouse.vy *= 0.85;

        // Draw Call
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.uniform2f(uResolutionLoc, width, height);
        gl.uniform1f(uGrainSizeLoc, 1.35);
        gl.uniform1f(uDprLoc, dpr);
        gl.uniform1f(uOpacityLoc, 1.0);

        // Upload updated positions
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

        gl.drawArrays(gl.POINTS, 0, totalGrains);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (posBuffer) gl.deleteBuffer(posBuffer);
      if (colorBuffer) gl.deleteBuffer(colorBuffer);
      if (alphaBuffer) gl.deleteBuffer(alphaBuffer);
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
      className="relative w-full min-h-[580px] md:min-h-[660px] overflow-hidden flex flex-col justify-between items-center text-center select-none"
      style={{
        background: "radial-gradient(135% 120% at 50% 25%, #2a190f 0%, #150f0a 82%)",
        touchAction: "pan-y",
      }}
      aria-label="Event catering banner"
    >
      {/* Interactive WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0 pointer-events-auto cursor-crosshair"
      />

      {/* Top Tag */}
      <div className="relative z-10 pt-10 px-4 pointer-events-none">
        <h1 className="sr-only">{heading}</h1>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-black/45 backdrop-blur-md border border-amber-500/30 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Event Catering in Accra
        </span>
      </div>

      {/* Center Spacer to reserve visual clearance for the sand headline */}
      <div className="w-full flex-1 min-h-[220px] pointer-events-none" />

      {/* Bottom Content: Subheading & CTA */}
      <div className="relative z-10 pb-12 px-6 max-w-2xl mx-auto flex flex-col items-center gap-6">
        <p className="text-amber-100/85 text-sm sm:text-base md:text-lg leading-relaxed font-medium text-shadow-sm pointer-events-none">
          {subheading}
        </p>

        <a
          href={onCTAClick}
          onClick={handleScrollToAppointment}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 cursor-pointer pointer-events-auto"
        >
          {ctaLabel}
        </a>

        {/* Interactive Helper Cue */}
        <div
          className={`transition-all duration-700 pointer-events-none ${
            hasInteracted ? "opacity-0 translate-y-2" : "opacity-75 translate-y-0"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-300/80 tracking-wider">
            ✨ Sweep your cursor across the words to stir the golden spice grains
          </span>
        </div>
      </div>
    </section>
  );
}
