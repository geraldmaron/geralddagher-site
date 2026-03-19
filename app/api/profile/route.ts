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

    const roles = workExperience
      .map((exp) => ({
        company: exp.company,
        title: exp.title,
        years: formatWorkExperienceYears(exp.start_date, exp.end_date),
        summary: exp.description || '',
        abbreviatedSummary: exp.description || '',
        highlights: exp.highlights?.map((h) => h.value) || [],
        abbreviatedHighlights: exp.highlights?.map((h) => h.value) || [],
        careersUrl: exp.company_url || '',
        imageUrl: '/images/company-placeholder.png',
      }))
      .map((role) => {
        if (role.company === 'IBM') {
          const nineFigureHighlight =
            'Established portfolio operating mechanisms (scorecards, executive reporting, risk reviews, and service tiering) to align platform investments to renewal risk and enterprise readiness across a nine-figure ARR automation portfolio.';
          const hasNineFigure = role.highlights.some((h) =>
            h.toLowerCase().includes('nine-figure arr')
          );
          const updatedHighlights = hasNineFigure
            ? role.highlights
            : [...role.highlights, nineFigureHighlight];
          return {
            ...role,
            highlights: updatedHighlights,
            abbreviatedHighlights: updatedHighlights,
          };
        }
        return role;
      });

    const aboutFull =
      "Product leader with combined fluency in operational engineering and enterprise software, specializing in platform reliability, AI/ML product management, and organizational transformation at scale. I focus on helping teams shift from reactive firefighting to proactive risk management and have driven documented improvements across a nine-figure ARR enterprise automation portfolio in FedRAMP-compliant and hybrid-cloud environments.";

    const aboutBusinessCard =
      "Senior product leader focused on platform reliability, AI/ML-powered operational intelligence, and risk across a nine-figure ARR automation portfolio. I help teams move from reactive firefighting to proactive, measurable reliability.";

    const aboutProfessional =
      "I work at the intersection of site reliability engineering, AI/ML, and product strategy—designing systems, operating mechanisms, and data platforms that let engineering teams ship fast without breaking trust.";

    const descriptions = [
      "Platform reliability, disaster recovery, and dependency-aware recovery across enterprise automation portfolios.",
      "AI/ML-powered operational intelligence: change-risk assessment, AIOps, and predictive reliability frameworks.",
      "FedRAMP-compliant and hybrid-cloud environments with deep partnership across Security, GRC, and Customer Trust.",
      "Org-scale operating mechanisms, scorecards, and executive alignment for nine-figure ARR product portfolios."
    ];

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
          full: aboutFull,
          businessCard: aboutBusinessCard,
          professional: aboutProfessional,
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
        descriptions,
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
