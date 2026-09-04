---
title: "Building Reusable Infinite-Scroll Patterns in React"
slug: "reusable-infinite-scroll-patterns-in-react"
date: "2026-09-04"
tags: ["react", "frontend"]
description: "A practical look at building infinite scroll with IntersectionObserver instead of scroll-event listeners — the pattern behind pagination and infinite-scrolling work on a recent project."
sources:
  - title: "IntersectionObserver API — MDN"
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API"
hasUnverifiedCode: false
---

Most infinite-scroll implementations I've seen reach for a `scroll` event listener first, then bolt on throttling once it starts jank­ing under fast scrolling. `IntersectionObserver` sidesteps that entirely: instead of polling scroll position, you ask the browser to notify you when a sentinel element enters the viewport.

## The core pattern

```tsx unverified
function useInfiniteReveal<T>(items: T[], batchSize = 20) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + batchSize, items.length))
        }
      },
      { rootMargin: '200px' },
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [items.length, batchSize])

  return { visibleItems: items.slice(0, visibleCount), sentinelRef }
}
```

A `rootMargin` of `200px` means the next batch loads before the sentinel is actually on screen, so users don't see a loading flash at the boundary.

## Why this matters for a statically-generated site

If your list is already fully loaded client-side (as opposed to paginated from an API), this isn't really "infinite scroll" — it's progressive reveal over data you already have. That distinction matters for SEO: a prerendered snapshot only bakes in whatever's visible at mount time, so a generous initial batch size keeps more content visible to crawlers that don't run JavaScript, while every item still gets its own indexable page regardless of scroll position.

## Takeaways

- `IntersectionObserver` avoids scroll-event throttling entirely — the browser tells you when something's visible, you don't ask it repeatedly.
- For statically-generated pages, treat "infinite scroll" over pre-loaded data as progressive reveal, and size the initial batch with crawlability in mind, not just perceived performance.
