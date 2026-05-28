import React, { useState, useEffect } from 'react';
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

interface ExtractionResult {
  status?: string;
  video_id: string;
  title: string;
  content: string;
}

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

  // 💡 歷史紀錄清單狀態
  const [historyList, setHistoryList] = useState<ExtractionResult[]>([]);
  // 💡 掌控最左側歷史欄「展開/收回」的狀態 (預設展開)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error('無法獲取歷史紀錄:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectHistory = (item: ExtractionResult) => {
    setApiResult(item);
    setChatMessages([
      {
        id: 'welcome',
        sender: 'secretary',
        text: `我已經幫你讀完《${item.title}》的內容囉！以下是這部影片的文字摘要紀錄，有任何細節問題都可以問我：\n\n${item.content}`
      }
    ]);
    setCurrentPage('map');
  };

  const handleExtract = async () => {
    if (!youtubeUrl) {
      alert('請輸入 YouTube 網址唷！🍃');
      return;
    }

    setIsLoading(true);
    try {
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
      setApiResult(data);

      setChatMessages([
        {
          id: 'welcome',
          sender: 'secretary',
          text: `我已經幫你讀完《${data.title}》的內容囉！以下是這部影片的文字摘要紀錄，有任何細節問題都可以問我：\n\n${data.content}`
        }
      ]);

      setYoutubeUrl('');
      setCurrentPage('map');
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert('發生錯誤，請檢查後端日誌或網址是否正確！');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput
    };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');

    try {
      alert(`成員預留測試：\n您問了：「${currentInput}」\n\n此功能由另一位組員對接 /api/chat`);
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
        boxShadow: '0 4px 10px rgba(107, 92, 67, 0.08)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 💡 漢堡選單按鈕：用來切換左側歷史欄的展開與收回 */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: '#fdfdf5', border: '2px solid #9f927d', borderRadius: '8px',
              padding: '6px 10px', cursor: 'pointer', fontSize: '16px', color: '#794f27',
              boxShadow: '0 2px 0 0 #bdaea0', display: 'flex', alignItems: 'center'
            }}
          >
            {isSidebarOpen ? '◀ 收回紀錄' : '▶ 歷史紀錄'}
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#794f27', letterSpacing: '1px' }}>
            YouTube 影片知識萃取助理 — 知識無人島
          </h1>
        </div>
        <div style={{ transform: 'scale(0.95)', transformOrigin: 'right center' }}>
          <Time />
        </div>
      </header>

      {/* 下方主工作區 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', boxSizing: 'border-box' }}>

        {/* 💡 1. 最左側 ChatGPT / YouTube 風格的獨立歷史側邊欄 */}
        <aside style={{
          width: isSidebarOpen ? '260px' : '0px',
          minWidth: isSidebarOpen ? '260px' : '0px',
          opacity: isSidebarOpen ? 1 : 0,
          backgroundColor: '#fdfdf5',
          borderRight: isSidebarOpen ? '4px solid #9f927d' : '0px solid transparent',
          display: 'flex',
          flexDirection: 'column',
          padding: isSidebarOpen ? '20px 16px' : '20px 0px',
          boxSizing: 'border-box',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s, padding 0.3s',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#794f27', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            歷史清單
          </div>
          <Divider type="line-brown" />

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '10px'
          }}>
            {historyList.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#c4b89e', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>暫無紀錄</div>
            ) : (
              historyList.map((item) => (
                <div
                  key={item.video_id}
                  onClick={() => handleSelectHistory(item)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: apiResult?.video_id === item.video_id ? '#e6f9f6' : '#fff',
                    border: apiResult?.video_id === item.video_id ? '2px solid #19c8b9' : '2px solid #e1dacb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#725d42',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'all 0.2s',
                    boxShadow: apiResult?.video_id === item.video_id ? 'none' : '0 2px 0 0 #e1dacb'
                  }}
                  title={item.title}
                >
                  📺 {item.title}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* 右側主區域 (包含上方的橫向導航列與下方的主要內容卡片) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '16px', overflow: 'hidden', boxSizing: 'border-box' }}>

          {/* 💡 2. NOOKPHONE NAVI 橫向工具列 (無邊框，橫放在卡片正上方) */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 0'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#a0936e', marginRight: '8px' }}>
            </div>
            <div style={{ width: '120px' }}>
              <Button size="small" onClick={() => setCurrentPage('upload')} style={{ width: '100%' }}>➕ 提取新影片</Button>
            </div>
            <div style={{ width: '120px' }}>
              <Button size="small" onClick={() => setCurrentPage('map')} style={{ width: '100%' }} disabled={!apiResult}>🗺️ 學習地圖</Button>
            </div>
            <div style={{ width: '120px' }}>
              <Button size="small" onClick={() => { setCurrentPage('chat'); setIsModalOpen(true); }} style={{ width: '100%' }} disabled={!apiResult}>💬 島民對話</Button>
            </div>
          </nav>

          {/* 下方動態核心內容展示區 */}
          <main style={{ flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>

            {/* 上傳頁面 */}
            {currentPage === 'upload' && (
              <Card color="app-teal" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '36px', color: '#725d42', margin: '0 0 12px 0' }}>歡迎回到無人島！</h1>
                  <p style={{ color: '#725d42', fontSize: '16px', margin: 0 }}>請在下方輸入 YouTube 網址，我們將為您開闢專屬知識地圖</p>
                </div>

                <div style={{ maxWidth: '550px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Input
                    size="large"
                    value={youtubeUrl}
                    onChange={(e: any) => setYoutubeUrl(e.target.value)}
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
                  📌 影片學習地圖：{apiResult?.title}
                </h2>
                <Divider type="wave-yellow" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  <div style={{ padding: '20px', background: '#fff', border: '3px solid #9f927d', borderRadius: '18px', boxShadow: '0 4px 0 0 #d4c9b4' }}>
                    <h3 style={{ margin: 0, color: '#725d42' }}>📝 Gemini 萃取核心知識內容</h3>
                    <p style={{ margin: '12px 0 0 0', color: '#8a7b66', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      {apiResult?.content}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* 島民對話頁面 */}
            {currentPage === 'chat' && (
              <Card color="app-orange" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '26px', color: '#fff', margin: '0 0 12px 0' }}>💬 與島民秘書對話中</h2>
                <Divider type="line-white" />

                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.75)', border: '3px solid #9f927d',
                  borderRadius: '18px', padding: '20px', margin: '20px 0', overflowY: 'auto'
                }}>
                  {chatMessages.map((msg, index) => (
                    <div key={msg.id} style={{ marginBottom: '16px' }}>
                      {msg.sender === 'secretary' ? (
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
                      onChange={(e: any) => setChatInput(e.target.value)}
                      onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()}
                    />
                  </div>
                  <Button size="large" onClick={handleSendMessage}>發送</Button>
                </div>
              </Card>
            )}

          </main>
        </div>
      </div>

      <Modal visible={isModalOpen} title="廣播廣播！" onClose={() => setIsModalOpen(false)} onOk={() => setIsModalOpen(false)}>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.5 }}>
          大家早安！秘書已經就位，隨時可以為您解讀影片囉！
        </p>
      </Modal>

    </div>
  );
}