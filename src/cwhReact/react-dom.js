// 初始渲染 - 直接生成全部
// 更新渲染 - 需要diff比较

function render(vnode, container) {
  console.log('vnode ===> ', vnode);
  // 将vnode => node
  const node = vnode2Node(vnode);
  // 将node 挂载到container上
  container.appendChild(node);
}

function vnode2Node(vnode) {
  let node;
  const {
    type
  } = vnode;
  if (typeof type === 'string') {
    node = updateHostComponent(vnode)
  } else if (typeof type === 'function') {
    // 对于vnode来说，类组件和函数组件都是以function的方式传入的，可以在Component基类的原型链上添加标识
    node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionCompinent(vnode);
  } else {
    node = updateTextComponent(vnode)
  }
  return node;
}

// 原生标签
function updateHostComponent(vnode) {
  const {
    type,
    props
  } = vnode;
  let node = document.createElement(type);
  nodeAddAttribute(node, props)
  reconcileChildren(node, props.children)
  return node;
}

// 函数组件
function updateFunctionCompinent(vnode) {
  const {
    type,
    props
  } = vnode
  let vvnode = type(props); // 执行函数组件,使用其props参数，会得到其返回的vnode，此处为了不与入参重名，命名为vvnode
  // 使用vnode->node函数转换虚拟dom
  return vnode2Node(vvnode);
}

// 类组件
function updateClassComponent(vnode) {
  const {
    type,
    props
  } = vnode
  let instance = new type(props); // 类组件需要new出实例
  let vvnode = instance.render(); // 类组件在render函数中返回vnode
  // 使用vnode->node函数转换虚拟dom
  return vnode2Node(vvnode);
}

// 文本标签
function updateTextComponent(vnode) {
  let node = document.createTextNode(vnode);
  return node;
}

// 将子节点vnode挂载到父节点node上
function reconcileChildren(parentNode, children) {
  let childrenArr = Array.isArray(children) ? children : [children]; // 原本children可能是对象或者数组，此处统一转成数组
  // 遍历数组，将子节点逐个添加到父节点上。
  childrenArr.forEach(vnode => {
    render(vnode, parentNode);
  })
}

// 添加属性
function nodeAddAttribute(node, attrVal) {
  // 排除里面的children属性，将其余属性添加到当前节点
  Object.keys(attrVal).filter(k => k !== 'children').forEach(key => {
    node[key] = attrVal[key]
  })
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  render
};