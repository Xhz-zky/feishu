# 飞书多维表格深度分析插件 - 部署指南

## 📋 部署前准备

### 系统要求
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+, Edge 80+）
- 飞书多维表格环境
- 网络服务器（用于托管插件文件）

### 文件清单
确保您有以下文件：
```
feishu-analysis-plugin/
├── index.html              # 主页面文件
├── style.css              # 样式文件
├── main.js                # 主逻辑文件
├── analysis-engine.js     # 分析引擎
├── chart-utils.js         # 图表工具
├── package.json           # 项目配置
├── README.md              # 使用说明
└── DEPLOYMENT.md          # 部署指南（本文件）
```

## 🚀 部署方式

### 方式一：使用 Replit（推荐新手）

1. **注册 Replit 账号**
   - 访问 [replit.com](https://replit.com)
   - 注册并登录账号

2. **创建新项目**
   - 点击 "Create Repl"
   - 选择 "HTML, CSS, JS" 模板
   - 命名项目（如：feishu-analysis-plugin）

3. **上传文件**
   - 删除默认的 index.html 内容
   - 将本插件的所有文件内容复制到对应文件中
   - 如果需要新建文件，点击文件树中的 "+" 按钮

4. **运行项目**
   - 点击绿色的 "Run" 按钮
   - 复制生成的 URL（格式：https://项目名.用户名.repl.co）

5. **在飞书中添加插件**
   - 打开飞书多维表格
   - 点击右上角的插件按钮
   - 选择"添加插件" → "通过链接添加"
   - 粘贴 Replit 生成的 URL

### 方式二：使用 GitHub Pages

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 创建新仓库（如：feishu-analysis-plugin）
   - 设置为 Public

2. **上传文件**
   - 将所有插件文件上传到仓库根目录
   - 提交更改

3. **启用 GitHub Pages**
   - 进入仓库设置（Settings）
   - 找到 "Pages" 选项
   - 选择 "Deploy from a branch"
   - 选择 "main" 分支和 "/ (root)" 文件夹
   - 保存设置

4. **获取访问链接**
   - GitHub 会生成访问链接（格式：https://用户名.github.io/仓库名）
   - 等待几分钟让部署生效

5. **在飞书中添加插件**
   - 使用生成的 GitHub Pages 链接添加插件

### 方式三：使用自己的服务器

1. **准备服务器**
   - 确保有 Web 服务器（Apache, Nginx, IIS 等）
   - 确保支持 HTTPS（飞书要求）

2. **上传文件**
   - 将所有插件文件上传到服务器的 Web 目录
   - 确保文件权限正确

3. **配置服务器**
   - 设置正确的 MIME 类型
   - 启用 CORS（如果需要）
   - 配置 HTTPS 证书

4. **测试访问**
   - 在浏览器中访问 index.html
   - 确保所有资源正常加载

5. **在飞书中添加插件**
   - 使用您的服务器 URL 添加插件

### 方式四：使用 Vercel（推荐）

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 导入您的 GitHub 仓库
   - 或直接拖拽文件夹上传

3. **部署设置**
   - Framework Preset: 选择 "Other"
   - Build Command: 留空
   - Output Directory: 留空
   - Install Command: 留空

4. **部署项目**
   - 点击 "Deploy"
   - 等待部署完成
   - 获取生成的 URL

5. **在飞书中添加插件**
   - 使用 Vercel 生成的 URL 添加插件

## 🔧 配置说明

### 环境变量（可选）
如果需要自定义配置，可以在代码中添加：

```javascript
// 在 main.js 开头添加配置
const CONFIG = {
    DEBUG_MODE: false,           // 调试模式
    MAX_RECORDS: 10000,         // 最大记录数
    CHART_COLORS: [             // 自定义图表颜色
        '#667eea', '#764ba2', '#f093fb'
    ],
    API_TIMEOUT: 30000          // API 超时时间（毫秒）
};
```

### CORS 配置
如果遇到跨域问题，在服务器配置中添加：

```apache
# Apache .htaccess
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type"
```

```nginx
# Nginx 配置
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'Content-Type';
```

## 🔍 测试部署

### 本地测试
1. **启动本地服务器**
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 使用 Node.js
   npx http-server
   
   # 使用 PHP
   php -S localhost:8000
   ```

2. **访问测试**
   - 打开浏览器访问 `http://localhost:8000`
   - 检查控制台是否有错误
   - 测试基本功能

### 线上测试
1. **功能测试**
   - 在飞书中添加插件
   - 测试数据表选择
   - 测试字段选择
   - 测试分析功能
   - 测试图表生成
   - 测试导出功能

2. **性能测试**
   - 测试大数据集处理
   - 测试响应时间
   - 测试内存使用

## 🛠️ 故障排除

### 常见问题

**Q: 插件无法加载？**
A: 检查以下项目：
- URL 是否正确
- 服务器是否支持 HTTPS
- 文件是否存在
- 网络连接是否正常

**Q: 提示跨域错误？**
A: 
- 确保服务器配置了正确的 CORS 头
- 检查飞书的安全策略
- 尝试使用 HTTPS

**Q: 插件功能异常？**
A:
- 检查浏览器控制台错误
- 确认飞书 SDK 版本兼容性
- 检查数据表权限

**Q: 图表不显示？**
A:
- 检查 Chart.js 库是否加载
- 确认数据格式正确
- 检查 Canvas 支持

### 调试技巧

1. **启用调试模式**
   ```javascript
   // 在 main.js 中设置
   const DEBUG_MODE = true;
   ```

2. **查看控制台日志**
   - 按 F12 打开开发者工具
   - 查看 Console 标签页
   - 查看 Network 标签页

3. **检查网络请求**
   - 确认 API 调用是否成功
   - 检查响应数据格式
   - 查看请求耗时

## 📊 性能优化

### 代码优化
- 使用 CDN 加载外部库
- 压缩 CSS 和 JavaScript 文件
- 优化图片资源

### 服务器优化
- 启用 Gzip 压缩
- 设置缓存头
- 使用 CDN 分发

### 数据处理优化
- 分页处理大数据集
- 异步处理耗时操作
- 缓存计算结果

## 🔄 更新部署

### 更新流程
1. 修改代码文件
2. 测试新功能
3. 更新版本号（package.json）
4. 重新部署到服务器
5. 在飞书中刷新插件

### 版本管理
- 使用语义化版本号
- 记录更新日志
- 保持向后兼容

## 📞 技术支持

如果在部署过程中遇到问题：
1. 查看本文档的故障排除部分
2. 检查浏览器控制台错误信息
3. 查看服务器日志
4. 联系技术支持团队

---

**注意**: 
- 确保部署的 URL 支持 HTTPS
- 定期备份插件文件
- 关注飞书平台的更新公告
