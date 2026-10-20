// Shared Worker: un solo estado de la IA para todas las pestañas del mismo origen. No decide nada de
// tiempos (eso vive en lib/ai-status, tipado y probado): solo guarda el estado y reparte el turno de
// llamar a WakeUpAi con una comparación de versión, para que dos pestañas no despierten la IA a la vez.
let state = { status: "idle", at: 0, version: 0 };
const ports = new Set();

function publish() {
  for (const port of ports) port.postMessage({ type: "state", state });
}

function change(status) {
  state = { status, at: Date.now(), version: state.version + 1 };
  publish();
}

self.onconnect = (event) => {
  const port = event.ports[0];
  ports.add(port);
  port.onmessage = ({ data }) => {
    if (data.type === "claim" && data.version === state.version) {
      change("waking");
      port.postMessage({ type: "perform" });
    } else if (data.type === "result") {
      change(data.status);
    } else if (data.type === "bye") {
      ports.delete(port);
    } else {
      // Claim sobre una versión vieja: otra pestaña ganó; le devuelvo el estado actual
      port.postMessage({ type: "state", state });
    }
  };
  port.start();
  port.postMessage({ type: "state", state });
};
