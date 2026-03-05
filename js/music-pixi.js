const obras = [
    { video: "video/reel-1.mp4", titulo: "ROCKING HORSE GLITTERED", subtitulo: "NEW INSTRUMENTAL ALBUM!", link: "games.html" },
    { img: "img/reel-2.jpg", titulo: "MY MUSIC CHANNEL", subtitulo: "FIND ALL MY COMPOSITIONS", link: "music.html" },
    { video: "video/reel-3.mp4", titulo: "PIRATAS ZORRETES", subtitulo: "MY STORYTELLING & COMEDY VIDEOS", link: "books.html" }
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

const contenedorCanvas = document.getElementById('canvas-reel-music');
const reelLink = document.getElementById('reel-link');

const appFondo = new PIXI.Application({
    width: contenedorCanvas.clientWidth,
    height: contenedorCanvas.clientHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
contenedorCanvas.appendChild(appFondo.view);

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

        const atlas = await PIXI.Assets.load('./assets/spine/rockinghorse.atlas');
        const response = await fetch('./assets/spine/rockinghorse.json');
        const skeletonDataRaw = await response.json();
        const spineData = new spineLib.SkeletonJson(new spineLib.AtlasAttachmentLoader(atlas)).readSkeletonData(skeletonDataRaw);
        character = new spineLib.Spine(spineData);
        characterShadow = new spineLib.Spine(spineData);
        const anim = character.spineData.animations[0].name;
        [character, characterShadow].forEach(c => c.state.setAnimation(0, anim, true));
        characterShadow.tint = 0x000000; characterShadow.alpha = 0;
        mainStage.addChild(characterShadow, character);

        cargarRestoDeObras();
        appFondo.ticker.add(updateLoop);
        appNotas.ticker.add(updateParticles);
        setInterval(cambiarObra, 5000);
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMoveGlobal);
        updateUI();
    } catch (e) { console.error(e); }
}

async function cargarRestoDeObras() {
    for (let i = 1; i < obras.length; i++) {
        const tex = await PIXI.Assets.load(obras[i].video || obras[i].img);
        texturasCargadas[i] = tex;
    }
}

function updateLoop(delta) {
    currentScaleMult += (targetScaleMult - currentScaleMult) * lerpSpeed;
    mainStage.position.set(appFondo.screen.width / 2, appFondo.screen.height / 2);

    if (backgroundSprite && backgroundSprite.texture) {
        const tex = backgroundSprite.texture;
        const baseScale = Math.max(appFondo.screen.width / tex.width, appFondo.screen.height / tex.height);
        backgroundSprite.scale.set(baseScale * currentScaleMult);

        if (character && indiceActual === 0) {
            character.visible = characterShadow.visible = true;
            const bS = appFondo.screen.height * 0.001;
            character.scale.set(bS);
            character.y = appFondo.screen.height / 2.5;
            characterShadow.scale.set(bS);
            characterShadow.alpha = 0.4;
            characterShadow.x = 10; characterShadow.y = character.y + 10;
        } else if (character) {
            character.visible = characterShadow.visible = false;
        }
    }
}

function onMouseMoveGlobal(e) {
    const dist = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
    if (dist > 12) {
        const p = new PIXI.Text(notasMusicales[Math.floor(Math.random() * notasMusicales.length)], {
            fill: "#ffffff", fontSize: Math.random() * 8 + 14, fontFamily: 'Arial'
        });
        p.x = e.clientX; p.y = e.clientY; p.anchor.set(0.5);
        p.vx = (Math.random() - 0.5) * 1.5; p.vy = (Math.random() - 1.8) * 1;
        p.life = 1.0;
        particleContainer.addChild(p);
        particles.push(p);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.025; p.alpha = p.life;
        if (p.life <= 0) { particleContainer.removeChild(p); particles.splice(i, 1); }
    }
}

function onResize() {
    appFondo.renderer.resize(contenedorCanvas.clientWidth, contenedorCanvas.clientHeight);
    appNotas.renderer.resize(window.innerWidth, window.innerHeight);
}

function updateUI() {
    document.getElementById('reel-title').textContent = obras[indiceActual].titulo;
    document.getElementById('reel-subtitle').textContent = obras[indiceActual].subtitulo;
    reelLink.href = obras[indiceActual].link;
}

function cambiarObra() {
    if (isHovered) return;
    indiceActual = (indiceActual + 1) % obras.length;
    if (backgroundSprite && texturasCargadas[indiceActual]) {
        backgroundSprite.texture = texturasCargadas[indiceActual];
        const s = backgroundSprite.texture.baseTexture.resource.source;
        if (s instanceof HTMLVideoElement) { s.currentTime = 0; s.play().catch(() => {}); }
    }
    updateUI();
}

reelLink.addEventListener('mouseenter', () => { isHovered = true; targetScaleMult = hoverScale; });
reelLink.addEventListener('mouseleave', () => { isHovered = false; targetScaleMult = 1; });

initPixi();