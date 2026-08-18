import { useTheme } from "@/context/ThemeContext.jsx";

const GlassHeader = ({ children, variant = "default" }) => {
  const { isDarkMode } = useTheme();

  const base =
    "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300";

  // 🔹 DEFAULT (Landing page, College selection, etc.)
  const defaultLight = "bg-transparent";
  const defaultDark = "bg-transparent";

  // 🔹 DASHBOARD ONLY
  const dashboardLight =
    "bg-gray-100/90 border-b border-gray-200 shadow-md shadow-black/10";

  const dashboardDark =
    "bg-gray-900/80 border-b border-white/10 shadow-lg shadow-black/30";

  const classes =
    variant === "dashboard"
      ? isDarkMode
        ? dashboardDark
        : dashboardLight
      : isDarkMode
      ? defaultDark
      : defaultLight;

  return <header className={`${base} ${classes}`}>{children}</header>;
};

export default GlassHeader;
