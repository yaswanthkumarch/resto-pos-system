import axios from 'axios';
import { performance } from 'perf_hooks';

interface PerformanceTest {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: any;
}

interface TestResult {
  name: string;
  duration: number;
  status: number;
  success: boolean;
  error?: string;
}

class PerformanceTester {
  private baseUrl: string;
  private token: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async makeRequest(test: PerformanceTest): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const response = await axios({
        method: test.method,
        url: `${this.baseUrl}${test.url}`,
        data: test.data,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...test.headers,
        },
        timeout: 10000,
      });

      const duration = performance.now() - startTime;

      return {
        name: test.name,
        duration,
        status: response.status,
        success: response.status >= 200 && response.status < 300,
      };
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      return {
        name: test.name,
        duration,
        status: error.response?.status || 0,
        success: false,
        error: error.message,
      };
    }
  }

  async runTests(tests: PerformanceTest[]): Promise<TestResult[]> {
    console.log('🚀 Starting Performance Tests...\n');

    for (const test of tests) {
      console.log(`Testing: ${test.name}`);
      const result = await this.makeRequest(test);
      this.results.push(result);
      
      if (result.success) {
        console.log(`✅ ${test.name}: ${result.duration.toFixed(2)}ms`);
      } else {
        console.log(`❌ ${test.name}: ${result.error || 'Failed'}`);
      }
    }

    return this.results;
  }

  generateReport(): void {
    console.log('\n📊 Performance Test Report');
    console.log('========================\n');

    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);

    if (successfulTests.length > 0) {
      const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
      const minDuration = Math.min(...successfulTests.map(r => r.duration));
      const maxDuration = Math.max(...successfulTests.map(r => r.duration));

      console.log('✅ Successful Tests:');
      console.log(`   Total: ${successfulTests.length}`);
      console.log(`   Average Duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`   Min Duration: ${minDuration.toFixed(2)}ms`);
      console.log(`   Max Duration: ${maxDuration.toFixed(2)}ms\n`);

      console.log('📈 Performance Breakdown:');
      successfulTests
        .sort((a, b) => a.duration - b.duration)
        .forEach(result => {
          const status = result.duration < 200 ? '🟢' : result.duration < 500 ? '🟡' : '🔴';
          console.log(`   ${status} ${result.name}: ${result.duration.toFixed(2)}ms`);
        });
    }

    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(result => {
        console.log(`   ${result.name}: ${result.error || 'Unknown error'}`);
      });
    }

    console.log('\n🎯 Performance Targets:');
    console.log('   Fast (< 200ms): 🟢');
    console.log('   Acceptable (200-500ms): 🟡');
    console.log('   Slow (> 500ms): 🔴');
  }
}

async function runPerformanceTests() {
  const baseUrl = 'http://localhost:3001/api';
  
  // You'll need to get a valid token first
  const token = process.env.TEST_TOKEN || 'your-test-token-here';

  const tester = new PerformanceTester(baseUrl, token);

  const tests: PerformanceTest[] = [
    {
      name: 'Health Check',
      url: '/health',
      method: 'GET',
    },
    {
      name: 'Get Categories',
      url: '/categories',
      method: 'GET',
    },
    {
      name: 'Get Products',
      url: '/products',
      method: 'GET',
    },
    {
      name: 'Get Orders',
      url: '/orders',
      method: 'GET',
    },
    {
      name: 'Get Tables',
      url: '/tables',
      method: 'GET',
    },
    {
      name: 'Get Customers',
      url: '/customers',
      method: 'GET',
    },
    {
      name: 'Performance Stats',
      url: '/performance',
      method: 'GET',
    },
  ];

  await tester.runTests(tests);
  tester.generateReport();
}

if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

export { PerformanceTester, runPerformanceTests }; 