/**
 * Sun
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.Sun = class Sun extends THREE.Object3D {

    constructor(sunColor, distance, horizontalAngle, verticalAngle, coronaTexture, camera, scene) {
        super();

        // consts
            const SUN_LIGHT_SHADOW_AREA = 350;
            const SUN_SHADOW_MAP_SIZE = 2048;
            const SUN_SHADOW_BIAS = -0.0001;

            this.distance = distance ? distance : 10000;
            this.color = sunColor ? new THREE.Color(sunColor) : new THREE.Color(0xFFFFFF);
            this.direction = new THREE.Vector3(0,1,0);
            this.horizontal = horizontalAngle ? horizontalAngle : 0;
            this.vertical = verticalAngle ? verticalAngle : 0;

            // sun light
            var light = new THREE.DirectionalLight(0xFFFFFF, 1);
            light.position.set(this.direction.x * this.distance, this.direction.y * this.distance, this.direction.z * this.distance);
            light.castShadow = true;
            light.shadow.mapSize.width = SUN_SHADOW_MAP_SIZE;
            light.shadow.mapSize.height = SUN_SHADOW_MAP_SIZE;
            light.shadow.camera.left = -SUN_LIGHT_SHADOW_AREA;
            light.shadow.camera.right = SUN_LIGHT_SHADOW_AREA
            light.shadow.camera.top = SUN_LIGHT_SHADOW_AREA;
            light.shadow.camera.bottom = -SUN_LIGHT_SHADOW_AREA;
            light.shadow.camera.far = this.distance * 2;
            light.shadow.bias = SUN_SHADOW_BIAS;
            this.add( light );

            // sun sphere
            var geometry = new THREE.SphereBufferGeometry( (this.distance / 100) * 2, 32, 32);
            var material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, fog: false} );
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(light.position);
            this.add( sphere );

            // sun flare
            var flareMaterial = new THREE.SpriteMaterial( { 
                map: coronaTexture,
                color: 0xFFFFFF,
                transparent: true ,
                opacity: 0.95
            } );
            var flare = new THREE.Sprite( flareMaterial );
            flare.scale.set(distance * 0.45, distance * 0.45, 1);
            flareMaterial.depthTest = false;
            sphere.add( flare );

            /**
             * Update
             */
            this.update = function () {
                var toEye = camera.position.clone();
                toEye.sub(sphere.position);
                const length = toEye.length()
                toEye.normalize();
                var raycaster = new THREE.Raycaster(sphere.position, toEye, 0.1, length);

                const intersection = raycaster.intersectObjects(scene.children, true);

                if (intersection && intersection.length > 0) {
                    flare.visible = false;
                } else {
                    flare.visible = true;
                }
            }

            /**
             * Set sun texture
             */
            this.setTexture = function (texture) {
                sphere.material.map = texture;
                sphere.material.needsUpdate = true;
            }

            /**
             * Set visibility
             */
            this.setVisible = function ( visible ) {
                sphere.visible = visible;
            }

            /**
             * Set angle
             */
            this.setAngle = function ( horizontal, vertical ) {
                this.horizontal = horizontal;
                this.vertical = vertical;
                this.direction = new THREE.Vector3(0,0,0);

                const h = (horizontal * Math.PI) / 180;
                const v = (vertical * Math.PI) / 180;
                const f = Math.cos(v);
                this.direction.y = Math.sin(v);
                this.direction.x = f * Math.cos(h);
                this.direction.z = f * Math.sin(h);
                this.direction.normalize();

                light.position.set(this.direction.x * distance, this.direction.y * distance, this.direction.z * distance);
                sphere.position.set(this.direction.x * (distance * 0.99), this.direction.y * (distance * 0.99), this.direction.z * (distance * 0.99));
            };

            /**
             * Get position
             */
            this.getPosition = function ( ) {
                return sphere.position;
            }

            /**
             * Set color
             */
            this.setColor = function ( color ) {
                this.color = new THREE.Color(color.r, color.g, color.b);
                light.color.copy(this.color);
                sphere.material.color.copy(this.color);
                flare.material.color.copy(this.color);
            };
            this.getColor = function ( ) {
                return this.color;
            }

            /**
             * Set intensity
             */
            this.setIntensity = function ( intensity ) {
                light.intensity = intensity;
                flareMaterial.opacity = intensity;
            };
            this.getIntensity = function ( ) {
                return light.intensity;
            }

            /**
             * Set distance
             */
            this.setDistance = function ( distance ) {
                this.distance = distance;
                this.setAngle(this.horizontal, this.vertical);
            };

            // set initial
            this.setAngle(this.horizontal, this.vertical);
            this.setColor(this.color);
    }
}
