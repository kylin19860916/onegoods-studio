// Reference dimensions with connected-name adjustments from the 2026-11-24 print review.
// Source SHA256: 9682b528c1f3e55b8c728e1e0ade95c96a272944fa1ced2342983aaa6f6ae133
// Standard printer: Bambu Lab P2S / 0.4 mm. No external cosmetic mesh is reused.
export const NAME_MX = Object.freeze({
  floor: 0.746, deck: 4.52, mountTop: 10.517, rimTop: 19.5,
  opening: 14.06, exteriorX: 18.844, exteriorY: 18.814,
  latchX: 16.065, latchY: 16.117, latchBottom: 8.207, latchTop: 9.713,
  capDepth: 4.993, socketDepth: 4.993,
  bossDiameter: 5.65, crossSpan: 4.000, crossArmX: 1.554, crossArmY: 1.562,
  rootHeight: 1, rootDiameter: 6.88,
  capPocket: 15.4, capWall: 1, stopOverlap: 0.8, stopGap: 0.2,
  roof: 1.4, travel: 4, switchPitch: 21, dualSwitchCapLength: 60, dividerWidth: 1.4,
});
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
