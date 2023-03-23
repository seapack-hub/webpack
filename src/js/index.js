/**
 * index.js: webpack的入口起点文件
 */
// import '@babel/polyfill';
// 引入json
import json from '@/media/data.json';

import $ from 'jquery';

console.log($);

// 引入样式文件
// import '../style/index.css';
import '@/style/index.less';
import '@/style/iconfont.css';

const add = function add(x, y) {
  return x + y;
};
// 下一行eslint所有规则都失效（下一行不进行eslint检查）
// eslint-disable-next-line
console.log(json);
const promise = new Promise((resolve) => {
  setTimeout(() => {
    // eslint-disable-next-line
    console.log('定时器执行完成了');
    resolve();
  }, 1000);
});
// eslint-disable-next-line
console.log(promise);

/**
 * 通过js代码，让某个文件被单独打包成一个chunk
 * import动态导入语法：能将某个文件单独打包
*/
import('./main.js')
    .then(({square})=>{
      // eslint-disable-next-line
      console.log(square(5));
    }).catch(()=>{
      // eslint-disable-next-line
      console.log("加载文件失败~~");
    });

// 注册serviceWorker
// 处理兼容性问题
if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(()=>{
                console.log('sw注册成功了~~');
            }).catch(()=>{
                console.log('sw注册失败了~~');
            })
    })
}
