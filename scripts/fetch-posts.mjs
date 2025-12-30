import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';
import { config } from 'dotenv';

config();

const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://cms.geralddagher.com';
const apiToken = process.env.DIRECTUS_API_TOKEN;

const client = apiToken
  ? createDirectus(directusUrl).with(rest()).with(staticToken(apiToken))
  : createDirectus(directusUrl).with(rest());

try {
  const posts = await client.request(
    readItems('posts', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'content', 'excerpt', 'summary', 'tags'],
      limit: 100,
      sort: ['-published_at']
    })
  );

  console.log(JSON.stringify(posts, null, 2));
} catch (error) {
  console.error('Error fetching posts:', error.message);
  if (error.response) {
    console.error('Response:', await error.response.text());
  }
  process.exit(1);
}
