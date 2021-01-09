import React from 'react';
import { VNode } from './types'

const pureData = {
  name: 'root',
  children: [
    { name: 'child #1', children: [{ name: 'child-child #1' }] },
    {
      name: 'child #2',
      children: [
        { name: 'grandchild #1' },
        { name: 'grandchild #2' },
        { name: 'grandchild #3' },
      ],
    },
  ],
}

function convertVNode(data: PureNode) {
  const root = new VNode(data)
  const nodes = [root]
  let node
  while ((node = nodes.pop())) {
    const childs = node.data.children || []
    for (let i = 0; i < childs.length; i++) {
      const vNode = new VNode(childs[i])
      nodes.unshift(vNode)
      node.children.push(vNode)
      vNode.parent = node
    }
  }
  return root
}

const node = convertVNode(pureData)

function App() {
  return (
    <div className="App">
      <RenderNodeChildren node={node} />
    </div>
  );
}


function RenderNodeName({node}: {node: VNode}) {
  return <div>{node.name}</div>
}

function RenderNode({node}: {node: VNode}) {
  let children = []
  children.push(<RenderNodeName node={node} key={node.id} />)
  return <React.Fragment>{children}</React.Fragment>
}

function RenderNodeChildren({node}: {node:VNode}) {
  const children = []
  children.push(<RenderNode node={node} />)
  for(let i = 0; i < node.children.length; i++) {
    children.push(<RenderNodeChildren node={node.children[i]} key={node.id}/>)
  }
  return <React.Fragment>{children}</React.Fragment>
}

export default App;
