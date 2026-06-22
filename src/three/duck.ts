import * as THREE from 'three'
import { duckHue } from '@/utils/duckColors'

export interface DuckMesh {
  group: THREE.Group
  /** Random per-duck phase so idle bobbing/wing-flap animation isn't synchronized. */
  animationPhase: number
  leftWing: THREE.Mesh
  rightWing: THREE.Mesh
}

const bodyGeometry = new THREE.SphereGeometry(0.55, 16, 12)
const headGeometry = new THREE.SphereGeometry(0.32, 16, 12)
const beakGeometry = new THREE.ConeGeometry(0.16, 0.34, 10)
const eyeGeometry = new THREE.SphereGeometry(0.045, 8, 8)
const wingGeometry = new THREE.SphereGeometry(0.3, 12, 8)
const tailGeometry = new THREE.ConeGeometry(0.18, 0.32, 10)

const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.5 })
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 })

/** Builds a small stylized duck from primitive geometry - no external assets. */
export function createDuckMesh(bodyColor: number): DuckMesh {
  const group = new THREE.Group()
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 })
  const wingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bodyColor).multiplyScalar(0.8),
    roughness: 0.6,
  })

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.scale.set(1, 0.85, 1.25)
  body.position.y = 0.55
  group.add(body)

  const head = new THREE.Mesh(headGeometry, bodyMaterial)
  head.position.set(0, 0.95, 0.55)
  group.add(head)

  const beak = new THREE.Mesh(beakGeometry, beakMaterial)
  beak.rotation.x = Math.PI / 2
  beak.position.set(0, 0.92, 0.92)
  group.add(beak)

  const eyeOffsetX = 0.14
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-eyeOffsetX, 1.02, 0.72)
  group.add(leftEye)
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(eyeOffsetX, 1.02, 0.72)
  group.add(rightEye)

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial)
  leftWing.scale.set(0.4, 0.8, 1)
  leftWing.position.set(-0.5, 0.6, -0.05)
  group.add(leftWing)

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial)
  rightWing.scale.set(0.4, 0.8, 1)
  rightWing.position.set(0.5, 0.6, -0.05)
  group.add(rightWing)

  const tail = new THREE.Mesh(tailGeometry, bodyMaterial)
  tail.rotation.x = Math.PI / 2.3
  tail.position.set(0, 0.65, -0.75)
  group.add(tail)

  group.traverse((child) => {
    child.castShadow = false
    child.receiveShadow = false
  })

  return { group, animationPhase: Math.random() * Math.PI * 2, leftWing, rightWing }
}

export function duckColorForIndex(index: number, total: number): number {
  return new THREE.Color().setHSL(duckHue(index, total), 0.65, 0.6).getHex()
}
