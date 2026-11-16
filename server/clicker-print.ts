import createManifold, { type CrossSection, type Manifold, type ManifoldToplevel } from 'manifold-3d';
import wasm from 'manifold-3d/manifold.wasm?module';
import { mechanicalKeyContours, nameClickerContours, parseKeyringFont, writeKeyring3mf } from './keyring-geometry.mjs';
import { keyringFonts } from '../src/keyring-font-picker.js';
import { MX_BASE_DIVIDER, MX_CAP_SOCKET, MX_NAME_CAP_SOCKET, MX_CASE, MX_CHAIN_EYELET, MX_EYELET_BLEND, MX_NAME_FACE, MX_SWITCH_WELL, mxChainEyelet, mxEyeletBlendMesh, mxStack } from '../src/cherry-mx-spec.js';
import { HttpError } from './catalog';
import p2sTrialProfile from './clicker-p2s-profile.json';
import mechanicalBases from './mechanical-base-templates.json';
import filamentVectors from './mechanical-filament-vectors.json';

export type MechanicalDesign = {
  style: 'mechanical';
  text: string;
  base: string;
  keys: { text: string; font: FontKey; cap: string; ink: string }[];
};

type FontKey = keyof typeof keyringFonts;
export type ClickerDesign = {
  text: string;
  font: FontKey;
  colors: { border: string; fill: string; ink: string };
};

type ModuleOptions = {
  instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void): WebAssembly.Exports;
};
let kernel: Promise<ManifoldToplevel> | undefined;
function getKernel() {
  kernel ??= (createManifold as unknown as (options: ModuleOptions) => Promise<ManifoldToplevel>)({
    instantiateWasm(imports, receive) {
      const instance = new WebAssembly.Instance(wasm, imports);
      receive(instance, wasm);
      return instance.exports;
    },
  }).then(module => {
    module.setup();
    return module;
  }).catch(error => {
    kernel = undefined;
    throw error;
  });
  return kernel;
}

