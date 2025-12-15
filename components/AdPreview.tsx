import React from 'react';

interface AdPreviewProps {
  headline: string;
  headlinePart2?: string;
  description: string;
  displayUrl: string;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ headline, headlinePart2, description, displayUrl }) => {
  // Format the display URL to look like Google Ads (lowercase, remove protocol)
  const formattedUrl = displayUrl
    .replace(/(^\w+:|^)\/\//, '')
    .split('/')[0]
    .toLowerCase();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-[600px] font-roboto">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold text-black text-xs">Sponsored</span>
        <div className="text-sm text-[#202124] flex items-center">
            <div className="w-1 h-1 bg-[#202124] rounded-full mx-1"></div>
            {formattedUrl}
        </div>
        <div className="ml-auto text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
        </div>
      </div>
      <a href="#" className="block group cursor-pointer" onClick={(e) => e.preventDefault()}>
        <h3 className="text-xl text-[#1a0dab] hover:underline font-normal leading-snug">
          {headline} {headlinePart2 ? `| ${headlinePart2}` : ''}
        </h3>
        <p className="text-sm text-[#4d5156] mt-1 leading-relaxed">
          {description}
        </p>
      </a>
      
      {/* Sitelink Extensions (Mock) */}
      <div className="mt-3 flex gap-4 text-sm text-[#1a0dab]">
        <span className="hover:underline cursor-pointer">Contact Us</span>
        <span className="hover:underline cursor-pointer">Our Services</span>
        <span className="hover:underline cursor-pointer">Get a Quote</span>
      </div>
    </div>
  );
};
