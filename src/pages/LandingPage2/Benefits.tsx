import React from 'react';
import RevealOnScroll from './RevealOnScroll';

const Benefits: React.FC = () => {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white mb-8 md:mb-12">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-10 md:mb-12 max-w-2xl">
            Four ways we make your <br/>
            Business <span className="text-brand-600">Better</span>
          </h2>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
          
          {/* Card 1: Large Left - Primary Gradient */}
          <div className="md:col-span-1 md:row-span-2 h-[300px] md:h-auto">
            <RevealOnScroll className="h-full">
              <div className="overflow-hidden relative group benefit-card-primary h-full">
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="relative z-10">
                      <h3 className="text-white text-xl md:text-2xl font-bold mb-3">Always there to answer your calls</h3>
                      <p className="text-white/90 text-xs md:text-sm leading-relaxed">
                        Calls are answered promptly and professionally even when you're busy
                      </p>
                  </div>
                  {/* Abstract decorative circle */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Column Grid */}
          <div className="md:col-span-2 md:row-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 2: Wide Top Right - Secondary Gradient */}
            <div className="md:col-span-2 h-[250px] md:h-auto">
              <RevealOnScroll delay={100} className="h-full">
                <div className="benefit-card-secondary p-6 md:p-8 flex flex-col justify-center relative overflow-hidden h-full">
                  <div className="relative z-10 max-w-md">
                    <h3 className="text-gray-900 text-xl md:text-2xl font-bold mb-3">Takes meaningful actions</h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Schedules appointments, provides information, and delivers clean summaries to your inbox
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Card 3: Bottom Left of Right Col - Secondary Gradient */}
            <div className="h-[250px] md:h-auto">
              <RevealOnScroll delay={200} className="h-full">
                <div className="benefit-card-secondary p-6 md:p-8 flex flex-col justify-end h-full">
                  <div className="relative z-10">
                    <h3 className="text-gray-900 text-lg md:text-xl font-bold mb-3">Intelligent listening</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Smart voice AI that knows what callers want and responds naturally
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Card 4: Bottom Right of Right Col - Secondary Gradient */}
            <div className="h-[250px] md:h-auto">
              <RevealOnScroll delay={300} className="h-full">
                <div className="benefit-card-secondary p-6 md:p-8 flex flex-col justify-end h-full">
                  <div className="relative z-10">
                    <h3 className="text-gray-900 text-lg md:text-xl font-bold mb-3">Handles high call volume</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Whether it's one or twenty, every caller gets immediate attention.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Benefits;