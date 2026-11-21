import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import HomePage from '@/pages/HomePage'

// Markdown rendering (react-markdown, remark-gfm, rehype-highlight, highlight.js)
// is a meaningful chunk of bundle weight that only the blog routes need —
// code-split so homepage visitors never download it.
const BlogListPage = lazy(() => import('@/pages/BlogListPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
const ProjectCaseStudyPage = lazy(() => import('@/pages/ProjectCaseStudyPage'))
// Gated (Cloudflare Access), never shown to public visitors — its own bundle,
// its own minimal shell, deliberately outside PublicLayout.
const AdminApp = lazy(() => import('@/pages/admin/AdminApp'))
// Private learning roadmap — also under /admin, so the same Access gate covers it.
const RoadmapPage = lazy(() => import('@/pages/admin/roadmap/RoadmapPage'))
// Private salary & tax calculators — same /admin gate; figures never in the repo.
const SalaryPage = lazy(() => import('@/pages/admin/salary/SalaryPage'))

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
        <Route
          path="/projects/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ProjectCaseStudyPage />
            </Suspense>
          }
        />
      </Route>

      {['/admin/salary', '/admin/salary/:section', '/admin/salary/:section/:view'].map((path) => (
        <Route
          key={path}
          path={path}
          element={
            <Suspense fallback={<RouteFallback />}>
              <SalaryPage />
            </Suspense>
          }
        />
      ))}
      {['/admin/roadmap', '/admin/roadmap/:itemId'].map((path) => (
        <Route
          key={path}
          path={path}
          element={
            <Suspense fallback={<RouteFallback />}>
              <RoadmapPage />
            </Suspense>
          }
        />
      ))}
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
