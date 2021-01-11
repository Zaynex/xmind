import React from 'react'
import type { VNode } from '../types'
import './toolbar.css'

export function Toolbar({ node, controller }: {node: VNode, controller: any}) {
  return <div className="xmind-toolbar">
    <button onClick={() => controller.createNode(node)}>新增主题</button>
    {/* <button onClick={controller.createChildNode}>新增子主题</button> */}
  </div>
}