"use client";

import { ChevronRightIcon, LayoutDashboard, LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SECTION_LABEL_CLASS,
  SECTION_LABEL_STYLE,
  navIconClass,
  navItemClass,
} from "./nav-styles";

type SubItem = {
  title: string;
  url?: string;
  isActive?: boolean;
  icon?: LucideIcon;
};

export type GroupNavItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SubItem[];
};

function subBtnCls(active?: boolean) {
  return [
    "relative h-7 rounded-md text-[0.775rem] transition-colors duration-150",
    "hover:bg-[rgba(10,45,135,0.06)] hover:text-[var(--blue-navy)]",
    active
      ? [
          "bg-[rgba(26,82,200,0.09)] text-[var(--blue)] font-semibold",
          "before:absolute before:left-[-9px] before:top-1/2 before:-translate-y-1/2",
          "before:h-3.5 before:w-[2px] before:rounded-r-full before:bg-[var(--blue)]",
        ].join(" ")
      : "text-[var(--text-muted)]",
  ].join(" ");
}

// ── Collapsed: icon button that opens a dropdown with sub-items ──
function CollapsedGroupItem({ item }: { item: GroupNavItem }) {
  const Icon = item.icon ?? LayoutDashboard;
  const hasChildren = item.items && item.items.length > 0;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={item.isActive}
          className={`size-8 justify-center p-0 ${navItemClass(item.isActive)}`}
        >
          <Link href={item.url ?? "#"}>
            <Icon className={navIconClass(item.isActive)} />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={item.isActive}
            className={`size-8 justify-center p-0 ${navItemClass(item.isActive)}`}
          >
            <Icon className={navIconClass(item.isActive)} />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={12}
          className="w-52 rounded-xl p-1.5 shadow-xl"
          style={{
            border: "1px solid rgba(10,45,135,0.1)",
            boxShadow:
              "0 12px 40px rgba(10,45,135,0.14), 0 2px 8px rgba(10,45,135,0.06)",
            background: "white",
          }}
        >
          <DropdownMenuLabel className="px-2 pt-0.5 pb-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "rgba(10,45,135,0.07)" }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--blue)" }}
                />
              </div>
              <span
                className="text-[0.8rem] font-semibold"
                style={{ color: "var(--text-main)" }}
              >
                {item.title}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator
            className="my-1"
            style={{ background: "rgba(10,45,135,0.07)" }}
          />
          {item.items!.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <DropdownMenuItem
                key={sub.title}
                asChild
                className={[
                  "rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-150",
                  "focus:bg-[rgba(10,45,135,0.07)]",
                  sub.isActive
                    ? "bg-[rgba(26,82,200,0.09)] text-[var(--blue)]"
                    : "",
                ].join(" ")}
              >
                <Link href={sub.url ?? "#"}>
                  <div className="flex items-center gap-2.5 w-full">
                    {SubIcon && (
                      <SubIcon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{
                          color: sub.isActive
                            ? "var(--blue)"
                            : "var(--text-faint)",
                        }}
                      />
                    )}
                    <span
                      className={[
                        "text-[0.8125rem]",
                        sub.isActive
                          ? "font-semibold text-[var(--blue)]"
                          : "font-medium text-[var(--text-muted)]",
                      ].join(" ")}
                    >
                      {sub.title}
                    </span>
                    {sub.isActive && (
                      <div
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--blue)" }}
                      />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

export function NavGroups({
  items,
  label,
}: {
  items: GroupNavItem[];
  label?: string;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // ── COLLAPSED VIEW ───────────────────────────────────────
  if (isCollapsed) {
    return (
      <SidebarGroup className="px-2 py-1">
        <SidebarMenu className="gap-0.5 items-center">
          {items.map((item) => (
            <CollapsedGroupItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // ── EXPANDED VIEW ────────────────────────────────────────
  return (
    <SidebarGroup className="px-2 py-1.5">
      {label && (
        <div className={SECTION_LABEL_CLASS} style={SECTION_LABEL_STYLE}>
          {label}
        </div>
      )}

      <SidebarMenu className="gap-0.5">
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    className={navItemClass(item.isActive)}
                  >
                    {item.icon ? (
                      <item.icon className={navIconClass(item.isActive)} />
                    ) : (
                      <LayoutDashboard className={navIconClass()} />
                    )}
                    <span className="truncate">{item.title}</span>
                    <ChevronRightIcon
                      className={[
                        "ml-auto !size-3 shrink-0 transition-transform duration-200",
                        "group-data-[state=open]/collapsible:rotate-90",
                        item.isActive
                          ? "text-[var(--blue)]"
                          : "text-[var(--text-faint)]",
                      ].join(" ")}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub
                    className="ml-3.5 gap-0 border-l pl-2"
                    style={{ borderColor: "rgba(10,45,135,0.12)" }}
                  >
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={subItem.isActive}
                          className={subBtnCls(subItem.isActive)}
                        >
                          <Link href={subItem.url ?? "#"}>
                            {subItem.icon && (
                              <subItem.icon className="!size-3 shrink-0" />
                            )}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className={navItemClass(item.isActive)}
              >
                <Link href={item.url ?? "#"}>
                  {item.icon ? (
                    <item.icon className={navIconClass(item.isActive)} />
                  ) : (
                    <LayoutDashboard className={navIconClass()} />
                  )}
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
