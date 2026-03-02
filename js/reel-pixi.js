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
const hoverScale = 1.08; // Antes era 1.15, ahora es más sutil

const contenedorCanvas = document.getElementById('canvas-reel');
const reelLink = document.getElementById('reel-link');

const app = new PIXI.Application({
    width: contenedorCanvas.clientWidth,
    height: contenedorCanvas.clientHeight * 1.5, 
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});

contenedorCanvas.appendChild(app.view);

app.view.style.position = "absolute";
app.view.style.bottom = "0px"; 
app.view.style.height = "150%"; 

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
            
            const visibleHeight = app.screen.height / 1.5;
            const offsetUp = app.screen.height - visibleHeight;
            
            mainStage.position.set(app.screen.width / 2, offsetUp + (visibleHeight / 2));

            if (backgroundSprite) {
                const tex = backgroundSprite.texture;
                const scaleFactor = Math.min(app.screen.width / tex.width, visibleHeight / tex.height);
                backgroundSprite.scale.set(scaleFactor);

                if (character && indiceActual === 0) {
                    character.visible = characterShadow.visible = true;
                    
                    // Ajuste: Reducimos el extraGrow de 0.3 a 0.18 para un efecto menos brusco
                    const extraGrow = 0.18; 
                    const hoverProgress = (currentScaleMult - 1) / (hoverScale - 1);
                    const finalScale = scaleFactor * (1 + (extraGrow * hoverProgress));
                    
                    character.scale.set(finalScale);
                    characterShadow.scale.set(finalScale);

                    character.x = 0;
                    character.y = (tex.height / 2) * scaleFactor;

                    characterShadow.alpha = hoverProgress * 0.4;
                    const shadowOff = hoverProgress * 15 * scaleFactor;
                    characterShadow.position.set(character.x + shadowOff, character.y + shadowOff);
                } else if (character) {
                    character.visible = characterShadow.visible = false;
                }
            }
        });

        window.addEventListener('resize', () => {
            const w = contenedorCanvas.clientWidth;
            const h = contenedorCanvas.clientHeight;
            app.renderer.resize(w, h * 1.5);
            app.view.style.height = "150%";
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