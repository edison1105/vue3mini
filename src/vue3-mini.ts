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
      patchProps(el,key,props[key])
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
    el.addEventListener(key.slice(2).toLowerCase(),value)
  }
  // attribute
  else {
    if (value) {
      el.setAttribute(key,value)
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
