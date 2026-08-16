// components/sidebar/nav-team-projects.tsx
// Dynamic "Proyek" accordion for the sidebar — lists every draft/active
// project (grouped by status), hides completed/archived ones, and links to
// the projects list page. Distinct from nav-projects.tsx (the LMS "Program"
// recent-items widget) despite the similar name.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRightIcon,
  FolderKanban,
  FolderPlus,
  LayoutGrid,
  PlayCircle,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { navIconClass, navItemClass } from "./nav-styles";
import { trpc } from "@/lib/trpc/client";

const STATUS_SECTIONS = [
  { status: "active" as const, label: "Aktif", icon: PlayCircle },
  { status: "draft" as const, label: "Draft", icon: FolderPlus },
];

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

function ProjectTaskBadge({ done, total }: { done: number; total: number }) {
  if (total === 0) return null;

  return (
    <span
      className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
      style={{ background: "rgba(26,82,200,0.09)", color: "var(--blue)" }}
    >
      {done}/{total}
    </span>
  );
}

// ── Collapsed sidebar: icon button that opens a dropdown ──
function CollapsedNavTeamProjects({
  visibleProjects,
  isLoading,
  isActive,
  canCreate,
}: {
  visibleProjects: Array<{
    id: string;
    name: string;
    status: string;
    taskCount: number;
    doneTaskCount: number;
  }>;
  isLoading: boolean;
  isActive: boolean;
  canCreate: boolean;
}) {
  return (
    <SidebarGroup className="px-2 py-0.5">
      <SidebarMenu className="gap-0.5">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                tooltip="Proyek"
                isActive={isActive}
                className={`relative size-8 justify-center p-0 ${navItemClass(isActive)}`}
              >
                <FolderKanban className={navIconClass(isActive)} />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={12}
              className="w-64 rounded-xl p-1.5 shadow-xl"
              style={{
                border: "1px solid rgba(10,45,135,0.1)",
                boxShadow:
                  "0 12px 40px rgba(10,45,135,0.14), 0 2px 8px rgba(10,45,135,0.06)",
                background: "white",
              }}
            >
              {visibleProjects.length === 0 ? (
                <div className="px-2.5 py-3 text-center text-[0.78rem] text-[var(--text-faint)]">
                  {isLoading ? "Memuat proyek…" : "Belum ada proyek aktif"}
                </div>
              ) : (
                STATUS_SECTIONS.map(({ status, label, icon: SectionIcon }) => {
                  const items = visibleProjects.filter((p) => p.status === status);
                  if (items.length === 0) return null;

                  return (
                    <div key={status} className="mb-1 last:mb-0">
                      <DropdownMenuLabel className="flex items-center gap-1.5 px-2 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
                        <SectionIcon className="size-3" />
                        {label}
                      </DropdownMenuLabel>
                      {items.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          asChild
                          className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-[rgba(10,45,135,0.07)]"
                        >
                          <Link href={`/dashboard/projects/${project.id}`}>
                            <div className="flex w-full items-center gap-2">
                              <span className="flex-1 truncate text-[0.8125rem] font-medium text-[var(--text-main)]">
                                {project.name}
                              </span>
                              <ProjectTaskBadge
                                done={project.doneTaskCount}
                                total={project.taskCount}
                              />
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  );
                })
              )}

              <DropdownMenuSeparator
                className="my-1"
                style={{ background: "rgba(10,45,135,0.07)" }}
              />

              <DropdownMenuItem
                asChild
                className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-[rgba(10,45,135,0.07)]"
              >
                <Link href="/dashboard/projects" className="flex items-center gap-2.5">
                  <LayoutGrid className="size-3.5 shrink-0" style={{ color: "var(--blue)" }} />
                  <span className="text-[0.8rem] font-semibold" style={{ color: "var(--blue)" }}>
                    Lihat Semua Proyek
                  </span>
                </Link>
              </DropdownMenuItem>

              {canCreate && (
                <DropdownMenuItem
                  asChild
                  className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-[rgba(10,45,135,0.07)]"
                >
                  <Link href="/dashboard/projects?create=1" className="flex items-center gap-2.5">
                    <FolderPlus
                      className="size-3.5 shrink-0"
                      style={{ color: "var(--text-faint)" }}
                    />
                    <span className="text-[0.8rem] font-medium text-[var(--text-muted)]">
                      Buat Proyek Baru
                    </span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavTeamProjects({
  enabled,
  canCreate,
}: {
  enabled: boolean;
  canCreate: boolean;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const projectsQuery = trpc.projects.list.useQuery(undefined, { enabled });

  if (!enabled) return null;

  const projects = projectsQuery.data ?? [];
  const visibleProjects = projects.filter(
    (p) => p.status === "active" || p.status === "draft",
  );
  const isActive = pathname.startsWith("/dashboard/projects");

  if (isCollapsed) {
    return (
      <CollapsedNavTeamProjects
        visibleProjects={visibleProjects}
        isLoading={projectsQuery.isLoading}
        isActive={isActive}
        canCreate={canCreate}
      />
    );
  }

  return (
    <SidebarGroup className="px-2 py-0.5">
      <SidebarMenu className="gap-0.5">
        <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip="Proyek"
                isActive={isActive}
                className={navItemClass(isActive)}
              >
                <FolderKanban className={navIconClass(isActive)} />
                <span className="truncate">Proyek</span>
                <ChevronRightIcon
                  className={[
                    "ml-auto !size-3 shrink-0 transition-transform duration-200",
                    "group-data-[state=open]/collapsible:rotate-90",
                    isActive ? "text-[var(--blue)]" : "text-[var(--text-faint)]",
                  ].join(" ")}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub
                className="ml-3.5 gap-0 border-l pl-2"
                style={{ borderColor: "rgba(10,45,135,0.12)" }}
              >
                {visibleProjects.length === 0 ? (
                  <div className="px-2 py-2 text-[0.75rem] text-[var(--text-faint)]">
                    {projectsQuery.isLoading ? "Memuat proyek…" : "Belum ada proyek aktif"}
                  </div>
                ) : (
                  STATUS_SECTIONS.map(({ status, label, icon: SectionIcon }) => {
                    const items = visibleProjects.filter((p) => p.status === status);
                    if (items.length === 0) return null;

                    return (
                      <div key={status} className="mb-1 last:mb-0">
                        <div className="flex items-center gap-1.5 px-2 pb-1 pt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
                          <SectionIcon className="size-2.5" />
                          {label}
                        </div>
                        {items.map((project) => {
                          const projectHref = `/dashboard/projects/${project.id}`;
                          const projectActive = pathname === projectHref;

                          return (
                            <SidebarMenuSubItem key={project.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={projectActive}
                                className={subBtnCls(projectActive)}
                              >
                                <Link href={projectHref}>
                                  <span className="flex-1 truncate">{project.name}</span>
                                  <ProjectTaskBadge
                                    done={project.doneTaskCount}
                                    total={project.taskCount}
                                  />
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </div>
                    );
                  })
                )}

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    className={subBtnCls(pathname === "/dashboard/projects")}
                  >
                    <Link href="/dashboard/projects">
                      <LayoutGrid className="!size-3 shrink-0" />
                      <span className="font-semibold">Lihat Semua Proyek</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                {canCreate && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild className={subBtnCls(false)}>
                      <Link href="/dashboard/projects?create=1">
                        <FolderPlus className="!size-3 shrink-0" />
                        <span>Buat Proyek Baru</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
