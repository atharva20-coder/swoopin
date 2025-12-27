/**
 * Load Testing Script for Swoopin
 * 
 * Run with: npx ts-node scripts/load-test.ts
 * Or: bun run scripts/load-test.ts
 * 
 * Prerequisites:
 * - App running on localhost:3000
 * - Valid test user session (update AUTH_TOKEN)
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CONCURRENT_USERS = 100;
const REQUESTS_PER_USER = 10;

// Test endpoints (public and protected)
const ENDPOINTS = [
  { path: '/', name: 'Homepage' },
  { path: '/api/health', name: 'Health Check' },
  { path: '/dashboard', name: 'Dashboard' },
];

interface TestResult {
  endpoint: string;
  totalRequests: number;
  successCount: number;
  failCount: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p95Latency: number;
  requestsPerSecond: number;
}

async function makeRequest(url: string): Promise<{ success: boolean; latency: number }> {
  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'LoadTest/1.0',
      },
    });
    const latency = performance.now() - start;
    return { success: response.ok, latency };
  } catch (error) {
    return { success: false, latency: performance.now() - start };
  }
}

async function runConcurrentRequests(
  endpoint: string,
  concurrentUsers: number,
  requestsPerUser: number
): Promise<TestResult> {
  const url = `${BASE_URL}${endpoint}`;
  const latencies: number[] = [];
  let successCount = 0;
  let failCount = 0;

  const startTime = performance.now();

  // Create concurrent user simulations
  const userPromises = Array.from({ length: concurrentUsers }, async () => {
    for (let i = 0; i < requestsPerUser; i++) {
      const result = await makeRequest(url);
      latencies.push(result.latency);
      if (result.success) successCount++;
      else failCount++;
    }
  });

  await Promise.all(userPromises);

  const totalTime = (performance.now() - startTime) / 1000; // seconds
  const sortedLatencies = latencies.sort((a, b) => a - b);
  const p95Index = Math.floor(sortedLatencies.length * 0.95);

  return {
    endpoint,
    totalRequests: latencies.length,
    successCount,
    failCount,
    avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    minLatency: sortedLatencies[0],
    maxLatency: sortedLatencies[sortedLatencies.length - 1],
    p95Latency: sortedLatencies[p95Index],
    requestsPerSecond: latencies.length / totalTime,
  };
}

async function main() {
  console.log('🚀 Starting Load Test');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   Requests per User: ${REQUESTS_PER_USER}`);
  console.log('');

  const results: TestResult[] = [];

  for (const endpoint of ENDPOINTS) {
    console.log(`Testing: ${endpoint.name} (${endpoint.path})...`);
    const result = await runConcurrentRequests(
      endpoint.path,
      CONCURRENT_USERS,
      REQUESTS_PER_USER
    );
    results.push(result);
  }

  console.log('\n📊 Load Test Results\n');
  console.log('─'.repeat(80));

  for (const result of results) {
    console.log(`\n${result.endpoint}`);
    console.log(`  Total Requests:    ${result.totalRequests}`);
    console.log(`  Success Rate:      ${((result.successCount / result.totalRequests) * 100).toFixed(1)}%`);
    console.log(`  Requests/sec:      ${result.requestsPerSecond.toFixed(2)}`);
    console.log(`  Avg Latency:       ${result.avgLatency.toFixed(2)}ms`);
    console.log(`  Min Latency:       ${result.minLatency.toFixed(2)}ms`);
    console.log(`  Max Latency:       ${result.maxLatency.toFixed(2)}ms`);
    console.log(`  P95 Latency:       ${result.p95Latency.toFixed(2)}ms`);
  }

  console.log('\n' + '─'.repeat(80));
  console.log('✅ Load test complete!');
}

main().catch(console.error);
