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


export function patchProps(el, key, value) {
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
