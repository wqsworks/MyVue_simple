// 运行时的包 里面放着dom操作的方法

export const nodeOptions = { // 抽离的目的 可以重回写这些方法
  // anchor 参照物
  insert (child, parent, anchor) {
    if (anchor) {
      parent.insertBefore(child, anchor)
    } else {
      parent.appendChild(child)
    }
  },
  remove (child) {
    const parent = child.parentNode
    parent && parent.removeChild(child)
  },
  creteElement (tag) {
    return document.createElement(tag)
  },
  hostSetElementText (el, text) {
    el.textContent = text
  },
  // 属性操作... 
  hostPatchProps (el, key, value) {
    // 事件
    if (/^on[^a-z]/.test(key)) {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, value)
    } else {
      // 其他属性
      if (key == 'style') {
        for (let key in value) {
          el.style[key] = value[key]
        }
      }
      else { // ID class等
        el.setAttribute(key, value)
      }
    }
  }
}