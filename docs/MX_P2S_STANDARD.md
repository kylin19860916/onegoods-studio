# Connected-name MX clicker / P2S standard

Updated 2026-11-24 after the printed 林予曦 review. The user accepted the supplied Mini Dumpling reference by physical printing, selected P2S as the standard printer, and subsequently required a continuous closed cap back with only a local switch pocket. Do not restore the older long hollow skirt with a seat-sized cut through its perimeter. Reference source SHA256: `9682b528c1f3e55b8c728e1e0ade95c96a272944fa1ced2342983aaa6f6ae133`. No external cosmetic mesh is copied or distributed.

`src/name-clicker-mechanism.js` is shared by preview and manufacturing. `server/keyring-geometry.mjs` supplies the same outlines and mount locations to both. Dimensions below combine measured reference functions with the OGS closed-back revision; they are not a claim of universal MX hardware compatibility.

Fixed future-change requirements: [NAME_CLICKER_GENERATION_CONTRACT.md](NAME_CLICKER_GENERATION_CONTRACT.md). Preview and export consume the same validated `capBack` section. The shared contour builder rejects a pocket that opens or weakens the exterior, before rendering or exporting.

## Cap, seat and travel

- Exactly three Han characters share one rigid cap with three switches, one beneath each glyph, and two hidden 1.4 mm base dividers between the wells. Ignore whitespace for the count. Keep at least 21 mm between neighboring switch centers along X. Other supported names use the existing single central switch layout.
- The continuous cap back is 2.993 mm deep under a 1.4 mm roof. Each local recess is 15.4 × 15.4 mm with at least 1 mm to the outer contour. Find each recess and socket together, searching Y in 0.25 mm steps up to ±6 mm. Use a rounded mechanical minimum contour where required.
- Female-cross boss: OD 5.65 mm, cross span 4.199 mm, arms 1.554/1.562 mm and blind depth 2.993 mm. Root flare: OD 6.88 mm, height 1 mm. The opening and cap back start on the same print plane. Keep local socket support exclusions.
- Lower the seat and latch relief 2 mm so the assembled roof also sits 2 mm lower. Four vertical seat walls: opening 14.06 mm, exterior 18.844 × 18.814 mm, floor Z0.746, seat top Z8.517. The bounded latch relief is 16.065 × 16.117 mm at Z6.207–7.713. Add individual floor openings at the switch pin and locator positions to clear the lowered switch.
- Base deck Z4.52, upper guide Z17.5. The shoulder is Z12.324, cap resting bottom Z16.524. At the nominal 4 mm stroke, the cap bottom is Z12.524, leaving 0.2 mm before the shoulder. Guide overlap is 0.976 mm at rest and 4.976 mm pressed. Side contour offset is nominally 0.55 mm. The cap perimeter remains continuous through all these levels.
- Reject solid overlap against the base at strokes from 0 to 4 mm in 0.5 mm increments and against a simplified switch housing envelope. This envelope is a digital interference guard, not a scan or physical tolerance certification.
- Preserve personalized lettering and three colour layers. This does not change the website default font or impose proposed future customer character/length limits. 林予曦 in 站酷快樂 is a regression fixture.

## Eyelet and support

Keep the left-middle eyelet XY outline at Y=0, 5 mm hole, 8.6 mm width and 2.6 mm thickness. `mxPrintableEyelet` raises it according to reach; its C1-continuous piecewise-quadratic underside grows no more than 0.95 mm XY per 1 mm Z, ending tangent to the outer wall. Trim its root for the entire cap stroke. Do not return to a shallow unsupported V3 arc. Preview displays a simplified ear; manufacturing includes the full underside.

Use local blockers inside the cross socket, seat/latch relief and under the printable eyelet. Other genuine overhangs retain automatic support. Never disable all supports merely to hide exterior pads. Use snug support, no brim, zero raft expansion and zero support first-layer expansion. Verify actual extrusion paths after native slicing, not only settings flags.

Printer: **Bambu Lab P2S, 0.4 mm**. Preserve inherited P2S PLA/bed/machine G-code and filament vectors. Process: 0.16 mm layers, 3 walls, 15% Gyroid, normal automatic/snug support, 15°, plate-only, 0.16 mm top/bottom support gap, 2/2 interface layers, auto pattern/0.5 mm spacing, 0.35 mm XY gap. Do not copy H2C machine settings or extruder vectors. Independent mechanical-base templates are outside this connected-name revision.

## Verification and handoff

```
node tests/name-clicker-outline.mjs
node tests/name-clicker-print.mjs /tmp/ogs-mx-samples
node_modules/.bin/tsc --noEmit
python build.py
```

Compare preview/export outlines for every supported font. Generate real 3MFs for 濤/飛/Max/III/ONEGOODS/玩物工作室/林予曦, plus 站酷快樂 林予曦. Check closed outer sections, pocket clearance, watertight meshes, native P2S slice/reopen, actual socket/well/eyelet support paths and G-code checksums. Also inspect the browser preview. Digital verification does not claim a new physical print or guarantee fit, support removal or surface finish.

Review on `codex/ogs-three-switch-name-1124`; Alpha/Mac mini validates and merges into the development mainline. No production deployment, payment or logistics changes are authorized here.
