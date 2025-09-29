import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ImageZoomProps {
  images: string[];
  activeIndex: number;
  onImageChange: (index: number) => void;
  alt: string;
}

export function ImageZoom({ images, activeIndex, onImageChange, alt }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleZoom();
  };

  const currentImage = images[activeIndex];

  // Derive .avif and .webp variants from an existing image URL.
  // If the URL is a data: URI or doesn't look like it has an extension, return the original for variants.
  const makeVariants = (url: string) => {
    try {
      if (!url || url.startsWith('data:')) return { avif: url, webp: url, orig: url };

      const qIdx = url.indexOf('?');
      const base = qIdx === -1 ? url : url.slice(0, qIdx);
      const query = qIdx === -1 ? '' : url.slice(qIdx);

      const lastDot = base.lastIndexOf('.');
      if (lastDot === -1) return { avif: url + '.avif', webp: url + '.webp', orig: url };

      const prefix = base.slice(0, lastDot);
      // Keep any query params intact when adding extensions
      const avif = `${prefix}.avif${query}`;
      const webp = `${prefix}.webp${query}`;
      return { avif, webp, orig: url };
    } catch {
      return { avif: url, webp: url, orig: url };
    }
  };

  return (
    <div className="relative">
      {/* Main Image Display (adaptive aspect) */}
      <div
        className="relative overflow-hidden rounded-2xl bg-theme-bg-secondary border border-theme-border shadow-theme-xl flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <div className="w-full">
          {/* Prefer modern formats: AVIF -> WebP -> original. Thumbnails remain unchanged per requirements. */}
          {currentImage ? (
            (() => {
              const v = makeVariants(currentImage);
              return (
                <picture>
                  <source srcSet={v.avif} type="image/avif" />
                  <source srcSet={v.webp} type="image/webp" />
                  <img
                    src={v.orig}
                    alt={`${alt} - ${activeIndex + 1}`}
                    // For portrait images prefer contain and cap max-height; otherwise use cover for expansive look
                    className={`transition-transform duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${
                      isPortrait ? 'object-contain max-h-[640px]' : 'w-full object-cover max-h-[520px]'
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            transform: isPortrait ? 'scale(1.8)' : 'scale(2)'
                          }
                        : {}
                    }
                    onClick={toggleZoom}
                    onLoad={(e) => {
                      try {
                        const imgEl = e.currentTarget as HTMLImageElement;
                        if (imgEl.naturalWidth && imgEl.naturalHeight) {
                          setIsPortrait(imgEl.naturalHeight > imgEl.naturalWidth);
                        }
                      } catch {
                        setIsPortrait(null);
                      }
                    }}
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzE0NC43NzIgMTAwIDEwMCAxNDQuNzcyIDEwMCAyMDBTMTQ0Ljc3MiAzMDAgMjAwIDMwMFMyODUuMjI4IDI1NS4yMjggMjg1LjIyOCAyMDBTMjU1LjIyOCAxMDAgMjAwIDEwMFpNMjAwIDI1NUMxNzMuNDkgMjU1IDE1MiAyMzMuNTEgMTUyIDIwN1MxNzMuNDkgMTU1IDIwMCAxNTVTMjQ4IDE3My40OSAyNDggMjAwUzIyNi41MSAyNTUgMjAwIDI1NVoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                    }}
                  />
                </picture>
              );
            })()
          ) : (
            <div className="w-full rounded-2xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center py-16">
              <p className="text-zinc-500 dark:text-zinc-400">No image</p>
            </div>
          )}
        </div>

        {/* Zoom Indicator */}
        <button
          onClick={handleZoomClick}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
        >
          {isZoomed ? (
            <ZoomOut className="w-4 h-4" />
          ) : (
            <ZoomIn className="w-4 h-4" />
          )}
        </button>

        {/* Image Navigation Arrows (for multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const prevIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
                onImageChange(prevIndex);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 transform hover:-translate-x-1"
            >
              <span className="text-lg">←</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
                onImageChange(nextIndex);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 transform hover:translate-x-1"
            >
              <span className="text-lg">→</span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex space-x-3 justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageChange(index)}
              className={`border rounded-xl p-1 transition-all duration-300 hover:shadow-lg ${
                index === activeIndex
                  ? 'ring-2 ring-theme-accent border-theme-accent shadow-theme-lg'
                  : 'border-theme-border hover:border-theme-border-hover'
              }`}
            >
              {(() => {
                const v = makeVariants(image);
                return (
                  <picture>
                    <source srcSet={v.avif} type="image/avif" />
                    <source srcSet={v.webp} type="image/webp" />
                    <img
                      src={v.orig}
                      alt={`${alt} thumb ${index + 1}`}
                      className="w-16 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback for broken thumbnails
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAxNkMyMy4xNiAxNiAxNiAyMy4xNiAxNiAzMlMyMy4xNiA0OCAzMiA0OFM0OCA0MC44NCA0OCAzMlM0MC44NCAxNiAzMiAxNlpNMzIgNDBDMjcuNTggNDAgMjQgMzYuNDIgMjQgMzJTMjcuNTggMjQgMzIgMjRTNDAgMjcuNTggNDAgMzJTMzYuNDIgNDAgMzIgNDBaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPg==';
                      }}
                    />
                  </picture>
                );
              })()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}