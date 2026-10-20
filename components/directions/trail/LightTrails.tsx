import { BONES, frameBounds, JUMP_PHASES, type Joint, type Keypoints, type Point, sequence, smoothPath } from "@/lib/design/pose";
import { getT } from "@/lib/i18n/server";

// Animo con SMIL y no con CSS porque el esqueleto interpola el atributo d, que Safari no anima desde CSS
const DURATION = "3.6s";
// El salto ocupa el 78 % del ciclo; el resto es la exposición quieta antes de apagarse
const JUMP_END = 0.78;
const EASE = "0.45 0 0.55 1";

const frames = sequence(JUMP_PHASES, 30, 0);
const box = frameBounds(frames.map((f) => f.keypoints), 12);
const last = frames.at(-1)!;
// La postura más alta del vuelo es la que queda marcada en la versión quieta
const apex = frames.reduce((best, f) => (f.center.y < best.center.y ? f : best));

const TRAILS: { joint: Joint; tone: "hue-1" | "hue-2" | "hue-3" }[] = [
  { joint: "head", tone: "hue-3" },
  { joint: "wrist", tone: "hue-2" },
  { joint: "knee", tone: "hue-1" },
  { joint: "toe", tone: "hue-1" },
];
const TONES = ["hue-1", "hue-2", "hue-3"] as const;

const r = (n: number) => Math.round(n * 10) / 10;
const skeleton = (k: Keypoints) => BONES.map(([a, b]) => `M${r(k[a].x)} ${r(k[a].y)}L${r(k[b].x)} ${r(k[b].y)}`).join("");

const times = frames.map((_, i) => r((i / (frames.length - 1)) * JUMP_END * 1000) / 1000);
const keyTimes = [...times, 1].join(";");
const keySplines = times.map(() => EASE).join(";");
const over = <T,>(pick: (f: (typeof frames)[number]) => T) => [...frames.map(pick), pick(last)].join(";");
const trailPath = (joint: Joint) => smoothPath(frames.map((f) => f.keypoints[joint]));
const centerPath = smoothPath(frames.map((f) => f.center));

function Trails() {
  return TRAILS.map(({ joint, tone }) => (
    <g key={joint} stroke={`url(#trail-${tone})`} fill="none" strokeLinecap="round">
      <path d={trailPath(joint)} strokeWidth="5" filter="url(#trail-blur)" className="trail-halo-svg" />
      <path d={trailPath(joint)} strokeWidth="1.8" />
    </g>
  ));
}

function Body({ keypoints, className }: { keypoints: Keypoints; className: string }) {
  return (
    <g className={className}>
      <path d={skeleton(keypoints)} />
      <circle cx={r(keypoints.head.x)} cy={r(keypoints.head.y)} r="4.5" />
    </g>
  );
}

function CenterDot({ at }: { at: Point }) {
  return <circle cx={r(at.x)} cy={r(at.y)} r="2.6" className="fill-ink stroke-panel" strokeWidth="1.2" />;
}

