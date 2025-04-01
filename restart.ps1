# 进入项目目录
cd F:\CURSOR\WEB\Prompt\prompt-sharing-website

# 删除node_modules和package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 重新安装依赖
npm install

# 重新构建并启动
npx next build
taskkill /f /im node.exe
npx next dev -p 3001 