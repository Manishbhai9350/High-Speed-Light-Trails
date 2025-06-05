import "./styles.css";
import * as THREE from "three";
import { BasicThreeDemo } from "./BasicThreeDemo";
import { Road } from "./Lights/Road";

// Shaders Importing
import RoadVertex from "./shader/Road/vertex.glsl";
import RoadFragment from "./shader/Road/fragment.glsl";
import LightVertex from "./shader/Light/vertex.glsl";
import LightFragment from "./shader/Light/fragment.glsl";
import { Lights } from "./Lights/Lights";
import { Lerp } from "./utils/lerp";

export class App extends BasicThreeDemo {
  constructor(container) {
    super(container);
    this.appendShaders();
    this.container = container;
    this.camera.position.z = -5;
    this.camera.position.y = 7;
    this.camera.position.x = 0;
    this.speedUp = 0;
    this.targetSpeedUp = 0;
    this.timeOffset = 0;
    this.fovTarget = 90;
    this.camera.fov = 90;
    this.camera.updateProjectionMatrix();
    this.fovChange = 0;
    const options = {
      width: 20,
      roadWidth: 9,
      length: 400,
      pairs: 50,
      sections: 3,
      uTimeSpeed: 50,
      gap: 2,
      uniforms: {
        uDistortionX: {
          value: new THREE.Vector2(3, 80),
        },
        uDistortionY: {
          value: new THREE.Vector2(2.5, -40),
        },
        uRoadLen: { value: 0 },
      },
    };
    options.uniforms.uRoadLen.value = options.length;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.options = options;
    this.road = new Road(this, options);
    this.LeftLights = new Lights(this, { ...options, color: 0xff102a });
    this.RightLights = new Lights(this, { ...options, color: 0xfafafa });
  }
  init() {
    this.container.addEventListener("mousedown", this.onMouseDown);
    this.container.addEventListener("mouseup", this.onMouseUp);
    this.container.addEventListener("mouseout", this.onMouseUp);
    this.road.init();
    this.LeftLights.init();
    this.LeftLights.Instanced.position.setX(
      -this.options.roadWidth / 2 - this.options.gap / 2
    );
    this.RightLights.init();
    this.RightLights.Instanced.position.setX(
      this.options.roadWidth / 2 + this.options.gap / 2
    );
    this.tick();
  }
  update(delta) {
    let coefficient = -60 * Math.log2(1 - 0.1);
    let lerpT = Math.exp(-coefficient * delta);
    this.speedUp += Lerp(this.speedUp, this.targetSpeedUp, lerpT, 0.00001);

    let fovChange = Lerp(this.camera.fov, this.fovTarget, lerpT);
    if (fovChange !== 0) {
      this.camera.fov += fovChange * delta;
      this.camera.updateProjectionMatrix();
    }

    this.timeOffset += this.speedUp * delta * 40;

    let Time = this.clock.getElapsedTime() + this.timeOffset;
    Time *= 2;

    this.LeftLights.update(Time);
    this.RightLights.update(-Time);
  }
  onMouseDown(e) {
    this.targetSpeedUp = 0.1;
    this.fovTarget = 140;
  }
  onMouseUp(e) {
    this.targetSpeedUp = 0;
    this.fovTarget = 90;
  }
  dispose() {}
  loadAssets() {
    return new Promise((resolve, reject) => {
      const manager = new THREE.LoadingManager(resolve);

      manager.itemStart("test");
      manager.itemEnd("test");
    });
  }
  appendShaders() {
    this.shaders = {
      road: {
        vertex: RoadVertex,
        fragment: RoadFragment,
      },
      light: {
        vertex: LightVertex,
        fragment: LightFragment,
      },
    };
  }
}
