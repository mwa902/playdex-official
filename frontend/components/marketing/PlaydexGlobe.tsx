'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createEarthTexture() {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 1024;
  textureCanvas.height = 512;
  const context = textureCanvas.getContext('2d');
  if (!context) return null;

  const ocean = context.createLinearGradient(0, 0, 1024, 512);
  ocean.addColorStop(0, '#0B1620');
  ocean.addColorStop(0.52, '#102D3A');
  ocean.addColorStop(1, '#164858');
  context.fillStyle = ocean;
  context.fillRect(0, 0, 1024, 512);

  const continents = [
    [[82, 122], [153, 74], [231, 82], [283, 125], [265, 177], [226, 199], [211, 255], [173, 275], [139, 236], [102, 222], [78, 171]],
    [[242, 260], [294, 273], [315, 323], [300, 371], [281, 430], [258, 462], [245, 412], [225, 358], [226, 309]],
    [[437, 113], [482, 91], [531, 108], [549, 144], [520, 174], [476, 164], [448, 144]],
    [[447, 174], [506, 171], [543, 212], [534, 268], [511, 329], [480, 346], [458, 305], [435, 253], [429, 211]],
    [[525, 95], [616, 69], [720, 91], [781, 124], [839, 133], [875, 170], [835, 195], [778, 186], [741, 229], [690, 213], [647, 241], [603, 212], [566, 189], [533, 149]],
    [[787, 291], [842, 279], [883, 310], [868, 350], [823, 355], [792, 330]],
    [[906, 250], [925, 241], [937, 263], [921, 278]],
  ];

  context.fillStyle = '#22B8D0';
  context.globalAlpha = 0.88;
  continents.forEach(points => {
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fill();
  });
  context.globalAlpha = 1;

  context.fillStyle = '#F4F8FB';
  for (let index = 0; index < 85; index += 1) {
    const x = (index * 197 + 31) % textureCanvas.width;
    const y = (index * 83 + 17) % textureCanvas.height;
    context.globalAlpha = 0.1 + ((index % 4) * 0.04);
    context.fillRect(x, y, index % 5 === 0 ? 2 : 1, 1);
  }
  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addGraticule(group: THREE.Group, radius: number) {
  const material = new THREE.LineBasicMaterial({
    color: '#8FA9B8',
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const segments = 96;
  const addLoop = (points: THREE.Vector3[]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    group.add(new THREE.LineLoop(geometry, material));
  };

  for (const latitude of [-60, -30, 0, 30, 60]) {
    const angle = THREE.MathUtils.degToRad(latitude);
    const points = Array.from({ length: segments }, (_, index) => {
      const longitude = (index / segments) * Math.PI * 2;
      return new THREE.Vector3(
        radius * Math.cos(angle) * Math.sin(longitude),
        radius * Math.sin(angle),
        radius * Math.cos(angle) * Math.cos(longitude),
      );
    });
    addLoop(points);
  }

  for (let longitudeIndex = 0; longitudeIndex < 6; longitudeIndex += 1) {
    const longitude = (longitudeIndex / 6) * Math.PI;
    const points = Array.from({ length: segments + 1 }, (_, index) => {
      const latitude = (index / segments - 0.5) * Math.PI;
      return new THREE.Vector3(
        radius * Math.cos(latitude) * Math.sin(longitude),
        radius * Math.sin(latitude),
        radius * Math.cos(latitude) * Math.cos(longitude),
      );
    });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }
}

function renderCanvasFallback(canvas: HTMLCanvasElement, container: HTMLDivElement) {
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.className = 'playdex-globe-canvas-fallback';
  const caption = container.querySelector('.playdex-globe-caption');
  container.insertBefore(fallbackCanvas, caption);
  const context = fallbackCanvas.getContext('2d');
  if (!context) {
    fallbackCanvas.remove();
    return () => undefined;
  }
  const originalOpacity = canvas.style.opacity;
  canvas.style.opacity = '0';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0 };
  let frame = 0;
  let animationFrame = 0;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  const orbitSpecs = [
    { color: '#22B8D0', radius: 1.48, tilt: -0.3, speed: 0.012, phase: 0 },
    { color: '#FFD447', radius: 1.58, tilt: 0.46, speed: -0.008, phase: 2.4 },
    { color: '#8FA9B8', radius: 1.7, tilt: -0.74, speed: 0.005, phase: 4.1 },
  ];

  const drawOrbit = (orbit: typeof orbitSpecs[number], time: number, opacity: number) => {
    if (!context) return;
    context.save();
    context.translate(width * 0.51, height * 0.49);
    context.rotate(orbit.tilt);
    context.scale(1, 0.34);
    context.strokeStyle = orbit.color;
    context.globalAlpha = opacity;
    context.lineWidth = orbit.color === '#FFD447' ? 2.2 : 1.5;
    context.beginPath();
    context.ellipse(0, 0, Math.min(height * 0.34, 160) * orbit.radius, Math.min(height * 0.34, 160) * orbit.radius, 0, 0, Math.PI * 2);
    context.stroke();
    const angle = orbit.phase + time * orbit.speed;
    const radius = Math.min(height * 0.34, 160) * orbit.radius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    context.fillStyle = orbit.color;
    context.globalAlpha = 1;
    context.shadowColor = orbit.color;
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(x, y, orbit.color === '#FFD447' ? 5 : 3.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  const draw = () => {
    if (!context) return;
    frame += 1;
    const time = reducedMotion ? 0 : frame;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const centerX = width * 0.51;
    const centerY = height * 0.49;
    const radius = Math.min(height * 0.34, width * 0.25, 160);

    for (let index = 0; index < 68; index += 1) {
      const x = (index * 97 + 23) % width;
      const y = (index * 53 + 19) % height;
      context.fillStyle = index % 7 === 0 ? '#FFD447' : '#8FA9B8';
      context.globalAlpha = 0.2 + ((index % 4) * 0.1);
      context.beginPath();
      context.arc(x, y, index % 7 === 0 ? 1.3 : 0.7, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    orbitSpecs.forEach(orbit => drawOrbit(orbit, time, 0.45));

    const glow = context.createRadialGradient(centerX - radius * 0.36, centerY - radius * 0.45, radius * 0.08, centerX, centerY, radius * 1.34);
    glow.addColorStop(0, 'rgba(34,184,208,.3)');
    glow.addColorStop(1, 'rgba(34,184,208,0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, radius * 1.34, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.clip();
    const ocean = context.createRadialGradient(centerX - radius * 0.36, centerY - radius * 0.42, radius * 0.04, centerX, centerY, radius * 1.2);
    ocean.addColorStop(0, '#164858');
    ocean.addColorStop(0.58, '#102D3A');
    ocean.addColorStop(1, '#0B1620');
    context.fillStyle = ocean;
    context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    const spin = time * 0.009;
    context.save();
    context.translate(centerX + Math.sin(spin) * radius * 0.08 + pointer.x * radius, centerY + pointer.y * radius);
    context.scale(1, 0.94);
    context.fillStyle = '#22B8D0';
    context.globalAlpha = 0.88;
    const continents = [
      [[-0.8, -0.52], [-0.5, -0.77], [-0.16, -0.64], [-0.22, -0.34], [-0.46, -0.15], [-0.55, 0.13], [-0.78, -0.02]],
      [[-0.48, 0.12], [-0.2, 0.18], [-0.16, 0.45], [-0.32, 0.82], [-0.48, 0.58], [-0.58, 0.3]],
      [[-0.05, -0.68], [0.2, -0.73], [0.28, -0.57], [0.08, -0.48]],
      [[-0.06, -0.42], [0.22, -0.42], [0.36, -0.08], [0.21, 0.46], [-0.02, 0.6], [-0.16, 0.18]],
      [[0.08, -0.72], [0.48, -0.76], [0.79, -0.52], [0.7, -0.25], [0.47, -0.17], [0.34, 0.02], [0.12, -0.12], [0.06, -0.42]],
      [[0.49, 0.34], [0.75, 0.3], [0.83, 0.52], [0.64, 0.66], [0.48, 0.52]],
    ];
    continents.forEach(points => {
      context.beginPath();
      points.forEach(([x, y], index) => {
        const px = x * radius;
        const py = y * radius;
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      });
      context.closePath();
      context.fill();
    });
    context.restore();

    context.strokeStyle = 'rgba(143,169,184,.3)';
    context.lineWidth = 0.8;
    for (const latitude of [-0.58, -0.3, 0, 0.3, 0.58]) {
      const y = centerY + latitude * radius;
      const halfWidth = Math.sqrt(Math.max(0, 1 - latitude * latitude)) * radius;
      context.beginPath();
      context.ellipse(centerX, y, halfWidth, Math.max(2, radius * 0.035), 0, 0, Math.PI * 2);
      context.stroke();
    }
    for (let index = 0; index < 5; index += 1) {
      const longitude = (index / 5) * Math.PI + spin;
      const widthScale = Math.abs(Math.cos(longitude));
      context.beginPath();
      context.ellipse(centerX, centerY, Math.max(1, radius * widthScale), radius, 0, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();

    context.strokeStyle = 'rgba(34,184,208,.55)';
    context.lineWidth = 1.2;
    context.beginPath();
    context.arc(centerX, centerY, radius, -Math.PI * 0.82, Math.PI * 0.72);
    context.stroke();
    orbitSpecs.forEach(orbit => drawOrbit(orbit, time, 0.86));
    if (!reducedMotion) animationFrame = window.requestAnimationFrame(draw);
  };

  const resize = () => {
    const bounds = container.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.8);
    width = bounds.width;
    height = bounds.height;
    fallbackCanvas.width = Math.round(width * pixelRatio);
    fallbackCanvas.height = Math.round(height * pixelRatio);
    draw();
  };
  const onPointerMove = (event: PointerEvent) => {
    const bounds = container.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.16;
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.12;
  };
  const onPointerLeave = () => { pointer.x = 0; pointer.y = 0; };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  container.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerleave', onPointerLeave);
  resize();

  return () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerleave', onPointerLeave);
    canvas.style.opacity = originalOpacity;
    fallbackCanvas.remove();
  };
}

export function PlaydexGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = sceneRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return renderCanvasFallback(canvas, container);
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(0, 0, 6.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    scene.add(new THREE.AmbientLight('#F4F8FB', 1.65));
    const keyLight = new THREE.DirectionalLight('#22B8D0', 3.2);
    keyLight.position.set(-3, 2, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight('#FFD447', 7, 12);
    rimLight.position.set(3, -1.5, 2.5);
    scene.add(rimLight);

    const globe = new THREE.Group();
    scene.add(globe);
    const earthTexture = createEarthTexture();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 72, 48),
      new THREE.MeshStandardMaterial({
        map: earthTexture ?? undefined,
        color: earthTexture ? '#FFFFFF' : '#102D3A',
        roughness: 0.72,
        metalness: 0.08,
      }),
    );
    globe.add(earth);
    addGraticule(globe, 1.365);

    const orbitalGroup = new THREE.Group();
    scene.add(orbitalGroup);
    const orbitSpecs = [
      { color: '#22B8D0', radius: 1.86, tilt: 0.42, speed: 0.58, phase: 0 },
      { color: '#FFD447', radius: 1.98, tilt: -0.62, speed: -0.37, phase: Math.PI },
      { color: '#8FA9B8', radius: 2.12, tilt: 1.04, speed: 0.24, phase: Math.PI * 0.56 },
    ];
    const orbiters: Array<{ group: THREE.Group; speed: number }> = [];

    orbitSpecs.forEach((spec, index) => {
      const orbit = new THREE.Group();
      orbit.rotation.set(spec.tilt, index * 0.48, index * 0.22);
      orbitalGroup.add(orbit);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: index === 2 ? 0.42 : 0.84,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.radius, index === 2 ? 0.007 : 0.012, 8, 180), ringMaterial);
      ring.rotation.x = Math.PI / 2;
      orbit.add(ring);

      const satellite = new THREE.Mesh(
        new THREE.SphereGeometry(index === 1 ? 0.075 : 0.055, 20, 16),
        new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 1.6 }),
      );
      const satellitePath = new THREE.Group();
      satellitePath.rotation.x = Math.PI / 2;
      satellite.position.set(spec.radius, 0, 0);
      satellitePath.add(satellite);
      orbit.add(satellitePath);
      orbiters.push({ group: satellitePath, speed: spec.speed });
    });

    const starPositions = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      const angle = index * 2.39996;
      const radius = 2.8 + (index % 17) * 0.13;
      starPositions[index * 3] = Math.cos(angle) * radius;
      starPositions[index * 3 + 1] = Math.sin(angle * 1.37) * radius * 0.72;
      starPositions[index * 3 + 2] = -1.4 - (index % 9) * 0.2;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: '#8FA9B8', size: 0.018, transparent: true, opacity: 0.7 }),
    );
    scene.add(stars);

    let frame = 0;
    let animationFrame = 0;
    const pointer = { x: 0, y: 0 };
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 500 ? 7.3 : width < 800 ? 6.8 : 6.4;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.28;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.18;
    };
    const onPointerLeave = () => { pointer.x = 0; pointer.y = 0; };
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave);

    const render = () => {
      frame += 1;
      if (!reducedMotion) {
        globe.rotation.y += 0.0017;
        globe.rotation.x += (pointer.y - globe.rotation.x) * 0.018;
        orbitalGroup.rotation.y += 0.0014;
        orbiters.forEach(orbiter => { orbiter.group.rotation.y += orbiter.speed * 0.008; });
        stars.rotation.z = Math.sin(frame * 0.001) * 0.018;
      }
      renderer.render(scene, camera);
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
      earthTexture?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={sceneRef} className="playdex-globe" role="img" aria-label="A rotating Earth encircled by cyan, yellow, and silver orbital paths">
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="playdex-globe-caption">SPORT CONNECTS US</span>
    </div>
  );
}