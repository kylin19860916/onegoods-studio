import { NAME_MX } from '../src/name-clicker-mechanism.js';
import opentype from 'opentype.js';
import ClipperLib from 'clipper-lib';
import earcut from 'earcut';
import { strToU8, zipSync } from 'fflate';
import { MX_NAME_FACE, MX_RECESS } from '../src/cherry-mx-spec.js';

const units = 1000;
const core = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';
const { Clipper, ClipperOffset, PolyTree, PolyType, PolyFillType, ClipType, JoinType, EndType } = ClipperLib;

export function parseKeyringFont(bytes) {
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

function flatten(commands) {
  const contours = [];
  let ring = [];
  const point = (x, y) => [x, -y];
  for (const command of commands) {
    const { type, x, y, x1, y1, x2, y2 } = command;
    if (type === 'M') {
      ring = [point(x, y)];
    } else if (type === 'L') {
      ring.push(point(x, y));
    } else if (type === 'C' || type === 'Q') {
      const start = ring.at(-1);
      const end = point(x, y);
      const p1 = point(x1, y1);
      const p2 = type === 'C' ? point(x2, y2) : end;
      const length = Math.hypot(p1[0] - start[0], p1[1] - start[1])
        + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(end[0] - p2[0], end[1] - p2[1]);
      const segments = Math.max(4, Math.min(64, Math.ceil(length / 2)));
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const u = 1 - t;
        ring.push(start.map((v, axis) => type === 'C'
          ? u ** 3 * v + 3 * u ** 2 * t * p1[axis] + 3 * u * t ** 2 * p2[axis] + t ** 3 * end[axis]
          : u ** 2 * v + 2 * u * t * p1[axis] + t ** 2 * end[axis]));
      }
    } else if (type === 'Z' && ring.length > 2) {
      contours.push(ring);
      ring = [];
    }
  }
  return contours;
}

