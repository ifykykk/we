import { useEffect, useState } from "react";
import './AffirmationBanner.css';

const affirmations = [
  "I can forgive myself and others.",
  "I can ask for help.",
  "I can achieve my goals.",
  "I can take the break I need.",
  "I am doing my best.",
  "I am stronger than I appear.",
  "I am okay with who I am.",
  "I am worthy of receiving love.",
  "I am growing at my own pace.",
  "I am complete on my own."
];

export default function AffirmationBanner() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % affirmations.length);
        setFade(true); // fade in
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex justify-center items-center h-[90px] md:h-[120px] bg-blue-100 overflow-hidden w-[100%] mx-auto rounded-lg shadow-md">
      {/* floating bubbles */}
      <div className="absolute w-full h-full">
        <div className="bubble"></div>
        <div className="bubble delay-200"></div>
        <div className="bubble delay-500"></div>
        <div className="bubble delay-800"></div>
      </div>

      {/* text with underline */}
      <p
        className={`text-lg md:text-xl text-blue-900 italic font-medium relative z-10 transition-opacity duration-500 px-4 text-center ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {affirmations[index]}
        <span className="block w-full h-[2px] bg-blue-900 mt-1 animate-underline"></span>
      </p>
    </div>
  );
}