import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, composer, bloom, points, analyzer, dataArray;
let particles = 30000;
let currentTargetColor = new THREE.Color(0x00eaff);
let lerpSpeed = 0.04;

// --- 1. The Shapes You Liked (Updated Moon/DNA/Diamond) ---
function getShapePoints(type, count) {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = Math.random() * Math.PI * 2;
        const u = Math.random();

        if (type === 'heart') {
            const scale = 1.3;
            pts[i3] = scale * (16 * Math.pow(Math.sin(t), 3));
            pts[i3+1] = scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            pts[i3+2] = (Math.random() - 0.5) * 3;
        } 
        else if (type === 'moon') {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            const r = 22;
            pts[i3] = r * Math.sin(phi) * Math.cos(theta);
            pts[i3+1] = r * Math.sin(phi) * Math.sin(theta);
            pts[i3+2] = r * Math.cos(phi);
        } 
        else if (type === 'dna') {
            const w = (i / count) * 80 - 40;
            const angle = w * 0.4;
            const side = (i % 2 === 0) ? 1 : -1;
            pts[i3] = w;
            pts[i3+1] = Math.cos(angle) * 12 * side;
            pts[i3+2] = Math.sin(angle) * 12 * side;
        } 
        else if (type === 'diamond') {
            const r = 25;
            const rand = Math.random();
            if(rand < 0.33) {
                pts[i3] = (Math.random() - 0.5) * r;
                pts[i3+1] = (r - Math.abs(pts[i3])) * (Math.random() > 0.5 ? 1 : -1);
                pts[i3+2] = 0;
            } else if(rand < 0.66) {
                pts[i3] = 0;
                pts[i3+1] = (Math.random() - 0.5) * r;
                pts[i3+2] = (r - Math.abs(pts[i3+1])) * (Math.random() > 0.5 ? 1 : -1);
            } else {
                pts[i3] = (Math.random() - 0.5) * r;
                pts[i3+1] = 0;
                pts[i3+2] = (r - Math.abs(pts[i3])) * (Math.random() > 0.5 ? 1 : -1);
            }
        }
        else if (type === 'sun') {
            const r = 18 + Math.random() * 8;
            const ph = Math.acos(2 * Math.random() - 1);
            const th = Math.random() * Math.PI * 2;
            pts[i3] = r * Math.sin(ph) * Math.cos(th);
            pts[i3+1] = r * Math.sin(ph) * Math.sin(th);
            pts[i3+2] = r * Math.cos(ph);
        } 
        else if (type === 'ring') {
            const R = 25, rInner = 2;
            pts[i3] = (R + rInner * Math.cos(t)) * Math.cos(u * Math.PI * 2);
            pts[i3+1] = (R + rInner * Math.cos(t)) * Math.sin(u * Math.PI * 2);
            pts[i3+2] = rInner * Math.sin(t);
        } 
        else if (type === 'cloud') {
            pts[i3] = (Math.random() - 0.5) * 80;
            pts[i3+1] = (Math.random() - 0.5) * 30 + 10;
            pts[i3+2] = (Math.random() - 0.5) * 40;
        } 
        else if (type === 'flower') {
            const r = 25 * Math.sin(6 * t);
            pts[i3] = r * Math.cos(t);
            pts[i3+1] = r * Math.sin(t);
            pts[i3+2] = (Math.random() - 0.5) * 5;
        } 
        else if (type === 'cake') {
            const r = 18; const h = (i / count) * 20;
            pts[i3] = r * Math.cos(t);
            pts[i3+1] = h - 10;
            pts[i3+2] = r * Math.sin(t);
        } 
        else { // Galaxy
            pts[i3] = (Math.random() - 0.5) * 150;
            pts[i3+1] = (Math.random() - 0.5) * 150;
            pts[i3+2] = (Math.random() - 0.5) * 150;
        }
    }
    return pts;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 70;
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particles * 3);
    const tar = new Float32Array(particles * 3);
    const col = new Float32Array(particles * 3);
    
    const initialPos = getShapePoints('galaxy', particles);
    pos.set(initialPos); tar.set(initialPos);

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('target', new THREE.BufferAttribute(tar, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.28, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    scene.add(points);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer.addPass(bloom);
    
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    let avg = 0, bass = 0;
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
        const echo = avg * 2.5;

        pos[i3] += (tar[i3] - pos[i3]) * lerpSpeed + (Math.random() - 0.5) * echo;
        pos[i3+1] += (tar[i3+1] - pos[i3+1]) * lerpSpeed + (Math.random() - 0.5) * echo;
        pos[i3+2] += (tar[i3+2] - pos[i3+2]) * lerpSpeed;

        const c = new THREE.Color().set(currentTargetColor);
        col[i3] += (c.r - col[i3]) * 0.1;
        col[i3+1] += (c.g - col[i3+1]) * 0.1;
        col[i3+2] += (c.b - col[i3+2]) * 0.1;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    bloom.strength = 1.2 + (bass * 2.5);
    points.rotation.y += 0.003 + (avg * 0.04);
    composer.render();
}

function updateGalaxy(shape, hex) {
    const newPts = getShapePoints(shape, particles);
    points.geometry.attributes.target.array.set(newPts);
    points.geometry.attributes.target.needsUpdate = true;
    currentTargetColor.setHex(hex);
}

// --- VOICE RECOGNITION (FIXED) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
        const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
        console.log("Browser heard:", cmd); // CHECK YOUR CONSOLE (F12) TO SEE THIS

        if (cmd.includes('heart')) updateGalaxy('heart', 0xff0000);
        else if (cmd.includes('moon')) updateGalaxy('moon', 0xffffff);
        else if (cmd.includes('dna') || cmd.includes('helix')) updateGalaxy('dna', 0x00ffcc);
        else if (cmd.includes('diamond')) updateGalaxy('diamond', 0x00eaff);
        else if (cmd.includes('sun')) updateGalaxy('sun', 0xffcc00);
        else if (cmd.includes('ring')) updateGalaxy('ring', 0xc0c0c0);
        else if (cmd.includes('cloud')) updateGalaxy('cloud', 0x00ffcc);
        else if (cmd.includes('flower')) updateGalaxy('flower', 0xff66cc);
        else if (cmd.includes('cake')) updateGalaxy('cake', 0x8b4513);
        else if (cmd.includes('galaxy')) updateGalaxy('galaxy', 0x00eaff);
    };

    // SELF-HEALING: Restart if it stops listening
    recognition.onend = () => {
        console.log("Recognition ended, restarting...");
        recognition.start();
    };

    document.getElementById('audioBtn').addEventListener('click', async () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            analyzer = audioCtx.createAnalyser();
            source.connect(analyzer);
            dataArray = new Uint8Array(analyzer.frequencyBinCount);
            
            recognition.start();
            document.getElementById('ui').style.display = 'none';
            init();
        } catch (err) {
            alert("Microphone access is required for voice commands!");
        }
    });
}
