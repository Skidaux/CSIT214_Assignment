import {
  Gauge,
  House,
  Info,
  SignIn,
  SignOut,
  SquaresFour,
} from "@phosphor-icons/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/src/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const publicNavigation = [
  { label: "Home", path: "/", icon: House },
  { label: "About", path: "/about", icon: Info },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const navigation = isLoggedIn
    ? [
        ...publicNavigation,
        { label: "Dashboard", path: "/dashboard", icon: Gauge },
      ]
    : [
        ...publicNavigation,
        { label: "Login / Register", path: "/auth", icon: SignIn },
      ];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SquaresFour weight="bold" />
          </span>
          <span>Council Bookings</span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ label, path, icon: Icon }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    render={<NavLink to={path} />}
                    isActive={
                      path === "/" ? pathname === "/" : pathname.startsWith(path)
                    }
                  >
                    <Icon weight="duotone" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {isLoggedIn ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <SignOut weight="duotone" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
        <span className="text-xs text-muted-foreground">CSIT214 Assignment</span>
      </SidebarFooter>
    </Sidebar>
  );
}
