import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "../contexts/AuthContext";
import { getRoleDisplayName } from "../lib/auth";

interface DropdownItem {
  label: string;
  href?: string;
}

interface SidebarItem {
  label: string;
  icon: string;
  href?: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

const sidebarItems: SidebarItem[] = [
  { label: "Cricket Dashboard", icon: "📊", href: "/dashboard" },
  { label: "Undeclare Match BetList", icon: "💼", href: "/undeclareMatchBetList" },
  {
    label: "Diamond Casino",
    icon: "💎",
    hasDropdown: true,
    dropdownItems: [
      { label: "Casino List", href: "/DiamondCasino/casinoList" },
      { label: "Declare Casino Result", href: "/DiamondCasino/declareCasinoResult" },
      { label: "Bet List", href: "/DiamondCasino/betList" },
      { label: "Undeclare Bet List", href: "/DiamondCasino/undeclareBetList" },
      { label: "Ledger Declare", href: "/DiamondCasino/ledgerDeclare" },
      { label: "Re-Declare Casino Result", href: "/DiamondCasino/reDeclareCasinoResult" },
    ],
  },
  { label: "Show User Exposer", icon: "💵", href: "/userExposer" },
  { label: "Settings", icon: "🛡️", href: "/settings" },
];

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

function Layout({ children }: { children: React.ReactNode }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setIsMobile(mobile);
      
      if (mobile && !isMobile) {
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else if (!mobile && isMobile) {
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      }
    };

    checkMobile();
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile, isSidebarOpen, isCollapsed]);

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const currentWidth = isMobile 
    ? (isSidebarOpen ? SIDEBAR_WIDTH : 0) 
    : (isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  const sidebarVisible = isMobile ? isSidebarOpen : true;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Fixed Top Bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: isMobile ? 0 : currentWidth,
        right: 0,
        height: isMobile ? "53px" : "70px",
        background: "#2d3131",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 12px",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "left 0.3s ease",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 16,
          height: "100%",
          background: "rgba(0, 0, 0, 0.3)",
          padding: "0 12px",
          borderRadius: "0"
        }}>
          <button
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              padding: "8px",
              borderRadius: "4px",
              transition: "all 0.15s ease-in-out",
              minWidth: "40px",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ☰
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          <div style={{ 
            padding: "8px 16px", 
            background: "rgba(255,255,255,0.1)", 
            borderRadius: "6px",
            fontSize: isMobile ? 12 : 14,
            color: "#e5e7eb",
            display: isMobile ? "none" : "block",
            fontWeight: "500"
          }}>
            {new Date().toLocaleDateString()}
          </div>
          <div style={{ 
            padding: isMobile ? "6px 12px" : "8px 16px", 
            background: "rgba(255,255,255,0.1)", 
            color: "#fff",
            borderRadius: "6px",
            fontSize: isMobile ? 12 : 14,
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            {isMobile ? (user?.name || "User") : `${user?.name || "User"} (${getRoleDisplayName(user?.role || "USER")})`}
          </div>
          <div style={{
            padding: isMobile ? "6px 12px" : "8px 16px",
            background: "rgba(16, 185, 129, 0.8)",
            color: "#fff",
            borderRadius: "6px",
            fontSize: isMobile ? 12 : 14,
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            transition: "all 0.15s ease-in-out"
          }}
          onClick={logout}
          title="Logout"
          >
            {isMobile ? "🚪" : "🚪 Logout"}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            cursor: "pointer"
          }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: currentWidth,
        height: "100vh",
        zIndex: 1001,
        display: sidebarVisible ? "block" : "none",
        transition: "width 0.3s ease-in-out"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          width: currentWidth,
          height: "100vh"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: "100vh",
            overflowX: "hidden",
            overflowY: "hidden",
            borderRight: "1px solid rgba(156, 163, 175, 0.2)"
          }}>
            {/* Header */}
            <div style={{
              height: isMobile ? "53px" : "70px",
              width: "100%",
              background: "#2d3131"
            }}>
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "flex-start" : "center",
                height: isMobile ? "53px" : "70px",
                background: "rgba(0, 0, 0, 0.3)",
                padding: "0 12px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "flex-start" : "center",
                  height: isMobile ? "53px" : "70px",
                  padding: "8px 0",
                  width: "100%"
                }}>
                  <span style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "600",
                    color: "#fff",
                    textAlign: "center",
                    textShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                    marginLeft: isCollapsed ? "8px" : "0"
                  }}>
                    {isCollapsed ? "CP" : "Control Panel"}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{
              flex: 1,
              background: "#1e3a8a",
              backgroundImage: isCollapsed ? "radial-gradient(circle at 20px 20px, rgba(255,255,255,0.03) 2px, transparent 2px)" : "none",
              backgroundSize: isCollapsed ? "40px 40px" : "auto",
              fontFamily: "system-ui, -apple-system, sans-serif",
              minHeight: "calc(100vh - 70px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRight: isCollapsed ? "1px solid rgba(255,255,255,0.1)" : "none"
            }}>
              <div style={{ 
                marginTop: "8px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}>
                {/* Dashboard */}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
                    <span style={{
                      cursor: "pointer",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "16px",
                      padding: "8px 4px",
                      fontSize: "14px",
                      transition: "all 0.15s ease-in-out",
                      color: "white",
                      borderRadius: isCollapsed ? "8px" : "4px",
                      margin: isCollapsed ? "4px 8px" : "0"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fa8c15";
                      e.currentTarget.style.backgroundColor = isCollapsed ? "rgba(255,255,255,0.1)" : "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => isMobile && closeSidebar()}
                    >
                      <div style={{
                        marginLeft: isCollapsed ? "20px" : "32px",
                        color: "white",
                        transition: "all 0.15s ease-in-out",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start"
                      }}>
                        📊
                      </div>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: isMobile ? "600" : "400",
                        transition: "all 0.15s ease-in-out",
                        display: isCollapsed ? "none" : "block"
                      }}>
                        Cricket Dashboard
                      </span>
                    </span>
                  </Link>
                </div>

                {/* Undeclare Match BetList */}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/undeclareMatchBetList" style={{ textDecoration: "none", color: "inherit" }}>
                    <span style={{
                      cursor: "pointer",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "16px",
                      padding: "8px 4px",
                      fontSize: "14px",
                      transition: "all 0.15s ease-in-out",
                      color: "white",
                      borderRadius: isCollapsed ? "8px" : "4px",
                      margin: isCollapsed ? "4px 8px" : "0"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fa8c15";
                      e.currentTarget.style.backgroundColor = isCollapsed ? "rgba(255,255,255,0.1)" : "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => isMobile && closeSidebar()}
                    >
                      <div style={{
                        marginLeft: isCollapsed ? "20px" : "32px",
                        color: "white",
                        transition: "all 0.15s ease-in-out",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start"
                      }}>
                        💼
                      </div>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: isMobile ? "600" : "400",
                        transition: "all 0.15s ease-in-out",
                        display: isCollapsed ? "none" : "block"
                      }}>
                        Undeclare Match BetList
                      </span>
                    </span>
                  </Link>
                </div>

                {/* Diamond Casino */}
                <div style={{ cursor: "pointer" }}>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 4px",
                    gap: "16px",
                    fontSize: "14px",
                    color: "white",
                    transition: "all 0.15s ease-in-out",
                    cursor: "pointer",
                    height: "36px",
                    borderRadius: isCollapsed ? "8px" : "4px",
                    margin: isCollapsed ? "4px 8px" : "0"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fa8c15";
                    e.currentTarget.style.backgroundColor = isCollapsed ? "rgba(255,255,255,0.1)" : "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => handleDropdownToggle("Diamond Casino")}
                  >
                    <span style={{
                      marginLeft: isCollapsed ? "20px" : "32px",
                      color: "white",
                      transition: "all 0.15s ease-in-out",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isCollapsed ? "center" : "flex-start"
                    }}>
                      💎
                    </span>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: isMobile ? "600" : "400",
                      transition: "all 0.15s ease-in-out",
                      display: isCollapsed ? "none" : "block"
                    }}>
                      Diamond Casino
                    </span>
                    <span style={{ 
                      transition: "all 0.15s ease-in-out",
                      transform: openDropdown === "Diamond Casino" ? "rotate(180deg)" : "rotate(0deg)",
                      display: isCollapsed ? "none" : "block"
                    }}>
                      ▼
                    </span>
                  </span>
                  
                  {/* Diamond Casino Dropdown */}
                  {openDropdown === "Diamond Casino" && !isCollapsed && (
                    <div style={{
                      marginLeft: "32px",
                      background: "rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginTop: "4px"
                    }}>
                      <Link href="/DiamondCasino/casinoList" style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ 
                          padding: "8px 16px", 
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onClick={() => isMobile && closeSidebar()}
                        >
                          Casino List
                        </div>
                      </Link>
                      <Link href="/DiamondCasino/declareCasinoResult" style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ 
                          padding: "8px 16px", 
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onClick={() => isMobile && closeSidebar()}
                        >
                          Declare Casino Result
                        </div>
                      </Link>
                      <Link href="/DiamondCasino/betList" style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ 
                          padding: "8px 16px", 
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onClick={() => isMobile && closeSidebar()}
                        >
                          Bet List
                        </div>
                      </Link>
                      <Link href="/DiamondCasino/undeclareBetList" style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ 
                          padding: "8px 16px", 
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onClick={() => isMobile && closeSidebar()}
                        >
                          Undeclare Bet List
                        </div>
                      </Link>
                      <Link href="/DiamondCasino/ledgerDeclare" style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ 
                          padding: "8px 16px", 
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onClick={() => isMobile && closeSidebar()}
                        >
                          Ledger Declare
                        </div>
                      </Link>
                      <Link href="/DiamondCasino/reDeclareCasinoResult" style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ 
                          padding: "8px 16px", 
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onClick={() => isMobile && closeSidebar()}
                        >
                          Re-Declare Casino Result
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Show User Exposer */}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/userExposer" style={{ textDecoration: "none", color: "inherit" }}>
                    <span style={{
                      cursor: "pointer",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "8px 4px",
                      fontSize: "14px",
                      transition: "all 0.15s ease-in-out",
                      color: "white",
                      borderRadius: isCollapsed ? "8px" : "4px",
                      margin: isCollapsed ? "4px 8px" : "0"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fa8c15";
                      e.currentTarget.style.backgroundColor = isCollapsed ? "rgba(255,255,255,0.1)" : "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => isMobile && closeSidebar()}
                    >
                      <div style={{
                        marginLeft: isCollapsed ? "20px" : "32px",
                        color: "white",
                        transition: "all 0.15s ease-in-out",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start"
                      }}>
                        💵
                      </div>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: isMobile ? "600" : "400",
                        transition: "all 0.15s ease-in-out",
                        display: isCollapsed ? "none" : "block"
                      }}>
                        Show User Exposer
                      </span>
                    </span>
                  </Link>
                </div>

                {/* Settings */}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/settings" style={{ textDecoration: "none", color: "inherit" }}>
                    <span style={{
                      cursor: "pointer",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "8px 4px",
                      fontSize: "14px",
                      transition: "all 0.15s ease-in-out",
                      color: "white",
                      borderRadius: isCollapsed ? "8px" : "4px",
                      margin: isCollapsed ? "4px 8px" : "0"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fa8c15";
                      e.currentTarget.style.backgroundColor = isCollapsed ? "rgba(255,255,255,0.1)" : "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => isMobile && closeSidebar()}
                    >
                      <div style={{
                        marginLeft: isCollapsed ? "20px" : "32px",
                        color: "white",
                        transition: "all 0.15s ease-in-out",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start"
                      }}>
                        🛡️
                      </div>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: isMobile ? "600" : "400",
                        transition: "all 0.15s ease-in-out",
                        display: isCollapsed ? "none" : "block"
                      }}>
                        Settings
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </nav>
            
            {/* Footer with Logo */}
            <div style={{
              background: "#1e3a8a",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "auto"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#2d3131",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                border: "2px solid rgba(255, 255, 255, 0.2)"
              }}>
                3X
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main style={{ 
        marginLeft: isMobile ? 0 : currentWidth, 
        marginTop: isMobile ? "53px" : "70px",
        background: "#f8fafc", 
        minHeight: isMobile ? "calc(100vh - 53px)" : "calc(100vh - 70px)",
        transition: "margin-left 0.3s ease",
        width: isMobile ? "100%" : `calc(100% - ${currentWidth}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowX: "hidden"
      }}>
        <section style={{ 
          padding: "20px",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          <div>{children}</div>
        </section>
      </main>
    </div>
  );
}

export default Layout;
