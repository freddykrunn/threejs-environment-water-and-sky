/**
 * EnvironmentPhongMaterial
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.EnvironmentPhongMaterial = class EnvironmentPhongMaterial extends THREE.MeshPhongMaterial {
    constructor(params) {
        super(params);

        var causticsMap = params.causticsMap;

        this.onBeforeCompile = function ( shader ) {

            shader.uniforms.causticsMap = { value: causticsMap };
            shader.uniforms.causticsResolution = { value: 0.01 };
            shader.uniforms.underwaterGroundColor = { value: new THREE.Color(0x3489a3) };
            shader.uniforms.waterY = { value: 0 };
            shader.uniforms.time = { value: 0 };
            this.uniforms = shader.uniforms;
            
            shader.vertexShader = this.vertexShader;
            shader.fragmentShader = this.fragmentShader;

            // materialShader = shader;
        };

        this.vertexShader = `
            #define PHONG
        
            varying vec3 vViewPosition;
            varying vec4 vWorldPosition;
        
            #ifndef FLAT_SHADED
        
                varying vec3 vNormal;
        
            #endif
        
            #include <common>
            #include <uv_pars_vertex>
            #include <uv2_pars_vertex>
            #include <displacementmap_pars_vertex>
            #include <envmap_pars_vertex>
            #include <color_pars_vertex>
            #include <fog_pars_vertex>
            #include <morphtarget_pars_vertex>
            #include <skinning_pars_vertex>
            #include <shadowmap_pars_vertex>
            #include <logdepthbuf_pars_vertex>
            #include <clipping_planes_pars_vertex>
        
            void main() {
        
                #include <uv_vertex>
                #include <uv2_vertex>
                #include <color_vertex>
        
                #include <beginnormal_vertex>
                #include <morphnormal_vertex>
                #include <skinbase_vertex>
                #include <skinnormal_vertex>
                #include <defaultnormal_vertex>
        
            #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
        
                vNormal = normalize( transformedNormal );
        
            #endif
        
                #include <begin_vertex>
                #include <morphtarget_vertex>
                #include <skinning_vertex>
                #include <displacementmap_vertex>
                #include <project_vertex>
                #include <logdepthbuf_vertex>
                #include <clipping_planes_vertex>
        
                vViewPosition = - mvPosition.xyz;
                vWorldPosition = modelMatrix * vec4( position, 1.0 );
        
                #include <worldpos_vertex>
                #include <envmap_vertex>
                #include <shadowmap_vertex>
                #include <fog_vertex>
        
            }
        `;

        this.fragmentShader = `
            #define PHONG
        
            uniform vec3 diffuse;
            uniform vec3 emissive;
            uniform vec3 specular;
            uniform float shininess;
            uniform float opacity;
        
            // custom
            uniform sampler2D causticsMap;
            uniform float causticsResolution;
            uniform vec3 underwaterGroundColor;
            uniform float waterY;
            uniform float time;
            varying vec4 vWorldPosition;
        
            #include <common>
            #include <packing>
            #include <dithering_pars_fragment>
            #include <color_pars_fragment>
            #include <uv_pars_fragment>
            #include <uv2_pars_fragment>
            #include <map_pars_fragment>
            #include <alphamap_pars_fragment>
            #include <aomap_pars_fragment>
            #include <lightmap_pars_fragment>
            #include <emissivemap_pars_fragment>
            #include <envmap_pars_fragment>
            #include <gradientmap_pars_fragment>
            #include <fog_pars_fragment>
            #include <bsdfs>
            #include <lights_pars_begin>
            #include <lights_phong_pars_fragment>
            #include <shadowmap_pars_fragment>
            #include <bumpmap_pars_fragment>
            #include <normalmap_pars_fragment>
            #include <specularmap_pars_fragment>
            #include <logdepthbuf_pars_fragment>
            #include <clipping_planes_pars_fragment>
        
            void main() {
        
                #include <clipping_planes_fragment>
        
                vec4 diffuseColor = vec4( diffuse, opacity );
                ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
                vec3 totalEmissiveRadiance = emissive;
        
                #include <logdepthbuf_fragment>
                #include <map_fragment>
                #include <color_fragment>
                #include <alphamap_fragment>
                #include <alphatest_fragment>
                #include <specularmap_fragment>
                #include <normal_fragment_begin>
                #include <normal_fragment_maps>
                #include <emissivemap_fragment>
        
                // accumulation
                #include <lights_phong_fragment>
                #include <lights_fragment_begin>
                #include <lights_fragment_maps>
                #include <lights_fragment_end>
        
                // modulation
                #include <aomap_fragment>
        
                vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        
                #include <envmap_fragment>
        
                gl_FragColor = vec4( outgoingLight, diffuseColor.a );
        
                // uv coords
                vec2 caustics_uv_coords = vWorldPosition.xz * causticsResolution;
                caustics_uv_coords.x = clamp(mod(caustics_uv_coords.x, 1.0), 0.0, 1.0);
                caustics_uv_coords.y = clamp(mod(caustics_uv_coords.y, 1.0), 0.0, 1.0);  
                
                // caustics
                vec4 caustics = texture2D(causticsMap, caustics_uv_coords);
        
                float diffuseIntensity = (reflectedLight.directDiffuse.x + reflectedLight.directDiffuse.y + reflectedLight.directDiffuse.z) / 3.0;
        
                if (vWorldPosition.y <= waterY) {
                    float waterDeepColorIntensity = clamp((waterY - vWorldPosition.y) / 40.0, 0.0, 1.0);
                    float causticsIntensity = clamp(diffuseIntensity, 0.0, 0.25);
        
                    gl_FragColor = gl_FragColor * mix(vec4(1.0,1.0,1.0,1.0), vec4(underwaterGroundColor, 1.0), waterDeepColorIntensity) + caustics * causticsIntensity;
                }
        
                #include <tonemapping_fragment>
                #include <encodings_fragment>
                #include <fog_fragment>
                #include <premultiplied_alpha_fragment>
                #include <dithering_fragment>
        
            }
        `
    }
}
