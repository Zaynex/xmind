import type { VNode } from '../types'
import { renderNodeName } from './name'

export function renderNodes(nodes: VNode) {
  const element = document.createElement('div')
  function renderNode(node: VNode) {
    const nameNode = renderNodeName(node)
    element.appendChild(nameNode)
  }

  dfsRenderNodes(nodes)

  function dfsRenderNodes(nodes: VNode) {
    renderNode(nodes)
    nodes.children.forEach(n => {
      dfsRenderNodes(n)
    })
  }
  document.body.appendChild(element)
}