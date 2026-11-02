/**
 * Client sidebar — client-only nav subset with active highlighting via useLocation.
 * Plain string className (not function) to avoid Slot conflicts.
 */

import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Building2, BarChart3, TrendingUp, ShoppingCart, LayoutDashboard,
  ScrollText, Settings, BookOpen, ChevronRight, Activity,
  FlaskConical, LineChart, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/client";

export function ClientSidebar() {
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const collapsed = state === "collapsed";

  const isPath = (path: string) => {
    if (path === "") return pathname === BASE;
    const full = `${BASE}/${path}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  const activeCls = "bg-primary text-primary-foreground font-medium";
  const idleCls = "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const parentActiveCls = "text-primary font-medium";
  const parentIdleCls = "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  const strategyActive = isPath("strategy");

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-sidebar-foreground leading-none">TAH Analyser</p>
                <p className="text-xs text-muted-foreground mt-0.5">My Account</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={BASE} end className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("") ? activeCls : idleCls)}>
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Brokers */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/brokers`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("brokers") ? activeCls : idleCls)}>
                    <Building2 className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Brokers</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Indicators */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/indicators`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("indicators") ? activeCls : idleCls)}>
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Indicators</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Strategy group */}
              {!collapsed && (
                <Collapsible defaultOpen={strategyActive} className="group/strategy">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <button className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", strategyActive ? parentActiveCls : parentIdleCls)}>
                        <Activity className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left">Strategy</span>
                        <ChevronRight className="w-3 h-3 transition-transform group-data-[state=open]/strategy:rotate-90" />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Backtest (sibling of Thread) */}
                        <SidebarMenuSubItem>
                          <Collapsible defaultOpen={isPath("strategy/backtest")} className="group/backtest">
                            <CollapsibleTrigger asChild>
                              <button className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("strategy/backtest") ? parentActiveCls : parentIdleCls)}>
                                <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                                <span className="flex-1 text-left">Backtest</span>
                                <ChevronRight className="w-3 h-3 transition-transform group-data-[state=open]/backtest:rotate-90" />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="pl-3">
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink to={`${BASE}/strategy/backtest/dashboard`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("strategy/backtest/dashboard") ? activeCls : idleCls)}>
                                      <LayoutDashboard className="w-3 h-3 shrink-0" />
                                      <span>Dashboard</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink to={`${BASE}/strategy/backtest/tests`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("strategy/backtest/tests") ? activeCls : idleCls)}>
                                      <FlaskConical className="w-3 h-3 shrink-0" />
                                      <span>Tests</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink to={`${BASE}/strategy/backtest/strategies`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("strategy/backtest/strategies") ? activeCls : idleCls)}>
                                      <TrendingUp className="w-3 h-3 shrink-0" />
                                      <span>Strategies</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuSubItem>

                        {/* Thread (sibling of Backtest, after, with separator) */}
                        <SidebarMenuSubItem className="mt-1 pt-1 border-t border-sidebar-border/40">
                          <SidebarMenuSubButton asChild>
                            <NavLink to={`${BASE}/strategy/thread`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("strategy/thread") ? activeCls : idleCls)}>
                              <LineChart className="w-3.5 h-3.5 shrink-0" />
                              <span>Thread</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Orders & Positions */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/orders-positions`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("orders-positions") ? activeCls : idleCls)}>
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Orders & Positions</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Tradeboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/tradeboard`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("tradeboard") ? activeCls : idleCls)}>
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Tradeboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Logs */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/logs`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("logs") ? activeCls : idleCls)}>
                    <ScrollText className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Logs</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/settings`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("settings") ? activeCls : idleCls)}>
                    <Settings className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Credits */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/credits`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("credits") ? activeCls : idleCls)}>
                    <CreditCard className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Credits</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Tutorial */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={`${BASE}/tutorial`} className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors", isPath("tutorial") ? activeCls : idleCls)}>
                    <BookOpen className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Tutorial</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
