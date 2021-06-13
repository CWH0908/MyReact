// 初始渲染 - 直接生成全部
// 更新渲染 - 需要diff比较

let wipRoot = null; // work in progress 的根节点
// 浏览器空闲时候调用的函数
window.requestIdleCallback(workLoop);

// 作为链表指针指向下一个单元任务
let nextUnitOfWork = null;

// fiber对象的数据结构
// fiber:{
//   type 类型
//   key
//   props // 属性值
//   stateNode // 当前的dom节点
//   child // 第一个子节点
//   sibling // 下一个子节点
//   return // 父节点
// }

// 执行单元任务
function performUnitOfWork(workInProgress) {
  // workInProgress 就是表示当前传入的待执行的fiber

  // step1 执行任务
  const {
    type
  } = workInProgress;
  if (typeof type === 'string') {
    // 原生标签
    updateHostComponent(workInProgress)
  } else if (typeof type === 'function') {
    // 函数组件
    updateFunctionCompinent(workInProgress)
  } else if (typeof type === 'undefined') {
    // 文本组件
    updateTextComponent(workInProgress)
  }


  // step2 返回下一个任务
  if (workInProgress.child) {
    return workInProgress.child; // 有子节点，返回子节点fiber
  }

  let nextFiber = workInProgress; // 先把当前的fiber存储起来
  while (nextFiber) {
    if (nextFiber.sibling) {
      // 如果当前节点有兄弟节点fiber，则返回
      return nextFiber.sibling;
    }
    // 无则继续往上传递,直到根节点的fiber没有上一级，则跳出while循环
    nextFiber = nextFiber.return;
  }

}

// 链表循环
function workLoop(IdleDeadline) {
  // requestIdleCallback调用时会返回浏览器的空闲时间
  // 在此处执行我们的单元任务(剩余空闲时间>1时执行)
  while (nextUnitOfWork && IdleDeadline.timeRemaining() > 1) {
    // 执行任务，并且返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // 执行完任务后提交
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}

// 提交节点
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

// 执行提交任务
function commitWork(workInProgress) {
  // 提交自己
  if (!workInProgress) {
    return;
  }

  let parentNodeFiber = workInProgress.return; // 更新它的父节点

  // 父fiber没有dom节点时，向上查找
  while(!parentNodeFiber.stateNode){
    parentNodeFiber = parentNodeFiber.return;
  }
  let parentNode = parentNodeFiber.stateNode; // 通过父节点的stateNode定位到父级dom节点
  if (workInProgress.stateNode) {
    // 将当前fiber的stateNode，真实dom节点添加到父级dom节点上
    parentNode.appendChild(workInProgress.stateNode)
  }

  // 提交子节点child
  commitWork(workInProgress.child)

  // 提交其他子节点sibling
  commitWork(workInProgress.sibling)
}

function render(vnode, container) {
  // 初始化根节点
  wipRoot = {
    type: 'div',
    props: {
      children: {
        ...vnode
      }
    },
    stateNode: container
  }

  nextUnitOfWork = wipRoot; // 给链表的下一次单元任务传入workInProgress
}

//  废除
// function render(vnode, container) {
//   console.log('vnode ===> ', vnode);
//   // 将vnode => node
//   const node = creteNode(vnode);
//   // 将node 挂载到container上
//   container.appendChild(node);
// }

// 废除
// function vnode2Node(vnode) {
//   let node;
//   const {
//     type
//   } = vnode;
//   if (typeof type === 'string') {
//     node = updateHostComponent(vnode)
//   } else if (typeof type === 'function') {
//     // 对于vnode来说，类组件和函数组件都是以function的方式传入的，可以在Component基类的原型链上添加标识
//     node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionCompinent(vnode);
//   } else {
//     node = updateTextComponent(vnode)
//   }
//   return node;
// }

// 将原生标签的workInProgress 转变为 node节点
function creteNode(workInProgress) {
  const {
    type,
    props
  } = workInProgress;
  let node;
  node = document.createElement(type); // 创建dom节点
  nodeAddAttribute(node, props) // 更新dom的属性
  return node;
}

// 原生标签
function updateHostComponent(workInProgress) {
  const {
    props
  } = workInProgress;
  // fiber的stateNode指向当前dom节点
  if (!workInProgress.stateNode) {
    workInProgress.stateNode = creteNode(workInProgress);
  }

  // 协调
  reconcileChildren(workInProgress, props.children)

  console.log('workInProgress ===>', workInProgress);
}

// 函数组件
function updateFunctionCompinent(workInProgress) {
  const {
    type,
    props
  } = workInProgress
  let vvnode = type(props); // 执行函数组件,使用其props参数，会得到其返回的vnode，此处为了不与入参重名，命名为vvnode

  // 将其 协调成fiber结构
  reconcileChildren(workInProgress, vvnode)
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
  // return vnode2Node(vvnode);
}

// 文本标签
function updateTextComponent(workInProgress) {
  if(!workInProgress.stateNode){
    workInProgress.stateNode =  document.createTextNode(workInProgress.props);
  }
}

// 协调子节点，将子节点workInProgress也转变成fiber结构 
function reconcileChildren(workInProgress, children) {
  if (typeof children === 'string' || typeof children === 'number') {
    // 基础文本/数值，不再转成fiber结构
    return;
  }
  let childrenArr = Array.isArray(children) ? children : [children]; // 原本children可能是对象或者数组，此处统一转成数组

  let previousNewFiber = null; // 用于暂存在for循环中生成的fiber，用于在循环下一次的fibe是，给其上一个fiberr的sibling节点赋值
  for (let i = 0; i < childrenArr.length; i++) {
    let child = childrenArr[i];
    let newFiber = {
      type: child.type,
      props: {
        ...child.props
      },
      stateNode: null,
      child: null,
      sibling: null,
      return: workInProgress
    }

    if(typeof child === 'string'){
      newFiber.props = child;
    }

    // 把第一个生成的fiber当做workInProgress的child
    if (i === 0) {
      workInProgress.child = newFiber
    } else {
      // 除了第一个生成的fiber，其余都可作为上一个newFiber的sibling节点（链表结构，每个fiber都能指向下一个fiber）
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber; // 更新上一个fiber节点
  }
}

// 添加属性
function nodeAddAttribute(node, attrVal) {
  // children属性中存放着文本，也需要添加到当前节点（新加文本节点插入）
  Object.keys(attrVal).forEach(key => {
    if (key === 'children') {
      if (typeof attrVal[key] === 'string') {
        node.textContent = attrVal[key]
      }
    } else {
      node[key] = attrVal[key]
    }
  })
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  render
};