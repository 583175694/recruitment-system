echo "开始部署流程..."

echo "1. 拉取最新代码..."
git pull

echo "2. 开始处理客户端文件..."
cd frontend
echo "3. 清理客户端旧文件..."
rm -rf dist node_modules
echo "4. 安装客户端依赖 (pnpm --frozen-lockfile)..."
pnpm install --frozen-lockfile
echo "5. 构建客户端 (pnpm build)..."
pnpm build

cd ..
echo "6. 开始处理服务端文件..."
cd backend
echo "7. 清理服务端旧文件..."
rm -rf dist node_modules

echo "8. 安装服务端依赖 (pnpm --frozen-lockfile)..."
pnpm install --frozen-lockfile
echo "9. 构建服务端 (pnpm build)..."
pnpm build
echo "10. 停止旧的服务进程..."
pm2 delete recruitment-backend
echo "11. 启动新的服务进程..."
pm2 start pnpm --name recruitment-backend -- start

echo "12. 部署完成！"
