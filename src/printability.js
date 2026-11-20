import ClipperLib from "clipper-lib";

export const PRINT_LIMITS = Object.freeze({
  strokeMm: 0.8,
  gapMm: 0.6,
  minimumLetterHeightMm: 5,
  meaningfulAreaMm2: 0.08,
});
const {
  Clipper,
  ClipperOffset,
  JoinType,
  EndType,
  ClipType,
  PolyType,
  PolyFillType,
} = ClipperLib;
const SCALE = 1000;

function offset(paths, amount) {
  const operation = new ClipperOffset(2, 10);
  operation.AddPaths(paths, JoinType.jtRound, EndType.etClosedPolygon);
  const result = [];
  operation.Execute(result, amount * SCALE);
  return result;
}
function difference(subject, clip) {
  const operation = new Clipper();
  operation.AddPaths(subject, PolyType.ptSubject, true);
  operation.AddPaths(clip, PolyType.ptClip, true);
  const result = [];
  operation.Execute(
    ClipType.ctDifference,
    result,
    PolyFillType.pftNonZero,
    PolyFillType.pftNonZero,
  );
  return (
    Math.abs(result.reduce((area, path) => area + Clipper.Area(path), 0)) /
    SCALE ** 2
  );
}

// Morphological opening/closing identifies meaningful thin regions, not isolated tessellation tips.
// This is a geometric warning, not a physical-print certification.
export function checkPrintFeatures(polygons, scale = 1) {
  const paths = polygons.flatMap((rings) =>
    rings.map((ring) =>
      ring.map((point) => ({
        X: Math.round(
          (Array.isArray(point) ? point[0] : point.X / SCALE) * scale * SCALE,
        ),
        Y: Math.round(
          (Array.isArray(point) ? point[1] : point.Y / SCALE) * scale * SCALE,
        ),
      })),
    ),
  );
  if (!paths.length) return { thin: false, narrow: false };
  const areaMm2 =
    Math.abs(paths.reduce((total, path) => total + Clipper.Area(path), 0)) /
    SCALE ** 2;
  const tolerance = Math.max(PRINT_LIMITS.meaningfulAreaMm2, areaMm2 * 0.02);
  const opened = offset(
    offset(paths, -PRINT_LIMITS.strokeMm / 2),
    PRINT_LIMITS.strokeMm / 2,
  );
  const closed = offset(
    offset(paths, PRINT_LIMITS.gapMm / 2),
    -PRINT_LIMITS.gapMm / 2,
  );
  return {
    thin: difference(paths, opened) > tolerance,
    narrow: difference(closed, paths) > tolerance,
  };
}
export function printWarning(result, language = document.documentElement.lang) {
  if (!result.thin && !result.narrow) return "";
  return language === "en"
    ? "Some strokes or gaps may be too small. Choose a larger plate or use fewer characters."
    : language === "zh-Hans"
      ? "名字太长或字太细，建议换大一号底板或减少字数。"
      : "名字太長或字太細，建議換大一號底板或減少字數。";
}