function polygons(subject, clip = [], operation = ClipType.ctUnion) {
  const engine = new Clipper();
  engine.StrictlySimple = true;
  engine.AddPaths(subject, PolyType.ptSubject, true);
  if (clip.length) engine.AddPaths(clip, PolyType.ptClip, true);
  const result = new PolyTree();
  engine.Execute(operation, result, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
  return ClipperLib.JS.PolyTreeToExPolygons(result).map(({ outer, holes }) => [outer, ...holes]);
}

function circle(x, y, radius) {
  return Array.from({ length: 64 }, (_, i) => {
    const a = 2 * Math.PI * i / 64;
    return { X: Math.round(x + radius * Math.cos(a)), Y: Math.round(y + radius * Math.sin(a)) };
  });
}

function roundedPlate(width, height, radius) {
  const corners = [[width - radius, radius], [width - radius, height - radius], [radius, height - radius], [radius, radius]];
  return corners.flatMap(([x, y], corner) => Array.from({ length: 17 }, (_, i) => {
    const angle = (corner - 1) * Math.PI / 2 + i * Math.PI / 32;
    return { X: Math.round((x + radius * Math.cos(angle)) * units), Y: Math.round((y + radius * Math.sin(angle)) * units) };
  }));
}

export function mechanicalKeyContours(font, text) {
  const rings = flatten(font.getPath(text, 0, 0, 100).commands);
  if (!rings.length) return [];
  const points = rings.flat();
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
  const a = Math.min(...xs), b = Math.max(...xs), c = Math.min(...ys), d = Math.max(...ys);
  const scale = 12 / Math.max(b - a, d - c);
  return rings.map(ring => ring.map(([x, y]) => [(x - (a + b) / 2) * scale, (y - (c + d) / 2) * scale]));
}

export function nameClickerContours(font, text) {
  const glyphs = text ? font.getPaths(text, 0, 0, 100, { kerning: true }).map(path => flatten(path.commands)) : [];
  const points = glyphs.flat(2);
  let letters = [];
  let switchXs = [0];
  function offsetPaths(paths, distance, end = EndType.etClosedPolygon) {
    if (!paths.length) return [];
    const offset = new ClipperOffset(2, 35);
    offset.AddPaths(paths, JoinType.jtRound, end);
    const result = [];
    offset.Execute(result, distance * units);
    return result;
  }
  if (points.length) {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min(88 / (maxX - minX), 21 / (maxY - minY));
    const centerX = (minX + maxX) / 2;
    const characters = [...text.normalize('NFC')];
    const visible = characters.flatMap((character, index) => /\s/u.test(character) ? [] : [index]);
    // Three Han characters share one rigid cap carried by three real switches.
    if (visible.length === 3 && visible.every(index => /\p{Script=Han}/u.test(characters[index]))) {
      const bounds = visible.map(index => {
        const xs = glyphs[index]?.flat().map(([x]) => x) ?? [];
        return characters.length === glyphs.length && xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : null;
      });
      const centers = bounds.every(x => x !== null) ? bounds.map(x => (x - centerX) * scale)
        : [-NAME_MX.switchPitch, 0, NAME_MX.switchPitch];
      const middle = centers[1];
      switchXs = [Math.min(centers[0], middle - NAME_MX.switchPitch), middle,
        Math.max(centers[2], middle + NAME_MX.switchPitch)];
    }
    const holeAreas = shapes => shapes.flatMap(([, ...holes]) => holes.map(hole => Math.abs(Clipper.Area(hole)))).sort((a, b) => a - b);
    letters = glyphs.flatMap(glyph => {
      const original = polygons(glyph.map(ring => ring.map(([x, y]) => ({
        X: Math.round((x - (minX + maxX) / 2) * scale * units),
        Y: Math.round((y - (minY + maxY) / 2) * scale * units),
      }))));
      const holes = holeAreas(original);
      // Dense glyphs need smaller offsets to keep their strokes and counters legible.
      for (const stroke of [0.53, 0.34, 0.18, 0.08]) {
        const bold = polygons(offsetPaths(original.flat(), stroke));
        const remaining = holeAreas(bold);
        if (bold.length === original.length && remaining.length === holes.length
            && remaining.every((area, i) => area >= 0.45 * holes[i])) return bold;
      }
      return original;
    });
    letters = polygons(letters.flat());
  }

  const letterOutlines = offsetPaths(letters.map(([outer]) => outer), 1.15);
  function connectedOutline(outlines) {
    const islands = polygons(outlines);
    const anchors = islands.map(([outer]) => outer.reduce((a, b) => Math.abs(b.Y) < Math.abs(a.Y) ? b : a));
    const connections = anchors.filter(point => point.Y !== 0).map(point => [point, { X: point.X, Y: 0 }]);
    const anchorXs = [0, ...anchors.map(point => point.X)];
    const left = Math.min(...anchorXs), right = Math.max(...anchorXs);
    if (left !== right) connections.push([{ X: left, Y: 0 }, { X: right, Y: 0 }]);
    const solid = polygons([...islands.map(([outer]) => outer), ...offsetPaths(connections, 1.1, EndType.etOpenRound)]);
    return polygons(offsetPaths(offsetPaths(solid.map(([outer]) => outer), 0.75), -0.75)).map(([outer]) => outer);
  }

  const glyphContour = connectedOutline(letterOutlines);
  const face = offsetPaths(glyphContour, MX_NAME_FACE.faceMargin);
  const shell = offsetPaths(glyphContour, MX_NAME_FACE.shellMargin);
  function squareAt(width, x, y) {
    const h = Math.round(width * units / 2);
    const cx = Math.round(x * units), cy = Math.round(y * units);
    return [{ X: cx - h, Y: cy - h }, { X: cx + h, Y: cy - h },
      { X: cx + h, Y: cy + h }, { X: cx - h, Y: cy + h }];
  }
  const fits = (area, outline) => polygons([area], outline, ClipType.ctDifference).length === 0;
  const offsets = [0, ...Array.from({ length: 24 }, (_, i) => [-(i + 1) / 4, (i + 1) / 4]).flat()];
  const seatEnvelope = Math.max(NAME_MX.exteriorX, NAME_MX.exteriorY) + 1.6;
  const wallEnvelope = NAME_MX.capPocket + 2 * NAME_MX.capWall;
  const fittedMounts = switchXs.map(x => ({
    x, y: offsets.find(y => fits(squareAt(seatEnvelope, x, y), shell)
      && fits(squareAt(wallEnvelope, x, y), face)),
  }));
  const mountingPads = fittedMounts.filter(({ y }) => y === undefined).map(({ x }) =>
    roundedPlate(20.8, 20.8, 4)
      .map(({ X, Y }) => ({ X: X - 10400 + Math.round(x * units), Y: Y - 10400 })));
  const mounts = fittedMounts.map(({ x, y }) => ({ x, y: y ?? 0 }));
  const contour = mountingPads.length ? connectedOutline([...mountingPads, ...letterOutlines]) : glyphContour;
  const toMm = ring => ring.map(({ X, Y }) => /** @type {[number, number]} */ ([X / units, Y / units]));
  // Cut only enclosed pockets; the validated outer contour is shared by both outputs.
  const capFace = offsetPaths(contour, MX_NAME_FACE.faceMargin);
  const pockets = mounts.map(({ x, y }) => squareAt(NAME_MX.capPocket, x, y));
  const capBack = polygons(capFace, pockets, ClipType.ctDifference);
  if (mounts.some(({ x, y }) => !fits(squareAt(wallEnvelope, x, y), capFace))
      || capBack.length !== 1 || capBack[0].length !== 1 + mounts.length
      || Math.abs(Math.abs(Clipper.Area(capBack[0][0])) - Math.abs(Clipper.Area(polygons(capFace)[0][0]))) > units * units * 0.001) {
    throw new Error('字形無法保留完整上蓋外壁，請更換字型或調整文字。');
  }
  const halfDivider = NAME_MX.dividerWidth * units / 2;
  const dividerStrips = switchXs.slice(1).map((x, i) => {
    const center = (x + switchXs[i]) * units / 2;
    const left = Math.round(center - halfDivider), right = Math.round(center + halfDivider);
    return [{ X: left, Y: -30000 }, { X: right, Y: -30000 },
      { X: right, Y: 30000 }, { X: left, Y: 30000 }];
  });
  const dividers = polygons(dividerStrips, capFace, ClipType.ctIntersection);
  if (dividers.length !== dividerStrips.length) throw new Error('字形無法保留底座隔板，請調整文字。');
  function housingRing(outerMargin, innerMargin) {
    const interior = offsetPaths(contour, innerMargin);
    const clearance = polygons(interior).flat();
    return polygons(offsetPaths(contour, outerMargin), clearance, ClipType.ctDifference)
      .map(rings => rings.map(toMm));
  }
  return {
    capBack: capBack.map(rings => rings.map(toMm)),
    skirt: housingRing(MX_NAME_FACE.faceMargin, MX_NAME_FACE.innerSkirtMargin),
    rim: housingRing(MX_NAME_FACE.shellMargin, MX_NAME_FACE.faceMargin + MX_RECESS.sideClearance),
    lettering: letters.map(rings => rings.map(toMm)),
    dividers: dividers.map(rings => rings.map(toMm)),
    mounts,
    profile(margin) {
      const rings = polygons(offsetPaths(contour, margin));
      if (rings.length !== 1) throw new Error('Name clicker contour is disconnected');
      return toMm(rings[0][0]);
    },
  };
}

const motifShapes = new Set(['heart', 'star', 'flower']);

function motifPlate(shape, width, height) {
  const points = [];
  const count = shape === 'star' ? 10 : 120;
  for (let i = 0; i < count; i++) {
    const angle = i * 2 * Math.PI / count;
    if (shape === 'heart') {
      points.push([16 * Math.sin(angle) ** 3, 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)]);
    } else {
      const radius = shape === 'star' ? (i % 2 ? 0.56 : 1) : 0.83 + 0.17 * Math.cos(5 * angle);
      points.push([radius * Math.sin(angle), radius * Math.cos(angle)]);
    }
  }

  // Leave a smaller name band so the motif remains distinct from the base silhouette.
  const emblemWidth = height * 0.9;
  const bandInset = emblemWidth * 0.51;
  const bandHeight = height * 0.64;
  const bounds = [0, 1].map(axis => {
    const values = points.map(point => point[axis]);
    return [Math.min(...values), Math.max(...values)];
  });
  const emblem = points.map(([x, y]) => ({
    X: Math.round((width - emblemWidth + (x - bounds[0][0]) / (bounds[0][1] - bounds[0][0]) * emblemWidth) * units),
    Y: Math.round((y - bounds[1][0]) / (bounds[1][1] - bounds[1][0]) * height * units),
  }));
  if (!Clipper.Orientation(emblem)) emblem.reverse();
  const band = roundedPlate(width - bandInset, bandHeight, bandHeight / 2).map(point => ({
    X: point.X,
    Y: point.Y + Math.round((height - bandHeight) / 2 * units),
  }));
  return {
    paths: polygons([emblem, band]).flat(),
    holeX: Math.round(5.8 * units),
    holeY: Math.round(height / 2 * units),
    textRight: emblemWidth * 0.86,
    textHeight: bandHeight - 4,
  };
}

