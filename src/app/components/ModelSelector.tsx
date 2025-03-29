import React from 'react';
import { PerplexityModel, MODEL_DISPLAY_NAMES } from '@/utils/perplexity-api';

interface ModelSelectorProps {
  selectedModel: PerplexityModel;
  onModelChange: (model: PerplexityModel) => void;
  isPro: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange,
  isPro
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Model:</span>
      <div className="flex rounded-md overflow-hidden border border-gray-700/50 shadow-sm">
        <button
          onClick={() => onModelChange('sonar')}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            selectedModel === 'sonar'
              ? 'bg-[#9c6bff] text-white'
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {MODEL_DISPLAY_NAMES['sonar']}
        </button>
        <button
          onClick={() => onModelChange('sonar-reasoning-pro')}
          disabled={!isPro}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            selectedModel === 'sonar-reasoning-pro'
              ? 'bg-[#00c8ff] text-white'
              : isPro
              ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-800/80 text-gray-500 cursor-not-allowed'
          }`}
        >
          {MODEL_DISPLAY_NAMES['sonar-reasoning-pro']}
          {!isPro && <span className="ml-1 text-[10px]">(Upgrade)</span>}
        </button>
      </div>
    </div>
  );
};

export default ModelSelector;
