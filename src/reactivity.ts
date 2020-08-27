// reactivity

let targetMap = new WeakMap()

let activeEffect = null
export function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      depsMap = new Map()
      targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    deps.add(activeEffect)
  }
}

function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if (depsMap) {
    let deps = depsMap.get(key)
    deps && deps.forEach(fn => fn())
  }
}

export function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key)
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return res
    }
  })
}
