
import type { Metadata } from 'next'
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Human Body Manual - Bedienungsanleitung für den menschlichen Körper',
  description: 'Eine interaktive spirituelle Reise zur Optimierung deines Körpers und Geistes. Entdecke 8 Hauptbereiche mit wissenschaftlich fundierten Techniken für mehr Vitalität, Balance und inneren Frieden.',
  keywords: ['Körperoptimierung', 'Spiritualität', 'Gesundheit', 'Vagusnerv', 'Biohacking', 'Meditation', 'Atemtechniken'],
  authors: [{ name: 'Human Body Manual Team' }],
  openGraph: {
    title: 'Human Body Manual - Bedienungsanleitung für den menschlichen Körper',
    description: 'Entdecke das volle Potenzial deines Körpers durch spirituell-bewusste Optimierungstechniken',
    type: 'website',
    locale: 'de_DE',
  },
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className={`${inter.className} min-h-screen bg-cream-500`}>
        <div className="relative min-h-screen">
          {/* Mystischer Hintergrund */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full mandala-decoration opacity-30" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gold-200/20 to-terracotta-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-forest-200/20 to-sky-200/20 rounded-full blur-3xl" />
          </div>

          {/* Navigation */}
          <nav className="relative z-50 sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <a href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-terracotta-500 rounded-xl shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">◯</span>
                    </div>
                    <div>
                      <div className="font-playfair font-bold text-charcoal-900 text-lg">
                        Human Body Manual
                      </div>
                      <div className="mystical-accent text-xs text-charcoal-600">
                        Bedienungsanleitung für den Körper
                      </div>
                    </div>
                  </a>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                  <a 
                    href="/" 
                    className="text-charcoal-700 hover:text-terracotta-600 font-medium transition-colors duration-200"
                  >
                    Körperkarte
                  </a>
                  <a 
                    href="/dashboard" 
                    className="text-charcoal-700 hover:text-terracotta-600 font-medium transition-colors duration-200"
                  >
                    Mein Fortschritt
                  </a>
                  <a 
                    href="/bereiche" 
                    className="text-charcoal-700 hover:text-terracotta-600 font-medium transition-colors duration-200"
                  >
                    Alle Bereiche
                  </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button className="text-charcoal-700 hover:text-terracotta-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="relative z-10">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-20 bg-charcoal-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <div className="font-playfair text-2xl font-bold mb-4">
                  Human Body Manual
                </div>
                <p className="text-charcoal-300 mb-6 max-w-2xl mx-auto">
                  "Der Körper ist der Tempel der Seele. Ehre ihn, verstehe ihn, optimiere ihn - 
                  und er wird dir ein Leben voller Vitalität und innerem Frieden schenken."
                </p>
                <div className="flex justify-center items-center gap-8 text-sm text-charcoal-400">
                  <span>© 2025 Human Body Manual</span>
                  <span>•</span>
                  <span>Wissenschaft trifft Spiritualität</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
