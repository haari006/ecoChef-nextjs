
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" className="mr-2"><path fill="#0052b4" d="M0 0h512v512H0z"/><path fill="#fff" d="m0 256 256-192v384L0 256zm512 0L256 64v384l256-192z"/><path fill="#d80027" d="M224 0h64v512h-64z"/><path fill="#d80027" d="M0 224h512v64H0z"/><path fill="#fff" d="m202 202 108 108m-108 0 108-108"/><path fill="#d80027" d="m180 180 152 152m-152 0 152-152"/></svg>
                    English
                  </Button>
                  <Button variant="outline" onClick={() => handleLanguageChange('ms')} className={`flex-1 ${language !== 'ms' ? 'opacity-50' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" className="mr-2"><path fill="#0052b4" d="M0 0h512v256H0Z"/><path fill="#d80027" d="M0 256h512v256H0Z"/><path d="M0 0v28L512 284V256l-512-28z" fill="#fff"/><path d="M0 56v28L512 312V284l-512-28z" fill="#fff"/><path d="M0 112v28L512 368V340l-512-28z" fill="#fff"/><path d="M0 168v28L512 424V396l-512-28z" fill="#fff"/><path d="M0 224v28L512 480V452l-512-28z" fill="#fff"/><path d="M512 0v28L0 284V256l512-28z" fill="#d80027"/><path d="M512 56v28L0 312V284l512-28z" fill="#d80027"/><path d="M512 112v28L0 368V340l512-28z" fill="#d80027"/><path d="M512 168v28L0 424V396l512-28z" fill="#d80027"/><path d="M512 224v28L0 480V452l512-28z" fill="#d80027"/><path fill="#ffda44" d="M202.66 128a53.33 53.33 0 1 0-37.71 91.04 64 64 0 1 1 37.71-91.04Z"/></svg>
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
