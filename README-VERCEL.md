# Vercel部署指南 - "提示精灵"网站

本文档提供了将"提示精灵"网站部署到Vercel平台的详细步骤。

## 前提条件

1. 已完成从本地JSON文件到Supabase数据库的迁移
2. 已修改所有API路由使用Supabase客户端API
3. GitHub账号
4. Vercel账号

## 部署步骤

### 第一步：准备GitHub仓库

1. 下载并安装Git：https://git-scm.com/downloads

2. 在GitHub上创建新仓库：
   - 访问 https://github.com/new
   - 输入仓库名称，如"prompt-sharing-website"
   - 选择"公开"或"私有"
   - 点击"创建仓库"

3. 初始化本地Git仓库并推送代码到GitHub：
   ```bash
   # 在项目根目录执行
   git init
   git add .
   git commit -m "初始提交 - 准备Vercel部署"
   git branch -M main
   git remote add origin https://github.com/您的用户名/prompt-sharing-website.git
   git push -u origin main
   ```

### 第二步：注册Vercel并连接GitHub

1. 访问 https://vercel.com 注册账号（可直接用GitHub账号登录）

2. 登录后点击"New Project"

3. 选择"Import Git Repository"

4. 授权Vercel访问您的GitHub仓库

5. 选择您刚创建的"prompt-sharing-website"仓库

### 第三步：配置项目设置

1. 项目名称：保持默认或自定义

2. 框架预设：确保已自动选择"Next.js"

3. 根目录：无需更改（默认"/")

4. 构建命令：无需更改（默认"next build")

5. 输出目录：无需更改

### 第四步：环境变量配置

1. 点击"Environment Variables"选项卡，添加项目中的环境变量：

   - 添加名称为`NEXT_PUBLIC_SUPABASE_URL`的变量，值为您之前.env.local中的Supabase URL
   - 添加名称为`NEXT_PUBLIC_SUPABASE_ANON_KEY`的变量，值为您之前.env.local中的Supabase匿名密钥

2. 确保环境变量名称与项目中使用的名称完全一致

### 第五步：部署项目

1. 确认所有设置无误后，点击"Deploy"按钮

2. 等待部署完成（通常3-5分钟）

3. 部署成功后，Vercel会提供一个默认域名（如your-project-name.vercel.app）

### 第六步：测试与检查

1. 点击Vercel提供的网站链接访问您的网站

2. 测试所有功能是否正常工作：
   - 用户注册和登录
   - 浏览提示词
   - 提交新提示词
   - 点赞功能
   - 评论功能
   - 管理员功能（如适用）

3. 检查控制台是否有任何错误

### 第七步：自定义域名（可选）

1. 在Vercel控制台，选择您的项目，点击"Settings" > "Domains"

2. 添加您购买的域名

3. 按照Vercel的指示配置DNS记录

### 第八步：持续集成/部署

设置完成后，每当您将更改推送到GitHub仓库时，Vercel会自动重新部署您的网站。

## 故障排除

1. **部署失败**
   - 检查构建日志以获取详细错误信息
   - 确保所有环境变量正确配置
   - 验证项目依赖项是否正确安装

2. **API请求失败**
   - 检查Supabase项目的CORS设置
   - 验证Supabase URL和密钥是否正确
   - 检查Supabase表的行级安全策略配置

3. **页面加载缓慢**
   - 考虑启用Vercel的边缘缓存功能
   - 优化大型资源（如图片）
   - 确保不含有不必要的大型依赖包

## 其他资源

- [Vercel文档](https://vercel.com/docs)
- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [Supabase与Vercel集成](https://supabase.com/docs/guides/integrations/vercel) 