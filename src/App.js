import "./styles.css";
import * as THREE from "three";

// Shaders Importing
import RoadVertex from "./shader/Road/vertex.glsl";
import RoadFragment from "./shader/Road/fragment.glsl";
import LightVertex from "./shader/Light/vertex.glsl";
import LightFragment from "./shader/Light/fragment.glsl";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// GUI
import GUI from "lil-gui";

// Utisl / Classes
import { BasicThreeDemo } from "./BasicThreeDemo";
import { Road } from "./Lights/Road";
import { Lights } from "./Lights/Lights";
import { Lerp } from "./utils/lerp";

export class App extends BasicThreeDemo {
  constructor(container) {
    super(container);
    this.appendShaders();
    this.container = container;

    // Gui
    this.gui = null;

    // Postprocessing Params
    const params = {
      threshold: {
        value: 0,
        min: 0,
        max: 1,
      },
      strength: {
        value: 0.4,
        max: 3,
        min: 0,
      },
      radius: {
        value: 0,
        min: 0,
        max: 1,
      },
      exposure: {
        value: 0,
        min: 0,
        max: 2,
      },
    };

    this.params = params;

    // Camera
    this.camera.position.z = -5;
    this.camera.position.y = 7;
    this.camera.position.x = 0;
    this.camera.zProg = 0;
    this.speedUp = 0;
    this.targetSpeedUp = 0;
    this.timeOffset = 0;
    this.fovTarget = 90;
    this.camera.fov = 90;
    this.camera.updateProjectionMatrix();
    this.fovChange = 0;
    this.lookAt = new THREE.Vector3(0,0,0)

    // Options for Light and Road
    const options = {
      width: 40,
      roadWidth: 9,
      length: 600,
      pairs: 50,
      sections: 3,
      uTimeSpeed: 50,
      gap: 2,
      uniforms: {
        uDistortionX: {
          value: new THREE.Vector2(3, 200),
        },
        uDistortionY: {
          value: new THREE.Vector2(5, -60),
        },
        uRoadLen: { value: 0 },
      },
    };

    // Uniforms
    options.uniforms.uRoadLen.value = options.length;
    // options
    this.options = options;

    // Mouse Events
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    // Road / Lights
    this.road = new Road(this, options);
    this.LeftLights = new Lights(this, { ...options, color: 0xe32636 });
    this.MiddelLights = new Lights(this, { ...options, color: 0x0095fd });
    this.RightLights = new Lights(this, { ...options, color: 0xf7f754 });
  }
  init() {
    // Mouse Events
    this.container.addEventListener("mousedown", this.onMouseDown);
    this.container.addEventListener("mouseup", this.onMouseUp);
    this.container.addEventListener("mouseout", this.onMouseUp);

    // Road / Lights
    this.road.init();
    this.LeftLights.init();
    this.LeftLights.Instanced.position.setX(
      -this.options.roadWidth / 2 - this.options.gap / 2 - 6
    );
    this.MiddelLights.init();
    this.RightLights.init();
    this.RightLights.Instanced.position.setX(
      this.options.roadWidth / 2 + this.options.gap / 2 + 6
    );

    // GUi
    this.initGui();
    this.initPostProcessing();

    // Render Loop
    this.tick();
  }
  update(delta) {
    this.camera.zProg += delta * .1;
    this.camera.zProg %= 1;
    this.MoveCamera(this.camera);
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
    this.MiddelLights.update(Math.sin(Time * 0.1) * 10);
    this.RightLights.update(-Time);

    this.bloomPass.threshold = this.params.threshold.value;
    this.bloomPass.strength = this.params.strength.value;
    this.bloomPass.radius = this.params.radius.value;

    this.composer.render();
  }
  uSin(val = 0) {
    return Math.sin(val) * 0.5 + 0.5;
  }
  Distort(progress,FreqX,FreqY,AmpX,AmpY) {
    let theta = (Math.PI * progress) / 2.0;
    let x = this.uSin(theta * FreqX - Math.PI / 2.0) * AmpX;
    let y = this.uSin(theta * FreqY - Math.PI / 2.0) * AmpY;
    return [x,y];
  }
  MoveCamera(camera) {
    const Prog = camera.zProg;
    const DistortX = this.options.uniforms.uDistortionX.value;
    const DistortY = this.options.uniforms.uDistortionY.value;
    const XFreq = DistortX.x;
    const XAmp = DistortX.y;
    const YFreq = DistortY.x;
    const YAmp = DistortY.y;

    const [x,y] = this.Distort(Prog,XFreq,YFreq,XAmp,YAmp)
    camera.position.x = x
    camera.position.y = 10 +  y
    camera.position.z = -7 - this.options.length * Prog

    // let LookAtProg = Prog + .1
    // LookAtProg = Math.max(LookAtProg,1)
    // const LookAt = this.Distort(LookAtProg,XFreq,YFreq,XAmp,YAmp)
    // this.lookAt.set(LookAt[0],LookAt[1],-7 - this.options.length * LookAtProg)
    // camera.lookAt(this.lookAt)
  }
  onMouseDown(e) {
    this.targetSpeedUp = 0.1;
    this.fovTarget = 140;
  }
  onMouseUp(e) {
    this.targetSpeedUp = 0;
    this.fovTarget = 90;
  }
  initPostProcessing() {
    const renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight)
    );
    this.bloomPass.threshold = this.params.threshold.value;
    this.bloomPass.strength = this.params.strength.value;
    this.bloomPass.radius = this.params.radius.value;

    // const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(this.bloomPass);
    // this.composer.addPass(outputPass);
  }
  initGui() {
    this.gui = new GUI();

    Object.entries(this.params).map(([key, { value, min, max }]) => {
      this.gui.add(this.params[key], "value").name(key).min(min).max(max);
    });
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
