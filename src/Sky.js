/**
 * Sky
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.Sky = class Sky extends THREE.Object3D {

    constructor(radius, camera, scene, sunCoronaTexture, starsTexture) {
        super();

        this.vertexShader = `
            varying vec3 vWorldPosition;
        
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `;

        this.fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            uniform float starsOffset;
            uniform sampler2D starsTexture;
            varying vec3 vWorldPosition;
        
            void main() {
                float h = normalize( vWorldPosition + offset ).y;
                vec2 coords = ((vWorldPosition.xz + 2500.0) / 5000.0 );
                coords.x += starsOffset;
                float starsIntensity = clamp(0.5 - ((topColor.x + topColor.y + topColor.z) / 3.0), 0.0, 1.0) * 6.5;
                vec3 topColorFinal = topColor + (texture2D(starsTexture, coords ).xyz * pow(h, 3.5) * starsIntensity);
                gl_FragColor = vec4( mix( bottomColor, topColorFinal, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
            }
        `;

        // consts
        const SUN_LIGHT_SHADOW_AREA = 200;
        const SUN_SHADOW_MAP_SIZE = 1024;
        const SUN_SHADOW_BIAS = -0.0001;

        // scene fog
        scene.background = new THREE.Color(0xFFFFFF);
        scene.fog = new THREE.Fog( 0xFFFFFF, 1, radius );

        starsTexture.wrapS = starsTexture.wrapT = THREE.RepeatWrapping;

        // skydome
        var skyGeo = new THREE.SphereBufferGeometry( radius, 32, 15, 0, Math.PI * 2, 0, Math.PI * 0.5 );
        var skyMat = new THREE.ShaderMaterial( { 
            vertexShader: this.vertexShader, 
            fragmentShader: this.fragmentShader, 
            uniforms: {
                topColor:    { value: new THREE.Color( 0xFFFFFF ) },
                bottomColor: { value: new THREE.Color( 0xFFFFFF ) },
                offset:      { value: 33 },
                exponent:    { value: 0.6 },
                starsOffset:    { value: 0 },
                starsTexture: { value: starsTexture }
            }, 
            side: THREE.BackSide 
        } );
        var skyDome = new THREE.Mesh(skyGeo, skyMat);
        this.add(skyDome);

        // sun
        var sun = new THREEx.Sun(0xFFFFFF, radius, 0, 0, sunCoronaTexture, camera, scene);
        this.sun = sun;
        this.add( sun );  

        // hemisphere light
        var hemiLight = new THREE.HemisphereLight( 0xFFFFFF, 0xFFFFFF, 0.6 );
        this.add( hemiLight );  

        /**
         * Update fog colors
         */
        this.updateFogColors = function(fog, backgroundFog) {
            scene.background.copy(backgroundFog);
            scene.fog.color.copy(fog);
        }

        /**
         * Update fog radius
         */
        this.updateFogRadius = function(far) {
            scene.fog.far = far;
        }

        /**
         * Update sky
         */
        this.updateSkyColor = function(top, bottom) {
            skyMat.uniforms.topColor.value.copy( top );
            skyMat.uniforms.bottomColor.value.copy( bottom );
        }

        /**
         * Update sky light
         */
        this.updateSkyLight = function(skyLightColor, groundLightColor) {
            hemiLight.color.copy(skyLightColor);
            hemiLight.groundColor.copy(groundLightColor);
        }

        /**
         * Update sun color
         */
        this.updateSunColor = function(color, intensity) {
            sun.setColor(color);
            sun.setIntensity(intensity);
        }

        /**
         * Update sun angle
         */
        this.updateSunAngle = function(vertical, horizontal) {
            sun.setAngle(vertical, horizontal);
            skyMat.uniforms.starsOffset.value = horizontal / 180;
        }

        /**
         * Update time
         */
        this.updateTime = function(time) {
            skyMat.uniforms.starsOffset.value = time / 360;
        }

        /**
         * Update
         */
        this.update = function () {
            sun.update();
        }
    }

}
