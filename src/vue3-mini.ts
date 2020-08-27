export * from './reactivity'
import { nodeOps, patchProps } from './runtime-dom'
import { effect } from './reactivity'


export function h(vnode, container) {

  // mount
  patch(null, vnode, container)
}

function patch(n1, n2, container) {
  if (typeof n2.type === 'string') {
    mountElement(n2, container)
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

function mountChildren(children, container) {
  children.forEach(child => {
    patch(null, child, container)
  })
}
