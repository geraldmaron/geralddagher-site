"use client";
import React from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  MapPin,
  Building2,
  Linkedin,
  Github,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Download,
  Copy,
  X,
  FileText,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ResumeModal from "./ResumeModal";

export interface BusinessCardProfile {
  name: string;
  title: string;
  company: string;
  location: string;
  links: {
    email: string;
    website: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  about: {
    businessCard: string;
    professional?: string;
  };
  keywords: string[];
  descriptions: string[];
  maritalStatus?: string;
  kids?: string;
  pets?: string;
  hometown?: string;
}

export interface BusinessCardProps {
  profile: BusinessCardProfile;
  onClose?: () => void;
  standalone?: boolean;
  inModal?: boolean;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  profile,
  onClose,
  standalone = false,
  inModal = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const handleVCard = () => {
    setSaving(true);
    try {
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${profile.name}`,
        `TITLE:${profile.title} at ${profile.company}`,
        `EMAIL:${profile.links.email}`,
        `URL:${profile.links.website}`,
        "END:VCARD",
      ].join("\n");

      const blob = new Blob([vcard], { type: "text/vcard" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${profile.name.replace(/ /g, "").toLowerCase()}.vcf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const socialLinks = [
    { key: "linkedin", icon: Linkedin, label: "LinkedIn", href: profile.links.linkedin },
    { key: "github", icon: Github, label: "GitHub", href: profile.links.github },
    { key: "twitter", icon: Twitter, label: "Twitter", href: profile.links.twitter },
    { key: "instagram", icon: Instagram, label: "Instagram", href: profile.links.instagram },
    { key: "youtube", icon: Youtube, label: "YouTube", href: profile.links.youtube },
    { key: "facebook", icon: Facebook, label: "Facebook", href: profile.links.facebook },
  ].filter((link) => link.href);

  const infoItems = [
    {
      icon: Mail,
      label: profile.links.email,
      href: `mailto:${profile.links.email}`,
    },
    {
      icon: Globe,
      label: profile.links.website,
      href: profile.links.website,
    },
    {
      icon: Building2,
      label: `${profile.title} • ${profile.company}`,
    },
    {
      icon: MapPin,
      label: profile.location,
    },
  ].filter((item) => Boolean(item.label));

  const familyValue = profile.maritalStatus && profile.kids 
    ? `${profile.maritalStatus} ${profile.kids}`.trim()
    : profile.maritalStatus || profile.kids || 'Married, 2 boys';

  const personalDetails = [
    { label: "Family", value: familyValue },
    { label: "Hometown", value: profile.hometown },
    { label: "Location", value: profile.location },
    { label: "Pets", value: profile.pets },
  ].filter((item) => Boolean(item.value));

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasDuplicateText = profile.about.professional && 
    profile.about.professional.trim() === profile.about.businessCard.trim();

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-amber-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-[0_20px_80px_-24px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/70 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="relative p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-emerald-400/30 blur-md opacity-60" />
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-white/60 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.5)]">
                <Image
                  src="/Dagher_Headshot_3.png"
                  alt={`${profile.name} headshot`}
                  fill
                  sizes="(max-width: 768px) 96px, 112px"
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/NYCSubway.jpg";
                  }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 font-semibold">
                    Product Leadership | AI/Platform Strategy
                  </p>
                  <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white leading-tight">
                    {profile.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{profile.title}</span>
                    <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
                    <span className="text-neutral-700 dark:text-neutral-300">{profile.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.keywords.slice(0, 5).map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 text-[11px] font-semibold tracking-wide border border-neutral-200/70 dark:border-neutral-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {infoItems.map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href || "#"}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/60 px-3 py-2.5 shadow-sm hover:border-blue-500/60 dark:hover:border-blue-400/60 hover:-translate-y-0.5 transition-all"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
              {profile.about.businessCard}
            </p>
            {profile.about.professional && !hasDuplicateText && (
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {profile.about.professional}
              </p>
            )}
          </div>

          {profile.descriptions?.length ? (
            <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-900/60 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                Focus areas
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.descriptions.slice(0, 4).map((description) => (
                  <div
                    key={description}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {personalDetails.length ? (
            <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/60 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                Personal
              </p>
              <div className="grid grid-cols-2 gap-2">
                {personalDetails.map(({ label, value }) => (
                  <div
                    key={label}
                    className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-500">{label}</div>
                    <div className="text-xs text-gray-900 dark:text-white mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 border border-dashed border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-3 bg-white/50 dark:bg-neutral-900/60">
              {socialLinks.map(({ key, icon: Icon, label, href }) => (
                <Link
                  key={key}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200/80 dark:hover:border-blue-800/80 transition-all"
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              onClick={handleVCard}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              {saving ? <Download className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
              Save contact
            </button>
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:border-blue-400/60 hover:-translate-y-0.5 transition-all"
            >
              <FileText className="w-4 h-4" />
              Resume
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-4 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:border-blue-400/60 hover:-translate-y-0.5 transition-all"
              aria-label="Copy contact information"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy profile"}
            </button>
          </div>
        </div>
      </div>
      {isMounted && isResumeModalOpen && createPortal(
        <ResumeModal
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default BusinessCard;
