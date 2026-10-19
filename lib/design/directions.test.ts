// Contraste AA de las tres direcciones visuales en los dos modos. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { contrastRatio } from "./contrast.ts";
import { DIRECTION_COLORS, DIRECTION_CONTRAST, DIRECTION_IDS } from "./directions.ts";

for (const id of DIRECTION_IDS) {
  for (const [mode, label] of [[0, "claro"], [1, "oscuro"]] as const) {
    test(`dirección ${id}, modo ${label}: cada par de texto y de datos cumple AA`, () => {
      const palette = DIRECTION_COLORS[id];
      const failures = DIRECTION_CONTRAST
        .map(({ fg, bg, min }) => ({ pair: `${fg}/${bg}`, ratio: contrastRatio(palette[fg][mode], palette[bg][mode]), min }))
        .filter(({ ratio, min }) => ratio < min)
        .map(({ pair, ratio, min }) => `${pair} ${ratio.toFixed(2)} < ${min}`);
      assert.deepEqual(failures, []);
    });
  }
}
