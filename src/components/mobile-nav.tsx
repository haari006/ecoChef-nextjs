
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
import { Flag } from 'react-flag-kit';


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
                    <Flag country="GB" className="mr-2" />
                    English
                  </Button>
                  <Button variant="outline" onClick={() => handleLanguageChange('ms')} className={`flex-1 ${language !== 'ms' ? 'opacity-50' : ''}`}>
                    <Flag country="MY" className="mr-2" />
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
