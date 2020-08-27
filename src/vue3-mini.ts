export * from './reactivity'
import { nodeOps,patchProps } from './runtime-dom'


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

function mountChildren(children, container) {
  children.forEach(child => {
    mountElement(child, container)
  })
}
