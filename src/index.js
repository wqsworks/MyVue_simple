import { effect } from './reactivity.js'
import { nodeOptions } from './runtime-dom.js'
export * from './reactivity.js'
export function render (vnode, container) {
  // vue2渲染页面 patch
  // console.log(vnode)
  // 1.初次渲染 2.dom-diff
  patch(container._vnode, vnode, container)
  container._vnode = vnode // 上一次渲染的虚拟节点
}

function patch (n1, n2, container) { // 后序diff时可以执行此方法

  // if (n1 == null) {

  // } else {

  // }

  //  组件的虚拟节点 tag是一个对象
  // 如果是组件的话，tag是对象
  if (typeof n2.tag === 'string') {
    // 如果是标签的话 例如div
    processElement(n1, n2, container) // 1)初次渲染 2）diff操作
  } else if (typeof n2.tag == 'object') {
    // 组件渲染
    mountComponent(n2, container)
  }
}

function processElement (n1, n2, container) {
  if (n1 == null) { // 初次渲染
    mountElement(n2, container)
  } else {
    patchELement(n1, n2, container)
  }
}

function patchELement (n1, n2, container) {
  // 看一下n1和n2 是否一样  考虑key 不考虑没有key的情况
  let el = n2.el = n1.el // 节点 一样就复用
  const oldProps = n1.props
  const newProps = n2.props
  // console.log(oldProps, newProps)
  patchProps(el, oldProps, newProps)

  // 比对元素中的孩子
  patchChildren(n1, n2, container)

}

// diff 比较孩子节点
function patchChildren (n1, n2, container) {
  const c1 = n1.children
  const c2 = n2.children
  // 可能一方有多个儿子 另一方没有
  if (typeof c2 == 'string') {
    if (Array.isArray(c1)) {

    }
    if (c1 !== c2) { // 直接用文本替换
      nodeOptions.hostSetElementText(container, c2)
    }
  } else {
    // 一方没有 另一方多个
    if (typeof c1 == 'string') { //先删除c1中原有内容 插入新内容
      nodeOptions.hostSetElementText(container, '')
      mountChildren(c2, container)
    } else {
      // 两方都有儿子
      patchKeyedChildren(c1, c2, container)
    }
  }

}

function patchKeyedChildren (c1, c2, container) {
  let e1 = c1.length - 1 // 老的最后一项索引
  let e2 = c2.length - 1 // 新的最后一项索引
  // 内部有优化 头头比较 尾尾比较 头尾 尾头
  const keyedToNewIndexMap = new Map()
  // 1.根据新节点 生成一个key => index的映射表
  for (let i = 0; i <= e2; i++) {
    const currentEle = c2[i] // 拿到这一项
    keyedToNewIndexMap.set(currentEle.props.key, i)
  }
  console.log(keyedToNewIndexMap)
  // 2.去老的里面找 看有没有对应的 如果有一样的复用

  // 3.新的比老的多 添加 老的比新的多 就删除
  // 4.两个人的key一样  比较属性和位置
  for (let i = 0; i <= e1; i++) {
    const oldVnode = c1[i] // 拿到这一项
    let newIndex = keyedToNewIndexMap.get(oldVnode.props.key, i)
    if (newIndex == undefined) {
      // 老的有新的没有
      nodeOptions.remove
    } else {
      // 复用
    }
  }
}


// diff比较属性
function patchProps (el, oldProps, newProps) {
  if (oldProps !== newProps) {
    // 比较属性
    // 1.将新的属性全部设置  以新的为准
    for (let key in newProps) {
      console.log(key)
      const p = oldProps[key]
      const n = newProps[key]
      if (n != p) { //老的和新的不一样 以新的为准
        nodeOptions.hostPatchProps(el, key, p, n)
      }
    }

    // 2.老的里面有 新的没有 需要删除
    for (let key in oldProps) {
      if (!newProps.hasOwnProperty(key)) { //老的和新的不一样 以新的为准
        // 如果老的里面多的要删除
        nodeOptions.hostPatchProps(el, key, oldProps[key], null)
      }
    }
  }
}


function mountElement (vnode, container) {
  const { tag, children, props } = vnode
  // 将虚拟节点和真实节点 创造映射关系
  let el = (vnode.el = nodeOptions.creteElement(tag))
  if (props) { // 将当前属性给el
    for (let key in props) {
      nodeOptions.hostPatchProps(el, key, {}, props[key])
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