import fs from 'fs';

const svg = fs.readFileSync('public/logo.svg', 'utf8');
const gMatch = svg.match(/<g transform=[\s\S]*?<\/g>/)[0];

const animatedSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <!-- Brand Gradients -->
    <linearGradient id="rdBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff5a36" />
      <stop offset="50%" stop-color="#f74326" />
      <stop offset="100%" stop-color="#d82b0f" />
    </linearGradient>

    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.1" />
      <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.1" />
    </linearGradient>

    <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f74326" stop-opacity="0.4" />
      <stop offset="40%" stop-color="#f97316" stop-opacity="0.2" />
      <stop offset="75%" stop-color="#f59e0b" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Glow Filter -->
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="20" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="deepGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40" result="blur1" />
      <feGaussianBlur stdDeviation="15" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <style>
      @keyframes breathe {
        0%, 100% {
          transform: scale(0.97);
          filter: drop-shadow(0 0 15px rgba(247, 67, 38, 0.45));
        }
        50% {
          transform: scale(1.025);
          filter: drop-shadow(0 0 35px rgba(247, 67, 38, 0.85)) drop-shadow(0 0 70px rgba(245, 158, 11, 0.5));
        }
      }

      @keyframes spinRing {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes counterSpin {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }

      @keyframes pulseHalo {
        0%, 100% {
          transform: scale(0.88);
          opacity: 0.45;
        }
        50% {
          transform: scale(1.18);
          opacity: 0.9;
        }
      }

      .logo-center-wrapper {
        transform-origin: 1000px 1000px;
        animation: breathe 3.2s ease-in-out infinite;
      }

      .halo-bg {
        transform-origin: 1000px 1000px;
        animation: pulseHalo 3.8s ease-in-out infinite;
      }

      .orbit-ring-outer {
        transform-origin: 1000px 1000px;
        animation: spinRing 16s linear infinite;
      }

      .orbit-ring-inner {
        transform-origin: 1000px 1000px;
        animation: counterSpin 22s linear infinite;
      }
    </style>
  </defs>

  <!-- Ambient Radiant Halo -->
  <circle class="halo-bg" cx="1000" cy="1000" r="820" fill="url(#haloGlow)" />

  <!-- Outer Elegant Orbit Rings -->
  <g class="orbit-ring-outer">
    <circle cx="1000" cy="1000" r="880" fill="none" stroke="url(#goldAccent)" stroke-width="4" stroke-dasharray="35 45 120 45" opacity="0.65" />
    <circle cx="1000" cy="120" r="12" fill="#fbbf24" filter="url(#softGlow)" />
    <circle cx="1000" cy="1880" r="10" fill="#f74326" filter="url(#softGlow)" />
    <circle cx="120" cy="1000" r="8" fill="#fbbf24" opacity="0.85" />
    <circle cx="1880" cy="1000" r="8" fill="#f74326" opacity="0.85" />
  </g>

  <!-- Inner Counter-Spinning Orbit Ring -->
  <g class="orbit-ring-inner">
    <circle cx="1000" cy="1000" r="780" fill="none" stroke="rgba(247, 67, 38, 0.45)" stroke-width="3" stroke-dasharray="20 30 70 30" />
    <circle cx="1000" cy="220" r="8" fill="#f59e0b" opacity="0.8" />
    <circle cx="1000" cy="1780" r="8" fill="#f74326" opacity="0.8" />
  </g>

  <!-- Logo Mark with Breathing Pulse and Radiant Glow -->
  <g class="logo-center-wrapper">
    <!-- Subtle underglow duplicate -->
    <g opacity="0.6" filter="url(#deepGlow)">
      ${gMatch}
    </g>

    <!-- Main Crisp Logo with Rich-Dons Brand Palette -->
    <g filter="url(#softGlow)">
      ${gMatch}
    </g>
  </g>
</svg>`;

fs.writeFileSync('public/animated-logo.svg', animatedSvg);
console.log('Successfully wrote public/animated-logo.svg! Bytes:', animatedSvg.length);
