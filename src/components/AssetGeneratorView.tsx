/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  Atom, 
  Sparkles, 
  Download, 
  Settings, 
  Image, 
  Maximize2,
  RefreshCw,
  Sliders,
  Play
} from 'lucide-react';

export function AssetGeneratorView() {
  const { language } = useAppState();
  const t = i18nData[language];

  const [promptText, setPromptText] = useState('');
  const [selectedSize, setSelectedSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isRendering, setIsRendering] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Creative preset prompts
  const presets = [
    "SolidWorks blue CAD render of a diesel emergency alternator generator unit",
    "Close-up cutaway design schematic diagram of hydraulic feed pump impeller",
    "3D modeling of an electromagnetic high-speed linear conveyor armature",
    "Orthographic drafting blueprint of dual-spindle CNC machining tool holder"
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const activePrompt = promptText.trim();
    if (!activePrompt) {
      setErrorMsg("Please write a component CAD design prompt first.");
      return;
    }

    setIsRendering(true);
    setImageUrl(null);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: activePrompt,
          size: selectedSize
        })
      });

      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setErrorMsg(data.error || "Failed to generate component render.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network exception contacting CAD rendering server.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.assetGenerator}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'fa' 
            ? "سامانه هوش مصنوعی مدل‌سازی کاد، طراحی نقشه سه بعدی قطعات با استفاده از مدل ایمیجن"
            : "Generate Solidworks-style high-fidelity industrial blueprints, design schematics, and mechanical assets"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT PANEL: SIZE SELECTOR & CUSTOM PROMPT */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-5 space-y-5">
          {/* Section Heading */}
          <div className="border-b pb-3 mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{language === 'fa' ? 'پیکربندی هوشمند قطعه' : 'Configure Blueprint Generator'}</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Resolution Selector (Constraint!) */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                {language === 'fa' ? 'رزولوشن تصویر و ابعاد ترسیم' : 'Drawing Render Size / Quality'}
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((szVal) => (
                  <button
                    id={`size-btn-${szVal}`}
                    key={szVal}
                    type="button"
                    onClick={() => setSelectedSize(szVal)}
                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      selectedSize === szVal
                        ? 'bg-slate-900 border-slate-900 text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{szVal}</span>
                    <span className="text-[8px] font-mono text-slate-400">
                      {szVal === '1K' ? 'Standard' : szVal === '2K' ? 'Fine' : 'Ultra'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === 'fa' ? 'توصیف کالبدی و جزئیات فنی' : 'Drafting description / prompt'}</label>
              <textarea
                id="cad-prompt-textarea"
                required
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Cutaway CAD blueprint diagram of hydraulic feed water pump, SolidWorks blueprint drawing with annotations, pristine tech vector..."
                className="w-full border rounded-xl px-3-5 py-2 text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Ready presets */}
            <div className="space-y-2 text-xs font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'fa' ? 'الگوهای فنی آماده طراحی' : 'CAD drafting inspiration templates'}</span>
              <div className="space-y-2">
                {presets.map((preset, index) => (
                  <button
                    id={`drafting-preset-${index}`}
                    key={index}
                    type="button"
                    onClick={() => setPromptText(preset)}
                    className="w-full text-left p-2.5 border rounded-xl hover:border-blue-500 bg-slate-50/45 hover:bg-slate-50 transition text-[11px] leading-tight block text-slate-600 font-mono"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="draft-generator-submit-btn"
              disabled={isRendering || !promptText.trim()}
              type="submit"
              className={`w-full font-bold py-3 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                isRendering || !promptText.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{isRendering ? 'Rendering CAD models...' : 'Render CAD Blueprint'}</span>
            </button>
          </form>
        </div>

        {/* OUTPUT PANEL: GENERATED IMAGE */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-7 flex flex-col justify-between h-max min-h-[460px]">
          <div className="space-y-4 flex-1">
            {/* Header */}
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Atom className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{language === 'fa' ? 'طرح سه بعدی کاد ترسیم شده' : 'Drafting Render Stage'}</h3>
              </div>
              
              <span className="font-mono text-[9px] text-indigo-500 bg-indigo-55 px-2 py-0.5 rounded font-bold uppercase">
                Model: gemini-3-pro-image
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-500 font-sans">
                ⚠️ {errorMsg}
              </div>
            )}

            {isRendering ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs py-10 space-y-3 font-sans">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="font-semibold text-slate-600">Executing parametric geometry shaders...</p>
                <span className="text-[10px]">Processing matrix diffusion with gemini-3-pro-image-preview</span>
              </div>
            ) : imageUrl ? (
              <div className="space-y-4 font-sans">
                {/* Result Image Frame */}
                <div className="relative w-full max-h-96 overflow-hidden rounded-2xl border">
                  <img 
                    referrerPolicy="no-referrer"
                    src={imageUrl} 
                    alt="CAD blueprint draft" 
                    className="w-full object-cover max-h-96 scale-100" 
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/85 text-[10px] text-blue-400 font-bold px-2 py-1 rounded backdrop-blur">
                    Resolution: {selectedSize} RENDER
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">{language === 'fa' ? 'داده خروجی هم‌پوشانی شده با پارامترها' : 'Output compiled to edge memory store.'}</span>
                  <a 
                    id="download-cad-btn"
                    href={imageUrl} 
                    download={`cad_render_${selectedSize.toLowerCase()}.png`}
                    className="flex items-center gap-1.5 font-bold text-slate-900 border hover:bg-slate-50 px-3 py-1.5 rounded-lg transition shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CAD png</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs py-10 space-y-3 border-2 border-dashed rounded-2xl bg-slate-50/20 font-sans">
                <Image className="w-12 h-12 text-slate-300" />
                <p className="font-semibold text-slate-600">{language === 'fa' ? 'طرحی رندر نشده است' : 'CAD Render Canvas Empty'}</p>
                <span className="text-[10px]">{language === 'fa' ? 'قالب فنی از پنل سمت چپ انتخاب کرده و رندر کنید' : 'Inquire component visualisations by selecting a blueprint preset on left.'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
