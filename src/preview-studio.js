import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

// Preview lighting and normals never change the exported manufacturing meshes.
export function studioSurface(geometry) {
  return toCreasedNormals(geometry, Math.PI / 3);
}

export function setupPreviewStudio(renderer, scene, camera, controls, render) {
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  const generator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = generator.fromScene(room, 0.05, 0.1, 100, { size: 64 });
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.55;
  room.dispose();
  generator.dispose();

  const bitmap = document.createElement("canvas");
  bitmap.width = bitmap.height = 128;
  const context = bitmap.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 63);
  gradient.addColorStop(0, "rgba(41,35,49,.24)");
  gradient.addColorStop(0.45, "rgba(41,35,49,.12)");
  gradient.addColorStop(1, "rgba(41,35,49,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const shadow = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({
      map: new CanvasTexture(bitmap),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  shadow.position.z = -0.6;
  shadow.visible = false;
  scene.add(shadow);

  let introFrame;
  let started = false;
  let interrupted = false;
  const stop = () => {
    interrupted = true;
    if (introFrame) cancelAnimationFrame(introFrame);
  };
  controls.addEventListener("start", stop);
  renderer.domElement.addEventListener("pointerdown", stop);
  renderer.domElement.addEventListener("wheel", stop, { passive: true });
  renderer.domElement.addEventListener("keydown", stop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  return {
    fitShadow(width, height, z = -0.6) {
      shadow.scale.set(Math.max(1, width * 1.3), Math.max(1, height * 1.5), 1);
      shadow.position.z = z;
      shadow.visible = true;
    },
    introduce() {
      if (
        started ||
        interrupted ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      started = true;
      const start = performance.now();
      const offset = camera.position.clone().sub(controls.target);
      const axis = new Vector3(0, 0, 1);
      let lastRender = 0;
      function tick(now) {
        if (now - lastRender < 50) {
          introFrame = requestAnimationFrame(tick);
          return;
        }
        lastRender = now;
        const progress = Math.min(1, (now - start) / 2400);
        const eased = progress * progress * (3 - 2 * progress);
        camera.position
          .copy(offset)
          .applyAxisAngle(axis, eased * Math.PI * 2)
          .add(controls.target);
        controls.update();
        render();
        if (progress < 1 && !interrupted)
          introFrame = requestAnimationFrame(tick);
      }
      introFrame = requestAnimationFrame(tick);
    },
  };
}
