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
  images = DEFAULT_IMAGES, 
  autoPlay = true, 
  interval = 5000 
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setProgress(0);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    setIsAutoPlay(false);
  };

  // Progress Bar & Auto-play
  useEffect(() => {
    if (!isAutoPlay) return;

    const step = 100; // ms
    const increment = (step / interval) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(timer);
  }, [isAutoPlay, interval, goToNext]);

  return (
    <div 
      className="relative w-full max-w-[1400px] mx-auto overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white/10 group"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(autoPlay)}
    >
      {/* Image Container */}
      <div className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] bg-slate-900">
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

      {/* Progress & Indicators Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 w-full px-8">
        <div className="flex gap-4 items-center">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group py-2"
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'bg-blue-600 w-12' 
                  : 'bg-white/30 w-6 group-hover:bg-white/50'
              }`} />
            </button>
          ))}
        </div>
        
        {/* Progress bar line */}
        <div className="w-full max-w-md h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slide Counter Overlay */}
      <div className="absolute top-8 right-8 px-4 py-2 bg-black/30 backdrop-blur-xl border border-white/10 text-white rounded-2xl text-xs font-black tracking-widest">
        {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>
    </div>
  );
}
