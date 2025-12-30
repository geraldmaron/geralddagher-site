import { NextResponse } from 'next/server';
import { getPublicProfile, getWorkExperience } from '@/lib/directus/queries';

function formatWorkExperienceYears(startDate: string, endDate: string | null): string {
  const startYear = new Date(startDate).getFullYear();
  const endYear = endDate ? new Date(endDate).getFullYear() : 'Present';
  return `${startYear} – ${endYear}`;
}

export async function GET() {
  try {
    const [profile, workExperience] = await Promise.all([
      getPublicProfile(),
      getWorkExperience(),
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const roles = workExperience.map((exp) => ({
      company: exp.company,
      title: exp.title,
      years: formatWorkExperienceYears(exp.start_date, exp.end_date),
      summary: exp.description || '',
      abbreviatedSummary: exp.description || '',
      highlights: exp.highlights?.map((h) => h.value) || [],
      abbreviatedHighlights: exp.highlights?.map((h) => h.value) || [],
      careersUrl: exp.company_url || '',
      imageUrl: '/images/company-placeholder.png',
    }));

    return NextResponse.json({
      profile: {
        name: `${profile.first_name} ${profile.last_name}`,
        location: profile.location || '',
        title: profile.job_title || '',
        company: profile.company || '',
        maritalStatus: '🧑🏾‍🦱 💍 👰🏼‍♀️',
        kids: '👦🏽👦🏽',
        hometown: 'Bronx, New York 🗽🍎',
        pets: '🐈🐕',
        siblings: '👩🏽👩🏽👩🏽👩🏽👩🏽👨🏽👨🏽👼🏽',
        about: {
          full: profile.bio || '',
          businessCard: profile.bio || '',
          professional: profile.bio || '',
          personal: [],
          tmp: profile.tmp_summary || '',
        },
        links: profile.social_links || {},
        keywords: [
          'Mentor',
          'Leader',
          'Father',
          'Husband',
          'Coach',
          'Friend',
          'Brother',
          'Good Human',
          'Advocate',
          'Ally'
        ],
        descriptions: [],
        terminalCommands: ['whoami | Senior Product Manager @ IBM', 'cat ~/expertise.txt | Product Strategy, Cloud Platforms, Team Leadership', 'ls ~/focus | Product Management, Strategy, Mentorship'],
      },
      roles,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
