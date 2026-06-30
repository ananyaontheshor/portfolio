// === scene.js ===
// minimal ambient 3D backdrop (a few slow-drifting wireframe forms, not particles),
// plus real mouse-driven 3D tilt physics on the console object itself.

(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('scene-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 22;

  // ---- ambient wireframe geometry — sparse, slow, not the main event ----
  const shapes = [];

  function addShape(geo, color, pos, opacity){
    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    scene.add(mesh);
    shapes.push({ mesh, speed: 0.04 + Math.random()*0.05, axis: Math.random() > 0.5 ? 'x' : 'y' });
    return mesh;
  }

  addShape(new THREE.IcosahedronGeometry(3.4, 0), 0x7c9885, [10, 4, -10], 0.12);
  addShape(new THREE.OctahedronGeometry(2.4, 0), 0xc9785c, [-11, -3, -8], 0.14);
  addShape(new THREE.TetrahedronGeometry(2, 0), 0x7c9885, [8, -6, -6], 0.1);
  addShape(new THREE.IcosahedronGeometry(1.6, 1), 0xc9785c, [-9, 6, -12], 0.1);

  // a faint horizontal grid plane, suggesting a "desk surface" the console sits on conceptually
  const gridHelper = new THREE.GridHelper(60, 24, 0x262b31, 0x1a1d22);
  gridHelper.position.y = -9;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.25;
  scene.add(gridHelper);

  // ---- mouse parallax for camera ----
  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if(!reducedMotion){
      shapes.forEach(s => {
        s.mesh.rotation.x += 0.0015 * (s.axis === 'x' ? 1.6 : 1);
        s.mesh.rotation.y += 0.0015 * (s.axis === 'y' ? 1.6 : 1);
        s.mesh.position.y += Math.sin(t * s.speed) * 0.0025;
      });
    }

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    camera.position.x = mouseX * 1.2;
    camera.position.y = -mouseY * 0.8;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  window.__sceneReady = true;
  document.dispatchEvent(new Event('scene-ready'));
})();

// ---- console 3D tilt physics (real perspective transform, driven by mouse position relative to the object) ----
(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reducedMotion) return;

  const consoleObj = document.getElementById('console-obj');
  if(!consoleObj) return;

  let targetRotX = 0, targetRotY = 0, curRotX = 0, curRotY = 0;
  let isHovering = false;

  consoleObj.addEventListener('mousemove', (e) => {
    const rect = consoleObj.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotY = x * 10;
    targetRotX = -y * 8;
    isHovering = true;
  });
  consoleObj.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRotX = 0; targetRotY = 0;
  });

  function tick(){
    curRotX += (targetRotX - curRotX) * 0.08;
    curRotY += (targetRotY - curRotY) * 0.08;
    consoleObj.style.transform = `rotateX(${curRotX}deg) rotateY(${curRotY}deg)`;
    requestAnimationFrame(tick);
  }
  tick();
})();
