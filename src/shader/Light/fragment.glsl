uniform vec3 uColor;
varying float yUv;
varying float prog;


void main() {
    gl_FragColor = vec4(uColor,1.0);
}