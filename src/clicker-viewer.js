import {
  AmbientLight, BoxGeometry, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Group,
  Mesh, MeshStandardMaterial, OrthographicCamera, Path, Raycaster, Scene,
  Shape, ShapePath, Vector2, WebGLRenderer,
} from 'three';
import { MX, MX_CASE, mxStack } from './cherry-mx-spec.js';
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

export function createClickerViewer(canvas, host, reset, inspect) {
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
  camera.position.set(26, -76, 72);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 2.5;
  controls.target.set(0, 0, 11);
  controls.update();
  controls.saveState();
  let worldWidth = 96;
  let keyGroups = [];
  let capGroups = [];
  let showCaps = true;
  const animations = new Map();
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);
  inspect.addEventListener('click', () => {
    showCaps = !showCaps;
    capGroups.forEach(group => { group.visible = showCaps; });
    inspect.textContent = showCaps ? inspect.dataset.inspect : inspect.dataset.assemble;
    inspect.setAttribute('aria-pressed', String(!showCaps));
    render();
  });
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
      group.position.z = -Math.sin(phase * Math.PI) * MX.travel;
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
    capGroups = [];
    const stack = mxStack();
    const width = keys.length * 22 + 14;
    worldWidth = Math.max(88, width + 26);
    const centers = keys.map((_, index) => -width / 2 + 20 + index * 22);
    function bodyShape(type) {
      const shape = rounded(width, 28, 4);
      const ring = new Path();
      ring.absarc(-width / 2 + 5.3, 0, 2.3, 0, Math.PI * 2, true);
      shape.holes.push(ring);
      if (type === 'plate') for (const x of centers) shape.holes.push(rounded(MX_CASE.opening, MX_CASE.opening, 0.3, x));
      if (type === 'walls') shape.holes.push(rounded(width - 12.8, 28 - MX_CASE.wall * 2, 2, 4.6));
      return shape;
    }
    function add(geometry, colour, z, parent = assembly) {
      const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: colour, roughness: 0.6, metalness: 0.02 }));
      mesh.position.z = z;
      parent.add(mesh);
      return mesh;
    }
    const extrude = (shape, height) => new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 16 });
    add(extrude(bodyShape('floor'), MX_CASE.floor), base, 0);
    add(extrude(bodyShape('walls'), stack.plateBottom - MX_CASE.floor), base, MX_CASE.floor);
    add(extrude(bodyShape('plate'), MX_CASE.plate), base, stack.plateBottom);
    function cross(width, arm) {
      const shape = new Shape(), h = width / 2, a = arm / 2;
      const points = [[-a,-h],[a,-h],[a,-a],[h,-a],[h,a],[a,a],[a,h],[-a,h],[-a,a],[-h,a],[-h,-a],[-a,-a]];
      points.forEach(([x,y], index) => index ? shape.lineTo(x,y) : shape.moveTo(x,y));
      shape.closePath();
      return shape;
    }
    for (const [index, entry] of keys.entries()) {
      const x = centers[index];
      function fixed(geometry, colour, z) { const mesh = add(geometry, colour, z); mesh.position.x = x; return mesh; }
      fixed(extrude(rounded(14,14,0.6), MX.lowerBody), '#25242a', stack.bodyBottom);
      fixed(extrude(rounded(MX.width,MX.width,0.7),0.8), '#343239', stack.mountTop);
      const shell = rounded(14.8,14.8,1.2);
      shell.holes.push(rounded(6.2,6.2,0.5));
      const shellHeight = stack.housingTop - stack.mountTop - 0.8;
      const shellGeometry = extrude(shell,shellHeight);
      const positions = shellGeometry.attributes.position;
      for (let i=0;i<positions.count;i++) {
        const factor = 1 - 0.15 * positions.getZ(i) / shellHeight;
        positions.setXY(i,positions.getX(i)*factor,positions.getY(i)*factor);
      }
      shellGeometry.computeVertexNormals();
      fixed(shellGeometry,'#49464f',stack.mountTop+0.8);
      for (const side of [-1,1]) {
        const clip = fixed(new BoxGeometry(0.8,3,1.2),'#35333b',stack.plateBottom-0.6);
        clip.position.x += side * 7.1;
      }
      for (const [px,py] of [[-3.8,-2.5],[2.5,-5]]) {
        const pinGeometry = new CylinderGeometry(0.35,0.25,MX.pins,8);
        pinGeometry.rotateX(Math.PI/2);
        const pin = fixed(pinGeometry,'#bba768',stack.bodyBottom-MX.pins/2);
        pin.position.x+=px;pin.position.y=py;pin.material.metalness=0.8;
      }
      const postGeometry = new CylinderGeometry(1.9,1.6,MX.pins,12);
      postGeometry.rotateX(Math.PI/2);
      fixed(postGeometry,'#25242a',stack.bodyBottom-MX.pins/2);
      const group = new Group();
      group.position.x=x;assembly.add(group);keyGroups.push(group);
      const stem = add(extrude(cross(4,1.2),MX.stem),'#cf4b52',stack.housingTop,group);
      stem.userData.keyIndex=index;
      const capGroup = new Group();
      capGroup.visible=showCaps;group.add(capGroup);capGroups.push(capGroup);
      const skirt = rounded(MX_CASE.capWidth,MX_CASE.capWidth,2.4);
      skirt.holes.push(rounded(16,16,1.4));
      add(extrude(skirt,stack.roofBottom-stack.skirtBottom),cap,stack.skirtBottom,capGroup).userData.keyIndex=index;
      const roof = add(new ExtrudeGeometry(rounded(17.6,17.6,2),{
        depth:MX_CASE.roof-0.4,bevelEnabled:true,bevelThickness:0.2,bevelSize:0.4,bevelSegments:3,curveSegments:12,
      }),cap,stack.roofBottom+0.2,capGroup);
      roof.userData.keyIndex=index;
      const socket = rounded(6,6,0.6);socket.holes.push(cross(4.2,1.5));
      add(extrude(socket,stack.roofBottom-(stack.stemTop-2.8)),cap,stack.stemTop-2.8,capGroup).userData.keyIndex=index;
      const glyph=lettering(entry.font,entry.text);
      if(glyph) add(glyph,ink,stack.capTop,capGroup).userData.keyIndex=index;
    }
    resize();
    return [width,28,stack.capTop+0.65];
  }
  resize();
  return { update, press };
}
