import { nanoid } from 'nanoid'
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

  static findPathToRoot(node: VNode): string[] {
    let path = []
    let point = node
    while(point != node.root && point) {
      // make sure id can search from [id, parent grandfaterid,...(exclude root id)]
      path.push(point.id)
      if(point.parent) {
        point = point.parent
      } else {
        break
      }
    }
    return path
  }

  static removeParent(node: VNode) {
    if(node.parent) {
      node.parent = null
    }
    node.children.forEach(n => VNode.removeParent(n));
  }
}