通过 mokit cli 可以快速建工程模板，工程结构是建议性的，您可以根据您的实际情况进行调整，


### 创建工程
```sh
$ cd your_path
$ mokit init
```

### 安装依赖
```sh
$ mokit i
```
  
  
### 开始开发
```sh
$ mokit dev
```
将会首先通过启动开发服务器，然后启动 watch 即时进行代码预编译。
  
  
### 执行测试
```sh
$ mokit test
```
将会依次进行「语法检查->单元测试->端到端测试」，执行全部通过后将会在 build/coverage 目录下产生相关报告
  
  
### 打包应用
```sh
$ mokit build
```
将会在 build/dist 目录下产生打包后的相关文件