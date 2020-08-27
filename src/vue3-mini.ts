const nodeOps = {
  insert(child, container, anchor) {
    if (anchor) {
      container.insertBefore(child)
    } else {
      container.appendChild(child)
    }
  },
  remove(child) {
    const parentNode = child.parentNode
    if (parentNode) parentNode.removeChild(child)
  },
  createElement(type) {
    return document.createElement(type)
  },
  setElementText(child, text) {
    child.textContent = text
  }
}


export function h(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode
  const el = (vnode.el = nodeOps.createElement(type))

  // props
  if (props !== null) {
    for (const key in props) {
      patchProps(el, key, props[key])
    }
  }

  // children
  if (typeof children === 'string') {
    nodeOps.setElementText(el, children)
    nodeOps.insert(el, container, null)
  } else if (Array.isArray(children)) {
    mountChildren(children, container)
  }
}

function patchProps(el, key, value) {
  // event
  if (key.startsWith('on')) {
    el.addEventListener(key.slice(2).toLowerCase(), value)
  }
  // attribute
  else {
    if (value) {
      el.setAttribute(key, value)
    } else {
      el.removeAttribute(key)
    }
  }
}

function mountChildren(children, container) {
  children.forEach(child => {
    mountElement(child, container)
  })
}


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
