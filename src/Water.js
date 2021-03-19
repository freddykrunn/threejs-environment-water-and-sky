/**
 * Water
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.Water = class Water extends THREE.Mesh {

	constructor(radius, resolution, renderer, scene, camera, normalTex, waterFoamTex) {
		super(new THREE.PlaneBufferGeometry( radius * 2, radius * 2, 1, 1 ));

		var scope = this;

		/**
		 * Vertex Shader
		 */
		 this.vertexShader = `
			varying vec4 v_worldPosition;
			varying vec3 v_normal;
			varying vec2 v_uv;
			varying vec4 v_coord;

			uniform mat4 textureMatrix;

			void main() {
				v_normal = normalize(mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal);
				v_worldPosition = modelMatrix * vec4( position, 1.0 );
				v_uv = uv;

				v_coord = textureMatrix * vec4( position, 1.0 );

				gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); 
			}
		`;

		/**
		* Fragment Shader
		*/
		this.fragmentShader = `
			precision mediump float;

			varying vec3 v_normal;
			varying vec4 v_worldPosition;
			varying vec2 v_uv;
			varying vec4 v_coord;

			// custom
			uniform vec3 sunColor;
			uniform vec3 sun;
			uniform float sunIntensity;
			uniform sampler2D reflectionMap;
			uniform sampler2D refractionMap;
			uniform sampler2D refractionUWMap;
			uniform sampler2D normalMap;
			uniform sampler2D heightmap;
			uniform sampler2D waterFoam;
			uniform float time;

			uniform float reflectivity;
			uniform float resolution;
			uniform float shininess;
			uniform bool underwater;
			uniform vec3 underwaterFog;

			vec4 getNoise( vec2 uv ) {
				float t = time * 0.0001;
				vec2 uv0 = uv + vec2(t / -7.0, t / 15.0);
				vec2 uv1 = uv - vec2(t / 10.0, t / -24.0);
				vec2 uv2 = uv - vec2(t / -5.0, t / 6.0);
				vec4 noise = texture2D( normalMap, uv0 )
				+ texture2D( normalMap, uv1 )
				+ texture2D( normalMap, uv2 );
				noise = noise / 3.0;
				return (noise * 2.0) - 1.0;
			}

			void main() {
				// colors
				vec4 waterDeepColor = vec4(0.18,0.38,0.58, 1.0);
				vec4 waterCoastLineColor = vec4(0.24,0.52,0.61, 1.0);
				vec4 waterRefractColor = vec4(0.05,0.75,0.44,1.0);
				vec4 waterUnderColor = vec4(0.25,0.41,0.54, 1.0);
				vec4 waterFogColor = vec4(underwaterFog, 1.0);

				// uv coords
				vec2 uv_repeated = v_uv * resolution;
				uv_repeated.x = clamp(mod(uv_repeated.x, 1.0), 0.0, 1.0);
				uv_repeated.y = clamp(mod(uv_repeated.y, 1.0), 0.0, 1.0);

				// surface normal
				vec4 noise = getNoise( uv_repeated );
				vec3 normal = normalize(noise.xzy);

				// reflection and refraction
				vec3 toEye = normalize(cameraPosition - v_worldPosition.xyz);

				float theta = clamp( dot( toEye, normal ), 0.0, 1.0);
				float reflectance = pow(1.0 - theta, 2.0) * 0.5;
				float refractance = pow(theta, 3.0);
				float refractanceUmbra = pow(theta, 3.75);
				refractance = (refractance - refractanceUmbra) * 1.25 * clamp(sunIntensity,0.25,0.5);

				vec3 coord = v_coord.xyz / v_coord.w;
				vec2 uv = coord.xy + coord.z * normal.xz * 0.05;

				vec4 reflectColor = texture2D( reflectionMap, vec2( 1.0 - uv.x, uv.y ) );
				vec4 refractColor;
				if (underwater) {
					refractColor = texture2D( refractionUWMap, uv );
				} else {
					refractColor = texture2D( refractionMap, uv );
				}

				// specular
				vec3 sun = normalize(sun - v_worldPosition.xyz);
				vec3 reflection = normalize(reflect(-sun, normal));
				float lightAngle = clamp(dot(toEye, reflection), 0.0, 1.0);
				vec4 specular = pow(lightAngle, shininess) * vec4(sunColor, 1.0) * sunIntensity;

				// water color
				// uv coords
				vec4 heightmapColor = texture2D( heightmap, v_uv );
				float heightMapContribution = ((heightmapColor.x + heightmapColor.y + heightmapColor.z) * 3.0 / 3.0);
				waterCoastLineColor = mix(vec4(0.75,0.75,0.75,1.0), waterCoastLineColor, clamp(heightMapContribution * 3.0, 0.0, 1.0));
				vec4 waterColor = (mix(waterCoastLineColor, waterDeepColor, heightMapContribution) * 1.2) * 0.75;

				// water foam
				waterColor += (1.0 - clamp(heightMapContribution * 8.0, 0.0, 1.0)) * texture2D(waterFoam, uv_repeated) * 0.2;

				// final color
				vec4 reflectionFinalColor = reflectColor * reflectance * reflectivity;
				float alfa = (0.6 + (0.4 * heightMapContribution)) * 0.5;
				
				if (underwater) {
					float perFog = (clamp(length(cameraPosition - v_worldPosition.xyz), 0.0, 1000.0) / 1000.0);
					float perRefract = (clamp(length(cameraPosition - v_worldPosition.xyz), 0.0, 200.0) / 200.0);
					gl_FragColor = mix(mix(refractColor * waterFogColor * 2.0 + (waterRefractColor * refractance * 2.0), reflectColor, perRefract), waterFogColor, perFog);
				} else {
					gl_FragColor = (refractColor * waterColor) + (waterRefractColor * refractance) + reflectionFinalColor + specular;
				}

				// final transparency
				gl_FragColor.a = 1.0;
			}
		`;
	
		this.rotation.x = Math.PI * -0.5;

		var depthCamera = new THREE.OrthographicCamera( -radius, radius, radius,-radius, 0.01, 60 );
		depthCamera.position.set(0, 1, 0);
		depthCamera.lookAt(new THREE.Vector3(0,0,0));
		depthCamera.updateProjectionMatrix();
		this.depthCamera = depthCamera;

		var depthRendertarget = new THREE.WebGLRenderTarget( 8192, 8192 );
		depthRendertarget.texture.format = THREE.RGBFormat;
		depthRendertarget.texture.minFilter = THREE.NearestFilter;
		depthRendertarget.texture.magFilter = THREE.NearestFilter;
		depthRendertarget.texture.generateMipmaps = false;
		depthRendertarget.stencilBuffer = false;
		depthRendertarget.depthBuffer = true;
		depthRendertarget.depthTexture = new THREE.DepthTexture();
		depthRendertarget.depthTexture.type = THREE.UnsignedShortType;

		this.depthTextureRendered = false;

		// uniforms
		this.uniforms = {
			sunColor: {value: null},
			sun: {value: null},
			sunIntensity: {value: null},
			reflectionMap: {value: null},
			refractionMap: {value: null},
			refractionUWMap: {value: null},
			normalMap: {value: null},
			heightmap: {value: null},
			waterFoam: {value: null},
			time: {value: null},
			textureMatrix: {value: new THREE.Matrix4()},
			reflectivity: {value: 1.0 },
			resolution: {value: resolution},
			shininess: {value: 200},
			underwater: {value: false},
			underwaterFog: {value: null}
		}

		// material
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			side: THREE.FrontSide
		});
		this.material.transparent = true;

		// internal components
		var reflector = new THREE.Reflector( this.geometry, {
			textureWidth: 512,
			textureHeight: 512,
			clipBias: 0.02
		} );

		var refractor = new THREE.Refractor( this.geometry, {
			textureWidth: 512,
			textureHeight: 512,
			clipBias: 0.5
		} );

		var refractorUW = new THREE.Refractor( this.geometry, {
			textureWidth: 512,
			textureHeight: 512,
			clipBias: 0
		} );

		reflector.matrixAutoUpdate = false;
		refractor.matrixAutoUpdate = false;
		refractorUW.matrixAutoUpdate = false;

		// maps
		this.material.uniforms.reflectionMap.value = reflector.getRenderTarget().texture;
		this.material.uniforms.refractionMap.value = refractor.getRenderTarget().texture;
		this.material.uniforms.refractionUWMap.value = refractorUW.getRenderTarget().texture;
		
		if (normalTex) {
			var normalTexture = normalTex;
			normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
			this.uniforms.normalMap.value = normalTexture;
		}

		if (waterFoamTex) {
			this.uniforms.waterFoam.value = waterFoamTex;
			this.uniforms.waterFoam.value.wrapS = this.uniforms.waterFoam.value.wrapT = THREE.RepeatWrapping;
		}

		// updateTextureMatrix
		function updateTextureMatrix( camera ) {
			scope.uniforms.textureMatrix.value.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);

			scope.uniforms.textureMatrix.value.multiply( camera.projectionMatrix );
			scope.uniforms.textureMatrix.value.multiply( camera.matrixWorldInverse );
			scope.uniforms.textureMatrix.value.multiply( scope.matrixWorld );
		}

		/**
		 * On update
		 */
		this.update = function ( delta ) {
			this.uniforms.time.value += delta;

			if (camera.position.y < this.position.y) {
				this.uniforms.underwater.value = true;
				this.rotation.x = Math.PI * 0.5;
			} else {
				this.uniforms.underwater.value = false;
				this.rotation.x = Math.PI * -0.5;
			}
		}

		/**
		 * Update depth texture
		 */
		this.updateDepthTexture = function () {
			this.depthTextureRendered = true;
			this.visible = false;
			renderer.render(scene, depthCamera, depthRendertarget);
			this.visible = true;
			this.material.uniforms.heightmap.value = depthRendertarget.depthTexture;
		}

		/**
		 * On before render
		 */
		this.onBeforeRender = function ( renderer, scene, camera ) {
			updateTextureMatrix( camera );

			scope.visible = false;

			reflector.matrixWorld.copy( scope.matrixWorld );
			if (this.uniforms.underwater.value === true) {
				refractorUW.matrixWorld.copy( scope.matrixWorld );
			} else {
				refractor.matrixWorld.copy( scope.matrixWorld );
			}
			

			reflector.onBeforeRender( renderer, scene, camera );	
			if (this.uniforms.underwater.value === true) {
				refractorUW.onBeforeRender( renderer, scene, camera );
			} else {
				refractor.onBeforeRender( renderer, scene, camera );
			}

			scope.visible = true;

		};

		// initial update of water depth texture
		setTimeout(() => {
			this.updateDepthTexture();
		}, 1000);
	}
}
