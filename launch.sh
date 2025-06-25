echo "开始部署流程..."

echo "1. 拉取最新代码..."
git pull

echo "2. 开始处理客户端文件..."
# 解压客户端文件
cd frontend
echo "3. 清理客户端旧文件..."
rm -rf dist node_modules package-lock.json
echo "4. 移动客户端压缩包..."
mv ../client-dist.tar.gz .
echo "5. 解压客户端文件..."
tar -xzf client-dist.tar.gz
echo "6. 清理客户端压缩包..."
rm -rf client-dist.tar.gz

echo "7. 开始处理服务端文件..."
# 服务端
cd ..
# 进入服务端目录
cd backend
echo "8. 清理服务端旧文件..."
rm -rf dist node_modules package-lock.json

echo "9. 安装服务端依赖..."
npm install
echo "10. 构建服务端..."
npm run build
echo "11. 停止旧的服务进程..."
pm2 delete recruitment-server
echo "12. 启动新的服务进程..."
pm2 start npm --name recruitment-server -- start
echo "13. 清理服务端压缩包..."
rm -rf server-dist.tar.gz

echo "部署完成！"