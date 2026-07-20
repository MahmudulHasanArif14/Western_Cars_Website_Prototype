"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110"
      aria-label="Toggle sound"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
