import Image from 'next/image';
import { Code2, Github, Linkedin, Mail, Sparkles } from 'lucide-react';
import {BASE_URL} from "@/app/lib/constant";

type LinkProps = {
    label: string;
    href: string;
    type: string
    isExternal?: boolean;
}

type AvatarImageProps = {
    url: string;
    alternativeText: string;
}

type HeroSectionProps = {
    textSecondaryClass: string;
    cardBgClass: string;
    cardHoverClass: string;
    title: string;
    subtitle: string;
    description: string;
    socialNetworkLinks?: LinkProps[];
    avatarImage?: AvatarImageProps;
};

export function  HeroSection(
    {
        textSecondaryClass,
        cardBgClass,
        cardHoverClass,
        title,
        subtitle,
        description,
        socialNetworkLinks,
        avatarImage
    }: HeroSectionProps) {
    return (
        <header id="overview" className="mb-24 mt-16 scroll-mt-32">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                        <div className="relative">
                            <div className="w-20 h-20 bg-linear-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                            <div className="absolute inset-0 w-20 h-20 bg-linear-to-br from-pink-500 via-purple-500 to-cyan-400 rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500 flex items-center justify-center">
                                <Code2 className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-5xl sm:text-6xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {title}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                                <p className={`text-xl ${textSecondaryClass}`}>
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`text-lg ${textSecondaryClass} max-w-3xl leading-relaxed mb-8 ${cardBgClass} p-6 rounded-2xl border`}
                        dangerouslySetInnerHTML={{ __html: description }}
                    ></div>

                    <div className="flex flex-wrap gap-4">
                        {socialNetworkLinks?.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target={link.isExternal ? '_blank' : '_self'}
                                rel={link.isExternal ? 'noopener noreferrer' : undefined}
                                className={`group flex items-center gap-2 px-6 py-3 ${cardBgClass} ${link.type == "email"  ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white" : " "} rounded-xl border ${cardHoverClass} transition-all duration-300 hover:scale-105`}
                            >
                                { link.type === 'github' && <Github className="w-5 h-5" /> }
                                { link.type === 'linkedin' && <Linkedin className="w-5 h-5" /> }
                                { link.type === 'email' && <Mail className="w-5 h-5" /> }

                                <span className="font-semibold">{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <div
                        className={`relative overflow-hidden ${cardBgClass}`}
                        style={{
                            width: '330px',
                            height: '330px',
                            clipPath:
                                "path('M73.7 18.2C108.3 -3.5 156.8 -6.2 195.4 16.4C234.1 39 262.9 84.9 268.4 129.1C273.9 173.2 256.1 215.5 226.3 248.5C196.6 281.5 154.9 305 114.2 297.7C73.6 290.3 33.9 252.2 16.5 210.7C-0.8 169.1 3.1 124.2 22.9 86.6C42.7 49 59.1 39.9 73.7 18.2Z')",
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: `0 12px 28px rgba(0,0,0,0.28), inset 0 0 12px rgba(255,255,255,0.18)`,
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <img
                            src={`${BASE_URL}${avatarImage?.url}`}
                            alt="Profile"
                            className="object-cover"
                            style={{ clipPath: 'inherit' }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

