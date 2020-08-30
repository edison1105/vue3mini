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

function patchChildren(n1, n2, container) {

  const c1 = n1 && n1.children
  const c2 = n2.children

  if (typeof c1 === 'string') {

    if (typeof c2 === 'string') {// string -> string
      nodeOps.setElementText(container, c2)

    } else if (Array.isArray(c2)) {// string -> array
      nodeOps.setElementText(container, '')
      mountChildren(c2, container)
    }
  } else if (Array.isArray(c1)) {
    if (typeof c2 === 'string') {//array -> string
      unmountChildren(c1)
      nodeOps.setElementText(container, c2)
    } else {// array -> array
      patchKeyedChildren(c1, c2, container)
    }
  }
}


/**
 *
 * @param c1 old children
 * @param c2 new children
 * @param container
 */
function patchKeyedChildren(c1, c2, container) {
  let i = 0;
  let e1 = c1.length - 1
  let e2 = c2.length - 1

  // 新数组key=>index 对应关系
  let keyToNewIndexMap = new Map()
  for (i = 0; i <= e2; i++) {
    const key = c2[i].props.key
    keyToNewIndexMap.set(key, i)
  }

  let newIndexToOldIndexMap = new Array(e2 + 1).fill(-1)

  for (i = 0; i <= e1; i++) {
    const oldChild = c1[i]
    const newIndex = keyToNewIndexMap.get(oldChild.props.key)
    //旧节点在新数组中不存在，删除
    if (newIndex === undefined) {
      unmount(oldChild)
    } else {
      newIndexToOldIndexMap[newIndex] = i

      // 都存在，更新，位置可能变化了，后面再判断是否需要移动
      patch(oldChild, c2[newIndex], container)
    }
  }

  for (i = e2; i >= 0; i--) {
    const newChild = c2[i]

    //新增
    if (newIndexToOldIndexMap[i] === -1) {
      patch(null, newChild, container)
    }

    // 移动
    const anchor = i + 1 <= e2 ? c2[i + 1].el : null
    move(newChild.el, container, anchor)
  }
}

function move(child, container, anchor) {
  nodeOps.insert(child, container, anchor)
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

function unmountChildren(children) {
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    unmount(child)
  }
}

function unmount(child) {
  nodeOps.remove(child.el)
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
