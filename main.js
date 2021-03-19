var director;
var renderer;
var scene;
var environment;
var island;
var lastTime = new Date().valueOf();
var canvas;
var assetsLoader;
var loadingScreen;
var loadingProgress;
var loadingProgressText;

/** @namespace */
var THREEx	= THREEx || {};

//#region UI controls

/**
 * Show info
 */
function showInfo() {
    infoPanel.style.display = "flex";
}

/**
 * Hide info
 */
function hideInfo() {
    infoPanel.style.display = "none";
}

/**
 * Set time
 * @param {*} event 
 */
function setTime(event) {
    if (environment) {
        environment.setTime(Number(daytime.value));
        if (daytime.value === 1440) {
            daytime.value = 0;
        }
    }
}

/**
 * Previous camera
 */
function previousCamera() {
    if (director) {
        director.previousCamera();
    }
}

/**
 * Next camera
 */
function nextCamera() {
    if (director) {
        director.nextCamera();
    }
}

//#endregion

/** 
* On init
 */
function onInit() {
    // listen to resize event
    window.addEventListener("resize", onWindowResize);

    loadingScreen = document.querySelector(".loading-screen"); 
    loadingProgress = document.querySelector(".loading-screen-progress-bar-fill"); 
    loadingProgressText = document.querySelector(".loading-screen-progress-text"); 

    // canvas
    var canvasContainer = document.querySelector(".canvas-container");
    var width = canvasContainer.offsetWidth;
    var height = canvasContainer.offsetHeight;

    canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.zIndex = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = width;
    canvas.height = height;
    canvasContainer.appendChild(canvas);

    // renderer
    renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFSoftShadowMap

    // scene
    scene = new THREE.Scene();

    // director
    director = new THREEx.Director( 1000, width / height, 0.5, 100000 );
    director.addCamera(new THREE.Vector3(200, 500, 500), new THREE.Vector3(50,0,50), false);
    director.addCamera(new THREE.Vector3(352, 160, 174), new THREE.Vector3(-281,-280,-201), false);
    director.addCamera(new THREE.Vector3(650, 50, 35), new THREE.Vector3(0,0,0), false);
    director.addCamera(new THREE.Vector3(-116, 6, 106), new THREE.Vector3(72,63,89), false);
    director.addCamera(new THREE.Vector3(-158, 53, -60), new THREE.Vector3(-33,15,56), false);
    director.addCamera(new THREE.Vector3(99, 61, -40), new THREE.Vector3(-19,23,15), false);
    director.addCamera(new THREE.Vector3(36, 19, -9), new THREE.Vector3(39,53,-6), false);
    director.addCamera(new THREE.Vector3(-90, 223, -7), new THREE.Vector3(-119, 168, 19), false);
    director.addCamera(new THREE.Vector3(184, -17, -456), new THREE.Vector3(119,7,-131), false);
    director.addCamera(new THREE.Vector3(75, 793, -23), new THREE.Vector3(70,-36,-29), false);

    // load assets
    loadAssets(() => {

        // setup environment
        setupEnvironment();

        // start animation
        animate();

        setTimeout(() => {
            stopLoadingScreen();
        }, 3000);
    });
}

/**
 * Start loading screen
 */
function startLoadingScreen() {
    loadingScreen.style.opacity = 1;
    loadingProgress.style.width = "0%";
    loadingProgressText.innerHTML = "Loading...";
}

/**
 * Start loading screen
 */
function loadingScreenProgress(progress) {
    loadingProgress.style.width = progress + "%";
    loadingProgressText.innerHTML = "Loading...";
}

/**
 * Stop loading screen
 */
function stopLoadingScreen() {
    loadingScreen.style.opacity = 0;
}

/**
 * Load assets
 */
function loadAssets(onFinish) {
    assetsLoader = new THREEx.AssetsLoader();

    assetsLoader.add("sun-corona-texture", THREEx.AssetType.Texture, "assets/textures/corona.png");
    assetsLoader.add("water-normal-texture", THREEx.AssetType.Texture, "assets/textures/waterNormal.png");
    assetsLoader.add("water-caustics-texture", THREEx.AssetType.Texture, "assets/textures/waterCaustics.png");
    assetsLoader.add("water-foam-texture", THREEx.AssetType.Texture, "assets/textures/waterFoam.png");
    assetsLoader.add("ground-texture", THREEx.AssetType.Texture, "assets/textures/ground.png");
    assetsLoader.add("stars-texture", THREEx.AssetType.Texture, "assets/textures/stars.png");
    assetsLoader.add("moon-texture", THREEx.AssetType.Texture, "assets/textures/moon.png");
    assetsLoader.add("island-scene", THREEx.AssetType.Scene3D, "assets/island.json");

    startLoadingScreen();

    assetsLoader.loadAll(function(progress) {
        // on update
        loadingScreenProgress(progress);
    },
    function() {
        // on end
        onFinish();
    },
    function() {
        // on error
    });
}

/**
 * Setup environment
 */
function setupEnvironment() {
    // environment
    environment = new THREEx.Environment(renderer, scene, director.camera, 5000, 100, 0, -100, {
        sunCorona: assetsLoader.get("sun-corona-texture"),
        waterNormal: assetsLoader.get("water-normal-texture"),
        waterFoam: assetsLoader.get("water-foam-texture"),
        ground: assetsLoader.get("ground-texture"),
        causticsTexture: assetsLoader.get("water-caustics-texture"),
        starsTexture: assetsLoader.get("stars-texture"),
        moonTexture: assetsLoader.get("moon-texture")
    });
    scene.add(environment);

    // island
    var islandScene = assetsLoader.get("island-scene");
    var objectToAdd = new Array(...islandScene.children);
    island = new THREE.Object3D();
    for (const object of objectToAdd) {
        if (object instanceof THREE.Mesh) {
            let side = THREE.FrontSide;
            let opacity = 1;
            if (object.material.transparent === true) {
                object.customDepthMaterial = new THREE.MeshDepthMaterial({
                    depthPacking: THREE.RGBADepthPacking,
                    map: object.material.map,
                    alphaTest: 0.5
                });
                side = THREE.DoubleSide;
                opacity = object.material.opacity;
            }
            object.material = new THREEx.EnvironmentPhongMaterial( {
                color: object.material.color.getHex(),
                map: object.material.map, 
                causticsMap: assetsLoader.get("water-caustics-texture"),
                opacity: opacity,
                alphaTest: 0.5,
                shininess: 0
            });
            object.material.side = side;
            object.castShadow = true;
            object.receiveShadow = true;
            island.add( object );
        }
    }

    island.position.y = -95;
    island.scale.set(2000,2000,2000);
    scene.add( island );
}

/**
 * On window resize
 */
function onWindowResize() {
    var canvasContainer = document.querySelector(".canvas-container");
    var width = canvasContainer.offsetWidth;
    var height = canvasContainer.offsetHeight;
    // update the camera aspect ration
    director.updateAspect(width / height);
    // notify the renderer of the size change
    renderer.setSize(width, height);
}

/**
 * Animate
 */
function animate() {
    // get delta time
    var currentTime = new Date().valueOf();
    var delta = currentTime - lastTime;
    lastTime = currentTime;

    // update environment
    environment.update(delta);

    // render
    renderer.render(scene, director.camera);

    // request animation frame
    requestAnimationFrame(animate);
}