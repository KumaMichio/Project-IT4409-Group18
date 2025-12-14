const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFilters() {
  console.log('🧪 Testing Course Filter API...\n');

  const tests = [
    {
      name: '1. Get all courses (no filters)',
      url: `${API_BASE}/courses?limit=5`
    },
    {
      name: '2. Filter by price: Free',
      url: `${API_BASE}/courses?price_range=free&limit=5`
    },
    {
      name: '3. Filter by price: Under 100k',
      url: `${API_BASE}/courses?price_range=under_100k&limit=5`
    },
    {
      name: '4. Filter by price: 100k-500k',
      url: `${API_BASE}/courses?price_range=100k_500k&limit=5`
    },
    {
      name: '5. Filter by rating: >= 4.0',
      url: `${API_BASE}/courses?min_rating=4.0&limit=5`
    },
    {
      name: '6. Sort by price: Ascending',
      url: `${API_BASE}/courses?sort_by=price&sort_order=asc&limit=5`
    },
    {
      name: '7. Sort by rating: Descending',
      url: `${API_BASE}/courses?sort_by=rating&sort_order=desc&limit=5`
    },
    {
      name: '8. Combined: Price filter + Rating filter',
      url: `${API_BASE}/courses?price_range=under_100k&min_rating=4.0&limit=5`
    },
    {
      name: '9. Combined: Price + Rating + Sort',
      url: `${API_BASE}/courses?price_range=100k_500k&min_rating=3.5&sort_by=price&sort_order=asc&limit=5`
    },
    {
      name: '10. Search + Filter: Search "javascript" + Price filter',
      url: `${API_BASE}/courses?q=javascript&price_range=under_100k&limit=5`
    },
    {
      name: '11. Search + Filter + Sort: Full combination',
      url: `${API_BASE}/courses?q=javascript&price_range=100k_500k&min_rating=4.0&sort_by=rating&sort_order=desc&limit=5`
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📋 ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await axios.get(test.url);
      
      if (response.status === 200) {
        const data = response.data;
        const courseCount = data.courses ? data.courses.length : 0;
        const total = data.pagination ? data.pagination.total : 0;
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Results: ${courseCount} courses (Total: ${total})`);
        
        if (courseCount > 0) {
          const firstCourse = data.courses[0];
          console.log(`   📚 Sample: "${firstCourse.title}"`);
          console.log(`      Price: ${firstCourse.price_cents} VND`);
          console.log(`      Rating: ${parseFloat(firstCourse.avg_rating).toFixed(1)}`);
        }
        
        passed++;
      } else {
        console.log(`   ❌ Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ⚠️  Backend server is not running. Please start the server first.`);
      } else {
        console.log(`   Error details: ${error.stack || error.message}`);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${tests.length}`);
  console.log('='.repeat(50));
}

// Run tests
testFilters().catch(console.error);

