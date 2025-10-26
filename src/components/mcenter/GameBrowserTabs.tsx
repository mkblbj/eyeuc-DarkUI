'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameInfo, ModListItem } from '@/lib/mcenterService';
import * as mcenterService from '@/lib/mcenterService';
import ModListView from './ModListView';
import ModDetailView from './ModDetailView';

interface GameBrowserTabsProps {
  onGameSelect?: (game: GameInfo) => void;
}

type ViewType = 'placeholder' | 'list' | 'detail';

const GameBrowserTabs: React.FC<GameBrowserTabsProps> = ({ onGameSelect }) => {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 视图状态管理
  const [currentView, setCurrentView] = useState<ViewType>('placeholder');
  const [selectedMod, setSelectedMod] = useState<ModListItem | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await mcenterService.getGames();
      // 按 listId 从小到大排序
      const sortedData = data.sort((a, b) => a.listId - b.listId);
      setGames(sortedData);
      
      if (sortedData.length > 0) {
        // 尝试从 localStorage 读取上次访问的游戏
        let lastGameToSelect: GameInfo | null = null;
        
        try {
          const lastGameId = localStorage.getItem('mcenter-last-game-id');
          if (lastGameId) {
            // 查找匹配的游戏
            lastGameToSelect = sortedData.find(g => g.listId.toString() === lastGameId) || null;
          }
        } catch (e) {
          console.warn('Failed to read last game from localStorage:', e);
        }
        
        // 如果找到了上次的游戏，使用它；否则使用第一个
        const gameToSelect = lastGameToSelect || sortedData[0];
        setSelectedGame(gameToSelect);
        setCurrentView('list'); // 初始化时直接显示列表
        onGameSelect?.(gameToSelect);
        
        // 保存当前选择
        try {
          localStorage.setItem('mcenter-last-game-id', gameToSelect.listId.toString());
        } catch (e) {
          console.warn('Failed to save game to localStorage:', e);
        }
      }
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameChange = (game: GameInfo) => {
    setSelectedGame(game);
    setCurrentView('list'); // 切换到列表视图
    setSelectedMod(null); // 清空选中的模组
    onGameSelect?.(game);
    
    // 保存用户的选择到 localStorage
    try {
      localStorage.setItem('mcenter-last-game-id', game.listId.toString());
      console.log('Saved game selection:', game.game, 'ID:', game.listId);
    } catch (e) {
      console.warn('Failed to save game selection to localStorage:', e);
    }
  };

  const handleModClick = (mod: ModListItem) => {
    setSelectedMod(mod);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedMod(null);
  };

  if (loading) {
    return (
      <StyledWrapper>
        <div className="main-container">
          <div className="loading">加载游戏列表中...</div>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="main-container">
        <div className="radio-input">
          {games.map((game) => (
            <div key={game.listId} className="option">
              <label className="favicon" htmlFor={`game-${game.listId}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  viewBox="0 0 24 24"
                  style={{ flex: 'none', lineHeight: 1 }}
                  height="20px"
                >
                  <path
                    fill="#3b82f6"
                    d="M21,6H3A1,1,0,0,0,2,7V17a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V7A1,1,0,0,0,21,6ZM10,14H8v2H6V14H4V12H6V10H8v2h2Zm4.5,2a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,14.5,16Zm3-3a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,17.5,13Z"
                  />
                </svg>
              </label>
              <input
                className="input game-radio"
                value={game.listId}
                name="game-radio"
                id={`game-${game.listId}`}
                type="radio"
                checked={selectedGame?.listId === game.listId}
                onChange={() => handleGameChange(game)}
              />
              <label className="label" htmlFor={`game-${game.listId}`}>
                {game.game}
              </label>
            </div>
          ))}
          <div className="option new-tab">+</div>
          <div className="controls">
            <svg
              viewBox="0 0 24 24"
              version="1.1"
              width="18px"
              height="18px"
              xmlns="http://www.w3.org/2000/svg"
              fill="#ccc"
            >
              <path
                d="M3,12 C3,11.4477 3.44772,11 4,11 L20,11 C20.5523,11 21,11.4477 21,12 C21,12.5523 20.5523,13 20,13 L4,13 C3.44772,13 3,12.5523 3,12 Z"
                fill="#ccc"
              />
            </svg>
            <svg
              fill="#ccc"
              height="18px"
              width="18px"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 460.893 460.893"
            >
              <path d="M420.84,0H160.051c-18.121,0-32.864,14.743-32.864,32.865v76.136c9.398,0,296.519-0.163,296.519-0.163v184.815 c0,1.58-1.285,2.865-2.865,2.865h-57.135v30h57.135c18.122,0,32.865-14.743,32.865-32.865V32.865 C453.705,14.743,438.962,0,420.84,0z M157.186,78.838V32.865c0-1.58,1.285-2.865,2.864-2.865h260.789 c1.58,0,2.865,1.285,2.865,2.865v45.973H157.186z" />
              <circle cx="183.835" cy="56.556" r="18.1" />
              <path d="M300.84,134.375c-8.756,0-252.622,0-260.789,0c-18.109,0-32.864,14.717-32.864,32.864v260.789 c0,18.12,14.742,32.865,32.864,32.865H300.84c18.118,0,32.865-14.739,32.865-32.865V167.239 C333.705,149.098,318.952,134.375,300.84,134.375z M37.186,167.239c0-1.579,1.285-2.864,2.864-2.864h260.789 c1.58,0,2.865,1.285,2.865,2.864v45.974H37.186V167.239z M303.706,428.028h-0.001c0,1.58-1.285,2.865-2.865,2.865H40.051 c-1.579,0-2.864-1.285-2.864-2.865V243.213h266.519V428.028z" />
              <circle cx="64.835" cy="188.931" r="18.1" />
            </svg>
            <svg
              width="18px"
              height="18px"
              viewBox="-0.5 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 21.32L21 3.32001" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3.32001L21 21.32" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="url-bar-container">
          <p className="url-bar">
            {selectedGame && (
              <span className="current-url">
                {currentView === 'list' || currentView === 'placeholder'
                  ? `eyeuc/${selectedGame.slug || selectedGame.game}`
                  : `eyeuc/${selectedGame.slug || selectedGame.game}/mod/${selectedMod?.mid}`
                }
              </span>
            )}
          </p>
        </div>
        <div className="content-container">
          {currentView === 'placeholder' && (
            <div className="content-placeholder">
              <div className="placeholder-icon">
                <i className="fa-light fa-cube fa-4x" style={{ color: '#3b82f6', opacity: 0.3 }} />
              </div>
              <h3 className="placeholder-title">
                {selectedGame ? `${selectedGame.game} 模组列表` : '选择游戏'}
              </h3>
              <p className="placeholder-text">
                模组列表视图已准备就绪
                <br />
                <span style={{ fontSize: '12px', opacity: 0.6 }}>
                  {selectedGame && `当前选择: ${selectedGame.slug || selectedGame.game} (${selectedGame.modsCount} 个模组)`}
                </span>
              </p>
            </div>
          )}

          {currentView === 'list' && selectedGame && (
            <ModListView game={selectedGame} onModClick={handleModClick} />
          )}

          {currentView === 'detail' && selectedMod && (
            <ModDetailView
              mid={selectedMod.mid}
              onBack={handleBackToList}
            />
          )}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .main-container {
    background-color: #1a1a1a;
    padding: 4px;
    border-radius: 16px 16px 2px 2px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .loading {
    padding: 40px;
    text-align: center;
    color: #999;
    font-size: 14px;
  }

  .radio-input {
    color: #ccc;
    background-color: #2a2a2a;
    padding: 4px 0 0 4px;
    border-radius: 12px 12px 0 0;
    display: flex;
  }

  .controls {
    display: flex;
    padding: 0 8px;
    margin-left: auto;
    gap: 8px;
    height: 32px;
    align-items: center;
    justify-content: center;
  }

  .controls svg {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .controls svg:hover {
    opacity: 0.7;
  }

  .option {
    padding: 0 4px;
    display: flex;
    align-items: center;
    border-radius: 10px 10px 0 0;
    background-color: #2a2a2a;
    transition: all 0.2s;
  }

  .new-tab {
    padding: 0 12px;
    border-left: 1px solid #1a1a1a;
    border-radius: 0;
    height: 16px;
    margin-top: 8px;
    font-size: 16px;
    cursor: pointer;
    color: #999;
  }

  .new-tab:hover {
    color: #ccc;
  }

  .label {
    cursor: pointer;
    margin-right: 24px;
    font-size: 13px;
    user-select: none;
  }

  .input[type='radio'] {
    appearance: none;
    display: flex;
    margin: 0;
  }

  .favicon {
    margin-right: 8px;
    margin-top: 4px;
    cursor: pointer;
  }

  .option:has(.input:checked) {
    position: relative;
    background-color: #1a1a1a;
    transition: all 200ms;
  }

  .url-bar-container {
    padding: 8px;
    background-color: #1a1a1a;
  }

  .url-bar {
    background-color: #2a2a2a;
    border-radius: 16px;
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin: 0;
  }

  .current-url {
    font-size: 13px;
    color: #999;
  }

  .content-container {
    min-height: 300px;
    background-color: #1a1a1a;
    border-radius: 0 0 12px 12px;
    overflow-y: auto;
    max-height: calc(100vh - 300px);
  }

  .content-placeholder {
    text-align: center;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }

  .placeholder-icon {
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
  }

  .placeholder-title {
    font-size: 20px;
    font-weight: 600;
    color: #ccc;
    margin-bottom: 12px;
  }

  .placeholder-text {
    font-size: 14px;
    color: #999;
    line-height: 1.6;
  }


  /* 模组详情视图 */
  .mod-detail-view {
    padding: 20px;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #999;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 20px;
  }

  .back-button:hover {
    color: #fff;
    border-color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }

  .back-button i {
    font-size: 16px;
  }

  .detail-title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
  }

  .detail-content {
    min-height: 300px;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

export default GameBrowserTabs;