function pathData(polys) {
  return polys.flatMap(poly => poly.map(ring =>
    ring.map(({ X, Y }, i) => `${i ? 'L' : 'M'}${X / units} ${-Y / units}`).join(' ') + 'Z'
  )).join(' ');
}

function extrude(polys, bottom, top) {
  const vertices = [];
  const triangles = [];
  for (const rings of polys) {
    const points = rings.flat();
    const holes = rings.slice(1).map((_, i) => rings.slice(0, i + 1).reduce((sum, r) => sum + r.length, 0));
    const caps = earcut(points.flatMap(({ X, Y }) => [X, Y]), holes);
    const start = vertices.length;
    const n = points.length;
    vertices.push(...points.map(({ X, Y }) => [X / units, Y / units, bottom]));
    vertices.push(...points.map(({ X, Y }) => [X / units, Y / units, top]));
    for (let i = 0; i < caps.length; i += 3) {
      const [a, b, c] = caps.slice(i, i + 3);
      triangles.push([start + c, start + b, start + a], [start + n + a, start + n + b, start + n + c]);
    }
    let offset = 0;
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const a = start + offset + i;
        const b = start + offset + (i + 1) % ring.length;
        triangles.push([a, b, b + n], [a, b + n, a + n]);
      }
      offset += ring.length;
    }
  }
  return { vertices, triangles };
}

