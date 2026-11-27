# OGS customizer renders

Run from the repository root with the existing Node dependencies, Blender with Cycles, and Pillow.

1. Run `node_modules/.bin/esbuild scripts/render-custom/export.mjs --bundle --platform=node --format=cjs --outfile=/tmp/ogs-custom-export.cjs`.
2. Run `node /tmp/ogs-custom-export.cjs /tmp/ogs-custom-meshes.json`.
3. Run `blender -b -P scripts/render-custom/render.py -- /tmp/ogs-custom-meshes.json /tmp/ogs-custom-render`.
4. Run `python3 scripts/render-custom/finish.py /tmp/ogs-custom-render public/assets/custom/render /tmp/ogs-custom-review`.

For a clean rerender, use a fresh output directory in step 3. The output directory also serves as a cache for long Cycles passes. The review folder contains the composited PNG masters and the two side-by-side proof sheets. The website serves the 1024 and 2048 pixel WebP files.

All renders preserve millimeters, share one camera distance and align to the same ground line. The largest of the three primary products determines the 64% frame occupancy. The remaining samples keep their true relative sizes.

For customizer tab artwork, pass `--tabs` in steps 2, 3, and 4, use a fresh render directory, and set the output in step 4 to `public/assets/custom/tabs`. This renders the localized labels with the same product geometry and crops the transparent artwork for the tab bar.
