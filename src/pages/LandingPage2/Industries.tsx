import React from 'react';
import { Scale, Home, Utensils, HardHat, Car, Wrench, Hotel, Scissors } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const Industries: React.FC = () => {
  const industries = [
    { icon: Scale, label: 'Legal' },
    { icon: Home, label: 'Real Estate' },
    { icon: Utensils, label: 'Restaurant' },
    { icon: HardHat, label: 'Construction' },
    { icon: Car, label: 'Automotive' },
    { icon: Wrench, label: 'Services' },
    { icon: Hotel, label: 'Hospitality' },
    { icon: Scissors, label: 'Beauty' },
  ];

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
      {/* Global SVG Defs for Gradients based on user input */}
      <svg width="0" height="0" className="absolute w-0 h-0 block">
        <defs>
          <linearGradient id="paint0_linear_11_192" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5F488D"/>
            <stop offset="97.11%" stopColor="#362951"/>
          </linearGradient>
          <linearGradient id="paint0_linear_11_194" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#918799"/>
            <stop offset="100%" stopColor="#524C56"/>
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-6xl mx-auto text-center">
        <RevealOnScroll>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 md:mb-12">
            Made for businesses where<br/>
            Every call <span className="text-brand-600">Matters</span>
          </h2>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {industries.map((item, index) => {
            // Alternate styles logic
            const isStyle1 = index % 2 === 0;
            const cardClass = isStyle1 ? 'industry-card-1' : 'industry-card-2';
            const iconStroke = isStyle1 ? 'url(#paint0_linear_11_192)' : 'url(#paint0_linear_11_194)';
            
            return (
              <RevealOnScroll key={index} delay={index * 50}>
                <div 
                  className={`aspect-square rounded-[1.5rem] md:rounded-[2rem] flex flex-col gap-4 items-center justify-center hover:scale-105 transition-transform duration-300 cursor-default group ${cardClass}`}
                >
                  <div className="p-2 md:p-4">
                      <item.icon 
                      className="w-14 h-14 md:w-20 md:h-20 transition-colors" 
                      strokeWidth={1.5}
                      stroke={iconStroke}
                      />
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;