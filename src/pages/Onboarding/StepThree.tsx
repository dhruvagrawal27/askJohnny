import React from 'react';
import { Store, ArrowLeft, Sparkles, Brain } from 'lucide-react';
import { StepProps, categories } from './types';
import { StepHeader } from './SharedComponents';

const StepThree: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const selectedCat = categories.find(c => c.id === state.category);
  const answeredCount = Object.keys(state.answers).filter(key => state.answers[key]?.trim()).length;

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-brand-50/30 flex flex-col">
      <div className="px-4 lg:px-6 py-3">
        <StepHeader 
          step="06" 
          title="Setup AI Knowledge" 
          subtitle={selectedCat ? "Answer a few questions to help the AI sound like you." : "Select your industry to load relevant AI behaviors."}
          onBack={handleBack}
          showBack={true}
        />
      </div>

      {/* Two Column Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 px-4 lg:px-6 pb-4 min-h-0 overflow-hidden">
        {/* Left Column - Categories */}
        <div className="flex-1 lg:w-[45%] flex flex-col min-h-0 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center gap-2">
              <Store size={20} className="text-brand-600" />
              <h3 className="font-bold text-gray-900">Select Your Industry</h3>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isSelected = state.category === cat.id;
                const Icon = cat.icon || Store;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => setState({...state, category: cat.id})}
                    className={`p-4 rounded-xl border-2 cursor-pointer group flex flex-col gap-3 transition-all duration-300 ${
                      isSelected 
                        ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-purple-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md' 
                        : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100'
                    }`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 mb-1">{cat.label}</h3>
                      <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Questions or Empty State */}
        <div className="flex-1 lg:w-[55%] flex flex-col min-h-0">
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            {!selectedCat ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Industry</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Select the industry that best matches your business from the left. This helps Johnny understand your specific needs and communicate better with your customers.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-brand-50 to-white">
                  <div className="flex items-center gap-2">
                    <Brain size={20} className="text-brand-600" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{selectedCat.label} Questions</h3>
                      <p className="text-[10px] text-gray-500">{answeredCount} / {selectedCat.questions.length} answered</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Questions */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedCat.questions.map((q, idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                          {q}
                        </label>
                        <textarea 
                          value={state.answers[idx] || ''}
                          onChange={(e) => setState({
                            ...state, 
                            answers: {...state.answers, [idx]: e.target.value}
                          })}
                          placeholder="Type your answer here..."
                          className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 focus:bg-white outline-none transition-all text-xs min-h-[70px] resize-none placeholder:text-gray-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <button 
                    onClick={handleNext}
                    className="w-full btn-primary-custom py-2.5 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Continue to Signup <ArrowLeft size={14} className="rotate-180" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
