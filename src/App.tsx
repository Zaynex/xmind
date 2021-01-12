import React from 'react';
import { VNode } from './types'
import { Toolbar } from './Toolbar'

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
      vNode.root = root
    }
  }
  return root
}


const log = console.log.bind(console)

const NodeCommmand = {
  createNode: (node: VNode): VNode | null => {
    log('createNode')
      if(!node.parent) {
        log(`Can't create node for root`)
        return null
      }
    
      // const root = produce(node.root, draftState => {
      //   const path = VNode.findPathToRoot(node)
      //   let id: string | undefined
      //   let effectNode: VNode | undefined = draftState
      //   while(id = path.pop()) {
      //     if(effectNode) {
      //       effectNode = effectNode.children.find(item => item.id === id)
      //     }
      //     if(!id) break;
      //   }
        // const newData = {name: 'new Node'}
        // const newNode = new VNode(newData)
        // if(!newNode || !effectNode) return
        // newNode.parent = effectNode
        // effectNode?.parent?.children.push(newNode)
      // })
      const newData = {name: 'new Node'}
      const newNode = new VNode(newData)
      newNode.parent = node
      node.parent.children.push(newNode)
      return node.root
  }
}
function useForceUpdate() {
  const [state, setState] = React.useState({})
  const forceUpdate = () => {
    setState({})
  }
  return forceUpdate
}
function App() {
  const [node, setNode] = React.useState<VNode>(convertVNode(pureData))
  const forceUpdate = useForceUpdate()
  const controller = {
    createNode: (draftNode: VNode) => {
      const newNode = NodeCommmand.createNode(draftNode)
      newNode && setNode(newNode)
      forceUpdate()
    }
  }
  return (
    <div className="App">
      <Toolbar node={node.children[0].children[0]} controller={controller}/>
      <RenderNodeChildren node={node} />
    </div>
  );
}

function RenderNodeName({node}: {node: VNode}) {
  return <div id={node.id}>{node.name}</div>
}

function RenderNode({node}: {node: VNode}) {
  let children = []
  children.push(<RenderNodeName node={node} key={node.id} />)
  return <React.Fragment>{children}</React.Fragment>
}

function RenderNodeChildren({node}: {node:VNode}) {
  const children = []
  children.push(<RenderNode node={node} key={node.id} />)
  for(let i = 0; i < node.children.length; i++) {
    children.push(<RenderNodeChildren node={node.children[i]} key={node.children[i].id}/>)
  }
  return <React.Fragment>{children}</React.Fragment>
}

export default App;