class DisconnectedBaseError extends Error {}

export const articulatedNameLimit = 8;

export function articulatedNameCharacters(name) {
  return [...name.normalize('NFC').replace(/ +/g, '')];
}

function articulatedGlyph(font, character) {
  const outline = flatten(font.getPath(character, 0, 0, 100).commands);
  const points = outline.flat();
  if (!points.length) throw new Error('找不到可列印的字形。');
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
  const left = Math.min(...xs), right = Math.max(...xs);
  const bottom = Math.min(...ys), top = Math.max(...ys);
  const scale = 14 / Math.max(top - bottom, (right - left) * 0.8);
  const face = polygons(outline.map(ring => ring.map(([x, y]) => ({
    X: Math.round((x - left) * scale * units),
    Y: Math.round((y - (bottom + top) / 2) * scale * units),
  }))));
  const offset = new ClipperOffset(2, 7);
  offset.AddPaths(face.flat(), JoinType.jtRound, EndType.etClosedPolygon);
  const bold = [];
  offset.Execute(bold, 0.65 * units);
  const glyph = polygons(bold);
  const bounds = glyph.flat(2);
  const minX = Math.min(...bounds.map(point => point.X));
  const maxX = Math.max(...bounds.map(point => point.X));
  const minY = Math.min(...bounds.map(point => point.Y));
  const maxY = Math.max(...bounds.map(point => point.Y));
  const width = (maxX - minX) / units;
  const rings = glyph.map(poly => poly.map(ring => ring.map(({ X, Y }) => ({ X: X - minX, Y }))));
  // Find where the fixed-height connector meets the glyph instead of spanning a square tile.
  const centreline = rings.flat().flatMap(ring => ring.flatMap((a, index) => {
    const b = ring[(index + 1) % ring.length];
    return (a.Y > 0) !== (b.Y > 0) ? [(a.X + (b.X - a.X) * -a.Y / (b.Y - a.Y)) / units] : [];
  }));
  return {
    rings, width,
    jointLeft: centreline.length ? Math.min(...centreline) : width / 2,
    jointRight: centreline.length ? Math.max(...centreline) : width / 2,
  };
}

