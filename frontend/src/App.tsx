import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  Modal,
  Typewriter,
  Time,
  Divider
} from 'animal-island-ui';

type Page = 'upload' | 'map' | 'chat';

// 定義後端回傳的資料結構 
interface ExtractionResult {
  status: string;
  video_id: string;
  title: string;
  content: string;
}

// 預留給另一位組員的對話訊息結構
interface ChatMessage {
  id: string;
  sender: 'secretary' | 'user';
  text: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<ExtractionResult | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleExtract = async () => {
    if (!youtubeUrl) {
      alert('請輸入 YouTube 網址唷！🍃');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const response = await fetch(`${apiUrl}/api/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_url: youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('伺服器萃取知識失敗了...');
      }

      const data: ExtractionResult = await response.json();
      setApiResult(data);       // 儲存後端回傳的資料 

      setChatMessages([
        {
          id: 'welcome',
          sender: 'secretary',
          text: `我已經幫你讀完《${data.title}》的內容囉！以下是這部影片的文字摘要紀錄，有任何細節問題都可以問我：\n\n${data.content}`
        }
      ]);

      setCurrentPage('map');    // 自動切換到學習地圖頁面 
    } catch (error) {
      console.error(error);
      alert('發生錯誤，請檢查後端日誌或網址是否正確！');
    } finally {
      setIsLoading(false);
    }
  };

  // 預留空間：另一位組員負責的島民對話發送邏輯
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // 1. 先將使用者的問題渲染到畫面上
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput
    };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput(''); // 清空輸入框

    // 2. 這裡預留給組員對接後端 RAG / Chat API
    try {
      /* ==================================================================
        💡 組員開發提示 (TODO):
        這裡可以使用 fetch 呼叫後端新開的 /api/chat 路由。
        傳入參數範例：{ question: currentInput, context: apiResult?.content }
        ==================================================================
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/chat`, { ... });
        const data = await response.json();
        
        // 收到後端回覆後，加進訊息陣列：
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'secretary',
          text: data.reply
        }]);
      */

      // 暫時維持原本的 alert 提示，方便組員接手測試
      alert(`成員預留測試：\n您問了：「${currentInput}」\n\n此功能由另一位組員對接 /api/chat，並將影片 content 作為 Context 餵給 Gemini 進行問答。`);

    } catch (error) {
      console.error('對話發生錯誤:', error);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
      backgroundColor: '#f8f8f0', boxSizing: 'border-box', overflow: 'hidden'
    }}>

      {/* 頂部標題列 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '5px 32px', backgroundColor: '#fff', borderBottom: '4px solid #9f927d',
        boxShadow: '0 4px 10px rgba(107, 92, 67, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}></span>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#794f27', letterSpacing: '1px' }}>
            YouTube 影片知識萃取助理 — 知識無人島
          </h1>
        </div>
        <div style={{ transform: 'scale(0.95)', transformOrigin: 'right center' }}>
          <Time />
        </div>
      </header>

      {/* 下方主工作區 */}
      <div style={{ display: 'flex', flex: 1, padding: '24px', gap: '24px', overflow: 'hidden', boxSizing: 'border-box' }}>

        {/* 左欄：NookPhone 造型導航控制台 */}
        <aside style={{
          width: '260px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '14px',
          backgroundColor: '#fdfdf5', border: '4px solid #9f927d', borderRadius: '24px', padding: '20px',
          boxShadow: '0 6px 0 0 #bdaea0', boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#a0936e', marginBottom: '4px' }}>
            📱 NOOKPHONE NAVI
          </div>
          <Divider type="line-brown" />

          <Button size="large" onClick={() => setCurrentPage('upload')} style={{ width: '100%' }}>上傳</Button>
          <Button size="large" onClick={() => setCurrentPage('map')} style={{ width: '100%' }} disabled={!apiResult}>學習地圖</Button>
          <Button size="large" onClick={() => { setCurrentPage('chat'); setIsModalOpen(true); }} style={{ width: '100%' }} disabled={!apiResult}>島民對話</Button>

          <div style={{ flex: 1 }}></div>
          <Divider type="line-teal" />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#c4b89e' }}>v0.9.3</div>
        </aside>

        {/* 動態核心內容展示區 */}
        <main style={{ flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>

          {/* 上傳頁面 */}
          {currentPage === 'upload' && (
            <Card color="app-teal" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '36px', color: '#725d42', margin: '0 0 12px 0' }}>歡迎！</h1>
                <p style={{ color: '#725d42', fontSize: '16px', margin: 0 }}>請輸入 YouTube 網址，我們將為您開闢專屬知識地圖</p>
              </div>

              <div style={{ maxWidth: '550px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Input
                  size="large"
                  value={youtubeUrl}
                  onChange={(e: any) => setYoutubeUrl(e.target.value)} // 更改這裡
                  placeholder="請輸入 YouTube 影片網址"
                  disabled={isLoading}
                />
                <Button
                  size="large"
                  onClick={handleExtract}
                  style={{ backgroundColor: '#19c8b9', color: '#fff' }}
                  disabled={isLoading}
                >
                  {isLoading ? '秘書正在全力聽寫中... ' : '提取知識'}
                </Button>
              </div>
            </Card>
          )}

          {/* 學習地圖頁面 */}
          {currentPage === 'map' && (
            <Card color="app-yellow" style={{ minHeight: '100%', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '26px', margin: '0 0 12px 0', color: '#725d42' }}>
                影片核心學習地圖：{apiResult?.title || '未載入'}
              </h2>
              <Divider type="wave-yellow" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <div style={{ padding: '20px', background: '#fff', border: '3px solid #9f927d', borderRadius: '18px', boxShadow: '0 4px 0 0 #d4c9b4' }}>
                  <h3 style={{ margin: 0, color: '#725d42' }}>📝 Gemini 萃取核心知識內容</h3>
                  <p style={{ margin: '12px 0 0 0', color: '#8a7b66', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {apiResult?.content || '暫無內容，請先至上傳頁面提取影片知識。'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* AI 聊天機器人頁面 — 保持完全相同的 UI 外觀，底層改為支持多輪對話渲染 */}
          {currentPage === 'chat' && (
            <Card color="app-orange" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '26px', color: '#fff', margin: '0 0 12px 0' }}>💬 與島民秘書對話中</h2>
              <Divider type="line-white" />

              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.75)', border: '3px solid #9f927d',
                borderRadius: '18px', padding: '20px', margin: '20px 0', overflowY: 'auto'
              }}>
                {/* 預留空間：組員只需讓 API 回傳結果去更新 chatMessages 即可自動渲染動態歷史對話 */}
                {chatMessages.map((msg, index) => (
                  <div key={msg.id} style={{ marginBottom: '16px' }}>
                    {msg.sender === 'secretary' ? (
                      // 秘書回覆：第一則使用打字機特效，後續追問直接呈現以確保體驗
                      index === 0 ? (
                        <Typewriter speed={10} autoPlay>
                          <div style={{ color: '#725d42', fontSize: '16px', margin: 0, lineHeight: '1.6' }}>
                            <strong>秘書：</strong>
                            <hr style={{ border: '1px dashed #9f927d', margin: '12px 0' }} />
                            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text.replace(`我已經幫你讀完《${apiResult?.title}》的內容囉！以下是這部影片的文字摘要紀錄，有任何細節問題都可以問我：\n\n`, '')}</span>
                          </div>
                        </Typewriter>
                      ) : (
                        <div style={{ color: '#725d42', fontSize: '16px', margin: 0, lineHeight: '1.6' }}>
                          <strong>秘書：</strong>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                        </div>
                      )
                    ) : (
                      // 使用者提問的樣式
                      <div style={{ color: '#11a89b', fontSize: '16px', margin: 0, lineHeight: '1.6', textAlign: 'right' }}>
                        <strong>你：</strong>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                      </div>
                    )}
                    {index < chatMessages.length - 1 && <hr style={{ border: '1px dashed #9f927d', margin: '12px 0' }} />}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    size="large"
                    placeholder="輸入問題提問..."
                    value={chatInput}
                    onChange={(e: any) => setChatInput(e.target.value)} // 更改這裡
                    onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <Button size="large" onClick={handleSendMessage}>發送</Button>
              </div>
            </Card>
          )}

        </main>
      </div>

      <Modal visible={isModalOpen} title="廣播廣播！" onClose={() => setIsModalOpen(false)} onOk={() => setIsModalOpen(false)}>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.5 }}>
          大家早安！秘書已經就位，隨時可以為您解讀影片囉！
        </p>
      </Modal>

    </div>
  );
}