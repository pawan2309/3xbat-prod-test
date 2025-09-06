'use client'

import Link from 'next/link'

export default function DashboardGrid() {
  const menuItems = [
    {
      title: 'CRICKET',
      subtitle: 'LIVE SPORTS',
      description: 'CRICKET SOCCER',
      href: '/cricket',
      image: '/icons/cricket.gif'
    },
    {
      title: 'CASINO',
      subtitle: 'LIVE CASINO',
      description: '',
      href: '/casino',
      image: '/icons/casino.gif',
    },
    {
      title: 'MY LEDGER',
      subtitle: 'MY LEDGER',
      description: '',
      href: '/ledger',
      image: '/icons/ledger.gif'
    },
    {
      title: 'PROFILE',
      subtitle: 'MY PROFILE',
      description: 'MY DETAILS',
      href: '/profile',
      image: '/icons/profile.gif'
    },
    {
      title: 'PASSWORD',
      subtitle: 'PASSWORD',
      description: '',
      href: '/change-password',
      image: '/icons/password.gif'
    },
    {
      title: 'PASSBOOK',
      subtitle: 'PASSBOOK',
      description: '',
      href: '/client-Statement',
      image: '/icons/passbook.gif'
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-6xl mx-auto py-2 px-1 sm:p-4">
      {/* Main Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-12 lg:gap-20 xl:gap-24 w-full max-w-md md:max-w-5xl lg:max-w-7xl">
        {menuItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <Link href={item.href}>
              <button className="w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] md:w-[180px] md:h-[180px] lg:w-[200px] lg:h-[200px] xl:w-[220px] xl:h-[220px] rounded-full bg-blue-900 border-2 border-blue-800 relative overflow-hidden flex flex-col items-center justify-center text-white hover:bg-blue-800 transition-colors active:scale-95">
                
                {/* ✅ Animated Image - Play Once */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px] object-cover rounded-full"
                    style={{
                      animation: 'playOnce 2s ease-in-out',
                      animationIterationCount: 1,
                      animationFillMode: 'forwards'
                    }}
                  />
                </div>

              </button>
            </Link>
            <span className="text-gray-800 text-xs sm:text-sm font-bold mt-1 text-center leading-tight">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
