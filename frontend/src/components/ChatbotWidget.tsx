'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, ChevronLeft, HelpCircle } from 'lucide-react';

interface Props {
  isAdminPanel?: boolean;
}

const qaData = {
  categories: [
    { id: 'gst', name: 'GST Services', icon: '📝' },
    { id: 'income_tax', name: 'Income Tax', icon: '💰' },
    { id: 'business', name: 'Business Setup', icon: '🏢' },
    { id: 'compliance', name: 'Compliance', icon: '📅' },
  ],
  questions: {
    gst: [
      { q: 'What are GST filing deadlines?', a: 'GSTR-1 is due on the 11th and GSTR-3B on the 20th of every month. Quarterly filers have different dates.' },
      { q: 'How to register for GST?', a: 'You need PAN, Aadhaar, and business address proof. We can handle the entire registration for ₹2,999.' },
      { q: 'What is GST ITC?', a: 'Input Tax Credit (ITC) allows you to reduce the tax you have already paid on inputs while paying tax on output.' },
    ],
    income_tax: [
      { q: 'What is the ITR filing deadline?', a: 'For individuals, the deadline is usually 31st July of the assessment year.' },
      { q: 'How to save income tax?', a: 'You can use deductions under Section 80C (up to 1.5L), 80D (health insurance), and others.' },
      { q: 'New vs Old Tax Regime?', a: 'New regime has lower rates but no deductions. Old regime has higher rates but allowed deductions like 80C.' },
    ],
    business: [
      { q: 'How to register a Pvt Ltd?', a: 'Requires min 2 directors, DIN, DSC, and ROC filing. Takes about 7-10 working days.' },
      { q: 'What is MSME registration?', a: 'UDYAM registration provides benefits like lower interest rates and priority in govt tenders.' },
      { q: 'Trademark registration time?', a: 'Initial application takes 2 weeks, but final registration can take 12-18 months.' },
    ],
    compliance: [
      { q: 'Annual ROC compliance?', a: 'Companies must file AOC-4 and MGT-7 every year after their AGM.' },
      { q: 'TDS filing frequency?', a: 'TDS returns (24Q, 26Q) must be filed quarterly by the end of the following month.' },
      { q: 'ESIC/EPF registration?', a: 'Mandatory for businesses with more than 10 (ESIC) or 20 (EPF) employees.' },
    ],
  }
};

export default function ChatbotWidget({ isAdminPanel = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'categories' | 'questions' | 'answer'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQA, setSelectedQA] = useState<{ q: string, a: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentView]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setCurrentView('questions');
  };

  const handleQASelect = (qa: { q: string, a: string }) => {
    setSelectedQA(qa);
    setCurrentView('answer');
  };

  const handleBack = () => {
    if (currentView === 'answer') setCurrentView('questions');
    else if (currentView === 'questions') setCurrentView('categories');
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed z-40 flex items-center justify-center text-white transition transform shadow-lg hover:shadow-xl hover:scale-110 bg-blue-600 hover:bg-blue-700 ${
            isAdminPanel 
              ? 'w-10 h-10 right-6 bottom-6 rounded-lg' 
              : 'w-12 h-12 right-6 bottom-6 rounded-full'
          }`}
          title="Tax Help Assistant"
        >
          <HelpCircle size={isAdminPanel ? 20 : 24} />
        </button>
      )}

      {/* Q&A Window */}
      {isOpen && (
        <div className="fixed w-[92vw] max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 right-4 md:right-6 bottom-24 border border-gray-200 h-[600px] max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white bg-blue-600">
            <div className="flex items-center gap-2">
              {currentView !== 'categories' && (
                <button onClick={handleBack} className="p-1 hover:bg-white/20 rounded-full transition">
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="font-bold">Tax Help Assistant</h3>
            </div>
            <button
              onClick={() => { setIsOpen(false); setCurrentView('categories'); }}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-[300px]">
            
            {/* 1. Category Selection */}
            {currentView === 'categories' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Select a topic</p>
                <div className="grid grid-cols-1 gap-2">
                  {qaData.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="flex items-center gap-3 w-full p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-left group"
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-medium text-gray-700 group-hover:text-blue-700">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Question Selection */}
            {currentView === 'questions' && selectedCategory && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {qaData.categories.find(c => c.id === selectedCategory)?.name} Questions
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {qaData.questions[selectedCategory as keyof typeof qaData.questions].map((qa, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQASelect(qa)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-left text-sm text-gray-700 font-medium"
                    >
                      {qa.q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Answer View */}
            {currentView === 'answer' && selectedQA && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                  <p className="text-xs font-bold text-blue-600 mb-1">Question:</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedQA.q}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Answer:</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedQA.a}
                  </p>
                </div>
                <button
                  onClick={handleBack}
                  className="w-full py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200"
                >
                  Ask another question
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-100 border-t border-gray-200 text-center">
            <p className="text-[10px] text-gray-500">
              Need more help? <a href="/contact" className="text-blue-600 font-bold hover:underline">Contact our experts</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
