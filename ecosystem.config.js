module.exports = {
    apps: [{
      name: "recruitment-backend",
      script: "./backend/dist/main.js", // 调整为您的后端入口文件路径
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DB_HOST: "localhost",
        DB_PORT: 3306,
        DB_USERNAME: "root",  // 您的MySQL用户名
        DB_PASSWORD: "123456",  // 您的实际MySQL密码
        DB_DATABASE: "recruitment"  // 您的数据库名称
      }
    }]
  };