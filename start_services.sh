#!/bin/bash

echo "🚀 启动 ReMe 应用服务..."

# 检查是否已有服务在运行
if pgrep -f "python run.py" > /dev/null; then
    echo "⚠️  后端服务已在运行"
else
    echo "📡 启动后端服务..."
    cd backend
    source venv/bin/activate
    nohup python run.py > ../backend.log 2>&1 &
    cd ..
    echo "✅ 后端服务已启动 (日志: backend.log)"
fi

if pgrep -f "npm run dev" > /dev/null; then
    echo "⚠️  前端服务已在运行"
else
    echo "🌐 启动前端服务..."
    cd frontend
    nohup npm run dev > ../frontend.log 2>&1 &
    cd ..
    echo "✅ 前端服务已启动 (日志: frontend.log)"
fi

echo ""
echo "🎉 服务启动完成！"
echo "📱 前端地址: http://localhost:5173"
echo "🔗 后端地址: http://localhost:5000"
echo ""
echo "📋 查看服务状态:"
echo "   ps aux | grep -E '(python run.py|npm run dev)'"
echo ""
echo "🛑 停止服务:"
echo "   pkill -f 'python run.py'"
echo "   pkill -f 'npm run dev'"