import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/bottom-nav'
import { SplashScreen } from '@/components/splash-screen'
import { MindfulBellListener } from '@/components/mindful-bell-listener'
import { AuthProvider } from '@/lib/auth-context'

// Noto Serif KR은 한자 혼용 등 제한적으로만 사용
const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://haru-suhang.vercel.app'),
  title: {
    default: '하루수행 · 일상 속 불교 수행',
    template: '%s · 하루수행',
  },
  description:
    '108배, 명상, 염불, 경전 낭독, AI 법문까지 — 한국 불교 수행을 매일의 리듬으로. 무료로 시작하세요.',
  keywords: [
    '불교',
    '명상',
    '108배',
    '수행',
    '반야심경',
    '염불',
    '법문',
    '마음챙김',
    'AI 법사',
    '하루수행',
  ],
  authors: [{ name: 'Edithtech' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '하루수행',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: '하루수행 · 일상 속 불교 수행',
    description:
      '108배, 명상, 염불, 경전 낭독, AI 법문까지 — 한국 불교 수행을 매일의 리듬으로.',
    siteName: '하루수행',
    url: 'https://haru-suhang.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: '하루수행 · 일상 속 불교 수행',
    description: '한국 불교 수행을 매일의 리듬으로. 108배 · 명상 · 염불 · 법문',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 접근성을 위해 사용자 확대 허용 (WCAG)
  maximumScale: 5,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${notoSerifKR.variable}`}>
      <head>
        {/* Pretendard CDN — preconnect로 LCP 최적화 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        <SplashScreen />
        <AuthProvider>
          <main className="flex-1 pb-20 max-w-lg mx-auto w-full relative">
            {children}
          </main>
          <BottomNav />
          <MindfulBellListener />
        </AuthProvider>
      </body>
    </html>
  )
}
