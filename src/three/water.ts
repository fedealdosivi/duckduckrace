import * as THREE from 'three'

const vertexShader = /* glsl */ `
  uniform float time;
  varying float vWave;
  void main() {
    vec3 pos = position;
    float wave = sin(pos.x * 0.4 + time * 1.1) * 0.12 + cos(pos.y * 0.3 - time * 0.8) * 0.1;
    pos.z += wave;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying float vWave;
  uniform vec3 baseColor;
  uniform vec3 highlightColor;
  void main() {
    float highlight = smoothstep(0.05, 0.18, vWave);
    vec3 color = mix(baseColor, highlightColor, highlight * 0.6);
    gl_FragColor = vec4(color, 1.0);
  }
`

export function createWaterMesh(width: number, depth: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, depth, 60, 60)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(0x2f8fd1) },
      highlightColor: { value: new THREE.Color(0x9fe0ff) },
    },
    vertexShader,
    fragmentShader,
  })
  const mesh = new THREE.Mesh(geometry, material)
  // Lay the plane flat; local Z (displaced above for waves) becomes world up.
  mesh.rotation.x = -Math.PI / 2
  return mesh
}

export function updateWater(mesh: THREE.Mesh, elapsedSeconds: number): void {
  const material = mesh.material as THREE.ShaderMaterial
  material.uniforms.time.value = elapsedSeconds
}
