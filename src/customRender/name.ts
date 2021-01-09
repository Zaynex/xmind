import type { VNode } from '../types'
export function renderNodeName(node: VNode) {
  const div = document.createElement('div')
  div.innerText = node.name
  return div
}