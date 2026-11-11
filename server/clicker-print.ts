import createManifold, { type CrossSection, type Manifold, type ManifoldToplevel } from 'manifold-3d';
import wasm from 'manifold-3d/manifold.wasm?module';
import { nameClickerContours, parseKeyringFont, writeKeyring3mf } from './keyring-geometry.mjs';
import { keyringFonts } from '../src/keyring-font-picker.js';
import { MX_BASE_DIVIDER, MX_CAP_SOCKET, MX_CASE, MX_RECESS, MX_SWITCH_WELL, mxStack } from '../src/cherry-mx-spec.js';
import { HttpError } from './catalog';
import p2sTrialProfile from './clicker-p2s-profile.json';

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

export async function generateClicker3mf(design: ClickerDesign, fontFile: Response, switchCenters: number[] = [0]) {
  if (!fontFile.ok) throw new Error('Clicker font asset is unavailable');
  const font = parseKeyringFont(new Uint8Array(await fontFile.arrayBuffer()));
  if ([...design.text].some(character => character !== ' ' && !font.charToGlyphIndex(character))) {
    throw new HttpError(400, '目前的字型缺少這些文字，請更換字型或調整文字。');
  }
  const contours = nameClickerContours(font, design.text, switchCenters);
  const { CrossSection: Section, Manifold: Solid } = await getKernel();
  const allocated: Array<{ delete(): void }> = [];
  function own<T extends { delete(): void }>(value: T): T {
    allocated.push(value);
    return value;
  }
  function section(rings: [number, number][][]) {
    return own(own(new Section(rings, 'EvenOdd')).simplify(0.012));
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
    const faceMargin = 1.75;
    const shellPoints = contours.profile(3.3) as [number, number][];
    const shell = section([shellPoints]);
    const inner = section([contours.profile(0.35)]);
    const face = section([contours.profile(faceMargin)]);
    const glyphs = section(contours.lettering.flat());
    if (glyphs.isEmpty() || cut(glyphs, inner).area() > 0.05) {
      throw new HttpError(400, '字形超出可製作範圍，請縮短文字或換一種字型。');
    }
    const [leftX, leftY] = shellPoints.reduce((left, point) => point[0] < left[0] ? point : left);
    const earX = leftX - 2.6;
    const ear = own(roundedBox(12, 13, 3.8).translate([earX, leftY]));
    const hole = own(own(Section.circle(MX_RECESS.earHoleDiameter / 2, 64)).translate([earX - 1.2, leftY]));
    const underPlate = section([contours.profile(1.6)]);
    const dividerSpan = 2 * Math.max(...shellPoints.map(([, y]) => Math.abs(y)));
    const dividerStrips = contours.dividerXs.map((x: number) =>
      own(box(MX_BASE_DIVIDER.thickness, dividerSpan).translate([x, 0])));
    const { clearance, wall: wellWall } = MX_SWITCH_WELL;
    const atSwitches = (outline: CrossSection) => own(Section.union(switchCenters.map(x => own(outline.translate([x, 0])))));
    const wellVoid = atSwitches(box(clearance, clearance));
    const wellExterior = atSwitches(box(clearance + 2 * wellWall, clearance + 2 * wellWall));
    const wellFrame = own(Section.intersection(shell, cut(wellExterior, wellVoid)));
    const openings = atSwitches(roundedBox(MX_CASE.opening, MX_CASE.opening, 0.3));
    const dividers = dividerStrips.length ? cut(
      own(Section.intersection(underPlate, own(Section.union(dividerStrips)))),
      wellVoid,
    ) : null;
    const caseWithEar = join([
      slab(shell, 0, MX_CASE.floor),
      slab(cut(cut(shell, underPlate), wellVoid), MX_CASE.floor, stack.plateBottom),
      slab(wellFrame, MX_CASE.floor, stack.plateBottom),
      ...(dividers && !dividers.isEmpty() ? [slab(dividers, MX_CASE.floor, stack.plateBottom)] : []),
      slab(cut(shell, openings), stack.plateBottom, stack.mountTop),
      slab(cut(shell, section([contours.profile(faceMargin + MX_RECESS.sideClearance)])), stack.mountTop, stack.skirtBottom + 1.25),
      slab(ear, 3.7, 3.7 + MX_RECESS.earThickness),
    ]);
    const base = own(Solid.difference(caseWithEar, slab(hole, 3.6, 3.8 + MX_RECESS.earThickness)));
    const { outerDiameter, crossSpan, crossArm, engagement } = MX_CAP_SOCKET;
    const socketStart = stack.stemTop - engagement;
    const boss = own(Section.circle(outerDiameter / 2, 64));
    const cross = own(Section.union(box(crossSpan, crossArm), box(crossArm, crossSpan)));
    const movingCap = join([
      slab(cut(face, section([contours.profile(0.25)])), stack.skirtBottom, stack.roofBottom),
      slab(face, stack.roofBottom, stack.capTop),
      slab(atSwitches(cut(boss, cross)), socketStart, stack.roofBottom),
    ]);
    const insetTop = stack.capTop + 0.5;
    // Lay the case and the moving assembly separately on the print plate.
    const printOffset: [number, number, number] = [0, 39, -Math.min(socketStart, stack.skirtBottom)];
    const parts: Array<{ name: string; filament: number; color: string; solid: Manifold; subtype?: 'support_blocker' }> = [
      { name: 'Case', filament: 1, color: design.colors.border, solid: base },
      { name: 'Moving cap', filament: 1, color: design.colors.border, solid: own(movingCap.translate(printOffset)) },
      { name: 'Inset', filament: 2, color: design.colors.fill, solid: own(slab(inner, stack.capTop, insetTop).translate(printOffset)) },
      { name: 'Raised lettering', filament: 3, color: design.colors.ink, solid: own(slab(glyphs, insetTop, insetTop + 1.35).translate(printOffset)) },
      ...switchCenters.map((x, index) => ({
        name: `Exclude supports inside MX well ${index + 1}`,
        filament: 1,
        color: design.colors.border,
        subtype: 'support_blocker' as const,
        solid: slab(own(box(clearance + 0.3, clearance + 0.3).translate([x, 0])),
          MX_CASE.floor - 0.15, stack.mountTop + 0.05),
      })),
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
