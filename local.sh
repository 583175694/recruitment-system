# 客户端构建
cd frontend
npm run build

# 客户端打包
COPYFILE_DISABLE=1 tar --no-xattrs -czf client-dist.tar.gz dist node_modules package.json package-lock.json
# 服务端构建  
cd ../backend
npm run build
COPYFILE_DISABLE=1 tar --no-xattrs -czf server-dist.tar.gz dist node_modules package.json package-lock.json
cd ..
scp ./frontend/client-dist.tar.gz ubuntu@175.178.23.83:/www/recruitment-system/
scp ./backend/server-dist.tar.gz ubuntu@175.178.23.83:/www/recruitment-system/