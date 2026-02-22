import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, composer, bloom, points, analyzer, dataArray;
let particles = 30000;
let currentTargetColor = new THREE.Color(0x00eaff);
let lerpSpeed = 0.03;

// --- 1. Shape Mathematics ---
function getShapePoints(type, count) {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = Math.random() * Math.PI * 2;
        const u = Math.random();

        if (type === 'heart') {
            pts[i3] = 16 * Math.pow(Math.sin(t), 3);
            pts[i3+1] = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            pts[i3+2] = (Math.random() - 0.5) * 5;
        } else if (type === 'moon') {
            const r = 20, phi = (Math.random() - 0.5) * Math.PI;
            pts[i3] = r * Math.cos(phi) - 8;
            pts[i3+1] = r * Math.sin(phi);
            pts[i3+2] = (Math.random() - 0.5) * 10;
        } else if (type === 'star') {
            const rot = i % 5 * (Math.PI * 2 / 5);
            const r = (i % 2 === 0) ? 25 : 10;
            pts[i3] = r * Math.cos(rot);
            pts[i3+1] = r * Math.sin(rot);
            pts[i3+2] = (Math.random() - 0.5) * 5;
        } else if (type === 'sun') {
            const r = 18 + Math.random() * 5;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            pts[i3] = r * Math.sin(ph) * Math.cos(th);
            pts[i3+1] = r * Math.sin(ph) * Math.sin(th);
            pts[i3+2] = r * Math.cos(ph);
        } else if (type === 'ring') {
            const R = 22, rInner = 2;
            pts[i3] = (R + rInner * Math.cos(t)) * Math.cos(u * Math.PI * 2);
            pts[i3+1] = (R + rInner * Math.cos(t)) * Math.sin(u * Math.PI * 2);
            pts[i3+2] = rInner * Math.sin(t);
        } else if (type === 'cloud') {
            pts[i3] = (Math.random() - 0.5) * 60;
            pts[i3+1] = (Math.random() - 0.5) * 25 + 15;
            pts[i3+2] = (Math.random() - 0.5) * 40;
        } else if (type === 'bird') {
            const x = (Math.random() - 0.5) * 50;
            pts[i3] = x;
            pts[i3+1] = Math.abs(x) * 0.4 + Math.sin(t) * 2;
            pts[i3+2] = Math.sin(x * 0.1) * 10;
        } else if (type === 'flower') {
            const r = 20 * Math.sin(6 * t);
            pts[i3] = r * Math.cos(t);
            pts[i3+1] = r * Math.sin(t);
            pts[i3+2] = (Math.random() - 0.5) * 5;
        } else if (type === 'cake') {
            const r = 15; const h = (i / count) * 15;
            pts[i3] = r * Math.cos(t);
            pts[i3+1] = h - 7;
            pts[i3+2] = r * Math.sin(t);
        } else { // Galaxy
            pts[i3] = (Math.random() - 0.5) * 150;
            pts[i3+1] = (Math.random() - 0.5) * 150;
            pts[i3+2] = (Math.random() - 0.5) * 150;
        }
    }
    return pts;
}

// --- 2. Initialize Function ---
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particles * 3);
    const tar = new Float32Array(particles * 3);
    const col = new Float32Array(particles * 3);
    
    // Initial State: Random Galaxy
    const initialPos = getShapePoints('galaxy', particles);
    pos.set(initialPos); tar.set(initialPos);

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('target', new THREE.BufferAttribute(tar, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.25, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    scene.add(points);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer.addPass(bloom);
    
    animate();
}

// --- 3. Animation & Echo Logic ---
function animate() {
    requestAnimationFrame(animate);
    let bass = 0, avg = 0;
    if (analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        bass = dataArray[2] / 255;
        avg = dataArray.reduce((a, b) => a + b) / (dataArray.length * 255);
    }

    const pos = points.geometry.attributes.position.array;
    const tar = points.geometry.attributes.target.array;
    const col = points.geometry.attributes.color.array;

    for (let i = 0; i < particles; i++) {
        const i3 = i * 3;
        // Echo Environment: Jitter based on sound volume
        const echo = avg * 2.0;
        const jitterX = (Math.random() - 0.5) * echo;
        const jitterY = (Math.random() - 0.5) * echo;

        // Morphing Logic
        pos[i3] += (tar[i3] - pos[i3]) * lerpSpeed + jitterX;
        pos[i3+1] += (tar[i3+1] - pos[i3+1]) * lerpSpeed + jitterY;
        pos[i3+2] += (tar[i3+2] - pos[i3+2]) * lerpSpeed;

        // Dynamic Color Lerping
        const c = new THREE.Color().set(currentTargetColor);
        col[i3] += (c.r - col[i3]) * 0.1;
        col[i3+1] += (c.g - col[i3+1]) * 0.1;
        col[i3+2] += (c.b - col[i3+2]) * 0.1;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    bloom.strength = 1.0 + (bass * 3.0);
    points.rotation.y += 0.002 + (avg * 0.05);
    composer.render();
}

// --- 4. Voice Commands ---
function updateGalaxy(shape, hex) {
    const newPts = getShapePoints(shape, particles);
    points.geometry.attributes.target.array.set(newPts);
    points.geometry.attributes.target.needsUpdate = true;
    currentTargetColor.setHex(hex);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.onresult = (e) => {
        const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
        if (cmd.includes('heart')) updateGalaxy('heart', 0xff0000);
        if (cmd.includes('moon')) updateGalaxy('moon', 0xffffff);
        if (cmd.includes('star')) updateGalaxy('star', 0xffffff);
        if (cmd.includes('sun')) updateGalaxy('sun', 0xffcc00);
        if (cmd.includes('ring')) updateGalaxy('ring', 0xc0c0c0);
        if (cmd.includes('cloud')) updateGalaxy('cloud', 0x00ffcc);
        if (cmd.includes('bird')) updateGalaxy('bird', 0x00ff00);
        if (cmd.includes('flower')) updateGalaxy('flower', 0xff66cc);
        if (cmd.includes('cake')) updateGalaxy('cake', 0x8b4513);
        if (cmd.includes('galaxy')) updateGalaxy('galaxy', 0x00eaff);
    };

    document.getElementById('audioBtn').addEventListener('click', async () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(stream);
        analyzer = audioCtx.createAnalyser();
        source.connect(analyzer);
        dataArray = new Uint8Array(analyzer.frequencyBinCount);
        
        recognition.start();
        document.getElementById('ui').style.display = 'none';
        init();
    });
}
