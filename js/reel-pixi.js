const obras = [
    { img: "img/reel-1.jpg", titulo: "ROCKING HORSE GLITTERED", subtitulo: "NEW INSTRUMENTAL ALBUM!", link: "games.html" },
    { img: "img/reel-2.jpg", titulo: "MY MUSIC CHANNEL", subtitulo: "FIND ALL MY COMPOSITIONS", link: "music.html" },
    { img: "img/reel-3.jpg", titulo: "PIRATAS ZORRETES", subtitulo: "MY STORYTELLING & COMEDY VIDEOS", link: "books.html" }
];

let indiceActual = 0;
let isHovered = false;
const contenedor = document.getElementById('canvas-reel');
const reelDiv = document.getElementById('reel');

const app = new PIXI.Application({
    resizeTo: contenedor,
    backgroundAlpha: 0,
    antialias: true,
    hello: false
});
contenedor.appendChild(app.view);

let character = null;
let backgroundSprite = null;
let texturasCargadas = [];

reelDiv.addEventListener('mouseenter', () => isHovered = true);
reelDiv.addEventListener('mouseleave', () => isHovered = false);

async function initPixi() {
    try {
        const spineLib = window.PIXI_SPINE || PIXI.spine;
        if (!spineLib) throw new Error("Plugin Spine no detectado.");

        for (const obra of obras) {
            texturasCargadas.push(await PIXI.Assets.load(obra.img));
        }

        backgroundSprite = new PIXI.Sprite(texturasCargadas[0]);
        backgroundSprite.anchor.set(0.5);
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
        character.scale.set(1);
        
        const anim = character.spineData.animations.find(a => a.name === 'idle') ? 'idle' : character.spineData.animations[0].name;
        character.state.setAnimation(0, anim, true);

        app.stage.addChild(character);

        window.addEventListener('resize', ajustarEscena);
        ajustarEscena();
        updateUI();

        setInterval(cambiarObra, 5000);

    } catch (e) {
        console.error("Error en Pixi:", e.message);
    }
}

function ajustarEscena() {
    if (!backgroundSprite) return;
    
    const { width, height } = app.screen;
    backgroundSprite.x = width / 2;
    backgroundSprite.y = height / 2;
    
    const ratio = Math.max(width / backgroundSprite.texture.width, height / backgroundSprite.texture.height);
    backgroundSprite.scale.set(ratio);

    if (character) {
        character.x = width / 2;
        character.y = height; 
    }
}

function updateUI() {
    document.getElementById('reel-title').textContent = obras[indiceActual].titulo;
    document.getElementById('reel-subtitle').textContent = obras[indiceActual].subtitulo;
    document.getElementById('reel-link').href = obras[indiceActual].link;
}

function cambiarObra() {
    if (isHovered) return;
    reelDiv.style.transition = "opacity 0.4s";
    reelDiv.style.opacity = 0;
    setTimeout(() => {
        indiceActual = (indiceActual + 1) % obras.length;
        backgroundSprite.texture = texturasCargadas[indiceActual];
        ajustarEscena();
        updateUI();
        reelDiv.style.opacity = 1;
    }, 400);
}

initPixi();