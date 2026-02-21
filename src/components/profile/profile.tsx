"use client";
import React from "react";
import {
  Bell,
  ChevronRight,
  Edit,
  HelpCircle,
  Heart,
  LogOut,
  Shield,
  User,
  Users,
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

const ProfilePage = () => {
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
                <h2 className="text-xl font-bold text-white truncate">
                  Suhani
                </h2>
                <p className="text-blue-200 text-sm font-medium">@suhani679</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="bg-white/20 px-2 py-0.5 rounded-full">
                    <span className="text-[11px] text-white font-semibold">
                      ⭐ 4.9
                    </span>
                  </div>
                </div>
              </div>
              <Edit
                className="text-white/80 shrink-0 hover:text-white transition-colors"
                size={20}
              />
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
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400">
                Contacts
              </span>
            </li>
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400">
                Friends
              </span>
            </li>
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
