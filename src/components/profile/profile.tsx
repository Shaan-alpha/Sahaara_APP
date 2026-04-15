"use client";
import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Edit,
  HelpCircle,
  Heart,
  LogOut,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { MapPin, Send, Home, Calendar, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

interface ProfileOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const ProfileOption: React.FC<ProfileOptionProps> = ({
  icon,
  title,
  description,
  rightElement,
  danger,
}) => (
  <div
    className={`flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer ${danger ? "hover:bg-red-50" : ""}`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-100 text-red-500" : "bg-blue-50 text-blue-600"}`}
    >
      {icon}
    </div>
    <div className="flex-grow min-w-0">
      <h3
        className={`text-sm font-semibold truncate ${danger ? "text-red-600" : "text-gray-900"}`}
      >
        {title}
      </h3>
      {description ? (
        <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
      ) : null}
    </div>
    {rightElement}
  </div>
);

const DEFAULT_NAME = "Suhani";
const DEFAULT_USERNAME = "suhani679";
const STORAGE_KEY = "sahara.profile";

const ProfilePage = () => {
  const [name, setName] = useState(DEFAULT_NAME);
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(DEFAULT_NAME);
  const [draftUsername, setDraftUsername] = useState(DEFAULT_USERNAME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          name?: string;
          username?: string;
        };
        if (parsed.name) setName(parsed.name);
        if (parsed.username) setUsername(parsed.username);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const startEdit = () => {
    setDraftName(name);
    setDraftUsername(username);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    const trimmedName = draftName.trim() || DEFAULT_NAME;
    const trimmedUsername =
      draftUsername.trim().replace(/^@+/, "") || DEFAULT_USERNAME;
    setName(trimmedName);
    setUsername(trimmedUsername);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: trimmedName, username: trimmedUsername }),
      );
    } catch {}
    setIsEditing(false);
  };

  return (
    /* Desktop: phone-frame centered. Mobile: full screen. */
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center p-0 sm:p-6 lg:p-10">
      <div className="flex flex-col w-full sm:max-w-[390px] h-screen sm:h-[820px] bg-gray-50 sm:rounded-[2.5rem] sm:shadow-2xl sm:overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <Link href="/">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <ChevronRight size={20} className="text-gray-500 rotate-180" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {/* Hero card */}
          <div className="relative mx-4 mt-5 mb-4 rounded-3xl overflow-hidden shadow-lg">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600" />
            {/* Decorative blobs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10" />

            <div className="relative flex items-center gap-4 px-5 py-5">
              <div className="relative shrink-0">
                <img
                  src="https://i.pinimg.com/564x/07/55/38/075538bf5387809a568c5f496d06eb10.jpg"
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
                />
                {/* Online indicator */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full shadow" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      maxLength={30}
                      placeholder="Your name"
                      className="bg-white/20 text-white placeholder-white/60 text-lg font-bold rounded-lg px-2 py-1 outline-none focus:bg-white/30 ring-1 ring-white/30 focus:ring-white/60 min-w-0 w-full"
                    />
                    <input
                      type="text"
                      value={draftUsername}
                      onChange={(e) => setDraftUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      maxLength={30}
                      placeholder="username"
                      className="bg-white/15 text-blue-100 placeholder-white/50 text-xs font-medium rounded-lg px-2 py-1 outline-none focus:bg-white/25 ring-1 ring-white/20 focus:ring-white/50 min-w-0 w-full"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white truncate">
                      {hydrated ? name : DEFAULT_NAME}
                    </h2>
                    <p className="text-blue-200 text-sm font-medium truncate">
                      @{hydrated ? username : DEFAULT_USERNAME}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="bg-white/20 px-2 py-0.5 rounded-full">
                        <span className="text-[11px] text-white font-semibold">
                          ⭐ 4.9
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={saveEdit}
                    aria-label="Save profile"
                    className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
                  >
                    <Check size={16} className="text-white" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    aria-label="Cancel edit"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEdit}
                  aria-label="Edit profile"
                  className="shrink-0 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Edit
                    className="text-white/80 hover:text-white transition-colors"
                    size={20}
                  />
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="relative grid grid-cols-3 divide-x divide-white/20 border-t border-white/20">
              {[
                ["12", "SOS Sent"],
                ["4", "Friends"],
                ["99%", "Safe"],
              ].map(([val, label]) => (
                <div key={label} className="flex flex-col items-center py-3">
                  <span className="text-white font-bold text-lg">{val}</span>
                  <span className="text-blue-200 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account options */}
          <div className="mx-4 mb-3 bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Account
              </p>
            </div>
            <Link href="/biodata">
              <ProfileOption
                icon={<User size={17} />}
                title="My Account"
                description="Make changes to your account"
                rightElement={
                  <>
                    <div className="mr-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] font-black">
                      !
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </>
                }
              />
            </Link>
            <ProfileOption
              icon={<Users size={17} />}
              title="Saved Beneficiary"
              description="Manage your saved account"
              rightElement={
                <ChevronRight size={16} className="text-gray-300" />
              }
            />
            <ProfileOption
              icon={<Shield size={17} />}
              title="Face ID / Touch ID"
              description="Manage your device security"
              rightElement={<Switch />}
            />
            <ProfileOption
              icon={<Bell size={17} />}
              title="Two-Factor Authentication"
              description="Further secure your account for safety"
              rightElement={
                <ChevronRight size={16} className="text-gray-300" />
              }
            />
            <ProfileOption
              icon={<LogOut size={17} />}
              title="Log out"
              description="Sign out of your account"
              danger
              rightElement={<ChevronRight size={16} className="text-red-300" />}
            />
          </div>

          {/* More options */}
          <div className="mx-4 mb-4 bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                More
              </p>
            </div>
            <ProfileOption
              icon={<HelpCircle size={17} />}
              title="Help & Support"
              description="Get help and report issues"
              rightElement={
                <ChevronRight size={16} className="text-gray-300" />
              }
            />
            <ProfileOption
              icon={<Heart size={17} />}
              title="About App"
              description="Version 1.0.0 · Sahara"
              rightElement={
                <ChevronRight size={16} className="text-gray-300" />
              }
            />
          </div>

          <div className="h-3" />
        </div>

        {/* ── Navigation Bar ── */}
        <nav className="bg-white border-t border-gray-100 px-4 pt-2 pb-3 safe-pb shrink-0">
          <ul className="flex justify-between items-center max-w-sm mx-auto">
            <Link href="/">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Home className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Home
                </span>
              </li>
            </Link>
            <Link href="/maps">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Visits
                </span>
              </li>
            </Link>
            <Link href="/contacts">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Contacts
                </span>
              </li>
            </Link>
            <Link href="/friends">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Friends
                </span>
              </li>
            </Link>
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-blue-50 transition-colors">
              <UserCircle className="w-5 h-5 text-blue-600" />
              <Link href={"/profile"}>
                <span className="text-[10px] font-bold text-blue-600">
                  Profile
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ProfilePage;
