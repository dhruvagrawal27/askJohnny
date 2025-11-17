// components/landing/Header.tsx
import { useEffect, useState } from 'react'
import { SignInButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const Header = () => {
  const navigate = useNavigate()
  const [scrolledDown, setScrolledDown] = useState(false)
  const [scrollingUp, setScrollingUp] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Check if scrolled past hero section (80px threshold)
      if (scrollTop > 80) {
        setScrolledDown(true)
      } else {
        setScrolledDown(false)
      }

      // Check scroll direction
      if (scrollTop < lastScrollTop) {
        setScrollingUp(true)
      } else {
        setScrollingUp(false)
      }

      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollTop])

  return (
    <header
      className={clsx(
        'fixed w-full top-0 left-0 z-50 transition-all duration-300 backdrop-blur-sm',
        scrolledDown ? 'bg-white shadow-md' : 'bg-transparent shadow-none',
        scrolledDown && !scrollingUp ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo on left */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Ask<span className="text-emerald-600">Johnny</span>
            </h1>
          </div>

          {/* Buttons on right: Login and Sign Up side by side */}
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                Login
              </button>
            </SignInButton>
            <button 
              onClick={() => {
                console.log('🔘 Sign Up button clicked - navigating to /new-onboarding');
                navigate("/new-onboarding");
              }}
              className="text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
