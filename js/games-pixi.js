// Configuración de Notas
const notasMusicales = ["♪", "♫", "♩", "♬", "♭", "♮"];
let particles = [];
let lastMousePos = { x: 0, y: 0 };

// 1. Aplicación para el rastro (Trail) - Capa Superior
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

// 2. Inicialización
function initTrail() {
    try {
        appNotas.ticker.add(updateParticles);
        window.addEventListener('mousemove', onMouseMoveGlobal);
        window.addEventListener('resize', onResize);
        
        console.log("Trail musical inicializado en Games.");
    } catch (e) { 
        console.error("Error inicializando Pixi Trail:", e); 
    }
}

// 3. Lógica del Rastro
function onMouseMoveGlobal(e) {
    const dist = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
    // Solo crea nota si el mouse se movió lo suficiente (evita sobrecarga)
    if (dist > 12) {
        crearNota(e.clientX, e.clientY);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
}

function crearNota(x, y) {
    const p = new PIXI.Text(notasMusicales[Math.floor(Math.random() * notasMusicales.length)], {
        fill: "#ffffff", 
        fontSize: Math.random() * 8 + 14, 
        fontFamily: 'Arial',
        dropShadow: true, 
        dropShadowBlur: 4, 
        dropShadowAlpha: 0.3
    });
    
    p.x = x; 
    p.y = y; 
    p.anchor.set(0.5);
    
    // Velocidades aleatorias (subida y dispersión)
    p.vx = (Math.random() - 0.5) * 1.5; 
    p.vy = (Math.random() - 1.8) * 1;
    p.vRotation = (Math.random() - 0.5) * 0.1; 
    p.life = 1.0;
    
    particleContainer.addChild(p);
    particles.push(p);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; 
        p.y += p.vy; 
        p.rotation += p.vRotation;
        p.life -= 0.025; // Velocidad de desvanecimiento
        p.alpha = p.life;
        
        if (p.life <= 0) { 
            particleContainer.removeChild(p); 
            particles.splice(i, 1); 
        }
    }
}

// 4. Redimensionamiento
function onResize() {
    appNotas.renderer.resize(window.innerWidth, window.innerHeight);
}

// Arrancamos
initTrail();