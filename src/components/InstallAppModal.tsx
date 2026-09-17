/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smartphone, 
  Share2, 
  Check, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Laptop,
  CheckCircle2,
  PackageCheck,
  FileCode2,
  ArrowRight
} from 'lucide-react';
import { SchoolSettings, Student } from '../types';
import { downloadStudentsCSV, downloadBackupJSON } from '../utils/exportHelpers';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolSettings: SchoolSettings;
  students: Student[];
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  schoolSettings,
  students,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'playstore' | 'instant' | 'adminGuide'>('playstore');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.href.split('#')[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadTwaManifest = () => {
    const config = {
      packageId: "com.bdnmemorialsss.portal",
      host: window.location.host,
      name: `${schoolSettings.schoolName} Portal`,
      launcherName: "BDN Portal",
      themeColor: "#064E3B",
      navigationColor: "#064E3B",
      backgroundColor: "#064E3B",
      enableNotifications: true,
      startUrl: "/?source=playstore",
      iconUrl: "/bdn-icon.jpg",
      appVersionName: "1.0.0",
      appVersionCode: 1,
      targetSdk: 34,
      generator: "Google Bubblewrap / PWABuilder for Google Play Store"
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bdn-playstore-twa-manifest.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 my-6">
        
        {/* Header with App Icon and Play Store Tag */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/bdn-icon.jpg"
                alt="Bishop Dunstan Nsubuga Memorial SSS App Icon"
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-lg border-2 border-emerald-500/40 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 p-1 rounded-full text-[10px] font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                  <Smartphone className="w-3 h-3 text-emerald-700" />
                  Android App & Play Store
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  v1.0.0
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                Download BDN Memorial SSS App
              </h3>
              <p className="text-xs text-slate-500">
                Official school portal for parents, teachers, and administration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation inside Modal */}
        <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('playstore')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'playstore'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Google Play & Android APK</span>
          </button>

          <button
            onClick={() => setActiveSubTab('instant')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'instant'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>iPhone, iPad & PC</span>
          </button>

          <button
            onClick={() => setActiveSubTab('adminGuide')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'adminGuide'
                ? 'border-amber-600 text-amber-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-amber-600" />
            <span>Play Store Publish Guide</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE PLAY & ANDROID APK */}
        {activeSubTab === 'playstore' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Google Play Store Badge Display */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Google Play Trusted Web Activity (TWA) Ready</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Available for All Android Phones & Tablets
                </h4>
                <p className="text-[11px] text-slate-300">
                  Samsung, Tecno, Infinix, Xiaomi, Oppo, Nokia, Google Pixel & more.
                </p>
              </div>

              {/* Styled Google Play Store Button */}
              <div className="flex flex-col gap-2 shrink-0">
                <div 
                  className="bg-black hover:bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-3 cursor-pointer shadow-lg hover:border-emerald-500 transition group"
                  onClick={() => {
                    // Trigger Chrome install prompt if available or copy link
                    handleCopyLink();
                  }}
                  title="Click to install or copy link"
                >
                  {/* Google Play Triangle Logo SVG */}
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
                    <path fill="#4285F4" d="M48.7 15.6C44.4 20.3 42 27.5 42 36.8v438.4c0 9.3 2.4 16.5 6.7 21.2l1.2 1.2 245.4-245.4v-5.8L50 14.4l-1.3 1.2z" />
                    <path fill="#FFBB00" d="M376.5 329.8l-81.2-81.2v-5.8l81.2-81.2 1.8 1 96.3 54.7c27.5 15.6 27.5 41.2 0 56.8l-96.3 54.7-1.8 1z" />
                    <path fill="#EA4335" d="M378.3 328.8L295.3 245.8 48.7 492.4c9.1 9.6 24 10.8 41 1.2l288.6-164.8" />
                    <path fill="#34A853" d="M378.3 183.2L89.7 19.4c-17-9.6-31.9-8.4-41 1.2l246.6 246.6 83-84z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">GET IT ON</div>
                    <div className="text-sm font-bold text-white leading-tight font-sans tracking-wide">Google Play</div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadTwaManifest}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Play Store Config</span>
                </button>
              </div>
            </div>

            {/* Instant Android Install Instructions */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Instant Installation on Any Android Phone (1-Tap):</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[10px] font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Parents and teachers do not need to search or wait. Once they open the portal link on their phone:
              </p>
              <ol className="list-decimal list-inside text-slate-800 space-y-1 text-[11px] pl-1 font-medium">
                <li>Open the portal web link in <strong>Google Chrome</strong>.</li>
                <li>Tap the <strong>three dots (⋮)</strong> menu in the upper-right corner.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>The Bishop Dunstan Nsubuga Memorial SSS app icon installs immediately onto their phone screen!</li>
              </ol>
            </div>

            {/* Portal Link Sharing Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>Official App Link (Share via WhatsApp or SMS)</span>
                <span className="text-emerald-700 font-normal">Works on all mobile networks</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedUrl ? 'Copied Link' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IPHONE, IPAD & PC */}
        {activeSubTab === 'instant' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* iPhone / iPad */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-950">
                <ExternalLink className="w-4 h-4 text-indigo-700" />
                <span>For Apple iPhone & iPad (Safari):</span>
              </div>
              <ol className="list-decimal list-inside text-slate-700 space-y-1 text-[11px] pl-1">
                <li>Open this link in <strong>Safari</strong> on your iPhone or iPad.</li>
                <li>Tap the <strong>Share</strong> button (the square with an upward arrow at the bottom of the screen).</li>
                <li>Scroll down and select <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>Add</strong>. It will launch full-screen just like an App Store app!</li>
              </ol>
            </div>

            {/* PC / Laptop */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Laptop className="w-4 h-4 text-amber-700" />
                <span>For Laptops, Desktops & School Computer Lab:</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed pl-1">
                In Google Chrome, Brave, or Microsoft Edge, look in the address bar on the right for the small <strong>Install (⊕)</strong> icon, or click <em>Menu &gt; Save and share &gt; Install Bishop Dunstan Nsubuga Memorial SSS Portal</em>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE PLAY STORE CONSOLE PUBLISH GUIDE FOR ISMAIL KASUMBA */}
        {activeSubTab === 'adminGuide' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <PackageCheck className="w-4 h-4 text-amber-700" />
                  <span>Google Play Console Publication Instructions (For Administrator)</span>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900 font-bold">
                  com.bdnmemorialsss.portal
                </span>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed">
                Because this application already includes a complete <strong>Web App Manifest</strong>, <strong>Service Worker</strong>, and <strong>Digital Asset Links</strong>, you can publish it directly to the Google Play Store as a <strong>Trusted Web Activity (TWA)</strong>:
              </p>

              <div className="space-y-2 text-[11px] text-slate-800">
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-slate-900">Step 1: Open Google PWABuilder</span>
                  <p className="text-slate-600">
                    Visit <a href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">pwabuilder.com</a> and enter your portal URL. It automatically verifies 100% Play Store readiness.
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-slate-900">Step 2: Generate Signed Android App Bundle (.aab / .apk)</span>
                  <p className="text-slate-600">
                    Click <strong>"Package for Google Play"</strong>. PWABuilder builds the certified <code>.aab</code> package signed for Android 8.0 to Android 15+.
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-slate-900">Step 3: Upload to Google Play Console</span>
                  <p className="text-slate-600">
                    Log in to <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">Google Play Console</a>, create a new app titled <em>"Bishop Dunstan Nsubuga Memorial SSS Portal"</em> under the <strong>Education</strong> category, and drag in your generated <code>.aab</code> file!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadTwaManifest}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-amber-400 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <FileCode2 className="w-4 h-4" />
                  <span>Download TWA Play Store Manifest</span>
                </button>

                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Google PWABuilder Tool</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Offline Backup & Data Downloads */}
        <div className="p-3.5 bg-slate-100 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
            Offline School Data Downloads:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadStudentsCSV(students, schoolSettings)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Student Database (Excel / CSV)</span>
            </button>

            <button
              onClick={() => downloadBackupJSON(students, schoolSettings)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Download System Backup (JSON)</span>
            </button>
          </div>
        </div>

        {/* Footer Close Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Done, Return to Portal
          </button>
        </div>
      </div>
    </div>
  );
};