export async function generateClicker3mf(design: ClickerDesign, fontFile: Response) {
  if (!fontFile.ok) throw new Error('Clicker font asset is unavailable');
  const font = parseKeyringFont(new Uint8Array(await fontFile.arrayBuffer()));
  if ([...design.text].some(character => character !== ' ' && !font.charToGlyphIndex(character))) {
    throw new HttpError(400, '目前的字型缺少這些文字，請更換字型或調整文字。');
  }
  const contours = nameClickerContours(font, design.text);
  const { CrossSection: Section, Manifold: Solid, Mesh } = await getKernel();
  const allocated: Array<{ delete(): void }> = [];
  function own<T extends { delete(): void }>(value: T): T {
    allocated.push(value);
    return value;
  }
  function section(rings: [number, number][][]) {
    return own(own(new Section(rings as [number, number][][], 'EvenOdd')).simplify(0.012));
  }
  function slab(outline: CrossSection, bottom: number, top: number) {
    return own(own(outline.extrude(top - bottom)).translate([0, 0, bottom]));
  }
  function box(width: number, height: number) {
    return own(Section.square([width, height], true));
  }
  function roundedBox(width: number, height: number, radius: number) {
    return own(box(width - 2 * radius, height - 2 * radius).offset(radius, 'Round', 2, 40));
  }
  const cut = (a: CrossSection, b: CrossSection) => own(Section.difference(a, b));
  const join = (parts: Manifold[]) => own(Solid.union(parts));
  const stack = mxStack();
  try {
    const { shellMargin, innerWallMargin, faceMargin, insetMargin, insetHeight, letteringHeight } = MX_NAME_FACE;
    const shellPoints = contours.profile(shellMargin) as [number, number][];
    const shell = section([shellPoints]);
    const inner = section([contours.profile(insetMargin)]);
    const face = section([contours.profile(faceMargin)]);
    const glyphs = section(contours.lettering.flat());
    if (glyphs.isEmpty() || cut(glyphs, inner).area() > 0.05) {
      throw new HttpError(400, '字形超出可製作範圍，請縮短文字或換一種字型。');
    }
    const { outline: earOutline, holeX, rootLeft } = mxChainEyelet(shellPoints);
    const { holeDiameter, bottom: earBottom, thickness: earThickness } = MX_CHAIN_EYELET;
    const ear = own(new Section([earOutline]));
    const hole = own(own(Section.circle(holeDiameter / 2, 64)).translate([holeX, 0]));
    const underPlate = section([contours.profile(innerWallMargin)]);
    const dividerSpan = 2 * Math.max(...shellPoints.map(([, y]) => Math.abs(y)));
    const dividerStrips = contours.dividerXs.map((x: number) =>
      own(box(MX_BASE_DIVIDER.thickness, dividerSpan).translate([x, 0])));
    const { clearance, wall: wellWall } = MX_SWITCH_WELL;
    const atMount = (shape: CrossSection) => own(shape.translate([0, contours.mountY]));
    const wellVoid = atMount(box(clearance, clearance));
    const wellExterior = atMount(box(clearance + 2 * wellWall, clearance + 2 * wellWall));
    const wellFrame = own(Section.intersection(shell, cut(wellExterior, wellVoid)));
    const opening = atMount(roundedBox(MX_CASE.opening, MX_CASE.opening, 0.3));
    const dividers = dividerStrips.length ? cut(
      own(Section.intersection(underPlate, own(Section.union(dividerStrips)))),
      wellVoid,
    ) : null;
    const { leadInRadius, leadInTop } = MX_EYELET_BLEND;
    const arc = own(new Solid(new Mesh(mxEyeletBlendMesh(earOutline, rootLeft))));
    const entry = join([
      own(Solid.cylinder(leadInTop + 0.01, leadInRadius, leadInRadius, 64)),
      own(own(Solid.cylinder(earBottom - leadInTop, leadInRadius, holeDiameter / 2, 64))
        .translate([0, 0, leadInTop])),
    ]);
    const supportOpening = slab(wellVoid, MX_CASE.floor, stack.plateBottom);
    const blendedEar = own(Solid.difference([arc, own(entry.translate([holeX, 0, 0])), supportOpening]));
    const caseWithEar = join([
      slab(shell, 0, MX_CASE.floor),
      slab(cut(cut(shell, underPlate), wellVoid), MX_CASE.floor, stack.plateBottom),
      slab(wellFrame, MX_CASE.floor, stack.plateBottom),
      ...(dividers && !dividers.isEmpty() ? [slab(dividers, MX_CASE.floor, stack.plateBottom)] : []),
      slab(cut(shell, opening), stack.plateBottom, stack.mountTop),
      slab(section(contours.rim.flat()), stack.mountTop, stack.skirtBottom + 1.25),
      slab(ear, earBottom, earBottom + earThickness),
      blendedEar,
    ]);
    const base = own(Solid.difference(caseWithEar, slab(hole, 0, earBottom + earThickness + 0.1)));
    const { outerDiameter, crossSpan, crossArm, engagement } = MX_NAME_CAP_SOCKET;
    const socketStart = stack.stemTop - engagement;
    const boss = own(Section.circle(outerDiameter / 2, 64));
    const cross = own(Section.union(box(crossSpan, crossArm), box(crossArm, crossSpan)));
    const movingCap = join([
      slab(section(contours.skirt.flat()), stack.skirtBottom, stack.roofBottom),
      slab(face, stack.roofBottom, stack.capTop),
      slab(atMount(cut(boss, cross)), socketStart, stack.roofBottom),
    ]);
    const insetTop = stack.capTop + insetHeight;
    // Lay the case and the moving assembly separately on the print plate.
    const printOffset: [number, number, number] = [0, 39, -Math.min(socketStart, stack.skirtBottom)];
    // Grid support can spill across the opening on its first layers. Give
    // the socket a 5 mm exclusion radius without removing support elsewhere.
    const crossClearance = atMount(own(Section.circle(5, 64)));
    const crossSupportBlocker = own(slab(crossClearance, -printOffset[2], stack.roofBottom + 0.15).translate(printOffset));
    const parts: Array<{ name: string; filament: number; color: string; solid: Manifold; subtype?: 'support_blocker' }> = [
      { name: 'Case', filament: 1, color: design.colors.border, solid: base },
      { name: 'Moving cap', filament: 1, color: design.colors.border, solid: own(movingCap.translate(printOffset)) },
      { name: 'Inset', filament: 2, color: design.colors.fill, solid: own(slab(inner, stack.capTop, insetTop).translate(printOffset)) },
      { name: 'Raised lettering', filament: 3, color: design.colors.ink, solid: own(slab(glyphs, insetTop, insetTop + letteringHeight).translate(printOffset)) },
      {
        name: 'Exclude supports inside MX well 1',
        filament: 1,
        color: design.colors.border,
        subtype: 'support_blocker',
        solid: slab(atMount(box(clearance + 0.3, clearance + 0.3)), MX_CASE.floor - 0.15, stack.mountTop + 0.05),
      },
      {
        name: 'Exclude supports inside MX cap cross socket',
        filament: 1,
        color: design.colors.border,
        subtype: 'support_blocker',
        solid: crossSupportBlocker,
      },
    ];
    const meshes = parts.map(({ name, color, filament, solid, subtype }) => {
      if (solid.isEmpty() || solid.status() !== 'NoError') throw new HttpError(400, '無法生成完整的模型，請調整文字或字型。');
      const { numProp, vertProperties, triVerts } = solid.getMesh();
      const vertices = Array.from({ length: vertProperties.length / numProp }, (_, index) => [
        vertProperties[index * numProp], vertProperties[index * numProp + 1], vertProperties[index * numProp + 2],
      ].map(value => Number(value.toFixed(6))));
      const triangles = Array.from({ length: triVerts.length / 3 }, (_, index) => [
        triVerts[index * 3], triVerts[index * 3 + 1], triVerts[index * 3 + 2],
      ]);
      return { name, color, filament, vertices, triangles, subtype };
    });
    // The internal test uses the P2S/0.4 mm PLA profile from the validated sample.
    const filament_colour = [design.colors.border, design.colors.fill, design.colors.ink].map(color => color.toUpperCase());
    return writeKeyring3mf({ meshes, assemblyName: 'OGS Three-colour Clicker', bambuProfile: { ...p2sTrialProfile, filament_colour } });
  } finally {
    for (const part of allocated.reverse()) part.delete();
  }
}

