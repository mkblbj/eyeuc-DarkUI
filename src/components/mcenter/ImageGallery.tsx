"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled from "styled-components";
import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import { ModImage } from "@/lib/mcenterService";

interface ImageGalleryProps {
  images: ModImage[];
  cover: string | null;
  title: string;
}

export default function ImageGallery({ images, cover, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState<Set<number>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // 主轮播 Embla 实例 - 使用 Fade 效果
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
    { 
      loop: true,
    },
    [Fade()]
  );
  
  // 缩略图轮播 Embla 实例
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    axis: 'x',
  });
  
  // 合并封面和图集
  const allImages = useMemo(() => {
    const imgs = [...images];
    if (cover && !imgs.find(img => img.url === cover)) {
      imgs.unshift({ url: cover, index: -1 });
    }
    return imgs;
  }, [images, cover]);
  
  // 双实例联动逻辑
  const onThumbClick = useCallback((index: number) => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    emblaMainApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbsApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);
  
  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
    
    return () => {
      emblaMainApi.off('select', onSelect);
      emblaMainApi.off('reInit', onSelect);
    };
  }, [emblaMainApi, onSelect]);
  
  // 图片加载错误
  const handleImageError = (index: number) => {
    setImageError(prev => new Set(prev).add(index));
  };
  
  // 键盘导航（Lightbox）
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') emblaMainApi?.scrollPrev();
      if (e.key === 'ArrowRight') emblaMainApi?.scrollNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, emblaMainApi]);
  
  // 无图片占位符
  if (allImages.length === 0) {
    return (
      <StyledWrapper>
        <div className="no-image-placeholder">
          <i className="fa-light fa-image fa-4x" />
          <p>暂无图片</p>
        </div>
      </StyledWrapper>
    );
  }
  
  return (
    <StyledWrapper>
      {/* 主轮播 - Fade 效果 */}
      <div className="embla-main" ref={emblaMainRef}>
        <div className="embla-main__container">
          {allImages.map((img, index) => (
            <div className="embla-main__slide" key={index}>
              {!imageError.has(index) ? (
                <img
                  src={img.url}
                  alt={`${title} - ${index + 1}`}
                  className="embla-main__slide__img"
                  referrerPolicy="no-referrer"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onClick={() => setLightboxOpen(true)}
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="image-error-placeholder">
                  <i className="fa-light fa-image-slash fa-3x" />
                  <p>图片加载失败</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 导航按钮 */}
        {allImages.length > 1 && (
          <>
            <button 
              className="embla-main__button embla-main__button--prev"
              onClick={() => emblaMainApi?.scrollPrev()}
              aria-label="上一张"
            >
              <i className="fa-light fa-chevron-left" />
            </button>
            <button 
              className="embla-main__button embla-main__button--next"
              onClick={() => emblaMainApi?.scrollNext()}
              aria-label="下一张"
            >
              <i className="fa-light fa-chevron-right" />
            </button>
          </>
        )}
        
        {/* 图片计数器 */}
        {allImages.length > 1 && (
          <div className="embla-main__counter">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
      
      {/* 缩略图轮播 */}
      {allImages.length > 1 && (
        <div className="embla-thumbs" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`embla-thumbs__slide ${index === selectedIndex ? 'embla-thumbs__slide--selected' : ''}`}
                onClick={() => onThumbClick(index)}
              >
                {!imageError.has(index) ? (
                  <img
                    src={img.url}
                    alt={`缩略图 ${index + 1}`}
                    className="embla-thumbs__slide__img"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div className="embla-thumbs__slide__error">
                    <i className="fa-light fa-image-slash" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Lightbox 放大查看 */}
      {lightboxOpen && !imageError.has(selectedIndex) && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
              <i className="fa-light fa-times fa-2x" />
            </button>
            <img
              src={allImages[selectedIndex].url}
              alt={`${title} - ${selectedIndex + 1}`}
              className="lightbox-image"
              referrerPolicy="no-referrer"
            />
            {allImages.length > 1 && (
              <>
                <button 
                  className="lightbox-nav lightbox-nav--prev" 
                  onClick={(e) => { e.stopPropagation(); emblaMainApi?.scrollPrev(); }}
                  aria-label="上一张"
                >
                  <i className="fa-light fa-chevron-left fa-2x" />
                </button>
                <button 
                  className="lightbox-nav lightbox-nav--next" 
                  onClick={(e) => { e.stopPropagation(); emblaMainApi?.scrollNext(); }}
                  aria-label="下一张"
                >
                  <i className="fa-light fa-chevron-right fa-2x" />
                </button>
                <div className="lightbox-counter">
                  {selectedIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  --slide-spacing: 0px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  
  /* 主轮播容器 */
  .embla-main {
    position: relative;
    width: 100%;
    background: #0a0a0a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .embla-main__container {
    display: flex;
    touch-action: pan-y pinch-zoom;
    margin-left: calc(var(--slide-spacing) * -1);
  }
  
  .embla-main__slide {
    flex: 0 0 100%;
    min-width: 0;
    padding-left: var(--slide-spacing);
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .embla-main__slide__img {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: zoom-in;
    user-select: none;
    display: block;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  /* 主轮播导航按钮 */
  .embla-main__button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    
    &:hover {
      background: rgba(59, 130, 246, 0.8);
      border-color: #3b82f6;
      transform: translateY(-50%) scale(1.1);
    }
    
    &--prev {
      left: 16px;
    }
    
    &--next {
      right: 16px;
    }
  }
  
  /* 主轮播计数器 */
  .embla-main__counter {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 14px;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 20px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    z-index: 10;
    backdrop-filter: blur(4px);
  }
  
  /* 缩略图轮播容器 */
  .embla-thumbs {
    margin-top: 12px;
    overflow: hidden;
    width: 100%;
  }
  
  .embla-thumbs__container {
    display: flex;
    gap: 8px;
    touch-action: pan-y pinch-zoom;
    cursor: grab;
    backface-visibility: hidden;
    
    &:active {
      cursor: grabbing;
    }
  }
  
  .embla-thumbs__slide {
    flex: 0 0 80px;
    min-width: 0;
    height: 60px;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #1a1a1a;
    position: relative;
    
    &--selected {
      border-color: #3b82f6;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
    }
    
    &:hover:not(&--selected) {
      border-color: #555;
      transform: translateY(-2px);
    }
  }
  
  .embla-thumbs__slide__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
  }
  
  .embla-thumbs__slide__error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    font-size: 14px;
  }
  
  /* 占位符 */
  .no-image-placeholder,
  .image-error-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    gap: 12px;
    
    p {
      font-size: 14px;
      margin: 0;
    }
  }
  
  .no-image-placeholder {
    height: 400px;
    background: #0a0a0a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    
    i {
      color: #444;
    }
  }
  
  /* Lightbox 全屏查看 */
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.96);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(8px);
  }
  
  .lightbox-content {
    position: relative;
    max-width: 95vw;
    max-height: 95vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .lightbox-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
  
  .lightbox-close {
    position: absolute;
    top: -50px;
    right: 0;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: rgba(255, 59, 48, 0.9);
      border-color: #ff3b30;
      transform: scale(1.1);
    }
  }
  
  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    
    &:hover {
      background: rgba(59, 130, 246, 0.9);
      border-color: #3b82f6;
      transform: translateY(-50%) scale(1.15);
    }
    
    &--prev {
      left: -70px;
    }
    
    &--next {
      right: -70px;
    }
    
    @media (max-width: 1024px) {
      &--prev {
        left: 10px;
      }
      
      &--next {
        right: 10px;
      }
    }
  }
  
  .lightbox-counter {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 24px;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .embla-main__slide {
      height: 300px;
    }
    
    .embla-thumbs__slide {
      flex: 0 0 60px;
      height: 45px;
    }
    
    .embla-main__button {
      width: 36px;
      height: 36px;
      font-size: 16px;
      
      &--prev {
        left: 8px;
      }
      
      &--next {
        right: 8px;
      }
    }
    
    .lightbox {
      padding: 20px;
    }
    
    .lightbox-close {
      top: 10px;
      right: 10px;
    }
    
    .lightbox-counter {
      bottom: 10px;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
