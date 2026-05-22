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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [chatInput, setChatInput] = useState(''); // ✨ 新增：管理對話輸入框的狀態
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // 🌍 頂層容器：限制全螢幕高度，禁止雜亂滾動，底色採用動森奶油燕麥白
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f8f8f0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>

      {/* ────────────────────────────────────────────────────────
          🌅 1. 頂部標題列 (Header Area)
          ──────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 32px',
        backgroundColor: '#fff',
        borderBottom: '4px solid #9f927d',
        boxShadow: '0 4px 10px rgba(107, 92, 67, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🍃</span>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#794f27', letterSpacing: '1px' }}>
            YouTube 影片知識萃取助理 — 知識無人島
          </h1>
        </div>

        {/* 把 Time 放在獨立的右側，全螢幕時絕對不會與其他內容重疊 */}
        <div style={{ transform: 'scale(0.95)', transformOrigin: 'right center' }}>
          <Time />
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────
          🏕️ 2. 下方主工作區 (左右分欄 Layout)
          ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '24px',
        gap: '24px',
        overflow: 'hidden', // 讓左右欄各自獨立滾動，維持整體比例
        boxSizing: 'border-box'
      }}>

        {/* 📱 左欄：NookPhone 造型導航控制台 */}
        <aside style={{
          width: '260px',
          minWidth: '260px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#fdfdf5',
          border: '4px solid #9f927d',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 6px 0 0 #bdaea0',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#a0936e', marginBottom: '4px' }}>
            📱 NOOKPHONE NAVI
          </div>

          <Divider type="line-brown" />

          <Button
            size="large"
            onClick={() => setCurrentPage('upload')}
            style={{ width: '100%' }}
          >
            上傳
          </Button>
          <Button
            size="large"
            onClick={() => setCurrentPage('map')}
            style={{ width: '100%' }}
          >
            學習地圖
          </Button>
          <Button
            size="large"
            onClick={() => {
              setCurrentPage('chat');
              setIsModalOpen(true);
            }}
            style={{ width: '100%' }}
          >
            chat
          </Button>

          <div style={{ flex: 1 }}></div>
          <Divider type="line-teal" />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#c4b89e' }}>v0.9.3</div>
        </aside>

        {/* ⛺ 右欄：動態核心內容展示區 */}
        <main style={{
          flex: 1,
          overflowY: 'auto', // 內容過長時自動在右卡片內部生成滾動條
          boxSizing: 'border-box'
        }}>

          {/* 📥 頁面 1：上傳頁面 */}
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
                  onChange={(val) => setYoutubeUrl(val)}
                  placeholder="請輸入 YouTube 影片網址"
                />
                <Button
                  size="large"
                  onClick={() => setCurrentPage('map')}
                  style={{ backgroundColor: '#19c8b9', color: '#fff' }}
                >
                  提取知識
                </Button>
              </div>
            </Card>
          )}

          {/* 🗺️ 頁面 2：學習地圖 */}
          {currentPage === 'map' && (
            <Card color="app-yellow" style={{ minHeight: '100%', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '26px', margin: '0 0 12px 0', color: '#725d42' }}>影片核心學習地圖</h2>
              <Divider type="wave-yellow" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <div style={{ padding: '20px', background: '#fff', border: '3px solid #9f927d', borderRadius: '18px', boxShadow: '0 4px 0 0 #d4c9b4' }}>
                  <h3 style={{ margin: 0, color: '#725d42' }}>🏕️ 第一階段：前言與背景介紹</h3>
                  <p style={{ margin: '8px 0 0 0', color: '#8a7b66', fontSize: '14px' }}>⏱️ 00:00 - 03:15 ➔ 介紹此專案的誕生背景與核心痛點解決方案。</p>
                </div>
                <div style={{ padding: '20px', background: '#fff', border: '3px solid #9f927d', borderRadius: '18px', boxShadow: '0 4px 0 0 #d4c9b4' }}>
                  <h3 style={{ margin: 0, color: '#725d42' }}>🌲 第二階段：技術架構實作</h3>
                  <p style={{ margin: '8px 0 0 0', color: '#8a7b66', fontSize: '14px' }}>⏱️ 03:16 - 12:45 ➔ 詳解 Docker 容器化部署與不使用 NGINX 的快打策略。</p>
                </div>
              </div>
            </Card>
          )}

          {/* 💬 頁面 3：AI 聊天機器人頁面 */}
          {currentPage === 'chat' && (
            <Card color="app-orange" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '26px', color: '#fff', margin: '0 0 12px 0' }}>💬 與島民秘書對話中</h2>
              <Divider type="line-white" />

              {/* 對話展示框，撐滿剩餘空間 */}
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.75)',
                border: '3px solid #9f927d',
                borderRadius: '18px',
                padding: '20px',
                margin: '20px 0',
                overflowY: 'auto'
              }}>
                <Typewriter speed={50} autoPlay>
                  <p style={{ color: '#725d42', fontSize: '16px', margin: 0, lineHeight: '1.6' }}>
                    <strong>島民秘書：</strong> 已經為您熟讀完這部 YouTube 影片的所有文字記錄囉！不論是架構細節還是核心結論，我都可以隨時回答您。今天想從哪裡開始聊起呢？
                  </p>
                </Typewriter>
              </div>

              {/* 輸入控制區 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  {/* ✨ 修正：將 value 與 onChange 綁定到對應的 state */}
                  <Input
                    size="large"
                    placeholder="輸入問題提問..."
                    value={chatInput}
                    onChange={(val) => setChatInput(val)}
                  />
                </div>
                <Button size="large" onClick={() => console.log('發送問題:', chatInput)}>發送</Button>
              </div>
            </Card>
          )}

        </main>

      </div>

      <Modal
        visible={isModalOpen}
        title="🍃 廣播廣播！"
        onClose={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
      >
        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.5 }}>
          大家早安！
        </p>
      </Modal>

    </div>
  );
}