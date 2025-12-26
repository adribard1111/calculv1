
import React from 'react';
import { GameStats, GameMode } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RotateCcw, Timer, Zap, AlertCircle, Check } from 'lucide-react';

interface StatsScreenProps {
  stats: GameStats;
  onRestart: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onRestart }) => {
  const correctQuestions = stats.history.filter(q => q.isCorrect);
  const correctCount = correctQuestions.length;
  const wrongCount = stats.history.length - correctCount;
  const percentage = Math.round((correctCount / stats.history.length) * 100) || 0;
  
  const incorrectQuestions = stats.history.filter(q => !q.isCorrect);

  const avgTime = correctCount > 0 
    ? (correctQuestions.reduce((acc, q) => acc + q.timeTaken, 0) / correctCount) / 1000 
    : 0;
    
  const fastestTime = correctCount > 0
    ? Math.min(...correctQuestions.map(q => q.timeTaken)) / 1000
    : 0;

  const data = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: wrongCount },
  ];

  const COLORS = ['#013220', '#4a0404']; 

  const getGameTitle = (mode: GameMode) => {
    switch(mode) {
      case GameMode.ESTIMATION: return "Estimation";
      case GameMode.PROPORTION: return "Proportion";
      case GameMode.COMPOUND: return "Compound";
      case GameMode.RECIPROCAL: return "Reciprocals";
      case GameMode.GROWTH: return "Growth";
      case GameMode.BIG_PERCENT: return "% of big numbers";
      case GameMode.CLEAN_DIVISION: return "Division";
      default: return "12s";
    }
  }

  const formatAnswer = (val: number, mode: GameMode) => {
    if (mode === GameMode.BIG_PERCENT) return `${val.toLocaleString()} mille`;
    const isApprox = mode === GameMode.ESTIMATION || mode === GameMode.RECIPROCAL || mode === GameMode.GROWTH || mode === GameMode.PROPORTION;
    if (isApprox) return val.toFixed(1);
    // For integer-based games, only show decimal if it exists
    return val % 1 !== 0 ? val.toFixed(1) : val.toString();
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 px-6 max-w-4xl mx-auto pb-12">
      
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-serif italic text-primary">{getGameTitle(stats.mode)}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-12">
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-1 min-h-[300px]">
          <div className="relative w-40 h-40 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-light font-sans tracking-tighter text-success">{percentage}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-secondary">Accuracy</p>
          </div>
        </div>

        <div className="flex flex-col p-8 bg-gray-50 rounded-[2rem] border border-gray-100 col-span-1 lg:col-span-1 justify-center space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary mb-1">
                    <Timer size={16} />
                    <span className="text-sm tracking-wide">Average Pace</span>
                </div>
                <div className="text-5xl font-thin font-sans tracking-tighter text-primary">
                    {avgTime.toFixed(2)}<span className="text-2xl text-gray-400 ml-1">s</span>
                </div>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary mb-1">
                    <Zap size={16} />
                    <span className="text-sm tracking-wide">Fastest</span>
                </div>
                <div className="text-5xl font-thin font-sans tracking-tighter text-primary">
                    {fastestTime.toFixed(2)}<span className="text-2xl text-gray-400 ml-1">s</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
                <AlertCircle size={18} />
                <span className="text-sm tracking-wide">Review</span>
            </div>
            {incorrectQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                        <Check className="text-success w-6 h-6" />
                    </div>
                    <p className="text-gray-400 text-lg">Zero errors recorded.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar space-y-3">
                    {incorrectQuestions.map((q) => (
                        <div key={q.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <span className="font-light font-sans text-xl text-gray-600 tracking-tight">{q.label}</span>
                            <div className="text-right">
                                <div className="text-xs text-danger line-through decoration-danger/50 font-mono mb-1">
                                    {formatAnswer(q.userAnswer || 0, q.mode)}
                                </div>
                                <div className="text-lg font-medium font-sans text-success">
                                    {formatAnswer(q.correctAnswer, q.mode)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      <button onClick={onRestart} className="group relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary text-white transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none">
        <RotateCcw size={24} className="group-hover:-rotate-180 transition-transform duration-500" />
      </button>
    </div>
  );
};

export default StatsScreen;
