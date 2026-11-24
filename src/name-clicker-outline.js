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
  function shapes(parts) {
    return parts.map(([outer, ...holes]) => {
      const shape = draw(new Shape(), outer);
      shape.holes = holes.map(hole => draw(new Path(), hole));
      return shape;
    });
  }
  return {
    mounts: contours.mounts,
    dividers: shapes(contours.dividers),
    profile: margin => draw(new Shape(), contours.profile(margin)),
    lettering: shapes(contours.lettering),
    capBack: shapes(contours.capBack),
    skirt: shapes(contours.skirt),
    rim: shapes(contours.rim),
  };
}
