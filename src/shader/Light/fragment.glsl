uniform vec3 uColor;
varying float yUv;
varying float prog;


void main() {
    vec3 color = vec3(.7,0.5,0.5);
    vec3 FinalColor = mix(uColor,color,yUv*.5);
    gl_FragColor = vec4(FinalColor,1.0);
}