function buildArticulatedKeyring(font, name, { holeMm, baseColor, textColor, accentColor }) {
  const glyphs = articulatedNameCharacters(name).map(character => articulatedGlyph(font, character));
  const gap = 2.5;
  const thickness = 10;
  const eyeRadius = holeMm / 2 + 1.15;
  const meshes = [], bases = [], faces = [];
  const bounds = [];

  function addPart(rings, lower, upper, color, label, x) {
    const mesh = extrude(rings, lower, upper);
    for (const vertex of mesh.vertices) vertex[0] += x;
    meshes.push({ ...mesh, color, name: label });
  }

  function placed(polys, x) {
    return polys.map(poly => poly.map(ring => ring.map(({ X, Y }) => ({ X: Math.round(X + x * units), Y }))));
  }

  function stem(from, to, radius) {
    const left = Math.min(from, to) * units, right = Math.max(from, to) * units;
    const y = radius * units;
    return [{ X: left, Y: -y }, { X: right, Y: -y }, { X: right, Y: y }, { X: left, Y: y }];
  }

  function radialProfile(x, inner, outer, angle) {
    return [inner, outer].map(radius => ({
      X: Math.round((x + radius * Math.cos(angle)) * units),
      Y: Math.round(radius * Math.sin(angle) * units),
    }));
  }

  // The socket faces the incoming peg. Its slotted rim is visible between letters.
  function socket(x) {
    const profile = Array.from({ length: 45 }, (_, index) =>
      radialProfile(x, 1.37, 2.18, (-146 + 292 * index / 44) * Math.PI / 180));
    return polygons([[...profile.map(p => p[1]), ...profile.reverse().map(p => p[0])]]);
  }

  const eyeX = eyeRadius;
  const firstX = 2 * eyeRadius - 0.6;
  const eye = polygons([
    circle(eyeX * units, 0, eyeRadius * units), stem(eyeX, firstX + glyphs[0].jointLeft + 0.7, 1.15),
  ], [circle(eyeX * units, 0, holeMm * units / 2)], ClipType.ctDifference);
  addPart(eye, 3.45, 6.55, baseColor, 'Integrated keyring eye', 0);
  bases.push(...eye);
  let x = firstX;
  for (const [index, glyph] of glyphs.entries()) {
    const glyphRings = glyph.rings;
    const glyphFace = placed(glyphRings, x);
    bases.push(...glyphFace);
    faces.push(...glyphFace);
    bounds.push(...glyphFace.flat(2));
    const lower = accentColor ? 0.85 : 0;
    if (accentColor) addPart(glyphRings, 0, lower, accentColor, 'Lower letter colour', x);
    addPart(glyphRings, lower, thickness - 1.25, baseColor, 'Solid letter ' + (index + 1), x);
    addPart(glyphRings, thickness - 1.25, thickness, textColor, 'Letter face ' + (index + 1), x);

    if (index < glyphs.length - 1) {
      const pegX = glyph.width + gap / 2;
      const peg = polygons([
        stem(glyph.jointRight - 0.55, pegX, 0.86), circle(pegX * units, 0, 1.13 * units),
      ]);
      addPart(peg, 4.05, 5.95, baseColor, 'Snap peg ' + (index + 1), x);
      bases.push(...placed(peg, x));
      addPart(socket(pegX), 3.35, 6.65, baseColor, 'Open socket ' + (index + 1), x);
    }
    if (index > 0) {
      const incoming = -gap / 2;
      const bridge = polygons([stem(incoming + 1.65, glyph.jointLeft + 0.7, 0.86)]);
      addPart(bridge, 3.35, 6.65, baseColor, 'Socket support ' + index, x);
      bases.push(...placed(bridge, x));
    }
    x += glyph.width + gap;
  }
  const right = x - gap;
  const bottom = Math.min(-eyeRadius, ...bounds.map(point => point.Y / units));
  const top = Math.max(eyeRadius, ...bounds.map(point => point.Y / units));
  return {
    meshes,
    preview: { base: pathData(polygons(bases.flat())), lettering: pathData(faces),
      viewBox: [-2, -top - 2, right + 4, top - bottom + 4] },
    dimensions: [right, top - bottom, thickness],
  };
}

