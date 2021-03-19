/**
 * THREEjs Environment (real water & sky)
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.Environment = class Environment extends THREE.Object3D {

    constructor(renderer, scene, camera, radius, oceanFloorResolution, waterPlaneY, oceanFloorY, textures) {
        super();
            
        const UNDER_WATER_FOG_RADIUS = radius / 10;
        const DAY_MINUTES = 1440;
        const SUN_MIN_ANGLE = -1;
        const SUN_MAX_ANGLE = 182;
        const SUNRISE_MINUTES = 375; // 6.30h
        const SUNSET_MINUTES = 1275; // 21.15h

        const MOONRISE_MINUTES = 1350; // 22h
        const MOONSET_MINUTES = 300; // 5h

        const periods = [
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
        
        const periodValues = [
            {
                col_sky_top: new THREE.Color(0x101e33), 
                col_sky_bot: new THREE.Color(0x193156), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x000a0f), 
                col_hemi_sky: new THREE.Color(0x2d4c7a), 
                col_hemi_ground: new THREE.Color(0x222222), 
                col_sun: new THREE.Color(0xffffff), 
                intensity_sun: 0.09
            }, //0h
            {
                col_sky_top: new THREE.Color(0x101e33), 
                col_sky_bot: new THREE.Color(0x193156), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x000a0f), 
                col_hemi_sky: new THREE.Color(0x2d4c7a), 
                col_hemi_ground: new THREE.Color(0x222222), 
                col_sun: new THREE.Color(0xffffff), 
                intensity_sun: 0.06,
            }, //5h
            {
                col_sky_top: new THREE.Color(0x101e33), 
                col_sky_bot: new THREE.Color(0x193156), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x000a0f), 
                col_hemi_sky: new THREE.Color(0x2d4c7a), 
                col_hemi_ground: new THREE.Color(0x222222), 
                col_sun: new THREE.Color(0xffffff), 
                intensity_sun: 0,
            }, //6h
            {
                col_sky_top: new THREE.Color(0x4a5970), 
                col_sky_bot: new THREE.Color(0xffd8b5), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x001516), 
                col_hemi_sky: new THREE.Color(0x4a5970), 
                col_hemi_ground: new THREE.Color(0x555555), 
                col_sun: new THREE.Color(0xe5c3a5), 
                intensity_sun: 0,
            }, //6.30h
            {
                col_sky_top: new THREE.Color(0x4a5970), 
                col_sky_bot: new THREE.Color(0xffd8b5), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x001516), 
                col_hemi_sky: new THREE.Color(0x4a5970), 
                col_hemi_ground: new THREE.Color(0x555555), 
                col_sun: new THREE.Color(0xe5c3a5), 
                intensity_sun: 0.75,
            }, //6.35h
            {
                col_sky_top: new THREE.Color(0x4d9af2), 
                col_sky_bot: new THREE.Color(0xc5d9f9), 
                col_fog: new THREE.Color(0x7cb9ff), 
                col_uw_fog: new THREE.Color(0x4189AB), 
                col_hemi_sky: new THREE.Color(0xbfe1fc), 
                col_hemi_ground: new THREE.Color(0xffe6cc), 
                col_sun: new THREE.Color(0xffffe6), 
                intensity_sun: 0.75
            }, //8h
            {
                col_sky_top: new THREE.Color(0x4d9af2), 
                col_sky_bot: new THREE.Color(0xc5d9f9), 
                col_fog: new THREE.Color(0x7cb9ff), 
                col_uw_fog: new THREE.Color(0x4189AB), 
                col_hemi_sky: new THREE.Color(0xbfe1fc), 
                col_hemi_ground: new THREE.Color(0xffe0ba), 
                col_sun: new THREE.Color(0xffffe6), 
                intensity_sun: 0.75
            }, //10h
            {
                col_sky_top: new THREE.Color(0x4d9af2), 
                col_sky_bot: new THREE.Color(0xc5d9f9), 
                col_fog: new THREE.Color(0x7cb9ff), 
                col_uw_fog: new THREE.Color(0x4189AB), 
                col_hemi_sky: new THREE.Color(0xbfe1fc), 
                col_hemi_ground: new THREE.Color(0xffe0ba), 
                col_sun: new THREE.Color(0xffffe6), 
                intensity_sun: 0.75
            }, //12h
            {
                col_sky_top: new THREE.Color(0x4d9af2), 
                col_sky_bot: new THREE.Color(0xc5d9f9), 
                col_fog: new THREE.Color(0x7cb9ff), 
                col_uw_fog: new THREE.Color(0x4189AB), 
                col_hemi_sky: new THREE.Color(0xbfe1fc), 
                col_hemi_ground: new THREE.Color(0xffe6cc), 
                col_sun: new THREE.Color(0xffffe6), 
                intensity_sun: 1
            }, //20h
            {
                col_sky_top: new THREE.Color(0x3878a5), 
                col_sky_bot: new THREE.Color(0xe2994f), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x001516), 
                col_hemi_sky: new THREE.Color(0x3e5c77), 
                col_hemi_ground: new THREE.Color(0xb29863), 
                col_sun: new THREE.Color(0xffad66), 
                intensity_sun: 1
            }, //21h
            {
                col_sky_top: new THREE.Color(0x3878a5), 
                col_sky_bot: new THREE.Color(0xb7765f), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x001516), 
                col_hemi_sky: new THREE.Color(0x3e5c77), 
                col_hemi_ground: new THREE.Color(0x555555), 
                col_sun: new THREE.Color(0xe08779), 
                intensity_sun: 0
            }, //21.15h
            {
                col_sky_top: new THREE.Color(0x101e33), 
                col_sky_bot: new THREE.Color(0x193156), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x000a0f), 
                col_hemi_sky: new THREE.Color(0x2d4c7a), 
                col_hemi_ground: new THREE.Color(0x222222), 
                col_sun: new THREE.Color(0xffad66), 
                intensity_sun: 0
            }, //22h
            {
                col_sky_top: new THREE.Color(0x101e33), 
                col_sky_bot: new THREE.Color(0x193156), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x000a0f), 
                col_hemi_sky: new THREE.Color(0x2d4c7a), 
                col_hemi_ground: new THREE.Color(0x222222), 
                col_sun: new THREE.Color(0xffffff), 
                intensity_sun: 0
            }, //22.30h
            {
                col_sky_top: new THREE.Color(0x101e33), 
                col_sky_bot: new THREE.Color(0x193156), 
                col_fog: new THREE.Color(0x000916), 
                col_uw_fog: new THREE.Color(0x000a0f), 
                col_hemi_sky: new THREE.Color(0x2d4c7a), 
                col_hemi_ground: new THREE.Color(0x222222), 
                col_sun: new THREE.Color(0xffffff), 
                intensity_sun: 0.1
            }, //24h
        ]    

        var sky = new THREEx.Sky(radius, camera, scene, textures.sunCorona, textures.starsTexture);
        var water = new THREEx.Water(radius, Math.round(radius / 300), renderer, scene, camera, textures.waterNormal, textures.waterFoam);
        water.position.set(0, waterPlaneY, 0);

        // ocean floor
        var oceanFloorGeo = new THREE.PlaneBufferGeometry(radius * 3, radius * 3);
        var oceanFloorMaterial = new THREEx.EnvironmentPhongMaterial( {
            color: 0xFFFFFF,
            map: textures.ground,
            causticsMap: textures.causticsTexture,
            shininess: 0
        });
        oceanFloorMaterial.map.wrapS = oceanFloorMaterial.map.wrapT = THREE.RepeatWrapping;
        oceanFloorMaterial.map.repeat.set( oceanFloorResolution, oceanFloorResolution );
        var oceanFloor = new THREE.Mesh(oceanFloorGeo, oceanFloorMaterial);
        oceanFloor.rotation.x = Math.PI * -0.5;
        oceanFloor.position.y = oceanFloorY >= waterPlaneY ? waterPlaneY - 1 : oceanFloorY;

        this.add(sky);
        this.add(water);
        this.add(oceanFloor);
        this.sky = sky;
        this.water = water;
        this.oceanFloor = oceanFloor;

        this.time = 0;
        this.currentValues = periodValues[0];

        /**
         * Lerp color/vector
         */
        var lerp = function(prop, indexStart, indexEnd, percentage) {
            if (typeof(periodValues[indexStart][prop]) === "number") {
                return periodValues[indexStart][prop] + ((periodValues[indexEnd][prop] - periodValues[indexStart][prop]) * percentage);
            } else {
                var obj = periodValues[indexStart][prop].clone();
                obj.lerp(periodValues[indexEnd][prop], percentage);
                return obj;
            }
        }

        /**
         * Set time
         */
        this.setTime = function(minutes) {
            if (minutes < 0 || minutes > DAY_MINUTES) {
                return;
            }

            this.time = minutes;

            var period = null;
            for (var i=0; i<periods.length - 1; i++) {
                if (minutes >= periods[i] && minutes <= periods[i+1]) {
                    period = {start: periods[i], end: periods[i+1], indexStart: i, indexEnd: i+1};
                    break;
                }
            }

            if (period != null) {
                const percentage = (minutes - period.start) / (period.end - period.start);

                // lerp values
                var col_sky_top = lerp("col_sky_top", period.indexStart, period.indexEnd, percentage);
                var col_sky_bot = lerp("col_sky_bot", period.indexStart, period.indexEnd, percentage);
                var col_fog = lerp("col_fog", period.indexStart, period.indexEnd, percentage);
                var col_uw_fog = lerp("col_uw_fog", period.indexStart, period.indexEnd, percentage);
                var col_hemi_sky = lerp("col_hemi_sky", period.indexStart, period.indexEnd, percentage);
                var col_hemi_ground = lerp("col_hemi_ground", period.indexStart, period.indexEnd, percentage);
                var col_sun = lerp("col_sun", period.indexStart, period.indexEnd, percentage);
                var intensity_sun = lerp("intensity_sun", period.indexStart, period.indexEnd, percentage);

                var angle_sun = new THREE.Vector2(0, 0);
                if (minutes >= SUNRISE_MINUTES && minutes <= SUNSET_MINUTES) {
                    angle_sun.y = SUN_MIN_ANGLE + (SUN_MAX_ANGLE * ((minutes-SUNRISE_MINUTES) / (SUNSET_MINUTES-SUNRISE_MINUTES)));
                    sky.sun.setTexture(null);
                } else if (minutes >= MOONRISE_MINUTES || minutes <= MOONSET_MINUTES) {
                    const nextDayMinutes = minutes >= 0 && minutes <= MOONSET_MINUTES ? 1440 : 0;
                    angle_sun.y = SUN_MIN_ANGLE + (SUN_MAX_ANGLE * (((minutes+nextDayMinutes)-MOONRISE_MINUTES) / ((MOONSET_MINUTES+1440)-MOONRISE_MINUTES)));
                    sky.sun.setTexture(textures.moonTexture);
                } else {
                    angle_sun.y = -90;
                    sky.sun.setTexture(null);
                }

                this.currentValues = {
                    "col_sky_top": col_sky_top,
                    "col_sky_bot": col_sky_bot,
                    "col_fog": col_fog,
                    "col_uw_fog": col_uw_fog,
                    "col_hemi_sky": col_hemi_sky,
                    "col_hemi_ground": col_hemi_ground,
                    "col_sun": col_sun,
                    "intensity_sun": intensity_sun,
                    "angle_sun": angle_sun,
                };

                // update sky
                sky.updateFogColors(col_fog, col_uw_fog);
                sky.updateSkyColor(col_sky_top, col_sky_bot);
                sky.updateSkyLight(col_hemi_sky, col_hemi_ground);
                sky.updateSunColor(col_sun, intensity_sun);
                sky.updateSunAngle(angle_sun.x, angle_sun.y);
                sky.updateTime(minutes);

                // update water
                water.uniforms.sun.value = sky.sun.getPosition();
                water.uniforms.sunColor.value = sky.sun.getColor();
                water.uniforms.sunIntensity.value = sky.sun.getIntensity();
                water.uniforms.underwaterFog.value = this.currentValues.col_uw_fog;
            }
        },

        /**
         * Update
         */
        this.update = function(delta) {
            water.update(delta);

            if (camera.position.y < water.position.y) {
                sky.updateFogColors(this.currentValues["col_uw_fog"], this.currentValues["col_uw_fog"]);
                sky.updateFogRadius(UNDER_WATER_FOG_RADIUS);
            } else {
                sky.updateFogColors(this.currentValues["col_fog"], this.currentValues["col_uw_fog"]);
                sky.updateFogRadius(radius);
            }

            if (camera.position.y < water.position.y) {
                sky.sun.setVisible(false);
            } else {
                sky.sun.setVisible(true);
            }

            sky.update(delta);
        }

        // reset time
        this.setTime(720);
    }
}
