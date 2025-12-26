import React from 'react';
import { ChevronRight } from 'lucide-react';
import { GameMode } from '../types';

interface WelcomeScreenProps {
  onStart: (mode: GameMode) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  
  const categories = [
    {
      label: "Tables & Arithmetic",
      games: [
        {
          id: GameMode.CLASSIC_12,
          title: "12s",
          description: "Perfecting the standard table. (Exact answer)",
          detail: "12 × A"
        },
        {
          id: GameMode.COMPOUND,
          title: "Compound",
          description: "Mixed multiplication strategies. (Exact answer)",
          detail: "1d × 2d"
        },
        {
          id: GameMode.CLEAN_DIVISION,
          title: "Division",
          description: "Exact integer quotients. (Exact answer)",
          detail: "A / B"
        }
      ]
    },
    {
        label: "Applied Percentages",
        games: [
          {
            id: GameMode.PROPORTION,
            title: "Proportion",
            description: "Convert values to percentages. (+/- 1.5%)",
            detail: "A of B"
          },
          {
            id: GameMode.BIG_PERCENT,
            title: "% of big numbers",
            description: "Scale percentages to large bases. (Exact answer)",
            detail: "% of B"
          }
        ]
    },
    {
      label: "Estimation & Approximation",
      games: [
        {
          id: GameMode.ESTIMATION,
          title: "Estimation",
          description: "Division with 5% tolerance. (+/- 5%)",
          detail: "A ÷ B ≈"
        },
        {
          id: GameMode.RECIPROCAL,
          title: "Reciprocals",
          description: "Decimal to percentage precision. (+/- 1%)",
          detail: "1 / A"
        },
        {
          id: GameMode.GROWTH,
          title: "Growth",
          description: "Percentage variance over time. (+/- 5%)",
          detail: "A → B"
        }
      ]
 category: "",
    }
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-full w-full max-w-2xl animate-in fade-in duration-1000 py-6">
      <div className="w-full px-6 space-y-10 mt-4">
        {categories.map((category, catIdx) => (
          <div key={category.label} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${catIdx * 100}ms` }}>
            <h3 className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-widest pl-1">
                {category.label}
            </h3>
            
            <div className="flex flex-col border-t border-gray-50">
              {category.games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => onStart(game.id)}
                  className="group flex items-center gap-4 py-6 px-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 text-left border-b border-gray-50 last:border-0"
                >
                  <div className="flex-shrink-0 w-24 h-10 flex items-center justify-start">
                    <span className="font-mono text-[11px] font-bold text-primary tracking-tighter bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 uppercase whitespace-nowrap">
                        {game.detail}
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="text-lg font-medium text-primary leading-tight group-hover:translate-x-1 transition-transform duration-300">{game.title}</h4>
                    <p className="text-secondary text-xs font-sans tracking-tight opacity-70">{game.description}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <ChevronRight size={18} className="text-gray-200 group-hover:text-primary transition-all transform group-hover:translate-x-1 duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;