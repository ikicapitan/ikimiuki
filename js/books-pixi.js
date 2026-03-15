const libros = [
    { video: "video/reel-books.mp4", titulo: "NUEVA NOVELA", subtitulo: "UN RELATO SOBRE EL DESTINO", link: "more.html" },
    { img: "img/book-reel-2.jpg", titulo: "REFLEXIONES", subtitulo: "EL ARTE DE LA SÍNTESIS", link: "#" }
];

let indiceActual = 0;
let isHovered = false;
let targetScaleMult = 1;
let currentScaleMult = 1;
const lerpSpeed = 0.1; 
const hoverScale = 1.05;

// Configuración de Trail Literario
const letrasTrail = ["A", "B", "✎", "¶", "§", "z", "!", "?", "📖"];
let particles = [];
let lastMousePos = { x: 0, y: 0 };

const contenedorCanvas = document.getElementById('canvas-reel');
const reelLink = document.getElementById('reel-link');

// 1. Aplicación para el fondo (Video/Imagen)
const appFondo = new PIXI.Application({
    width: contenedorCanvas.clientWidth,
    height: contenedorCanvas.clientHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
contenedorCanvas.appendChild(appFondo.view);
appFondo.view.style.width = "100%";
appFondo.view.style.height = "100%";

// 2. Aplicación para el Trail (Capa superior global)
const appTrail = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
document.body.appendChild(appTrail.view);
appTrail.view.style.position = "fixed";
appTrail.view.style.top = "0";
appTrail.view.style.left = "0";
appTrail.view.style.pointerEvents = "none";
appTrail.view.style.zIndex = "10000";

const particleContainer = new PIXI.Container();
appTrail.stage.addChild(particleContainer);

let backgroundSprite = null;
let texturasCargadas = [];

async function initBooks() {
    try {
        // Cargar texturas
        for (let item of libros) {
            const tex = await PIXI.Assets.load(item.video || item.img);
            texturasCargadas.push(tex);
        }

        // Setup inicial del sprite
        backgroundSprite = new PIXI.Sprite(texturasCargadas[0]);
        backgroundSprite.anchor.set(0.5);
        backgroundSprite.x = appFondo.screen.width / 2;
        backgroundSprite.y = appFondo.screen.height / 2;
        appFondo.stage.addChild(backgroundSprite);

        // Eventos
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);
        
        // Loops
        appFondo.ticker.add(updateLoop);
        appTrail.ticker.add(updateParticles);
        
        setInterval(cambiarObra, 5000);
        updateUI();

    } catch (e) { console.error("Error Pixi Books:", e); }
}

function onMouseMove(e) {
    const dist = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
    if (dist > 15) {
        crearParticula(e.clientX, e.clientY);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
}

function crearParticula(x, y) {
    const p = new PIXI.Text(letrasTrail[Math.floor(Math.random() * letrasTrail.length)], {
        fill: "#ffffff", 
        fontSize: Math.random() * 5 + 12, 
        fontFamily: 'Georgia, serif'
    });
    p.x = x; p.y = y; p.anchor.set(0.5);
    p.vx = (Math.random() - 0.5) * 1.2;
    p.vy = (Math.random() - 1.5) * 1;
    p.alpha = 0.8;
    p.life = 1.0;
    particleContainer.addChild(p);
    particles.push(p);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.02; p.alpha = p.life;
        if (p.life <= 0) {
            particleContainer.removeChild(p);
            particles.splice(i, 1);
        }
    }
}

function updateLoop() {
    currentScaleMult += (targetScaleMult - currentScaleMult) * lerpSpeed;
    if (backgroundSprite) {
        const tex = backgroundSprite.texture;