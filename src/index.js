// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import reactDom from './cwhReact/react-dom'
import Component from './cwhReact/component'

function FuncComponent (props){
  return <div className='func'>
    <p>这是函数组件：{props.name}</p>
  </div>
}

class ClassComponent extends Component{
  render(){
    return <div className='class'>
    <p>这是类组件：{this.props.name}</p>
  </div>
  }
}

const vnode = (
  <div className="App">
    <div  className="father">
      <div className='son'>
        son
      </div>
    </div>
    <h1>h1 - 文本</h1>
    <a href='https://www.baidu.com'>a - 链接</a>

    <FuncComponent name='function'/>

    <ClassComponent name='class'/>
  </div>
);

 reactDom.render(vnode,document.getElementById('root'));