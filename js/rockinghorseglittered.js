const contenedorCanvas = document.getElementById('canvas-reel');

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

let character = null;
const notasMusicales = ["♪", "♫", "♩", "♬", "♭", "♮"];
let particles = [];
let lastMousePos = { x: 0, y: 0 };

async function initPixi() {
    try {
        const spineLib = window.PIXI_SPINE || PIXI.spine;
        
        const atlas = await PIXI.Assets.load('./assets/spine/rockinghorse.atlas');
        const response = await fetch('./assets/spine/rockinghorse.json');
        const skeletonDataRaw = await response.json();
        const spineData = new spineLib.SkeletonJson(new spineLib.AtlasAttachmentLoader(atlas)).readSkeletonData(skeletonDataRaw);
        
        character = new spineLib.Spine(spineData);
        const anim = character.spineData.animations[0].name;
        character.state.setAnimation(0, anim, true);
        
        mainStage.addChild(character);

        appFondo.ticker.add(updateLoop);
        appNotas.ticker.add(updateParticles);
        
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMoveGlobal);
    } catch (e) { console.error(e); }
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
        fill: "#ffffff", fontSize: Math.random() * 8 + 14, fontFamily: 'Arial'
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

function updateLoop() {
    const vH = appFondo.screen.height / 1.5;
    mainStage.position.set(appFondo.screen.width / 2, (appFondo.screen.height - vH) + (vH / 2));

    if (character) {
        character.scale.set(vH * 0.00085);
        character.y = vH / 2.5; 
    }
}

function onResize() {
    appFondo.renderer.resize(contenedorCanvas.clientWidth, contenedorCanvas.clientHeight * 1.5);
    appNotas.renderer.resize(window.innerWidth, window.innerHeight);
}

initPixi();