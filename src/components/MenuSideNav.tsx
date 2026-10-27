"use client";

import { useEffect, useRef, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MenuSideNavProps {
  categories: Category[];
}

export default function MenuSideNav({ categories }: MenuSideNavProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionIds = categories.map((c) => `menu-${c.slug}`);
    const ratioMap = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratioMap.set(entry.target.id, entry.intersectionRatio);
        });

        let bestId = "";
        let bestRatio = 0;
        ratioMap.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId) setActiveId(bestId);
      },
      {
        rootMargin: "-10% 0px -50% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [categories]);

  const handleClick = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(`menu-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="menu-side-nav" aria-label="Jump to menu category">
      <span className="menu-side-nav-label">Jump to</span>
      <ul className="menu-side-nav-list">
        {categories.map((category, index) => {
          const sectionId = `menu-${category.slug}`;
          const isActive = activeId === sectionId;
          return (
            <li key={category.id}>
              <a
                href={`#${sectionId}`}
                className={`menu-side-nav-link${isActive ? " active" : ""}`}
                onClick={(e) => handleClick(category.slug, e)}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="menu-side-nav-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="menu-side-nav-name">{category.name}</span>
                {isActive && (
                  <span className="menu-side-nav-dot" aria-hidden="true" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
