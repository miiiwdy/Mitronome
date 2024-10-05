"use client";

import { useState, useEffect, useRef } from "react";
import YouTubeSearch from "./YoutubeSearch";

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [oscType, setOscType] = useState<OscillatorType>("sine");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const playSound = async () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    const osc = audioCtxRef.current.createOscillator();
    osc.type = oscType;
    osc.frequency.setValueAtTime(440, audioCtxRef.current.currentTime);

    const gainNode = audioCtxRef.current.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);

    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.1);
  };

  const startMetronome = () => {
    if (isPlaying) return;
    const interval = (60 / bpm) * 1000;
    const id = setInterval(() => {
      playSound();
    }, interval);
    setIsPlaying(true);
    setTimerId(id);
  };

  const stopMetronome = () => {
    if (timerId) {
      clearInterval(timerId);
      setIsPlaying(false);
      setTimerId(null);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const newInterval = (60 / bpm) * 1000;
      clearInterval(timerId!);
      const id = setInterval(() => {
        playSound();
      }, newInterval);
      setTimerId(id);
    }
  }, [bpm]);

  const increaseBPM = () => {
    if (bpm < 300) setBpm(bpm + 1);
  };

  const decreaseBPM = () => {
    if (bpm > 40) setBpm(bpm - 1);
  };

  useEffect(() => {
    if (isPlaying) {
      const vibrationDuration = (60 / bpm) * 1000;
      if (containerRef.current) {
        containerRef.current.style.animation = `vibrate ${vibrationDuration}ms ease-in-out infinite`;
      }
    } else {
      if (containerRef.current) {
        containerRef.current.style.animation = "none";
      }
    }
  }, [isPlaying, bpm]);

  const getDynamicColor = (bpm: number) => {
    const minBPM = 40;
    const maxBPM = 300;

    const normalizedBPM = (bpm - minBPM) / (maxBPM - minBPM);

    const startColor = { r: 173, g: 216, b: 230 };
    const midColor = { r: 216, g: 191, b: 216 };
    const endColor = { r: 255, g: 165, b: 0 };

    let r, g, b;

    if (normalizedBPM <= 0.5) {
      const factor = normalizedBPM * 2;
      r = Math.floor(startColor.r + factor * (midColor.r - startColor.r));
      g = Math.floor(startColor.g + factor * (midColor.g - startColor.g));
      b = Math.floor(startColor.b + factor * (midColor.b - startColor.b));
    } else {
      const factor = (normalizedBPM - 0.5) * 2;
      r = Math.floor(midColor.r + factor * (endColor.r - midColor.r));
      g = Math.floor(midColor.g + factor * (endColor.g - midColor.g));
      b = Math.floor(midColor.b + factor * (endColor.b - midColor.b));
    }

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-blue">
      <div
        ref={containerRef}
        className={`bg-transparent border border-gray-400 rounded-lg p-6 shadow-md w-3/5 mx-auto transition-transform duration-200`}
      >
        <h1
          style={{ color: getDynamicColor(bpm) }}
          className="text-3xl font-bold mb-6 text-white text-center"
        >
          Metronome
        </h1>
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={decreaseBPM}
            className="text-white font-bold py-2 px-4 rounded-l-lg"
            style={{
              backgroundColor: getDynamicColor(bpm),
              transition: "background-color 0.3s",
            }}
          >
            -
          </button>
          <input
            type="range"
            min="40"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="slider mx-2 w-full rounded-lg"
            style={{
              background: `linear-gradient(to right, ${getDynamicColor(
                40
              )} 0%, ${getDynamicColor(300)} 100%)`,
            }}
          />
          <button
            onClick={increaseBPM}
            className="text-white font-bold py-2 px-4 rounded-r-lg"
            style={{
              backgroundColor: getDynamicColor(bpm),
              transition: "background-color 0.3s",
            }}
          >
            +
          </button>
        </div>
        <div
          className="text-xl text-center mb-4"
          style={{ color: getDynamicColor(bpm) }}
        >
          <strong>{bpm}</strong> BPM
        </div>
        <div className="flex items-center justify-center mb-6">
          <select
            id="oscillatorType"
            value={oscType}
            onChange={(e) => setOscType(e.target.value as OscillatorType)}
            className="border rounded-lg px-4 py-2 text-white bg-transparent"
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
          </select>
        </div>
        <div className="flex justify-center">
          <button
            onClick={isPlaying ? stopMetronome : startMetronome}
            className={`border border-gray-400 font-bold py-2 px-6 rounded-lg transition-transform duration-200 bg-transparent ${
              isPlaying ? "bg-red-500 hover:bg-red-600 " : "hover:bg-orange-500"
            }`}
          >
            {isPlaying ? "Stop" : "Start"}
          </button>
        </div>
      </div>
      <br />
      <YouTubeSearch />
      <footer className="w-full text-center py-4 bg-dark-blue text-white">
        <div className="flex justify-center items-center">
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          <a
            href="https://github.com/miiiwdy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center mx-2"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path
                d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50001C0.25 11.505 3.49635 14.75 7.49933 14.75C11.5023 14.75 14.7487 11.505 14.7487 7.50001C14.7487 3.49593 11.5023 0.25 7.49933 0.25ZM7.49933 13.0313C4.79066 13.0313 2.96875 11.2094 2.96875 8.49999C2.96875 7.87107 3.08649 7.30347 3.30956 6.79211C3.15642 6.76641 2.99056 6.75949 2.82692 6.75949C2.15873 6.75949 1.64625 7.27184 1.64625 8.05773C1.64625 8.81509 1.89481 9.58273 2.36492 10.1476C2.85715 10.7567 3.46338 11.0313 4.05423 11.0313C4.96433 11.0313 5.69494 10.2989 5.69494 9.45417C5.69494 9.07642 5.5548 8.77383 5.31455 8.57341C5.65273 8.39077 6.26369 8.51185 6.96375 8.62567C7.13375 8.73084 7.30975 8.85135 7.49933 8.95161C7.6889 9.05187 7.89718 9.18877 8.10325 9.27661C8.0828 9.41978 8.05967 9.56373 8.05967 9.7098C8.05967 10.7194 8.68484 11.4375 9.49933 11.4375C10.553 11.4375 11.375 10.6826 11.375 9.63125C11.375 8.64454 10.6583 7.81953 9.84019 7.57676C9.83251 7.58949 9.82525 7.60233 9.8175 7.6151C9.77999 7.76158 9.73656 7.9089 9.68844 8.05773C9.37575 9.14775 8.39925 9.86667 7.49933 10.365C7.6658 10.7285 7.85767 11.0726 8.07475 11.4319C8.27863 11.7192 8.4055 11.9632 8.40663 12.2813C8.40663 12.8653 8.30982 13.0854 7.49933 13.0313Z"
                fill="currentColor"
              />
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Metronome;
