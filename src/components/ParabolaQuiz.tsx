import React, { useState } from 'react';
import { MathView } from './MathView.tsx';
import { Language, translations } from '../i18n/translations.ts';
import { Target, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

interface QuizQuestion {
  id: number;
  equation: string;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctIdx: number;
  explanation: Record<Language, string>;
}

const quizBank: QuizQuestion[] = [
  {
    id: 1,
    equation: 'y^2 = -8x',
    question: {
      en: 'What is the opening direction of this parabola?',
      es: '¿Hacia dónde abre esta parábola?',
      fr: 'Quel est le sens d\'ouverture de cette parabole ?',
      pt: 'Para onde abre esta parábola?',
      zh: '该抛物线的开口方向是？'
    },
    options: {
      en: ['Opens Right (→)', 'Opens Left (←)', 'Opens Up (↑)', 'Opens Down (↓)'],
      es: ['Abre a la Derecha (→)', 'Abre a la Izquierda (←)', 'Abre hacia Arriba (↑)', 'Abre hacia Abajo (↓)'],
      fr: ['Vers la Droite (→)', 'Vers la Gauche (←)', 'Vers le Haut (↑)', 'Vers le Bas (↓)'],
      pt: ['Para a Direita (→)', 'Para a Esquerda (←)', 'Para Cima (↑)', 'Para Baixo (↓)'],
      zh: ['向右开口 (→)', '向左开口 (←)', '向上开口 (↑)', '向下开口 (↓)']
    },
    correctIdx: 1,
    explanation: {
      en: 'The linear variable is x, so the axis is horizontal; the coefficient is -8 < 0, so it opens to the left.',
      es: 'La variable lineal es x (eje horizontal); el coeficiente es -8 < 0, por lo que abre hacia la izquierda.',
      fr: 'La variable linéaire est x (axe horizontal) ; le coefficient est négatif (-8), donc elle s\'ouvre vers la gauche.',
      pt: 'A variável linear é x (eixo horizontal); o coeficiente é -8 < 0, logo abre para a esquerda.',
      zh: '一次项为 x，因此对称轴为 x 轴（左右开口）；一次项系数为 -8 < 0，故向左开口。'
    }
  },
  {
    id: 2,
    equation: 'y^2 = 12x',
    question: {
      en: 'What are the coordinates of the Focus F?',
      es: '¿Cuáles son las coordenadas del Foco F?',
      fr: 'Quelles sont les coordonnées du Foyer F ?',
      pt: 'Quais são as coordenadas do Foco F?',
      zh: '该抛物线的焦点坐标是？'
    },
    options: {
      en: ['(6, 0)', '(3, 0)', '(0, 3)', '(-3, 0)'],
      es: ['(6, 0)', '(3, 0)', '(0, 3)', '(-3, 0)'],
      fr: ['(6, 0)', '(3, 0)', '(0, 3)', '(-3, 0)'],
      pt: ['(6, 0)', '(3, 0)', '(0, 3)', '(-3, 0)'],
      zh: ['(6, 0)', '(3, 0)', '(0, 3)', '(-3, 0)']
    },
    correctIdx: 1,
    explanation: {
      en: '2p = 12 ⇒ p = 6 ⇒ p/2 = 3. Opens right along x-axis, so Focus is (3, 0). Do not confuse 2p with p/2!',
      es: '2p = 12 ⇒ p = 6 ⇒ p/2 = 3. Abre a la derecha sobre el eje x, foco en (3, 0). ¡No confundas 2p con p/2!',
      fr: '2p = 12 ⇒ p = 6 ⇒ p/2 = 3. Ouverte vers la droite, foyer en (3, 0).',
      pt: '2p = 12 ⇒ p = 6 ⇒ p/2 = 3. Abre para a direita, foco em (3, 0). Cuidado para não usar 2p!',
      zh: '2p = 12 ⇒ p = 6 ⇒ p/2 = 3。一次项为 x，开口向右，故焦点在 x 轴正半轴，坐标为 (3, 0)。'
    }
  },
  {
    id: 3,
    equation: 'x^2 = -4y',
    question: {
      en: 'What is the equation of the directrix line?',
      es: '¿Cuál es la ecuación de la recta directriz?',
      fr: 'Quelle est l\'équation de la droite directrice ?',
      pt: 'Qual é a equação da reta diretriz?',
      zh: '该抛物线的准线方程是？'
    },
    options: {
      en: ['x = 1', 'y = 1', 'y = -1', 'y = 2'],
      es: ['x = 1', 'y = 1', 'y = -1', 'y = 2'],
      fr: ['x = 1', 'y = 1', 'y = -1', 'y = 2'],
      pt: ['x = 1', 'y = 1', 'y = -1', 'y = 2'],
      zh: ['x = 1', 'y = 1', 'y = -1', 'y = 2']
    },
    correctIdx: 1,
    explanation: {
      en: '2p = |-4| = 4 ⇒ p = 2 ⇒ p/2 = 1. Opens down, so the directrix is above the vertex at y = 1.',
      es: '2p = 4 ⇒ p/2 = 1. Abre hacia abajo, por lo que la directriz está detrás del vértice en y = 1.',
      fr: '2p = 4 ⇒ p/2 = 1. Parabole tournée vers le bas, la directrice est en y = 1.',
      pt: '2p = 4 ⇒ p/2 = 1. Abre para baixo, a reta diretriz fica acima do vértice em y = 1.',
      zh: '2p = |-4| = 4 ⇒ p = 2 ⇒ p/2 = 1。开口向下，准线在顶点上方，方程为 y = 1。'
    }
  },
  {
    id: 4,
    equation: 'y = 2x^2',
    question: {
      en: 'Converting y = 2x² to standard form, what is the focus?',
      es: 'Al convertir y = 2x² a la forma canónica, ¿cuál es el foco?',
      fr: 'En convertissant y = 2x² sous forme canonique, quel est le foyer ?',
      pt: 'Ao converter y = 2x² para a forma canônica, qual é o foco?',
      zh: '将初中二次函数 y = 2x² 化为标准方程后，焦点坐标为？'
    },
    options: {
      en: ['(0, 1)', '(0, 1/8)', '(0, 1/4)', '(1/8, 0)'],
      es: ['(0, 1)', '(0, 1/8)', '(0, 1/4)', '(1/8, 0)'],
      fr: ['(0, 1)', '(0, 1/8)', '(0, 1/4)', '(1/8, 0)'],
      pt: ['(0, 1)', '(0, 1/8)', '(0, 1/4)', '(1/8, 0)'],
      zh: ['(0, 1)', '(0, 1/8)', '(0, 1/4)', '(1/8, 0)']
    },
    correctIdx: 1,
    explanation: {
      en: 'Divide by 2: x² = (1/2)y. 2p = 1/2 ⇒ p = 1/4 ⇒ p/2 = 1/8. Focus is (0, 1/8).',
      es: 'Dividimos entre 2: x² = (1/2)y. 2p = 1/2 ⇒ p = 1/4 ⇒ p/2 = 1/8. El foco es (0, 1/8).',
      fr: 'On normalise : x² = (1/2)y. 2p = 1/2 ⇒ p = 1/4 ⇒ p/2 = 1/8. Foyer en (0, 1/8).',
      pt: 'Normalizamos: x² = (1/2)y. 2p = 1/2 ⇒ p = 1/4 ⇒ p/2 = 1/8. O foco é (0, 1/8).',
      zh: '化为标准形式必须使二次项系数为 1：x² = (1/2)y。此时 2p = 1/2 ⇒ p = 1/4 ⇒ p/2 = 1/8。向上开口，焦点为 (0, 1/8)。'
    }
  },
  {
    id: 5,
    equation: '(y-2)^2 = 8(x-1)',
    question: {
      en: 'What are the Vertex V and Focus F?',
      es: '¿Cuáles son el Vértice V y el Foco F?',
      fr: 'Quelles sont les coordonnées du Sommet V et du Foyer F ?',
      pt: 'Quais são o Vértice V e o Foco F?',
      zh: '该抛物线的顶点和焦点坐标分别是？'
    },
    options: {
      en: [
        'Vertex (1, 2), Focus (3, 2)',
        'Vertex (2, 1), Focus (4, 1)',
        'Vertex (1, 2), Focus (5, 2)',
        'Vertex (-1, -2), Focus (1, -2)'
      ],
      es: [
        'Vértice (1, 2), Foco (3, 2)',
        'Vértice (2, 1), Foco (4, 1)',
        'Vértice (1, 2), Foco (5, 2)',
        'Vértice (-1, -2), Foco (1, -2)'
      ],
      fr: [
        'Sommet (1, 2), Foyer (3, 2)',
        'Sommet (2, 1), Foyer (4, 1)',
        'Sommet (1, 2), Foyer (5, 2)',
        'Sommet (-1, -2), Foyer (1, -2)'
      ],
      pt: [
        'Vértice (1, 2), Foco (3, 2)',
        'Vértice (2, 1), Foco (4, 1)',
        'Vértice (1, 2), Foco (5, 2)',
        'Vértice (-1, -2), Foco (1, -2)'
      ],
      zh: [
        '顶点(1, 2)，焦点(3, 2)',
        '顶点(2, 1)，焦点(4, 1)',
        '顶点(1, 2)，焦点(5, 2)',
        '顶点(-1, -2)，焦点(1, -2)'
      ]
    },
    correctIdx: 0,
    explanation: {
      en: 'Vertex is (h, k) = (1, 2). 2p = 8 ⇒ p/2 = 2. Opens right, so Focus x = 1 + 2 = 3. F(3, 2).',
      es: 'Vértice en (1, 2). 2p = 8 ⇒ p/2 = 2. Abre a la derecha, foco en (1 + 2, 2) = (3, 2).',
      fr: 'Sommet en (1, 2). 2p = 8 ⇒ p/2 = 2. Foyer en (1+2, 2) = (3, 2).',
      pt: 'Vértice em (1, 2). 2p = 8 ⇒ p/2 = 2. Abre para a direita, foco em (1+2, 2) = (3, 2).',
      zh: '由 (y - k)² = 2p(x - h) 得顶点为 (1, 2)。2p = 8 ⇒ p/2 = 2。向右开口，焦点为 (1+2, 2) = (3, 2)。'
    }
  },
  {
    id: 6,
    equation: '4x^2 + 9y^2 - 8x - 36y + 4 = 0',
    question: {
      en: 'What are the Center O and Foci F coordinates of this non-origin ellipse?',
      es: '¿Cuáles son el Centro O y los Focos F de esta elipse fuera del origen?',
      fr: 'Quelles sont les coordonnées du Centre O et des Foyers F de cette ellipse ?',
      pt: 'Quais são o Centro O e os Focos F desta elipse fora da origem?',
      zh: '已知中心非原点椭圆方程 4x² + 9y² - 8x - 36y + 4 = 0，其中心与焦点坐标是？'
    },
    options: {
      en: [
        'Center O(1, 2), Foci F₁(1 - √5, 2), F₂(1 + √5, 2)',
        'Center O(2, 1), Foci F₁(2 - √5, 1), F₂(2 + √5, 1)',
        'Center O(1, 2), Foci F₁(1, 2 - √5), F₂(1, 2 + √5)',
        'Center O(0, 0), Foci F₁(-√5, 0), F₂(√5, 0)'
      ],
      es: [
        'Centro O(1, 2), Focos F₁(1 - √5, 2), F₂(1 + √5, 2)',
        'Centro O(2, 1), Focos F₁(2 - √5, 1), F₂(2 + √5, 1)',
        'Centro O(1, 2), Focos F₁(1, 2 - √5), F₂(1, 2 + √5)',
        'Centro O(0, 0), Focos F₁(-√5, 0), F₂(√5, 0)'
      ],
      fr: [
        'Centre O(1, 2), Foyers F₁(1 - √5, 2), F₂(1 + √5, 2)',
        'Centre O(2, 1), Foyers F₁(2 - √5, 1), F₂(2 + √5, 1)',
        'Centre O(1, 2), Foyers F₁(1, 2 - √5), F₂(1, 2 + √5)',
        'Centre O(0, 0), Foyers F₁(-√5, 0), F₂(√5, 0)'
      ],
      pt: [
        'Centro O(1, 2), Focos F₁(1 - √5, 2), F₂(1 + √5, 2)',
        'Centro O(2, 1), Focos F₁(2 - √5, 1), F₂(2 + √5, 1)',
        'Centro O(1, 2), Focos F₁(1, 2 - √5), F₂(1, 2 + √5)',
        'Centro O(0, 0), Focos F₁(-√5, 0), F₂(√5, 0)'
      ],
      zh: [
        '中心 O(1, 2)，焦点 F₁(1 - √5, 2)，F₂(1 + √5, 2)',
        '中心 O(2, 1)，焦点 F₁(2 - √5, 1)，F₂(2 + √5, 1)',
        '中心 O(1, 2)，焦点 F₁(1, 2 - √5)，F₂(1, 2 + √5)',
        '中心 O(0, 0)，焦点 F₁(-√5, 0)，F₂(√5, 0)'
      ]
    },
    correctIdx: 0,
    explanation: {
      en: 'Completing the square gives (x-1)²/9 + (y-2)²/4 = 1. Center O(1, 2). a²=9, b²=4 ⇒ c=√5. Major axis is horizontal, so Foci offset horizontally: (1 ± √5, 2).',
      es: 'Completando el cuadrado se obtiene (x-1)²/9 + (y-2)²/4 = 1. Centro en (1, 2). a²=9, b²=4 ⇒ c=√5. Eje mayor horizontal, focos en (1 ± √5, 2).',
      fr: 'En complétant le carré : (x-1)²/9 + (y-2)²/4 = 1. Centre O(1, 2). a²=9, b²=4 ⇒ c=√5. Axe majeur horizontal, foyers en (1 ± √5, 2).',
      pt: 'Completando quadrados: (x-1)²/9 + (y-2)²/4 = 1. Centro O(1, 2). a²=9, b²=4 ⇒ c=√5. Eixo maior horizontal, focos em (1 ± √5, 2).',
      zh: '配方可得标准方程 (x-1)²/9 + (y-2)²/4 = 1。中心 O(1, 2)，a²=9, b²=4 ⇒ c=√(a²-b²)=√5。长轴平行于 x 轴（水平方向），焦点由中心沿长轴左右偏移 c，坐标为 (1 ± √5, 2)。'
    }
  }
];

interface ParabolaQuizProps {
  lang: Language;
}

export const ParabolaQuiz: React.FC<ParabolaQuizProps> = ({ lang }) => {
  const t = translations[lang].quiz;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = quizBank[currentIdx];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelectedOpt(idx);
    setShowAnswer(true);
    if (idx === currentQ.correctIdx) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quizBank.length - 1) {
      setCurrentIdx((c) => c + 1);
      setSelectedOpt(null);
      setShowAnswer(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setShowAnswer(false);
    setScore(0);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            {t.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
          <span>
            {t.progress}: <strong>{currentIdx + 1}</strong> / {quizBank.length}
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Award className="w-4 h-4" />
            <span>{t.score} {score}</span>
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg text-center">
          <div className="text-xs text-slate-500 mb-1">{t.eqPrompt}</div>
          <div className="text-xl font-bold text-slate-900">
            <MathView math={currentQ.equation} block />
          </div>
          <div className="text-sm sm:text-base font-semibold text-slate-800 mt-2">
            {currentQ.question[lang]}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options[lang].map((opt, idx) => {
            let stateClass = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';

            if (showAnswer) {
              if (idx === currentQ.correctIdx) {
                stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold';
              } else if (idx === selectedOpt) {
                stateClass = 'border-rose-300 bg-rose-50 text-rose-800 line-through';
              } else {
                stateClass = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={showAnswer}
                onClick={() => handleSelect(idx)}
                className={`p-3.5 rounded-lg border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${stateClass}`}
              >
                <span>{opt}</span>
                {showAnswer && idx === currentQ.correctIdx && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {showAnswer && idx === selectedOpt && idx !== currentQ.correctIdx && (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showAnswer && (
          <div className="p-3.5 bg-sky-50/80 border border-sky-100 rounded-lg text-xs sm:text-sm space-y-1.5 animate-fadeIn">
            <div className="font-bold text-sky-900 flex items-center gap-1.5">
              <span>{selectedOpt === currentQ.correctIdx ? t.correct : t.wrong}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{currentQ.explanation[lang]}</p>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs sm:text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.restartBtn}</span>
          </button>

          {showAnswer && currentIdx < quizBank.length - 1 && (
            <button
              onClick={handleNext}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t.nextBtn}
            </button>
          )}

          {showAnswer && currentIdx === quizBank.length - 1 && (
            <div className="text-sm font-bold text-emerald-700">
              {t.completed} {score} / {quizBank.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
