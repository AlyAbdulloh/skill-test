"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  Shield,
  KeyRound,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  GitBranch,
  Box,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: { key: string; label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "master-data",
    label: "Master Data",
    icon: FolderTree,
    permission: "master-data.view",
    children: [
      {
        key: "category",
        label: "Category",
        href: "/dashboard/master-data/category",
      },
    ],
  },
  {
    key: "document-request",
    label: "Document Requests",
    href: "/dashboard/document-request",
    icon: Box,
    permission: "document-request.view",
  },
  {
    key: "approval-inbox",
    label: "Approval Inbox",
    href: "/dashboard/approval-inbox",
    icon: Inbox,
    permission: "approval-inbox.view",
  },
  {
    key: "user-management",
    label: "User Management",
    icon: Users,
    permission: "user.view",
    children: [
      { key: "user", label: "Users", href: "/dashboard/user-management/user" },
      { key: "role", label: "Roles", href: "/dashboard/user-management/role" },
      {
        key: "permission",
        label: "Permissions",
        href: "/dashboard/user-management/permission",
      },
    ],
  },
  {
    key: "configuration",
    label: "Configuration",
    icon: GitBranch,
    permission: "configuration.approval-line.view",
    children: [
      {
        key: "approval-line",
        label: "Approval Lines",
        href: "/dashboard/configuration/approval-line",
      },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpand = (item: string) => {
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  // Auto-expand active parent
  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + "/"),
      ),
    );
    if (activeParent && !expandedItems.includes(activeParent.key)) {
      setExpandedItems((prev) => [...prev, activeParent.key]);
    }
  }, [pathname]);

  const permissions = session?.user?.permissions || [];

  const filteredItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] bg-white overflow-hidden transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                SK
              </div>
              <div>
                <span className="text-slate-800 text-base font-semibold">
                  skeleton
                </span>
                <p className="text-slate-400 text-xs">Next.js App</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href
                  ? pathname === item.href
                  : (item.children?.some(
                      (c) =>
                        pathname === c.href ||
                        pathname.startsWith(c.href + "/"),
                    ) ?? false);
                const isExpanded = expandedItems.includes(item.key);
                const hasChildren = item.children && item.children.length > 0;

                if (!hasChildren) {
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href!}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span className="flex-1 text-left text-sm">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggleExpand(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1 text-left text-sm">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children!.map((child) => {
                          const isChildActive =
                            pathname === child.href ||
                            pathname.startsWith(child.href + "/");
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                  isChildActive
                                    ? "bg-slate-100 text-slate-800"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                <span className="flex-1 text-left text-xs">
                                  {child.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {mounted && (
            <div className="p-4 border-t border-slate-100">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-medium hover:from-cyan-600 hover:to-pink-600 transition-all cursor-pointer shadow-sm">
                  <LogOut className="size-4" />
                  <span className="text-sm">Logout</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to logout?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
