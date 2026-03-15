const notasMusicales = ["♪", "♫", "♩", "♬", "♭", "♮"];
let particles = [];
let lastMousePos = { x: 0, y: 0 };

// 1. Aplicación para el rastro (Capa Superior)
const appNotas = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
document.body.appendChild(appNotas.view);
appNotas.view.style.position = "fixed";
appNotas.view.style.top = "0";
appNotas.view.style.left = "0";
appNotas.view.style.pointerEvents = "none"; 
appNotas.view.style.zIndex = "10000";

const particleContainer = new PIXI.Container();
appNotas.stage.addChild(particleContainer);

// 2. Aplicación para el Personaje (Slot Local)
const contenedorCanvas = document.getElementById('canvas-reel');
const appPersonaje = new PIXI.Application({
    width: contenedorCanvas.clientWidth,
    height: contenedorCanvas.clientHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
contenedorCanvas.appendChild(appPersonaje.view);

const stagePersonaje = new PIXI.Container();
appPersonaje.stage.addChild(stagePersonaje);

let character = null;

// 3. Inicialización y CARGA
function init() {
    // Registramos los assets para que el plugin de Spine los reconozca
    PIXI.Assets.add({
        alias: 'horseData',
        src: './assets/spine/rockinghorse.json',
        data: { spineAtlas: './assets/spine/rockinghorse.atlas' }
    });

    // Cargamos
    PIXI.Assets.load('horseData').then((resource) => {
        console.log("Spine cargado con éxito");
        
        // Creamos el Spine usando el plugin 3.8
        character = new PIXI.spine.Spine(resource.spineData);
        
        // Seteamos la primera animación que encuentre
        const animName = character.spineData.animations[0].name;
        character.state.setAnimation(0, animName, true);
        
        stagePersonaje.addChild(character);

        // Activamos los bucles
        appPersonaje.ticker.add(updateCharacterLayout);
        appNotas.ticker.add(updateParticles);

        window.addEventListener('mousemove', onMouseMoveGlobal);
        window.addEventListener('resize', onResize);
        
    }).catch(err => {
        console.error("Error cargando el personaje:", err);
    });
}

function updateCharacterLayout() {
    if (character) {
        // Escala responsiva al contenedor
        const scale = appPersonaje.screen.height * 0.00085;
        character.scale.set(scale);
        
        // Posición: Centrado horizontal y apoyado abajo
        character.x = appPersonaje.screen.width / 2;
        character.y = appPersonaje.screen.height * 0.9;
    }
}

// --- LÓGICA DE PARTÍCULAS (Tu original de games-pixi.js) ---
function onMouseMoveGlobal(e) {
    const dist = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
    if (dist > 12) {
        crearNota(e.clientX, e.clientY);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
}

function crearNota(x, y) {
    const p = new PIXI.Text(notasMusicales[Math.floor(Math.random() * notasMusicales.length)], {
        fill: "#ffffff", fontSize: Math.random() * 8 + 14, fontFamily: 'Arial'
    });
    p.x = x; p.y = y; p.anchor.set(0.5);
    p.vx = (Math.random() - 0.5) * 1.5; 
    p.vy = (Math.random() - 1.8) * 1;
    p.life = 1.0;
    particleContainer.addChild(p);
    particles.push(p);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.025; p.alpha = p.life;
        if (p.life <= 0) {
            particleContainer.removeChild(p);
            particles.splice(i, 1);
        }
    }
}

function onResize() {
    appNotas.renderer.resize(window.innerWidth, window.innerHeight);
    appPersonaje.renderer.resize(contenedorCanvas.clientWidth, contenedorCanvas.clientHeight);
}

init();