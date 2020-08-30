export * from './reactivity'
import { nodeOps, hostPatchProps } from './runtime-dom'
import { effect } from './reactivity'


export function h(vnode, container) {
  patch(container._vnode || null, vnode, container)
  container._vnode = vnode
}

function patch(n1, n2, container) {
  if (typeof n2.type === 'string') {
    processElement(n1, n2, container)
  } else if (typeof n2.type === 'object') {
    mountComponent(n2, container)
  }
}

function mountComponent(vnode, container) {
  const instance = {
    vnode,
    type: vnode.type,
    render: null,
    subTree: null
  }

  const Component = instance.type
  instance.render = Component.setup()

  effect(() => {
    instance.subTree = instance.render()
    patch(null, instance.subTree, container)
  })
}

function processElement(n1, n2, container) {
  if (n1 === null) {
    mountElement(n2, container)
  } else {
    patchElement(n1, n2, container)
  }
}

function patchElement(n1, n2, container) {
  const el = (n2.el = n1.el)
  // props
  const newProps = n1.props
  const oldProps = n2.props
  if (newProps !== oldProps) {
    patchProps(el, oldProps, newProps)
  }
  // children
  patchChildren(n1, n2, el)
}

function patchChildren(n1, n2, el) {

  const c1 = n1 && n1.children
  const c2 = n2.children

  if (typeof c1 === 'string') {

    if (typeof c2 === 'string') {// string -> string
      nodeOps.setElementText(el, c2)

    } else if (Array.isArray(c2)) {// string -> array
      nodeOps.setElementText(el, '')
      mountChildren(c2, el)
    }
  } else if (Array.isArray(c1)) {
    if (typeof c2 === 'string') {//array -> string
      unmount(c1, el)
      nodeOps.setElementText(el, c2)
    } else {// array -> array
      patchKeyedChildren(n1, n2, el)
    }
  }
}

//
function patchKeyedChildren(n1, n2, el) {

}

function patchProps(el, oldProps, newProps) {
  //新增
  for (const key in newProps) {
    const prev = oldProps[key]
    const next = newProps[key]
    if (prev !== next) {
      hostPatchProps(el, key, prev, next)
    }
  }

  //旧的有，新的没有，删除
  for (const key in oldProps) {
    if (!(key in newProps)) {
      hostPatchProps(el, key, oldProps[key], null)
    }
  }
}

function unmount(c1, container) {
  for (let index = 0; index < c1.length; index++) {
    const child = c1[index];
    nodeOps.remove(child)
  }
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode
  const el = (vnode.el = nodeOps.createElement(type))

  // props
  if (props !== null) {
    for (const key in props) {
      hostPatchProps(el, key, null, props[key])
    }
  }

  // children
  if (typeof children === 'string') {
    nodeOps.setElementText(el, children)
    nodeOps.insert(el, container, null)
  } else if (Array.isArray(children)) {
    nodeOps.insert(el, container, null)
    mountChildren(children, el)
  }
}

function mountChildren(children, container) {
  children.forEach(child => {
    patch(null, child, container)
  })
}
