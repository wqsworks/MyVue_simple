let activeEffect
export function effect (fn) {
  // 默认effect 需要先执行一次
  activeEffect = fn
  fn()
  activeEffect = null // 清空
}


// 默认只代理第一层
export function reactive (target) {
  return new Proxy(target, { // proxy不用重写每一个属性
    set (target, key, value, receiver) { //拦截器，性能更高
      // target[key] = value // 给原来的值做处理
      console.log('执行了吗？')
      const res = Reflect.set(target, key, value, receiver)
      // res && activeEffect()
      trigger(target, key) // 触发更新
      return res
      // proxy中的set方法需要有返回值
    },
    get (target, key, value, receiver) {
      // if (typeof target[key] == 'object') {
      //   return reactive(target[key])
      // }
      const res = Reflect.get(target, key, value, receiver)
      track(target, key) // 依赖收集  只有在页面中取值时，才会调用
      return res
    }
  })
}

// 依赖收集  要确定的是 某个属性变了 要更新，而不是整个对象，一个属性要收集对应的effect


const targetMap = new WeakMap()
function track (target, key) { // target key 多个effect
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  // console.log(activeEffect)
  if (activeEffect && !deps.has(activeEffect)) {
    deps.add(activeEffect)
  }
  console.log(targetMap)
}
function trigger (target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(effect => effect())
}