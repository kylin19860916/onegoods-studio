import {
  AmbientLight, BufferGeometry, DirectionalLight, Float32BufferAttribute, Group,
  Mesh, MeshStandardMaterial, OrthographicCamera, Scene, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createKeyringViewer(canvas, host, resetButton) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null;
  }

  const listeners = new AbortController();
  const { signal } = listeners;
  const scene = new Scene();
  const model = new Group();
  scene.add(model, new AmbientLight(0xffffff, 1.65));
  const key = new DirectionalLight(0xfff5ee, 2.1);
  key.position.set(-26, -45, 72);
  const fill = new DirectionalLight(0xe7dfff, 0.75);
  fill.position.set(60, 25, 45);
  scene.add(key, fill);

  const camera = new OrthographicCamera(-45, 45, 24, -24, 0.1, 500);
  camera.up.set(0, 0, 1);
  camera.position.set(12, -40, 105);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 2.8;
  controls.update();
  controls.saveState();
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);
  resetButton.addEventListener('click', () => controls.reset(), { signal });

  let halfWidth = 45;

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth * height / width;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  host.addEventListener('keydown', event => {
    const offsets = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, 7], ArrowDown: [0, -7] };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    camera.position.applyAxisAngle(new Vector3(0, 0, 1), offset[0]);
    camera.position.z += offset[1];
    controls.update();
    render();
  }, { signal });

  function setMeshes(meshes, { fit = false } = {}) {
    for (const part of [...model.children]) {
      model.remove(part);
      part.geometry.dispose();
      part.material.dispose();
    }
    if (!meshes.length) {
      render();
      return;
    }
    const vertices = meshes.flatMap(part => part.vertices);
    const center = [0, 1, 2].map(axis => {
      const values = vertices.map(vertex => vertex[axis]);
      return (Math.min(...values) + Math.max(...values)) / 2;
    });
    const radius = fit ? Math.max(...vertices.map(vertex =>
      Math.hypot(...vertex.map((value, axis) => value - center[axis])))) : 0;
    halfWidth = fit ? Math.max(21, radius * 1.17) : 45;
    for (const part of meshes) {
      const geometry = new BufferGeometry();
      const positions = part.vertices.flatMap(vertex => vertex.map((value, axis) => value - center[axis]));
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setIndex(part.triangles.flat());
      geometry.computeVertexNormals();
      model.add(new Mesh(geometry, new MeshStandardMaterial({ color: part.color, roughness: 0.72, flatShading: true })));
    }
    resize();
  }

  return {
    setMeshes,
    dispose() {
      listeners.abort();
      observer.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      setMeshes([]);
      renderer.dispose();
    },
    image() {
      render();
      return canvas.toDataURL('image/png');
    },
  };
}
