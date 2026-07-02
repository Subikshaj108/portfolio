/* ===================================================
   SUBIKSHA — APP.JS
   Three.js 3D + Cursor + Scroll + Interactions
=================================================== */

'use strict';

// ─── Cursor ────────────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button, .glass-card, input, textarea, select').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

// ─── Noise Background ──────────────────────────────
(function createNoise() {
  const canvas = document.getElementById('noiseBg');
  const ctx    = canvas.getContext('2d');
  canvas.width  = 256;
  canvas.height = 256;

  function genNoise() {
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  genNoise();
})();

// ─── Navbar Scroll ─────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── Hamburger Menu ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '70px';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'rgba(8,8,13,0.98)';
  navLinks.style.padding = '1.5rem var(--container-px)';
  navLinks.style.backdropFilter = 'blur(20px)';
  navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
  navLinks.style.gap = '0.25rem';
  navLinks.style.zIndex = '999';
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { navLinks.style.display = 'none'; });
});

// ─── Scroll Reveal ─────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
        // Trigger skill bars
        if (entry.target.classList.contains('skill-category')) {
          entry.target.querySelectorAll('.skill-fill').forEach(bar => {
            bar.style.width = bar.style.getPropertyValue('--w') || getComputedStyle(bar).getPropertyValue('--w');
          });
        }
      }, i * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Count-Up Animation ────────────────────────────
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(el => {
        const target = +el.dataset.count;
        let current  = 0;
        const step   = Math.ceil(target / 40);
        const timer  = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current;
        }, 40);
      });
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.getElementById('heroStats');
if (heroStats) countObserver.observe(heroStats);

// ─── THREE.JS Hero 3D Shape ────────────────────────
(function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const neonLight = new THREE.PointLight(0x00c8ff, 4, 12);
  neonLight.position.set(3, 3, 3);
  scene.add(neonLight);

  const limeLight = new THREE.PointLight(0xb8ff57, 3, 10);
  limeLight.position.set(-3, -2, 2);
  scene.add(limeLight);

  const purpleLight = new THREE.PointLight(0x7c3aed, 2, 8);
  purpleLight.position.set(0, 0, -3);
  scene.add(purpleLight);

  // Main abstract shape — Icosahedron
  const geo = new THREE.IcosahedronGeometry(1.8, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0a0a14,
    metalness: 0.9,
    roughness: 0.1,
    wireframe: false,
    envMapIntensity: 1.5,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00c8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 1), wireMat);
  scene.add(wireMesh);

  // Inner glowing sphere
  const innerGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x00c8ff,
    transparent: true,
    opacity: 0.04,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerMesh);

  // Outer ring
  const ringGeo = new THREE.TorusGeometry(2.4, 0.015, 8, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00c8ff,
    transparent: true,
    opacity: 0.25,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 4;
  scene.add(ringMesh);

  // Second ring (lime)
  const ring2Geo = new THREE.TorusGeometry(2.8, 0.01, 8, 128);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xb8ff57,
    transparent: true,
    opacity: 0.15,
  });
  const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2Mesh.rotation.x = -Math.PI / 6;
  ring2Mesh.rotation.y = Math.PI / 5;
  scene.add(ring2Mesh);

  // Particle field
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0x00c8ff,
    size: 0.04,
    transparent: true,
    opacity: 0.5,
  });
  const particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);

  // Position group to right side of screen
  const group = new THREE.Group();
  group.add(mesh);
  group.add(wireMesh);
  group.add(innerMesh);
  group.add(ringMesh);
  group.add(ring2Mesh);
  scene.remove(mesh, wireMesh, innerMesh, ringMesh, ring2Mesh);
  scene.add(group);
  group.position.set(2.5, 0, 0);

  // Mouse parallax
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  document.addEventListener('mousemove', e => {
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.8;
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * -0.5;
  });

  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    // Smooth mouse follow
    currentRotX += (targetRotX - currentRotX) * 0.05;
    currentRotY += (targetRotY - currentRotY) * 0.05;

    // Organic float
    group.rotation.x = currentRotX + Math.sin(t * 0.7) * 0.1;
    group.rotation.y = currentRotY + t * 0.15;
    group.position.y = Math.sin(t * 0.8) * 0.2;

    // Rings counter-rotate
    ringMesh.rotation.z  += 0.003;
    ring2Mesh.rotation.z -= 0.002;

    // Pulsing light
    neonLight.intensity = 3 + Math.sin(t * 2) * 1;
    limeLight.intensity = 2 + Math.cos(t * 1.5) * 0.8;

    // Particle drift
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
})();

// ─── Card Shine Parallax ───────────────────────────
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const x      = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y      = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

    card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;

    const shine = card.querySelector('.card-shine');
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${(x + 1) * 50}% ${(y + 1) * 50}%, rgba(255,255,255,0.06), transparent 60%)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── Contact Form ──────────────────────────────────
const form    = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('formSubmitBtn');
    btn.querySelector('span').textContent = 'Sending...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      btn.querySelector('span').textContent = 'Message Sent!';
      btn.style.opacity = '1';
      form.reset();
      success.classList.add('show');
      setTimeout(() => {
        success.classList.remove('show');
        btn.querySelector('span').textContent = 'Send Message';
        btn.style.pointerEvents = 'auto';
      }, 4000);
    }, 1500);
  });
}

// ─── Active Nav Link on Scroll ─────────────────────
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// Active nav style
const style = document.createElement('style');
style.textContent = `.nav-link.active { color: var(--text-primary) !important; } .nav-link.active::after { width: 60% !important; }`;
document.head.appendChild(style);

// ─── Page Load Entrance ────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
