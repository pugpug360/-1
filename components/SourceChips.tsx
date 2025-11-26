import React from 'react';
import { GroundingMetadata } from '../types';
import { ExternalLink } from 'lucide-react';

interface Props {
  metadata?: GroundingMetadata;
}

export const SourceChips: React.FC<Props> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  // Deduplicate links based on URI
  const uniqueChunks = metadata.groundingChunks.reduce((acc, current) => {
    const x = acc.find(item => item.web?.uri === current.web?.uri);
    if (!x && current.web) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as typeof metadata.groundingChunks);

  return (
    <div className="mt-6 pt-6 border-t border-slate-700">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        參考文獻與來源 Reference Sources
      </h4>
      <div className="flex flex-wrap gap-2">
        {uniqueChunks.map((chunk, idx) => (
          chunk.web ? (
            <a
              key={idx}
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 rounded-full transition-all duration-200"
            >
              <span className="text-xs text-slate-300 group-hover:text-emerald-300 truncate max-w-[200px]">
                {chunk.web.title || "Source"}
              </span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-emerald-400" />
            </a>
          ) : null
        ))}
      </div>
    </div>
  );
};