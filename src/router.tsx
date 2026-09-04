import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import HomePage from '@/pages/HomePage'

// Markdown rendering (react-markdown, remark-gfm, rehype-highlight, highlight.js)
// is a meaningful chunk of bundle weight that only the blog routes need —
// code-split so homepage visitors never download it.
const BlogListPage = lazy(() => import('@/pages/BlogListPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
// Gated (Cloudflare Access), never shown to public visitors — its own bundle,
// its own minimal shell, deliberately outside PublicLayout.
const AdminApp = lazy(() => import('@/pages/admin/AdminApp'))

function RouteFallback() {
  return <div className="min-h-[50vh]" aria-hidden="true" />
}

interface AppRouterProps {
  isDark: boolean
  onToggleDarkMode: (isDark: boolean) => void
}

function AppRouter({ isDark, onToggleDarkMode }: AppRouterProps) {
  return (
    <Routes>
      <Route element={<PublicLayout isDark={isDark} onToggleDarkMode={onToggleDarkMode} />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<RouteFallback />}>
              <BlogListPage />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <BlogPostPage />
            </Suspense>
          }
        />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<RouteFallback />}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default AppRouter
