import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
from google import genai
from google.genai import types

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 💡 修正 1：明確從環境變數讀取 API KEY，避免 SDK 隱式抓取失敗
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("⚠️ 警告：找不到 GEMINI_API_KEY 環境變數，請檢查 .env 檔案！")

client = genai.Client(api_key=api_key)


class ExtractRequest(BaseModel):
    video_url: str


@app.post("/api/extract")
async def extract_youtube_knowledge(request: ExtractRequest):
    video_url = request.video_url
    output_dir = "/tmp"

    ydl_opts = {
        "format": "m4a/bestaudio",
        "outtmpl": os.path.join(output_dir, "%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }

    audio_path = None

    try:
        print(f"正在從 YouTube 下載音訊: {video_url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_id = info_dict.get("id")
            video_title = info_dict.get("title")
            ext = info_dict.get("ext")
            audio_path = os.path.join(output_dir, f"{video_id}.{ext}")

        if not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="音訊下載失敗，找不到暫存檔。")

        print(f"下載成功: {video_title}，準備上傳至 Gemini...")

        audio_file = client.files.upload(
            file=audio_path,
            config=types.UploadFileConfig(mime_type="audio/m4a"),
        )
        print(f"☁️ 檔案已成功上傳至 Gemini File API. URI: {audio_file.uri}")

        while audio_file.state.name == "PROCESSING":
            print("Gemini 正在處理音檔中...")
            time.sleep(2)
            audio_file = client.files.get(name=audio_file.name)

        if audio_file.state.name == "FAILED":
            raise HTTPException(status_code=500, detail="Gemini 處理音訊檔案失敗。")

        print("開始聽寫影片內容...")

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                audio_file,
                "你是一位專業的影片知識萃取助理。請仔細聆聽這段音訊，並為我生成詳細的繁體中文逐字稿。如果是教學或技術影片，請盡量保留關鍵步驟。",
            ],
        )

        try:
            client.files.delete(name=audio_file.name)
            print("🧹 已清除 Gemini 上的暫存檔案。")
        except Exception as delete_err:
            print(f"⚠️ 清除 Gemini 雲端暫存檔失敗 (不影響結果): {str(delete_err)}")

        return {
            "status": "success",
            "video_id": video_id,
            "title": video_title,
            "content": response.text,
        }

    except Exception as e:
        print(f"發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"處理失敗: {str(e)}")

    finally:
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            print("已成功清理本地暫存音訊檔。")
