"use client";

import { useRef, useEffect, useState } from "react";

interface FigureEmbedProps {
  type: "iframe" | "img";
  src: string;
  alt: string;
  /** Intrinsic pixel size — lets the browser reserve aspect-ratio space (no CLS). */
  width?: number;
  height?: number;
}

const IFRAME_NATIVE_WIDTH = 1100;

export function FigureEmbed({ type, src, alt, width, height }: FigureEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [iframeHeight, setIframeHeight] = useState(500);

  // Lazy load via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculate scale and auto-detect iframe content height
  useEffect(() => {
    if (type !== "iframe" || !isVisible) return;

    const updateScale = () => {
      const el = containerRef.current;
      if (!el) return;
      const containerWidth = el.clientWidth;
      setScale(Math.min(1, containerWidth / IFRAME_NATIVE_WIDTH));
    };

    const detectHeight = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentDocument?.body) {
          const h = iframe.contentDocument.body.scrollHeight;
          if (h > 50) setIframeHeight(h + 10);
        }
      } catch {
        // cross-origin, keep default
      }
    };

    updateScale();
    // Try to detect height after iframe loads
    const timer = setTimeout(detectHeight, 500);
    const timer2 = setTimeout(detectHeight, 1500);

    window.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [type, isVisible]);

  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument?.body) {
        const h = iframe.contentDocument.body.scrollHeight;
        if (h > 50) setIframeHeight(h + 10);
      }
    } catch {
      // cross-origin, keep default
    }
  };

  return (
    <figure ref={containerRef} className="my-4">
      {type === "iframe" ? (
        isVisible ? (
          <div
            className="overflow-hidden rounded-lg"
            style={{ height: `${iframeHeight * scale}px` }}
          >
            <iframe
              ref={iframeRef}
              src={src}
              scrolling="no"
              loading="lazy"
              onLoad={handleIframeLoad}
              className="border-0 bg-white origin-top-left"
              style={{
                width: `${IFRAME_NATIVE_WIDTH}px`,
                height: `${iframeHeight}px`,
                transform: `scale(${scale})`,
              }}
              title={alt}
            />
          </div>
        ) : (
          <div
            className="w-full rounded-lg bg-gray-50 animate-pulse flex items-center justify-center text-gray-400 text-sm"
            style={{ height: "200px" }}
          >
            Loading figure...
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          className="max-w-full h-auto rounded-lg"
        />
      )}
    </figure>
  );
}
