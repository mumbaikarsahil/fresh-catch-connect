import React, { useRef, useState } from 'react';
import { Copy, Download, Share2, CheckCircle2, Smartphone, Square } from 'lucide-react';
import { Product } from '@/types/product';
import logo from '@/assets/logo.png';
import { toJpeg } from 'html-to-image';

// Helper to get the full URL of the uploaded product images
const BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/`;
const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BUCKET_URL}${path}`;

export function MenuShareCard({ products }: { products: Product[] }) {
  const squarePosterRef = useRef<HTMLDivElement>(null);
  const storyPosterRef = useRef<HTMLDivElement>(null);
  
  const [isGenerating, setIsGenerating] = useState<'square' | 'story' | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPrices, setShowPrices] = useState(true);

  const activeMenu = products.filter(p => p.in_stock && !p.is_deleted);

  const todayDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' 
  });

  const whatsappText = `
🌊 *Today's Fresh Catch at The Fishy Mart!* 🌊
📅 ${todayDate}

🐟 *Available Today:*
${activeMenu.map(p => `• ${p.name}${showPrices ? ` - ₹${p.price}/${p.unit}` : ''}`).join('\n')}

🛒 *Order Now:* https://fishymart.in
🚚 Delivered fresh and cleaned right to your doorstep!
`.trim();

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async (format: 'square' | 'story') => {
    const targetRef = format === 'square' ? squarePosterRef : storyPosterRef;
    if (!targetRef.current) return;
    
    setIsGenerating(format);
    
    try {
      // html-to-image is much smarter and handles off-screen elements perfectly
      const dataUrl = await toJpeg(targetRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High resolution export
        backgroundColor: format === 'square' ? '#f4f9fd' : '#ffffff',
        skipFonts: true,
        style: {
          fontFamily: 'sans-serif' // Fallback to prevent font-clipping bugs
        }
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Menu-${format}-${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" /> Daily Marketing
          </h3>
          <p className="text-xs text-gray-500 mt-1">Generate high-quality images to share today's menu</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* WhatsApp Message Preview Box */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative h-full flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp Text</p>
            <button 
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold"
            >
              {copied ? <><CheckCircle2 className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed flex-1 bg-white p-3 rounded-lg border border-gray-100 overflow-y-auto max-h-[200px]">
            {whatsappText}
          </pre>
        </div>

        {/* Controls & Download Buttons */}
        <div className="flex flex-col justify-center gap-3">
          <div className="flex items-center justify-between bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm">
            <div>
              <p className="text-sm font-bold text-gray-900">Show Prices</p>
              <p className="text-[10px] text-gray-500">Toggle prices on posters & text</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showPrices}
                onChange={() => setShowPrices(!showPrices)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0583f2]"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button 
              onClick={() => handleDownloadImage('square')}
              disabled={isGenerating !== null || activeMenu.length === 0}
              className="w-full bg-[#0583f2] text-white font-bold h-12 text-sm rounded-xl shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
              {isGenerating === 'square' ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <><Square className="w-4 h-4" /> Square Post</>
              )}
            </button>

            <button 
              onClick={() => handleDownloadImage('story')}
              disabled={isGenerating !== null || activeMenu.length === 0}
              className="w-full bg-[#1c1c1c] text-white font-bold h-12 text-sm rounded-xl shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group"
            >
              {isGenerating === 'story' ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <><Smartphone className="w-4 h-4" /> Instagram Story</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================================== */}
      {/* 1. HIDDEN TEMPLATE: SQUARE POST (1080x1080) */}
      {/* ==================================================================================== */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        {/* Force exact dimensions so html-to-image never miscalculates */}
        <div 
          ref={squarePosterRef} 
          style={{ width: '1080px', height: '1080px', boxSizing: 'border-box' }}
          className="bg-[#f4f9fd] p-[40px] flex flex-col"
        >
          <div className="bg-white w-full h-full rounded-[3.5rem] shadow-xl p-[48px] flex flex-col border border-white box-border">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-[30px] mb-[30px] shrink-0 h-[140px]">
              <div className="flex items-center gap-6">
                <img src={logo} className="w-[100px] h-[100px] rounded-full shadow-sm border border-gray-100" alt="Logo" crossOrigin="anonymous" />
                <div className="flex flex-col justify-center">
                  <h1 className="text-[46px] font-black text-gray-900 tracking-tight" style={{ lineHeight: '1.2' }}>The Fishy Mart</h1>
                  <p className="text-[18px] font-bold text-[#0583f2] tracking-widest uppercase">#FishKhaoOnlyFresh</p>
                </div>
              </div>
              <div className="text-right bg-[#0583f2] text-white px-8 py-5 rounded-[2rem] shadow-md flex flex-col justify-center">
                <p className="text-[14px] font-bold uppercase tracking-widest opacity-90 mb-1" style={{ lineHeight: '1.2' }}>Today's Menu</p>
                <p className="text-[28px] font-black" style={{ lineHeight: '1.2' }}>{todayDate}</p>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-x-[36px] gap-y-[24px] flex-1 content-start">
              {activeMenu.slice(0, 10).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-[1.5rem] p-3 shadow-sm h-[115px] box-border">
                  
                  <div className="w-[84px] h-[84px] rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                    <img 
                      src={getFullImageUrl(product.images?.[0] || product.imageName || 'placeholder.jpg')} 
                      className="w-full h-full object-cover"
                      alt={product.name}
                      crossOrigin="anonymous" 
                    />
                  </div>
                  
                  <div className="flex-1 overflow-hidden pr-2 flex flex-col justify-center">
                    <p className="text-[24px] font-extrabold text-gray-800 line-clamp-2" style={{ lineHeight: '1.3' }}>
                      {product.name}
                    </p>
                  </div>
                  
                  {showPrices && (
                    <div className="bg-[#eef6ff] text-[#0583f2] px-4 h-[56px] rounded-xl shrink-0 flex items-center whitespace-nowrap">
                      <span className="text-[24px] font-black" style={{ lineHeight: '1' }}>₹{product.price}</span>
                      <span className="text-[16px] font-bold ml-1 opacity-80" style={{ lineHeight: '1' }}>/{product.unit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-[24px] flex justify-between items-center border-t-2 border-gray-100 shrink-0 h-[80px]">
              <p className="text-[22px] font-bold text-gray-500">📍 Freshly Cleaned & Delivered Home</p>
              <div className="bg-gray-50 text-gray-800 px-6 py-3 rounded-full border border-gray-100 flex items-center">
                <p className="text-[22px] font-bold"><span className="text-[#0583f2] mr-2">🌐</span>www.thefishymart.in</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* ==================================================================================== */}
      {/* 2. HIDDEN TEMPLATE: TALL STORY (1080x1920) */}
      {/* ==================================================================================== */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        {/* Outer container forces exactly 1080x1920 to prevent scaling errors */}
        <div 
          ref={storyPosterRef} 
          style={{ width: '1080px', height: '1920px', boxSizing: 'border-box' }}
          className="bg-[#f4f9fd] p-[40px] flex flex-col" 
        >
          {/* Inner Card */}
          <div className="w-[1000px] h-[1840px] rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative bg-white box-border">
            
            {/* EXACTLY 20% HEIGHT (368px) - Thin Desktop Banner */}
            <div className="w-full h-[368px] shrink-0 relative bg-blue-50">
               <img 
                  src="https://tnwmnsdfdjbeifqssxuu.supabase.co/storage/v1/object/public/banners/hero-desktop.jpg" 
                  alt="Hero Banner" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  crossOrigin="anonymous"
               />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* The Floating Date Badge - Anchored on the line */}
            <div className="absolute top-[368px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[800px] bg-[#0583f2] text-white rounded-[3rem] px-[40px] py-[24px] text-center shadow-xl border-[8px] border-white shrink-0">
              <p className="text-[22px] font-bold uppercase tracking-widest opacity-90 mb-[4px]" style={{ lineHeight: '1.2' }}>Today's Menu</p>
              <p className="text-[44px] font-black" style={{ lineHeight: '1.2' }}>{todayDate}</p>
            </div>

            {/* BOTTOM 80% - Product List */}
            <div className="flex-1 w-full flex flex-col px-[60px] pt-[90px] pb-[40px] shrink-0 bg-white relative z-20 box-border">
              
              <div className="text-center mb-[40px] shrink-0">
                <h2 className="text-[46px] font-black text-gray-900" style={{ lineHeight: '1.2' }}>Available Right Now</h2>
                <p className="text-[24px] font-bold text-gray-400 mt-[8px]">Swipe up to order online</p>
              </div>

              {/* Product Rows - Massive breathing room, no squishing allowed */}
              <div className="flex flex-col gap-[20px] flex-1 overflow-hidden">
                {activeMenu.slice(0, 9).map((product, idx) => ( 
                  <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-[2.5rem] p-[16px] shadow-sm shrink-0 h-[130px] box-border">
                    
                    <div className="flex items-center gap-[24px] flex-1 overflow-hidden pr-[20px] h-full">
                      <div className="w-[96px] h-[96px] rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                        <img 
                          src={getFullImageUrl(product.images?.[0] || product.imageName || 'placeholder.jpg')} 
                          className="w-full h-full object-cover"
                          alt={product.name}
                          crossOrigin="anonymous" 
                        />
                      </div>
                      
                      <div className="flex-1 overflow-hidden flex flex-col justify-center h-full">
                        <p className="text-[34px] font-extrabold text-gray-800 line-clamp-2" style={{ lineHeight: '1.3' }}>
                          {product.name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Price */}
                    {showPrices && (
                      <div className="bg-[#eef6ff] text-[#0583f2] px-[28px] h-[72px] rounded-[1.5rem] shrink-0 flex items-center whitespace-nowrap">
                        <span className="text-[36px] font-black" style={{ lineHeight: '1' }}>₹{product.price}</span>
                        <span className="text-[20px] font-bold ml-[6px] opacity-80" style={{ lineHeight: '1' }}>/{product.unit}</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto bg-gray-900 text-white rounded-[2.5rem] p-[40px] text-center flex flex-col justify-center gap-[12px] shadow-xl shrink-0 h-[180px] box-border">
                <p className="text-[40px] font-bold" style={{ lineHeight: '1.2' }}>
                  Order at: <span className="text-[#0583f2]">www.fishymart.in</span>
                </p>
                <p className="text-[26px] font-medium text-gray-400" style={{ lineHeight: '1.2' }}>
                  📍 Freshly Cleaned & Delivered Home
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}