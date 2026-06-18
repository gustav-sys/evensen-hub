import React from 'react';

// Custom side-profile cap-toe oxford dress shoe (no fitting lucide icon exists).
export const ShoeIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 24,
  strokeWidth = 1.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* upper silhouette: heel counter (left) → collar → instep → rounded toe → sole + stacked heel */}
    <path d="M5 9.3 C5 9 5.3 8.9 5.7 8.95 C6.6 9.1 7 9.6 7.8 9.8 C8.4 9.95 8.9 9.7 9.5 9.4 C12 10.1 15.5 11.2 18.4 12.7 C19.4 13.2 20.2 13.8 20.8 14.6 C21.1 15 21.2 15.4 20.9 15.7 C20.6 15.95 20 16 19.4 16 L6.2 16 C5.7 16 5.5 16.2 5.5 16.7 L5.5 16.95 C5.5 17.1 5.4 17.2 5.2 17.2 L3 17.2 C2.8 17.2 2.7 17.1 2.7 16.9 L2.7 16 C2.7 15.85 2.8 15.75 3 15.75 L4.6 15.75 C4.5 13.8 4.6 11 5 9.3 Z" />
    {/* welt / sole line */}
    <path d="M6 15.45 C11 15.7 15 15.65 19.2 15.5" />
    {/* toe-cap seam */}
    <path d="M16.5 11.9 C17.4 13 17.7 14.2 17.4 15.4" />
    {/* lace eyelets across the instep */}
    <path d="M10.4 10.6 L11.8 10.35 M10.8 11.4 L12.2 11.15 M11.2 12.2 L12.6 11.95" />
  </svg>
);