export async function generateMechanical3mf(design: MechanicalDesign, readFont: (key: FontKey) => Promise<Response>) {
  const base = mechanicalBases[design.keys.length - 1];
  if (!base) throw new HttpError(400, '請選擇 1 至 6 鍵。');
  const fonts = new Map(await Promise.all([...new Set(design.keys.filter(key => key.text).map(key => key.font))].map(async key => {
    const response = await readFont(key);
    if (!response.ok) throw new Error('Clicker font asset is unavailable');
    return [key, parseKeyringFont(new Uint8Array(await response.arrayBuffer()))] as const;
  })));
  const colors = [...new Set([design.base, ...design.keys.flatMap(key => key.text ? [key.cap, key.ink] : [key.cap])])];
  const profile = {
    ...p2sTrialProfile,
    ...Object.fromEntries(Object.entries(filamentVectors).map(([key, values]) => [key, colors.flatMap(() => values)])),
    filament_colour: colors.map(color => color.toUpperCase()),
    flush_volumes_matrix: colors.flatMap((_, a) => colors.map((_, b) => a === b ? '0' : '280')),
    flush_volumes_vector: colors.flatMap(() => ['140', '140']),
    inherits_group: Array(colors.length + 2).fill(''),
    different_settings_to_system: Array(colors.length + 2).fill(''),
    enable_prime_tower: colors.length === 1 ? '0' : '1',
    wipe_tower_y: ['180'],
  };
  type PrintMesh = { name: string; color: string; filament: number; vertices: number[][]; triangles: number[][]; subtype?: 'support_blocker' };
  const parts: PrintMesh[] = [{ ...base, name: 'V3 Mechanical Base', color: design.base, filament: 1 }];
  const blockers: PrintMesh[] = [];
  const { CrossSection: Section, Manifold: Solid } = await getKernel();
  const allocated: Array<{ delete(): void }> = [];
  const own = <T extends { delete(): void }>(part: T) => { allocated.push(part); return part; };
  const box = (w: number, h: number) => own(Section.square([w, h], true));
  const rounded = (width: number, radius: number) => own(box(width - 2 * radius, width - 2 * radius).offset(radius, 'Round', 2, 40));
  const stack = mxStack();
  const skirtBottom = stack.skirtBottom - 1.65;
  const capHeight = stack.capTop - skirtBottom;
  const cavityHeight = stack.roofBottom - skirtBottom;
  const socketBottom = stack.stemTop - MX_CAP_SOCKET.engagement - skirtBottom;
  const { crossSpan, crossArm, outerDiameter } = MX_CAP_SOCKET;
  const capY = 39;
  function exportPart(name: string, color: string, solid: Manifold, subtype?: 'support_blocker') {
    if (solid.isEmpty() || solid.status() !== 'NoError') throw new HttpError(400, '無法生成完整的鍵帽。');
    const { numProp, vertProperties, triVerts } = solid.getMesh();
    const vertices = Array.from({length: vertProperties.length / numProp}, (_, i) =>
      Array.from(vertProperties.subarray(i*numProp, i*numProp + 3), v => Number(v.toFixed(6))));
    const triangles = Array.from({length: triVerts.length / 3}, (_, i) => Array.from(triVerts.subarray(3*i,3*i+3)));
    (subtype ? blockers : parts).push({ name, vertices, triangles, color, filament: colors.indexOf(color)+1, subtype });
  }
  try {
    const outer = own(rounded(19.2, 2).extrude(capHeight, 0, 0, [0.89, 0.89]));
    const inner = own(own(rounded(16.6, 1.4).extrude(cavityHeight + 0.05, 0, 0, [16.2 / 16.6, 16.2 / 16.6])).translate([0, 0, -0.05]));
    const skirt = own(Solid.difference(outer, inner));
    const cross = own(Section.union(box(crossSpan, crossArm), box(crossArm, crossSpan)));
    const boss = own(Section.difference(own(Section.circle(outerDiameter / 2, 64)), cross));
    const socket = own(own(boss.extrude(cavityHeight - socketBottom + 0.18)).translate([0, 0, socketBottom]));
    const cap = own(Solid.union(skirt, socket));
    const socketClearance = own(cross.offset(0.45, 'Round', 2, 32));
    for (const [index, key] of design.keys.entries()) {
      const x = (index - (design.keys.length - 1)/2) * 22;
      const number = index + 1;
      exportPart(`Keycap ${number}`, key.cap, own(cap.translate([x, capY, 0])));
      if (key.text) {
        const font = fonts.get(key.font)!;
        const rings = font.charToGlyphIndex(key.text) ? mechanicalKeyContours(font, key.text) : [];
        if (!rings.length) throw new HttpError(400, `第 ${number} 鍵的字型不支援這個文字。`);
        const glyph = own(new Section(rings as [number, number][][], 'EvenOdd'));
        const text = own(own(glyph.extrude(0.65)).translate([x, capY, capHeight]));
        exportPart(`Keycap ${number} lettering`, key.ink, text);
      }
      const well = own(own(Solid.cube([18.3, 18.3, 9.1], true)).translate([x, 0, 6.25]));
      exportPart(`Exclude supports inside MX well ${number}`, design.base, well, 'support_blocker');
      // Preserve the cross recess while allowing the bottom face of the hanging boss to be supported.
      const crossBlocker = own(own(Solid.union(
        own(socketClearance.extrude(cavityHeight + 0.1)),
        own(own(Solid.cylinder(cavityHeight - socketBottom + 1.3, 5, 5, 64))
          .translate([0, 0, socketBottom - 0.7])),
      )).translate([x, capY, 0]));
      exportPart(`Exclude supports inside MX socket ${number}`, key.cap, crossBlocker, 'support_blocker');
    }
    return writeKeyring3mf({ meshes: [...parts, ...blockers], assemblyName: 'OGS Mechanical Keyboard Clicker', bambuProfile: profile });
  } finally {
    for (const part of allocated.reverse()) part.delete();
  }
}
