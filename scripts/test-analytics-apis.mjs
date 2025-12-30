import { cloudflareAnalyticsClient } from '../lib/cloudflare/client.js';
import { vercelClient } from '../lib/vercel/client.js';

async function testAPIs() {
  console.log('🔍 Testing Analytics API Connections\n');

  console.log('1️⃣  Cloudflare Analytics API');
  console.log('━'.repeat(50));
  try {
    const cfValid = await cloudflareAnalyticsClient.validateConnection();
    if (cfValid) {
      console.log('✅ Cloudflare API: Connected');
      const data = await cloudflareAnalyticsClient.getAllAnalyticsData(7);
      console.log(`📊 Visitors (7d): ${data.visitors.total.toLocaleString()}`);
      console.log(`📈 Pageviews (7d): ${data.pageviews.total.toLocaleString()}`);
      console.log(`📦 Bandwidth: ${data.bandwidth.formatted}`);
      console.log(`🔝 Top Pages: ${data.topPages.length} found`);
    } else {
      console.log('❌ Cloudflare API: Not configured or invalid credentials');
      console.log('   Required: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID');
    }
  } catch (error) {
    console.log('❌ Cloudflare API Error:', error.message);
  }

  console.log('\n2️⃣  Vercel API');
  console.log('━'.repeat(50));
  try {
    const vercelValid = await vercelClient.validateConnection();
    if (vercelValid) {
      console.log('✅ Vercel API: Connected');
      const data = await vercelClient.getDashboardData();
      console.log(`📦 Project: ${data.project.name}`);
      console.log(`🚀 Recent Deployments: ${data.deployments.length}`);
      if (data.latestDeployment) {
        console.log(`📍 Latest: ${data.latestDeployment.state} - ${data.latestDeployment.url}`);
      }
    } else {
      console.log('❌ Vercel API: Not configured or invalid credentials');
      console.log('   Required: VERCEL_API_TOKEN');
    }
  } catch (error) {
    console.log('❌ Vercel API Error:', error.message);
  }

  console.log('\n' + '━'.repeat(50));
  console.log('\n💡 Recommendations:');
  console.log('   • Cloudflare provides: Visitors, Pageviews, Bandwidth, Top Pages, Countries');
  console.log('   • Vercel provides: Deployment status, Project info');
  console.log('   • For accurate analytics, configure both APIs\n');
}

testAPIs().catch(console.error);
