const obras = [
    { img: "img/reel-1.jpg", titulo: "ROCKING HORSE GLITTERED", subtitulo: "NEW INSTRUMENTAL ALBUM!", link: "games.html" },
    { img: "img/reel-2.jpg", titulo: "MY MUSIC CHANNEL", subtitulo: "FIND ALL MY COMPOSITIONS", link: "music.html" },
    { img: "img/reel-3.jpg", titulo: "PIRATAS ZORRETES", subtitulo: "MY STORYTELLING & COMEDY VIDEOS", link: "books.html" }
];

let indiceActual = 0;
let isHovered = false;
let targetScaleMult = 1;
let currentScaleMult = 1;
const lerpSpeed = 0.08;
const hoverScale = 1.15;

const contenedorCanvas = document.getElementById('canvas-reel');
const reelLink = document.getElementById('reel-link');

const app = new PIXI.Application({
    resizeTo: contenedorCanvas,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
contenedorCanvas.appendChild(app.view);

const mainStage = new PIXI.Container();
app.stage.addChild(mainStage);

let character = null;
let characterShadow = null;
let backgroundSprite = null;
let texturasCargadas = [];

async function initPixi() {
    try {
        const spineLib = window.PIXI_SPINE || PIXI.spine;

        for (const obra of obras) {
            texturasCargadas.push(await PIXI.Assets.load(obra.img));
        }

        backgroundSprite = new PIXI.Sprite(texturasCargadas[0]);
        backgroundSprite.anchor.set(0.5);
        mainStage.addChild(backgroundSprite);

        const atlas = await PIXI.Assets.load('./assets/spine/rockinghorse.atlas');
        const response = await fetch('./assets/spine/rockinghorse.json');
        const skeletonDataRaw = await response.json();
        if (skeletonDataRaw.skeleton) skeletonDataRaw.skeleton.spine = "3.8.99";

        const spineJsonParser = new spineLib.SkeletonJson(new spineLib.AtlasAttachmentLoader(atlas));
        const spineData = spineJsonParser.readSkeletonData(skeletonDataRaw);

        character = new spineLib.Spine(spineData);
        characterShadow = new spineLib.Spine(spineData);
        
        const anim = character.spineData.animations.find(a => a.name === 'idle') ? 'idle' : character.spineData.animations[0].name;
        [character, characterShadow].forEach(c => c.state.setAnimation(0, anim, true));

        characterShadow.tint = 0x000000;
        characterShadow.alpha = 0;

        mainStage.addChild(characterShadow);
        mainStage.addChild(character);

        app.ticker.add(() => {
            currentScaleMult += (targetScaleMult - currentScaleMult) * lerpSpeed;
            mainStage.position.set(app.screen.width / 2, app.screen.height / 2);

            if (backgroundSprite) {
                const tex = backgroundSprite.texture;
                
                // CONTAIN: La imagen se ve completa sin cortarse
                const scaleFactor = Math.min(app.screen.width / tex.width, app.screen.height / tex.height);
                backgroundSprite.scale.set(scaleFactor);

                if (character && indiceActual === 0) {
                    character.visible = characterShadow.visible = true;
                    
                    // El personaje mantiene escala 1:1 con la imagen, más el hover
                    character.scale.set(currentScaleMult);
                    characterShadow.scale.set(currentScaleMult);

                    // POSICIÓN: El piso es el final de la textura (tex.height / 2 desde el centro)
                    character.x = 0;
                    character.y = tex.height / 2;

                    const intensity = (currentScaleMult - 1) / (hoverScale - 1);
                    characterShadow.alpha = intensity * 0.4;
                    
                    // Ajuste de sombra
                    const shadowOff = intensity * 20;
                    characterShadow.position.set(character.x + shadowOff, character.y + shadowOff);
                } else if (character) {
                    character.visible = characterShadow.visible = false;
                }
            }
        });

        window.addEventListener('resize', () => {
            app.renderer.resize(contenedorCanvas.clientWidth, contenedorCanvas.clientHeight);
        });

        updateUI();
        setInterval(cambiarObra, 5000);

    } catch (e) {
        console.error(e);
    }
}

function updateUI() {
    document.getElementById('reel-title').textContent = obras[indiceActual].titulo;
    document.getElementById('reel-subtitle').textContent = obras[indiceActual].subtitulo;
    document.getElementById('reel-link').href = obras[indiceActual].link;
}

function cambiarObra() {
    if (isHovered) return;
    const reelUI = document.querySelector('.info-reel');
    if (reelUI) reelUI.style.opacity = 0;
    
    setTimeout(() => {
        indiceActual = (indiceActual + 1) % obras.length;
        if (backgroundSprite) backgroundSprite.texture = texturasCargadas[indiceActual];
        updateUI();
        if (reelUI) reelUI.style.opacity = 1;
    }, 400);
}

reelLink.addEventListener('mouseenter', () => { isHovered = true; targetScaleMult = hoverScale; });
reelLink.addEventListener('mouseleave', () => { isHovered = false; targetScaleMult = 1; });

initPixi();