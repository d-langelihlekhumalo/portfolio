import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import HomePage from '@/pages/HomePage'

// Markdown rendering (react-markdown, remark-gfm, rehype-highlight, highlight.js)
// is a meaningful chunk of bundle weight that only the blog routes need —
// code-split so homepage visitors never download it.
const BlogListPage = lazy(() => import('@/pages/BlogListPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))

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
      {/* /admin/* is added in a later phase — gated, lazy-loaded, its own layout. */}
    </Routes>
  )
}

export default AppRouter
