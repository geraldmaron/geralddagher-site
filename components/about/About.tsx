'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { DOMAIN_SECTIONS } from './aboutTypes';
import StatCards from './StatCards';
import JourneyCards from './JourneyCards';
import SkillCloud from './SkillCloud';
import ProfessionalDrawer from './ProfessionalDrawer';
import PersonalDrawer from './PersonalDrawer';
import PolaroidGallery from './PolaroidGallery';
import ScrollReveal from '@/components/core/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/core/ScrollReveal';

const AboutSection: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [currentKeyword, setCurrentKeyword] = useState(0);
  const [isProfessionalOpen, setIsProfessionalOpen] = useState(false);
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});

  const keywords = personalInfo?.profile?.keywords || [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setPersonalInfo(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/company-logos');
        if (!response.ok) {
          throw new Error('Failed to fetch company logos');
        }
        const data = await response.json();
        setCompanyLogos(data.data || {});
      } catch (error) {
        console.error('Error fetching company logos:', error);
      }
    };
    fetchLogos();
  }, []);

  useEffect(() => {
    if (keywords.length < 2) return;
    const interval = setInterval(() => {
      setCurrentKeyword((prev) => (prev + 1) % keywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [keywords.length]);

  return (
    <section
      role="region"
      aria-label="About me"
      data-area="about"
      className="relative w-full py-16 md:py-24"
    >
      <div className="max-w-5xl mx-auto">
        <div className="space-y-20">
          {/* Hero header */}
          <ScrollReveal preset="fade-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground border border-border">
                <MapPin className="w-3.5 h-3.5" />
                {personalInfo?.profile?.location}
              </div>

              <div className="space-y-3">
                <h1
                  className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white [overflow:visible] pb-2"
                  style={{ fontFamily: 'var(--font-display)', lineHeight: '1.25' }}
                >
                  About <em><span className="galaxy-text">Me</span></em>
                </h1>

                <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400">
                  <span>I&apos;m {keywords[currentKeyword] && ['A', 'E', 'I', 'O', 'U'].includes(keywords[currentKeyword][0]) ? 'an' : 'a'}</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentKeyword}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="font-semibold text-gray-900 dark:text-white"
                    >
                      {keywords[currentKeyword] === 'Ally' ? (
                        <span className="inline-flex">
                          <span className="animate-pulse text-red-500 dark:text-red-400">A</span>
                          <span className="animate-pulse text-orange-500 dark:text-orange-400" style={{ animationDelay: '0.1s' }}>l</span>
                          <span className="animate-pulse text-green-500 dark:text-green-400" style={{ animationDelay: '0.2s' }}>l</span>
                          <span className="animate-pulse text-blue-500 dark:text-blue-400" style={{ animationDelay: '0.3s' }}>y</span>
                        </span>
                      ) : (
                        keywords[currentKeyword]
                      )}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {personalInfo?.profile?.about?.businessCard || ''}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal preset="fade-up" delay={0.1}>
            <PolaroidGallery />
          </ScrollReveal>

          <ScrollReveal preset="fade-up" delay={0.15}>
            <StatCards />
          </ScrollReveal>

          <ScrollReveal preset="fade-up" delay={0.1}>
            <JourneyCards
              onOpenProfessional={() => setIsProfessionalOpen(true)}
              onOpenPersonal={() => setIsPersonalOpen(true)}
              personalInfo={personalInfo}
            />
          </ScrollReveal>

          <ScrollReveal preset="fade-up" delay={0.1}>
            <SkillCloud domainSections={DOMAIN_SECTIONS} />
          </ScrollReveal>
        </div>
      </div>

      <ProfessionalDrawer
        isOpen={isProfessionalOpen}
        onClose={() => setIsProfessionalOpen(false)}
        personalInfo={personalInfo}
        companyLogos={companyLogos}
      />

      <PersonalDrawer
        isOpen={isPersonalOpen}
        onClose={() => setIsPersonalOpen(false)}
        personalInfo={personalInfo}
      />
    </section>
  );
};

export default React.memo(AboutSection);