export function generateKeyring(font, name, spec) {
  for (const extraRim of [0, 0.3, 0.6]) {
    try {
      return buildKeyring(font, name, { ...spec, rimMm: spec.rimMm + extraRim }, spec.rimMm);
    } catch (error) {
      if (!(error instanceof DisconnectedBaseError) || extraRim === 0.6) throw error;
    }
  }
}

function buildKeyring(font, name, spec, eyeletRimMm) {
  const text = name.trim().normalize('NFC');
  if (!text || [...text].length > 20 || /[\p{C}\u2028\u2029]/u.test(text)) throw new Error('請輸入 1–20 個可印文字。');
  for (const character of text) {
    if (character !== ' ' && !font.charToGlyphIndex(character)) throw new Error('有字元不在此款支援的字型中。');
  }
  if (spec.shape === 'articulated') return buildArticulatedKeyring(font, text, spec);
  const outlines = flatten(font.getPath(text, 0, 0, 100, { kerning: true }).commands);
  const points = outlines.flat();
  if (!points.length) throw new Error('找不到可列印的字形。');
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const { widthMm, heightMm, baseMm, letteringMm, holeMm, rimMm, baseColor, textColor, accentColor, shape = 'contour' } = spec;
  const isContour = shape === 'contour';
  const motif = motifShapes.has(shape) ? motifPlate(shape, widthMm, heightMm) : null;
  const outerRadius = holeMm / 2 + eyeletRimMm;
  const ringExtension = 2 * outerRadius - eyeletRimMm;
  const textLeft = 12;
  const plateTextWidth = motif ? widthMm - textLeft - motif.textRight : widthMm - 20;
  const availableWidth = isContour ? widthMm - ringExtension - 2 * rimMm : plateTextWidth;
  const availableHeight = isContour ? heightMm - 2 * outerRadius - 2 * rimMm : (motif?.textHeight ?? heightMm - 7);
  const scale = Math.min(availableWidth / (maxX - minX), availableHeight / (maxY - minY));
  if (!(scale > 0)) throw new Error('此尺寸無法容納掛孔和文字。');
  const textX = isContour ? 0 : textLeft + (availableWidth - (maxX - minX) * scale) / 2;
  const textY = isContour ? 0 : (heightMm - (maxY - minY) * scale) / 2;
  const lettering = polygons(outlines.map(ring => ring.map(([x, y]) => ({
    X: Math.round(((x - minX) * scale + textX) * units),
    Y: Math.round(((y - minY) * scale + textY) * units),
  }))));

  let basePaths, holeX, holeY;
  if (isContour) {
    const offset = new ClipperOffset(2, 7);
    offset.AddPaths(lettering.flat(), JoinType.jtRound, EndType.etClosedPolygon);
    const pad = [];
    offset.Execute(pad, rimMm * units);
    if (!pad.length) throw new Error('無法建立底板。');
    const points = pad.flat();
    const left = Math.min(...points.map(point => point.X));
    const bottom = Math.min(...points.map(point => point.Y));
    const top = Math.max(...points.map(point => point.Y));
    holeX = left - Math.round(holeMm / 2 * units);
    holeY = Math.round((bottom + top) / 2);

    // Attach at the leftmost intersection with the midline. A rounded neck
    // keeps the eyelet joined even when the outline recedes at that height.
    const crossings = pad.flatMap(path => path.flatMap((point, index) => {
      const next = path[(index + 1) % path.length];
      if ((point.Y > holeY) === (next.Y > holeY)) return [];
      return [point.X + (next.X - point.X) * (holeY - point.Y) / (next.Y - point.Y)];
    }));
    const attachment = crossings.length
      ? { X: Math.round(Math.min(...crossings)), Y: holeY }
      : points.reduce((closest, point) => {
        const distance = Math.abs(point.Y - holeY);
        const bestDistance = Math.abs(closest.Y - holeY);
        return distance < bestDistance || (distance === bestDistance && point.X < closest.X) ? point : closest;
      });
    const neck = [];
    const join = new ClipperOffset(2, 7);
    const neckStart = left - Math.round(eyeletRimMm * units / 2);
    join.AddPath([{ X: neckStart, Y: holeY }, attachment], JoinType.jtRound, EndType.etOpenRound);
    join.Execute(neck, eyeletRimMm * units);
    basePaths = polygons([...pad, ...neck, circle(holeX, holeY, outerRadius * units)]).flat();
  } else {
    basePaths = motif?.paths ?? [roundedPlate(widthMm, heightMm, shape === 'capsule' ? heightMm / 2 : 4)];
    holeX = motif?.holeX ?? 5.8 * units;
    holeY = motif?.holeY ?? heightMm / 2 * units;
    if (polygons(lettering.flat(), basePaths, ClipType.ctDifference).length) {
      throw new Error('文字超出底板，請縮短姓名。');
    }
  }

  if (motif && polygons([circle(holeX, holeY, (holeMm / 2 + 1.5) * units)], basePaths, ClipType.ctDifference).length) {
    throw new Error('掛孔與底板邊緣距離不足。');
  }
  const drilled = polygons(basePaths, [circle(holeX, holeY, holeMm / 2 * units)], ClipType.ctDifference);
  if (drilled.length !== 1) throw new DisconnectedBaseError('字形之間未連成完整底板，請縮短姓名或換款式。');
  const stripeHeight = accentColor ? Math.min(0.8, baseMm / 2) : 0;
  const meshes = [
    { ...extrude(drilled, stripeHeight, baseMm), color: baseColor, name: 'Base' },
    { ...extrude(lettering, baseMm, baseMm + letteringMm), color: textColor, name: 'Raised lettering' },
  ];
  if (stripeHeight) meshes.push({ ...extrude(drilled, 0, stripeHeight), color: accentColor, name: 'Base accent' });
  const bounds = drilled.flat(2);
  const left = Math.min(...bounds.map(p => p.X)) / units;
  const right = Math.max(...bounds.map(p => p.X)) / units;
  const low = Math.min(...bounds.map(p => p.Y)) / units;
  const high = Math.max(...bounds.map(p => p.Y)) / units;
  return {
    meshes,
    preview: { base: pathData(drilled), lettering: pathData(lettering), viewBox: [left - 2, -high - 2, right - left + 4, high - low + 4] },
    dimensions: [right - left, high - low, baseMm + letteringMm],
  };
}

