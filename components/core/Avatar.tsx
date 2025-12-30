import Image from 'next/image';
import { getAvatarUrl, getInitials } from '@/lib/directus/utils/avatar';

interface AvatarProps {
  avatarId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: {
    container: 'h-6 w-6',
    text: 'text-xs',
    image: 24
  },
  sm: {
    container: 'h-8 w-8',
    text: 'text-sm',
    image: 32
  },
  md: {
    container: 'h-10 w-10',
    text: 'text-base',
    image: 40
  },
  lg: {
    container: 'h-12 w-12',
    text: 'text-lg',
    image: 48
  },
  xl: {
    container: 'h-16 w-16',
    text: 'text-xl',
    image: 64
  }
};

export function Avatar({
  avatarId,
  firstName,
  lastName,
  email,
  size = 'md',
  className = ''
}: AvatarProps) {
  const avatarUrl = getAvatarUrl(avatarId, {
    width: sizeMap[size].image * 2,
    height: sizeMap[size].image * 2,
    fit: 'cover',
    quality: 80
  });

  const initials = getInitials(firstName, lastName, email);
  const { container, text, image } = sizeMap[size];

  if (avatarUrl) {
    return (
      <div className={`relative ${container} rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 ${className}`}>
        <Image
          src={avatarUrl}
          alt={`${firstName || ''} ${lastName || ''}`.trim() || 'User avatar'}
          fill
          className="object-cover"
          sizes={`${image}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${container} rounded-full
        flex items-center justify-center
        bg-gradient-to-br from-blue-500 to-purple-600
        text-white font-semibold ${text}
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
