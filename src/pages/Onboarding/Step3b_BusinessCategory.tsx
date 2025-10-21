import { useMemo, useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'

type CategoryKey =
  | 'restaurants'
  | 'healthcare'
  | 'legal'
  | 'real_estate'
  | 'automotive'
  | 'fitness'
  | 'beauty'
  | 'insurance'
  | 'construction'
  | 'education'
  | 'non_profit'
  | 'others'

interface CategoryDef {
  id: CategoryKey
  label: string
  description: string
  icon: JSX.Element
  questions: string[]
}

const categories: CategoryDef[] = [
  {
    id: 'restaurants',
    label: 'Restaurants & Food Service',
    description: 'Dining, cafes, bars, and food services',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 3v6a1 1 0 001 1h3v10a1 1 0 102 0V3m7 0v6a1 1 0 001 1h1a1 1 0 001-1V3" />
      </svg>
    ),
    questions: [
      'Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?',
      'Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?',
      'What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?'
    ]
  },
  {
    id: 'healthcare',
    label: 'Healthcare & Medical Practices',
    description: 'Clinics, dental, urgent care, specialties',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6M5.5 21h13a2.5 2.5 0 002.5-2.5V8.5A2.5 2.5 0 0018.5 6h-13A2.5 2.5 0 003 8.5v10A2.5 2.5 0 005.5 21z" />
      </svg>
    ),
    questions: [
      'What type of practice (general, dental, specialty, urgent care) and primary services?',
      'Do you accept insurance, offer payment plans, and what are after-hours procedures?',
      'Do you need confirmations, prescription refills, or telehealth support?'
    ]
  },
  {
    id: 'legal',
    label: 'Legal & Law Firms',
    description: 'Client intake, scheduling, confidential calls',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    questions: [
      'What areas of law (injury, family, criminal, corporate)? Any emergency cases?',
      'Do you offer free consults, payment plans, or contingency fees?',
      'What is your intake process? Need document collection or case management support?'
    ]
  },
  {
    id: 'real_estate',
    label: 'Real Estate Agencies',
    description: 'Leads, showings, buyer/seller inquiries',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
    questions: [
      'Residential, commercial, or rentals? What areas do you serve?',
      'Services: buying, selling, property management, investments?',
      'Need lead qualification, showings, or follow-ups?'
    ]
  },
  {
    id: 'automotive',
    label: 'Automotive Services',
    description: 'Repair shops and dealerships',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2 4-4 4 4 4-4 4 4" />
      </svg>
    ),
    questions: [
      'What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?',
      'Do you offer emergency services, towing, rentals, or warranty work?',
      'Typical appointment duration? Provide estimates or parts ordering?'
    ]
  },
  {
    id: 'fitness',
    label: 'Fitness Centers & Gyms',
    description: 'Memberships, bookings, classes',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12M6 12l-3 3m3-3l-3-3m12 3l3 3m-3-3l3-3" />
      </svg>
    ),
    questions: [
      'What type (gym, yoga, PT, dance) and what classes/services?',
      'Membership packages, PT, groups, or programs (seniors/beginners)?',
      'Peak hours, cancellation policies, equipment rentals or nutrition counseling?'
    ]
  },
  {
    id: 'beauty',
    label: 'Beauty & Wellness',
    description: 'Salons, spas, med spas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
      </svg>
    ),
    questions: [
      'What services (hair, nails, skincare, massage, medical aesthetics)? Specialties?',
      'Packages, memberships, bridal, or men’s grooming?',
      'Booking policy, cancellations, product sales, or aftercare consults?'
    ]
  },
  {
    id: 'insurance',
    label: 'Insurance Agencies',
    description: 'Policies, claims, payments, appointments',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-3.866 0-7 1.79-7 4v4a2 2 0 002 2h10a2 2 0 002-2v-4c0-2.21-3.134-4-7-4z" />
      </svg>
    ),
    questions: [
      'What types (auto, home, life, commercial, health)? Multi-carrier?',
      '24/7 claims, policy reviews, or emergency assistance?',
      'Quote process, payment options, bundling discounts or loyalty programs?'
    ]
  },
  {
    id: 'construction',
    label: 'Construction & Contracting',
    description: 'Projects, estimates, licensing, coordination',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M4 21h16a1 1 0 001-1V7H3v13a1 1 0 001 1z" />
      </svg>
    ),
    questions: [
      'Services (residential, commercial, renovation, repair) and specialty trade?',
      'Free estimates, emergency, warranty, or project management consulting?',
      'Project timeline, licensing, permits, or subcontractor coordination?'
    ]
  },
  {
    id: 'education',
    label: 'Educational Institutions',
    description: 'Admissions, schedules, enrollments',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
      </svg>
    ),
    questions: [
      'Type (K-12, university, vocational, tutoring) and programs offered?',
      'Enrollment assistance, financial aid, or special needs support?',
      'Admission requirements, schedules, and online/hybrid options?'
    ]
  },
  {
    id: 'non_profit',
    label: 'Non-Profit Organizations',
    description: 'Donors, volunteers, program info',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    questions: [
      'What cause and programs do you operate?',
      'Need donation processing, volunteer scheduling, or event coordination?',
      'Funding sources, volunteer requirements, or outreach/education programs?'
    ]
  },
  {
    id: 'others',
    label: 'Others',
    description: 'Retail, online, hotels, consulting, cleaning, accounting, etc.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
      </svg>
    ),
    questions: [
      'What type of business and primary products/services customers ask about?',
      'Most popular products/services and pricing ranges? Any packages or promotions?',
      'What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?'
    ]
  }
]

