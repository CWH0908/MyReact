import reactDom from './cwhReact/react-dom'

function App() {
  const vnode = (
    <div className="App">
      <h1>cwh - react - 文本</h1>
      <a href='https://www.baidu.com'>这是一条链接</a>
    </div>
  );

  return reactDom.render(vnode,document.body);
}

export default App;
