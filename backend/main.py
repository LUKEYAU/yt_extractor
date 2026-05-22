import os
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import yt_dlp
from google import genai
from google.genai import types

app = FastAPI()

# 初始化 Gemini Client (SDK 會自動去抓環境變數 GEMINI_API_KEY)
client = genai.Client()


class ExtractRequest(BaseModel):
    video_url: str


@app.post("/api/extract")
async def extract_youtube_knowledge(request: ExtractRequest):
    video_url = request.video_url
    output_dir = "/tmp"

    # 1. 配置 yt-dlp 參數
    ydl_opts = {
        "format": "m4a/bestaudio",
        "outtmpl": os.path.join(output_dir, "%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }

    audio_path = None

    try:
        # 2. 下載音訊
        print(f"📡 正在從 YouTube 下載音訊: {video_url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_id = info_dict.get("id")
            video_title = info_dict.get("title")
            ext = info_dict.get("ext")
            audio_path = os.path.join(output_dir, f"{video_id}.{ext}")

        if not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="音訊下載失敗，找不到暫存檔。")

        print(f"🎉 下載成功: {video_title}，準備上傳至 Gemini...")

        # 3. 使用 File API 上傳音檔至 Gemini
        # Gemini 的 File API 會將檔案暫存在 Google 伺服器（最多保留 48 小時，不佔用硬碟）
        audio_file = client.files.upload(
            file=audio_path,
            config=types.UploadFileConfig(
                mime_type="audio/m4a"  # 👈 加上這行就搞定囉！
            ),
        )
        print(f"☁️ 檔案已成功上傳至 Gemini File API. URI: {audio_file.uri}")

        # 4. 等待 Gemini 處理檔案（通常音檔上傳後需要幾秒鐘的 ACTIVE 狀態確認）
        while audio_file.state.name == "PROCESSING":
            print("⏳ Gemini 正在處理音檔中...")
            time.sleep(2)
            audio_file = client.files.get(name=audio_file.name)

        if audio_file.state.name == "FAILED":
            raise HTTPException(status_code=500, detail="Gemini 處理音訊檔案失敗。")

        # 5. 呼叫 Gemini 進行語音辨識與結構化輸出
        # 這裡使用的是 gemini-2.5-flash，速度快且對音訊理解能力極強
        print("🤖 島民秘書開始聽寫影片內容...")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                audio_file,
                "你是一位專業的影片知識萃取助理。請仔細聆聽這段音訊，並為我生成詳細的繁體中文逐字稿。如果是教學或技術影片，請盡量保留關鍵步驟。",
            ],
        )

        # 6. 非同步或結束後刪除 Gemini 上的暫存檔 (自由選擇，不刪除 48 小時後也會自動消失)
        client.files.delete(name=audio_file.name)
        print("🧹 已清除 Gemini 上的暫存檔案。")

        # 7. 回傳結果給前端
        return {
            "status": "success",
            "video_id": video_id,
            "title": video_title,
            "content": response.text,
        }

    except Exception as e:
        print(f"❌ 發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"處理失敗: {str(e)}")

    finally:
        # 8. 確保本地的 /tmp 暫存檔一定會被砍掉
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            print("🧹 已成功清理本地暫存音訊檔。")