const Step3b_BusinessCategory = () => {
  const { state, dispatch, nextStep, prevStep } = useOnboarding()
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(
    ((state.data.step3b && state.data.step3b.categoryId) || 'restaurants') as CategoryKey
  )
  const [answers, setAnswers] = useState<Record<string, string>>(
    (state.data.step3b && state.data.step3b.answers) || {}
  )

  const activeCategory = useMemo(
    () => categories.find(c => c.id === selectedCategory)!,
    [selectedCategory]
  )

  const handleAnswerChange = (q: string, v: string) => {
    setAnswers(prev => ({ ...prev, [q]: v }))
  }

  const handleNext = () => {
    dispatch({
      type: 'UPDATE_STEP_DATA',
      payload: {
        step: 'step3b',
        data: {
          categoryId: activeCategory.id,
          categoryLabel: activeCategory.label,
          answers
        }
      }
    })
    nextStep()
  }

  const isNextDisabled = activeCategory.questions.some(q => !(answers[q] && answers[q].trim().length > 0))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg shadow-purple-200/50 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-3">
          Business Category
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Select your business category and answer a few tailored questions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {categories.map(cat => {
          const selected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-purple-500 bg-purple-50/60 shadow-sm'
                  : 'border-purple-100 hover:border-purple-300 bg-white'
              }`}
              onClick={() => setSelectedCategory(cat.id)}
              type="button"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                selected ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {cat.icon}
              </div>
              <div className="font-semibold text-slate-800 mb-1">{cat.label}</div>
              <div className="text-sm text-slate-600">{cat.description}</div>
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-purple-100/60 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Questions</h3>
        <div className="space-y-4">
          {activeCategory.questions.map((q, idx) => (
            <div key={idx} className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{q}</label>
              <textarea
                value={answers[q] || ''}
                onChange={(e) => handleAnswerChange(q, e.target.value)}
                className="w-full px-3 py-2 border border-purple-200/60 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                rows={3}
                placeholder="Type your answer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevStep}
          className="group flex items-center px-6 py-3 bg-white border border-purple-200/60 text-purple-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:border-purple-300/70 hover:bg-purple-50/50"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
        >
          <span className="flex items-center">
            Continue Setup
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 group-disabled:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}

export default Step3b_BusinessCategory


