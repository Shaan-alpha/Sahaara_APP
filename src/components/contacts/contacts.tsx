"use client";
import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  Search,
  Plus,
  Shield,
  Home,
  Calendar,
  User,
  Users,
  UserCircle,
  X,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: string;
  image: string;
  emergency?: boolean;
}

const STORAGE_KEY = "sahara.contacts";

const DEFAULT_AVATARS = [
  "https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg",
  "https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg",
  "https://i.pinimg.com/564x/43/b4/01/43b401a63c6c71b4f94c4cbb4a3b83e2.jpg",
  "https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg",
];

const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Mom",
    phone: "+919521688016",
    role: "Family · Emergency",
    image:
      "https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg",
    emergency: true,
  },
  {
    id: "c2",
    name: "Dad",
    phone: "+919810012345",
    role: "Family · Emergency",
    image:
      "https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg",
    emergency: true,
  },
  {
    id: "c3",
    name: "Roshan",
    phone: "+919987654321",
    role: "Close Friend",
    image:
      "https://i.pinimg.com/564x/43/b4/01/43b401a63c6c71b4f94c4cbb4a3b83e2.jpg",
  },
  {
    id: "c4",
    name: "Shaan",
    phone: "+919012345678",
    role: "Close Friend",
    image:
      "https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg",
  },
  {
    id: "c5",
    name: "Local Police",
    phone: "100",
    role: "Authority",
    image:
      "https://i.pinimg.com/564x/2c/2a/b3/2c2ab3a1ef0e1f3b9f4e23b9b0a2b2f7.jpg",
    emergency: true,
  },
];

const sanitizePhone = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
};

const ContactRow: React.FC<{
  contact: Contact;
  onDelete?: (id: string) => void;
}> = ({ contact, onDelete }) => {
  const telHref = `tel:${sanitizePhone(contact.phone)}`;
  const smsHref = `sms:${sanitizePhone(contact.phone)}`;
  return (
    <div className="group flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="relative shrink-0">
        <img
          src={contact.image}
          alt={contact.name}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow"
        />
        {contact.emergency && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
            <Shield size={10} className="text-white" />
          </span>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {contact.name}
        </h3>
        <p className="text-[11px] text-gray-400 truncate">{contact.role}</p>
        <p className="text-[11px] text-gray-500 font-mono truncate">
          {contact.phone}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {onDelete && (
          <button
            onClick={() => onDelete(contact.id)}
            aria-label="Delete contact"
            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={15} />
          </button>
        )}
        <a
          href={smsHref}
          aria-label="Message"
          className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
        >
          <MessageCircle size={16} />
        </a>
        <a
          href={telHref}
          aria-label="Call"
          className="w-9 h-9 rounded-full bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors"
        >
          <Phone size={16} />
        </a>
      </div>
    </div>
  );
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmergency, setFormEmergency] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Contact[];
        if (Array.isArray(parsed)) setContacts(parsed);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CONTACTS));
      }
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (next: Contact[]) => {
    setContacts(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const openAdd = () => {
    setFormName("");
    setFormPhone("");
    setFormEmergency(false);
    setFormError("");
    setShowAdd(true);
  };

  const closeAdd = () => setShowAdd(false);

  const saveContact = () => {
    const name = formName.trim();
    const phone = sanitizePhone(formPhone);
    if (!name) {
      setFormError("Please enter a name");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 3) {
      setFormError("Please enter a valid phone number");
      return;
    }
    const newContact: Contact = {
      id: `u_${Date.now()}`,
      name,
      phone,
      role: formEmergency ? "Emergency Contact" : "Personal",
      image:
        DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      emergency: formEmergency,
    };
    persist([newContact, ...contacts]);
    setShowAdd(false);
  };

  const deleteContact = (id: string) => {
    persist(contacts.filter((c) => c.id !== id));
  };

  const filtered = search.trim()
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search),
      )
    : contacts;

  const emergencyContacts = filtered.filter((c) => c.emergency);
  const otherContacts = filtered.filter((c) => !c.emergency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center p-0 sm:p-6 lg:p-10">
      <div className="flex flex-col w-full sm:max-w-[390px] h-screen sm:h-[820px] bg-gray-50 sm:rounded-[2.5rem] sm:shadow-2xl sm:overflow-hidden relative">
        {/* Header */}
        <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <Link href="/">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
            <p className="text-xs text-gray-400">
              Your trusted circle & emergency numbers
            </p>
          </div>
          <button
            onClick={openAdd}
            aria-label="Add contact"
            className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {/* Search */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {hydrated && contacts.length === 0 && (
            <div className="mx-4 my-6 text-center text-sm text-gray-400 bg-white rounded-3xl py-10 shadow-sm">
              No contacts yet. Tap + to add one.
            </div>
          )}

          {/* Emergency group */}
          {emergencyContacts.length > 0 && (
            <div className="mx-4 mb-3 mt-2 bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Emergency
                </p>
                <span className="text-[11px] font-bold text-red-500">
                  {emergencyContacts.length} saved
                </span>
              </div>
              {emergencyContacts.map((c) => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  onDelete={deleteContact}
                />
              ))}
            </div>
          )}

          {/* All contacts */}
          {otherContacts.length > 0 && (
            <div className="mx-4 mb-4 bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  All Contacts
                </p>
              </div>
              {otherContacts.map((c) => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  onDelete={deleteContact}
                />
              ))}
            </div>
          )}

          <div className="h-3" />
        </div>

        {/* Add Contact Modal */}
        {showAdd && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:rounded-[2.5rem]">
            <div className="w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:m-5 animate-slide-up-panel">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Add Contact
                </h3>
                <button
                  onClick={closeAdd}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Mom"
                    maxLength={40}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 95216 88016"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <label className="flex items-center justify-between px-1 py-2 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                      <Shield size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Mark as Emergency
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Shown in the Emergency group
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formEmergency}
                    onChange={(e) => setFormEmergency(e.target.checked)}
                    className="w-5 h-5 accent-red-500"
                  />
                </label>

                {formError && (
                  <p className="text-xs text-red-500 font-semibold px-1">
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={closeAdd}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveContact}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-md transition-all active:scale-[0.97]"
                >
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        )}

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
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-blue-50 transition-colors">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600">
                Contacts
              </span>
            </li>
            <Link href="/friends">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Friends
                </span>
              </li>
            </Link>
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

export default ContactsPage;
