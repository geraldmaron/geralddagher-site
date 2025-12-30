import { Metadata, Viewport } from 'next';
import { name } from '@/lib/constants';
import { getPublicProfile } from '@/lib/directus/queries';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getPublicProfile();

  const description = profile?.bio || 'Senior Product Manager & Leadership Coach';
  const keywords = ['Product Management', 'Leadership', 'Mentorship', 'Strategy', 'Cloud Platform'];

  return {
    title: name,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: name,
      description,
      url: 'https://geralddagher.com',
      siteName: name,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: ['/og-image.jpg'],
    },
  };
}