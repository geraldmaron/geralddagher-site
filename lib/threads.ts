export interface ThreadsMediaItem {
  id: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  text?: string;
  timestamp: string;
}

export interface ThreadsResponse {
  data: ThreadsMediaItem[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export async function getMyThreads(options?: {
  limit?: number;
  after?: string;
}): Promise<ThreadsResponse> {
  const { limit = 25, after } = options || {};

  const token = process.env.THREADS_LONG_LIVED_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!token || !userId) {
    throw new Error('Missing Threads API credentials');
  }

  const url = new URL(`https://graph.threads.net/v1.0/${userId}/threads`);
  url.searchParams.set('fields', 'id,media_type,media_url,permalink,text,timestamp');
  url.searchParams.set('access_token', token);
  url.searchParams.set('limit', limit.toString());

  if (after) {
    url.searchParams.set('after', after);
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store'
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
        if (errorMessage.includes('Session has expired')) {
          throw new Error('Threads access token has expired. Please reconnect your Threads account.');
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('expired')) {
        throw e;
      }
    }
    throw new Error(`Threads API error: ${errorMessage}`);
  }

  return response.json();
}
