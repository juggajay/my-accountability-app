'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/track/pain', label: 'Pain', icon: '🩹' },
    { href: '/exercises', label: 'Exercises', icon: '💪' },
    { href: '/track/alcohol', label: 'Alcohol', icon: '🍺' },
    { href: '/track/spending', label: 'Spending', icon: '💰' },
    { href: '/goals', label: 'Goals', icon: '🎯' },
    { href: '/ai/generate', label: 'AI Routine', icon: '✨' },
    { href: '/ai/insights', label: 'Insights', icon: '🧠' },
    { href: '/ai/coach', label: 'Coach', icon: '💬' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-xl font-bold text-primary-500">
              MyApp
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu')
                if (menu) {
                  menu.classList.toggle('hidden')
                }
              }}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ☰
            </button>
          </div>
        </div>

        <div id="mobile-menu" className="hidden md:hidden border-t border-neutral-200 dark:border-neutral-800">
          <div className="px-4 py-2 space-y-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="h-16"></div>
    </>
  )
}