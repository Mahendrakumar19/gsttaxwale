'use client';

import React, { useState, useEffect } from 'react';
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

// Default showcase images - using reliable placeholder service
const DEFAULT_IMAGES = [
  {
    src: 'https://placehold.co/600x400/1e293b/white?text=Tax+Services',
    alt: 'Professional tax services',
  },
  {
    src: 'https://placehold.co/600x400/1e293b/white?text=Compliance',
    alt: 'Compliance management',
  },
  {
    src: 'https://placehold.co/600x400/1e293b/white?text=Business+Growth',
    alt: 'Business growth solutions',
  },
  {
    src: 'https://placehold.co/600x400/1e293b/white?text=Financial+Planning',
    alt: 'Financial planning',
  },
  {
    src: 'https://placehold.co/600x400/1e293b/white?text=Expert+Consultation',
    alt: 'Expert consultation',
  },
];

export default function ImageSlider({ 
  images = DEFAULT_IMAGES, 
  autoPlay = true, 
  interval = 4000 
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  return (
    <div 
      className="relative w-full mx-auto overflow-hidden rounded-xl shadow-lg"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(autoPlay)}
    >
      {/* Image Container */}
      <div className="relative w-full h-96 bg-gray-200">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ position: 'absolute' }}
          >
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

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all shadow-md hover:shadow-lg"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all shadow-md hover:shadow-lg"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex gap-2 -translate-x-1/2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 w-2 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
