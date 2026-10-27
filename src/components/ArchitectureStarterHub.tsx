import React, { useState } from 'react';
import JSZip from 'jszip';
import { STARTER_CODE_FILES, StarterCodeFile } from '../data/starterCodeData';
import { Language } from '../types';
import { 
  FolderDown, 
  Copy, 
  Check, 
  Terminal, 
  Server, 
  Database, 
  Smartphone, 
  Layout, 
  Layers, 
  ExternalLink,
  ChevronRight,
  FileCode,
  Globe
} from 'lucide-react';

interface ArchitectureStarterHubProps {
  language: Language;
}

export const ArchitectureStarterHub: React.FC<ArchitectureStarterHubProps> = ({ language }) => {
  const isBn = language === 'bn';
  const [selectedFile, setSelectedFile] = useState<StarterCodeFile>(STARTER_CODE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'starter_code' | 'setup_guide'>('architecture');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add files to zip
      for (const file of STARTER_CODE_FILES) {
        zip.file(file.path, file.content);
      }

      // Add a sample web index file
      zip.file(
        'web/index.html',
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smart Expense Tracker BD & Global</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-900 text-white p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-emerald-400">Smart Expense Tracker BD 🇧🇩</h1>
    <p class="text-gray-400 mt-2">Connected to Java Spring Boot REST API on port 8080.</p>
    <div id="status" class="mt-4 p-4 bg-gray-800 rounded">Status: Ready</div>
  </div>
</body>
</html>`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'smart-expense-tracker-starter.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to create starter zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Download Button */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {isBn ? 'প্রফেশনাল ফুল-স্ট্যাক আর্কিটেকচার' : 'Full-Stack Architecture'}
            </span>
            <span className="text-xs text-slate-400">Java 21 + Spring Boot 3.3 + Android + Postgres</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {isBn ? 'সিস্টেম আর্কিটেকচার ও Starter Code প্যাকেজ' : 'System Architecture & Java Starter Hub'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isBn
              ? 'আপনার D অপশন অনুযায়ী তৈরি পূর্ণাঙ্গ কোডবেস: Java Spring Boot REST API, PostgreSQL Schema, Docker Compose এবং Android Java অ্যাপ্লিকেশন।'
              : 'Complete production-grade starter package including Spring Boot backend, PostgreSQL schema, Docker compose, and Android Java source.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          <FolderDown className="w-4 h-4 stroke-[2.5]" />
          <span>
            {isZipping 
              ? (isBn ? 'প্যাকেজ তৈরি হচ্ছে...' : 'Generating ZIP...') 
              : 'smart-expense-tracker-starter.zip'}
          </span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-2 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'architecture'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isBn ? '১. সিস্টেমের আর্কিটেকচার ডায়াগ্রাম' : '1. Architecture Diagram'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('starter_code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'starter_code'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>{isBn ? '২. কোড ফাইল এক্সপ্লোরার' : '2. Starter Source Code'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('setup_guide')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'setup_guide'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{isBn ? '৩. লোকাল সেটআপ ও রান গাইড' : '3. Local Setup Guide'}</span>
        </button>
      </div>

      {/* 1. Architecture Diagram View */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">
                {isBn ? 'স্মার্ট এক্সপেন্স ট্র্যাকার আর্কিটেকচার নকশা' : 'High-Level System Architecture'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn 
                  ? 'Android ক্লায়েন্ট ও Web ড্যাশবোর্ড থেকে ক্লাউড ব্যাকএন্ড ও পোস্টগ্রেস ডাটাবেস পর্যন্ত পূর্ণাঙ্গ ডেটাফ্লো।' 
                  : 'End-to-end dataflow from Android and Web clients to Spring Boot backend and PostgreSQL.'}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
              HTTPS REST API + JWT
            </span>
          </div>

          {/* Interactive Visual Block Diagram */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-8">
            {/* Top: Clients */}
            <div>
              <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {isBn ? 'ক্লায়েন্ট স্তর (Client Presentation Layer)' : 'Client Presentation Layer'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 text-center shadow-lg hover:border-emerald-500 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Android Mobile App</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Java + XML • Material 3</p>
                  <p className="text-[10px] text-emerald-400 mt-1">bKash/Nagad UX & Room DB</p>
                </div>

                <div className="bg-slate-900/90 border border-teal-500/30 rounded-xl p-4 text-center shadow-lg hover:border-teal-500 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
                    <Layout className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Web Dashboard</h4>
                  <p className="text-[11px] text-slate-400 mt-1">HTML / CSS / JS / React</p>
                  <p className="text-[10px] text-teal-400 mt-1">Multi-currency Analytics</p>
                </div>
              </div>
            </div>

            {/* Connecting Pipe */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-700" />
              <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400">
                REST API (HTTPS JSON / Spring Security JWT)
              </div>
              <div className="w-0.5 h-6 bg-slate-700" />
            </div>

            {/* Middle: Backend */}
            <div className="max-w-xl mx-auto">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 text-center shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Server className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-white">Java Spring Boot 3.3 Backend</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Spring MVC • Spring Data JPA • Hibernate • Spring Security 6
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 font-bold block">Auth & RBAC</span>
                    <span>JWT Tokens</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 font-bold block">Currency API</span>
                    <span>BDT/USD Engine</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 font-bold block">Reports Engine</span>
                    <span>PDF / CSV / Excel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting Pipe */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-700" />
              <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-blue-400">
                HikariCP Connection Pool (Port 5432)
              </div>
              <div className="w-0.5 h-6 bg-slate-700" />
            </div>

            {/* Bottom: Database */}
            <div className="max-w-md mx-auto">
              <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 text-center shadow-lg">
                <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">PostgreSQL 16 Database</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Users • Accounts • Categories • Transactions • Budgets • Indexes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Code File Explorer */}
      {activeTab === 'starter_code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Tree Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
              {isBn ? 'প্রজেক্ট ফাইল তালিকা' : 'Project Files'}
            </p>
            <div className="space-y-1 text-xs">
              {STARTER_CODE_FILES.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    selectedFile.path === file.path
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedFile.path}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                  {selectedFile.language}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কোড কপি করুন' : 'Copy Code')}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950/80 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[500px]">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 3. Local Setup Guide */}
      {activeTab === 'setup_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">
              {isBn ? 'কম্পিউটারে লোকাল এনভায়রনমেন্টে চালানোর নির্দেশিকা' : 'How to Run Locally on Your Computer'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn 
                ? 'Docker, Java JDK 21 এবং Android Studio দিয়ে ৪টি সহজ ধাপে পুরো সিস্টেমটি সেটআপ করুন।'
                : 'Follow these 4 straightforward steps using Docker, Java JDK 21, and Android Studio.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 & 2 */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
                  <span>{isBn ? 'ধাপ ১: ডেটাবেস চালু করুন (Docker)' : 'Step 1: Start PostgreSQL'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 mb-2">
                  {isBn ? 'টার্মিনালে ডকার কম্পোজ দিয়ে পোস্টগ্রেস চালান:' : 'Run PostgreSQL via Docker Compose:'}
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-xs font-mono text-emerald-300 overflow-x-auto">
                  <code>docker compose up -d</code>
                </pre>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                  <span>{isBn ? 'ধাপ ২: Java Backend চালান (Spring Boot)' : 'Step 2: Run Spring Boot Backend'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 mb-2">
                  {isBn ? 'মেভেন দিয়ে স্প্রিং বুট এপিআই চালু করুন:' : 'Start the Spring Boot REST API:'}
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-xs font-mono text-emerald-300 overflow-x-auto">
                  <code>cd backend{'\n'}mvn spring-boot:run</code>
                </pre>
                <p className="text-[11px] text-slate-500 mt-2">
                  Health Check: <code className="text-emerald-400">http://localhost:8080/api/health</code>
                </p>
              </div>
            </div>

            {/* Step 3 & 4 */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
                  <span>{isBn ? 'ধাপ ৩: Android অ্যাপ চালু করুন' : 'Step 3: Run Android App'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isBn
                    ? '১. Android Studio খুলুন।\n২. File -> Open থেকে android/ ফোল্ডারটি নির্বাচন করুন।\n৩. Gradle Sync শেষ হলে Shift+F10 দিয়ে এমুলেটর বা ফোনে চালান।'
                    : '1. Open Android Studio.\n2. Open the android/ folder.\n3. After Gradle Sync, hit Shift+F10 to launch on emulator or phone.'}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">4</span>
                  <span>{isBn ? 'ধাপ ৪: ক্লাউড সিঙ্ক ও ডিপ্লয়মেন্ট' : 'Step 4: Cloud Sync & Production'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isBn
                    ? 'PostgreSQL ক্লাউড হোস্টিং (AWS RDS বা GCP Cloud SQL) এবং Render/Heroku বা VPS-এ JAR ফাইলটি ডিপ্লয় করলেই মোবাইল ও ওয়েব স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।'
                    : 'Deploy the Spring Boot JAR to AWS/GCP and point Android Retrofit baseUrl to your cloud domain.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
