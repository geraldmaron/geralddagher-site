import { getDirectusClient } from '../server-client';
import { readItems } from '@directus/sdk';

export interface WorkExperience {
  id: number;
  company: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  highlights: Array<{ value: string }>;
  company_url: string | null;
}

export async function getWorkExperience(): Promise<WorkExperience[]> {
  try {
    const directus = await getDirectusClient({ requireAuth: false });
    const experience = await directus.request(
      readItems('work_experience', {
        sort: ['-start_date'],
        fields: [
          'id',
          'company',
          'title',
          'location',
          'start_date',
          'end_date',
          'is_current',
          'description',
          'highlights',
          'company_url',
        ],
      })
    );

    return experience as WorkExperience[];
  } catch (error) {
    console.error('Failed to fetch work experience:', error);
    return [];
  }
}
