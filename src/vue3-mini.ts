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
  mountElement(vnode,container)
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode

  const el = (vnode.el = nodeOps.createElement(type))
  nodeOps.setElementText(el, children)
  nodeOps.insert(el,container,null)
}