/** Larga exposición de un salto: las articulaciones dejan estelas de luz mientras el cuerpo avanza. */
export async function LightTrails() {
  const t = await getT();
  const copy = t.styleGuide.directions.a;
  const ghosts = frames.map((f, i) => ({ keypoints: f.keypoints, at: Math.max(times[i], 0.001) }));
  return (
    <figure className="trail-card grid content-between gap-4 rounded-[1.5rem] bg-panel p-5 ring-1 ring-line sm:p-7">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">{copy.animationTitle}</h2>
      <svg viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`} className="w-full" aria-hidden>
        <defs>
          {TONES.map((tone) => (
            <linearGradient key={tone} id={`trail-${tone}`} gradientUnits="userSpaceOnUse" x1={box.x} x2={box.x + box.width} y1="0" y2="0">
              <stop offset="0" style={{ stopColor: `var(--kin-${tone})`, stopOpacity: 0 }} />
              <stop offset="0.4" style={{ stopColor: `var(--kin-${tone})`, stopOpacity: 0.45 }} />
              <stop offset="1" style={{ stopColor: `var(--kin-${tone})`, stopOpacity: 1 }} />
            </linearGradient>
          ))}
          <filter id="trail-blur" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <line x1={box.x} x2={box.x + box.width} y1="0" y2="0" className="stroke-line" strokeWidth="1" />

        <g className="motion-live">
          <animate attributeName="opacity" dur={DURATION} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.04;0.93;1" />
          {ghosts.map(({ keypoints, at }, i) => (
            <g key={i} opacity="0">
              <animate attributeName="opacity" dur={DURATION} repeatCount="indefinite" values="0;0;0.14;0.14" keyTimes={`0;${at};${Math.min(at + 0.02, 0.99)};1`} />
              <Body keypoints={keypoints} className="trail-body" />
            </g>
          ))}
          <g>
            {TRAILS.map(({ joint, tone }) => (
              <g key={joint} stroke={`url(#trail-${tone})`} fill="none" strokeLinecap="round">
                {[5, 1.8].map((width) => (
                  <path key={width} d={trailPath(joint)} strokeWidth={width} pathLength={1} strokeDasharray="1" filter={width > 2 ? "url(#trail-blur)" : undefined} className={width > 2 ? "trail-halo-svg" : undefined}>
                    <animate attributeName="stroke-dashoffset" dur={DURATION} repeatCount="indefinite" values="1;0;0" keyTimes={`0;${JUMP_END};1`} />
                  </path>
                ))}
              </g>
            ))}
          </g>
          <path d={centerPath} pathLength={1} strokeDasharray="1" className="fill-none stroke-ink-muted" strokeWidth="0.8">
            <animate attributeName="stroke-dashoffset" dur={DURATION} repeatCount="indefinite" values="1;0;0" keyTimes={`0;${JUMP_END};1`} />
          </path>
          <g className="trail-body trail-body-live">
            <path d={skeleton(frames[0].keypoints)}>
              <animate attributeName="d" dur={DURATION} repeatCount="indefinite" calcMode="spline" values={over((f) => skeleton(f.keypoints))} keyTimes={keyTimes} keySplines={keySplines} />
            </path>
            <circle r="4.5" cx={r(frames[0].keypoints.head.x)} cy={r(frames[0].keypoints.head.y)}>
              <animate attributeName="cx" dur={DURATION} repeatCount="indefinite" calcMode="spline" values={over((f) => r(f.keypoints.head.x))} keyTimes={keyTimes} keySplines={keySplines} />
              <animate attributeName="cy" dur={DURATION} repeatCount="indefinite" calcMode="spline" values={over((f) => r(f.keypoints.head.y))} keyTimes={keyTimes} keySplines={keySplines} />
            </circle>
          </g>
          <circle r="2.6" cx={r(frames[0].center.x)} cy={r(frames[0].center.y)} className="fill-ink stroke-panel" strokeWidth="1.2">
            <animate attributeName="cx" dur={DURATION} repeatCount="indefinite" calcMode="spline" values={over((f) => r(f.center.x))} keyTimes={keyTimes} keySplines={keySplines} />
            <animate attributeName="cy" dur={DURATION} repeatCount="indefinite" calcMode="spline" values={over((f) => r(f.center.y))} keyTimes={keyTimes} keySplines={keySplines} />
          </circle>
        </g>

        <g className="motion-still">
          {frames.map((f, i) => <Body key={i} keypoints={f.keypoints} className="trail-body trail-ghost" />)}
          <Trails />
          <path d={centerPath} className="fill-none stroke-ink-muted" strokeWidth="0.8" />
          <Body keypoints={apex.keypoints} className="trail-body trail-body-live" />
          <CenterDot at={apex.center} />
        </g>
      </svg>
      <figcaption className="text-sm text-ink-muted">{copy.animationCaption}</figcaption>
    </figure>
  );
}
