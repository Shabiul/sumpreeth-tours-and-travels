"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

const VB_W = 100;
const VB_H = 150;

/**
 * City markers, projected from real lat/long onto the viewBox
 * (lon 74.0–78.6°E → 0–100, lat 18.6–11.5°N → 0–150). Approximate.
 */
const PLACES: { name: string; x: number; y: number; hq?: boolean; slug?: string }[] = [
  { name: "Bidar", x: 75, y: 16, slug: "bidar" },
  { name: "Bijapur (Vijayapura)", x: 37, y: 37, slug: "bijapur-vijayapura" },
  { name: "Hubli–Dharwad", x: 25, y: 68, slug: "hubli-dharwad" },
  { name: "Gokarna", x: 9, y: 84, slug: "gokarna" },
  { name: "Hampi", x: 53, y: 68, slug: "hampi" },
  { name: "Chitradurga", x: 52, y: 90, slug: "chitradurga" },
  { name: "Chikmagalur", x: 39, y: 109, slug: "chikmagalur" },
  { name: "Mangalore", x: 21, y: 118, slug: "mangalore" },
  { name: "Madikeri / Coorg", x: 38, y: 128, slug: "madikeri-coorg" },
  { name: "Mysore", x: 55, y: 130, slug: "mysore" },
  { name: "Bangalore", x: 74, y: 117, hq: true },
];

/** Karnataka state outline, traced from the real boundary and simplified. */
const OUTLINE =
  "M77 4 L84 10 L82 19 L74 26 L73 43 L79 52 L69 60 L67 73 L64 76 L90 94 L99 111 " +
  "L92 122 L82 129 L79 141 L70 147 L52 148 L42 143 L34 134 L33 124 L19 124 L15 111 " +
  "L12 98 L3 80 L1 75 L2 63 L8 48 L13 36 L30 25 L44 22 L59 22 L65 16 L70 12 Z";

/** Faint graticule lines, drawn only inside the state. */
const GRID_X = [12, 26, 40, 54, 68, 82];
const GRID_Y = [16, 34, 52, 70, 88, 106, 124, 142];

function routePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 7;
  return `M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`;
}

export default function CoverageMap() {
  const [hover, setHover] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setLive(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const hq = PLACES.find((p) => p.hq)!;
  const links = PLACES.filter((p) => !p.hq);

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron-600">
            Coverage
          </p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            One operator, the whole state
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-bodytext">
            Tap a pin to start an enquiry for that route. We also run the interior
            towns and villages in between, and outstation trips into Tamil Nadu,
            Kerala, Andhra Pradesh and Telangana.
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-bodytext">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-saffron-500 ring-2 ring-saffron-500/20" />
              Bengaluru — our base
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-forest-600 dark:bg-forest-400" />
              Towns &amp; cities we serve
            </li>
          </ul>

          <p className="mt-4 text-sm">
            <Link
              href="/destination"
              className="font-semibold text-forest-700 hover:text-ink dark:text-forest-200"
            >
              Browse all destinations →
            </Link>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[20rem]">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full"
            role="img"
            aria-label="Coverage map of Karnataka linking the base in Bengaluru to the towns and cities served"
          >
            <defs>
              <clipPath id="ka-clip">
                <path d={OUTLINE} />
              </clipPath>
            </defs>

            {/* drop shadow */}
            <path
              d={OUTLINE}
              transform="translate(0 1.6)"
              className="fill-forest-900/10 dark:fill-black/40"
            />

            {/* state body */}
            <path
              d={OUTLINE}
              className="fill-forest-100 stroke-forest-300 dark:fill-white/[0.055] dark:stroke-white/15"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />

            {/* graticule, clipped to the state */}
            <g
              clipPath="url(#ka-clip)"
              className="stroke-forest-300/40 dark:stroke-white/[0.06]"
              strokeWidth="0.4"
            >
              {GRID_X.map((x) => (
                <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2={VB_H} />
              ))}
              {GRID_Y.map((y) => (
                <line key={`gy-${y}`} x1="0" y1={y} x2={VB_W} y2={y} />
              ))}
            </g>

            {/* broadcast + radar sweep from the base */}
            <g clipPath="url(#ka-clip)">
              {live && (
                <>
                  <circle
                    cx={hq.x}
                    cy={hq.y}
                    r="2"
                    fill="none"
                    className="stroke-forest-500/30 dark:stroke-forest-300/25"
                    strokeWidth="0.6"
                  >
                    <animate attributeName="r" values="2;72" dur="4.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0" dur="4.2s" repeatCount="indefinite" />
                  </circle>
                  <line
                    x1={hq.x}
                    y1={hq.y}
                    x2={hq.x}
                    y2={hq.y - 62}
                    className="stroke-forest-400/25 dark:stroke-forest-300/20"
                    strokeWidth="0.6"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${hq.x} ${hq.y}`}
                      to={`360 ${hq.x} ${hq.y}`}
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </line>
                </>
              )}
            </g>

            {/* routes: base → each city */}
            <g clipPath="url(#ka-clip)">
              {links.map((p, i) => {
                const d = routePath(hq, p);
                return (
                  <g key={`route-${p.name}`}>
                    <path
                      d={d}
                      fill="none"
                      className="stroke-forest-400/45 dark:stroke-white/15"
                      strokeWidth="0.5"
                      strokeDasharray="1.5 2"
                    >
                      {live && (
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;-7"
                          dur="1.1s"
                          repeatCount="indefinite"
                        />
                      )}
                    </path>
                    {live && (
                      <circle r="0.9" className="fill-saffron-500">
                        <animateMotion
                          dur="2.8s"
                          begin={`${-i * 0.35}s`}
                          repeatCount="indefinite"
                          keyPoints="0;1"
                          keyTimes="0;1"
                          calcMode="linear"
                          path={d}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </g>

            {/* signal pings at each city */}
            {live && (
              <g clipPath="url(#ka-clip)">
                {links.map((p, i) => (
                  <circle
                    key={`ping-${p.name}`}
                    cx={p.x}
                    cy={p.y}
                    r="1"
                    fill="none"
                    className="stroke-forest-500/50 dark:stroke-forest-300/40"
                    strokeWidth="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="1;5.5"
                      dur="2.6s"
                      begin={`${-i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.55;0"
                      dur="2.6s"
                      begin={`${-i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </g>
            )}
          </svg>

          {PLACES.map((p) => (
            <Link
              key={p.name}
              href={p.slug ? `/destination/${p.slug}` : "/destination"}
              onMouseEnter={() => setHover(p.name)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.name)}
              onBlur={() => setHover(null)}
              aria-label={`View cab and outstation guide for ${p.name}`}
              className="group absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${(p.x / VB_W) * 100}%`, top: `${(p.y / VB_H) * 100}%` }}
            >
              <MapPin
                className={`drop-shadow transition-transform group-hover:-translate-y-0.5 group-hover:scale-110 ${
                  p.hq
                    ? "h-5 w-5 fill-saffron-500 text-saffron-600"
                    : "h-4 w-4 fill-forest-600 text-forest-700 dark:fill-forest-400 dark:text-forest-300"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`pointer-events-none absolute left-1/2 top-full z-10 mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-forest-900 px-2 py-1 text-[11px] font-medium text-white transition-opacity ${
                  hover === p.name ? "opacity-100" : "opacity-0"
                }`}
              >
                {p.name}
              </span>
            </Link>
          ))}

          <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-bodytext/70">
            Karnataka · statewide network
          </p>
        </div>
      </div>
    </div>
  );
}
