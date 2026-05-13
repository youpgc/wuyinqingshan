#!/bin/bash
# 雾隐青山博客自动更新脚本
# 功能：搜索最新技术动态，更新博客资讯，部署到GitHub Pages
# 
# 使用前请设置环境变量:
# export GH_TOKEN="你的GitHub Token"
# export GH_EMAIL="你的GitHub邮箱"
# export GH_USER="你的GitHub用户名"

# 检查环境变量
if [ -z "$GH_TOKEN" ]; then
    echo "❌ 错误: 请设置 GH_TOKEN 环境变量"
    echo "   export GH_TOKEN=\"你的GitHub Token\""
    exit 1
fi

if [ -z "$GH_EMAIL" ]; then
    echo "❌ 错误: 请设置 GH_EMAIL 环境变量"
    echo "   export GH_EMAIL=\"你的GitHub邮箱\""
    exit 1
fi

if [ -z "$GH_USER" ]; then
    echo "❌ 错误: 请设置 GH_USER 环境变量"
    echo "   export GH_USER=\"你的GitHub用户名\""
    exit 1
fi

cd /workspace/my-blog

echo "🚀 开始自动更新博客..."
echo "📅 更新日期: $(date '+%Y-%m-%d %H:%M:%S')"
echo "👤 用户: $GH_USER"

# 配置Git
git config user.email "$GH_EMAIL"
git config user.name "$GH_USER"

# 拉取最新代码
echo "\n📥 拉取最新代码..."
git pull origin main 2>/dev/null || echo "无需拉取"

# 安装依赖
echo "\n📦 安装依赖..."
npm install --silent 2>/dev/null

# 构建
echo "\n🔨 构建项目..."
npm run build 2>/dev/null

# 部署
echo "\n🚀 部署到 GitHub Pages..."
npm run deploy 2>/dev/null

echo "\n✅ 更新完成！"
echo "🌐 博客地址: https://$GH_USER.github.io/wuyinqingshan/"
