import * as THREE from 'three';
export class Road {
    constructor(webgl,options){
        this.webgl = webgl
        this.options = options
    }
    init(){
        const geo = new THREE.PlaneGeometry(
            this.options.width,
            this.options.length,
            20,
            200
        )

        const {vertex,fragment} = this.webgl.shaders.road
        this.uniforms = {
            ...this.options.uniforms,
            uColor:new THREE.Uniform(new THREE.Color(0x555555))
        }

        const mat = new THREE.ShaderMaterial({
            vertexShader:vertex,
            fragmentShader:fragment,
            uniforms:this.uniforms
        })

        const road = new THREE.Mesh(
            geo,
            mat
        )

        road.rotation.x = -Math.PI/2
        road.position.z = -this.options.length / 2

        this.road = road
        this.webgl.scene.add(road)
    }
    update(delta){
        
    }
}