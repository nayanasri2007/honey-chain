import React from "react";

export default function Navbar({
  healthStatus,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) {
  const beekeeperNavItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "beekeepers",
      label: "Beekeepers",
      icon: "♟",
    },
    {
      id: "hives",
      label: "Hives",
      icon: "⬡",
    },
    {
      id: "iot",
      label: "IoT Monitoring",
      icon: "◉",
    },
    {
      id: "ai-health",
      label: "AI Health",
      icon: "♥",
    },
    {
      id: "productivity",
      label: "AI Productivity",
      icon: "↗",
    },
    {
      id: "honey-quality",
      label: "Honey Quality",
      icon: "✦",
    },
    {
      id: "traceability",
      label: "Traceability",
      icon: "⌁",
    },
  ];

  const customerNavItems = [
    {
      id: "overview",
      label: "Customer Dashboard",
      icon: "⌂",
    },
    {
      id: "traceability",
      label: "Honey Traceability",
      icon: "⌁",
    },
  ];

  const isCustomer = currentUser?.role === "customer";

  const navItems = isCustomer
    ? customerNavItems
    : beekeeperNavItems;

  const isOnline =
  healthStatus?.status === "online" ||
  healthStatus?.status === "ok" ||
  healthStatus?.status === "healthy" ||
  healthStatus?.database === "healthy" ||
  healthStatus?.database === "connected";

  const displayName = currentUser?.name || "User";

  const displayRole =
    currentUser?.role === "beekeeper"
      ? "Beekeeper"
      : currentUser?.role === "customer"
      ? "Customer"
      : "User";

  return (
    <>
      {/* ========================= */}
      {/* MOBILE TOP BAR */}
      {/* ========================= */}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#24180d] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-3"
          >
            <img
              src="/images/madhusathya-logo.png"
              alt="MadhuSathya"
              className="w-10 h-10 rounded-xl object-cover bg-[#f7f1df]"
            />

            <div className="text-left">
              <div className="font-black text-lg leading-none">
                MadhuSathya
              </div>

              <div className="text-[10px] text-amber-200 mt-1">
                Truth behind every drop
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
            />

            <span className="text-amber-100">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Mobile User */}
        {currentUser && (
          <div className="px-4 pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">
                  {displayName}
                </div>

                <div className="text-[10px] text-amber-200/70 uppercase tracking-wider">
                  {displayRole}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="rounded-lg bg-red-500/10 border border-red-300/20 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="overflow-x-auto border-t border-white/10">
          <div className="flex gap-2 px-3 py-2 min-w-max">
            {navItems.map((item) => {
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-2
                    px-3 py-2
                    rounded-xl
                    text-xs font-bold
                    whitespace-nowrap
                    transition-all
                    ${
                      active
                        ? "bg-[#d99a2b] text-[#24180d] shadow-md"
                        : "bg-white/5 text-amber-100 hover:bg-white/10"
                    }
                  `}
                >
                  <span className="text-sm">
                    {item.icon}
                  </span>

                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================= */}

      <aside
        className="
          hidden lg:flex
          fixed
          left-0
          top-0
          bottom-0
          z-40
          w-[270px]
          flex-col
          bg-[#24180d]
          text-white
          shadow-2xl
          overflow-y-auto
        "
      >
        {/* Brand */}
        <div className="px-6 pt-7 pb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className="w-full text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="/images/madhusathya-logo.png"
                alt="MadhuSathya"
                className="
                  w-14
                  h-14
                  rounded-2xl
                  object-cover
                  bg-[#f7f1df]
                  shadow-lg
                  ring-1
                  ring-amber-300/20
                "
              />

              <div className="min-w-0">
                <h1 className="text-xl font-black tracking-tight">
                  MadhuSathya
                </h1>

                <p className="text-[11px] text-amber-200 mt-1 font-medium">
                  Truth behind every drop
                </p>
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center rounded-full bg-amber-400/10 border border-amber-300/20 px-3 py-1 text-[9px] font-bold tracking-[0.18em] text-amber-200">
                MADHUSATHYA • SIH 2026
              </span>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-white/10" />

        {/* ========================= */}
        {/* USER PROFILE */}
        {/* ========================= */}

        {currentUser && (
          <div className="px-5 py-5">
            <div className="rounded-2xl border border-amber-300/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#d99a2b] text-[#24180d] flex items-center justify-center font-black text-lg">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white">
                    {displayName}
                  </div>

                  <div className="text-[10px] text-amber-200/60 uppercase tracking-wider mt-1">
                    {displayRole}
                  </div>
                </div>
              </div>

              {currentUser.email && (
                <div className="mt-3 truncate text-[10px] text-amber-100/40">
                  {currentUser.email}
                </div>
              )}

              <button
                onClick={onLogout}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  border
                  border-red-300/10
                  bg-red-500/10
                  px-3
                  py-2.5
                  text-xs
                  font-bold
                  text-red-200
                  transition
                  hover:bg-red-500/20
                  hover:text-red-100
                "
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* NAVIGATION */}
        {/* ========================= */}

        <nav className="flex-1 px-4 py-5">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/50">
            {isCustomer
              ? "Customer Portal"
              : "Beekeeper Platform"}
          </p>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    group
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-xl
                    text-left
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-[#d99a2b] text-[#24180d] shadow-lg"
                        : "text-amber-50/75 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`
                      flex
                      items-center
                      justify-center
                      w-8
                      h-8
                      rounded-lg
                      text-base
                      ${
                        active
                          ? "bg-[#24180d]/10"
                          : "bg-white/5 group-hover:bg-white/10"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1 text-sm font-bold">
                    {item.label}
                  </span>

                  {active && (
                    <span className="text-xs font-black">
                      →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================= */}
        {/* SYSTEM STATUS */}
        {/* ========================= */}

        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-100">
                System Status
              </span>

              <span
                className={`
                  w-2.5
                  h-2.5
                  rounded-full
                  ${
                    isOnline
                      ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]"
                      : "bg-red-400"
                  }
                `}
              />
            </div>

            <div className="text-[11px] text-amber-100/60">
              {isOnline
                ? "All services operational"
                : "Backend connection unavailable"}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-100/40">
              <span>●</span>
              <span>IoT</span>

              <span>●</span>
              <span>AI</span>

              <span>●</span>
              <span>Blockchain</span>
            </div>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="text-[10px] text-amber-100/40 leading-relaxed">
            Smart beekeeping & honey
            <br />
            traceability platform
          </div>

          <div className="mt-2 text-[9px] font-bold tracking-wider text-amber-200/50">
            SMART INDIA HACKATHON 2026
          </div>
        </div>
      </aside>
    </>
  );
}