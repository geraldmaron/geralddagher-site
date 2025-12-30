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
                "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden",
                className
            )}
            {...props}
        >
            <div className={cn(noPadding ? "" : "p-6")}>
                {children}
            </div>
        </div>
    );
}

export function CardHeader({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "px-6 py-4 border-b border-gray-100 dark:border-neutral-800",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "text-lg font-semibold text-gray-900 dark:text-white",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn(
                "text-sm text-gray-500 dark:text-gray-400 mt-1",
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
