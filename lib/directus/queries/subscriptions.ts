import { createDirectusClient } from '../client';
import { createDirectusServerClient } from '../server-client';
import { readItems, createItem, updateItem, readUsers, updateUser } from '@directus/sdk';
import type { Subscription } from '../types';

export async function getSubscriptions(params: { status?: string; limit?: number; offset?: number } = {}) {
  const { status, limit = 100, offset = 0 } = params;

  const filter: any = {};
  if (status) {
    filter.status = { _eq: status };
  }

  const client = createDirectusClient();
  return await client.request(
    readItems('subscriptions', {
      filter,
      limit,
      offset,
      sort: ['-date_created']
    })
  );
}

export async function createSubscription(
  email: string,
  options?: {
    firstName?: string;
    lastName?: string;
    type?: 'blog' | 'substack';
  }
) {
  const { firstName, lastName, type = 'blog' } = options || {};

  const client = createDirectusClient();
  const subscription = await client.request(
    createItem('subscriptions', {
      email,
      first_name: firstName,
      last_name: lastName,
      type,
      status: 'active',
      email_verified: false
    })
  );

  await syncSubscriptionToUser(email, type, true);

  return subscription;
}

export async function updateSubscription(id: number, data: Partial<Subscription>) {
  const client = createDirectusClient();
  return await client.request(updateItem('subscriptions', id, data));
}

export async function findSubscriptionByEmail(email: string, type?: string) {
  const filter: any = { email: { _eq: email } };
  if (type) {
    filter.type = { _eq: type };
  }

  const client = createDirectusClient();
  const subscriptions = await client.request(
    readItems('subscriptions', {
      filter,
      limit: 1
    })
  );

  return subscriptions[0] || null;
}

export async function syncSubscriptionToUser(email: string, type: 'blog' | 'substack', subscribed: boolean) {
  try {
    const serverClient = await createDirectusServerClient();

    const users = await serverClient.request(
      readUsers({
        filter: { email: { _eq: email } },
        limit: 1
      })
    );

    if (users && users.length > 0) {
      const user = users[0];
      const updateData: any = {};

      if (type === 'blog') {
        updateData.subscribed_to_blog = subscribed;
      } else if (type === 'substack') {
        updateData.subscribed_to_substack = subscribed;
      }

      await serverClient.request(
        updateUser(user.id, updateData)
      );
    }
  } catch (error) {
    console.error('Error syncing subscription to user:', error);
  }
}
