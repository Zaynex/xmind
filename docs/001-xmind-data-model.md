# 思维导图编辑器开发之数据模型

数据模型存在任何前端应用的。早期的 Backbone 框架诞生了 Model 的概念。
有了 Model，我们能够比较清晰得做业务层进行操作，View 层则负责具体的 UI 渲染。

在 vue 和 react 中，又有 virtual dom。我们可以理解为这是框架内部的数据模型。

思维导图内部的数据模型和 react-fiber 结构类似。

## 定义数据模型

```js
export class VNode {
  id: string
  name: string
  data: PureNode
  parent: VNode | null
  children: VNode[] = []
  root!: VNode
  constructor(data: PureNode) {
    this.id = nanoid(7)
    this.name = data.name
    this.parent = null
    this.data = data
  }
```

数据模型内部有一个 parent 指针指向父节点，children 中包含子节点 VNode 实例。可以通过 parent 和 children 很方便找到对应元素的所在位置。

## 数据模型转换

通常服务端保存的是纯数据，因此我们还需要将纯数据结构转换为脑图内部的数据模型。

```js
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
```

## 渲染数据

转换完成之后，从 Root 节点以深度优先的顺序依次遍历渲染

```js
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
```

## 数据模型之副作用操作

然而，这种数据模型的也未必能适用于各种框架中。以 react 为例，它强调的是数据的 immutable，推荐开发者使用 plain-object，显然我们的类和指针均不符合 immutable 的思想。

当然我们也可以违背 immutable 的思想，即每次对数据模型进行引用操作后，强制刷新整个视图。

### 在 React 使用数据模型

在 Airbnb 的 `visx` 中，有 hierarchy 图表，它使用 React 进行视图渲染，通过点击节点直接节点分支收起展开的方式是直接修改引用对象，再通过 forceUpdate 来强制更新视图。

以下是脑图在 react 中的尝试。

```js
function useForceUpdate() {
  const [, setState] = React.useState({})
  const forceUpdate = () => setState({})
  return forceUpdate
}

const NodeCommmand = {
  createNode: (node: VNode): VNode | null => {
    if(!node.parent) {
      return null
    }
    const newData = {name: 'new Node'}
    const newNode = new VNode(newData)
    newNode.parent = node
    node.parent.children.push(newNode)
    return node.root
  }
}

function App() {
  const [node, setNode] = React.useState<VNode>(convertVNode(pureData))
  const controller = {
    createNode: (draftNode: VNode) => {
      const newNode = NodeCommmand.createNode(draftNode)
      newNode && setNode(newNode)
      forceUpdate()
    }
  }

  return <React.Fragment>
    <button onClick={() => controller.createNode(node.children[0]))}>新增节点</button>
    <RenderNodeChildren node={node} />
  </React.Fragment>
}
```

以下是 RenderNodeChildren 的操作。

```js
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
```

在目前我们对节点的引用进行副作用操作，还无法触发 React 的变更，因此使用 forceUpdate 做强制页面刷新。这样的话，可以绕过 react 的 shallow diff。但由于强制渲染，但当脑图节点过多的时候，性能上收益就差了。

### 使用 immutable 的可行性

在实际中使用 immer 对目前的数据模型进行 immutable 操作也困难重重，对于循环引用的数据会直接调用栈溢出，它会将我们将所有的原型链上（包括不可枚举的）的属性访问并且做一层代理。

而本身脑图的数据模型也会占用一定的内存，如果我们上层做 immutable，把所有的渲染交给 vue 或 react 等框架来做，而框架内的数据模型也会占用大量内存，这个性能上的收益未必可观。更为关键的是，和脑图的数据模型和 virtual dom 高度类似，那么为什么不直接将脑图的数据模型再扩充下，当做一个定制脑图的前端框架呢？

## 数据模型操作

其实在之前的例子里，已经有一个最简单的 createNode 的节点操作。我们需要给操作的逻辑单独抽离出来。所以这里暂时的命名叫 Command。将所有节点的操作抽象成一个单独的命令处理。封装成命令之后，对于后续的撤销回退操作比较友好，只要我们将所有命令具体的指令以及必要的参数保存。

```js
type Command = {
  type: string,
  id: string,
  payload: PureNode
}

interface CommandManager {
  excute(cmd: Command): VNode
  undoHistory: Command[]
  redoHistory: Command[]
}
```

这部分内容会放到后续再优化。

## 总结

脑图的数据模型是一个具有循环引用的结构，而非纯对象。为了 immutable 会让脑图的许多操作变得不太灵活，之所以是类的结构是因为后续还有许多布局需要有这层 Model 的概念更好的表达布局以及计算。

由于最后不再依托于框架来做视图的渲染，因此这种数据模型不仅能为数据各类操作带来便利，同时依然有保持优秀的渲染能力。

下文将接介绍脑图的布局算法。
