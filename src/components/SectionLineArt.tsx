"use client";

import { useEffect, useRef } from "react";

type ArtKind = "route" | "community" | "plate" | "featured" | "delivery" | "steps";

const PATHS: Record<ArtKind, string[]> = {
  route: ["M8 74 C28 68 28 30 52 36 S74 72 94 56 S116 24 142 28", "M142 28 C126 12 108 20 108 36 C108 56 142 66 142 66 S176 56 176 36 C176 20 158 12 142 28Z", "M142 34v5"],
  community: ["M10 22 Q10 14 20 14 H88 Q98 14 98 24 V58 Q98 68 88 68 H48 L28 84 V68 H20 Q10 68 10 58Z", "M30 42h3 M52 42h3 M74 42h3", "M130 20l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2Z"],
  plate: ["M16 52a54 36 0 1 0 108 0a54 36 0 1 0-108 0Z", "M28 52a42 25 0 1 0 84 0a42 25 0 1 0-84 0Z", "M44 26 C34 14 50 10 42 2 M68 24 C58 12 74 8 66 0 M92 26 C82 14 98 10 90 2"],
  featured: ["M60 86 C42 69 36 58 41 46 C45 37 54 32 55 18 C71 31 80 39 78 52 C90 47 92 40 91 33 C109 49 115 66 104 81 C94 96 71 99 60 86Z", "M67 82 C59 73 62 64 72 54 C82 64 88 73 81 82 C78 86 71 87 67 82Z"],
  delivery: ["M12 66h14l8-23h48l10 23h13", "M105 66h18l13-17h22l12 17h10", "M17 66a9 9 0 1 0 18 0a9 9 0 1 0-18 0Z", "M151 66a9 9 0 1 0 18 0a9 9 0 1 0-18 0Z", "M116 29c18-14 33-12 47-2 M148 18l16 9-14 10"],
  steps: ["M18 22h34v34H18z M78 22h34v34H78z M138 22h34v34h-34z", "M54 39h18 M66 35l6 4-6 4 M114 39h18 M126 35l6 4-6 4", "M29 39h12 M89 39h12 M149 39h12"],
};

export default function SectionLineArt({ kind, label }: { kind: ArtKind; label: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const section = svg?.parentElement;
    if (!svg || !section) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        svg.style.setProperty("--section-progress", String(progress));
        svg.style.setProperty("--section-drift", `${(progress - 0.5) * 22}px`);
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle("has-line-art-arrived", entry.isIntersecting);
      if (entry.isIntersecting) update();
    }, { threshold: 0.08 });
    observer.observe(section);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={ref} className={`section-line-art section-line-art-${kind}`} viewBox="0 0 190 100" fill="none" role="img" aria-label={label}>
      {PATHS[kind].map((d, index) => (
        <path key={index} d={d} pathLength="1" />
      ))}
    </svg>
  );
}
