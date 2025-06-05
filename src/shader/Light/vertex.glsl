attribute vec3  aOffset;
attribute vec2 aMetrics;
uniform float uTime;
uniform float uTimeSpeed;
uniform float uRoadLen;
varying float prog;
uniform vec2 uDistortionY;
uniform vec2 uDistortionX;

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
    vec3 transformed = position.xyz;

    float radius = aMetrics.r;
    float len = aMetrics.g;
    transformed.z *= len;
    float zOffset = uTime * uTimeSpeed + aOffset.z;
    zOffset = len - mod(zOffset,uRoadLen);

    transformed.z += zOffset;
    transformed.xy *= radius;
    transformed.xy += aOffset.xy;

    float progress = abs(transformed.z / uRoadLen);
    progress = clamp(progress,0.0,1.0);
    prog = progress;

    vec2 Distortion = Distort(progress);

    transformed.xy += Distortion;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.);
}