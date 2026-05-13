# 🚀 GitHub Pages 部署指南

## 项目概述

你的炫酷个人博客已经准备好了！这是一个基于 React + Vite + Tailwind CSS 构建的现代化博客，具有以下特色：

- ✨ **艺术创意风格** - 深色主题 + 渐变色彩 + 玻璃态效果
- 🎨 **炫酷动画** - 粒子背景、变形Blob、文字揭示动画
- 📱 **完全响应式** - 适配桌面、平板、手机
- ⚡ **高性能** - Vite构建，加载速度快

## 📁 项目结构

```
my-blog/
├── src/
│   ├── components/     # 可复用组件
│   │   ├── ParticleBackground.jsx  # 粒子背景
│   │   ├── MorphingBlob.jsx        # 变形Blob
│   │   ├── GlowingButton.jsx       # 发光按钮
│   │   ├── GlassCard.jsx           # 玻璃卡片
│   │   ├── TextReveal.jsx          # 文字揭示
│   │   ├── ScrollReveal.jsx        # 滚动显示
│   │   ├── GradientBorder.jsx      # 渐变边框
│   │   ├── Navigation.jsx          # 导航栏
│   │   └── Footer.jsx              # 页脚
│   ├── sections/       # 页面区块
│   │   ├── Hero.jsx                # 首页英雄区
│   │   ├── About.jsx               # 关于我
│   │   ├── Portfolio.jsx           # 作品集
│   │   ├── Blog.jsx                # 技术博客
│   │   └── News.jsx                # 每日资讯
│   ├── styles/
│   │   └── animations.css          # 动画样式
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 部署步骤

### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 仓库名称填写：`my-blog`
4. 选择 "Public"（公开）
5. 点击 "Create repository"

### 2. 初始化 Git 并推送代码

```bash
# 进入项目目录
cd my-blog

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Creative personal blog"

# 添加远程仓库（替换 yourusername 为你的GitHub用户名）
git remote add origin https://github.com/yourusername/my-blog.git

# 推送代码
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 在 GitHub 仓库页面，点击 "Settings"（设置）
2. 左侧菜单选择 "Pages"
3. "Source" 部分选择 "Deploy from a branch"
4. "Branch" 选择 "gh-pages"（稍后会自动创建）
5. 点击 "Save"

### 4. 部署网站

```bash
# 安装依赖
npm install

# 部署到 GitHub Pages
npm run deploy
```

部署完成后，等待几分钟，访问：
```
https://yourusername.github.io/my-blog
```

## 📝 自定义内容

### 修改个人信息

编辑 `src/sections/About.jsx`：
- 修改姓名、职位、邮箱
- 更新技能列表
- 修改个人简介

### 修改作品

编辑 `src/sections/Portfolio.jsx`：
- 替换项目图片链接
- 修改项目标题和描述
- 更新技术标签
- 添加真实的项目链接

### 修改博客文章

编辑 `src/sections/Blog.jsx`：
- 添加真实的文章数据
- 更新文章图片
- 修改发布日期和阅读时间

### 修改每日资讯

编辑 `src/sections/News.jsx`：
- 更新新闻内容
- 可以接入 RSS 或 API 获取真实新闻

## 🎨 自定义样式

### 修改颜色主题

编辑 `src/styles/animations.css`：
```css
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  /* 修改你喜欢的渐变色 */
}
```

### 修改动画效果

所有动画都在 `src/styles/animations.css` 中定义，可以自由调整：
- 动画时长
- 缓动函数
- 变换效果

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

## 🌟 特色功能

1. **粒子背景** - Canvas 实现的动态粒子效果，粒子之间会自动连线
2. **变形Blob** - 使用 Framer Motion 实现的渐变形状动画
3. **玻璃态卡片** - 毛玻璃效果，悬停时有发光效果
4. **文字揭示** - 逐字动画显示标题
5. **滚动显示** - 元素进入视口时的动画效果
6. **渐变边框** - 流动的彩虹渐变边框
7. **响应式导航** - 移动端友好的汉堡菜单

## 📱 响应式断点

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🐛 常见问题

### 1. 部署后页面空白

检查 `vite.config.js` 中的 `base` 配置是否正确：
```js
base: '/my-blog/', // 必须与仓库名一致
```

### 2. 图片加载失败

确保使用 HTTPS 链接，或上传图片到图床。

### 3. 样式不生效

清除浏览器缓存，或使用无痕模式访问。

## 📄 许可证

MIT License - 可自由使用和修改

## 💖 感谢

感谢使用这个模板！如果觉得不错，请给个 Star ⭐
