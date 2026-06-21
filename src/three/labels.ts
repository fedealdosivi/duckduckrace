import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export function createLabelRenderer(container: HTMLElement): CSS2DRenderer {
  const renderer = new CSS2DRenderer()
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0'
  renderer.domElement.style.left = '0'
  renderer.domElement.style.pointerEvents = 'none'
  container.appendChild(renderer.domElement)
  return renderer
}

export function createNameLabel(name: string): CSS2DObject {
  const div = document.createElement('div')
  div.className = 'duck-name-label'
  div.textContent = name
  return new CSS2DObject(div)
}
