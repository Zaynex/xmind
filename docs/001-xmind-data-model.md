# 思维导图编辑器开发之数据模型

数据模型存在任何前端应用的。早期的 Backbone 框架诞生了 Model 的概念。
有了 Model，我们能够比较清晰得做业务层进行操作，View 层则负责具体的 UI 渲染。

在 vue 和 react 中，又有 virtual dom。我们可以理解为这是框架内部的数据模型。

思维导图内部的数据模型和 react-fiber 结构类似。

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

其内部有一个 parent 指针指向父节点，children 中包含子节点 VNode 实例。可以通过 parent 和 children 很方便找到对应元素的所在位置。

然而，这种数据模型很难直接在上层使用。以 react 为例，它强调的是数据的 immutable，推荐开发者使用 plain-object，显然我们的类和指针均不符合 immutable 的思想。

当然我们也可以违背 immutable 的思想，即每次对数据模型进行引用操作后，强制刷新整个视图。这样的话，可以绕过 react 的 shadow diff。但由于再次渲染，但当脑图节点过多的时候，性能上收益就差了。

在实际中使用 immer 对自定义类的数据模型进行 immutable 操作也困难重重，对于循环引用的数据会直接爆栈，它会将我们将所有的原型链上（包括不可枚举的）的属性访问并且做一层代理。

而本身脑图的数据模型也会占用一定的内存，如果我们上层做 immutable，把所有的渲染交给 vue 或 react 等框架来做，而框架内的数据模型也会占用大量内存，并且和脑图的数据模型高度类似，这个性能上的收益未必可观。那么为什么不直接将脑图的数据模型再扩充下，当做一个定制脑图的前端框架呢？
