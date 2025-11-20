import React, { useState } from 'react';
import { MediaType } from '../types';
import { Check, Copy, Download, X, Film, ImageIcon, RotateCcw } from './Icons';

interface ResultPanelProps {
  mediaType: MediaType;
  mediaUrl: string | null;
  fileExtension?: string; // New prop to control the save format
  onClose: () => void;
  onRetry: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ 
  mediaType, 
  mediaUrl, 
  fileExtension = 'webm',
  onClose, 
  onRetry 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!mediaUrl) return;

    const date = new Date().toISOString().split('T')[0];
    // Use the provided extension, or default based on mediaType
    const ext = mediaType === 'video' ? (fileExtension || 'webm') : 'png';
    
    const filename = mediaType === 'video'
      ? `PageCap_${date}_Recording.${ext}`
      : `PageCap_${date}_Screenshot.${ext}`;

    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[600px] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Check size={14} strokeWidth={3} />
            </div>
            Capture Complete
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex p-6 gap-6">
          {/* Left: Preview Thumbnail */}
          <div className="w-1/2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 aspect-video flex items-center justify-center relative overflow-hidden group">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>
             
             {mediaType === 'video' ? (
                 <div className="text-center z-10 flex flex-col items-center w-full h-full">
                     {!mediaUrl && (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2 mt-8">
                            <Film size={32} />
                        </div>
                     )}
                     {mediaUrl ? (
                        <video 
                            src={mediaUrl} 
                            controls 
                            className="absolute inset-0 w-full h-full object-contain z-20 bg-black" 
                        />
                     ) : (
                         <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Video Ready</p>
                     )}
                 </div>
             ) : (
                <div className="text-center z-10 flex flex-col items-center w-full h-full justify-center overflow-auto p-2">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-sm" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                          <ImageIcon size={32} />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Screenshot Ready</p>
                      </div>
                    )}
                </div>
             )}
          </div>

          {/* Right: Actions */}
          <div className="w-1/2 flex flex-col justify-center space-y-3">
            <div className="text-sm text-gray-500 mb-2">
                Ready to save to <span className="font-mono text-xs bg-gray-100 px-1 rounded text-gray-700">Downloads/</span>
            </div>

            <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md active:scale-95 transform duration-100"
            >
                <Download size={18} />
                {mediaType === 'video' ? `Download .${fileExtension?.toUpperCase()}` : 'Download PNG'}
            </button>
            
            <button 
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors ${copied ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-700 dark:text-gray-300'}`}
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : (mediaType === 'video' ? 'Copy File Path' : 'Copy Image')}
            </button>

            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button 
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 flex-1 py-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    <RotateCcw size={16} />
                    New Capture
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};