/** @param {{meshes: Array<{name: string, color: string, vertices: number[][], triangles: number[][], filament?: number, subtype?: 'support_blocker'}>, assemblyName?: string, bambuProfile?: {filament_colour?: string[]} | null}} options */
export function writeKeyring3mf({ meshes, assemblyName = 'OGS Name Keyring', bambuProfile = null }) {
  let materialIndex = 0;
  const material = meshes.filter(mesh => !mesh.subtype).map(({ name, color }) => `<base name="${name}" displaycolor="${color.toUpperCase()}"/>`).join('');
  const objects = meshes.map(({ name, vertices, triangles, subtype }, index) =>
    `<object id="${index + 2}" name="${name}" type="model"${subtype ? '' : ` pid="1" pindex="${materialIndex++}"`}><mesh><vertices>`
    + vertices.map(([x, y, z]) => `<vertex x="${x}" y="${y}" z="${z}"/>`).join('')
    + '</vertices><triangles>'
    + triangles.map(([a, b, c]) => `<triangle v1="${a}" v2="${b}" v3="${c}"/>`).join('')
    + '</triangles></mesh></object>'
  ).join('');
  const assembly = meshes.length + 2;
  const components = meshes.map((_, index) => `<component objectid="${index + 2}"/>`).join('');
  const bambuNamespace = bambuProfile ? ' xmlns:BambuStudio="http://schemas.bambulab.com/package/2021"' : '';
  const metadata = bambuProfile ? '<metadata name="Application">BambuStudio-02.09.01.70</metadata><metadata name="BambuStudio:3mfVersion">1</metadata>' : '';
  const placement = bambuProfile ? ' transform="1 0 0 0 1 0 0 0 1 124 103 0" printable="1"' : '';
  const files = {
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>' + (bambuProfile ? '<Default Extension="config" ContentType="application/octet-stream"/>' : '') + '</Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'),
    '3D/3dmodel.model': strToU8(`<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="zh-TW" xmlns="${core}"${bambuNamespace}>${metadata}<resources><basematerials id="1">${material}</basematerials>${objects}<object id="${assembly}" type="model" name="${assemblyName}"><components>${components}</components></object></resources><build><item objectid="${assembly}"${placement}/></build></model>`),
  };
  if (bambuProfile) {
    const filamentCount = bambuProfile.filament_colour?.length ?? 3;
    const filamentMaps = Array(filamentCount).fill(1).join(' ');
    const filamentVolumeMaps = Array(filamentCount).fill(0).join(' ');
    const meta = (key, value) => `<metadata key="${key}" value="${value}"/>`;
    const parts = meshes.map(({ name, filament, subtype = 'normal_part' }, i) =>
      `<part id="${i + 2}" subtype="${subtype}">${meta('name', name)}${subtype === 'normal_part' ? meta('extruder', filament) : ''}</part>`
    ).join('');
    files['Metadata/model_settings.config'] = strToU8(
      `<config><object id="${assembly}">${meta('name', assemblyName)}${meta('extruder', 1)}${parts}</object>`
      + `<plate>${meta('plater_id', 1)}${meta('filament_map_mode', 'Auto For Flush')}${meta('filament_maps', filamentMaps)}${meta('filament_volume_maps', filamentVolumeMaps)}`
      + `<model_instance>${meta('object_id', assembly)}${meta('instance_id', 0)}${meta('identify_id', 1)}</model_instance></plate><assemble/></config>`
    );
    files['Metadata/project_settings.config'] = strToU8(JSON.stringify(bambuProfile));
  }
  return zipSync(files);
}
