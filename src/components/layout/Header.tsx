import { Bell, User, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  credits: number;
}

export function Header({ credits }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
      </div>

      <div className="flex items-center gap-4">
        {/* Credits Display */}
        <Link to="/credits">
          <Button variant="outline" size="sm" className="gap-2">
            <Coins className="w-4 h-4 text-warning" />
            <span className="font-medium">{credits.toLocaleString()}</span>
            <Badge variant="secondary" className="text-xs">Credits</Badge>
          </Button>
        </Link>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
          >
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}