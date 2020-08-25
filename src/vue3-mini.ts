export function h(vnode, container) {
  mountElement(vnode,container)
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode

  const el = document.createElement(type)
  el.textContent = children
  container.appendChild(el)
}
