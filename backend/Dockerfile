FROM python:3.11-slim

WORKDIR /app

# 安裝系統依賴（yt-dlp 有時會需要 ffmpeg 來處理或檢查音訊貨櫃格式）
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y ffmpeg libsqlite3-dev && rm -rf /var/lib/apt/lists/*
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]