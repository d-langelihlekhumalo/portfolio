---
title: "[TEST] Admin Panel B1 Verification"
slug: "admin-panel-b1-test-post"
date: "2026-09-04"
tags: ["test"]
description: "A throwaway post to verify the admin panel's preview link, Approve, and Reject actions before B2 (AI generation) is built."
hasUnverifiedCode: false
---

This post exists only to verify the B1 admin workflow — it isn't meant to
stay published. If you're reading this on the live site rather than a
preview URL, it was approved by mistake and should be reverted.

## What this checks

- The admin panel at `/admin` lists this PR (labeled `ai-draft`)
- Its Cloudflare Pages preview link actually shows this content
- **Reject** closes the PR without merging
- **Approve** merges it, which triggers the real deploy pipeline
