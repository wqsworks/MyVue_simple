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
  hostPatchProps (el, key, prevProps, nextProps) {
    // 事件
    if (/^on[^a-z]/.test(key)) {
      const eventName = key.slice(2).toLowerCase()

      // 更新事件
      prevProps && el.removeEventListener(eventName, prevProps)
      nextProps && el.addEventListener(eventName, nextProps)
    } else {
      // 其他属性
      if (nextProps == null) {
        console.log(key, 34)
        return el.removeAttribute(key) // 删除元素上的属性
      }
      if (key == 'style') {
        for (let key in nextProps) {
          el.style[key] = nextProps[key]
        }
        for (let key in prevProps) {
          if (!nextProps.hasOwnProperty(key)) {
            console.log(el.style[key], 43)
            el.style[key] = null
          }
        }
      }
      else { // ID class等
        // console.log(key, nextProps)
        el.setAttribute(key, nextProps)
      }
    }
  }
}