# 🌌 Voice-Command Cosmic Nebula

An immersive, high-performance 3D particle engine built with **Three.js**. This project transforms a sentient cloud of 30,000 particles into various geometric and organic forms using real-time **Voice Recognition** and **Audio Frequency Analysis**.

---

## 🚀 Key Features

* **Vocal Morphing**: Transition between 10+ complex 3D shapes using the Web Speech API.
* **Audio-Reactive Dynamics**: Particle jitter and "Bloom" glow intensity are synchronized to your voice or background music.
* **Mathematical Geometries**:
    * **Full Moon**: Spherical point distribution.
    * **Horizontal DNA**: Double-helix spiral math.
    * **Gold Pyramid**: Solid-volume barycentric tetrahedron.
* **Cinematic Rendering**: Uses `UnrealBloomPass` for a high-end holographic glow and additive blending for deep space aesthetics.

---

## 🛠️ Tech Stack

* **Core**: [Three.js](https://threejs.org/) (WebGL)
* **APIs**: 
    * `Web Speech API` (SpeechRecognition)
    * `Web Audio API` (AnalyserNode)
* **Framework**: Vanilla JavaScript (ES6 Modules)
* **Styling**: CSS3 Glassmorphism

---

## 🎙️ Voice Commands

Once the engine is initialized, speak any of the following keywords:

| Keyword | Resulting Shape | Color Theme |
| :--- | :--- | :--- |
| **"Heart"** | Refined Parametric Heart | Neon Red |
| **"Moon"** | 3D Sphere | Celestial White |
| **"DNA"** | Horizontal Double Helix | Cyan / Teal |
| **"Pyramid"** | Solid Tetrahedron | Liquid Gold |
| **"Sun"** | Exploding Star | Solar Yellow |
| **"Ring"** | 3D Torus | Chrome Silver |
| **"Cloud"** | Volumetric Nebula | Aqua Marine |
| **"Flower"** | Rose Curve | Pink |
| **"Cake"** | 3D Cylinder | Earthy Brown |
| **"Galaxy"** | Random Particle Field | Cosmic Blue |

---

## 📥 Installation

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/your-username/voice-galaxy.git](https://github.com/your-username/voice-galaxy.git)
    ```
2.  **File Structure**:
    Ensure the following files are in the same directory:
    * `index.html`
    * `main.js`
    * `styles.css`

3.  **Run via Local Server**:
    Because the browser requires a "Secure Context" for Microphone access, you must run this via a server (not just double-clicking the file).
    * **VS Code**: Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
    * **Python**: Run `python -m http.server 8000` in your terminal.

---

## 🎮 How to Use

1.  Open the application in **Google Chrome** (recommended for best speech support).
2.  Click **"INITIALIZE ENGINE"** to start the audio and visual context.
3.  Say **"DNA"** or any other command to see the nebula morph.
4.  Use the **"COMMANDS"** button in the top-right corner to toggle the menu overlay.
5.  **Interact**: Click and drag your mouse to rotate the galaxy in 3D space.

---

## ⚠️ Troubleshooting

* **Mic Not Working**: Ensure you have granted microphone permissions in the browser address bar.
* **Not Morphing**: Check the **Console (F12)**. If the browser is mishearing your commands, it will print `I heard: [word]`. You can add common misheard words to the `main.js` logic.
* **Blank Screen**: Ensure you are connected to the internet to load the Three.js libraries from the CDN.

---

## 📜 License

This project is open-source and available under the **MIT License**.
