# Connected-name MX clicker / P2S standard

2026-11-23. The user physically accepted the supplied Mini Dumpling 3MF and explicitly selected its measured functional dimensions as the reference, with P2S as the standard printer. Do not ask the user to repeat that reference validation. Source SHA256: `9682b528c1f3e55b8c728e1e0ade95c96a272944fa1ced2342983aaa6f6ae133`. No external cosmetic mesh is distributed or copied here.

`src/name-clicker-mechanism.js` is the shared mechanical source for the connected-name preview and manufacturing export. Measurements include the reference's saved component/build scale. Values are rounded mesh measurements, not universal MX hardware tolerances.

- Continuous female-cross boss: OD 5.856 mm, span 4.199 mm, arms 1.554/1.562 mm, blind depth 4.993 mm. The root blends into the flat OGS roof. Cap internal depth is 12.577 mm. One central switch; preserve the personalized lettering and colour layers.
- Raised switch seat: mount Z10.517, well floor Z0.746, main opening 14.06 mm, exterior 18.844 × 18.814 mm. Continuous vertical walls with local latch clearance at Z8.207–9.713, bounded by 16.065 × 16.117 mm. Do not replace the closed seat with a full-height oversized cavity or eliminate the latch clearance. These are parametric functional dimensions; the OGS roof/case shapes remain independent.
- Surrounding reference-style deck Z4.52, upper rim Z13.123. Compute the cap assembly from switch height and 4 mm travel. Nominal pressed skirt/deck gap: 0.42 mm. Verify generated solids do not intersect through the stroke. The left-middle OGS eyelet retains its placement; its hidden root is trimmed to clear the cap stroke.
- Only a small removable hollow support ring under the boss: OD6.9/ID4.9 mm, nominal top gap0.16 mm. It is a labelled sacrificial print part, not product geometry; remove it before installing the switch. Do not fill the cap floor with solid support. Other genuinely overhanging areas retain automatic support.
- Block support in the cross and entire well (including latch relief). Check actual G-code, not only the enable-support field. A clear hole is insufficient if the boss starts in mid-air.

Printer: **Bambu Lab P2S, 0.4 mm**, inherited P2S PLA/bed/machine G-code and filament vectors preserved. Source process values: 0.16 mm layers, 3 walls, 15% Gyroid, normal automatic support/snug style, 15°, plate-only, 0.16 mm upper/lower support gap, 2/2 interface layers, auto pattern/0.5 mm spacing, 0.35 mm XY gap. Do not copy H2C machine settings, chamber flags or extruder vectors. This change applies the connected-name mechanism; existing independent/mechanical keycap source-template geometry is not silently redesigned.

## Verification / handoff

```
node tests/name-clicker-outline.mjs
node tests/name-clicker-print.mjs /tmp/ogs-mx-samples
node_modules/.bin/tsc --noEmit
.venv/bin/python build.py
```

The print test builds real 3MFs for 濤/飛/Max/III/ONEGOODS/玩物工作室. The generator rejects any full-press solid collision. Preview/export outlines are compared for all supported fonts. Native P2S slice, reopen/re-slice, socket and well support exclusion, closed mesh edges and embedded G-code checksum were checked on the exported 濤 artifact. Digital checks do not imply a new physical print occurred.

Use the development branch for review/merge. No production deployment or payment/logistics change is part of this work.

## Exterior support-pad correction (2026-11-23)

User requested no support extending outside the name cap. The old automatic first-layer pads extended up to 4.666 mm outside the cap footprint. Use snug normal supports, no brim/zero brim width, zero raft expansion and zero support first-layer expansion. All product mesh bytes are preserved. Native P2S re-slice showed no support extrusion centerlines outside the cap footprint, while local boss support and socket/well exclusion remain validated. Do not fix this by switching all supports off or by adding ineffective blockers outside surfaces that never generate overhang contacts.

## Raised, printable eyelet underside (2026-11-23)

Keep the approved eyelet XY outline, Y=0, 5 mm hole and 2.6 mm thickness. The V3 underside expanded roughly 8 mm over a 3.2 mm rise, requiring support contact under its shallow arc. For connected-name exports use `mxPrintableEyelet`: the eyelet is raised according to actual reach; its underside uses C1-continuous piecewise-quadratic easing with <=0.95 mm XY growth per 1 mm Z (>=46.5° from horizontal), ending tangent to the outer vertical wall. Y span also grows from the body instead of appearing in mid-air. The 濤 eyelet bottom rises from Z3.7 to about Z10.35; it remains above the bed and the upper plate stays below the case rim. A local support blocker prevents the 15° global support detector from adding support beneath the printable slope.

The cap assembly, cylindrical socket, removable ring, well and their exclusions are unchanged. Native P2S reopen/re-slice has zero support extrusion under this eyelet; cap/well exclusions and ring extrusion still pass. Slope changes reduce support-contact damage; no new physical surface test is claimed. Fixed mechanical-base template geometry is unchanged. The preview updates the flat ear's height; its simplified display still does not contain the full manufactured underside trim.
