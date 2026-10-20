import { LANE_CURVES, type LaneKey, lanePath } from "./lanes";
import { PROPOSAL } from "../sample";

import { BONES, type Keypoints, sequence, SQUAT_PHASES } from "@/lib/design/pose";
import { getT } from "@/lib/i18n/server";

// Una repetición por ciclo; el contador da la vuelta completa en las diez. SMIL porque anima el atributo d
const BEAT_S = 2.4;
const REPS = PROPOSAL.repetitions.length;
const EASE = "0.45 0 0.55 1";
const GROUND = 132;
const BODY_X = 150;
const PERIOD = 120;

const frames = sequence(SQUAT_PHASES, 0, GROUND).map(({ keypoints }) => keypoints);
const deepest = frames[3];
const r = (n: number) => Math.round(n * 10) / 10;
const skeleton = (k: Keypoints) => BONES.map(([a, b]) => `M${r(k[a].x)} ${r(k[a].y)}L${r(k[b].x)} ${r(k[b].y)}`).join("");
const keyTimes = frames.map((_, i) => r(i / (frames.length - 1) * 1000) / 1000).join(";");
const keySplines = frames.slice(1).map(() => EASE).join(";");
const over = (pick: (k: Keypoints) => string | number) => frames.map(pick).join(";");

// El anillo rodea el cuerpo entre el tobillo y la cadera más atrasada, que es donde late
const RING = { cx: BODY_X + r(deepest.hip.x / 2), cy: GROUND - 52, r: 64 };

const LANES: { key: LaneKey; tone: string; baseline: number; amplitude: number }[] = [
  { key: "knee", tone: "stroke-hue-1", baseline: 176, amplitude: 22 },
  { key: "trunk", tone: "stroke-hue-2", baseline: 192, amplitude: 14 },
  { key: "center", tone: "stroke-hue-3", baseline: 208, amplitude: 12 },
];

function Lanes() {
  return LANES.map(({ key, tone, baseline, amplitude }) => (
    <path key={key} d={lanePath(LANE_CURVES[key], { period: PERIOD, amplitude, baseline, copies: 5 })} className={`${tone} fill-none`} strokeWidth="7" strokeLinecap="round" />
  ));
}

function Body({ keypoints }: { keypoints: Keypoints }) {
  return (
    <g className="rhythm-body" transform={`translate(${BODY_X} 0)`}>
      <path d={skeleton(keypoints)} />
      <circle cx={r(keypoints.head.x)} cy={r(keypoints.head.y)} r="5" />
    </g>
  );
}

/** Cada repetición es un pulso: el anillo late abajo de la sentadilla y el contador suma una. */
export async function RepBeat() {
  const t = await getT();
  const copy = t.styleGuide.directions.b;
  const beat = { dur: `${BEAT_S}s`, repeatCount: "indefinite" } as const;
  return (
    <figure className="rhythm-card grid content-between gap-4 rounded-[2rem] bg-panel p-5 ring-1 ring-line sm:p-7">
      <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{copy.animationTitle}</h2>
      <svg viewBox="0 0 360 220" className="w-full overflow-hidden rounded-[1.5rem] bg-sunken" aria-hidden>
        <g className="motion-live">
          <g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to={`${-PERIOD} 0`} {...beat} />
            <Lanes />
          </g>
          <circle {...RING} className="fill-none stroke-hue-1" strokeWidth="2" opacity="0">
            <animate attributeName="r" values={`${RING.r};${RING.r};${RING.r + 44};${RING.r + 44}`} keyTimes="0;0.5;0.85;1" {...beat} />
            <animate attributeName="opacity" values="0;0.7;0;0" keyTimes="0;0.5;0.85;1" {...beat} />
          </circle>
          <circle {...RING} className="fill-none stroke-accent" strokeWidth="4">
            <animate attributeName="r" values={`${RING.r};${RING.r - 6};${RING.r}`} keyTimes="0;0.5;1" calcMode="spline" keySplines={`${EASE};${EASE}`} {...beat} />
          </circle>
          <g className="rhythm-body" transform={`translate(${BODY_X} 0)`}>
            <path d={skeleton(frames[0])}>
              <animate attributeName="d" values={over(skeleton)} keyTimes={keyTimes} calcMode="spline" keySplines={keySplines} {...beat} />
            </path>
            <circle r="5" cx={r(frames[0].head.x)} cy={r(frames[0].head.y)}>
              <animate attributeName="cx" values={over((k) => r(k.head.x))} keyTimes={keyTimes} calcMode="spline" keySplines={keySplines} {...beat} />
              <animate attributeName="cy" values={over((k) => r(k.head.y))} keyTimes={keyTimes} calcMode="spline" keySplines={keySplines} {...beat} />
            </circle>
          </g>
          {Array.from({ length: REPS }, (_, i) => (
            <text key={i} x="300" y="98" textAnchor="middle" className="rhythm-count" opacity="0">
              <animate attributeName="opacity" values="0;1;0" keyTimes={`0;${i / REPS};${(i + 1) / REPS}`} calcMode="discrete" dur={`${BEAT_S * REPS}s`} repeatCount="indefinite" />
              {i + 1}
            </text>
          ))}
        </g>
        <g className="motion-still">
          <Lanes />
          <circle {...RING} className="fill-none stroke-accent" strokeWidth="4" />
          <Body keypoints={deepest} />
          <text x="300" y="98" textAnchor="middle" className="rhythm-count">{REPS}</text>
        </g>
      </svg>
      <figcaption className="text-sm text-ink-muted">{copy.animationCaption}</figcaption>
    </figure>
  );
}
