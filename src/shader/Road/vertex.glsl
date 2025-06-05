varying vec2 vUv;

uniform vec2 uDistortionY;
uniform vec2 uDistortionX;
uniform float uRoadLen;

#define PI 3.14159265358979

float uSin(float val){
    return sin(val) * .5 + .5;
}

vec2 Distort(float progress){
    float theta = PI * (progress) / 2.0;
    float FreqX = uDistortionX.x;
    float AmpX = uDistortionX.y;
    float FreqY = uDistortionY.x;
    float AmpY = uDistortionY.y;
    float x = uSin(theta * FreqX - PI/2.0) * AmpX;
    float y = uSin(theta * FreqY - PI/2.0) * AmpY;
    return vec2(x,y);
}

void main(){
    vUv = uv;
    vec3 transformed = position.xyz;
    vUv.y = (transformed.y + uRoadLen / 2.0) / uRoadLen;
    vec2 Distortion = Distort(vUv.y);
    transformed.xz += Distortion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.);
}