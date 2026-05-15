'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageData {
  src: string;
  alt: string;
}

interface ImageSliderProps {
  images?: ImageData[];
  autoPlay?: boolean;
  interval?: number;
  showCounter?: boolean;
}

const DEFAULT_IMAGES: ImageData[] = [
  {
    src: '/hero_tax_consultation.png',
    alt: 'Professional tax services',
  },
  {
    src: '/hero_gst_compliance.png',
    alt: 'GST Compliance management',
  },
  {
    src: '/hero_financial_growth.png',
    alt: 'Business growth solutions',
  },
];

export default function ImageSlider({ 
  autoPlay = true, 
  interval = 5000,
  showCounter = true
}: ImageSliderProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/sliders`);
        const data = await res.json();
        if (data.success && data.data.sliders?.length > 0) {
          const activeSliders = data.data.sliders
            .filter((s: any) => s.isActive)
            .map((s: any) => ({
              src: s.imageUrl,
              alt: s.alt || 'GST Tax Wale Banner'
            }));
          setImages(activeSliders.length > 0 ? activeSliders : DEFAULT_IMAGES);
        } else {
          setImages(DEFAULT_IMAGES);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic sliders, using defaults');
        setImages(DEFAULT_IMAGES);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, interval, goToNext]);

  if (loading || images.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto h-[300px] md:h-[400px] lg:h-[450px] bg-slate-900 animate-pulse rounded-[2.5rem] flex items-center justify-center">
        <div className="text-white/20 font-black tracking-widest text-2xl">LOADING BANNERS...</div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-[1400px] mx-auto overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white/10 group"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(autoPlay)}
    >
      {/* Image Container */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] bg-slate-900">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image */}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <button
          onClick={goToPrevious}
          className="pointer-events-auto w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all shadow-2xl"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={goToNext}
          className="pointer-events-auto w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all shadow-2xl"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Slide Counter Overlay */}
      {showCounter && images.length > 0 && (
        <div className="absolute top-8 right-8 px-4 py-2 bg-black/30 backdrop-blur-xl border border-white/10 text-white rounded-2xl text-xs font-black tracking-widest">
          {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
