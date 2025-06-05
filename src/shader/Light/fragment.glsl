uniform vec3 uColor;

varying float prog;


void main() {
    vec3 color = uColor;
    gl_FragColor = vec4(uColor,1.0);
}