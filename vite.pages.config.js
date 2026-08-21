import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

const pagePublicFiles = [
  'favicon.svg',
  'assets/avatar-cai.jpg',
  'assets/learning-progress-v2.jpg',
  'assets/ai-workflow-v2.jpg',
  'assets/open-source-lab-v2.jpg',
  'assets/directory-about-v2.webp',
  'assets/directory-experience-v2.webp',
  'assets/directory-projects-v2.webp',
  'assets/directory-strengths-v2.webp',
  'assets/directory-contact-v2.webp',
  'assets/dingtalk-qr.jpg',
]

function copyPageAssets() {
  return {
    name: 'copy-page-assets',
    writeBundle(options) {
      const outputRoot = resolve(process.cwd(), options.dir || 'dist-pages')

      for (const relativePath of pagePublicFiles) {
        const source = resolve(process.cwd(), 'public', relativePath)
        const destination = resolve(outputRoot, relativePath)
        mkdirSync(dirname(destination), { recursive: true })
        copyFileSync(source, destination)
      }
    },
  }
}

export default defineConfig({
  base: '/cai-chenwei-portfolio/',
  publicDir: false,
  plugins: [react(), copyPageAssets()],
  build: {
    outDir: 'dist-pages',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
  },
})
