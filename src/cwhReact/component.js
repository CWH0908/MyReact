// Component基类
function Component (props){
  this.props = props; // 使其内部能够通过this.props访问
}

Component.prototype.isReactComponent = {} ; // 类组件的标识

export default Component