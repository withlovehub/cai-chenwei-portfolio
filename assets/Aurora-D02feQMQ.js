import{a as e}from"./rolldown-runtime-BYbx6iT9.js";import{i as t,r as n}from"./framework-BpSqSxVs.js";import{a as r,i,n as a,r as o,t as s}from"./Triangle-Bhp_gdsc.js";var c=e(t(),1),l=n(),u=`#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`,d=`#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float factor = clamp(uv.x, 0.0, 1.0);
  vec3 left = mix(uColorStops[0], uColorStops[1], smoothstep(0.0, 0.5, factor));
  vec3 rampColor = mix(left, uColorStops[2], smoothstep(0.5, 1.0, factor));
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = uv.y * 2.0 - height + 0.2;
  float intensity = 0.6 * height;
  float alpha = smoothstep(0.20 - uBlend * 0.5, 0.20 + uBlend * 0.5, intensity);
  fragColor = vec4(intensity * rampColor * alpha, alpha);
}
`;function f({colorStops:e=[`#67e7ff`,`#91d6e2`,`#ff6859`],amplitude:t=1,blend:n=.55,speed:f=.7,className:p=``}){let m=(0,c.useRef)(null),h=(0,c.useRef)({colorStops:e,amplitude:t,blend:n,speed:f});return h.current={colorStops:e,amplitude:t,blend:n,speed:f},(0,c.useEffect)(()=>{let c=m.current;if(!c)return;let l,f,p=0,g=!0,_=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;try{l=new i({alpha:!0,premultipliedAlpha:!0,antialias:!1,dpr:Math.min(devicePixelRatio,1.5)}),f=l.gl}catch{c.classList.add(`aurora-fallback`);return}f.clearColor(0,0,0,0),f.enable(f.BLEND),f.blendFunc(f.ONE,f.ONE_MINUS_SRC_ALPHA);let v=new s(f);v.attributes.uv&&delete v.attributes.uv;let y=e=>{let t=[...e];for(;t.length<3;)t.push(t.at(-1)||`#ffffff`);return t.slice(0,3).map(e=>{let t=new a(e);return[t.r,t.g,t.b]})},b=new r(f,{vertex:u,fragment:d,uniforms:{uTime:{value:0},uAmplitude:{value:t},uColorStops:{value:y(e)},uResolution:{value:[1,1]},uBlend:{value:n}}}),x=new o(f,{geometry:v,program:b});c.appendChild(f.canvas);let S=()=>{let e=Math.max(c.offsetWidth,1),t=Math.max(c.offsetHeight,1);l.setSize(e,t),b.uniforms.uResolution.value=[e,t]},C=new ResizeObserver(S);C.observe(c),S();let w=new IntersectionObserver(([e])=>{g=e.isIntersecting});w.observe(c);let T=e=>{let t=h.current;(g||_)&&(b.uniforms.uTime.value=e*1e-4*t.speed,b.uniforms.uAmplitude.value=t.amplitude,b.uniforms.uBlend.value=t.blend,b.uniforms.uColorStops.value=y(t.colorStops),l.render({scene:x})),_||(p=requestAnimationFrame(T))};return T(0),()=>{cancelAnimationFrame(p),C.disconnect(),w.disconnect(),f.canvas.parentNode===c&&c.removeChild(f.canvas),f.getExtension(`WEBGL_lose_context`)?.loseContext()}},[]),(0,l.jsx)(`div`,{className:`aurora-container ${p}`.trim(),ref:m,"aria-hidden":`true`})}export{f as default};