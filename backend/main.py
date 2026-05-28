import os
import time
import sqlite3  # 💡 引入內建 SQLite 資料庫
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

# 💡 初始化 SQLite 資料庫與建立資料表
DB_PATH = "/app/history.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS extraction_history (
            video_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


init_db()

# 初始化 Gemini Client
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})


class ExtractRequest(BaseModel):
    video_url: str


# 💡 新增功能：拉取所有歷史清單的路由
@app.get("/api/history")
async def get_history():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # 依時間倒序排列（最新的在最上面）
        cursor.execute(
            "SELECT video_id, title, content FROM extraction_history ORDER BY created_at DESC"
        )
        rows = cursor.fetchall()
        conn.close()

        history_list = [
            {"video_id": row[0], "title": row[1], "content": row[2]} for row in rows
        ]
        return history_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"讀取歷史紀錄失敗: {str(e)}")


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

        while audio_file.state.name == "PROCESSING":
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
        except Exception:
            pass

        # 💡 關鍵變更：將成功萃取的結果寫入 SQLite 資料庫（若重複則覆蓋更新）
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO extraction_history (video_id, title, content)
            VALUES (?, ?, ?)
        """,
            (video_id, video_title, response.text),
        )
        conn.commit()
        conn.close()

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
