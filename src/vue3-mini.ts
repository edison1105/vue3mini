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

  // 忽略掉新增的
  const lst = getSequence(newIndexToOldIndexMap.filter(d => d >= 0))
  let j = lst.length - 1
  for (i = e2; i >= 0; i--) {
    const newChild = c2[i]

    //新增
    if (newIndexToOldIndexMap[i] === -1) {
      patch(null, newChild, container)
    }

    if (i == lst[j]) {
      j--
      continue
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


function getSequence(arr) {
  const p = arr.slice()                 //  保存原始数据
  const result = [0]                    //  存储最长增长子序列的索引数组
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]     //  j是子序列索引最后一项
      if (arr[j] < arrI) {              //  如果arr[i] > arr[j], 当前值比最后一项还大，可以直接push到索引数组(result)中去
        p[i] = j                        //  p记录第i个位置的索引变为j
        result.push(i)
        continue
      }
      u = 0                             //  数组的第一项
      v = result.length - 1             //  数组的最后一项
      while (u < v) {                   //  如果arrI <= arr[j] 通过二分查找，将i插入到result对应位置；u和v相等时循环停止
        c = ((u + v) / 2) | 0           //  二分查找
        if (arr[result[c]] < arrI) {
          u = c + 1                     //  移动u
        } else {
          v = c                         //  中间的位置大于等于i,v=c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]          //  记录修改的索引
        }
        result[u] = i                   //  更新索引数组(result)
      }
    }
  }
  u = result.length
  v = result[u - 1]
  //把u值赋给result
  while (u-- > 0) {                     //  最后通过p数组对result数组进行进行修订，取得正确的索引
    result[u] = v
    v = p[v];
  }
  return result
}
