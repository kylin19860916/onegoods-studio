# Connected-name MX clicker / P2S standard

Updated 2026-11-23. The user accepted the supplied Mini Dumpling reference by physical printing, selected P2S as the standard printer, and subsequently required a continuous closed cap back with only a local switch pocket. Do not restore the older long hollow skirt with a seat-sized cut through its perimeter. Reference source SHA256: `9682b528c1f3e55b8c728e1e0ade95c96a272944fa1ced2342983aaa6f6ae133`. No external cosmetic mesh is copied or distributed.

`src/name-clicker-mechanism.js` is shared by preview and manufacturing. `server/keyring-geometry.mjs` supplies the same outlines and mount location to both. Dimensions below combine measured reference functions with the OGS closed-back revision; they are not a claim of universal MX hardware compatibility.

## Cap, seat and travel

- One central switch. Continuous cap back: 4.993 mm thick below a 1.4 mm roof, with a **local 15.4 × 15.4 mm recess**, at least 1 mm material between recess and outer contour. No notch may reach the exterior cap wall. Place the recess and socket together, searching Y in 0.25 mm increments up to ±6 mm. If the glyph cannot contain them, use the existing rounded mechanical minimum outline; never cut the outside wall to force a fit.
- Female-cross boss: OD 5.856 mm, cross span 4.199 mm, arms 1.554/1.562 mm, blind depth 4.993 mm. Root flare 6.88 mm, height 1 mm. Boss and cap start on the same print plane. No raised unsupported boss and no sacrificial ring under it. Keep socket support exclusion.
- Four vertical seat walls: opening 14.06 mm, exterior 18.844 × 18.814 mm, floor Z0.746, seat top Z10.517. Preserve the bounded latch relief at Z8.207–9.713, 16.065 × 16.117 mm; do not hollow the entire seat with an oversized hole.
- Base deck Z4.52, upper guide Z17.5. The shoulder is Z12.324, cap resting bottom Z16.524. At the nominal 4 mm stroke, the cap bottom is Z12.524, leaving 0.2 mm before the shoulder. Guide overlap is 0.976 mm at rest and 4.976 mm pressed. Side contour offset is nominally 0.55 mm. The cap perimeter remains continuous through all these levels.
- Reject solid overlap against the base at strokes 0/1/2/3/4 mm and against a simplified switch housing envelope. This envelope is a digital interference guard, not a scan or physical tolerance certification.
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

Review on `codex/ogs-mx-reference-p2s-1123`; Alpha/Mac mini validates and merges into the development mainline. No production deployment, payment or logistics changes are authorized here.

Latest development verification: 76 font/text outline pairs match, including the continuous-skirt regression. Eight actual exports have closed, watertight meshes and identical outer cap sections at Z0.2/1/2/3/4/4.8/5.3/6.2 mm. Minimum measured recess wall is 1.047 mm across these fixtures. Kuaile 林予曦 passed native P2S slice and reopen/re-slice with no plate warnings, no support paths inside the cross/well or under the eyelet, zero support centerlines outside the cap footprint, and a matching embedded G-code MD5. Browser desktop/mobile previews rendered without page errors. Two consecutive builds were byte-identical; generated page copy was unchanged apart from cache hashes.
