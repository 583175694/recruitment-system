git pull

# 解压客户端文件
cd frontend
rm -rf dist node_modules package.json package-lock.json
mv ../client-dist.tar.gz .
tar -xzf client-dist.tar.gz

# 重启客户端
pm2 delete recruitment-client
pm2 start npm --name recruitment-client -- start
rm -rf client-dist.tar.gz

# 服务端
cd ..
# 进入服务端目录
cd backend
rm -rf dist node_modules package.json package-lock.json
mv ../server-dist.tar.gz .
tar -xzf server-dist.tar.gz

npm install
pm2 delete recruitment-server
pm2 start npm --name recruitment-server -- start
rm -rf server-dist.tar.gz