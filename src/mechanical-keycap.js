// OGS geometry reconstructed from measured exterior dimensions.
// The inner profile is dimensioned for the OGS MX assembly.
export const MECHANICAL_KEYCAP = Object.freeze({
  width: 18.5,
  cornerRadius: 5,
  straightHeight: 2,
  sideSlope: 0.185,
  topRadius: 1.25,
  skirtDrop: 1.65,
});

/** @returns {{numProp: number, vertProperties: Float32Array, triVerts: Uint32Array}} */
export function mechanicalKeycapShell(height, cavityHeight) {
  const { width, cornerRadius, straightHeight, sideSlope, topRadius } = MECHANICAL_KEYCAP;
  const centerZ = height - topRadius;
  const centerX = width / 2 - (centerZ - straightHeight) * sideSlope - topRadius * Math.hypot(1, sideSlope);
  const startAngle = Math.atan(sideSlope);
  const joinX = centerX + topRadius * Math.cos(startAngle);
  const outside = [[0, width / 2, cornerRadius], [straightHeight, width / 2, cornerRadius]];
  for (let i = 0; i <= 14; i++) {
    const angle = startAngle + (Math.PI / 2 - startAngle) * i / 14;
    const half = centerX + topRadius * Math.cos(angle);
    outside.push([centerZ + topRadius * Math.sin(angle), half, cornerRadius - (joinX - half)]);
  }
  const inside = [[0, 16.5 / 2, 3.7], [cavityHeight, 15.3 / 2, 3.4]];
  const positions = [], faces = [];
  const perCorner = 12;
  const count = 4 * (perCorner + 1);

  function ring([z, half, radius]) {
    const center = half - radius;
    for (let corner = 0; corner < 4; corner++) {
      const a = corner * Math.PI / 2;
      const x = [center, -center, -center, center][corner];
      const y = [center, center, -center, -center][corner];
      for (let i = 0; i <= perCorner; i++) {
        const angle = a + Math.PI / 2 * i / perCorner;
        positions.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle), z);
      }
    }
  }
  for (const level of [...outside, ...inside]) ring(level);
  function link(lower, upper, reverse = false) {
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      const a = lower * count + i, b = lower * count + j;
      const c = upper * count + i, d = upper * count + j;
      if (reverse) faces.push(a, d, b, a, c, d);
      else faces.push(a, b, d, a, d, c);
    }
  }
  for (let i = 1; i < outside.length; i++) link(i - 1, i);
  link(outside.length, outside.length + 1, true);
  link(0, outside.length, true);

  function lid(level, inward) {
    const first = level * count;
    const center = positions.length / 3;
    positions.push(0, 0, positions[first * 3 + 2]);
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      if (inward) faces.push(center, first + j, first + i);
      else faces.push(center, first + i, first + j);
    }
  }
  lid(outside.length - 1, false);
  lid(outside.length + 1, true);
  return { numProp: 3, vertProperties: new Float32Array(positions), triVerts: new Uint32Array(faces) };
}
