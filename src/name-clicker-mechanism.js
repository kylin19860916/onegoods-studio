// Reference dimensions with connected-name adjustments from the 2026-11-24 print review.
// Source SHA256: 9682b528c1f3e55b8c728e1e0ade95c96a272944fa1ced2342983aaa6f6ae133
// Standard printer: Bambu Lab P2S / 0.4 mm. No external cosmetic mesh is reused.
export const NAME_MX = Object.freeze({
  floor: 0.746, deck: 4.52, mountTop: 8.517, rimTop: 17.5,
  opening: 14.06, exteriorX: 18.844, exteriorY: 18.814,
  latchX: 16.065, latchY: 16.117, latchBottom: 6.207, latchTop: 7.713,
  capDepth: 2.993, socketDepth: 2.993,
  bossDiameter: 5.65, crossSpan: 4.199, crossArmX: 1.554, crossArmY: 1.562,
  rootHeight: 1, rootDiameter: 6.88,
  capPocket: 15.4, capWall: 1, stopOverlap: 0.8, stopGap: 0.2,
  roof: 1.4, travel: 4, switchPitch: 21, dividerWidth: 1.4,
});
// Openings keep the lowered switch's pins above the underside of the case.
export const NAME_MX_PIN_RELIEF = Object.freeze([
  [0, 0, 2.1], [-3.8, -2.5, 0.9], [2.5, -5, 0.9], [-5.08, 0, 1.15], [5.08, 0, 1.15],
]);
export function nameMxStack() {
  const mountTop = NAME_MX.mountTop;
  const bodyBottom = mountTop - 5;
  const housingTop = bodyBottom + 11.6;
  const stemTop = housingTop + 3.6;
  const roofBottom = stemTop + 0.8;
  return { bodyBottom, mountTop, plateBottom: NAME_MX.latchTop, housingTop, stemTop,
    roofBottom, capTop: roofBottom + NAME_MX.roof, skirtBottom: roofBottom - NAME_MX.capDepth,
    rimTop: NAME_MX.rimTop, socketStart: roofBottom - NAME_MX.socketDepth };
}
