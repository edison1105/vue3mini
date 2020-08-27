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

  if (typeof children === 'string') {
    const el = (vnode.el = nodeOps.createElement(type))
    nodeOps.setElementText(el, children)
    nodeOps.insert(el, container, null)

    patchProps(props, el)

  } else if (Array.isArray(children)) {
    mountChildren(children, container)
  }
}

function patchProps(props,child) {
  for (const key in props) {
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLocaleLowerCase()
      child.addEventListener(eventName, props[key])
    } else {
      child.setAttribute(key, props[key])
    }
  }
}

function mountChildren(children, container) {
  children.forEach(child => {
    mountElement(child, container)
  })
}
