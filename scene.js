// === scene.js ===
// particle field that morphs between formations tied to scroll position,
// plus a wireframe icosahedron that orbits and reacts to mouse position.

(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('scene-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 26;

  // ---- color tokens (matching CSS) ----
  const COL_SAGE = new THREE.Color(0x7c9885);
  const COL_RUST = new THREE.Color(0xc9785c);
  const COL_TEXT = new THREE.Color(0xe8e6df);

  // ---- particle count scales w/ viewport for perf ----
  const isMobile = window.innerWidth < 760;
  const PARTICLE_COUNT = isMobile ? 1400 : 3200;

  // ---- formation generators ----
  // each returns a Float32Array of length PARTICLE_COUNT*3

  function formationSphere(count, radius){
    const arr = new Float32Array(count * 3);
    for(let i=0;i<count;i++){
      const phi = Math.acos(-1 + (2*i)/count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      arr[i*3]   = radius * Math.cos(theta) * Math.sin(phi);
      arr[i*3+1] = radius * Math.sin(theta) * Math.sin(phi);
      arr[i*3+2] = radius * Math.cos(phi);
    }
    return arr;
  }

  function formationCloud(count, spread){
    const arr = new Float32Array(count * 3);
    for(let i=0;i<count;i++){
      arr[i*3]   = (Math.random()-0.5) * spread;
      arr[i*3+1] = (Math.random()-0.5) * spread;
      arr[i*3+2] = (Math.random()-0.5) * spread * 0.6;
    }
    return arr;
  }

  function formationGrid(count, size){
    const arr = new Float32Array(count * 3);
    const side = Math.ceil(Math.sqrt(count));
    const spacing = size / side;
    for(let i=0;i<count;i++){
      const x = i % side;
      const y = Math.floor(i / side) % side;
      arr[i*3]   = (x - side/2) * spacing;
      arr[i*3+1] = (y - side/2) * spacing;
      arr[i*3+2] = (Math.random()-0.5) * 2;
    }
    return arr;
  }

  function formationHelix(count, radius, height){
    const arr = new Float32Array(count * 3);
    for(let i=0;i<count;i++){
      const t = i / count;
      const angle = t * Math.PI * 14;
      arr[i*3]   = Math.cos(angle) * radius * (0.6 + 0.4*Math.sin(t*Math.PI));
      arr[i*3+1] = (t - 0.5) * height;
      arr[i*3+2] = Math.sin(angle) * radius * (0.6 + 0.4*Math.sin(t*Math.PI));
    }
    return arr;
  }

  function formationRings(count, baseRadius){
    const arr = new Float32Array(count * 3);
    const rings = 4;
    for(let i=0;i<count;i++){
      const ring = i % rings;
      const r = baseRadius * (0.4 + ring * 0.22);
      const angle = (i / count) * Math.PI * 2 * (ring+3);
      arr[i*3]   = Math.cos(angle) * r;
      arr[i*3+1] = Math.sin(angle) * r * 0.5 + (ring-1.5)*1.2;
      arr[i*3+2] = Math.sin(angle*0.5) * 3;
    }
    return arr;
  }

  function formationScatterWide(count, spread){
    const arr = new Float32Array(count * 3);
    for(let i=0;i<count;i++){
      arr[i*3]   = (Math.random()-0.5) * spread * 1.6;
      arr[i*3+1] = (Math.random()-0.5) * spread * 0.9;
      arr[i*3+2] = (Math.random()-0.5) * spread * 0.5 - 4;
    }
    return arr;
  }

  // formations indexed to match section order: hero, about, projects, writing, path, contact
  const formations = [
    formationCloud(PARTICLE_COUNT, 30),          // hero — chaotic cloud, will assemble
    formationSphere(PARTICLE_COUNT, 11),          // about — coherent sphere (a "self")
    formationGrid(PARTICLE_COUNT, 26),            // projects — structured grid (systems/data)
    formationScatterWide(PARTICLE_COUNT, 22),     // writing — looser scatter (creative/free)
    formationHelix(PARTICLE_COUNT, 9, 22),        // path — helix (a journey, ascending)
    formationRings(PARTICLE_COUNT, 10)            // contact — orbiting rings (a return / invitation)
  ];

  // ---- geometry / material ----
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(formations[0]); // current live positions, mutated each frame
  const targetA = new Float32Array(formations[0]);
  const targetB = new Float32Array(formations[0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // per-particle color blend between sage/rust/text for visual richness
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  for(let i=0;i<PARTICLE_COUNT;i++){
    const r = Math.random();
    const c = r < 0.6 ? COL_TEXT : (r < 0.85 ? COL_SAGE : COL_RUST);
    colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.13 : 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // ---- companion wireframe object (icosahedron — many small triangles, like a faceted system) ----
  const wireGeo = new THREE.IcosahedronGeometry(4.2, 1);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x7c9885, wireframe: true, transparent: true, opacity: 0.18 });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  wireMesh.position.set(7, 0, -6);
  scene.add(wireMesh);

  const wireGeo2 = new THREE.IcosahedronGeometry(2.2, 0);
  const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xc9785c, wireframe: true, transparent: true, opacity: 0.22 });
  const wireMesh2 = new THREE.Mesh(wireGeo2, wireMat2);
  wireMesh2.position.set(-8, 3, -4);
  scene.add(wireMesh2);

  // ---- lighting (subtle, mostly for any future lit geometry) ----
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // ---- mouse / pointer tracking for parallax ----
  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- scroll-driven formation morph ----
  let scrollProgress = 0; // 0 to 1 across whole page
  let currentFormationIdx = 0;
  let morphT = 1; // 1 = fully arrived at targetB

  const sectionIds = ['hero','about','projects','writing','path','contact'];

  function getScrollSectionFloat(){
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const scrollY = window.scrollY + window.innerHeight * 0.5;
    for(let i=0;i<sections.length;i++){
      const el = sections[i];
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if(scrollY >= top && scrollY < bottom){
        const localT = (scrollY - top) / el.offsetHeight;
        return i + localT;
      }
    }
    if(scrollY < sections[0].offsetTop) return 0;
    return sections.length - 1;
  }

  let lastFormationIdx = 0;
  function updateFormationTargets(){
    const f = getScrollSectionFloat();
    const idx = Math.min(Math.floor(f), formations.length - 1);
    if(idx !== lastFormationIdx){
      targetA.set(positions); // morph from current live position
      targetB.set(formations[idx]);
      morphT = 0;
      lastFormationIdx = idx;
    }
  }

  // ---- resize ----
  function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // ---- main loop ----
  const clock = new THREE.Clock();

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if(!reducedMotion){
      updateFormationTargets();

      // ease morph progress
      morphT = Math.min(morphT + 0.018, 1);
      const ease = 1 - Math.pow(1 - morphT, 3); // cubic ease-out

      for(let i=0;i<PARTICLE_COUNT;i++){
        const ix = i*3, iy = i*3+1, iz = i*3+2;
        const ax = targetA[ix], ay = targetA[iy], az = targetA[iz];
        const bx = targetB[ix], by = targetB[iy], bz = targetB[iz];
        positions[ix] = ax + (bx-ax)*ease + Math.sin(t*0.4 + i)*0.05;
        positions[iy] = ay + (by-ay)*ease + Math.cos(t*0.35 + i)*0.05;
        positions[iz] = az + (bz-az)*ease;
      }
      geometry.attributes.position.needsUpdate = true;

      // gentle whole-field rotation
      points.rotation.y = t * 0.04;
      points.rotation.x = Math.sin(t*0.1) * 0.05;

      // wireframes drift + rotate independently
      wireMesh.rotation.x = t * 0.08;
      wireMesh.rotation.y = t * 0.12;
      wireMesh2.rotation.x = -t * 0.1;
      wireMesh2.rotation.y = t * 0.06;
    }

    // camera parallax follows mouse smoothly (kept even under reduced motion, but gentler)
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    camera.position.x = mouseX * 1.5;
    camera.position.y = -mouseY * 1.0;
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
  }

  // expose scroll progress globally for UI bar + nav, computed cheaply in interactions.js
  window.__scene = { renderer, scene, camera };

  animate();

  // signal scene ready (loader hides on this + DOMContentLoaded)
  window.__sceneReady = true;
  document.dispatchEvent(new Event('scene-ready'));
})();
