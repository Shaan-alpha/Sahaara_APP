"use client";
import React from "react";
import {
  ChevronLeft,
  Search,
  UserPlus,
  MapPin,
  MessageCircle,
  Home,
  Calendar,
  User,
  Users,
  UserCircle,
} from "lucide-react";
import Link from "next/link";

interface Friend {
  id: string;
  name: string;
  handle: string;
  image: string;
  distance: string;
  online: boolean;
}

const SAMPLE_FRIENDS: Friend[] = [
  {
    id: "f1",
    name: "Roshan",
    handle: "@roshan",
    image:
      "https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg",
    distance: "0.3 km away",
    online: true,
  },
  {
    id: "f2",
    name: "Shaan",
    handle: "@shaan",
    image:
      "https://i.pinimg.com/564x/43/b4/01/43b401a63c6c71b4f94c4cbb4a3b83e2.jpg",
    distance: "1.2 km away",
    online: true,
  },
  {
    id: "f3",
    name: "Sarthak",
    handle: "@sarthak",
    image:
      "https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg",
    distance: "3.8 km away",
    online: false,
  },
  {
    id: "f4",
    name: "Ayushi",
    handle: "@ayushi",
    image:
      "https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg",
    distance: "5.1 km away",
    online: false,
  },
];

const REQUESTS: Friend[] = [
  {
    id: "r1",
    name: "Neha",
    handle: "@neha",
    image:
      "https://i.pinimg.com/564x/07/55/38/075538bf5387809a568c5f496d06eb10.jpg",
    distance: "Mutual: Roshan",
    online: false,
  },
];

const FriendRow: React.FC<{ friend: Friend }> = ({ friend }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <div className="relative shrink-0">
      <img
        src={friend.image}
        alt={friend.name}
        className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow"
      />
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.online ? "bg-green-400" : "bg-gray-300"}`}
      />
    </div>
    <div className="flex-grow min-w-0">
      <h3 className="text-sm font-semibold text-gray-900 truncate">
        {friend.name}
      </h3>
      <p className="text-[11px] text-gray-400 truncate">{friend.handle}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <MapPin size={10} className="text-blue-500" />
        <span className="text-[11px] text-gray-500 truncate">
          {friend.distance}
        </span>
      </div>
    </div>
    <button
      aria-label="Message"
      className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors shrink-0"
    >
      <MessageCircle size={16} />
    </button>
  </div>
);

const RequestRow: React.FC<{ friend: Friend }> = ({ friend }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
    <img
      src={friend.image}
      alt={friend.name}
      className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow shrink-0"
    />
    <div className="flex-grow min-w-0">
      <h3 className="text-sm font-semibold text-gray-900 truncate">
        {friend.name}
      </h3>
      <p className="text-[11px] text-gray-400 truncate">{friend.distance}</p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors">
        Accept
      </button>
      <button className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold transition-colors">
        Ignore
      </button>
    </div>
  </div>
);

const FriendsPage = () => {
  const onlineCount = SAMPLE_FRIENDS.filter((f) => f.online).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center p-0 sm:p-6 lg:p-10">
      <div className="flex flex-col w-full sm:max-w-[390px] h-screen sm:h-[820px] bg-gray-50 sm:rounded-[2.5rem] sm:shadow-2xl sm:overflow-hidden">
        {/* Header */}
        <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <Link href="/">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Friends</h1>
            <p className="text-xs text-gray-400">
              People you trust in your circle
            </p>
          </div>
          <button
            aria-label="Add friend"
            className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
          >
            <UserPlus size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {/* Stats banner */}
          <div className="mx-4 mt-5 mb-3 rounded-3xl overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600" />
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10" />
            <div className="relative px-5 py-5 grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">
                  {SAMPLE_FRIENDS.length}
                </span>
                <span className="text-blue-200 text-xs">Friends</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">
                  {onlineCount}
                </span>
                <span className="text-blue-200 text-xs">Online now</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">
                  {REQUESTS.length}
                </span>
                <span className="text-blue-200 text-xs">Requests</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search friends"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Pending requests */}
          {REQUESTS.length > 0 && (
            <div className="mx-4 mb-3 mt-2 bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Requests
                </p>
                <span className="text-[11px] font-bold text-blue-500">
                  {REQUESTS.length} pending
                </span>
              </div>
              {REQUESTS.map((r) => (
                <RequestRow key={r.id} friend={r} />
              ))}
            </div>
          )}

          {/* All friends */}
          <div className="mx-4 mb-4 bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Your Circle
              </p>
            </div>
            {SAMPLE_FRIENDS.map((f) => (
              <FriendRow key={f.id} friend={f} />
            ))}
          </div>

          <div className="h-3" />
        </div>

        {/* Navigation Bar */}
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
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-blue-50 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600">
                Friends
              </span>
            </li>
            <Link href="/profile">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Profile
                </span>
              </li>
            </Link>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default FriendsPage;
