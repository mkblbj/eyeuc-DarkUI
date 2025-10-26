import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

interface ImportConfirmDialogProps {
  isOpen: boolean;
  filename: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmDialog({
  isOpen,
  filename,
  onConfirm,
  onCancel,
}: ImportConfirmDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <DialogOverlay onClick={onCancel}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg 
              aria-hidden="true" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg" 
              className="success-svg"
            >
              <path 
                clipRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                fillRule="evenodd" 
              />
            </svg>
          </div>
          <div className="success-prompt-wrap">
            <p className="success-prompt-heading">
              {t("下载完成")}
              <span className="checkmark">✓</span>
            </p>
            <div className="success-prompt-prompt">
              <p className="filename">{filename}</p>
              <p className="message">{t("文件已下载到 Mods 库，是否立即扫描并导入？")}</p>
            </div>
            <div className="success-button-container">
              <button className="success-button-main" type="button" onClick={onConfirm}>
                <i className="fa-light fa-download" />
                {t("立即导入")}
              </button>
              <button className="success-button-secondary" type="button" onClick={onCancel}>
                {t("稍后手动导入")}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DialogContent = styled.div`
  width: 380px;
  max-width: 90%;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background-color: rgb(240 253 244);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
  animation: slideIn 0.4s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .flex {
    display: flex;
  }

  .flex-shrink-0 {
    flex-shrink: 0;
  }

  .success-svg {
    color: rgb(74 222 128);
    width: 1.5rem;
    height: 1.5rem;
    filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.4));
    animation: pulse 2s infinite;
  }

  .success-prompt-wrap {
    margin-left: 1rem;
    flex: 1;
  }

  .success-prompt-heading {
    font-weight: 700;
    color: rgb(22 101 52);
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }

  .checkmark {
    color: rgb(74 222 128);
    animation: scaleCheck 0.3s ease-in-out;
  }

  .success-prompt-prompt {
    margin-top: 0.75rem;
    color: rgb(21 128 61);
    line-height: 1.5;

    .filename {
      font-weight: 600;
      color: rgb(22 101 52);
      margin-bottom: 0.5rem;
      word-break: break-all;
      font-size: 0.95rem;
    }

    .message {
      font-size: 0.875rem;
      margin: 0;
    }
  }

  .success-button-container {
    display: flex;
    margin-top: 1rem;
    gap: 0.75rem;
  }

  .success-button-main {
    padding: 0.5rem 1rem;
    background-color: rgb(22 101 52);
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background-color: rgb(21 128 61);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(22, 101, 52, 0.3);
    }

    &:active {
      transform: scale(0.95);
    }

    i {
      font-size: 0.875rem;
    }
  }

  .success-button-secondary {
    padding: 0.5rem 1rem;
    background-color: rgb(240 253 244);
    color: rgb(22 101 52);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: 1px solid rgba(22, 101, 52, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgb(220, 243, 234);
      border-color: rgba(22, 101, 52, 0.3);
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes scaleCheck {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

