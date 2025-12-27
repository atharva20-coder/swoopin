# Performance Testing Guide

## 1. Lighthouse Audit (Target: 90+)

### Option A: Chrome DevTools (Recommended)

1. Open Chrome and navigate to your app: `http://localhost:3000`
2. Open DevTools (F12 or Cmd+Opt+I)
3. Go to **Lighthouse** tab
4. Select "Performance" category
5. Click "Analyze page load"

### Option B: CLI

```bash
# Install globally
npm i -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view --only-categories=performance
```

### Option C: PageSpeed Insights (Production)

- Visit: https://pagespeed.web.dev/
- Enter your production URL

---

## 2. Memory Profiling

### Chrome DevTools Memory Tab

1. Open app with large dataset (1000+ items)
2. DevTools → **Memory** tab
3. Take heap snapshot
4. Perform actions (scroll, paginate, search)
5. Take another snapshot
6. Compare snapshots for leaks

### React DevTools Profiler

1. Install React DevTools extension
2. Open Profiler tab
3. Click Record, interact with app
4. Analyze component render times

---

## 3. Load Testing (100 Concurrent Users)

### Run Built-in Script

```bash
cd /Users/atharvajoshi/Documents/swoopin
bun run scripts/load-test.ts
```

### Using Apache Benchmark (ab)

```bash
# 1000 requests, 100 concurrent
ab -n 1000 -c 100 http://localhost:3000/
```

### Using k6 (Advanced)

```bash
# Install k6
brew install k6

# Create test script and run
k6 run scripts/k6-load-test.js
```

---

## Expected Targets

| Metric                         | Target  | Status  |
| ------------------------------ | ------- | ------- |
| Lighthouse Performance         | 90+     | Pending |
| FCP (First Contentful Paint)   | < 1.8s  | Pending |
| LCP (Largest Contentful Paint) | < 2.5s  | Pending |
| Memory Growth per 1000 items   | < 50MB  | Pending |
| P95 Latency (100 users)        | < 500ms | Pending |
| Requests/sec                   | > 50    | Pending |
