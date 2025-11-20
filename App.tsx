import React, { useState, useEffect, useRef } from 'react';
import { ControlBar } from './components/ControlBar';
import { ResultPanel } from './components/ResultPanel';
import { AppState, AppConfig, DEFAULT_CONFIG, MediaType } from './types';

const App: React.FC = () => {
  // App Logic State
  const [appState, setAppState] = useState<AppState>('idle');
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [capturedFileExtension, setCapturedFileExtension] = useState<string>('webm');
  
  // Real Capture State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulation/UI State
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Refs for intervals and content
  const timerInterval = useRef<any>(null);
  const scrollInterval = useRef<any>(null);
  const mockPageRef = useRef<HTMLDivElement>(null);
  const mockContentRef = useRef<HTMLDivElement>(null);

  // --- Real Capture Logic ---

  const startRealRecording = async () => {
    try {
      // 1. Request Screen/Tab Permission
      // Note: metadata.json must include "display-capture" for this to work in iframes
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' }, 
        audio: true
      });
      
      streamRef.current = stream;

      // 2. Setup MediaRecorder with format detection
      // Prefer MP4 if available, then WebM VP9, then standard WebM
      const mimeTypes = [
        "video/mp4",
        "video/webm;codecs=h264",
        "video/webm;codecs=vp9",
        "video/webm"
      ];
      
      const selectedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || "video/webm";
      
      // Determine extension for the ResultPanel
      const extension = selectedType.includes('mp4') ? 'mp4' : 'webm';
      setCapturedFileExtension(extension);

      console.log(`Starting recording with mimeType: ${selectedType}`);

      const options = { mimeType: selectedType };
      const recorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedType });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        
        // Stop all tracks to release camera/screen
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setAppState('finished');
        setIsPaused(false);
      };

      // 3. Start
      recorder.start(1000); // Collect 1s chunks
      setMediaType('video');
      setTimer(0);
      setAppState('recording');

      // Handle user clicking "Stop sharing" in browser UI
      stream.getVideoTracks()[0].onended = () => {
        handleStop();
      };

    } catch (err) {
      console.error("Error starting recording:", err);
      // Customize error message based on error type
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert("Recording cancelled or permission denied.");
      } else {
        alert(`Could not start recording: ${err instanceof Error ? err.message : String(err)}`);
      }
      setAppState('idle');
    }
  };

  const startRealScreenshot = async () => {
    setMediaType('image');
    setCapturedFileExtension('png');
    setAppState('screenshotting');
    setProgress(0);

    // 1. Simulate "Scanning/Scrolling" for UX effect
    let simulatedScroll = 0;
    let step = 0;
    const totalSteps = 20;
    
    scrollInterval.current = setInterval(async () => {
      step++;
      const next = (step / totalSteps) * 100;

      if (step >= totalSteps) {
          setProgress(100);
          clearInterval(scrollInterval.current);
          
          // 2. Prepare for Capture
          // Scroll to top to ensure html2canvas captures everything correctly without offsets
          if (mockPageRef.current) {
            mockPageRef.current.scrollTo(0, 0);
          }
          
          // Small delay to allow DOM to settle/repaint after scroll
          await new Promise(resolve => setTimeout(resolve, 500));

          // 3. Actually Capture the DOM using html2canvas
          if (mockContentRef.current && (window as any).html2canvas) {
            try {
              const canvas = await (window as any).html2canvas(mockContentRef.current, {
                scale: 2, // High Res
                useCORS: true, // Allow cross-origin images if configured correctly
                allowTaint: true,
                backgroundColor: '#ffffff',
                scrollY: 0, // Force start from top
                // Explicitly set dimensions to avoid clipping
                width: mockContentRef.current.scrollWidth,
                height: mockContentRef.current.scrollHeight
              });
              
              const url = canvas.toDataURL('image/png');
              setMediaUrl(url);
              setAppState('finished');
            } catch (e) {
              console.error("Screenshot failed:", e);
              alert("Screenshot failed to generate.");
              setAppState('idle');
            }
          } else {
            // Fallback if html2canvas is missing
            console.warn("html2canvas not found");
            setAppState('idle');
          }
      } else {
        setProgress(next);
        simulatedScroll += 50;
        setScrollPosition(simulatedScroll);
      }
    }, 100);
  };

  // --- Effects for Timer ---

  useEffect(() => {
    if (appState === 'recording' && !isPaused) {
      timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [appState, isPaused]);

  // Cleanup URL on retry
  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // --- Handlers ---

  const handleStartRecording = () => {
    startRealRecording();
  };

  const handleStartScreenshot = () => {
    startRealScreenshot();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (isPaused) mediaRecorderRef.current.resume();
      else mediaRecorderRef.current.pause();
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (appState === 'screenshotting') {
        // If stopped manually during screenshot
        if (scrollInterval.current) clearInterval(scrollInterval.current);
        setAppState('idle');
    }
  };

  const handleRetry = () => {
    setAppState('idle');
    setTimer(0);
    setProgress(0);
    setScrollPosition(0);
    setMediaUrl(null);
    recordedChunksRef.current = [];
  };

  // Hotkey Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey) {
        if (e.code === 'KeyR' && appState === 'idle') handleStartRecording();
        if (e.code === 'KeyS' && appState === 'idle') handleStartScreenshot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState]);

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* --- 1. Simulated Browser Background Content --- */}
      <div 
        ref={mockPageRef}
        className="w-full h-full overflow-y-auto custom-scrollbar transition-transform duration-300 ease-linear"
        style={{ 
            // We animate scroll via CSS transform for the visual effect during screenshot
            transform: appState === 'screenshotting' ? `translateY(-${Math.min(scrollPosition, 500)}px)` : 'none',
        }}
      >
        {/* This inner div is what we actually capture with html2canvas */}
        <div ref={mockContentRef} className="max-w-6xl mx-auto bg-white min-h-[200vh] shadow-lg mt-4 mb-4 rounded-lg p-8 space-y-8">
            {/* Fake Header */}
            <header className="flex items-center justify-between pb-6 border-b">
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
                <div className="flex gap-4">
                    <div className="h-8 w-20 bg-gray-100 rounded"></div>
                    <div className="h-8 w-20 bg-gray-100 rounded"></div>
                    <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
                </div>
            </header>
            
            {/* Fake Hero Section */}
            <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 flex flex-col justify-center gap-4">
                <div className="h-10 w-2/3 bg-blue-100 rounded"></div>
                <div className="h-4 w-1/2 bg-blue-50/50 rounded"></div>
                <div className="h-10 w-32 bg-blue-600 rounded-lg mt-4"></div>
            </div>

            {/* Fake Grid Content */}
            <div className="grid grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-50 rounded-lg border border-gray-100 p-4 flex flex-col gap-3">
                        <div className="h-32 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>

            {/* More Content to make it long */}
            <div className="space-y-4 pt-8 border-t">
                 <h3 className="text-xl font-bold text-gray-300">Footer Content</h3>
                 {[...Array(5)].map((_,i) => (
                     <div key={`txt-${i}`} className="space-y-2">
                         <div className="h-4 w-full bg-gray-100 rounded"></div>
                         <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                         <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
                     </div>
                 ))}
            </div>
        </div>
      </div>

      {/* --- 2. UI Overlay Layer --- */}
      
      <div className="absolute top-0 right-0 p-6 z-50 pointer-events-none">
        <div className="pointer-events-auto">
             <ControlBar 
                appState={appState}
                config={config}
                timer={timer}
                progress={progress}
                isPaused={isPaused}
                onStartRecording={handleStartRecording}
                onStartScreenshot={handleStartScreenshot}
                onPauseRecording={handlePause}
                onStopRecording={handleStop}
                onCancelScreenshot={handleRetry}
                onOpenSettings={() => alert("Settings implementation not included in this demo.")}
             />
        </div>
      </div>

      {/* --- 3. Result Modal --- */}
      {appState === 'finished' && (
        <ResultPanel 
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            fileExtension={capturedFileExtension}
            onClose={handleRetry} 
            onRetry={handleRetry} 
        />
      )}

      {/* --- 4. Dev Info --- */}
      <div className="absolute bottom-4 left-4 z-50 bg-black/80 text-white/80 p-4 rounded-lg text-xs max-w-sm backdrop-blur-md transition-opacity hover:opacity-100 opacity-50">
        <p className="font-bold mb-1 text-white">PageCap Real Capture Demo</p>
        <ul className="list-disc pl-4 space-y-1 opacity-70">
            <li><strong>Recording:</strong> Uses <code>getDisplayMedia</code>. Prefer MP4 if available.</li>
            <li><strong>Screenshot:</strong> Real DOM capture via <code>html2canvas</code>.</li>
            <li><strong>Note:</strong> If recording fails, ensure 'Display Capture' permission is active.</li>
        </ul>
      </div>

    </div>
  );
};

export default App;