import { effect } from './reactivity.js'
import { nodeOptions } from './runtime-dom.js'
export * from './reactivity.js'
export function render (vnode, container) {
  // vue2渲染页面 patch
  console.log(vnode)
  // 1.初次渲染 2.dom-diff
  patch(null, vnode, container)
}

function patch (n1, n2, container) { // 后序diff时可以执行此方法
  //  组件的虚拟节点 tag是一个对象

  // 如果是组件的话，tag是对象
  if (typeof n2.tag === 'string') {
    // 如果是标签的话 例如div
    mountElement(n2, container)
  } else if (typeof n2.tag == 'object') {
    // 组件渲染
    mountComponent(n2, container)
  }
}


function mountElement (vnode, container) {
  const { tag, children, props } = vnode
  // 将虚拟节点和真实节点 创造映射关系
  let el = (vnode.el = nodeOptions.creteElement(tag))
  if (props) { // 将当前属性给el
    for (let key in props) {
      nodeOptions.hostPatchProps(el, key, props[key])
    }
  }
  if (Array.isArray(children)) {
    mountChildren(children, el)
  } else {
    nodeOptions.hostSetElementText(el, children)
  }
  nodeOptions.insert(el, container)
}

function mountChildren (children, container) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    patch(null, child, container) //递归挂载孩子节点
  }
}

function mountComponent (vnode, container) {
  // 根据组件创建一个实例
  const instance = {
    vnode,
    render: null, // 当前setup的返回值
    subTree: null // render方法的返回值
  }
  const Component = vnode.tag
  instance.render = Component.setup(vnode.props, instance)

  // 类比watcher 每个组件都有一个effect  用于局部重新渲染
  effect(() => {
    // 如果返回的是对象 template => render方法 把render方法挂载到对象身上
    // 这里也可以做vue2兼容 拿到vue2中的options API 和  setup的返回值
    instance.subTree = instance.render && instance.render()
    patch(null, instance.subTree, container) // 将组件插入到容器中
  })
}