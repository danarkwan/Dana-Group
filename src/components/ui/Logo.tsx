import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.3" />
        </filter>
        <filter id="innerShadow">
          <feOffset dx="0" dy="-4"/>
          <feGaussianBlur stdDeviation="3" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood floodColor="black" floodOpacity="0.2" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>
      </defs>

      {/* Glossy Background Box */}
      <rect width="112" height="112" x="4" y="4" rx="28" fill="url(#logoBg)" filter="url(#dropShadow)" />
      
      {/* Subtle overlay for glass/gloss effect */}
      <path d="M4 4 L116 4 L116 50 C80 70 40 30 4 50 Z" fill="rgba(255,255,255,0.08)" />

      {/* Pine Tree */}
      <g filter="url(#innerShadow)">
        <path 
          d="M60 25 L85 55 L72 55 L92 82 L77 82 L98 108 L22 108 L43 82 L28 82 L48 55 L35 55 Z" 
          fill="url(#treeGrad)" 
          stroke="url(#treeGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Trunk */}
        <rect x="54" y="108" width="12" height="12" rx="3" fill="url(#treeGrad)" />
      </g>
      
      {/* Decorative dot/sparkle */}
      <circle cx="95" cy="25" r="8" fill="#38BDF8" filter="url(#dropShadow)"/>
    </svg>
  );
}
