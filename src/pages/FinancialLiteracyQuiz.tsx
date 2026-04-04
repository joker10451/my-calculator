import { useState, useMemo } from 'react';
import { SEO, generateFAQSchema } from '@/components/SEO';
import { generateHowToSchema } from '@/utils/seoSchemas';
import { Share2, RefreshCw, Trophy, ArrowRight, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SITE_URL = 'https://schitay-online.ru';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const QUESTIONS: Question[] = [
  {
    question: 'Какой процент дохода рекомендуется откладывать на сбережения?',
    options: ['5%', '10-20%', '30-40%', '50%'],
    correct: 1,
    explanation: 'Финансовые эксперты рекомендуют откладывать 10-20% дохода. Это позволяет создать подушку безопасности без значительного снижения уровня жизни.',
    category: 'Сбережения',
  },
  {
    question: 'Что такое подушка безопасности?',
    options: [
      'Страховка от болезней',
      'Запас денег на 3-6 месяцев расходов',
      'Кредитная карта с большим лимитом',
      'Инвестиционный портфель',
    ],
    correct: 1,
    explanation: 'Подушка безопасности — это запас денег, которого хватит на 3-6 месяцев обязательных расходов. Она защищает от финансовых потрясений.',
    category: 'Сбережения',
  },
  {
    question: 'Какая переплата по ипотеке 3 млн ₽ на 20 лет при ставке 22%?',
    options: ['Около 3 млн ₽', 'Около 6 млн ₽', 'Около 9 млн ₽', 'Около 12 млн ₽'],
    correct: 2,
    explanation: 'При ставке 22% на 20 лет переплата составляет около 9 млн ₽ — то есть вы покупаете 3 квартиры по цене одной.',
    category: 'Кредиты',
  },
  {
    question: 'Что выгоднее при досрочном погашении кредита?',
    options: [
      'Уменьшить ежемесячный платёж',
      'Уменьшить срок кредита',
      'Одинаково',
      'Зависит от банка',
    ],
    correct: 1,
    explanation: 'Уменьшение срока кредита выгоднее — вы быстрее гасите основной долг и платите меньше процентов. Уменьшение платежа даёт комфорт, но экономия меньше.',
    category: 'Кредиты',
  },
  {
    question: 'Какой налог платит самозанятый при работе с физлицами?',
    options: ['13%', '6%', '4%', '15%'],
    correct: 2,
    explanation: 'Самозанятый на НПД платит 4% от дохода при работе с физлицами и 6% — с юридическими лицами и ИП.',
    category: 'Налоги',
  },
  {
    question: 'Что такое сложный процент?',
    options: [
      'Процент, который начисляется только на основную сумму',
      'Процент, который начисляется на основную сумму и на накопленные проценты',
      'Процент за просрочку платежа',
      'Комиссия банка за обслуживание',
    ],
    correct: 1,
    explanation: 'Сложный процент — это когда проценты начисляются не только на основную сумму, но и на ранее накопленные проценты. Это основа роста инвестиций.',
    category: 'Инвестиции',
  },
  {
    question: 'Сколько нужно накопить для финансовой независимости при расходах 50 000 ₽/мес?',
    options: ['6 млн ₽', '12 млн ₽', '18 млн ₽', '24 млн ₽'],
    correct: 2,
    explanation: 'По правилу 4%, для финансовой независимости нужно сумму = годовые расходы × 25. При 50 000 ₽/мес (600 000 ₽/год) это 15 млн ₽. При доходности 8% — около 18 млн ₽.',
    category: 'Инвестиции',
  },
  {
    question: 'Что такое инфляция?',
    options: [
      'Рост зарплат',
      'Снижение покупательной способности денег',
      'Увеличение ключевой ставки ЦБ',
      'Рост курса доллара',
    ],
    correct: 1,
    explanation: 'Инфляция — это снижение покупательной способности денег. При инфляции 10% ваши 100 000 ₽ через год будут стоить как 90 000 ₽ сегодня.',
    category: 'Основы',
  },
  {
    question: 'Какое правило помогает контролировать расходы?',
    options: [
      'Правило 50/30/20',
      'Правило 72 часов',
      'Правило 80/20',
      'Правило 10 000 часов',
    ],
    correct: 0,
    explanation: 'Правило 50/30/20: 50% дохода — на обязательные расходы, 30% — на желания, 20% — на сбережения и инвестиции.',
    category: 'Основы',
  },
  {
    question: 'Что такое НДФЛ?',
    options: [
      'Налог на добавленную стоимость',
      'Налог на доходы физических лиц',
      'Налог на недвижимость',
      'Налог на прибыль организаций',
    ],
    correct: 1,
    explanation: 'НДФЛ — налог на доходы физических лиц. В России стандартная ставка — 13%, для доходов свыше 5 млн ₽ в год — 15%.',
    category: 'Налоги',
  },
];

export default function FinancialLiteracyQuiz() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [_score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + (finished ? QUESTIONS.length : 0)) / QUESTIONS.length) * 100;

  const result = useMemo(() => {
    if (!finished) return null;
    const correctCount = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
    const percentage = Math.round((correctCount / QUESTIONS.length) * 100);
    let level = '';
    let description = '';

    if (percentage >= 90) {
      level = 'Финансовый гуру';
      description = 'Вы отлично разбираетесь в финансах! Можете помогать другим.';
    } else if (percentage >= 70) {
      level = 'Продвинутый';
      description = 'Хороший уровень! Есть куда расти, но база крепкая.';
    } else if (percentage >= 50) {
      level = 'Средний';
      description = 'Неплохо, но стоит подтянуть знания по некоторым темам.';
    } else {
      level = 'Новичок';
      description = 'Рекомендуем изучить основы финансовой грамотности.';
    }

    return { correctCount, percentage, level, description };
  }, [finished, answers]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setAnswers(prev => [...prev, index]);
    if (index === question.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  };

  const handleShare = async () => {
    const text = result
      ? `Я набрал ${result.percentage}% в тесте на финансовую грамотность (${result.level})! Проверь себя на Считай.RU`
      : 'Проверь свою финансовую грамотность на Считай.RU!';
    if (navigator.share) {
      await navigator.share({ title: 'Тест на финансовую грамотность', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано!', description: 'Текст скопирован в буфер обмена' });
    }
  };

  const faqSchema = generateFAQSchema([
    { question: 'Зачем проходить тест на финансовую грамотность?', answer: 'Тест помогает оценить ваш уровень знаний о финансах, кредитах, инвестициях и налогах. Вы узнаете свои слабые места и получите рекомендации по улучшению.' },
    { question: 'Сколько вопросов в тесте?', answer: `В тесте ${QUESTIONS.length} вопросов по 5 категориям: сбережения, кредиты, налоги, инвестиции и основы финансовой грамотности.` },
    { question: 'Можно ли пройти тест повторно?', answer: 'Да, вы можете проходить тест неограниченное количество раз. Каждый раз вопросы идут в том же порядке, но вы можете улучшить свой результат.' },
  ]);

  const howToSchema = generateHowToSchema(
    'Как пройти тест на финансовую грамотность',
    'Пошаговая инструкция по прохождению теста на финансовую грамотность',
    `${SITE_URL}/quiz/financial-literacy`,
    [
      { name: 'Начните тест', text: 'Нажмите «Начать тест» и ответьте на первый вопрос', url: `${SITE_URL}/quiz/financial-literacy` },
      { name: 'Ответьте на все вопросы', text: `Выберите один из 4 вариантов ответа в каждом из ${QUESTIONS.length} вопросов`, url: `${SITE_URL}/quiz/financial-literacy` },
      { name: 'Узнайте результат', text: 'Получите оценку уровня финансовой грамотности', url: `${SITE_URL}/quiz/financial-literacy#result` },
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <SEO
        title="Тест на финансовую грамотность — проверьте свои знания"
        description="Пройдите бесплатный тест на финансовую грамотность. 10 вопросов по кредитам, инвестициям, налогам и сбережениям. Узнайте свой уровень."
        keywords="тест на финансовую грамотность, проверка знаний финансов, финансовая грамотность тест онлайн, квиз по финансам"
        canonical={`${SITE_URL}/quiz/financial-literacy`}
        structuredData={[faqSchema, howToSchema]}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          {!finished && (
            <>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Trophy className="w-4 h-4" />
                  Тест из {QUESTIONS.length} вопросов
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                  Тест на <span className="text-blue-600">финансовую</span> грамотность
                </h1>
                <p className="text-xl text-slate-600 max-w-xl mx-auto">
                  Проверьте свои знания о кредитах, инвестициях, налогах и сбережениях
                </p>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                  <span>Вопрос {currentQuestion + 1} из {QUESTIONS.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{question.category}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-8">{question.question}</h2>

                <div className="space-y-3">
                  {question.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === question.correct;
                    const showResult = selectedAnswer !== null;

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                          showResult
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-slate-200 bg-slate-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          showResult
                            ? isCorrect
                              ? 'bg-emerald-500 text-white'
                              : isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {showResult ? (
                            isCorrect ? <CheckCircle className="w-5 h-5" /> : isSelected ? <XCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                          ) : (
                            <span className="text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                          )}
                        </div>
                        <span className={`font-medium ${showResult && isCorrect ? 'text-emerald-700 font-bold' : showResult && isSelected ? 'text-red-700' : 'text-slate-700'}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {selectedAnswer !== null && (
                  <div className={`mt-6 p-5 rounded-2xl border-2 ${
                    selectedAnswer === question.correct
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <p className={`font-bold text-sm mb-1 ${
                      selectedAnswer === question.correct ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {selectedAnswer === question.correct ? '✅ Правильно!' : '❌ Неверно'}
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">{question.explanation}</p>
                  </div>
                )}

                {/* Next Button */}
                {selectedAnswer !== null && (
                  <button
                    onClick={handleNext}
                    className="mt-6 w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-lg rounded-2xl hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2"
                  >
                    {currentQuestion < QUESTIONS.length - 1 ? 'Следующий вопрос' : 'Показать результат'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Results */}
          {finished && result && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 text-white shadow-2xl shadow-blue-200/50 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <Trophy className="w-16 h-16 mx-auto mb-4" />
                <div className="text-6xl font-black mb-2">{result.percentage}%</div>
                <div className="text-2xl font-black mb-2">{result.level}</div>
                <p className="text-blue-100 text-lg mb-4">{result.description}</p>
                <div className="text-sm text-blue-200">
                  {result.correctCount} из {QUESTIONS.length} правильных ответов
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-6">Результаты по категориям</h3>
                <div className="space-y-4">
                  {['Сбережения', 'Кредиты', 'Налоги', 'Инвестиции', 'Основы'].map(category => {
                    const catQuestions = QUESTIONS.filter(q => q.category === category);
                    const catCorrect = catQuestions.filter(q => {
                      const idx = QUESTIONS.indexOf(q);
                      return answers[idx] === q.correct;
                    }).length;
                    const catTotal = catQuestions.length;
                    const catPercent = Math.round((catCorrect / catTotal) * 100);

                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-slate-700">{category}</span>
                          <span className="text-slate-500">{catCorrect}/{catTotal}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              catPercent >= 70 ? 'bg-emerald-500' : catPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${catPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 h-14 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Пройти снова
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 h-14 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Поделиться
                </button>
              </div>

              {/* CTA */}
              <div className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center text-white">
                <h3 className="text-xl font-black mb-2">Хотите улучшить результат?</h3>
                <p className="text-emerald-100 mb-6">Изучите наши калькуляторы и статьи о финансах</p>
                <a
                  href="/all"
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black py-3 px-8 rounded-xl hover:bg-emerald-50 hover:scale-105 transition-all"
                >
                  Все калькуляторы
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
