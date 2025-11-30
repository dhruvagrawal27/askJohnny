import React from 'react';
import { Store, ArrowLeft } from 'lucide-react';
import { StepProps, categories } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

const StepThree: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const selectedCat = categories.find(c => c.id === state.category);

  return (
    <ContentContainer>
      <StepHeader 
        step="06" 
        title="Setup AI Knowledge" 
        subtitle={selectedCat ? "Answer a few questions to help the AI sound like you." : "Select your industry to load relevant AI behaviors."}
        onBack={handleBack}
        showBack={true}
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {!selectedCat ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {categories.map((cat) => {
              return (
                <div 
                  key={cat.id}
                  onClick={() => setState({...state, category: cat.id})}
                  className="relative p-4 rounded-xl border border-gray-100 hover:border-brand-200 cursor-pointer bg-white group flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-brand-900/5 hover:-translate-y-0.5 h-full"
                >
                  <div className={`w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300`}>
                    <Store size={20} strokeWidth={1.5} />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-xs font-bold text-gray-900 mb-0.5">{cat.label}</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{cat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl w-full animate-fade-in-up mx-auto">
            <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedCat.label}</h3>
                <p className="text-[10px] text-gray-500">Configuration Mode</p>
              </div>
              <button 
                onClick={() => setState({...state, category: null})}
                className="ml-auto text-[10px] font-bold text-brand-600 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                Change Industry
              </button>
            </div>

            <div className="space-y-5 pb-6">
              {selectedCat.questions.map((q, idx) => (
                <div key={idx} className="bg-white group">
                  <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px]">{idx + 1}</div>
                    {q}
                  </label>
                  <div className="relative">
                    <textarea 
                      value={state.answers[idx] || ''}
                      onChange={(e) => setState({
                        ...state, 
                        answers: {...state.answers, [idx]: e.target.value}
                      })}
                      placeholder="e.g. We specialize in..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm min-h-[80px] resize-none shadow-inner placeholder:text-gray-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-start pt-2">
              <button 
                onClick={handleNext}
                className="btn-primary-custom px-6 py-3 font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 rounded-xl"
              >
                Continue to Signup <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
};

export default StepThree;
