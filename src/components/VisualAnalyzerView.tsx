/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  Flame, 
  Upload, 
  ShieldAlert, 
  Search, 
  BrainCircuit, 
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';

export function VisualAnalyzerView() {
  const { language } = useAppState();
  const t = i18nData[language];

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Elite Industrial Preset Images base64 / paths for instant testing
  const presets = [
    {
      title: "Spindle Thermal Leak",
      desc: "CNC spindle displaying extensive glowing hot spot wear",
      url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&h=400&q=80"
    },
    {
      title: "Broken Rotor Manifold",
      desc: "Structural cracks on hydraulic pump seal housing",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=400&q=80"
    },
    {
      title: "Worn Conveyor Belt Joint",
      desc: "Delamination and alignment abrasion on primary supply line",
      url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&h=400&q=80"
    }
  ];

  const handlePresetSelect = async (url: string) => {
    // Read imageUrl and convert to base64 safely so the backend doesn't trigger CORS on load
    setIsProcessing(true);
    setReport(null);
    setErrorMsg(null);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      // Fallback direct url assigning
      setImageSrc(url);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setReport(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      setErrorMsg("Please upload or select a preset image first.");
      return;
    }

    setIsProcessing(true);
    setReport(null);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: imageSrc,
          customPrompt: customPrompt || "Perform detailed thermal and physical anomaly diagnosis."
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReport(data.report);
      } else {
        setErrorMsg(data.error || "Failed to analyze component.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not retrieve analytical feedback from Gemini server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.visualAnalyzer}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'fa' 
            ? "پایانه هوش مصنوعی عیب‌یابی تصاویر صنعتی با موتور پردازش بینایی فیدبک دار"
            : "Review real physical photos of mechanical components using Gemini 3.1 Pro thermal inspection models"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT COLUMN: PRESETS, UPLOADER & DESCRIPTION */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-5 space-y-5">
          {/* Section Heading */}
          <div className="border-b pb-3 mb-2 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{language === 'fa' ? 'انتخاب یا آپلود تصویر قطعه' : 'Select Mechanical Surface Photo'}</h3>
          </div>

          {/* Quick presets for easy demo testing */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'fa' ? 'امضاهای تست آماده' : 'Demonstration presets'}</span>
            <div className="grid grid-cols-1 gap-2.5">
              {presets.map((p, index) => (
                <button
                  id={`preset-anal-test-${index}`}
                  key={index}
                  type="button"
                  onClick={() => handlePresetSelect(p.url)}
                  className="w-full text-left p-2.5 border rounded-xl hover:border-blue-500 bg-slate-50/40 hover:bg-slate-50 flex items-center gap-3 transition"
                >
                  <img src={p.url} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0 border" />
                  <div className="overflow-hidden leading-tight">
                    <strong className="text-slate-800 text-[11px] block">{p.title}</strong>
                    <span className="text-[9px] text-slate-400 block truncate">{p.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition select-none bg-slate-55/10 bg-slate-50/30">
            <input
              id="thermal-file-uploader"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Search className="w-8 h-8 text-slate-400 mb-2" />
            <strong className="text-slate-700 text-xs block">{language === 'fa' ? 'انتخاب عکس جدید قطعه' : 'Upload custom part photograph'}</strong>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">JPEG, PNG up to 10MB</span>
          </div>

          {/* Prompt field */}
          <form onSubmit={handleInspectionSubmit} className="space-y-4 pt-3 border-t">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === 'fa' ? 'اهداف اصلی معاینه هوشمند (اختیاری)' : 'Inspection Focus Focus (Optional)'}</label>
              <input
                id="thermal-prompt-input"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Look for surface wear or hot spots..."
                className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none text-slate-850"
              />
            </div>

            <button
              id="trigger-inspection-btn"
              disabled={!imageSrc || isProcessing}
              type="submit"
              className={`w-full font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                (!imageSrc || isProcessing)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-blue-400" />
              <span>{isProcessing ? 'Processing Vision Model...' : t.analyzePhoto}</span>
            </button>
          </form>
        </div>

        {/* OUTPUT COLUMN: RESULT PREVIEW & ANOMALY ANALYSIS REPORT */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-7 flex flex-col justify-between h-max min-h-[460px]">
          <div className="space-y-4 flex-1">
            {/* Anomaly Heading */}
            <div className="border-b pb-3 flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1.5">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  {language === 'fa' ? 'پروانه معاینه فنی هوش مصنوعی' : 'Gemini AI Visual Diagnostics Platform'}
                </h3>
              </div>
              
              <span className="font-mono text-[9px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded font-bold uppercase">
                Model: gemini-3.1-pro
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-500">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Live side preview & diagnostic feedback screen */}
            {isProcessing ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs py-10 space-y-3">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="font-semibold text-slate-600">Retrieving multi-spectral machine scans...</p>
                <span className="text-[10px]">Processing matrix arrays with gemini-3.1-pro-preview</span>
              </div>
            ) : report ? (
              <div className="space-y-5">
                {/* Visual Image Render thumbnail */}
                {imageSrc && (
                  <div className="relative w-full max-h-52 overflow-hidden rounded-xl border">
                    <img 
                      referrerPolicy="no-referrer"
                      src={imageSrc} 
                      alt="Telemetry scan" 
                      className="w-full object-cover max-h-52 brightness-95" 
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-[10px] text-blue-400 font-bold p-1 rounded backdrop-blur">
                      Diagnostic Frame Target
                    </div>
                  </div>
                )}

                {/* Analytical Report (Clean parsed Markdown display area) */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3 overflow-y-auto max-h-96 text-xs leading-relaxed text-slate-700 font-sans">
                  <div className="flex items-center gap-1 text-slate-800 border-b pb-2 mb-2 font-bold text-sm">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Diagnostics Analysis Journal Output</span>
                  </div>
                  <pre className="font-sans whitespace-pre-wrap text-slate-600 select-all leading-relaxed text-[11px]">
                    {report}
                  </pre>
                </div>
              </div>
            ) : imageSrc ? (
              <div className="space-y-4">
                <div className="relative w-full max-h-64 overflow-hidden rounded-xl border">
                  <img 
                    referrerPolicy="no-referrer"
                    src={imageSrc} 
                    alt="Ready" 
                    className="w-full object-cover max-h-64" 
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                    <span className="bg-slate-950/80 backdrop-blur-md text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold font-sans">
                      Click 'Run Diagnostic' on left to inspect
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400 italic">Photo successfully ingested to edge pipeline. Awaiting prompt dispatch.</p>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs py-10 space-y-3 border-2 border-dashed rounded-2xl bg-slate-50/20">
                <BrainCircuit className="w-12 h-12 text-slate-300" />
                <p className="font-semibold text-slate-600">{language === 'fa' ? 'دستگاهی آپلود نشده است' : 'No component photo selected'}</p>
                <span className="text-[10px]">{language === 'fa' ? 'یک نمونه از پیش عیب‌یابی شده چپ را انتخاب کنید' : 'Inquire edge diagnostics by choosing a preset on left.'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
