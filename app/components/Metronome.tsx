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
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
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
      <br></br>
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
                d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span style={{ textDecoration: "underline" }}>
              <strong>miiiwdy</strong>
            </span>
          </a>
        </div>
      </footer>
      <style jsx>{`
        @keyframes vibrate {
          0% {
            transform: translate(0);
          }
          10% {
            transform: translate(-2px, 0);
          }
          20% {
            transform: translate(2px, 0);
          }
          30% {
            transform: translate(-2px, 0);
          }
          40% {
            transform: translate(2px, 0);
          }
          50% {
            transform: translate(0);
          }
          100% {
            transform: translate(0);
          }
        }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 5px;
          outline: none;
        }

        option {
          background-color: #2b2b2b;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Metronome;
