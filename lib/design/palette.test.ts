// Contraste AA de la paleta del instrumento en los dos modos. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { contrastRatio } from "./contrast.ts";
import { COLORS, CONTRAST_REQUIREMENTS } from "./palette.ts";

test("la fórmula de contraste coincide con los valores de referencia de WCAG", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF").toFixed(2), "21.00");
  assert.equal(contrastRatio("#777777", "#FFFFFF").toFixed(2), "4.48");
});

for (const [mode, label] of [[0, "claro"], [1, "oscuro"]] as const) {
  test(`modo ${label}: cada par de texto, de datos y de interfaz cumple AA`, () => {
    const failures = CONTRAST_REQUIREMENTS
      .filter(({ modes }) => !modes || modes.includes(mode))
      .map(({ fg, bg, min }) => ({ pair: `${fg}/${bg}`, ratio: contrastRatio(COLORS[fg][mode], COLORS[bg][mode]), min }))
      .filter(({ ratio, min }) => ratio < min)
      .map(({ pair, ratio, min }) => `${pair} ${ratio.toFixed(2)} < ${min}`);
    assert.deepEqual(failures, []);
  });
}
