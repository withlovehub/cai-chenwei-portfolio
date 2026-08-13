import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import './InfiniteMenu.css';

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);

    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;

    float scale = max(imageAspect / containerAspect,
                     containerAspect / imageAspect);

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;

    st = clamp(st, 0.0, 1.0);

    st = st * cellSize + cellOffset;

    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}
`;

class Face {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

class Vertex {
  constructor(x, y, z) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
    this.uv = vec2.create();
  }
}

class Geometry {
  constructor() {
    this.vertices = [];
    this.faces = [];
  }

  addVertex(...args) {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  addFace(...args) {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  get lastVertex() {
    return this.vertices[this.vertices.length - 1];
  }

  subdivide(divisions = 1) {
    const midPointCache = {};
    let f = this.faces;

    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array(f.length * 4);

      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache);
        const mBC = this.getMidPoint(face.b, face.c, midPointCache);
        const mCA = this.getMidPoint(face.c, face.a, midPointCache);

        const i = ndx * 4;
        newFaces[i + 0] = new Face(face.a, mAB, mCA);
        newFaces[i + 1] = new Face(face.b, mBC, mAB);
        newFaces[i + 2] = new Face(face.c, mCA, mBC);
        newFaces[i + 3] = new Face(mAB, mBC, mCA);
      });

      f = newFaces;
    }

    this.faces = f;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach(vertex => {
      vec3.normalize(vertex.normal, vertex.position);
      vec3.scale(vertex.position, vertex.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: this.vertexData,
      indices: this.indexData,
      normals: this.normalData,
      uvs: this.uvData
    };
  }

  get vertexData() {
    return new Float32Array(this.vertices.flatMap(v => Array.from(v.position)));
  }

  get normalData() {
    return new Float32Array(this.vertices.flatMap(v => Array.from(v.normal)));
  }

  get uvData() {
    return new Float32Array(this.vertices.flatMap(v => Array.from(v.uv)));
  }

  get indexData() {
    return new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c]));
  }

  getMidPoint(ndxA, ndxB, cache) {
    const cacheKey = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
      return cache[cacheKey];
    }
    const a = this.vertices[ndxA].position;
    const b = this.vertices[ndxB].position;
    const ndx = this.vertices.length;
    cache[cacheKey] = ndx;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return ndx;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    this.addVertex(
      -1,
      t,
      0,
      1,
      t,
      0,
      -1,
      -t,
      0,
      1,
      -t,
      0,
      0,
      -1,
      t,
      0,
      1,
      t,
      0,
      -1,
      -t,
      0,
      1,
      -t,
      t,
      0,
      -1,
      t,
      0,
      1,
      -t,
      0,
      -1,
      -t,
      0,
      1
    ).addFace(
      0,
      11,
      5,
      0,
      5,
      1,
      0,
      1,
      7,
      0,
      7,
      10,
      0,
      10,
      11,
      1,
      5,
      9,
      5,
      11,
      4,
      11,
      10,
      2,
      10,
      7,
      6,
      7,
      1,
      8,
      3,
      9,
      4,
      3,
      4,
      2,
      3,
      2,
      6,
      3,
      6,
      8,
      3,
      8,
      9,
      4,
      9,
      5,
      2,
      4,
      11,
      6,
      2,
      10,
      8,
      6,
      7,
      9,
      8,
      1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    steps = Math.max(4, steps);

    const alpha = (2 * Math.PI) / steps;

    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = 0.5;
    this.lastVertex.uv[1] = 0.5;

    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * 0.5 + 0.5;
      this.lastVertex.uv[1] = y * 0.5 + 0.5;

      if (i > 0) {
        this.addFace(0, i, i + 1);
      }
    }
    this.addFace(0, steps, 1);
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error';
  gl.deleteShader(shader);
  throw new Error(message);
}

function createProgram(gl, shaderSources, transformFeedbackVaryings, attribLocations) {
  const program = gl.createProgram();
  const shaders = [];

  try {
    [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
      const shader = createShader(gl, type, shaderSources[ndx]);
      shaders.push(shader);
      gl.attachShader(program, shader);
    });

    if (transformFeedbackVaryings) {
      gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
    }

    if (attribLocations) {
      for (const attrib in attribLocations) {
        gl.bindAttribLocation(program, attribLocations[attrib], attrib);
      }
    }

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Unknown WebGL program link error');
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    shaders.forEach(shader => {
      if (gl.isProgram(program)) gl.detachShader(program, shader);
      gl.deleteShader(shader);
    });
  }
}

function makeVertexArray(gl, bufLocNumElmPairs, indices) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);

  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }

  let indexBuffer = null;
  if (indices) {
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  gl.bindVertexArray(null);
  return { vertexArray: va, indexBuffer };
}

function resizeCanvasToDisplaySize(canvas, maxDpr = 2) {
  const safeMaxDpr = Number.isFinite(Number(maxDpr)) ? Math.max(0.5, Number(maxDpr)) : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, safeMaxDpr);
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  return needResize;
}

function makeBuffer(gl, sizeOrData, usage) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function createAndSetupTexture(gl, minFilter, magFilter, wrapS, wrapT) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  return texture;
}

class ArcballControl {
  isPointerDown = false;
  orientation = quat.create();
  pointerRotation = quat.create();
  rotationVelocity = 0;
  rotationAxis = vec3.fromValues(1, 0, 0);
  snapDirection = vec3.fromValues(0, 0, -1);
  snapTargetDirection;
  EPSILON = 0.1;
  IDENTITY_QUAT = quat.create();

  constructor(canvas, updateCallback, wakeCallback) {
    this.canvas = canvas;
    this.updateCallback = updateCallback || (() => null);
    this.wakeCallback = wakeCallback || (() => null);

    this.pointerPos = vec2.create();
    this.previousPointerPos = vec2.create();
    this._rotationVelocity = 0;
    this._combinedQuat = quat.create();
    this._snapRotation = quat.create();
    this._combinedStep = quat.create();
    this._midPointerPos = vec2.create();
    this._projectedP = vec3.create();
    this._projectedQ = vec3.create();
    this._normalizedA = vec3.create();
    this._normalizedB = vec3.create();
    this._rotationAxisScratch = vec3.create();

    this.previousTouchAction = canvas.style.touchAction;
    this.handlePointerDown = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      vec2.set(this.pointerPos, e.clientX, e.clientY);
      vec2.copy(this.previousPointerPos, this.pointerPos);
      this.isPointerDown = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture can fail when the browser has already cancelled the gesture.
      }
      this.wakeCallback();
    };
    this.handlePointerEnd = e => {
      this.isPointerDown = false;
      if (e?.pointerId !== undefined && canvas.hasPointerCapture?.(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      this.wakeCallback();
    };
    this.handleLostPointerCapture = () => {
      this.isPointerDown = false;
      this.wakeCallback();
    };
    this.handlePointerMove = e => {
      if (this.isPointerDown) {
        vec2.set(this.pointerPos, e.clientX, e.clientY);
        this.wakeCallback();
      }
    };

    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointerup', this.handlePointerEnd);
    canvas.addEventListener('pointercancel', this.handlePointerEnd);
    canvas.addEventListener('lostpointercapture', this.handleLostPointerCapture);
    canvas.addEventListener('pointermove', this.handlePointerMove, { passive: true });

    canvas.style.touchAction = 'none';
  }

  resetMotion() {
    this.isPointerDown = false;
    this.rotationVelocity = 0;
    this._rotationVelocity = 0;
    quat.identity(this.pointerRotation);
    quat.identity(this._combinedQuat);
  }

  needsUpdate() {
    const pointerError = 1 - Math.abs(this.pointerRotation[3]);
    const snapError = this.snapTargetDirection
      ? vec3.squaredDistance(this.snapTargetDirection, this.snapDirection)
      : 0;
    return this.isPointerDown
      || pointerError > 0.0000001
      || Math.abs(this.rotationVelocity) > 0.00002
      || snapError > 0.000001;
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointerup', this.handlePointerEnd);
    this.canvas.removeEventListener('pointercancel', this.handlePointerEnd);
    this.canvas.removeEventListener('lostpointercapture', this.handleLostPointerCapture);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.style.touchAction = this.previousTouchAction;
    this.resetMotion();
  }

  update(deltaTime, targetFrameDuration = 16) {
    const timeScale = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = timeScale;
    const snapRotation = quat.identity(this._snapRotation);

    if (this.isPointerDown) {
      const INTENSITY = 0.3 * timeScale;
      const ANGLE_AMPLIFICATION = 5 / timeScale;

      const midPointerPos = vec2.sub(this._midPointerPos, this.pointerPos, this.previousPointerPos);
      vec2.scale(midPointerPos, midPointerPos, INTENSITY);

      if (vec2.sqrLen(midPointerPos) > this.EPSILON) {
        vec2.add(midPointerPos, this.previousPointerPos, midPointerPos);

        const p = this.#project(midPointerPos, this._projectedP);
        const q = this.#project(this.previousPointerPos, this._projectedQ);
        const a = vec3.normalize(this._normalizedA, p);
        const b = vec3.normalize(this._normalizedB, q);

        vec2.copy(this.previousPointerPos, midPointerPos);

        angleFactor *= ANGLE_AMPLIFICATION;

        this.quatFromVectors(a, b, this.pointerRotation, angleFactor);
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);
      }
    } else {
      const INTENSITY = 0.1 * timeScale;
      quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);

      if (this.snapTargetDirection) {
        const SNAPPING_INTENSITY = 0.2;
        const a = this.snapTargetDirection;
        const b = this.snapDirection;
        const sqrDist = vec3.squaredDistance(a, b);
        const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
        angleFactor *= SNAPPING_INTENSITY * distanceFactor;
        this.quatFromVectors(a, b, snapRotation, angleFactor);
      }
    }

    const combinedQuat = quat.multiply(this._combinedStep, snapRotation, this.pointerRotation);
    quat.multiply(this.orientation, combinedQuat, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    const RA_INTENSITY = 0.8 * timeScale;
    quat.slerp(this._combinedQuat, this._combinedQuat, combinedQuat, RA_INTENSITY);
    quat.normalize(this._combinedQuat, this._combinedQuat);

    const rad = Math.acos(this._combinedQuat[3]) * 2.0;
    const s = Math.sin(rad / 2.0);
    let rv = 0;
    if (s > 0.000001) {
      rv = rad / (2 * Math.PI);
      this.rotationAxis[0] = this._combinedQuat[0] / s;
      this.rotationAxis[1] = this._combinedQuat[1] / s;
      this.rotationAxis[2] = this._combinedQuat[2] / s;
    }

    const RV_INTENSITY = 0.5 * timeScale;
    this._rotationVelocity += (rv - this._rotationVelocity) * RV_INTENSITY;
    this.rotationVelocity = this._rotationVelocity / timeScale;

    this.updateCallback(deltaTime);
  }

  quatFromVectors(a, b, out, angleFactor = 1) {
    const axis = vec3.cross(this._rotationAxisScratch, a, b);
    vec3.normalize(axis, axis);
    const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
    const angle = Math.acos(d) * angleFactor;
    quat.setAxisAngle(out, axis, angle);
    return out;
  }

  #project(pos, out) {
    const r = 2;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const s = Math.max(1, Math.max(w, h) - 1);

    const x = (2 * pos[0] - w - 1) / s;
    const y = (2 * pos[1] - h - 1) / s;
    let z = 0;
    const xySq = x * x + y * y;
    const rSq = r * r;

    if (xySq <= rSq / 2.0) {
      z = Math.sqrt(rSq - xySq);
    } else {
      z = rSq / Math.sqrt(xySq);
    }
    return vec3.set(out, -x, y, z);
  }
}

class InfiniteGridMenu {
  TARGET_FRAME_DURATION = 1000 / 60;
  SPHERE_RADIUS = 2;

  #time = 0;
  #deltaTime = 0;
  #deltaFrames = 0;
  #frames = 0;

  camera = {
    matrix: mat4.create(),
    near: 0.1,
    far: 40,
    fov: Math.PI / 4,
    aspect: 1,
    position: vec3.fromValues(0, 0, 3),
    up: vec3.fromValues(0, 1, 0),
    matrices: {
      view: mat4.create(),
      projection: mat4.create(),
      inversProjection: mat4.create()
    }
  };

  activeItemIndex = null;
  smoothRotationVelocity = 0;
  scaleFactor = 1.0;
  movementActive = false;
  animationFrame = null;
  destroyed = false;
  suspended = false;
  requestedVertexIndex = null;
  cameraSettled = true;

  constructor(
    canvas,
    items,
    onActiveItemChange,
    onMovementChange,
    onInit = null,
    scale = 1.0,
    onError = null,
    maxDpr = 2
  ) {
    this.canvas = canvas;
    this.items = items || [];
    this.onActiveItemChange = onActiveItemChange || (() => {});
    this.onMovementChange = onMovementChange || (() => {});
    this.onError = onError || (() => {});
    this.scaleFactor = scale;
    this.maxDpr = maxDpr;
    this.camera.position[2] = 3 * scale;
    this.pendingImages = [];
    try {
      this.#init(onInit);
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  resize() {
    if (this.destroyed || !this.gl) return;
    this.viewportSize = vec2.set(this.viewportSize || vec2.create(), this.canvas.clientWidth, this.canvas.clientHeight);

    const gl = this.gl;
    const needsResize = resizeCanvasToDisplaySize(gl.canvas, this.maxDpr);
    if (needsResize) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    this.#updateProjectionMatrix(gl);
    this.wake();
  }

  start() {
    this.wake();
  }

  wake() {
    if (this.destroyed || this.suspended || this.animationFrame !== null) return;
    this.#time = 0;
    this.animationFrame = requestAnimationFrame(time => this.run(time));
  }

  run(time = 0) {
    this.animationFrame = null;
    if (this.destroyed || this.suspended) return;
    this.#deltaTime = this.#time === 0 ? this.TARGET_FRAME_DURATION : Math.min(32, time - this.#time);
    this.#time = time;
    this.#deltaFrames = this.#deltaTime / this.TARGET_FRAME_DURATION;
    this.#frames += this.#deltaFrames;

    try {
      const needsAnotherFrame = this.#animate(this.#deltaTime);
      this.#render();
      if (needsAnotherFrame) {
        this.animationFrame = requestAnimationFrame(t => this.run(t));
      } else {
        this.#time = 0;
      }
    } catch (error) {
      this.setPaused(true);
      this.onError(error);
      return;
    }
  }

  setPaused(paused) {
    if (this.destroyed) return;
    if (paused) {
      this.suspended = true;
      if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      this.#time = 0;
      this.control?.resetMotion();
      if (this.movementActive) {
        this.movementActive = false;
        this.onMovementChange(false);
      }
      return;
    }
    this.suspended = false;
    this.wake();
  }

  focusItem(index, { immediate = false } = {}) {
    if (this.destroyed || !this.control || !this.items.length) return;
    const itemIndex = ((Number(index) || 0) % this.items.length + this.items.length) % this.items.length;
    const vertexIndex = this.#findClosestVertexForItem(itemIndex);
    if (vertexIndex === null) return;

    this.#emitActiveItem(itemIndex);
    if (immediate) {
      const localDirection = vec3.normalize(this.directionScratch.focus, this.instancePositions[vertexIndex]);
      quat.rotationTo(this.control.orientation, localDirection, this.control.snapDirection);
      this.control.resetMotion();
      this.control.snapTargetDirection = undefined;
      this.requestedVertexIndex = null;
      this.#updateCameraMatrix();
      if (this.animationFrame === null && !this.suspended) {
        this.#animate(0);
        this.#render();
      }
      return;
    }

    this.requestedVertexIndex = vertexIndex;
    this.wake();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.suspended = true;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.pendingImages.forEach(image => {
      image.onload = null;
      image.onerror = null;
    });
    this.pendingImages = [];
    this.control?.destroy();

    const gl = this.gl;
    if (gl && !gl.isContextLost()) {
      this.discVertexBuffers?.forEach(buffer => gl.deleteBuffer(buffer));
      if (this.discIndexBuffer) gl.deleteBuffer(this.discIndexBuffer);
      if (this.discInstances?.buffer) gl.deleteBuffer(this.discInstances.buffer);
      if (this.discVAO) gl.deleteVertexArray(this.discVAO);
      if (this.tex) gl.deleteTexture(this.tex);
      if (this.discProgram) gl.deleteProgram(this.discProgram);
    }
  }

  #init(onInit) {
    this.gl = this.canvas.getContext('webgl2', { antialias: true, alpha: false });
    const gl = this.gl;
    if (!gl) {
      throw new Error('No WebGL 2 context!');
    }

    this.viewportSize = vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);
    this.drawBufferSize = vec2.clone(this.viewportSize);

    this.discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], null, {
      aModelPosition: 0,
      aModelNormal: 1,
      aModelUvs: 2,
      aInstanceMatrix: 3
    });

    this.discLocations = {
      aModelPosition: gl.getAttribLocation(this.discProgram, 'aModelPosition'),
      aModelUvs: gl.getAttribLocation(this.discProgram, 'aModelUvs'),
      aInstanceMatrix: gl.getAttribLocation(this.discProgram, 'aInstanceMatrix'),
      uWorldMatrix: gl.getUniformLocation(this.discProgram, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(this.discProgram, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(this.discProgram, 'uProjectionMatrix'),
      uCameraPosition: gl.getUniformLocation(this.discProgram, 'uCameraPosition'),
      uScaleFactor: gl.getUniformLocation(this.discProgram, 'uScaleFactor'),
      uRotationAxisVelocity: gl.getUniformLocation(this.discProgram, 'uRotationAxisVelocity'),
      uTex: gl.getUniformLocation(this.discProgram, 'uTex'),
      uFrames: gl.getUniformLocation(this.discProgram, 'uFrames'),
      uItemCount: gl.getUniformLocation(this.discProgram, 'uItemCount'),
      uAtlasSize: gl.getUniformLocation(this.discProgram, 'uAtlasSize')
    };

    this.discGeo = new DiscGeometry(56, 1);
    this.discBuffers = this.discGeo.data;
    this.discVertexBuffers = [
      makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW),
      makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW)
    ];
    const { vertexArray, indexBuffer } = makeVertexArray(
      gl,
      [
        [this.discVertexBuffers[0], this.discLocations.aModelPosition, 3],
        [this.discVertexBuffers[1], this.discLocations.aModelUvs, 2]
      ],
      this.discBuffers.indices
    );
    this.discVAO = vertexArray;
    this.discIndexBuffer = indexBuffer;

    this.icoGeo = new IcosahedronGeometry();
    this.icoGeo.subdivide(1).spherize(this.SPHERE_RADIUS);
    this.instancePositions = this.icoGeo.vertices.map(v => v.position);
    this.transformedPositions = this.instancePositions.map(() => vec3.create());
    this.animationScratch = {
      origin: vec3.create(),
      up: vec3.fromValues(0, 1, 0),
      negativePosition: vec3.create(),
      scale: vec3.create(),
      targetMatrix: mat4.create(),
      scaleMatrix: mat4.create(),
      depthMatrix: mat4.fromTranslation(mat4.create(), [0, 0, -this.SPHERE_RADIUS]),
    };
    this.directionScratch = {
      inverseOrientation: quat.create(),
      nearest: vec3.create(),
      world: vec3.create(),
      normalized: vec3.create(),
      candidate: vec3.create(),
      focus: vec3.create(),
    };
    this.DISC_INSTANCE_COUNT = this.icoGeo.vertices.length;
    this.#initDiscInstances(this.DISC_INSTANCE_COUNT);

    this.worldMatrix = mat4.create();
    this.#initTexture();

    this.control = new ArcballControl(
      this.canvas,
      deltaTime => this.#onControlUpdate(deltaTime),
      () => this.wake()
    );

    this.#updateCameraMatrix();
    this.#updateProjectionMatrix(gl);
    this.resize();

    if (onInit) onInit(this);
  }

  #initTexture() {
    const gl = this.gl;
    this.tex = createAndSetupTexture(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([12, 18, 20, 255])
    );

    const itemCount = Math.max(1, this.items.length);
    this.atlasSize = Math.ceil(Math.sqrt(itemCount));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 512;

    if (!ctx) throw new Error('Canvas 2D context is unavailable');

    canvas.width = this.atlasSize * cellSize;
    canvas.height = this.atlasSize * cellSize;

    const imagePromises = this.items.map(
      item =>
        new Promise(resolve => {
          if (!item.image) {
            resolve(null);
            return;
          }
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.decoding = 'async';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = item.image;
          this.pendingImages.push(img);
        })
    );

    Promise.all(imagePromises)
      .then(images => {
        if (this.destroyed) return;
        images.forEach((img, i) => {
          const x = (i % this.atlasSize) * cellSize;
          const y = Math.floor(i / this.atlasSize) * cellSize;
          ctx.fillStyle = this.items[i]?.fallbackColor || '#11191c';
          ctx.fillRect(x, y, cellSize, cellSize);
          if (img) {
            const sourceRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
            let sourceWidth = img.naturalWidth;
            let sourceHeight = img.naturalHeight;
            let sourceX = 0;
            let sourceY = 0;
            if (sourceRatio > 1) {
              sourceWidth = img.naturalHeight;
              sourceX = (img.naturalWidth - sourceWidth) / 2;
            } else {
              sourceHeight = img.naturalWidth;
              sourceY = (img.naturalHeight - sourceHeight) / 2;
            }
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, cellSize, cellSize);
          } else {
            ctx.fillStyle = 'rgba(255,255,255,.82)';
            ctx.font = '600 52px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.items[i]?.title?.slice(0, 2) || String(i + 1).padStart(2, '0'), x + 256, y + 256);
          }
        });

        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        this.wake();
      })
      .catch(error => {
        if (this.destroyed) return;
        this.setPaused(true);
        this.onError(error);
      });
  }

  #initDiscInstances(count) {
    const gl = this.gl;
    this.discInstances = {
      matricesArray: new Float32Array(count * 16),
      matrices: [],
      buffer: gl.createBuffer()
    };
    for (let i = 0; i < count; ++i) {
      const instanceMatrixArray = new Float32Array(this.discInstances.matricesArray.buffer, i * 16 * 4, 16);
      instanceMatrixArray.set(mat4.create());
      this.discInstances.matrices.push(instanceMatrixArray);
    }
    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
    const mat4AttribSlotCount = 4;
    const bytesPerMatrix = 16 * 4;
    for (let j = 0; j < mat4AttribSlotCount; ++j) {
      const loc = this.discLocations.aInstanceMatrix + j;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  #animate(deltaTime) {
    const gl = this.gl;
    this.control.update(deltaTime, this.TARGET_FRAME_DURATION);

    const scale = 0.25;
    const SCALE_INTENSITY = 0.6;
    const scratch = this.animationScratch;
    for (let ndx = 0; ndx < this.instancePositions.length; ndx += 1) {
      const p = vec3.transformQuat(
        this.transformedPositions[ndx],
        this.instancePositions[ndx],
        this.control.orientation
      );
      const s = (Math.abs(p[2]) / this.SPHERE_RADIUS) * SCALE_INTENSITY + (1 - SCALE_INTENSITY);
      const finalScale = s * scale;
      const matrix = this.discInstances.matrices[ndx];
      vec3.negate(scratch.negativePosition, p);
      mat4.fromTranslation(matrix, scratch.negativePosition);
      mat4.targetTo(scratch.targetMatrix, scratch.origin, p, scratch.up);
      mat4.multiply(matrix, matrix, scratch.targetMatrix);
      vec3.set(scratch.scale, finalScale, finalScale, finalScale);
      mat4.fromScaling(scratch.scaleMatrix, scratch.scale);
      mat4.multiply(matrix, matrix, scratch.scaleMatrix);
      mat4.multiply(matrix, matrix, scratch.depthMatrix);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.smoothRotationVelocity = this.control.rotationVelocity;
    return this.requestedVertexIndex !== null
      || !this.cameraSettled
      || this.control.needsUpdate();
  }

  #render() {
    const gl = this.gl;
    gl.useProgram(this.discProgram);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix, false, this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix, false, this.camera.matrices.view);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix, false, this.camera.matrices.projection);
    gl.uniform3f(
      this.discLocations.uCameraPosition,
      this.camera.position[0],
      this.camera.position[1],
      this.camera.position[2]
    );
    gl.uniform4f(
      this.discLocations.uRotationAxisVelocity,
      this.control.rotationAxis[0],
      this.control.rotationAxis[1],
      this.control.rotationAxis[2],
      this.smoothRotationVelocity * 1.1
    );

    gl.uniform1i(this.discLocations.uItemCount, Math.max(1, this.items.length));
    gl.uniform1i(this.discLocations.uAtlasSize, this.atlasSize);

    gl.uniform1f(this.discLocations.uFrames, this.#frames);
    gl.uniform1f(this.discLocations.uScaleFactor, this.scaleFactor);
    gl.uniform1i(this.discLocations.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);

    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.discBuffers.indices.length,
      gl.UNSIGNED_SHORT,
      0,
      this.DISC_INSTANCE_COUNT
    );
  }

  #updateCameraMatrix() {
    mat4.targetTo(this.camera.matrix, this.camera.position, this.animationScratch.origin, this.camera.up);
    mat4.invert(this.camera.matrices.view, this.camera.matrix);
  }

  #updateProjectionMatrix(gl) {
    this.camera.aspect = Math.max(1, gl.canvas.clientWidth) / Math.max(1, gl.canvas.clientHeight);
    const height = this.SPHERE_RADIUS * 0.35;
    const distance = this.camera.position[2];
    if (this.camera.aspect > 1) {
      this.camera.fov = 2 * Math.atan(height / distance);
    } else {
      this.camera.fov = 2 * Math.atan(height / this.camera.aspect / distance);
    }
    mat4.perspective(
      this.camera.matrices.projection,
      this.camera.fov,
      this.camera.aspect,
      this.camera.near,
      this.camera.far
    );
    mat4.invert(this.camera.matrices.inversProjection, this.camera.matrices.projection);
  }

  #onControlUpdate(deltaTime) {
    const timeScale = deltaTime / this.TARGET_FRAME_DURATION + 0.0001;
    let damping = 5 / timeScale;
    let cameraTargetZ = 3 * this.scaleFactor;

    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;

    if (isMoving !== this.movementActive) {
      this.movementActive = isMoving;
      this.onMovementChange(isMoving);
    }

    if (!this.control.isPointerDown) {
      const nearestVertexIndex = this.requestedVertexIndex ?? this.#findNearestVertexIndex();
      const itemIndex = nearestVertexIndex % Math.max(1, this.items.length);
      this.#emitActiveItem(itemIndex);
      const snapDirection = vec3.normalize(
        this.directionScratch.normalized,
        this.#getVertexWorldPosition(nearestVertexIndex, this.directionScratch.world)
      );
      this.control.snapTargetDirection = snapDirection;
      if (
        this.requestedVertexIndex !== null &&
        vec3.squaredDistance(snapDirection, this.control.snapDirection) < 0.0005
      ) {
        this.requestedVertexIndex = null;
      }
    } else {
      this.requestedVertexIndex = null;
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5;
      damping = 7 / timeScale;
    }

    const cameraDelta = cameraTargetZ - this.camera.position[2];
    this.camera.position[2] += cameraDelta / damping;
    this.cameraSettled = Math.abs(cameraDelta) < 0.0005;
    if (this.cameraSettled) this.camera.position[2] = cameraTargetZ;
    this.#updateCameraMatrix();
  }

  #findNearestVertexIndex() {
    const n = this.control.snapDirection;
    const inversOrientation = quat.conjugate(
      this.directionScratch.inverseOrientation,
      this.control.orientation
    );
    const nt = vec3.transformQuat(this.directionScratch.nearest, n, inversOrientation);

    let maxD = -1;
    let nearestVertexIndex = 0;
    for (let i = 0; i < this.instancePositions.length; ++i) {
      const d = vec3.dot(nt, this.instancePositions[i]);
      if (d > maxD) {
        maxD = d;
        nearestVertexIndex = i;
      }
    }
    return nearestVertexIndex;
  }

  #findClosestVertexForItem(itemIndex) {
    let closestVertexIndex = null;
    let closestDot = -Infinity;
    for (let i = 0; i < this.instancePositions.length; i += 1) {
      if (i % this.items.length !== itemIndex) continue;
      const worldPosition = vec3.normalize(
        this.directionScratch.candidate,
        this.#getVertexWorldPosition(i, this.directionScratch.world)
      );
      const dot = vec3.dot(worldPosition, this.control.snapDirection);
      if (dot > closestDot) {
        closestDot = dot;
        closestVertexIndex = i;
      }
    }
    return closestVertexIndex;
  }

  #emitActiveItem(index) {
    if (this.activeItemIndex === index) return;
    this.activeItemIndex = index;
    this.onActiveItemChange(index);
  }

  #getVertexWorldPosition(index, out = this.directionScratch.world) {
    const nearestVertexPos = this.instancePositions[index];
    return vec3.transformQuat(out, nearestVertexPos, this.control.orientation);
  }
}

const defaultItems = [
  {
    image: '',
    link: '',
    title: '联系方式',
    description: '请添加想展示的联系账号。'
  }
];

function normalizeIndex(index, length) {
  if (!length) return 0;
  return ((Number(index) || 0) % length + length) % length;
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(media.matches);
    if (media.addEventListener) media.addEventListener('change', handleChange);
    else media.addListener?.(handleChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', handleChange);
      else media.removeListener?.(handleChange);
    };
  }, []);

  return reducedMotion;
}

export default function InfiniteMenu({
  items = [],
  scale = 1.0,
  maxDpr = 2,
  forceFallback = false,
  initialIndex = 0,
  activeIndex,
  onActiveItemChange,
  onMovementChange,
  onSelect,
  onError,
  actionLabel = '查看详情',
  ariaLabel = '联系方式球形切换菜单',
  className = ''
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const sketchRef = useRef(null);
  const callbacksRef = useRef({ onActiveItemChange, onMovementChange, onSelect, onError });
  callbacksRef.current = { onActiveItemChange, onMovementChange, onSelect, onError };

  const menuItems = items.length ? items : defaultItems;
  const controlledIndex = activeIndex === undefined ? undefined : normalizeIndex(activeIndex, menuItems.length);
  const [internalIndex, setInternalIndex] = useState(() =>
    normalizeIndex(controlledIndex ?? initialIndex, menuItems.length)
  );
  const [isMoving, setIsMoving] = useState(false);
  const [webglError, setWebglError] = useState(null);
  const reducedMotion = usePrefersReducedMotion();
  const activeIndexRef = useRef(internalIndex);
  const initialFocusIndexRef = useRef(controlledIndex ?? initialIndex);
  initialFocusIndexRef.current = controlledIndex ?? initialIndex;
  const descriptionId = useId();
  const currentIndex = controlledIndex ?? internalIndex;
  const activeItem = menuItems[normalizeIndex(currentIndex, menuItems.length)];
  const showFallback = forceFallback || reducedMotion || Boolean(webglError);

  const commitActiveIndex = useCallback(
    index => {
      const nextIndex = normalizeIndex(index, menuItems.length);
      activeIndexRef.current = nextIndex;
      setInternalIndex(previous => (previous === nextIndex ? previous : nextIndex));
      callbacksRef.current.onActiveItemChange?.(menuItems[nextIndex], nextIndex);
    },
    [menuItems]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || showFallback) return undefined;

    let sketch;
    let disposed = false;
    let isIntersecting = true;

    const handleActiveItem = index => {
      if (!disposed) commitActiveIndex(index);
    };

    const handleMovement = moving => {
      if (disposed) return;
      setIsMoving(moving);
      callbacksRef.current.onMovementChange?.(moving);
    };

    const handleError = error => {
      if (disposed) return;
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setWebglError(normalizedError);
      callbacksRef.current.onError?.(normalizedError);
    };

    const syncPauseState = () => {
      sketch?.setPaused(document.hidden || !isIntersecting);
    };

    const handleVisibilityChange = () => syncPauseState();
    const handleContextLost = event => {
      event.preventDefault();
      handleError(new Error('WebGL context was lost'));
    };

    try {
      sketch = new InfiniteGridMenu(
        canvas,
        menuItems,
        handleActiveItem,
        handleMovement,
        null,
        scale,
        handleError,
        maxDpr
      );
      sketchRef.current = sketch;
      sketch.start();
      sketch.focusItem(initialFocusIndexRef.current, { immediate: true });
    } catch (error) {
      handleError(error);
      return undefined;
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => sketch?.resize());
    resizeObserver?.observe(root);
    const handleWindowResize = () => sketch?.resize();
    if (!resizeObserver) window.addEventListener('resize', handleWindowResize, { passive: true });

    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            entries => {
              isIntersecting = entries[0]?.isIntersecting ?? true;
              syncPauseState();
            },
            { threshold: 0.01 }
          );
    intersectionObserver?.observe(root);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    sketch.resize();
    syncPauseState();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (!resizeObserver) window.removeEventListener('resize', handleWindowResize);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (sketchRef.current === sketch) sketchRef.current = null;
      sketch.destroy();
    };
  }, [commitActiveIndex, maxDpr, menuItems, scale, showFallback]);

  useEffect(() => {
    if (controlledIndex === undefined) return;
    activeIndexRef.current = controlledIndex;
    setInternalIndex(controlledIndex);
    sketchRef.current?.focusItem(controlledIndex, { immediate: reducedMotion });
  }, [controlledIndex, reducedMotion]);

  useEffect(() => {
    const nextIndex = normalizeIndex(controlledIndex ?? initialIndex, menuItems.length);
    activeIndexRef.current = nextIndex;
    setInternalIndex(nextIndex);
  }, [controlledIndex, initialIndex, menuItems.length]);

  const focusIndex = useCallback(
    index => {
      const nextIndex = normalizeIndex(index, menuItems.length);
      if (sketchRef.current) {
        sketchRef.current.focusItem(nextIndex, { immediate: reducedMotion });
      } else {
        commitActiveIndex(nextIndex);
      }
    },
    [commitActiveIndex, menuItems.length, reducedMotion]
  );

  const handleButtonClick = useCallback(
    event => {
      if (!activeItem) return;
      const index = normalizeIndex(currentIndex, menuItems.length);
      if (callbacksRef.current.onSelect) {
        callbacksRef.current.onSelect(activeItem, index, event);
        return;
      }
      if (!activeItem.link) return;
      if (/^https?:\/\//i.test(activeItem.link)) {
        window.open(activeItem.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.assign(activeItem.link);
      }
    },
    [activeItem, currentIndex, menuItems.length]
  );

  const handleKeyDown = useCallback(
    event => {
      const current = normalizeIndex(activeIndexRef.current, menuItems.length);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusIndex(current - 1);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusIndex(current + 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        focusIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        focusIndex(menuItems.length - 1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleButtonClick(event);
      }
    },
    [focusIndex, handleButtonClick, menuItems.length]
  );

  return (
    <div
      ref={rootRef}
      className={`infinite-menu ${className}`.trim()}
      data-renderer={showFallback ? 'fallback' : 'webgl'}
    >
      {showFallback ? (
        <div className="infinite-menu-fallback" role="listbox" aria-label={ariaLabel}>
          {menuItems.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === normalizeIndex(currentIndex, menuItems.length)}
              className="infinite-menu-fallback-item"
              key={item.id ?? item.title ?? index}
              onClick={() => focusIndex(index)}
            >
              {item.image ? <img src={item.image} alt="" loading="lazy" decoding="async" /> : null}
              <span>{item.title}</span>
            </button>
          ))}
          {webglError ? <span className="infinite-menu-status">已启用兼容显示模式</span> : null}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="infinite-grid-menu-canvas"
          tabIndex={0}
          role="application"
          aria-label={`${ariaLabel}，当前为${activeItem?.title || '未选择'}`}
          aria-describedby={descriptionId}
          aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End Enter Space"
          onKeyDown={handleKeyDown}
        />
      )}

      {activeItem ? (
        <>
          <div className="infinite-menu-copy" aria-live="polite">
            <h2 className={`face-title ${isMoving ? 'inactive' : 'active'}`}>{activeItem.title}</h2>
            <p id={descriptionId} className={`face-description ${isMoving ? 'inactive' : 'active'}`}>
              {activeItem.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleButtonClick}
            aria-label={`${actionLabel}：${activeItem.title}`}
            className={`action-button ${isMoving ? 'inactive' : 'active'}`}
          >
            <span className="action-button-label">{actionLabel}</span>
            <span className="action-button-icon" aria-hidden="true">
              ↗
            </span>
          </button>
        </>
      ) : null}
    </div>
  );
}
