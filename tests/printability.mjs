import assert from "node:assert/strict";
import { checkPrintFeatures } from "../src/printability.js";
const rectangle = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];
assert.equal(checkPrintFeatures([[rectangle(0, 0, 10, 0.6)]]).thin, true);
assert.equal(checkPrintFeatures([[rectangle(0, 0, 10, 2)]]).thin, false);
assert.equal(
  checkPrintFeatures([[rectangle(0, 0, 4, 10)], [rectangle(4.3, 0, 4, 10)]])
    .narrow,
  true,
);
assert.equal(
  checkPrintFeatures([[rectangle(0, 0, 4, 10)], [rectangle(5, 0, 4, 10)]])
    .narrow,
  false,
);
console.log("Printability regression fixtures passed.");
