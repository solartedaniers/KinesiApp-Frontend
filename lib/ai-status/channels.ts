// Strategy del canal entre pestañas: Shared Worker donde existe y BroadcastChannel + Web Locks donde no
// (Chrome en Android no tiene Shared Worker). Las dos exponen lo mismo y la app no sabe cuál usa.
import { type AiStatus, type AiStatusState, type AiStatusTimings, type FromCoordinator, IDLE, isFresh, type ToCoordinator } from "./protocol.ts";

export interface AiStatusChannel {
  /** Estado actual, compartido entre pestañas. */
  current(): AiStatusState;
  onChange(listener: () => void): () => void;
  /** Pide despertar la IA; no hace nada si ya está activa o encendiéndose en esta u otra pestaña. */
  requestWake(): void;
}

type Perform = () => Promise<AiStatus>;

const WORKER_URL = "/workers/ai-status-worker.js";
const CHANNEL_NAME = "kin-ai-status";
const LOCK_NAME = "kin-ai-wake";

abstract class ObservableChannel {
  protected state: AiStatusState = IDLE;
  private readonly listeners = new Set<() => void>();

  current(): AiStatusState {
    return this.state;
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  protected adopt(state: AiStatusState): void {
    this.state = state;
    for (const listener of this.listeners) listener();
  }
}

/** El worker guarda el estado y concede el turno; esta pestaña hace la llamada si se lo dan. */
export class SharedWorkerChannel extends ObservableChannel implements AiStatusChannel {
  private wantsWake = false;
  private synced = false;

  constructor(
    private readonly port: MessagePort,
    private readonly perform: Perform,
    private readonly timings: AiStatusTimings,
  ) {
    super();
    port.onmessage = ({ data }: MessageEvent<FromCoordinator>) => {
      if (data.type === "perform") return void this.run();
      this.synced = true;
      this.adopt(data.state);
      if (this.wantsWake) this.claim();
    };
    port.start();
    addEventListener("pagehide", () => this.send({ type: "bye" }));
  }

  requestWake(): void {
    this.wantsWake = true;
    if (this.synced) this.claim();
  }

  private claim(): void {
    if (isFresh(this.state, this.timings, Date.now())) {
      this.wantsWake = false;
      return;
    }
    this.send({ type: "claim", version: this.state.version });
  }

  private async run(): Promise<void> {
    this.send({ type: "result", status: await this.perform() });
  }

  private send(message: ToCoordinator): void {
    this.port.postMessage(message);
  }
}

/** Respaldo: cada pestaña guarda su copia, la difunde por BroadcastChannel y un Web Lock elige quién llama. */
export class BroadcastAiStatusChannel extends ObservableChannel implements AiStatusChannel {
  private readonly channel = new BroadcastChannel(CHANNEL_NAME);

  constructor(
    private readonly perform: Perform,
    private readonly timings: AiStatusTimings,
  ) {
    super();
    this.channel.onmessage = ({ data }: MessageEvent<{ type: "state"; state: AiStatusState } | { type: "query" }>) => {
      if (data.type === "query") {
        if (this.state.status !== "idle") this.channel.postMessage({ type: "state", state: this.state });
      } else if (data.state.at > this.state.at) {
        this.adopt(data.state);
      }
    };
    // Una pestaña nueva pregunta a las demás cómo está la IA
    this.channel.postMessage({ type: "query" });
  }

  requestWake(): void {
    if (isFresh(this.state, this.timings, Date.now())) return;
    if (!("locks" in navigator)) return void this.run();
    void navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (lock) await this.run();
    });
  }

  private async run(): Promise<void> {
    if (isFresh(this.state, this.timings, Date.now())) return;
    this.change("waking");
    this.change(await this.perform());
  }

  private change(status: AiStatus): void {
    this.adopt({ status, at: Date.now(), version: this.state.version + 1 });
    this.channel.postMessage({ type: "state", state: this.state });
  }
}

/** Factory: elige el canal según lo que soporte el navegador. */
export function createAiStatusChannel(perform: Perform, timings: AiStatusTimings): AiStatusChannel {
  if (typeof SharedWorker !== "undefined") {
    try {
      return new SharedWorkerChannel(new SharedWorker(WORKER_URL, { name: CHANNEL_NAME }).port, perform, timings);
    } catch {
      // Algunos navegadores lo declaran pero lo bloquean (modo privado): sigo con el respaldo
    }
  }
  return new BroadcastAiStatusChannel(perform, timings);
}
