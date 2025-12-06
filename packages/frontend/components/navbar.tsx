'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth, type User } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { ProfileModal } from '@/components/profile-modal'

function LoggedInNavbar({ user, logout }: { user: User; logout: () => void }) {
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const pathname = usePathname()
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            {pathname !== '/timeline' && <>
              <Link href="/timeline" legacyBehavior passHref>
                <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Timeline
                </NavigationMenuLink>
              </Link>
            </>
            }
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 bottom-0 outline-none focus:outline-none">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user.fullName} />
              <AvatarFallback className="text-xs">
                {user.initials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-1 max-w-[150px]">
              <span className="text-sm font-medium leading-none truncate w-full">@{user.username}</span>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 h-4">
                {user.role}
              </Badge>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
            Update Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => logout()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
    </>
  )
}

function UnauthenticatedNavbar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/login" legacyBehavior passHref>
            <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
              Sign In
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/register" legacyBehavior passHref>
            <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
              Sign Up
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function RightButtonsNavbar({ user, logout }: { user: User | null; logout: () => void }) {
  if (user) {
    return <LoggedInNavbar user={user} logout={logout} />
  }
  return <UnauthenticatedNavbar />
}

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/home" className="text-xl font-bold">
          Social Project
        </Link>
        <div className="flex items-center gap-4">
          <RightButtonsNavbar user={user} logout={logout} />
        </div>
      </div>
    </nav>
  )
}

