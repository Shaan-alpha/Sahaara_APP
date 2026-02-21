"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronDown, Calendar } from "lucide-react";
import Link from "next/link";

export default function BioData() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Profile updated successfully!");
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center p-0 sm:p-6 lg:p-10">
      <div className="flex flex-col w-full sm:max-w-[390px] h-screen sm:h-[820px] bg-gray-50 sm:rounded-[2.5rem] sm:shadow-2xl sm:overflow-hidden">
        {/* Header */}
        <Link href="/profile">
          <header className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 cursor-pointer shrink-0">
            <button
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bio-data</h1>
              <p className="text-xs text-gray-400">
                Update your personal details
              </p>
            </div>
          </header>
        </Link>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <main className="p-5 max-w-md mx-auto w-full">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-7">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-lg ring-4 ring-white bg-gradient-to-br from-red-300 to-pink-400">
                  <img
                    src="https://i.pinimg.com/564x/07/55/38/075538bf5387809a568c5f496d06eb10.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </button>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Suhani</h2>
              <p className="text-sm text-gray-400">suhanihumain@gmail.com</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* First name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
                  placeholder="What's your first name?"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              {/* Last name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
                  placeholder="And your last name?"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-14 h-[50px] bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center rounded-2xl border border-gray-200 shadow-sm shrink-0">
                    <div className="w-7 h-4 bg-green-600 rounded-sm" />
                  </div>
                  <input
                    className="flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Gender
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl appearance-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all cursor-pointer"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date of birth */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
                    type="text"
                    placeholder="What is your date of birth?"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                </div>
              </div>

              {/* Submit */}
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 mt-2"
                type="submit"
              >
                Update Profile
              </button>
            </form>

            {/* Feedback toast */}
            {feedback && (
              <div className="mt-4 flex items-center gap-2.5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-semibold shadow-sm animate-fade-in-up">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {feedback}
              </div>
            )}

            <div className="h-6" />
          </main>
        </div>
      </div>
    </div>
  );
}
