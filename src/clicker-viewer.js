import {
  AmbientLight, BoxGeometry, DirectionalLight, ExtrudeGeometry, Group,
  Mesh, MeshStandardMaterial, OrthographicCamera, Path, Raycaster, Scene,
  Shape, ShapePath, Vector2, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function rounded(width, height, radius, offsetX = 0) {
  const path = new Shape();
  const x = -width / 2 + offsetX, y = -height / 2;
  path.moveTo(x + radius, y);
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

function lettering(font, text) {
  if (!font || !text) return null;
  const path = new ShapePath();
  for (const command of font.getPath(text, 0, 0, 16).commands) {
    switch (command.type) {
      case 'M': path.moveTo(command.x, -command.y); break;
      case 'L': path.lineTo(command.x, -command.y); break;
      case 'Q': path.quadraticCurveTo(command.x1, -command.y1, command.x, -command.y); break;
      case 'C': path.bezierCurveTo(command.x1, -command.y1, command.x2, -command.y2, command.x, -command.y); break;
      case 'Z': path.currentPath.closePath(); break;
    }
  }
  const shapes = path.toShapes();
  if (!shapes.length) return null;
  const geometry = new ExtrudeGeometry(shapes, { depth: 0.65, bevelEnabled: false, curveSegments: 12 });
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const scale = Math.min(12 / (box.max.x - box.min.x), 12 / (box.max.y - box.min.y));
  geometry.translate(-(box.max.x + box.min.x) / 2, -(box.max.y + box.min.y) / 2, 0);
  geometry.scale(scale, scale, 1);
  return geometry;
}

export function createClickerViewer(canvas, host, reset) {
  let renderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { return null; }
  const scene = new Scene();
  const assembly = new Group();
  scene.add(assembly, new AmbientLight(0xffffff, 1.7));
  const light = new DirectionalLight(0xfff6ec, 2.5);
  light.position.set(-45, -60, 100);
  const fill = new DirectionalLight(0xe6dcff, 1);
  fill.position.set(50, 35, 60);
  scene.add(light, fill);
  const camera = new OrthographicCamera(-48, 48, 48, -48, 0.1, 600);
  camera.up.set(0, 0, 1);
  camera.position.set(24, -65, 95);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 2.5;
  controls.target.set(0, 0, 4);
  controls.update();
  controls.saveState();
  let worldWidth = 96;
  let keyGroups = [];
  const animations = new Map();
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);
  reset.addEventListener('click', () => controls.reset());
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.left = -worldWidth / 2;
    camera.right = worldWidth / 2;
    camera.top = worldWidth / 2 * h / w;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    render();
  }
  new ResizeObserver(resize).observe(host);
  function press(index) {
    const group = keyGroups[index];
    if (!group || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (animations.has(group)) cancelAnimationFrame(animations.get(group));
    const start = performance.now();
    function tick(now) {
      const phase = Math.min(1, (now - start) / 260);
      group.position.z = -Math.sin(phase * Math.PI) * 2.1;
      render();
      if (phase < 1) animations.set(group, requestAnimationFrame(tick));
      else { group.position.z = 0; animations.delete(group); }
    }
    animations.set(group, requestAnimationFrame(tick));
  }
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let down;
  canvas.addEventListener('pointerdown', event => { down = [event.clientX, event.clientY]; });
  canvas.addEventListener('pointerup', event => {
    if (!down || Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(keyGroups, true)[0];
    if (hit) press(hit.object.userData.keyIndex);
    down = undefined;
  });
  host.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); press(0); }
  });

  function update({ keys, base, cap, ink }) {
    for (const request of animations.values()) cancelAnimationFrame(request);
    animations.clear();
    assembly.traverse(object => {
      if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); }
    });
    assembly.clear();
    keyGroups = [];
    const width = keys.length * 22 + 14;
    worldWidth = Math.max(88, width + 22);
    const centers = keys.map((_, index) => -width / 2 + 20 + index * 22);
    function bodyShape(withSockets) {
      const shape = rounded(width, 28, 4);
      const ring = new Path();
      ring.absarc(-width / 2 + 5.3, 0, 2.3, 0, Math.PI * 2, true);
      shape.holes.push(ring);
      if (withSockets) for (const x of centers) {
        const hole = rounded(18, 18, 1.2, x);
        shape.holes.push(hole);
      }
      return shape;
    }
    function add(geometry, colour, z, parent = assembly) {
      const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: colour, roughness: 0.6, metalness: 0.02 }));
      mesh.position.z = z;
      parent.add(mesh);
      return mesh;
    }
    add(new ExtrudeGeometry(bodyShape(false), { depth: 1, bevelEnabled: false, curveSegments: 16 }), base, 0);
    add(new ExtrudeGeometry(bodyShape(true), { depth: 2.2, bevelEnabled: false, curveSegments: 16 }), base, 1);
    for (const [index, entry] of keys.entries()) {
      const x = centers[index];
      const housing = add(new BoxGeometry(15.5, 15.5, 2.8), '#c4bbc9', 4);
      housing.position.x = x;
      const core = add(new BoxGeometry(8, 8, 2.2), '#70637d', 5.4);
      core.position.x = x;
      const group = new Group();
      group.position.x = x;
      assembly.add(group);
      keyGroups.push(group);
      const capMesh = add(new ExtrudeGeometry(rounded(16.2, 16.2, 2.4), {
        depth: 2.5, bevelEnabled: true, bevelThickness: 0.7, bevelSize: 0.7,
        bevelSegments: 3, curveSegments: 12,
      }), cap, 6.4, group);
      capMesh.userData.keyIndex = index;
      const glyph = lettering(entry.font, entry.text);
      if (glyph) {
        const letter = add(glyph, ink, 9.65, group);
        letter.userData.keyIndex = index;
      }
    }
    resize();
  }
  resize();
  return { update, press };
}
