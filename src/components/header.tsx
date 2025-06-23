'use client';

import Link from 'next/link';
import { Leaf, LogOut, UserCog, BookOpen } from 'lucide-react';
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

export default function Header() {
  const { user, loading } = useAuth();
  const isAdmin = user?.uid === process.env.NEXT_PUBLIC_ADMIN_UID;
  
  const handleLogout = async () => {
    await logout();
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
        <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/recipes" className="text-muted-foreground transition-colors hover:text-foreground">
                Recipes
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
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
                        {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="cursor-pointer">
                                    <UserCog className="mr-2 h-4 w-4" />
                                    <span>Admin Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
