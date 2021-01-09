let globalId = 0
export class VNode {
  id: string
  name: string
  data: PureNode
  parent: VNode | null
  children: VNode[] = []
  constructor(data: PureNode) {
    this.id = String(globalId)
    this.name = data.name
    this.parent = null
    this.data = data
  }
}