const obras = [
    { img: "img/reel-1.jpg", titulo: "ROCKING HORSE GLITTERED", subtitulo: "NEW INSTRUMENTAL ALBUM!", link: "games.html" },
    { img: "img/reel-2.jpg", titulo: "MY MUSIC CHANNEL", subtitulo: "FIND ALL MY COMPOSITIONS", link: "music.html" },
    { img: "img/reel-3.jpg", titulo: "PIRATAS ZORRETES", subtitulo: "MY STORYTELLING & COMEDY VIDEOS", link: "books.html" }
];

let indiceActual = 0;
let isHovered = false;
let targetScaleMult = 1;
let currentScaleMult = 1;

const lerpSpeed = 0.04; 
const hoverScale = 1.20; 

const contenedorCanvas = document.getElementById('canvas-reel');
const reelLink = document.getElementById('reel-link');

const app = new PIXI.Application({
    resizeTo: contenedorCanvas,
    backgroundAlpha: 0,
    antialias: true,
    hello: false
});
contenedorCanvas.appendChild(app.view);

let character = null;
let backgroundSprite = null;
let backgroundMask = null;
let texturasCargadas = [];

reelLink.addEventListener('mouseenter', () => {
    isHovered = true;
    targetScaleMult = hoverScale; 
});

reelLink.addEventListener('mouseleave', () => {
    isHovered = false;
    targetScaleMult = 1;
});

async function initPixi() {
    try {
        const spineLib = window.PIXI_SPINE || PIXI.spine;
        if (!spineLib) throw new Error("Spine Plugin not found");

        for (const obra of obras) {
            texturasCargadas.push(await PIXI.Assets.load(obra.img));
        }

        // Máscara solo para el fondo
        backgroundMask = new PIXI.Graphics();
        app.stage.addChild(backgroundMask);

        backgroundSprite = new PIXI.Sprite(texturasCargadas[0]);
        backgroundSprite.anchor.set(0.5);
        backgroundSprite.mask = backgroundMask; 
        app.stage.addChild(backgroundSprite);

        const atlas = await PIXI.Assets.load('./assets/spine/rockinghorse.atlas');
        const response = await fetch('./assets/spine/rockinghorse.json');
        const skeletonDataRaw = await response.json();

        if (skeletonDataRaw.skeleton) {
            skeletonDataRaw.skeleton.spine = "3.8.99";
        }

        const spineJsonParser = new spineLib.SkeletonJson(new spineLib.AtlasAttachmentLoader(atlas));
        const spineData = spineJsonParser.readSkeletonData(skeletonDataRaw);

        character = new spineLib.Spine(spineData);
        const anim = character.spineData.animations.find(a => a.name === 'idle') ? 'idle' : character.spineData.animations[0].name;
        character.state.setAnimation(0, anim, true);

        // Personaje sin máscara para que pueda sobresalir
        app.stage.addChild(character);

        app.ticker.add(() => {
            currentScaleMult += (targetScaleMult - currentScaleMult) * lerpSpeed;
            ajustarEscena();
        });

        window.addEventListener('resize', ajustarEscena);
        updateUI();
        setInterval(cambiarObra, 5000);

    } catch (e) {
        console.error("Pixi Error:", e);
    }
}

function ajustarEscena() {
    if (!backgroundSprite) return;
    
    const { width, height } = app.screen;

    // Área del marco real (el 100% original dentro del canvas de 140%)
    const innerW = width / 1.4;
    const innerH = height / 1.4;
    const marginX = (width - innerW) / 2;
    const marginY = (height - innerH) / 2;

    // Actualizamos la máscara para que el fondo se corte ahí
    backgroundMask.clear();
    backgroundMask.beginFill(0xffffff);
    backgroundMask.drawRect(marginX, marginY, innerW, innerH);
    backgroundMask.endFill();

    backgroundSprite.x = width / 2;
    backgroundSprite.y = height / 2;

    const ratio = Math.min(innerW / backgroundSprite.texture.width, innerH / backgroundSprite.texture.height);
    backgroundSprite.scale.set(ratio);

    if (character) {
        character.visible = (indiceActual === 0);
        character.x = width / 2;
        const mitadAltura = (character.spineData.height * ratio) / 2;
        character.y = (height / 2) + mitadAltura;
        character.scale.set(ratio * currentScaleMult);
    }
}

function updateUI() {
    const titleEl = document.getElementById('reel-title');
    const subtitleEl = document.getElementById('reel-subtitle');
    const linkEl = document.getElementById('reel-link');
    if (titleEl) titleEl.textContent = obras[indiceActual].titulo;
    if (subtitleEl) subtitleEl.textContent = obras[indiceActual].subtitulo;
    if (linkEl) linkEl.href = obras[indiceActual].link;
}

function cambiarObra() {
    if (isHovered) return;
    const reelUI = document.querySelector('.info-reel');
    if (reelUI) {
        reelUI.style.transition = "opacity 0.4s";
        reelUI.style.opacity = 0;
    }
    
    setTimeout(() => {
        indiceActual = (indiceActual + 1) % obras.length;
        if (backgroundSprite && texturasCargadas[indiceActual]) {
            backgroundSprite.texture = texturasCargadas[indiceActual];
        }
        updateUI();
        ajustarEscena();
        if (reelUI) reelUI.style.opacity = 1;
    }, 400);
}

initPixi();