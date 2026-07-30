import Image from 'next/image';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-[#FDF8F0] z-[9999] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="relative flex flex-col items-center space-y-6 max-w-sm animate-in fade-in duration-300">
        
        {/* Glowing Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Radial Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-[#1A5C5E]/10 blur-xl scale-125 animate-pulse" />
          
          <div className="relative bg-white/80 p-5 rounded-3xl border border-[#C9D5D5]/80 shadow-md backdrop-blur-md">
            <Image
              src="/products/logo/logo.webp"
              alt="S.S. Pharmacy Loading Logo"
              width={120}
              height={50}
              className="h-14 w-auto object-contain animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-1.5">
          <h2 className="font-serif font-bold text-lg text-[#1A5C5E] tracking-widest uppercase">
            S.S. PHARMACY
          </h2>
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-widest block">
            Pure Ayurveda • Quality Assured
          </span>
        </div>

        {/* Elegant Animated Progress Bar */}
        <div className="w-48 h-1 bg-[#C9D5D5]/40 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#1A5C5E] via-[#C9943E] to-[#1A5C5E] w-full rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
