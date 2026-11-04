"use client";

import { useEffect, useRef } from "react";

export default function JourneyRope() {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = rootRef.current;
    const main = svg?.parentElement;
    const path = svg?.querySelector<SVGPathElement>(".journey-rope-path");
    const thread = svg?.querySelector<SVGPathElement>(".journey-rope-thread");
    const marker = svg?.querySelector<SVGCircleElement>(".journey-rope-marker");
    const bead = svg?.querySelector<SVGCircleElement>(".journey-rope-bead");
    const waypoints = svg?.querySelector<SVGGElement>(".journey-rope-waypoints");
    if (!svg || !main || !path || !thread || !marker || !bead || !waypoints) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let scrollFrame = 0;
    let pathLength = 0;
    let targetProgress = 0;
    let shownProgress = 0;
    let connected = false;
    const animateMarker = () => {
      scrollFrame = 0;
      shownProgress += (targetProgress - shownProgress) * 0.16;
      if (Math.abs(targetProgress - shownProgress) < 0.001) shownProgress = targetProgress;
      const point = path.getPointAtLength(pathLength * shownProgress);
      marker.setAttribute("cx", String(point.x));
      marker.setAttribute("cy", String(point.y));
      bead.setAttribute("cx", String(point.x));
      bead.setAttribute("cy", String(point.y));
      path.style.strokeDashoffset = String(1 - shownProgress);
      marker.style.opacity = !reducedMotion.matches && shownProgress > 0.005 && shownProgress < 0.995 ? "1" : "0";
      if (shownProgress !== targetProgress) scrollFrame = requestAnimationFrame(animateMarker);
    };
    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = main.clientWidth;
        const height = main.scrollHeight;
        const mainRect = main.getBoundingClientRect();
        const stops = Array.from(main.querySelectorAll<SVGSVGElement>(".section-line-art"));
        const points = stops.map((stop) => {
          const rect = stop.getBoundingClientRect();
          return {
            x: rect.left - mainRect.left + rect.width / 2,
            y: rect.top - mainRect.top + main.scrollTop + rect.height / 2,
          };
        });
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));

        if (points.length < 2) return;
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let index = 1; index < points.length; index += 1) {
          const from = points[index - 1];
          const to = points[index];
          const swing = Math.min(84, Math.abs(to.x - from.x) * 0.42 + 34) * (index % 2 ? 1 : -1);
          d += ` C ${from.x + (to.x - from.x) * 0.34 + swing} ${from.y + (to.y - from.y) * 0.38}, ${to.x - (to.x - from.x) * 0.34 + swing} ${from.y + (to.y - from.y) * 0.62}, ${to.x} ${to.y}`;
        }
        path.setAttribute("d", d);
        thread.setAttribute("d", d);
        pathLength = path.getTotalLength();
        while (waypoints.firstChild) waypoints.removeChild(waypoints.firstChild);
        points.forEach((point, index) => {
          if (index === 0) return;
          const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          node.setAttribute("cx", String(point.x));
          node.setAttribute("cy", String(point.y));
          node.setAttribute("r", "4");
          node.setAttribute("class", "journey-rope-stop");
          waypoints.appendChild(node);
        });
        const documentTop = mainRect.top + window.scrollY;
        const currentPosition = window.scrollY + window.innerHeight * 0.72 - documentTop;
        const journeyLength = Math.max(1, points[points.length - 1].y - points[0].y);
        targetProgress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1,
          (currentPosition - points[0].y) / journeyLength
        ));
        if (reducedMotion.matches) shownProgress = 1;
        if (pathLength > 0) {
          if (!connected) shownProgress = targetProgress;
          connected = true;
          if (!scrollFrame) scrollFrame = requestAnimationFrame(animateMarker);
        }
      });
    };

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(main);
    window.addEventListener("scroll", draw, { passive: true });
    window.addEventListener("resize", draw, { passive: true });
    draw();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", draw);
      window.removeEventListener("resize", draw);
    };
  }, []);

  return (
    <svg ref={rootRef} className="journey-rope" aria-hidden="true" focusable="false">
      <path className="journey-rope-thread" />
      <path className="journey-rope-path" pathLength="1" />
      <g className="journey-rope-waypoints" />
      <circle className="journey-rope-marker" r="4" />
      <circle className="journey-rope-bead" r="2.5" />
    </svg>
  );
}
