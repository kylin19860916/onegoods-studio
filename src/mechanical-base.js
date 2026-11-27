export const MECHANICAL_BASE = Object.freeze({
  pitch: 22,
  halfDepth: 12.4,
  grooveWidth: 7,
  grooveDepth: 1.2,
});

// Each polyline runs left to right on the positive-Y side, tangent to the rim
// at both ends. Reflect it for the other side of the same divider.
export function mechanicalBaseGrooves(keyCount) {
  const { pitch, halfDepth, grooveWidth, grooveDepth } = MECHANICAL_BASE;
  const segments = 20;
  return Array.from({ length: keyCount - 1 }, (_, index) => {
    const center = (index - (keyCount - 2) / 2) * pitch;
    return Array.from({ length: segments + 1 }, (_, step) => {
      const t = step / segments;
      return [
        center + (t - 0.5) * grooveWidth,
        halfDepth - grooveDepth * Math.sin(Math.PI * t) ** 2,
      ];
    });
  });
}
