const obras = [
    { video: "video/reel-1.mp4", titulo: "ROCKING HORSE GLITTERED", subtitulo: "NEW INSTRUMENTAL ALBUM!", link: "games.html" }
];

let indiceActual = 0;
let isHovered = false;
let targetScaleMult = 1;
let currentScaleMult = 1;
const lerpSpeed = 0.2; 
const hoverScale = 1.08;

const notasMusicales = ["♪", "♫", "♩", "♬", "♭", "♮"];
let particles = [];
let lastMousePos = { x: 0, y: 0 };

const contenedorCanvas = document.getElementById('canvas-reel');
const reelLink = document.getElementById('reel-link');

const appFondo = new PIXI.Application({
    width: contenedorCanvas.clientWidth,
    height: contenedorCanvas.clientHeight * 1.5,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
contenedorCanvas.appendChild(appFondo.view);
appFondo.view.style.position = "absolute";
appFondo.view.style.bottom = "0px";
appFondo.view.style.zIndex = "1";

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

const mainStage = new PIXI.Container();
appFondo.stage.addChild(mainStage);

let character = null, characterShadow = null, backgroundSprite = null;
let texturasCargadas = new Array(obras.length).fill(null);

async function initPixi() {
    try {
        const spineLib = window.PIXI_SPINE || PIXI.spine;
        
        // Aseguramos el tamaño antes de cargar texturas
        appFondo.renderer.resize(contenedorCanvas.clientWidth, contenedorCanvas.clientHeight * 1.5);

        const primeraTex = await PIXI.Assets.load(obras[0].video || obras[0].img);
        if (obras[0].video) {
            const s = primeraTex.baseTexture.resource.source;
            s.muted = s.loop = s.playsInline = true;
            s.play().catch(() => {});
        }
        texturasCargadas[0] = primeraTex;
        backgroundSprite = new PIXI.Sprite(texturasCargadas[0]);
        backgroundSprite.anchor.set(0.5);
        mainStage.addChildAt(backgroundSprite, 0);

        // Usando tus rutas originales de assets
        const atlas = await PIXI.Assets.load('./assets/spine/rockinghorse.atlas');
        const response = await fetch('./assets/spine/rockinghorse.json');
        const skeletonDataRaw = await response.json();
        const spineData = new spineLib.SkeletonJson(new spineLib.AtlasAttachmentLoader(atlas)).readSkeletonData(skeletonDataRaw);
        
        character = new spineLib.Spine(spineData);
        characterShadow = new spineLib.Spine(spineData);
        
        const anim = character.spineData.animations[0].name;
        [character, characterShadow].forEach(c => c.state.setAnimation(0, anim, true));
        
        characterShadow.tint = 0x000000; 
        characterShadow.alpha = 0;
        
        mainStage.addChild(characterShadow, character);

        requestAnimationFrame(() => {
            contenedorCanvas.classList.add('ready');
        });

        cargarRestoDeObras();
        appFondo.ticker.add(updateLoop);
        appNotas.ticker.add(updateParticles);
        
        // Aunque haya una sola obra, mantenemos el intervalo por si agregás más después
        setInterval(cambiarObra, 5000);
        
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMoveGlobal);
        updateUI();
    } catch (e) { console.error(e); }
}

async function cargarRestoDeObras() {
    for (let i = 1; i < obras.length; i++) {
        await new Promise(r => setTimeout(r, 150));
        const tex = await PIXI.Assets.load(obras[i].video || obras[i].img);
        if (obras[i].video) {
            const s = tex.baseTexture.resource.source;
            s.muted = s.loop = s.preload = "auto";
        }
        texturasCargadas[i] = tex;
    }
}

function onMouseMoveGlobal(e) {
    const dist = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
    if (dist > 12) {
        crearNota(e.clientX, e.clientY);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
}

function crearNota(x, y) {
    const p = new PIXI.Text(notasMusicales[Math.floor(Math.random() * notasMusicales.length)], {
        fill: "#ffffff", fontSize: Math.random() * 8 + 14, fontFamily: 'Arial',
        dropShadow: true, dropShadowBlur: 4, dropShadowAlpha: 0.3
    });
    p.x = x; p.y = y; p.anchor.set(0.5);
    p.vx = (Math.random() - 0.5) * 1.5; p.vy = (Math.random() - 1.8) * 1;
    p.vRotation = (Math.random() - 0.5) * 0.1; p.life = 1.0;
    particleContainer.addChild(p);
    particles.push(p);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.rotation += p.vRotation;
        p.life -= 0.025; p.alpha = p.life;
        if (p.life <= 0) { particleContainer.removeChild(p); particles.splice(i, 1); }
    }
}

function updateLoop(delta) {
    currentScaleMult += (targetScaleMult - currentScaleMult) * lerpSpeed;
    
    const vH = appFondo.screen.height / 1.5;
    mainStage.position.set(appFondo.screen.width / 2, (appFondo.screen.height - vH) + (vH / 2));

    if (backgroundSprite && backgroundSprite.texture) {
        const tex = backgroundSprite.texture;
        const baseScale = Math.min(appFondo.screen.width / tex.width, vH / tex.height);
        
        backgroundSprite.scale.set(baseScale);

        // Si algún día ponés la obra 1, esto la hará rotar como en el main
        if (indiceActual === 1) {
            backgroundSprite.rotation += 0.0149 * delta;
        } else {
            backgroundSprite.rotation = 0; 
        }

        if (character && characterShadow && indiceActual === 0) {
            character.visible = true;
            characterShadow.visible = true;

            const bS = vH * 0.00085;
            const hP = (currentScaleMult - 1) / (hoverScale - 1);
            
            character.scale.set(bS * (1 + (0.15 * hP)));
            character.x = 0; 
            character.y = (tex.height / 2) * baseScale;

            characterShadow.scale.set(character.scale.x);
            characterShadow.alpha = hP * 0.4;
            characterShadow.x = character.x + (12 * baseScale * hP);
            characterShadow.y = character.y + (12 * baseScale * hP);
            
        } else if (character && characterShadow) { 
            character.visible = false; 
            characterShadow.visible = false;
        }
    }
}

function onResize() {
    appFondo.renderer.resize(contenedorCanvas.clientWidth, contenedorCanvas.clientHeight * 1.5);
    appNotas.renderer.resize(window.innerWidth, window.innerHeight);
}

function updateUI() {
    document.getElementById('reel-title').textContent = obras[indiceActual].titulo;
    document.getElementById('reel-subtitle').textContent = obras[indiceActual].subtitulo;
    document.getElementById('reel-link').href = obras[indiceActual].link;
}

function cambiarObra() {
    if (isHovered || obras.length <= 1) return;
    const ui = document.querySelector('.info-reel');
    if (ui) ui.style.opacity = 0;
    setTimeout(() => {
        indiceActual = (indiceActual + 1) % obras.length;
        if (indiceActual !== 0) { targetScaleMult = 1; currentScaleMult = 1; }
        if (backgroundSprite && texturasCargadas[indiceActual]) {
            backgroundSprite.texture = texturasCargadas[indiceActual];
            backgroundSprite.rotation = 0; 
            const s = backgroundSprite.texture.baseTexture.resource.source;
            if (s instanceof HTMLVideoElement) { s.currentTime = 0; s.play().catch(() => {}); }
        }
        updateUI();
        if (ui) ui.style.opacity = 1;
    }, 400);
}

reelLink.addEventListener('mouseenter', () => { isHovered = true; targetScaleMult = hoverScale; });
reelLink.addEventListener('mouseleave', () => { isHovered = false; targetScaleMult = 1; });

initPixi();