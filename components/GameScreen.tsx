import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, GameMode } from '../types';
import { Heart, Check, X as XIcon, Delete, ArrowRight, Timer, ArrowRight as ArrowRightIcon } from 'lucide-react';

interface GameScreenProps {
  onGameEnd: (history: Question[], lives: number) => void;
  maxLives: number;
  totalQuestions: number;
  mode: GameMode;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd, maxLives, totalQuestions, mode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Timer State
  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  const generateQuestion = useCallback((index: number, gameMode: GameMode): Question => {
    let a = 0;
    let b = 0;
    let correctAnswer = 0;
    let label = '';

    switch (gameMode) {
      case GameMode.CLASSIC_12: {
        a = Math.floor(Math.random() * 11) + 2;
        b = 12;
        correctAnswer = a * b;
        label = `${a} × ${b}`;
        break;
      }
      case GameMode.ESTIMATION: {
        b = Math.floor(Math.random() * 14) + 2;
        const targetResult = Math.floor(Math.random() * 95) + 5;
        const noise = Math.floor(Math.random() * b) - (b / 2);
        a = Math.max(b + 1, (targetResult * b) + Math.floor(noise));
        correctAnswer = a / b;
        label = `${a} ÷ ${b}`;
        break;
      }
      case GameMode.PROPORTION: {
        const bases = [10, 20, 25, 40, 50, 60, 80, 100, 120, 150, 200];
        b = bases[Math.floor(Math.random() * bases.length)];
        const targetPercent = Math.floor(Math.random() * 99) + 1;
        a = Math.round((targetPercent / 100) * b);
        if (a === b) a = b - 1;
        if (a === 0) a = 1;
        correctAnswer = (a / b) * 100;
        label = `${a} of ${b}`;
        break;
      }
      case GameMode.COMPOUND: {
        const digit1 = Math.floor(Math.random() * 8) + 2;
        const digit2 = Math.floor(Math.random() * 89) + 11;
        a = digit1;
        b = digit2;
        correctAnswer = a * b;
        label = `${a} × ${b}`;
        break;
      }
      case GameMode.RECIPROCAL: {
        a = Math.floor(Math.random() * 47) + 4;
        b = 1; 
        correctAnswer = (1 / a) * 100;
        label = `1 / ${a}`;
        break;
      }
      case GameMode.GROWTH: {
        const X_a = Math.floor(Math.random() * 99) + 1;
        a = X_a * 10;
        const minVal = a * 0.2;
        const maxVal = a * 1.8;
        const min_X_b = Math.ceil(minVal / 10);
        const max_X_b = Math.floor(maxVal / 10);
        const validXbs: number[] = [];
        const start = Math.max(1, min_X_b);
        const end = Math.min(99, max_X_b);
        for (let x = start; x <= end; x++) {
            if (x !== X_a) validXbs.push(x);
        }
        if (validXbs.length > 0) {
            const X_b = validXbs[Math.floor(Math.random() * validXbs.length)];
            b = X_b * 10;
        } else {
            a = 100; b = 120;
        }
        correctAnswer = ((b - a) / a) * 100;
        label = `${a} → ${b}`;
        break;
      }
      case GameMode.BIG_PERCENT: {
        const useMultipleOfFive = Math.random() < 0.7;
        if (useMultipleOfFive) {
          a = (Math.floor(Math.random() * 19) + 1) * 5; 
        } else {
          a = Math.floor(Math.random() * 5) + 1; 
        }

        const multiplierA = Math.floor(Math.random() * 10) + 1;
        const isMillion = Math.random() < 0.5;
        b = multiplierA * (isMillion ? 1000000 : 100000);
        
        // Correct answer in 'thousands' units
        correctAnswer = ((a * b) / 100) / 1000;
        
        // Prepare label for StatsScreen display
        const bLabel = b >= 1000000 
            ? `${b/1000000} million${(b/1000000) > 1 ? 's' : ''}`
            : `${b/1000} mille`;
        label = `${a}% of ${bLabel}`;
        break;
      }
      case GameMode.CLEAN_DIVISION: {
        b = Math.floor(Math.random() * 8) + 2;
        correctAnswer = Math.floor(Math.random() * 146) + 4;
        a = b * correctAnswer;
        label = `${a} ÷ ${b}`;
        break;
      }
    }

    return {
      id: index, a, b, mode: gameMode, label, correctAnswer,
      timestamp: Date.now(), timeTaken: 0
    };
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
    }, 50);
  }, []);

  const stopTimer = useCallback(() => {
      if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
      }
  }, []);

  useEffect(() => {
    setCurrentQuestion(generateQuestion(0, mode));
    startTimer();
    return () => stopTimer();
  }, [mode, generateQuestion, startTimer, stopTimer]);

  const handleNumberClick = (num: number) => {
    if (isAnimating || feedback !== 'none') return;
    if (inputValue.replace('-', '').replace('.', '').length < 8) {
      setInputValue(prev => prev + num.toString());
    }
  };
  
  const handleDecimal = () => {
    if (isAnimating || feedback !== 'none') return;
    if (!inputValue.includes('.')) {
        setInputValue(prev => {
            if (prev === '' || prev === '-') return prev + '0.';
            return prev + '.';
        });
    }
  };

  const handleDelete = () => {
    if (isAnimating || feedback !== 'none') return;
    setInputValue(prev => prev.slice(0, -1));
  };
  
  const handleToggleSign = () => {
    if (isAnimating || feedback !== 'none') return;
    if (inputValue.startsWith('-')) {
        setInputValue(prev => prev.substring(1));
    } else {
        setInputValue(prev => '-' + prev);
    }
  };

  const handleSubmit = () => {
    if (inputValue === '' || inputValue === '-' || inputValue === '.' || isAnimating || !currentQuestion) return;

    stopTimer();
    const timeTaken = Date.now() - startTimeRef.current;
    const answer = parseFloat(inputValue);
    
    let isCorrect = false;
    if (mode === GameMode.ESTIMATION) {
        const exactValue = currentQuestion.correctAnswer;
        const diff = Math.abs(answer - exactValue);
        isCorrect = diff <= Math.abs(exactValue * 0.05);
    } else if (mode === GameMode.PROPORTION) {
        isCorrect = Math.abs(answer - currentQuestion.correctAnswer) <= 1.5;
    } else if (mode === GameMode.GROWTH) {
        const exactValue = currentQuestion.correctAnswer;
        const diff = Math.abs(answer - exactValue);
        // Tolerance is +/- 5% of the answer
        isCorrect = diff <= Math.abs(exactValue * 0.05);
    } else if (mode === GameMode.RECIPROCAL) {
        isCorrect = Math.abs(answer - currentQuestion.correctAnswer) <= 1;
    } else {
        isCorrect = answer === currentQuestion.correctAnswer;
    }

    const updatedQuestion = { ...currentQuestion, userAnswer: answer, isCorrect, timeTaken };
    const newHistory = [...history, updatedQuestion];
    
    setHistory(newHistory);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setIsAnimating(true);

    if (!isCorrect) {
      setLives(prev => prev - 1);
    }

    setTimeout(() => {
      setFeedback('none');
      setInputValue('');
      setIsAnimating(false);
      setElapsedTime(0);
      const nextLives = isCorrect ? lives : lives - 1;
      if (nextLives === 0 || currentQuestionIndex + 1 >= totalQuestions) {
        onGameEnd(newHistory, nextLives);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestion(generateQuestion(currentQuestionIndex + 1, mode));
        startTimer();
      }
    }, 800);
  };

  if (!currentQuestion) return null;

  const progressPercentage = ((currentQuestionIndex) / totalQuestions) * 100;

  const renderEquation = () => {
    const { a, b, mode } = currentQuestion;
    if (mode === GameMode.CLASSIC_12 || mode === GameMode.COMPOUND) {
      return (<>{a} <span className="text-gray-300 mx-3 text-5xl font-thin">×</span> {b}</>);
    }
    if (mode === GameMode.ESTIMATION || mode === GameMode.CLEAN_DIVISION) {
       return (<>{a} <span className="text-gray-300 mx-3 text-5xl font-thin">÷</span> {b}</>);
    }
    if (mode === GameMode.PROPORTION) {
       return (
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-4">
             <span>{a}</span>
             <span className="text-gray-300 text-3xl font-thin uppercase tracking-widest">of</span>
             <span>{b}</span>
          </div>
          <span className="text-xs text-gray-400 font-mono tracking-wide mt-1">in %</span>
        </div>
      );
    }
    if (mode === GameMode.RECIPROCAL) {
         return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col items-center">
                <span className="border-b-2 border-primary w-full text-center px-4 mb-0.5">1</span>
                <span>{a}</span>
            </div>
            <span className="text-xs text-gray-400 font-mono tracking-wide mt-1">in %</span>
        </div>
      );
    }
    if (mode === GameMode.GROWTH) {
        return (
         <div className="flex flex-col items-center">
           <div className="flex items-center gap-6">
              <span>{a}</span>
              <ArrowRightIcon className="text-gray-300 w-10 h-10" strokeWidth={1.5} />
              <span>{b}</span>
           </div>
           <span className="text-xs text-gray-400 font-mono tracking-wide mt-1">Growth %</span>
         </div>
       );
     }
     if (mode === GameMode.BIG_PERCENT) {
        const bIsMillion = b >= 1000000;
        const bFormatted = bIsMillion 
            ? `${b/1000000} million${(b/1000000) > 1 ? 's' : ''}`
            : `${b/1000} mille`;
        return (
         <div className="flex flex-col items-center">
           <div className="flex items-baseline gap-3 text-5xl md:text-6xl text-center flex-wrap justify-center">
              <span>{a}%</span>
              <span className="text-gray-300 text-3xl font-thin uppercase tracking-widest mx-2">of</span>
              <span className="font-light">{bFormatted}</span>
           </div>
         </div>
       );
     }
  };

  const isApproxMode = mode === GameMode.RECIPROCAL || mode === GameMode.GROWTH || mode === GameMode.ESTIMATION || mode === GameMode.PROPORTION;
  const isPercentMode = mode === GameMode.PROPORTION || mode === GameMode.RECIPROCAL || mode === GameMode.GROWTH;

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-between h-full px-6 py-2 overflow-hidden">
      <div className="w-full space-y-2 flex-shrink-0">
        <div className="w-full h-1 bg-gray-100 overflow-hidden rounded-full">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="flex justify-between items-center w-full text-secondary pt-1">
            <span className="font-mono text-xs tracking-wider text-gray-400 uppercase">Q.{currentQuestionIndex + 1}</span>
            <div className={`flex items-center gap-2 font-mono text-xs transition-colors duration-200 ${feedback === 'none' ? 'text-primary' : 'text-gray-300'}`}>
                <Timer size={14} />
                <span className="font-tnum min-w-[3ch]">{(elapsedTime / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex gap-1.5">
                {Array.from({ length: maxLives }).map((_, i) => (
                <Heart key={i} size={16} className={`transition-all duration-300 ${i < lives ? 'fill-danger text-danger' : 'fill-gray-100 text-gray-100'}`} />
                ))}
            </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full flex-grow py-1">
        <div className="relative flex items-center justify-center w-full mb-1 min-h-[110px]">
            <div className={`text-6xl md:text-7xl font-light font-sans text-primary tracking-tighter flex items-center justify-center transition-all duration-300 ${feedback !== 'none' ? 'opacity-10 blur-sm scale-95' : 'opacity-100 scale-100'}`}>
              {renderEquation()}
            </div>

            {feedback === 'correct' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <Check className="text-success w-24 h-24" strokeWidth={1.5} />
                {isApproxMode && (
                    <span className="mt-1 text-2xl font-light text-success font-sans">
                        {mode === GameMode.GROWTH && currentQuestion.correctAnswer > 0 ? '+' : ''}
                        {currentQuestion.correctAnswer.toFixed(1)}{mode !== GameMode.ESTIMATION ? '%' : ''}
                    </span>
                )}
                {mode === GameMode.BIG_PERCENT && (
                    <span className="mt-1 text-2xl font-light text-success font-sans">
                        {currentQuestion.correctAnswer.toLocaleString()} mille
                    </span>
                )}
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <XIcon className="text-danger w-24 h-24" strokeWidth={1.5} />
                <span className="font-mono text-2xl text-danger mt-2">
                     {isApproxMode ? currentQuestion.correctAnswer.toFixed(1) : currentQuestion.correctAnswer.toLocaleString()}
                     {mode === GameMode.BIG_PERCENT && ' mille'}
                     {(mode === GameMode.ESTIMATION) && <span className="text-xs ml-1 opacity-50 uppercase tracking-tighter">(exact)</span>}
                     {isPercentMode && <span className="text-sm ml-0.5">%</span>}
                </span>
              </div>
            )}
        </div>

        <div className="h-24 w-full flex items-center justify-center relative flex-shrink-0">
            {(mode === GameMode.GROWTH || mode === GameMode.ESTIMATION) && (
                <button 
                  onClick={handleToggleSign}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-gray-300 hover:text-primary transition-colors active:scale-95"
                  aria-label="Toggle sign"
                >
                    <div className="flex flex-col items-center leading-none text-2xl font-mono">
                        <span>+</span>
                        <span className="-mt-1">-</span>
                    </div>
                </button>
            )}

            <span className={`text-7xl md:text-8xl font-thin font-sans tracking-tight transition-all duration-200 ${inputValue ? 'text-primary' : 'text-gray-100'}`}>
                {inputValue || '0'}
            </span>
            
             {isPercentMode && (inputValue || '0') !== '0' && (
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-gray-200 font-light">%</span>
             )}
             
             {mode === GameMode.BIG_PERCENT && (inputValue || '0') !== '0' && (
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-gray-200 font-light">mille</span>
             )}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 pb-4 flex-shrink-0">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handleNumberClick(num)} className="h-14 md:h-18 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] text-2xl font-light font-sans text-primary hover:bg-gray-50 active:scale-95 transition-all focus:outline-none">
              {num}
            </button>
          ))}
          <button onClick={handleDecimal} className="h-14 md:h-18 rounded-2xl bg-white border border-gray-100 text-2xl font-light font-sans text-primary hover:bg-gray-50 active:scale-95 transition-all focus:outline-none pb-2">
            .
          </button>
          <button onClick={() => handleNumberClick(0)} className="h-14 md:h-18 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] text-2xl font-light font-sans text-primary hover:bg-gray-50 active:scale-95 transition-all focus:outline-none">
            0
          </button>
          <button onClick={handleDelete} className="h-14 md:h-18 rounded-2xl bg-white border border-gray-100 text-secondary hover:text-primary active:scale-95 transition-all flex items-center justify-center focus:outline-none">
              <Delete size={22} strokeWidth={1.5} />
          </button>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={!inputValue || inputValue === '-' || inputValue === '.'} 
          className="w-full h-16 md:h-20 rounded-2xl bg-primary text-white shadow-lg shadow-gray-200 hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed focus:outline-none group"
        >
          <ArrowRight size={28} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default GameScreen;