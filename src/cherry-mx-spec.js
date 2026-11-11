// Nominal CHERRY MX reference dimensions, not an approved printable fit.
// Source: CHERRY MX Series drawing, page 2 (manufacturer sheet mirrored by Maltron)
// https://www.maltron.com/uploads/6/1/2/5/61250099/mx1a_11nn_data_sheet.pdf
// Current RED total travel: https://www.cherry.de/en-us/product/mx2a-red
export const MX = Object.freeze({ width: 15.6, bodyHeight: 11.6, lowerBody: 5, stem: 3.6, pins: 3.3, travel: 4 });
// Provisional case/keycap dimensions in mm; clearance needs physical trial printing.
export const MX_CASE = Object.freeze({ floor: 1.8, pinClearance: 0.7, plate: 1.5, opening: 14.2, wall: 1.8, capWidth: 18.4, roof: 1.4 });
export const MX_RECESS = Object.freeze({ sideClearance: 0.55, capRise: 0.8, earThickness: 3.2, earHoleDiameter: 5 });
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
