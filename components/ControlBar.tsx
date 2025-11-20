import React, { useState, useEffect } from 'react';
import { AppState, AppConfig, MediaType } from '../types';
import {
  Video, Camera, Settings, Pause, Square,
  Mic, MicOff, X, Monitor, Clock
} from './Icons';

interface ControlBarProps {
  appState: AppState;
  config: AppConfig;
  onStartRecording: () => void;
  onStartScreenshot: () => void;
  onPauseRecording: () => void;
  onStopRecording: () => void;
  onCancelScreenshot: () => void;
  onOpenSettings: () => void;
  timer: number;
  progress: number;
  isPaused: boolean;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const ControlBar: React.FC<ControlBarProps> = ({
  appState,
  config,
  onStartRecording,
  onStartScreenshot,
  onPauseRecording,
  onStopRecording,
  onCancelScreenshot,
  onOpenSettings,
  timer,
  progress,
  isPaused,
}) => {
  // State 1: Idle
  if (appState === 'idle') {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-500/30 shadow-lg">
              P
            </div>
            <span className="font-bold text-lg text-gray-800 dark:text-white">PageCap</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={onStartRecording}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition-colors group border border-transparent hover:border-red-200"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                <Video size={20} fill="currentColor" className="opacity-20 text-red-500 absolute" />
                <Video size={20} />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-800 text-sm">录屏</span>
            </button>

            <button
              onClick={onStartScreenshot}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-xl transition-colors group border border-transparent hover:border-emerald-200"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 group-hover:scale-110 transition-transform">
                <Camera size={20} />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-800 text-sm">长截图</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {config.audioSource !== 'none' ? <Mic size={12} /> : <MicOff size={12} />}
              <span>{config.audioSource === 'tab' ? 'Tab Audio' : config.audioSource === 'mic' ? 'Microphone' : 'Muted'}</span>
              <span className="text-gray-300">•</span>
              <span>{config.videoQuality.toUpperCase()}</span>
            </div>
            <button onClick={onOpenSettings} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Recording
  if (appState === 'recording') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-full shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 p-2 pr-4 animate-in fade-in zoom-in duration-300">
        <div className="relative flex items-center justify-center w-10 h-10">
           <div className="absolute w-full h-full bg-red-100 rounded-full animate-ping opacity-75"></div>
           <div className="relative w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
        </div>

        <div className="flex flex-col mr-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Recording</span>
            <span className="font-mono font-medium text-gray-800 dark:text-gray-100 leading-none">{formatTime(timer)}</span>
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <button 
            onClick={onPauseRecording}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
            title={isPaused ? "Resume" : "Pause"}
        >
            {isPaused ? <Video size={20} /> : <Pause size={20} />}
        </button>

        <button 
            onClick={onStopRecording}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-red-500/20 shadow-lg transition-all hover:scale-105 active:scale-95"
            title="Stop & Save"
        >
            <Square size={18} fill="currentColor" />
        </button>
      </div>
    );
  }

  // State 3: Screenshotting
  if (appState === 'screenshotting') {
    return (
      <div className="w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 animate-in fade-in slide-in-from-right-5 duration-300">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-600">
                <Camera size={18} className="animate-bounce" />
                <span className="font-semibold text-sm">Scrolling Capture...</span>
            </div>
            <button onClick={onCancelScreenshot} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
            </button>
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
                <span>Processing</span>
                <span>Screen {Math.ceil(progress / 20) + 1}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>
    );
  }

  return null;
};