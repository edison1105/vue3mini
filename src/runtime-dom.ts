export const nodeOps = {
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


export function hostPatchProps(el, key, prev, next) {
  // event
  if (key.startsWith('on')) {
    prev && el.removeEventListener(key.slice(2).toLowerCase(), prev)
    next && el.addEventListener(key.slice(2).toLowerCase(), next)
  }
  // attribute
  else {
    if (next) {
      el.setAttribute(key, next)
    } else {
      el.removeAttribute(key)
    }
  }
}
