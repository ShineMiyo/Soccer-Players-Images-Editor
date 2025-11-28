import React from 'react';
import { Icons } from './ui/Icons';
import { Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language, setLanguage, t }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-10 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold text-white">{t('common.settings_title')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <Icons.Close size={20} />
            </button>
        </div>
        
        <div className="space-y-6">
            {/* Language Setting */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('common.language')}</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`py-2 px-4 rounded border text-sm transition-colors ${
                            language === 'en' 
                            ? 'bg-white text-black border-white font-bold' 
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500'
                        }`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('zh')}
                        className={`py-2 px-4 rounded border text-sm transition-colors ${
                            language === 'zh' 
                            ? 'bg-white text-black border-white font-bold' 
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500'
                        }`}
                    >
                        中文 (Chinese)
                    </button>
                </div>
            </div>
            
            {/* Add more global settings here in future */}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end">
             <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
             >
                 {t('common.close')}
             </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;