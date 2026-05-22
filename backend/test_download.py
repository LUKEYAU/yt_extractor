import os
import yt_dlp


def test_audio_download(video_url: str):
    # 設定下載儲存到容器內的 /tmp 目錄
    output_dir = "/tmp"

    # yt-dlp 核心配置：只抓取最輕量的 m4a 音訊軌
    ydl_opts = {
        "format": "m4a/bestaudio",
        # 限制輸出的檔名格式為：/tmp/%(id)s.%(ext)s (例如 /tmp/dQw4w9WgXcQ.m4a)
        "outtmpl": os.path.join(output_dir, "%(id)s.%(ext)s"),
        "quiet": False,  # 開啟日誌，讓我們看得到下載進度條
        "no_warnings": False,
    }

    print(f"📡 航空港準備出發！正在嘗試下載音訊來源: {video_url}")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # 提取影片資訊並執行下載
            info_dict = ydl.extract_info(video_url, download=True)
            video_id = info_dict.get("id")
            video_title = info_dict.get("title")
            ext = info_dict.get("ext")

            expected_path = os.path.join(output_dir, f"{video_id}.{ext}")

            print("\n" + "=" * 50)
            print("🎉 【下載測試成功！】")
            print(f"📌 影片標題: {video_title}")
            print(f"📌 影片 ID: {video_id}")
            print(f"📌 檔案實體路徑: {expected_path}")
            print(f"📌 檔案大小: {os.path.getsize(expected_path) / (1024*1024):.2f} MB")
            print("=" * 50)

            # 測試完畢後，把暫存檔砍掉，保持無人島環境整潔
            os.remove(expected_path)
            print("🧹 測試結束，已成功清理暫存音訊檔。")

    except Exception as e:
        print(f"\n❌ 【下載測試失敗！】發生錯誤: {str(e)}")


if __name__ == "__main__":
    # 這裡放你要測試的 YouTube 網址
    # 提示：這是一部帶有繁中 CC 字幕的測試片（Rick Astley）
    target_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    test_audio_download(target_url)
