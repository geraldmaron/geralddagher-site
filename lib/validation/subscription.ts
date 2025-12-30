import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(320, 'Email too long')
  .transform(email => email.toLowerCase().trim());

export const createSubscriptionSchema = z.object({
  email: emailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  blog: z.boolean(),
  substack: z.boolean()
}).refine(data => data.blog || data.substack, {
  message: 'At least one subscription type (blog or substack) must be selected'
});

export const confirmSubscriptionSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required')
    .max(128, 'Invalid token format')
    .regex(/^[a-fA-F0-9]+$/, 'Invalid token format')
});

export const unsubscribeSchema = z.object({
  email: emailSchema,
  target: z.enum(['blog', 'substack'], {
    message: 'Target must be either "blog" or "substack"'
  })
});

export const brevoWebhookSchema = z.object({
  event: z.enum(['delivered', 'bounced', 'unsubscribed', 'opened', 'clicked']),
  email: emailSchema,
  date: z.string().optional(),
  'message-id': z.string().optional(),
  messageId: z.string().optional(),
  reason: z.string().optional()
});

export const publishWebhookSchema = z.object({
  postId: z
    .string()
    .min(1, 'Post ID is required')
    .max(36, 'Invalid post ID format')
});

export type CreateSubscriptionRequest = z.infer<typeof createSubscriptionSchema>;
export type ConfirmSubscriptionRequest = z.infer<typeof confirmSubscriptionSchema>;
export type UnsubscribeRequest = z.infer<typeof unsubscribeSchema>;
export type BrevoWebhookRequest = z.infer<typeof brevoWebhookSchema>;
export type PublishWebhookRequest = z.infer<typeof publishWebhookSchema>;
