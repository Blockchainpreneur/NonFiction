
import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (answers: any) => void;
}

const steps = [
  {
    id: 'time',
    question: "¿Sientes que te falta tiempo para leer libros completos?",
    options: ["Siempre", "A veces", "Tengo tiempo pero pierdo el enfoque", "No es mi problema principal"]
  },
  {
    id: 'focus',
    question: "¿Te cuesta concentrarte en textos largos hoy en día?",
    options: ["Mucho", "Moderadamente", "Casi nada", "Prefiero audio siempre"]
  },
  {
    id: 'anxiety',
    question: "¿Sufres de ansiedad por el exceso de información?",
    options: ["Sí, me abruma", "Un poco", "Lo controlo bien"]
  },
  {
    id: 'habits',
    question: "¿Quieres mejorar tus hábitos a través del conocimiento?",
    options: ["Es mi prioridad", "Es secundario", "No estoy seguro"]
  },
  {
    id: 'clarity',
    question: "¿Buscas claridad mental en temas específicos?",
    options: ["Sí, desesperadamente", "Me vendría bien", "No"]
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (option: string) => {
    const newAnswers = { ...answers, [steps[currentStep].id]: option };
    setAnswers(newAnswers);
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-white z-[100] p-8 flex flex-col">
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <span className="text-indigo-600 font-semibold mb-4 text-sm tracking-widest uppercase">Paso {currentStep + 1} de {steps.length}</span>
        <h2 className="text-3xl font-bold text-gray-900 mb-10 leading-tight">
          {steps[currentStep].question}
        </h2>

        <div className="space-y-4">
          {steps[currentStep].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className="w-full p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <span className="text-lg font-medium text-gray-700 group-hover:text-indigo-900">{option}</span>
              <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-indigo-600 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-indigo-600 opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="py-8 text-center text-gray-400 text-sm">
        Tus respuestas nos ayudan a personalizar tu experiencia.
      </div>
    </div>
  );
};

export default Onboarding;
