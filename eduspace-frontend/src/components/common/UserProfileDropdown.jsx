import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext.jsx";
import {
  User,
  Edit3,
  KeyRound,
  RefreshCcw,
  Trash2,
  ChevronDown
} from "lucide-react";

const UserProfileDropdown = ({ user, onOptionClick }) => {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ===== Trigger ===== */}
<button
  onClick={() => setOpen((p) => !p)}
  className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all
    ${isDarkMode
      ? "bg-gray-800/70 text-white shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:bg-gray-700/70"
      : "bg-white text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.15)] hover:bg-gray-50"
    }`}
>
  {/* Avatar */}
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
    {user?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>

  {/* Name + UID */}
  <div className="flex flex-col text-left leading-tight">
    <span className="text-sm font-semibold">
      {user?.name || "User"}
    </span>
    <span className="text-xs opacity-70 font-mono">
      UID {user?.uid || "—"}
    </span>
  </div>

  {/* Dropdown Icon */}
  <ChevronDown
    className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : ""}`}
  />
</button>


      {/* ===== Dropdown ===== */}
      {open && (
        <div
          className={`absolute right-0 mt-3 w-64 rounded-xl backdrop-blur-md border z-50
            ${isDarkMode
              ? "bg-gray-800/95 border-gray-700/50 shadow-[0_0_18px_rgba(255,255,255,0.08)]"
              : "bg-white/95 border-gray-200 shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
            }`}
        >
          {/* ===== Header ===== */}
          <div className="px-5 py-4 border-b border-gray-200/20">
            <p className="font-semibold text-base">
              {user?.name || "User"}
            </p>

            <p className="text-sm opacity-70">
              {user?.email || "user@email.com"}
            </p>

            {/* ID Badge */}
            {user?.uid && (
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-md text-xs font-mono tracking-wide
                  ${isDarkMode
                    ? "bg-gray-700 text-indigo-300"
                    : "bg-indigo-50 text-indigo-700"
                  }`}
              >
                ID: {user.uid}
              </span>
            )}
          </div>

          {/* ===== Menu ===== */}
          <div className="py-2">
            <MenuItem
              icon={Edit3}
              label="Modify My Details"
              onClick={() => onOptionClick("modify")}
            />

            <MenuItem
              icon={KeyRound}
              label="Change Password"
              onClick={() => onOptionClick("change-password")}
            />

            <MenuItem
              icon={RefreshCcw}
              label="Reset Password"
              onClick={() => onOptionClick("reset-password")}
            />

            <div className="my-2 border-t border-gray-200/20" />

            <MenuItem
              icon={Trash2}
              label="Delete Account"
              danger
              onClick={() => onOptionClick("delete-account")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== Menu Item Component ===== */
const MenuItem = ({ icon: Icon, label, onClick, danger = false }) => {
  const { isDarkMode } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
        ${danger
          ? "text-red-500 hover:bg-red-500/10"
          : isDarkMode
            ? "text-gray-200 hover:bg-gray-700/60"
            : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

export default UserProfileDropdown;
