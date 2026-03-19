import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className, noPadding = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      <div className={cn(noPadding ? '' : 'p-6')}>{children}</div>
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-border', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}
