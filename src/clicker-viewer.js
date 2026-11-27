import {
  AmbientLight, Box3, BoxGeometry, BufferAttribute, BufferGeometry, Color, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Group,
  Mesh, MeshStandardMaterial, OrthographicCamera, Path, Raycaster, Scene,
  Shape, ShapePath, Vector2, WebGLRenderer,
} from 'three';
import { NAME_MX, nameMxStack } from './name-clicker-mechanism.js';
import { MX, MX_CAP_SOCKET, MX_CASE, MX_CHAIN_EYELET, MX_NAME_FACE, MX_RECESS, mxChainEyelet, mxPrintableEyelet, mxStack } from './cherry-mx-spec.js';
import { MECHANICAL_BASE, mechanicalBaseGrooves, mechanicalBaseLeft } from './mechanical-base.js';
import mechanicalEyelet from './mechanical-eyelet-mesh.json';
import { MECHANICAL_KEYCAP, mechanicalKeycapShell } from './mechanical-keycap.js';
import { nameClickerOutline } from './name-clicker-outline.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function rounded(width, height, radius, offsetX = 0, offsetY = 0, grooves = []) {
  const path = new Shape();
  const x = -width / 2 + offsetX, y = -height / 2 + offsetY;
  path.moveTo(x + radius, y);
  for (const groove of grooves) {
    for (const [gx, gy] of groove) path.lineTo(gx, -gy);
  }
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  for (const groove of [...grooves].reverse()) {
    for (const [gx, gy] of [...groove].reverse()) path.lineTo(gx, gy);
  }
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
  const listeners = new AbortController();
  const { signal } = listeners;
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
  let lastStyle;
  const animations = new Map();
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);
  function setCapVisibility(visible) {
    showCaps = visible;
    capGroups.forEach(group => { group.visible = visible; });
    inspect.textContent = visible ? inspect.dataset.inspect : inspect.dataset.assemble;
    inspect.setAttribute('aria-pressed', String(!visible));
  }
  inspect.addEventListener('click', () => {
    setCapVisibility(!showCaps);
    render();
  }, { signal });
  reset.addEventListener('click', () => controls.reset(), { signal });
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
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function press(index) {
    const group = keyGroups[index];
    if (!group || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (animations.has(group)) cancelAnimationFrame(animations.get(group));
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const depth = Math.max(0, Math.min(1, elapsed / 90, (400 - elapsed) / 170));
      group.position.z = -depth * MX.travel;
      render();
      if (elapsed < 400) animations.set(group, requestAnimationFrame(tick));
      else { group.position.z = 0; animations.delete(group); }
    }
    animations.set(group, requestAnimationFrame(tick));
  }
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let down;
  canvas.addEventListener('pointerdown', event => { down = [event.clientX, event.clientY]; }, { signal });
  canvas.addEventListener('pointerup', event => {
    if (!down || Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(assembly, true).find(({ object }) => object.parent.visible);
    if (hit?.object.userData.keyIndex !== undefined) press(hit.object.userData.keyIndex);
    down = undefined;
  }, { signal });
  host.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); press(0); }
  }, { signal });

  function clear() {
    for (const request of animations.values()) cancelAnimationFrame(request);
    animations.clear();
    assembly.traverse(object => {
      if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); }
    });
    assembly.clear();
    keyGroups = [];
    capGroups = [];
  }
  function update({ keys, base, cap, ink, style }) {
    if (lastStyle !== style) setCapVisibility(true);
    lastStyle = style;
    clear();
    assembly.position.x = 0;
    const stack = style === 'name' ? nameMxStack() : mxStack();
    function add(geometry, colour, z, parent = assembly) {
      const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: colour, roughness: 0.6, metalness: 0.02 }));
      mesh.position.z = z;
      parent.add(mesh);
      return mesh;
    }
    const extrude = (shape, height) => new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 16 });
    function addChainEyelet(body, colour) {
      const { outline, holeX, rootLeft } = mxChainEyelet(body.getPoints().map(({ x, y }) => [x, y]));
      const ear = new Shape(outline.map(([x, y]) => new Vector2(x, y)));
      const hole = new Path();
      hole.absarc(holeX, 0, MX_CHAIN_EYELET.holeDiameter / 2, 0, 2 * Math.PI, true);
      ear.holes.push(hole);
      const bottom = mxPrintableEyelet(outline, rootLeft).bottom;
      add(extrude(ear, MX_CHAIN_EYELET.thickness), colour, bottom);
    }
    function cross(width, arm, armY = arm) {
      const shape = new Shape(), h = width / 2, a = arm / 2, b = armY / 2;
      const points = [[-a,-h],[a,-h],[a,-b],[h,-b],[h,b],[a,b],[a,h],[-a,h],[-a,b],[-h,b],[-h,-b],[-a,-b]];
      points.forEach(([x,y], index) => index ? shape.lineTo(x,y) : shape.moveTo(x,y));
      shape.closePath();
      return shape;
    }
    function addCapSocket(colour, parent, index, specification = MX_CAP_SOCKET) {
      const { outerDiameter, crossSpan, crossArm, engagement } = specification;
      const socket = new Shape();
      socket.absarc(0, 0, outerDiameter / 2, 0, 2 * Math.PI, false);
      socket.holes.push(cross(crossSpan, crossArm, specification.crossArmY ?? crossArm));
      const bottom = stack.stemTop - engagement;
      const mesh = add(extrude(socket, stack.roofBottom - bottom), colour, bottom, parent);
      mesh.userData.keyIndex = index; return mesh;
    }
    function mountSwitch(x, index, y = 0, sharedMotion = null) {
      function fixed(geometry, colour, z) { const mesh = add(geometry, colour, z); mesh.position.x = x; mesh.position.y = y; return mesh; }
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
      group.position.x=x;group.position.y=y;
      (sharedMotion ?? assembly).add(group);
      if (!sharedMotion) keyGroups.push(group);
      const stem = add(extrude(cross(4,1.2),MX.stem),'#cf4b52',stack.housingTop,group);
      stem.userData.keyIndex=index;
      if (sharedMotion) return;
      const capGroup = new Group();
      capGroup.visible=showCaps;group.add(capGroup);capGroups.push(capGroup);
      return capGroup;
    }
    if (style === 'name') {
      const { font, text } = keys[0];
      const { profile, lettering, mounts, capBack, dividers } = nameClickerOutline(font, text);
      const caseColour = new Color(base).multiplyScalar(0.62);
      const { shellMargin, innerWallMargin, faceMargin, insetMargin, insetHeight, letteringHeight } = MX_NAME_FACE;
      const stopTop = stack.skirtBottom - NAME_MX.travel - NAME_MX.stopGap;
      const stopWall = profile(shellMargin);
      stopWall.holes.push(profile(faceMargin - NAME_MX.stopOverlap));
      const guideWall = profile(shellMargin);
      guideWall.holes.push(profile(innerWallMargin));
      const floor = profile(shellMargin);
      const deck = profile(shellMargin);
      for (const { x, y } of mounts) {
        deck.holes.push(rounded(NAME_MX.opening, NAME_MX.opening, 0, x, y));
      }
      add(extrude(floor, NAME_MX.floor), caseColour, 0);
      add(extrude(deck, NAME_MX.deck - NAME_MX.floor), caseColour, NAME_MX.floor);
      add(extrude(stopWall, stopTop - NAME_MX.deck), caseColour, NAME_MX.deck);
      add(extrude(guideWall, stack.rimTop - stopTop), caseColour, stopTop);
      for (const [bottom, top, width, height] of [
        [NAME_MX.floor, NAME_MX.latchBottom, NAME_MX.opening, NAME_MX.opening],
        [NAME_MX.latchBottom, NAME_MX.latchTop, NAME_MX.latchX, NAME_MX.latchY],
        [NAME_MX.latchTop, stack.mountTop, NAME_MX.opening, NAME_MX.opening],
      ]) {
        const visibleBottom = Math.max(bottom, NAME_MX.deck);
        if (top <= visibleBottom) continue;
        for (const { x, y } of mounts) {
          const frame = rounded(NAME_MX.exteriorX, NAME_MX.exteriorY, 0, x, y);
          frame.holes.push(rounded(width, height, 0, x, y));
          add(extrude(frame, top - visibleBottom), caseColour, visibleBottom);
        }
      }
      if (dividers.length) add(extrude(dividers, stack.mountTop - NAME_MX.deck), caseColour, NAME_MX.deck);

      addChainEyelet(floor, caseColour);

      const moving = new Group();
      assembly.add(moving);
      keyGroups.push(moving);
      const face = new Group();
      face.visible = showCaps;
      moving.add(face);
      capGroups.push(face);
      for (const { x, y } of mounts) mountSwitch(x, 0, y, moving);
      add(extrude(capBack, NAME_MX.capDepth), base, stack.skirtBottom, face).userData.keyIndex = 0;
      add(extrude(profile(faceMargin), NAME_MX.roof), base, stack.roofBottom, face).userData.keyIndex = 0;
      add(extrude(profile(insetMargin), insetHeight), cap, stack.capTop, face).userData.keyIndex = 0;
      if (lettering.length) {
        add(extrude(lettering, letteringHeight), ink, stack.capTop + insetHeight, face).userData.keyIndex = 0;
      }
      for (const { x, y } of mounts) {
        const socket = addCapSocket(base, face, 0, { outerDiameter: NAME_MX.bossDiameter,
          crossSpan: NAME_MX.crossSpan, crossArm: NAME_MX.crossArmX, crossArmY: NAME_MX.crossArmY,
          engagement: stack.stemTop - stack.socketStart });
        socket.position.set(x, y, socket.position.z);
      }
      const bounds = new Box3().setFromObject(assembly);
      const width = bounds.max.x - bounds.min.x;
      const height = bounds.max.y - bounds.min.y;
      assembly.position.x = -(bounds.max.x + bounds.min.x) / 2;
      worldWidth = Math.max(70, width + 24, height + 24);
      resize();
      return [width, height, bounds.max.z];
    }
    const { pitch, halfDepth } = MECHANICAL_BASE;
    const centers = keys.map((_, index) => (index - (keys.length - 1) / 2) * pitch);
    const grooves = mechanicalBaseGrooves(centers.length);
    const body = () => rounded((centers.length - 1) * pitch + 2 * halfDepth, 2 * halfDepth, 3.8, 0, 0, grooves);
    const skirtBottom = stack.skirtBottom - MECHANICAL_KEYCAP.skirtDrop;
    const rimTop = skirtBottom + 1.0;
    const walls = body();
    const plate = body();
    const rim = body();
    const wellWidth = 20.3;
    for (const x of centers) {
      walls.holes.push(rounded(18, 18, 2, x));
      plate.holes.push(rounded(MX_CASE.opening, MX_CASE.opening, 0.3, x));
      rim.holes.push(rounded(wellWidth, wellWidth, 2.4 + MX_RECESS.sideClearance, x));
    }
    add(extrude(body(), MX_CASE.floor), base, 0);
    add(extrude(walls, stack.plateBottom - MX_CASE.floor), base, MX_CASE.floor);
    add(extrude(plate, MX_CASE.plate), base, stack.plateBottom);
    add(extrude(rim, rimTop - stack.mountTop), base, stack.mountTop);

    // The reference mesh includes the curved root and the tapered chain entry.
    const eyelet = new BufferGeometry();
    eyelet.setAttribute('position', new BufferAttribute(Float32Array.from(mechanicalEyelet.positions), 3));
    eyelet.setIndex(new BufferAttribute(Uint32Array.from(mechanicalEyelet.triangles), 1));
    eyelet.computeVertexNormals();
    add(eyelet, base, 0).position.x = mechanicalBaseLeft(centers.length);
    for (const [index, entry] of keys.entries()) {
      const { cap: keycapColour, ink: letteringColour } = entry;
      const capGroup = mountSwitch(centers[index], index);
      const shell = mechanicalKeycapShell(stack.capTop - skirtBottom, stack.roofBottom - skirtBottom);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(shell.vertProperties, 3));
      geometry.setIndex(new BufferAttribute(shell.triVerts, 1));
      geometry.computeVertexNormals();
      add(geometry, keycapColour, skirtBottom, capGroup).userData.keyIndex = index;
      addCapSocket(keycapColour, capGroup, index);
      const glyph = lettering(entry.font, entry.text);
      if (glyph) add(glyph, letteringColour, stack.capTop, capGroup).userData.keyIndex = index;
    }
    const bounds = new Box3().setFromObject(assembly);
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    assembly.position.x = -(bounds.max.x + bounds.min.x) / 2;
    worldWidth = Math.max(62, width + 24, height + 24);
    resize();
    return [width, height, bounds.max.z];
  }
  resize();
  return {
    update, press,
    dispose() {
      listeners.abort();
      observer.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      clear();
      renderer.dispose();
    },
  };
}
