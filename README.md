## ThreeJs Environment (Water & Sky)

The aim of the project is to provide a realistic environment for your threejs projects. It consists of an 'Environment' object that renders a skydome and a water plane with realistic shaders that react to terrain and objects.
It is able to render the water with environment reflections and refractions as well as projected caustics in submerged objects. The sky can be updated for every time of the day since dawn to dusk and night.

You provide all the textures needed:
* Water normal
* Water foam
* Ocean floor
* Water caustics
* Night sky stars
* Moon
* Sun corona

### Usage

```javascript
var camera, scene, renderer, environment;

init();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.set(20, 20, 20)

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
	document.body.appendChild( renderer.domElement );

    var sunCoronaTexture = new THREE.TextureLoader().load( 'textures/sun-corona-texture.jpg' );
    var waterNormalTexture = new THREE.TextureLoader().load( 'textures/water-normal-texture.jpg' );
    var waterFoamTexture = new THREE.TextureLoader().load( 'textures/water-foam-texture.jpg' );
    var groundTexture = new THREE.TextureLoader().load( 'textures/ground-texture.jpg' );
    var causticsTexture = new THREE.TextureLoader().load( 'textures/water-caustics-texture.jpg' );
    var starsTexture = new THREE.TextureLoader().load( 'textures/stars-texture.jpg' );
    var moonTexture = new THREE.TextureLoader().load( 'textures/moon-texture.jpg' );

    environment = new THREEx.Environment(renderer, scene, camera, 5000, 100, 0, -100, {
        sunCorona: sunCoronaTexture,
        waterNormal: waterNormalTexture,
        waterFoam: waterFoamTexture,
        ground: groundTexture,
        caustics: causticsTexture,
        stars: starsTexture,
        moon: moonTexture
    });
    scene.add(environment);

    const periodsReference = [
            0,      // 0h
            300,    // 5h
            360,    // 6h
            375,    // 6.30h
            380,    // 6.35h
            480,    // 8h
            600,    // 10h
            720,    // 12h
            1200,    // 20h
            1260,    // 21h
            1275,    // 21.15h
            1320,   // 22h
            1350,   // 22.30h
            1440    // 24h
        ];

    // accepts the number of minutes of the day (between 0 - 1440 minutes) (0h - 24h)
    environment.setTime(720); // set time to 12h
}

function animation( time ) {

    // update environment
    environment.update(time);

    renderer.render( scene, camera );

}
```



### WARNING: It does not yet support the most recent Three.js version. In the future it will be supported, but for now, use the version provided in the '/vendor' folder. 
