import '../src/styles.css'

export const metadata = {
  title: '蔡辰玮 CAI CHENWEI — Portfolio 2026',
  description: '蔡辰玮的个人作品集，记录 AI Agent、编程实践、教育经历与开源项目。',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
