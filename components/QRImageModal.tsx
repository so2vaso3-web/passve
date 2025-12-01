"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { X, Download, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface QRImageModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  ticketTitle?: string;
}

export function QRImageModal({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  ticketTitle,
}: QRImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Tất cả hooks phải được gọi ở top level, không được conditional
  const currentImage = useMemo(() => {
    if (!images || images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
      return "";
    }
    return images[currentIndex];
  }, [images, currentIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? (images?.length || 1) - 1 : prev - 1));
  }, [images?.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === (images?.length || 1) - 1 ? 0 : prev + 1));
  }, [images?.length]);

  const handleDownload = useCallback(async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${ticketTitle ? ticketTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase() : "ticket"}-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }, [ticketTitle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  }, [onClose, handlePrevious, handleNext]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Disable pointer events on body to prevent hover effects from elements below
      document.body.style.pointerEvents = "none";
      // Ẩn tất cả các card vé TRỪ card vé đang mở modal
      const ticketCards = document.querySelectorAll('[data-ticket-card]');
      ticketCards.forEach((card) => {
        // Chỉ ẩn các card không có attribute data-qr-modal-open (card khác)
        if (!(card as HTMLElement).hasAttribute("data-qr-modal-open")) {
          (card as HTMLElement).style.opacity = "0.3";
          (card as HTMLElement).style.pointerEvents = "none";
        }
      });
      // Use setTimeout to ensure modal is rendered
      setTimeout(() => {
        const modal = document.querySelector('[data-qr-modal]');
        if (modal) {
          (modal as HTMLElement).style.pointerEvents = "auto";
        }
      }, 0);
    } else {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
      // Hiện lại tất cả các card vé
      const ticketCards = document.querySelectorAll('[data-ticket-card]');
      ticketCards.forEach((card) => {
        (card as HTMLElement).style.opacity = "";
        (card as HTMLElement).style.pointerEvents = "";
      });
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
      // Đảm bảo hiện lại card vé khi unmount
      const ticketCards = document.querySelectorAll('[data-ticket-card]');
      ticketCards.forEach((card) => {
        (card as HTMLElement).style.opacity = "";
        (card as HTMLElement).style.pointerEvents = "";
      });
    };
  }, [isOpen]);

  // Early return sau khi tất cả hooks đã được gọi
  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div
      data-qr-modal
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{ 
        pointerEvents: 'auto',
        isolation: 'isolate',
        contain: 'layout style paint', // Prevent layout shifts
      }}
      tabIndex={-1}
    >
      <div
        className="relative w-full min-h-full flex flex-col items-center justify-center p-4 md:p-8 py-16 md:py-8"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          pointerEvents: 'auto',
          contain: 'layout style paint', // Isolate rendering
        }}
      >
        {/* Header - Sticky trên mobile */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 py-3 md:py-4 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-white truncate">
              Ảnh mã QR {images.length > 1 && `(${currentIndex + 1}/${images.length})`}
            </h2>
            {ticketTitle && (
              <span className="text-xs md:text-sm text-gray-400 hidden md:block truncate">
                {ticketTitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(currentImage, currentIndex);
              }}
              className="p-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg transition-colors"
              title="Tải về ảnh"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="relative w-full flex items-center justify-center bg-dark-card rounded-xl overflow-hidden border border-dark-border"
          style={{
            contain: 'layout style paint',
            minHeight: '50vh',
            maxHeight: 'calc(100vh - 200px)',
          }}
        >
          <div 
            className="relative w-full flex items-center justify-center"
            style={{ 
              contain: 'layout style paint',
              willChange: 'auto',
              aspectRatio: 'auto',
            }}
          >
            <Image
              src={currentImage}
              alt={`QR Code ${currentIndex + 1}`}
              width={1200}
              height={1200}
              className="object-contain p-4 w-full h-auto max-h-[calc(100vh-200px)]"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              style={{ 
                willChange: 'auto',
                transform: 'translateZ(0)', // Force GPU acceleration
                pointerEvents: 'none', // Prevent image from capturing mouse events
              }}
              draggable={false}
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200 backdrop-blur-sm z-20"
                title="Ảnh trước (←)"
                style={{ 
                  pointerEvents: 'auto',
                  willChange: 'background-color', // Optimize hover
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200 backdrop-blur-sm z-20"
                title="Ảnh sau (→)"
                style={{ 
                  pointerEvents: 'auto',
                  willChange: 'background-color', // Optimize hover
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2 -mx-4 md:-mx-8 px-4 md:px-8">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-[border-color,opacity,box-shadow] duration-200 flex-shrink-0 ${
                  index === currentIndex
                    ? "border-neon-green shadow-neon-sm ring-2 ring-neon-green/50"
                    : "border-dark-border hover:border-gray-600 opacity-70 hover:opacity-100"
                }`}
                title={`Xem ảnh ${index + 1}`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Download All Button */}
        {images.length > 1 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                images.forEach((img, index) => {
                  setTimeout(() => handleDownload(img, index), index * 200);
                });
              }}
              className="px-4 py-2 bg-neon-green hover:bg-neon-green-light text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải về tất cả ({images.length} ảnh)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

