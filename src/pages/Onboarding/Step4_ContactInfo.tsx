import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboarding } from '../../context/OnboardingContext'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
})

type ContactFormData = z.infer<typeof contactSchema>

const Step4_ContactInfo = () => {
  const { state, dispatch, nextStep, prevStep } = useOnboarding()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: state.data.step4.firstName,
      lastName: state.data.step4.lastName,
      email: state.data.step4.email,
      phone: state.data.step4.phone,
      termsAccepted: state.data.step4.termsAccepted
    },
    mode: 'onChange'
  })

  const onSubmit = (data: ContactFormData) => {
    dispatch({
      type: 'UPDATE_STEP_DATA',
      payload: {
        step: 'step4',
        data
      }
    })
    nextStep()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 bg-clip-text text-transparent mb-4">
            Contact Information
          </h2>
          <p className="text-xl text-slate-600 font-medium">
            Tell us how to reach you
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl shadow-purple-500/10 border border-purple-100/50 p-8 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-purple-50/20 rounded-3xl"></div>
          
          <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-purple-800 mb-3">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      {...register('firstName')}
                      type="text"
                      className={`
                        w-full px-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl
                        border-2 transition-all duration-300 outline-none
                        font-medium text-slate-800 placeholder-slate-400
                        shadow-sm hover:shadow-md focus:shadow-lg
                        ${errors.firstName 
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                          : 'border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                        }
                      `}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-purple-800 mb-3">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      {...register('lastName')}
                      type="text"
                      className={`
                        w-full px-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl
                        border-2 transition-all duration-300 outline-none
                        font-medium text-slate-800 placeholder-slate-400
                        shadow-sm hover:shadow-md focus:shadow-lg
                        ${errors.lastName 
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                          : 'border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                        }
                      `}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-purple-800 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className={`
                      w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl
                      border-2 transition-all duration-300 outline-none
                      font-medium text-slate-800 placeholder-slate-400
                      shadow-sm hover:shadow-md focus:shadow-lg
                      ${errors.email 
                        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                        : 'border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                      }
                    `}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-purple-800 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    className={`
                      w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl
                      border-2 transition-all duration-300 outline-none
                      font-medium text-slate-800 placeholder-slate-400
                      shadow-sm hover:shadow-md focus:shadow-lg
                      ${errors.phone 
                        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                        : 'border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                      }
                    `}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Terms Section */}
              <div className="bg-gradient-to-r from-purple-50/50 to-white/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/70 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="relative flex items-center">
                    <input
                      {...register('termsAccepted')}
                      type="checkbox"
                      id="terms"
                      className="
                        w-5 h-5 text-purple-600 bg-white border-2 border-purple-200 
                        rounded-md focus:ring-4 focus:ring-purple-100 focus:border-purple-400
                        transition-all duration-200 cursor-pointer
                        checked:bg-purple-600 checked:border-purple-600
                      "
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="terms" className="block text-sm font-medium text-slate-800 cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <a 
                        href="#" 
                        className="text-purple-600 hover:text-purple-700 font-semibold underline decoration-purple-300 underline-offset-2 hover:decoration-purple-500 transition-colors duration-200"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a 
                        href="#" 
                        className="text-purple-600 hover:text-purple-700 font-semibold underline decoration-purple-300 underline-offset-2 hover:decoration-purple-500 transition-colors duration-200"
                      >
                        SMS Terms & Conditions
                      </a>
                    </label>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      By checking this box, you consent to receive SMS messages from AskJohnny for account updates and notifications.
                    </p>
                    {errors.termsAccepted && (
                      <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.termsAccepted.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="
                    group inline-flex items-center px-6 py-3 text-sm font-semibold
                    text-slate-700 bg-white/80 backdrop-blur-sm border-2 border-slate-200
                    rounded-xl shadow-sm hover:shadow-md transition-all duration-200
                    hover:bg-slate-50 hover:border-slate-300 focus:outline-none
                    focus:ring-4 focus:ring-slate-100
                  "
                >
                  <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={!isValid}
                  className="
                    group inline-flex items-center px-8 py-4 text-sm font-semibold
                    text-white rounded-xl transition-all duration-200
                    focus:outline-none focus:ring-4 focus:ring-purple-200
                    shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    disabled:shadow-md disabled:bg-slate-300
                    bg-gradient-to-r from-purple-600 to-purple-700
                    hover:from-purple-700 hover:to-purple-800
                  "
                >
                  Next Step
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step4_ContactInfo