import React, { useState, useEffect, useCallback } from 'react';
import { 
  Factory, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  MapPin,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface IndustrialPlantSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  location: string;
  division: string;
  imageUrl: string;
  metrics: string;
  highlightMaterials?: string[];
}

const DEFAULT_INDUSTRIAL_SLIDES: IndustrialPlantSlide[] = [
  {
    id: 'slide-1',
    title: 'Rezwan Industrial Zone & Silo Network — Mega Silo Complex & Flour Milling Plant',
    subtitle: 'High-capacity vertical grain silos & automated Swiss Bühler flour milling lines processing 120+ MT/day wheat',
    tag: 'Grain Silos & Flour Mill',
    location: 'Godagari & Paba Industrial Belt, Rajshahi',
    division: 'Rezwan Industrial Zone & Silo Network (Flour Division)',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&auto=format&fit=crop&q=80',
    metrics: 'Capacity: 45,000 MT Silo Storage • Run-Rate: 120 MT/day',
    highlightMaterials: ['Russian Grade-1 Wheat', 'Milling Atta/Maida', 'Bran Byproducts']
  },
  {
    id: 'slide-2',
    title: 'Chattogram Port Terminal — Marine Bulk Grain & Edible Oil Shore Tanks',
    subtitle: 'Direct vessel discharge berths, pneumatic ship unloaders & bulk crude degummed soybean oil (CDSO) tank farms',
    tag: 'Marine Port Hub & Tankers',
    location: 'Outer Anchorage & Patenga Silo Jetty, Chattogram Port',
    division: 'Rezwan Industrial Zone & Silo Network (Port Terminal)',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&auto=format&fit=crop&q=80',
    metrics: 'Jetty Draft: 9.5m • Tank Farm: 30,000 MT Liquid Bulk',
    highlightMaterials: ['Crude Soybean Oil (CDSO)', 'Crude Palm Oil (CPO)', 'Yellow Maize Bulk']
  },
  {
    id: 'slide-3',
    title: 'Rezwan Industrial Zone & Silo Network — Feed Mills & Pelleting Plant',
    subtitle: 'Continuous batch mixers, pelleting units & amino acid dosage systems running 95+ MT/day feed compounding',
    tag: 'Feed Mill & Pelleting Unit',
    location: 'Ishwardi Agro-Industrial Park & Bogura',
    division: 'Rezwan Industrial Zone & Silo Network (Feed Division)',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    metrics: 'Output: 300 MT/day Pelleted Feed • 100% Quality Tested',
    highlightMaterials: ['Soybean Meal 48%', 'Yellow Feed Maize', 'Marine Fish Meal 62%']
  },
  {
    id: 'slide-4',
    title: 'Rezwan Industrial Zone & Silo Network — Auto Rice Mills & Silo Dryers',
    subtitle: 'Automated paddy intake, husk-fired boiler dryers, Japanese Satake optical color sorting & automatic 50kg bagging',
    tag: 'Auto Rice Processing Complex',
    location: 'Dinajpur & Rajshahi Northern Agro Hub',
    division: 'Rezwan Industrial Zone & Silo Network (Rice Division)',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&auto=format&fit=crop&q=80',
    metrics: 'Parboiling: 500 MT/day • Northern Paddy Sourcing Network',
    highlightMaterials: ['Miniket Paddy Grains', 'Katari Shorna', 'Aromatic Chinigura']
  },
  {
    id: 'slide-5',
    title: 'Rezwan Industrial Zone & Silo Network — Edible Oil Refineries',
    subtitle: 'Continuous physical and chemical edible oil refining producing crystal clear fortified soybean oil & palm olein',
    tag: 'Continuous Oil Refinery',
    location: 'Industrial Zone, Chattogram',
    division: 'Rezwan Industrial Zone & Silo Network (Oil Refinery)',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1200&auto=format&fit=crop&q=80',
    metrics: 'Refinery Rate: 200 MT/day • Bleaching Earth Dosage Control',
    highlightMaterials: ['Activated Bleaching Earth', 'Caustic Soda Flakes', 'Refined Soybean Oil']
  }
];

interface ShopGallerySliderProps {
  onNavigateToCatalog?: () => void;
}

export const ShopGallerySlider: React.FC<ShopGallerySliderProps> = ({
  onNavigateToCatalog
}) => {
  const [slides] = useState<IndustrialPlantSlide[]>(DEFAULT_INDUSTRIAL_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Auto slide timer
  useEffect(() => {
    if (!isPlaying || isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, nextSlide]);

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-md transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Smooth Crossfade */}
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: '1000ms'
            }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="h-full w-full object-cover brightness-[0.65] contrast-[1.1]"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            {/* Industrial Dark Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
          </div>
        ))}

        {/* Top Header Bar inside Slide */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
              <Factory className="h-3.5 w-3.5" />
              <span>রেজওয়ান ইন্ডাস্ট্রিয়াল জোন ও সাইলো নেটওয়ার্ক</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/15 px-2 py-1 text-[11px] text-slate-200">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{currentSlide.location}</span>
            </span>
          </div>

          {/* Autoplay & Slider Controls */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 p-1 text-white">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause auto-slide" : "Play auto-slide"}
              className="p-1.5 rounded-lg hover:bg-white/20 text-slate-200 transition-colors"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
            <div className="h-3.5 w-[1px] bg-white/20" />
            <button
              onClick={prevSlide}
              title="Previous plant photo"
              className="p-1.5 rounded-lg hover:bg-white/20 text-slate-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-1.5 text-[11px] font-mono font-bold text-slate-300">
              {currentIndex + 1}/{slides.length}
            </span>
            <button
              onClick={nextSlide}
              title="Next plant photo"
              className="p-1.5 rounded-lg hover:bg-white/20 text-slate-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Details Content Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {currentSlide.tag}
              </span>
              <span className="text-[11px] font-medium text-slate-300">
                {currentSlide.division}
              </span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white drop-shadow-sm">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
              {currentSlide.subtitle}
            </p>

            {/* Silo Materials & Operational Metric */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                ⚡ {currentSlide.metrics}
              </span>
              {currentSlide.highlightMaterials && (
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-emerald-400" /> Key Feedstock:
                  </span>
                  {currentSlide.highlightMaterials.map((mat, i) => (
                    <span 
                      key={i}
                      className="rounded bg-white/15 backdrop-blur-xs border border-white/20 px-2 py-0.5 text-[10px] font-medium text-white shadow-2xs"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Raw Materials Catalog Button */}
          {onNavigateToCatalog && (
            <div className="shrink-0">
              <button
                onClick={onNavigateToCatalog}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 text-xs shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
              >
                <span>Silo Raw Materials</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Slide Progress Indicators */}
        <div className="absolute bottom-1 left-0 right-0 z-30 flex justify-center gap-1.5 px-4 pb-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-emerald-400 shadow-xs'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
