import {
  Mesh,
  ShaderMaterial,
  BoxGeometry,
  LineCurve3,
  Vector3,
  TubeGeometry,
  InstancedBufferGeometry,
  InstancedMesh,
  InstancedBufferAttribute,
  MeshStandardMaterial,
  Uniform,
  Color,
  DoubleSide,
  Vector2,
} from "three";

export class Lights {
  uniforms = {};
  constructor(webgl, options) {
    this.webgl = webgl;
    this.options = options;
    this.uniforms.uTimeSpeed = { value: options.uTimeSpeed };
    this.uniforms.uColor = new Uniform(new Color(options.color));
    this.uniforms.uTime = {
      value: 0,
    };
    this.uniforms = {
      ...this.uniforms,
      ...options.uniforms
    };
  }
  init() {
    const Curve = new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, 0, -1));
    const BaseGeo = new TubeGeometry(Curve, 20, 1, 8, false);

    const { vertex, fragment } = this.webgl.shaders.light;
    const Mat = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: this.uniforms,
    });

    const InstacedCount = this.options.pairs * 2;
    const Instanced = new InstancedMesh(BaseGeo, Mat, InstacedCount);

    this.Instanced = Instanced;

    const sectionWidth = this.options.roadWidth / this.options.sections;
    const aOffset = [];

    for (let i = 0; i < InstacedCount; i++) {
      const Radius = Math.random() * 0.1 + 0.1

      const section = i % 3;

      const sectionX =
        section * sectionWidth - this.options.roadWidth / 2 + sectionWidth / 2;
      const sectionY = Radius * 1.2;
      const sectionZ = Math.random() * this.options.length;
      // const sectionZ = i / InstacedCount * this.options.length * 2

      const CarWidth = sectionWidth / 3;
      const OffsetX = Math.random() / 2;

      aOffset.push(sectionX - CarWidth + OffsetX);
      aOffset.push(sectionY);
      aOffset.push(-sectionZ);

      aOffset.push(sectionX + CarWidth + OffsetX);
      aOffset.push(sectionY);
      aOffset.push(-sectionZ);
    }

    Instanced.geometry.setAttribute(
      "aOffset",
      new InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
    );
    Instanced.frustumCulled = false;

    const aMetrics = [];
    for (let i = 0; i < InstacedCount; i++) {
      // Give it some randomness but keep it over 0.1
      let radius = Math.random() * Math.random() * 0.1 + 0.1;
      // Give it some randomness but keep it over length *0.02
      let length =
        Math.random() * this.options.length * 0.08 + this.options.length * 0.02;

      aMetrics.push(radius);
      aMetrics.push(length);
    }

    Instanced.geometry.setAttribute(
      "aMetrics",
      new InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
    );

    this.webgl.scene.add(Instanced);
  }
  update(Time) {
    this.uniforms.uTime.value = Time;
  }
}
