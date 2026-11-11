import { Path, Shape } from 'three';
import { nameClickerContours } from '../server/keyring-geometry.mjs';

function draw(path, points) {
  for (const [index, [x, y]] of points.entries()) {
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return path;
}

export function nameClickerOutline(font, text) {
  const contours = nameClickerContours(font, text);
  return {
    profile: margin => draw(new Shape(), contours.profile(margin)),
    lettering: contours.lettering.map(([outer, ...holes]) => {
      const shape = draw(new Shape(), outer);
      shape.holes = holes.map(hole => draw(new Path(), hole));
      return shape;
    }),
  };
}
