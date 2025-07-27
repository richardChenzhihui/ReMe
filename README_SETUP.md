# ReMe 应用快速启动指南

## 🚀 快速启动（3步）

### 1. 配置Azure密钥
编辑 `backend/.env` 文件，填入您的Azure服务密钥：
```bash
AOAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AOAI_API_KEY=your-openai-api-key-here
SPEECH_KEY=your-speech-service-key-here
SPEECH_REGION=eastus
```

### 2. 启动服务
```bash
# 方式一：使用脚本（推荐）
./start_services.sh

# 方式二：手动启动
# 终端1 - 后端
cd backend && source venv/bin/activate && python run.py

# 终端2 - 前端  
cd frontend && npm run dev
```

### 3. 访问应用
- 前端：http://localhost:5173
- 后端：http://localhost:5000

## 🛑 停止服务
```bash
pkill -f "python run.py"
pkill -f "npm run dev"
```

## 📋 服务状态检查
```bash
ps aux | grep -E "(python run.py|npm run dev)" | grep -v grep
```

## 🎯 中文化功能验证
- ✅ UI界面默认显示中文
- ✅ 认知游戏支持中文语音
- ✅ 数据库默认语言为中文
- ✅ 新用户注册默认中文环境

## 🆘 故障排除
1. **后端启动失败**：检查 .env 文件配置
2. **前端访问失败**：确认端口5173未被占用
3. **语音不工作**：验证Azure语音服务密钥
4. **数据库错误**：重新运行 `python manage.py init_db`