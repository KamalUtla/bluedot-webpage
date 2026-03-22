(function () {
  // ── Three.js Particle Network ──
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.01,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x3a8eed,
    size: 0.15,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x3a8eed,
    transparent: true,
    opacity: 0.08,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);

    const pos = geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      if (Math.abs(pos[i * 3]) > 30) velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 20) velocities[i].y *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 15) velocities[i].z *= -1;
    }

    geometry.attributes.position.needsUpdate = true;

    const linePositions = [];
    const threshold = 8;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < threshold) {
          linePositions.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
        }
      }
    }

    lineGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
    lines.rotation.y += 0.0005;
    lines.rotation.x += 0.0002;

    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Flowchart scroll animation ──
  const flowchart = document.getElementById('flowchart');
  const flowNodes = document.querySelectorAll('.flow-node');
  const flowLines = document.querySelectorAll('.flow-line');

  function resetFlowAnimations() {
    flowNodes.forEach((node) => {
      node.style.animation = 'none';
      node.offsetHeight;
    });
    flowLines.forEach((line) => {
      line.style.animation = 'none';
      line.offsetHeight;
    });
  }

  function playFlowAnimations() {
    resetFlowAnimations();
    flowNodes.forEach((node, i) => {
      node.style.animation = `nodeIn 0.6s ease ${0.1 + i * 0.2}s forwards`;
    });
    flowLines.forEach((line, i) => {
      line.style.animation = `drawLine 0.8s ease ${0.2 + i * 0.2}s forwards`;
    });
  }

  resetFlowAnimations();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playFlowAnimations();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(flowchart);

  // ── Waitlist Form ──
  const form = document.getElementById('waitlist-form');
  const formSuccess = document.getElementById('form-success');
  const toastOverlay = document.getElementById('toast-overlay');
  const toastEmail = document.getElementById('toast-email');
  const toastClose = document.getElementById('toast-close');

  function showToast(email) {
    toastEmail.textContent = `We'll reach out to ${email} when it's your turn.`;
    toastOverlay.style.display = 'flex';
    setTimeout(() => toastOverlay.classList.add('visible'), 10);
  }

  function hideToast() {
    toastOverlay.classList.remove('visible');
    setTimeout(() => { toastOverlay.style.display = 'none'; }, 300);
  }

  toastClose.addEventListener('click', hideToast);
  toastOverlay.addEventListener('click', (e) => {
    if (e.target === toastOverlay) hideToast();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    if (email) {
      form.style.display = 'none';
      formSuccess.style.display = 'flex';
      showToast(email);
    }
  });

  // ── Smooth scroll for nav CTA ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
