'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '@/lib/directus/utils/avatar';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Rss,
  LogIn,
  Menu,
  X,
  Mic,
  User,
  Mail,
  LayoutDashboard,
  FileText,
  Tag,
  FolderTree,
  Users,
  Image as ImageIcon,
  Inbox,
  Search,
  Plus,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from 'lucide-react';
import { useTheme } from '@/components/core/ThemeProvider';
import { useAuth } from '@/lib/auth/provider';
import { hasAdminAccess } from '@/lib/auth/client-groups';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';
import SubscriptionModal from '@/components/SubscriptionModal';

// Navigation configuration
type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  publicOnly?: boolean;
};

const publicNavigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'The Maron Project', href: '/themaronproject', icon: Mic },
  { name: 'RSS', href: '/rss', icon: Rss },
];

const adminNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Tags', href: '/admin/tags', icon: Tag },
  { name: 'Assets', href: '/admin/assets', icon: ImageIcon },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'TMP', href: '/admin/tmp-submissions', icon: Inbox },
];

const NavLink: React.FC<{ 
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
}> = ({ item, isActive, onClick, variant = 'desktop' }) => {
  const Icon = item.icon;
  
  if (variant === 'mobile') {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
          isActive
            ? 'bg-blue-500 text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          'relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200',
          'group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isActive
            ? 'bg-white/80 dark:bg-gray-800/80 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-gray-100'
            : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { isDarkMode, themeMode, setThemeMode } = useTheme();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine if we're in admin area
  const isAdminArea = pathname.startsWith('/admin');
  const isAuthenticated = !!user;
  const hasAdmin = user && hasAdminAccess(user);
  
  // Logo source based on theme
  const [logoSrc, setLogoSrc] = useState('/Dagher_Logo_2024.png');
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setLogoSrc(isDarkMode ? '/Dagher_Logo_2024_WH.png' : '/Dagher_Logo_2024.png');
  }, [isDarkMode]);
  
  // Navigation items based on context
  const navigationItems = useMemo(() => {
    if (isAdminArea && hasAdmin) {
      return adminNavigation;
    }
    // Include admin link in public navigation if user has admin access
    if (hasAdmin) {
      return [...publicNavigation, { name: 'Admin', href: '/admin', icon: LayoutDashboard, adminOnly: true }];
    }
    return publicNavigation;
  }, [isAdminArea, hasAdmin]);
  
  const isActivePath = (href: string) => {
    if (href === '/admin') return pathname === href;
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      if (isAdminArea) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <>
      {/* Main Navigation Header */}
      <motion.header
        role="banner" 
        className={cn(
          'fixed top-0 w-full transition-all duration-500 ease-out z-50',
          'border-b border-gray-200/50 dark:border-gray-800/50'
        )}
        style={{ zIndex: zIndex.navbar }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <motion.div
          className={cn(
            'w-full transition-all duration-500 ease-out',
            isScrolled 
              ? 'bg-white/95 dark:bg-black/95 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20' 
              : 'bg-white/90 dark:bg-black/90'
          )}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <nav className="h-16 lg:h-20 w-full px-2 sm:px-4 lg:px-6">
            <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
              
              {/* Logo */}
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link 
                  href="/"
                  aria-label="Home" 
                  className={cn(
                    'flex items-center space-x-3 group focus:outline-none focus:ring-2',
                    'focus:ring-blue-500 rounded-lg p-1 transition-all duration-200'
                  )}
                >
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Image
                      src={logoSrc}
                      alt="Dagher Logo 2024"
                      fill
                      priority
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
                      className="transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    item={item}
                    isActive={isActivePath(item.href)}
                  />
                ))}                
              </div>

              {/* Right Side Actions */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Admin Search Bar */}
                {isAdminArea && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        'pl-10 pr-4 py-2 w-48 rounded-xl text-sm',
                        'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                        'backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-all duration-200'
                      )}
                    />
                  </div>
                )}

                {/* Theme Toggle - Available for all users */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const nextMode = themeMode === 'system' ? 'light' : themeMode === 'light' ? 'dark' : 'system';
                    setThemeMode(nextMode);
                  }}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                    'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                    'hover:bg-white/70 dark:hover:bg-gray-800/70',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                  aria-label={`Current theme: ${themeMode}. Click to cycle between themes.`}
                >
                  {themeMode === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
                  {themeMode === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
                  {themeMode === 'system' && <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                </motion.button>
                
                {/* Quick Actions */}
                {isAdminArea && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/admin/posts/new')}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-xl',
                      'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200',
                      'text-white dark:text-gray-900 font-medium text-sm',
                      'transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                  </motion.button>
                )}

                {/* Auth / User Menu */}
                {isAuthenticated ? (
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-xl',
                        'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                        'hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500'
                      )}
                    >
                      {user?.avatar_url ? (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <img
                            src={getAvatarUrl(user.avatar_url || '', { width: 24, height: 24, fit: 'cover', quality: 80 }) || ''}
                            alt={user.name || user.email}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className={cn(
                            'absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-xl',
                            'bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl',
                            'border border-gray-200/50 dark:border-gray-700/50',
                            'py-2 z-50'
                          )}
                        >
                          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Signed in as
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>

                          <div className="py-2">
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Theme
                              </p>
                            </div>
                            {themeOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setThemeMode(option.value as any);
                                    setIsUserMenuOpen(false);
                                  }}
                                  className={cn(
                                    'w-full flex items-center space-x-3 px-4 py-2 text-sm',
                                    'hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors',
                                    themeMode === option.value
                                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                      : 'text-gray-700 dark:text-gray-300'
                                  )}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span>{option.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
                            {!isAdminArea && hasAdmin && (
                              <Link
                                href="/admin"
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Admin Dashboard</span>
                              </Link>
                            )}
                            {isAdminArea && (
                              <Link
                                href="/"
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Home className="w-4 h-4" />
                                <span>Visit Site</span>
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : !loading && (
                  <>
                    <motion.button 
                      onClick={() => router.push('/login')}
                      className={cn(
                        'flex items-center px-4 py-2 rounded-xl transition-all duration-200',
                        'hover:bg-white/50 dark:hover:bg-gray-800/50',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white',
                        'font-medium text-sm'
                      )}
                      aria-label="Sign in"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      <span>Sign in</span>
                    </motion.button>

                    {!isAdminArea && (
                      <button
                        onClick={() => setSubscriptionModalOpen(true)}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-xl transition-all duration-200',
                          'hover:bg-white/50 dark:hover:bg-gray-800/50',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400',
                          'font-medium text-sm'
                        )}
                        aria-label="Subscribe to updates"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}

                {/* Mobile Menu Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    'md:hidden flex items-center justify-center w-10 h-10 rounded-xl',
                    'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
                    'hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </nav>
        </motion.div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className={cn(
                'fixed top-16 right-0 bottom-0 z-50 w-full sm:w-96 md:hidden',
                'bg-white/95 dark:bg-black/95 backdrop-blur-xl',
                'border-l border-gray-200/50 dark:border-gray-800/50',
                'flex flex-col'
              )}
            >
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {isAdminArea ? 'Admin Menu' : 'Navigation'}
                  </h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      item={item}
                      isActive={isActivePath(item.href)}
                      variant="mobile"
                      onClick={() => setIsMenuOpen(false)}
                    />
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 px-4">
                    Theme
                  </p>
                  <div className="space-y-1">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setThemeMode(option.value as any)}
                          className={cn(
                            'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                            themeMode === option.value
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <div className="p-6 border-t border-gray-200/50 dark:border-gray-800/50">
                  <div className="flex items-center space-x-3 mb-4">
                    {user?.avatar_url ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={getAvatarUrl(user.avatar_url, { width: 32, height: 32, fit: 'cover', quality: 80 }) || ''}
                          alt={user.name || user.email}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </>
  );
}