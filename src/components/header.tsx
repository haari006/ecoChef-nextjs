
'use client';

import Link from 'next/link';
import { Leaf, LogOut, UserCog, Heart, Languages, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/app/(auth)/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useState } from 'react';
import { MobileNav } from './mobile-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { FlagIcon } from 'react-flag-kit';


export default function Header() {
  const { user, loading } = useAuth();
  const isAdmin = user?.uid === process.env.NEXT_PUBLIC_ADMIN_UID?.trim();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  const handleLanguageChange = (lang: 'en' | 'ms') => {
    setLanguage(lang);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg sm:inline-block">
            EcoChef
          </span>
        </Link>
        <nav className="hidden items-center space-x-4 text-sm font-medium md:flex">
            <Link href="/recipes" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('header.recipes')}
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleLanguageChange('en')} className={`${language !== 'en' ? 'opacity-50' : ''}`}>
                <FlagIcon code="GB" size={24} />
                <span className="sr-only">Switch to English</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleLanguageChange('ms')} className={`${language !== 'ms' ? 'opacity-50' : ''}`}>
                <FlagIcon code="MY" size={24} />
                <span className="sr-only">Switch to Bahasa Melayu</span>
              </Button>
            </div>
          <nav className="hidden items-center md:flex">
            {loading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
            ) : user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                <AvatarFallback>{user.displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/favorites" className="cursor-pointer">
                                <Heart className="mr-2 h-4 w-4" />
                                <span>{t('header.favorites')}</span>
                            </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="cursor-pointer">
                                    <UserCog className="mr-2 h-4 w-4" />
                                    <span>{t('header.admin')}</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t('header.logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">{t('header.login')}</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">{t('header.signup')}</Link>
                    </Button>
                </>
            )}
          </nav>
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                        <span className="sr-only">Open navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <MobileNav onLinkClick={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
