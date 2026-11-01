import fs from 'fs';

const svg = fs.readFileSync('public/logo.svg', 'utf8');

// Match every complete <path .../> (supporting multiline d attributes)
const allPaths = svg.match(/<path[\s\S]*?\/>/g);
console.log(`Matched ${allPaths.length} complete paths in logo.svg`);

// Add pathLength="1000" and self-draw class to each path
const animatedPaths = allPaths.map((p, idx) => {
  // Stagger delays slightly based on index so strokes draw in a fluid cascade
  const delay = Math.min(0.4, (idx % 12) * 0.035);
  // Replace the closing "/>" with our attributes
  return p.replace(/\/>$/, ` pathLength="1000" class="self-draw-stroke" style="animation-delay: ${delay.toFixed(3)}s;" />`);
}).join('\n');

const selfDrawingSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <!-- Brand Color Gradients -->
    <linearGradient id="goldBeam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.1" />
      <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.1" />
    </linearGradient>

    <radialGradient id="centerAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f74326" stop-opacity="0.38" />
      <stop offset="45%" stop-color="#f97316" stop-opacity="0.15" />
      <stop offset="75%" stop-color="#f59e0b" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Bloom Filters -->
    <filter id="drawGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="bloomFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="28" result="blur1" />
      <feGaussianBlur stdDeviation="8" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <style><![CDATA[
      /* --- Self-Drawing Stroke Animation --- */
      @keyframes drawStrokeAnim {
        0% {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          stroke: #ff7a59;
          stroke-width: 32;
          fill: #f74326;
          fill-opacity: 0;
          filter: drop-shadow(0 0 12px rgba(255, 122, 89, 0.9));
        }
        50% {
          stroke-dasharray: 1000;
          stroke-dashoffset: 0;
          stroke: #f74326;
          stroke-width: 26;
          fill: #f74326;
          fill-opacity: 0;
          filter: drop-shadow(0 0 20px rgba(247, 67, 38, 0.95));
        }
        70% {
          stroke-dashoffset: 0;
          stroke: #f74326;
          stroke-width: 14;
          fill: #f74326;
          fill-opacity: 1;
          filter: drop-shadow(0 0 35px rgba(247, 67, 38, 0.85)) drop-shadow(0 0 60px rgba(245, 158, 11, 0.5));
        }
        88%, 100% {
          stroke-dashoffset: 0;
          stroke: #f74326;
          stroke-width: 0;
          fill: #f74326;
          fill-opacity: 1;
          filter: drop-shadow(0 0 22px rgba(247, 67, 38, 0.65));
        }
      }

      /* Container breathing */
      @keyframes breatheAnim {
        0%, 100% {
          transform: scale(0.98);
        }
        50% {
          transform: scale(1.02);
        }
      }

      /* Celestial Orbit Drawing & Spin */
      @keyframes drawOrbitRing {
        0% {
          stroke-dashoffset: 2000;
          opacity: 0;
        }
        40% {
          opacity: 0.8;
        }
        100% {
          stroke-dashoffset: 0;
          opacity: 0.65;
        }
      }

      @keyframes spinOrbitRing {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes counterSpinRing {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }

      @keyframes pulseAuraHalo {
        0%, 100% {
          opacity: 0.45;
          transform: scale(0.85);
        }
        50% {
          opacity: 0.85;
          transform: scale(1.12);
        }
      }

      .self-draw-stroke {
        stroke-linecap: round;
        stroke-linejoin: round;
        animation: drawStrokeAnim 3.8s cubic-bezier(0.42, 0, 0.18, 1) infinite;
        will-change: stroke-dashoffset, fill-opacity;
      }

      .logo-group {
        transform-origin: 1000px 1000px;
        animation: breatheAnim 3.8s ease-in-out infinite;
      }

      .aura-glow {
        transform-origin: 1000px 1000px;
        animation: pulseAuraHalo 3.8s ease-in-out infinite;
      }

      .orbit-outer {
        transform-origin: 1000px 1000px;
        animation: spinOrbitRing 22s linear infinite;
      }

      .orbit-outer-circle {
        stroke-dasharray: 2000;
        animation: drawOrbitRing 2.6s ease-out forwards;
      }

      .orbit-inner {
        transform-origin: 1000px 1000px;
        animation: counterSpinRing 28s linear infinite;
      }
    ]]></style>
  </defs>

  <!-- Ambient Radiant Halo -->
  <circle class="aura-glow" cx="1000" cy="1000" r="860" fill="url(#centerAura)" />

  <!-- Outer Drawing & Spinning Celestial Orbit -->
  <g class="orbit-outer">
    <circle
      class="orbit-outer-circle"
      cx="1000"
      cy="1000"
      r="890"
      fill="none"
      stroke="url(#goldBeam)"
      stroke-width="3.5"
      stroke-dasharray="45 55 150 55"
    />
    <circle cx="1000" cy="110" r="12" fill="#fbbf24" filter="url(#drawGlow)" />
    <circle cx="1000" cy="1890" r="10" fill="#f74326" filter="url(#drawGlow)" />
    <circle cx="110" cy="1000" r="8" fill="#fbbf24" opacity="0.85" />
    <circle cx="1890" cy="1000" r="8" fill="#f74326" opacity="0.85" />
  </g>

  <!-- Inner Subtle Ring -->
  <g class="orbit-inner">
    <circle
      cx="1000"
      cy="1000"
      r="790"
      fill="none"
      stroke="rgba(247, 67, 38, 0.4)"
      stroke-width="2.5"
      stroke-dasharray="25 35 90 35"
    />
    <circle cx="1000" cy="210" r="8" fill="#f59e0b" opacity="0.8" />
    <circle cx="1000" cy="1790" r="8" fill="#f74326" opacity="0.8" />
  </g>

  <!-- Self-Drawing Main Logo -->
  <g class="logo-group">
    <g transform="translate(0.000000,2000.000000) scale(0.100000,-0.100000)">
${animatedPaths}
    </g>
  </g>
</svg>`;

fs.writeFileSync('public/animated-logo.svg', selfDrawingSvg);
console.log('Successfully generated public/animated-logo.svg! Bytes:', selfDrawingSvg.length);
