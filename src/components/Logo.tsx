'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
    href?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Logo({ href = '/', size = 'md', className = '' }: LogoProps) {
    const sizeMap = {
        sm: { width: 120, height: 36 },
        md: { width: 140, height: 42 },
        lg: { width: 168, height: 50 },
    };

    const dimensions = sizeMap[size];

    const content = (
        <Image
            src="/images/Lexiassist Logo.svg"
            alt="LexiAssist Logo"
            width={dimensions.width}
            height={dimensions.height}
            priority
            className={className}
        />
    );

    if (href) {
        return (
            <Link href={href} className="flex-shrink-0">
                {content}
            </Link>
        );
    }

    return content;
}
