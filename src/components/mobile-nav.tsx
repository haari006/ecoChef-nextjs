
'use client';

import Link from 'next/link';
import { Leaf, LogOut, UserCog, Heart, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/app/(auth)/actions';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Separator } from './ui/separator';
import { SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { srOnly } from '@/lib/utils';

interface MobileNavProps {
    onLinkClick: () => void;
}

export function MobileNav({ onLinkClick }: MobileNavProps) {
  const { user, loading } = useAuth();
  const isAdmin = user?.uid === process.env.NEXT_PUBLIC_ADMIN_UID?.trim();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logout();
      onLinkClick();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  const handleLanguageChange = (lang: 'en' | 'ms') => {
    setLanguage(lang);
  }
  
  return (
    <div className="flex flex-col h-full">
        <SheetHeader className={srOnly}>
            <SheetTitle>{t('mobileNav.title')}</SheetTitle>
            <SheetDescription>{t('mobileNav.description')}</SheetDescription>
        </SheetHeader>
        <div className="flex items-center pb-4">
            <Link href="/" className="flex items-center space-x-2" onClick={onLinkClick}>
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">
                    EcoChef
                </span>
            </Link>
        </div>
        <Separator />
        <nav className="flex flex-col space-y-4 text-lg font-medium py-6">
            <Link href="/recipes" className="text-muted-foreground transition-colors hover:text-foreground" onClick={onLinkClick}>
                {t('header.recipes')}
            </Link>
            {user && (
                <Link href="/favorites" className="text-muted-foreground transition-colors hover:text-foreground" onClick={onLinkClick}>
                    {t('header.favorites')}
                </Link>
            )}
            {isAdmin && (
                <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground" onClick={onLinkClick}>
                    {t('header.admin')}
                </Link>
            )}
        </nav>
        
        <div className="mt-auto space-y-4">
            <Separator />
            <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('mobileNav.language')}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleLanguageChange('en')} className={`flex-1 ${language !== 'en' ? 'opacity-50' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="24" className="rounded-sm mr-2">
                        <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><clipPath id="b"><path d="M30 15h30v15H30zM0 15h30v15H0zM0 0h30v15H0zM30 0h30v15H30z"/></clipPath><g clip-path="url(#a)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#b)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g>
                    </svg>
                    English
                  </Button>
                  <Button variant="outline" onClick={() => handleLanguageChange('ms')} className={`flex-1 ${language !== 'ms' ? 'opacity-50' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 710 355" width="24" height="24" className="rounded-sm mr-2">
                        <path fill="#fff" d="M0 0h710v355H0z"/><path stroke="#c00" stroke-width="25" d="M0 38h710M0 88h710M0 138h710M0 188h710M0 238h710M0 288h710M0 338h710"/><path fill="#006" d="M0 0h355v200H0z"/><path fill="#fc0" d="M196 131l-34-19-32 22 4-37-33-22 37-1 11-37 14 36 37 4-31 24zm-22-63l-4 1-3-2v-4l4-1 3 2v4z"/><path fill="#fc0" d="M211 48a44 44 0 10-88 0 44 44 0 1088 0z"/><path fill="#006" d="M222 48a44 44 0 10-88 0 44 44 0 1088 0z"/></svg>
                    Melayu
                  </Button>
                </div>
            </div>
            
            <Separator />
            
            {loading ? (
                <div className="h-10" />
            ) : user ? (
                <Button onClick={handleLogout} variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('header.logout')}</span>
                </Button>
            ) : (
                <div className="flex flex-col gap-2">
                    <Button asChild onClick={onLinkClick}>
                        <Link href="/login" className="w-full">{t('header.login')}</Link>
                    </Button>
                    <Button variant="ghost" asChild onClick={onLinkClick}>
                        <Link href="/signup" className="w-full">{t('header.signup')}</Link>
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
}
