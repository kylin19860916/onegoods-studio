// Nominal CHERRY MX reference dimensions, not an approved printable fit.
// Source: CHERRY MX Series drawing, page 2 (manufacturer sheet mirrored by Maltron)
// https://www.maltron.com/uploads/6/1/2/5/61250099/mx1a_11nn_data_sheet.pdf
// Current RED total travel: https://www.cherry.de/en-us/product/mx2a-red
export const MX = Object.freeze({ width: 15.6, bodyHeight: 11.6, lowerBody: 5, stem: 3.6, pins: 3.3, travel: 4 });
// Provisional case/keycap dimensions in mm; clearance needs physical trial printing.
export const MX_CASE = Object.freeze({ floor: 1.8, pinClearance: 0.7, plate: 1.5, opening: 14.2, wall: 1.8, capWidth: 18.4, roof: 1.4 });
export const MX_RECESS = Object.freeze({ sideClearance: 0.55, capRise: 0.8 });
// Continuous circular boss with a female cross, fused to the keycap roof.
export const MX_CAP_SOCKET = Object.freeze({ outerDiameter: 6, crossSpan: 4.2, crossArm: 1.5, engagement: 2.8 });
// Buried dividers bridge the case floor to the switch plate, leaving the switch clear.
export const MX_BASE_DIVIDER = Object.freeze({ thickness: 1.4 });
export const MX_SWITCH_WELL = Object.freeze({ clearance: MX.width + 1.6, wall: 1.4 });
export const MX_NAME_FACE = Object.freeze({
  shellMargin: 3.3, innerWallMargin: 1.6, faceMargin: 1.75,
  insetMargin: 0.35, innerSkirtMargin: 0.25, insetHeight: 0.5, letteringHeight: 1.35,
});
export const MX_CHAIN_EYELET = Object.freeze({ width: 8.6, thickness: 2.6, holeDiameter: 5, bottom: 3.7 });

export function mxChainEyelet(shell) {
  const radius = MX_CHAIN_EYELET.width / 2;
  const clearance = MX_CHAIN_EYELET.holeDiameter / 2 + 0.4;
  function leftAt(y) {
    let left = Infinity;
    for (const [index, [ax, ay]] of shell.entries()) {
      const [bx, by] = shell[(index + 1) % shell.length];
      if ((ay > y) !== (by > y)) {
        left = Math.min(left, ax + (bx - ax) * (y - ay) / (by - ay));
      }
    }
    return left;
  }

  const midX = leftAt(0);
  // Keep the whole circular hole outside the nearby shell, even on sloped letters.
  const bandX = Math.min(midX, leftAt(-clearance), leftAt(clearance),
    ...shell.filter(([, y]) => Math.abs(y) < clearance).map(([x]) => x));
  const holeX = bandX - clearance;
  const rootX = midX + 2.2;
  const outline = Array.from({ length: 33 }, (_, index) => {
    const angle = Math.PI / 2 + index * Math.PI / 32;
    return /** @type {[number, number]} */ ([holeX + radius * Math.cos(angle), radius * Math.sin(angle)]);
  });
  outline.push([rootX, -radius], [rootX, radius]);
  return { outline, holeX };
}
export function mxStack() {
  const bodyBottom = MX_CASE.floor + MX_CASE.pinClearance + MX.pins;
  const mountTop = bodyBottom + MX.lowerBody;
  const housingTop = bodyBottom + MX.bodyHeight;
  const stemTop = housingTop + MX.stem;
  const roofBottom = stemTop + 0.8;
  const capTop = roofBottom + MX_CASE.roof;
  return { bodyBottom, mountTop, plateBottom: mountTop - MX_CASE.plate, housingTop, stemTop,
    skirtBottom: housingTop + 0.4, roofBottom, capTop, rimTop: capTop - MX_RECESS.capRise };
}
