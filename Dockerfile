FROM node:16-alpine

# 创建目录 /usr/src/app
RUN mkdir -p /usr/src/app

# 创建并设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 到工作目录
COPY package.json package-lock.json /usr/src/app/

# 安装项目依赖,package.json 和 lock文件没有变化时，会使用缓存文件，加快打包速度
RUN npm install --registry=https://registry.npmmirror.com

# 复制项目文件到工作目录
COPY . /usr/src/app/

# 编译 TypeScript 文件
RUN npm run tsc

# 暴露应用运行的端口
EXPOSE 7001

# 启动应用
CMD npx egg-scripts start --title=lego-backend
