import {
  Buildings,
  Gauge,
  House,
  Info,
  SignIn,
  SignOut,
  Waves,
  Wrench,
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
  { label: "Resources", path: "/resources", icon: Buildings },
  { label: "About", path: "/about", icon: Info },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  const navigation = isLoggedIn
    ? [
        ...publicNavigation,
        { label: "Dashboard", path: "/dashboard", icon: Gauge },
        ...(user?.isEmployee
          ? [{ label: "Staff workspace", path: "/staff", icon: Wrench }]
          : []),
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
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Waves weight="bold" />
          </span>
          <span className="leading-tight">
            <span className="block">CoastLink</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Council
            </span>
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Community services</SidebarGroupLabel>
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
        <span className="text-xs text-muted-foreground">
          Connecting our coastal community
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
