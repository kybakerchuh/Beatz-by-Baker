import type { OstQuestion } from './ostQuestions';

function shuffleWithOrder<T>(items: T[], rot: number): T[] {
  const n = items.length;
  const r = ((rot % n) + n) % n;
  return items.map((_, i) => items[(i + r) % n]);
}

function makeMcOptions(
  correctLabel: string,
  distractors: [string, string, string],
  rot: number
): { options: { id: string; label: string }[]; correctAnswer: string } {
  const ids = ['a', 'b', 'c', 'd'];
  const raw = [
    { label: correctLabel, isCorrect: true },
    { label: distractors[0], isCorrect: false },
    { label: distractors[1], isCorrect: false },
    { label: distractors[2], isCorrect: false },
  ];
  const rotated = shuffleWithOrder(raw, rot);
  const options = rotated.map((item, idx) => ({ id: ids[idx], label: item.label }));
  const correctIdx = rotated.findIndex((item) => item.isCorrect);
  return { options, correctAnswer: ids[correctIdx] };
}

function fmtSignNum(n: number): string {
  return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

function fmtLinearExpr(a: number, b: number): string {
  const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (b === 0) return xPart;
  return `${xPart} ${fmtSignNum(b)}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function fmtFrac(num: number, den: number): string {
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return String(n);
  if (n < 0) return `-\\frac{${Math.abs(n)}}{${d}}`;
  return `\\frac{${n}}{${d}}`;
}

// ============================================================================
// 6. EXPONENTIAL FUNCTIONS (+25 -> 32 total)
// ============================================================================
const expPopSpecs: {
  start: number;
  base: number;
  period: number;
  mode: 'find-p' | 'find-t';
  tVal: number;
}[] = [
  { start: 300, base: 2, period: 4, mode: 'find-p', tVal: 8 },
  { start: 200, base: 3, period: 5, mode: 'find-p', tVal: 10 },
  { start: 400, base: 2, period: 2, mode: 'find-p', tVal: 6 },
  { start: 250, base: 2, period: 4, mode: 'find-t', tVal: 8 },
  { start: 150, base: 3, period: 2, mode: 'find-t', tVal: 4 },
  { start: 600, base: 2, period: 5, mode: 'find-t', tVal: 10 },
];

const expPopQuestions: OstQuestion[] = expPopSpecs.map((sp, i) => {
  const power = sp.tVal / sp.period;
  const popVal = sp.start * Math.pow(sp.base, power);
  const word = sp.base === 2 ? 'doubles' : 'triples';
  if (sp.mode === 'find-p') {
    return {
      id: `ost-exp-expo-pop-${i + 1}`,
      topic: 'exponential',
      unit: 'Exponential Functions',
      playbookPage: 3,
      type: 'numeric',
      prompt: `A colony starts with ${sp.start} organisms and ${word} every ${sp.period} years. Based on the model, what is the population after ${sp.tVal} years?`,
      equation: `P = ${sp.start}(${sp.base})^{\\frac{t}{${sp.period}}},   t = ${sp.tVal}`,
      correctAnswer: [String(popVal), popVal.toLocaleString('en-US')],
      placeholder: 'Enter P',
      hint: `Plug t = ${sp.tVal} into the exponent: \\frac{${sp.tVal}}{${sp.period}} = ${power}. Then compute ${sp.start} × ${sp.base}^{${power}}.`,
      explanation: `P = ${sp.start}(${sp.base})^{${power}} = ${sp.start} × ${Math.pow(sp.base, power)} = ${popVal.toLocaleString('en-US')}.`,
    };
  }
  return {
    id: `ost-exp-expo-pop-${i + 1}`,
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 3,
    type: 'numeric',
    prompt: `A population starting at ${sp.start} is modeled below. After how many years will the population reach ${popVal.toLocaleString('en-US')}?`,
    equation: `${popVal} = ${sp.start}(${sp.base})^{\\frac{t}{${sp.period}}}`,
    correctAnswer: [String(sp.tVal)],
    unitLabel: 'years',
    placeholder: 'Enter t',
    hint: `Divide ${popVal} by ${sp.start} to get ${Math.pow(sp.base, power)} = ${sp.base}^{${power}}, so \\frac{t}{${sp.period}} = ${power}.`,
    explanation: `\\frac{${popVal}}{${sp.start}} = ${Math.pow(sp.base, power)} = ${sp.base}^{${power}}, so \\frac{t}{${sp.period}} = ${power} and t = ${sp.tVal} years.`,
  };
});

const expInitialSpecs: [string, number, string, string][] = [
  ['Marcus opens a savings account modeled below. What does 450 represent?', 450, '0.05', 'The initial deposit in dollars'],
  ['A scholarship fund grows as shown below. What does 1,200 represent?', 1200, '0.06', 'The starting balance in dollars'],
  ['A video’s views after d days are modeled by 800(1 + 0.14)^{d}. What does 800 represent?', 800, '0.14', 'The initial number of views on day 0'],
  ['A town’s solar panels grow by 3,500(1 + 0.09)^{t}. What does 3,500 represent?', 3500, '0.09', 'The initial number of solar panels'],
  ['Bacteria count after h hours is modeled by 125(1 + 0.25)^{h}. What does 125 represent?', 125, '0.25', 'The starting number of bacteria'],
];

const expInitialQuestions: OstQuestion[] = expInitialSpecs.map(([prompt, initVal, rate, correct], i) => {
  const { options, correctAnswer } = makeMcOptions(
    correct,
    [
      'The annual percent growth rate',
      'The total amount after n time periods',
      'The amount added every single year',
    ],
    i
  );
  return {
    id: `ost-exp-expo-init-${i + 1}`,
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 18,
    type: 'multiple-choice',
    prompt,
    equation: `${initVal.toLocaleString('en-US')}(1 + ${rate})^{n}`,
    options,
    correctAnswer,
    hint: 'In y = a(1 + r)^{n}, the value in front of the parentheses is the starting amount when n = 0.',
    explanation: `When n = 0, (1 + ${rate})^{0} = 1, leaving ${initVal.toLocaleString('en-US')} as the initial value.`,
  };
});

const expFixDecaySpecs: [number, number, string, number][] = [
  // [start, target, ratePctString, rateDecimal]
  [18000, 9000, '15%', 0.15],
  [24000, 12000, '10%', 0.1],
  [12000, 5000, '18%', 0.18],
  [30000, 15000, '22%', 0.22],
];

const expFixDecayQuestions: OstQuestion[] = expFixDecaySpecs.map(([start, target, pct, dec], i) => {
  const keep = Number((1 - dec).toFixed(2));
  const { options, correctAnswer } = makeMcOptions(
    `Replace ${dec} with ${keep}`,
    [
      `Replace ${dec} with ${pct.replace('%', '')}`,
      `Replace ${target.toLocaleString('en-US')} with ${(start - target).toLocaleString('en-US')}`,
      `Replace ${start.toLocaleString('en-US')} with ${keep}`,
    ],
    i + 1
  );
  return {
    id: `ost-exp-expo-decay-${i + 1}`,
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 18,
    type: 'multiple-choice',
    prompt: `A vehicle bought for $${start.toLocaleString('en-US')} loses ${pct} of its value per year. A student wrote the incorrect inequality below. Which change fixes it?`,
    equation: `${start.toLocaleString('en-US')}(${dec})^{t} < ${target.toLocaleString('en-US')}`,
    options,
    correctAnswer,
    hint: `Decay uses (1 - r) as the base! Subtract ${dec} from 1.`,
    explanation: `1 - ${dec} = ${keep}, so the base must be ${keep} instead of ${dec}.`,
  };
});

const expRateSpecs: {
  start: number;
  base: string;
  mode: 'growth' | 'decay';
  pct: number;
  prompt: string;
}[] = [
  { start: 5000, base: '1.12', mode: 'growth', pct: 12, prompt: 'A city’s bike-share ridership is modeled below. By what PERCENT does it grow each year?' },
  { start: 8000, base: '1.05', mode: 'growth', pct: 5, prompt: 'A savings bond value is modeled below. By what PERCENT does it grow each year?' },
  { start: 2400, base: '1.18', mode: 'growth', pct: 18, prompt: 'A streaming channel’s subscribers follow the formula below. By what PERCENT do they grow each month?' },
  { start: 12000, base: '0.88', mode: 'decay', pct: 12, prompt: 'A laptop’s resale value is modeled below. By what PERCENT does its value DECREASE each year?' },
  { start: 9500, base: '0.75', mode: 'decay', pct: 25, prompt: 'A medicine amount in the bloodstream is modeled below. By what PERCENT does it DECREASE each hour?' },
  { start: 16000, base: '0.92', mode: 'decay', pct: 8, prompt: 'A machine’s value after t years is modeled below. By what PERCENT does it DECREASE each year?' },
];

const expRateQuestions: OstQuestion[] = expRateSpecs.map((sp, i) => ({
  id: `ost-exp-expo-rate-${i + 1}`,
  topic: 'exponential',
  unit: 'Exponential Functions',
  playbookPage: 18,
  type: 'numeric',
  prompt: sp.prompt,
  equation: `P = ${sp.start.toLocaleString('en-US')}(${sp.base})^{t}`,
  correctAnswer: [String(sp.pct), `${sp.pct}%`],
  unitLabel: '%',
  placeholder: `e.g. ${sp.pct}`,
  hint:
    sp.mode === 'growth'
      ? `Compare ${sp.base} to (1 + r), then convert r to a percent.`
      : `Compare ${sp.base} to (1 - r), so r = 1 - ${sp.base}, then convert to a percent.`,
  explanation:
    sp.mode === 'growth'
      ? `${sp.base} = 1 + ${(sp.pct / 100).toFixed(2)}, which is ${sp.pct}% growth.`
      : `${sp.base} = 1 - ${(sp.pct / 100).toFixed(2)}, which is ${sp.pct}% decrease.`,
}));

const expConceptQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-expo-conc-1',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 19,
    type: 'multiple-choice',
    prompt: 'Which situation is best modeled by an exponential function of time t (in years)?',
    ...makeMcOptions(
      'A forest’s tree count increases by 4% every year',
      [
        'A tree grows 1.5 feet taller every year',
        'A library adds 250 new books every year',
        'A runner reduces their mile time by 5 seconds total',
      ],
      1
    ),
    hint: 'Exponential models multiply by a constant percent factor each period rather than adding a constant amount.',
    explanation: 'Increasing by 4% every year multiplies by 1.04 each year (exponential growth).',
  },
  {
    id: 'ost-exp-expo-conc-2',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 19,
    type: 'multiple-choice',
    prompt: 'Which situation describes a quantity DECREASING by a constant percent rate?',
    ...makeMcOptions(
      'Each year, a lake’s algae area is 82% of the previous year’s area',
      [
        'A pool loses 35 gallons of water each day',
        'A store lowers a jacket price by $10 once',
        'One building is 20% shorter than another building',
      ],
      2
    ),
    hint: 'Look for repeated multiplication by the same percent less than 100% each period.',
    explanation: 'Being 82% of the previous year’s value means multiplying by 0.82 each year (18% decay rate).',
  },
  {
    id: 'ost-exp-expo-conc-3',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 19,
    type: 'multiple-choice',
    prompt: 'Which table or equation represents EXPONENTIAL growth rather than linear growth?',
    ...makeMcOptions(
      'y = 12(1.09)^{x}',
      ['y = 12x + 1.09', 'y = 1.09x + 12', 'y = 12(0.91)^{x}'],
      0
    ),
    hint: 'Exponential growth has the variable x in the exponent and a base greater than 1.',
    explanation: 'y = 12(1.09)^{x} has base 1.09 > 1 with x in the exponent.',
  },
  {
    id: 'ost-exp-expo-conc-4',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 19,
    type: 'multiple-choice',
    prompt: 'Which equation represents exponential DECAY?',
    ...makeMcOptions(
      'y = 500(0.84)^{x}',
      ['y = 500(1.04)^{x}', 'y = -0.84x + 500', 'y = 0.84x + 500'],
      3
    ),
    hint: 'Exponential decay has x in the exponent and a growth/decay factor strictly between 0 and 1.',
    explanation: '0.84 is between 0 and 1 with x in the exponent, so y = 500(0.84)^{x} shows exponential decay.',
  },
];

// ============================================================================
// 7. LINEAR FUNCTIONS (+26 -> 34 total)
// ============================================================================
const linearTaxiSpecs: [number, number, number, string][] = [
  // [firstUnitCost, extraUnitCost, totalUnits, item]
  [6.0, 2.5, 5, 'rideshare'],
  [5.0, 1.75, 6, 'scooter rental'],
  [8.0, 3.0, 4, 'delivery'],
  [3.5, 1.5, 7, 'parking garage'],
];

const linearTaxiQuestions: OstQuestion[] = linearTaxiSpecs.map(([firstCost, perExtra, totalMiles, item], i) => {
  const totalCost = firstCost + perExtra * (totalMiles - 1);
  const { options, correctAnswer } = makeMcOptions(
    `${totalMiles}`,
    [`${totalMiles - 1}`, `${totalMiles + 1}`, `${totalMiles + 2}`],
    i
  );
  return {
    id: `ost-exp-lin-taxi-${i + 1}`,
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 2,
    type: 'multiple-choice',
    prompt: `A ${item} charges $${firstCost.toFixed(2)} for the first mile (or hour) and $${perExtra.toFixed(2)} for each additional unit. If a customer paid $${totalCost.toFixed(2)}, how many total units did they use?`,
    options,
    correctAnswer,
    hint: `Subtract $${firstCost.toFixed(2)} for the 1st unit, divide the remainder by $${perExtra.toFixed(2)}, then add 1.`,
    explanation: `$${totalCost.toFixed(2)} - $${firstCost.toFixed(2)} = $${(totalCost - firstCost).toFixed(2)}. Dividing by $${perExtra.toFixed(2)} gives ${totalMiles - 1} extra units, plus the 1st = ${totalMiles}.`,
  };
});

const linearTableSpecs: [number, number, number][] = [
  // f(x) = m*x + b, asking for f(xAsk)
  [3, 5, 6],
  [4, -2, 7],
  [-2, 15, 5],
  [5, 3, 6],
  [-3, 20, 6],
];

const linearTableQuestions: OstQuestion[] = linearTableSpecs.map(([m, b, xAsk], i) => {
  const xs = [0, 1, 2, 4, xAsk];
  const ans = m * xAsk + b;
  return {
    id: `ost-exp-lin-tbl-${i + 1}`,
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 21,
    type: 'numeric',
    prompt: `A table of values for a linear function is shown. What is the missing value for x = ${xAsk}?`,
    diagram: {
      kind: 'linear-table',
      rows: xs.map((x) => ({
        x,
        fx: x === xAsk ? '?' : String(m * x + b),
      })),
    },
    correctAnswer: [String(ans)],
    placeholder: `Enter f(${xAsk})`,
    hint: `Find the slope (change in f(x) when x goes up by 1): ${m}. Then use f(x) = ${fmtLinearExpr(m, b)}.`,
    explanation: `f(x) = ${fmtLinearExpr(m, b)}, so f(${xAsk}) = ${m}(${xAsk}) ${fmtSignNum(b)} = ${ans}.`,
  };
});

const linearInterceptSpecs: [number, number, 'x' | 'y', string[]][] = [
  // f(x) = m*x + b
  [4, 12, 'x', ['-3']],
  [2, -11, 'x', ['5.5', '11/2']],
  [-3, 15, 'x', ['5']],
  [5, -18, 'y', ['-18']],
  [-4, 14, 'x', ['3.5', '7/2']],
];

const linearInterceptQuestions: OstQuestion[] = linearInterceptSpecs.map(([m, b, axis, accepted], i) => ({
  id: `ost-exp-lin-int-${i + 1}`,
  topic: 'linear',
  unit: 'Linear Functions',
  playbookPage: 21,
  type: 'numeric',
  prompt: `What is the ${axis}-intercept of the graph of the linear function shown?`,
  equation: `f(x) = ${fmtLinearExpr(m, b)}`,
  correctAnswer: accepted,
  placeholder: `Enter ${axis}`,
  hint:
    axis === 'x'
      ? `Set f(x) = 0 and solve 0 = ${fmtLinearExpr(m, b)}.`
      : `Plug in x = 0: f(0) = ${m}(0) ${fmtSignNum(b)}.`,
  explanation:
    axis === 'x'
      ? `${fmtLinearExpr(m, b)} = 0 gives x = ${accepted[0]}.`
      : `At x = 0, f(0) = ${b}.`,
}));

const linearGraphSpecs: {
  p1: [number, number];
  p2: [number, number];
  mLabel: string;
  b: number;
  distractors: [string, string, string];
  hint: string;
  explanation: string;
}[] = [
  {
    p1: [0, 2],
    p2: [6, 6],
    mLabel: '\\frac{2}{3}',
    b: 2,
    distractors: ['f(x) = \\frac{3}{2}x + 2', 'f(x) = 2x + \\frac{2}{3}', 'f(x) = \\frac{2}{3}x - 2'],
    hint: 'Find the y-intercept at (0, 2) and count rise/run to (6, 6): \\frac{6 - 2}{6 - 0}.',
    explanation: 'Slope = \\frac{4}{6} = \\frac{2}{3}, y-intercept = 2, so f(x) = \\frac{2}{3}x + 2.',
  },
  {
    p1: [0, -2],
    p2: [4, 6],
    mLabel: '2',
    b: -2,
    distractors: ['f(x) = \\frac{1}{2}x - 2', 'f(x) = -2x + 2', 'f(x) = 2x + 2'],
    hint: 'The line crosses the y-axis at (0, -2) and rises 8 units across 4 units to (4, 6).',
    explanation: 'Slope = \\frac{6 - (-2)}{4 - 0} = 2 and y-intercept = -2, giving f(x) = 2x - 2.',
  },
  {
    p1: [0, 6],
    p2: [4, 2],
    mLabel: '-1',
    b: 6,
    distractors: ['f(x) = x + 6', 'f(x) = 6x - 1', 'f(x) = -\\frac{1}{2}x + 6'],
    hint: 'The line goes DOWN from (0, 6) to (4, 2): slope = \\frac{2 - 6}{4 - 0}.',
    explanation: 'Slope = -1 and y-intercept = 6, so f(x) = -x + 6.',
  },
  {
    p1: [0, 1],
    p2: [8, 7],
    mLabel: '\\frac{3}{4}',
    b: 1,
    distractors: ['f(x) = \\frac{4}{3}x + 1', 'f(x) = x + \\frac{3}{4}', 'f(x) = \\frac{3}{4}x + 7'],
    hint: 'Check the y-intercept (0, 1) and slope \\frac{7 - 1}{8 - 0} = \\frac{6}{8}.',
    explanation: 'Slope = \\frac{6}{8} = \\frac{3}{4} and y-intercept = 1, giving f(x) = \\frac{3}{4}x + 1.',
  },
];

const linearGraphQuestions: OstQuestion[] = linearGraphSpecs.map((sp, i) => {
  const mStr = sp.mLabel === '-1' ? '-' : sp.mLabel;
  const correctEq = `f(x) = ${mStr}x ${fmtSignNum(sp.b)}`;
  const { options, correctAnswer } = makeMcOptions(correctEq, sp.distractors, i + 1);
  return {
    id: `ost-exp-lin-graph-${i + 1}`,
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 21,
    type: 'multiple-choice',
    prompt: 'What is the equation of the linear function shown on the graph?',
    diagram: { kind: 'linear-graph', points: [sp.p1, sp.p2] },
    options,
    correctAnswer,
    hint: sp.hint,
    explanation: sp.explanation,
  };
});

const linearInterpretQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-lin-interp-1',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 24,
    type: 'multiple-choice',
    prompt:
      'A tank initially holds 1,200 gallons of water and drains steadily for w hours as modeled below. What does -85 represent?',
    equation: '1,200 - 85w',
    ...makeMcOptions(
      'The number of gallons drained each hour',
      [
        'The starting amount of water in the tank',
        'The total hours it takes to empty the tank',
        'The gallons remaining after w hours',
      ],
      1
    ),
    hint: 'The number multiplying w is the rate of change per hour.',
    explanation: '-85 means the water decreases by 85 gallons every hour.',
  },
  {
    id: 'ost-exp-lin-interp-2',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 25,
    type: 'multiple-choice',
    prompt:
      'A plumber charges an hourly rate plus a service visit fee, modeled by f(h) = 75h + 45. Which part represents the service visit fee?',
    equation: 'f(h) = 75h + 45',
    ...makeMcOptions('45', ['75', '75h', 'h'], 2),
    hint: 'The fixed one-time fee is the constant term (y-intercept) that does not get multiplied by h.',
    explanation: '45 is the constant y-intercept representing the $45 service visit fee.',
  },
  {
    id: 'ost-exp-lin-interp-3',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 24,
    type: 'multiple-choice',
    prompt:
      'Elena tracks pages remaining in a book after d days using 420 - 35d. What does 420 represent?',
    equation: '420 - 35d',
    ...makeMcOptions(
      'The total number of pages in the book before Elena starts reading',
      [
        'The number of pages Elena reads each day',
        'The number of days needed to finish the book',
        'The pages left after 35 days',
      ],
      0
    ),
    hint: 'Evaluate 420 - 35d when d = 0 days.',
    explanation: 'At d = 0, 420 - 35(0) = 420, which is the starting page count.',
  },
  {
    id: 'ost-exp-lin-interp-4',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 25,
    type: 'multiple-choice',
    prompt:
      'A gym membership cost over m months is C(m) = 32m + 50. What does 32 represent?',
    equation: 'C(m) = 32m + 50',
    ...makeMcOptions(
      'The monthly membership fee in dollars',
      [
        'The one-time sign-up fee',
        'The total cost after 50 months',
        'The number of months in the contract',
      ],
      3
    ),
    hint: '32 is the slope multiplied by the number of months m.',
    explanation: 'Each additional month adds $32 to the total cost.',
  },
];

const linearWordSpecs: [string, number, number, number, string][] = [
  ['A bamboo shoot is 8 inches tall and grows 2.5 inches per day. After how many days will it reach 43 inches?', 8, 2.5, 43, 'days'],
  ['Sam has $45 saved and saves $15 per week. After how many weeks will he have $195?', 45, 15, 195, 'weeks'],
  ['A snowbank is 12 inches deep and melts 1.5 inches per hour. After how many hours will it be 3 inches deep?', 12, -1.5, 3, 'hours'],
  ['A candle is 18 cm tall and burns 2 cm per hour. After how many hours will it be 6 cm tall?', 18, -2, 6, 'hours'],
];

const linearWordQuestions: OstQuestion[] = linearWordSpecs.map(([prompt, start, rate, target, unit], i) => {
  const ans = (target - start) / rate;
  return {
    id: `ost-exp-lin-word-${i + 1}`,
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 25,
    type: 'numeric',
    prompt,
    equation: `${start} ${rate >= 0 ? `+ ${rate}x` : `- ${Math.abs(rate)}x`} = ${target}`,
    correctAnswer: [String(ans)],
    unitLabel: unit,
    placeholder: `Enter ${unit}`,
    hint: `Subtract ${start} from ${target}, then divide by ${rate}.`,
    explanation: `${rate}x = ${target - start} gives x = ${ans} ${unit}.`,
  };
});

// ============================================================================
// 8. SYSTEMS OF EQUATIONS & INEQUALITIES (+26 -> 33 total)
// ============================================================================
const sysCountQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-sys-cnt-1',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'How many solutions does the following system of linear equations have?',
    equation: 'y = 3x + 4   and   y = 3x - 7',
    ...makeMcOptions('No solution (parallel lines)', ['Exactly one solution', 'Infinitely many solutions', 'Two solutions'], 1),
    hint: 'Compare the slopes (both 3) and y-intercepts (4 vs -7).',
    explanation: 'Same slope (3) and different y-intercepts mean parallel lines that never intersect: no solution.',
  },
  {
    id: 'ost-exp-sys-cnt-2',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'Which statement is true about a system of linear equations with INFINITELY MANY solutions?',
    ...makeMcOptions(
      'The graphs of the equations are the exact same line.',
      [
        'The graphs are parallel lines with different y-intercepts.',
        'The graphs intersect at exactly one point.',
        'The graphs are perpendicular lines.',
      ],
      2
    ),
    hint: 'Every point on one line must also lie on the other line.',
    explanation: 'Coincident (identical) lines share every point, giving infinitely many solutions.',
  },
  {
    id: 'ost-exp-sys-cnt-3',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'How many solutions does this system have?',
    equation: 'y = 2x + 5   and   2y = 4x + 10',
    ...makeMcOptions('Infinitely many solutions', ['No solution', 'Exactly one solution', 'Exactly two solutions'], 0),
    hint: 'Divide the second equation by 2: 2y = 4x + 10 becomes y = 2x + 5.',
    explanation: 'Both equations represent the exact same line y = 2x + 5, so there are infinitely many solutions.',
  },
  {
    id: 'ost-exp-sys-cnt-4',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'How many solutions does this system have?',
    equation: 'y = 4x - 1   and   y = -2x + 5',
    ...makeMcOptions('Exactly one solution', ['No solution', 'Infinitely many solutions', 'Zero real solutions'], 3),
    hint: 'Check if the slopes are different (4 vs -2).',
    explanation: 'Lines with different slopes always intersect at exactly one point.',
  },
];

const sysFracSolveSpecs: [number, number, number, number, number, number][] = [
  // [x0, y0, m1, fNum, fDen] -> y = m1*x + b1 and y = (fNum/fDen)x + b2
  [2, 5, 3, 1, 2, 0], // y = 3x - 1 and y = (1/2)x + 4
  [-4, 1, -1, 1, 4, 0], // y = -x - 3 and y = (1/4)x + 2
  [6, 7, 1, 2, 3, 0], // y = x + 1 and y = (2/3)x + 3
  [-3, 2, -2, 1, 3, 0], // y = -2x - 4 and y = (1/3)x + 3
  [4, -1, -2, 3, 4, 0], // y = -2x + 7 and y = (3/4)x - 4
];

const sysFracSolveQuestions: OstQuestion[] = sysFracSolveSpecs.map(([x0, y0, m1, fNum, fDen], i) => {
  const b1 = y0 - m1 * x0;
  const b2 = y0 - (fNum * x0) / fDen;
  const eq1 = `y = ${fmtLinearExpr(m1, b1)}`;
  const eq2 = `y = \\frac{${fNum}}{${fDen}}x ${fmtSignNum(b2)}`;
  const { options, correctAnswer } = makeMcOptions(
    `(${x0}, ${y0})`,
    [`(${y0}, ${x0})`, `(${-x0}, ${y0})`, `(${x0 + 2}, ${y0 - 1})`],
    i + 1
  );
  return {
    id: `ost-exp-sys-solve-${i + 1}`,
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'A system of equations is given. What is the solution to the system?',
    equation: `${eq1}   and   ${eq2}`,
    options,
    correctAnswer,
    hint: `Substitute each (x, y) choice into BOTH equations to verify which pair makes both true.`,
    explanation: `At (${x0}, ${y0}): ${m1}(${x0}) ${fmtSignNum(b1)} = ${y0} and \\frac{${fNum}}{${fDen}}(${x0}) ${fmtSignNum(b2)} = ${y0}.`,
  };
});

const sysFxGxSpecs: [number, number, number, number, number][] = [
  // f(x) = m1*x + b1, g(x) = m2*x + b2 -> integer x0
  [5, -3, 2, 9, 4],
  [6, 2, 3, 14, 4],
  [8, -7, 3, 18, 5],
  [4, 11, -2, 29, 3],
  [9, -5, 4, 15, 4],
];

const sysFxGxQuestions: OstQuestion[] = sysFxGxSpecs.map(([m1, b1, m2, b2, ans], i) => ({
  id: `ost-exp-sys-fxgx-${i + 1}`,
  topic: 'systems',
  unit: 'Systems of Equations',
  playbookPage: 28,
  type: 'numeric',
  prompt: `Two functions are given: f(x) = ${fmtLinearExpr(m1, b1)} and g(x) = ${fmtLinearExpr(m2, b2)}. What value of x makes f(x) = g(x) true?`,
  equation: `${fmtLinearExpr(m1, b1)} = ${fmtLinearExpr(m2, b2)}`,
  correctAnswer: [String(ans)],
  placeholder: 'Enter x',
  hint: `Set the two expressions equal, move x terms to one side (${m1 - m2}x) and constants to the other.`,
  explanation: `${m1 - m2}x = ${b2 - b1} gives x = ${ans}.`,
}));

const sysSumDiffSpecs: [number, number, 'larger' | 'smaller'][] = [
  [120, 44, 'larger'],
  [184, 52, 'larger'],
  [96, 28, 'smaller'],
  [240, 70, 'larger'],
];

const sysSumDiffQuestions: OstQuestion[] = sysSumDiffSpecs.map(([sum, diff, target], i) => {
  const larger = (sum + diff) / 2;
  const smaller = (sum - diff) / 2;
  const ans = target === 'larger' ? larger : smaller;
  return {
    id: `ost-exp-sys-sumdiff-${i + 1}`,
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'numeric',
    prompt: `Two numbers have a sum of ${sum} and a difference of ${diff}. What is the ${target.toUpperCase()} of the two numbers?`,
    equation: `x + y = ${sum}   and   x - y = ${diff}`,
    correctAnswer: [String(ans)],
    placeholder: `Enter ${target} #`,
    hint: `Add the two equations together: (x + y) + (x - y) = ${sum + diff}, so 2x = ${sum + diff}.`,
    explanation: `2x = ${sum + diff} gives x = ${larger} and y = ${smaller}. The ${target} number is ${ans}.`,
  };
});

const sysTicketSpecs: {
  prompt: string;
  eq: string;
  ans: number;
  unitLabel: string;
  hint: string;
  explanation: string;
}[] = [
  {
    prompt: 'Adult tickets cost $12 and student tickets cost $8. A school sells 200 tickets for $1,920. How many ADULT tickets were sold?',
    eq: 'A + S = 200   and   12A + 8S = 1,920',
    ans: 80,
    unitLabel: 'tickets',
    hint: 'Substitute S = 200 - A into 12A + 8S = 1,920: 4A + 1,600 = 1,920.',
    explanation: '4A = 320, so A = 80 adult tickets.',
  },
  {
    prompt: 'Small smoothies cost $4 and large smoothies cost $6. A stand sells 90 smoothies for $430. How many LARGE smoothies were sold?',
    eq: 'S + L = 90   and   4S + 6L = 430',
    ans: 35,
    unitLabel: 'smoothies',
    hint: 'Substitute S = 90 - L into 4S + 6L = 430: 2L + 360 = 430.',
    explanation: '2L = 70, so L = 35 large smoothies.',
  },
  {
    prompt: 'A bakery sells muffins for $3 and scones for $5. In one morning it sells 75 pastries for $285. How many SCONES were sold?',
    eq: 'M + S = 75   and   3M + 5S = 285',
    ans: 30,
    unitLabel: 'scones',
    hint: 'Substitute M = 75 - S into 3M + 5S = 285: 2S + 225 = 285.',
    explanation: '2S = 60, so S = 30 scones.',
  },
  {
    prompt: 'A museum sells child passes for $10 and adult passes for $15. Total sales were 140 passes for $1,800. How many ADULT passes were sold?',
    eq: 'C + A = 140   and   10C + 15A = 1,800',
    ans: 80,
    unitLabel: 'passes',
    hint: 'Substitute C = 140 - A into 10C + 15A = 1,800: 5A + 1,400 = 1,800.',
    explanation: '5A = 400, so A = 80 adult passes.',
  },
];

const sysTicketQuestions: OstQuestion[] = sysTicketSpecs.map((sp, i) => ({
  id: `ost-exp-sys-tix-${i + 1}`,
  topic: 'systems',
  unit: 'Systems of Equations',
  playbookPage: 29,
  type: 'numeric',
  prompt: sp.prompt,
  equation: sp.eq,
  correctAnswer: [String(sp.ans)],
  unitLabel: sp.unitLabel,
  placeholder: 'Enter count',
  hint: sp.hint,
  explanation: sp.explanation,
}));

const sysEquivQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-sys-eqv-1',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 29,
    type: 'multiple-choice',
    prompt: 'Which system of equations has the SAME solution as the given system?',
    equation: '2x - y = 5   and   3x + 4y = 13',
    ...makeMcOptions(
      '6x - 3y = 15  and  3x + 4y = 13',
      [
        '6x - 3y = 5  and  3x + 4y = 13',
        '6x - y = 15  and  3x + 4y = 13',
        '2x - 3y = 15  and  3x + 4y = 13',
      ],
      1
    ),
    hint: 'Multiply ALL terms (left and right sides) of 2x - y = 5 by 3.',
    explanation: '3(2x - y = 5) gives 6x - 3y = 15, keeping the system equivalent.',
  },
  {
    id: 'ost-exp-sys-eqv-2',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 29,
    type: 'multiple-choice',
    prompt: 'Which system of equations has the SAME solution as the given system?',
    equation: 'x + 2y = 7   and   4x - 3y = 6',
    ...makeMcOptions(
      '-4x - 8y = -28  and  4x - 3y = 6',
      [
        '-4x - 8y = 7  and  4x - 3y = 6',
        '-4x + 2y = -28  and  4x - 3y = 6',
        '4x + 8y = -28  and  4x - 3y = 6',
      ],
      2
    ),
    hint: 'Multiply every term in x + 2y = 7 by -4.',
    explanation: '-4(x + 2y = 7) becomes -4x - 8y = -28.',
  },
];

const sysIneqQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-sys-ineq-1',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 31,
    type: 'multiple-choice',
    prompt:
      'A baker makes loaves of bread (x) costing $2 each and pies (y) costing $5 each. Daily costs cannot exceed $250, and at least 60 total items must be baked. Which system represents this?',
    ...makeMcOptions(
      'x + y ≥ 60  and  2x + 5y ≤ 250',
      [
        'x + y ≤ 60  and  2x + 5y ≥ 250',
        'x + y ≥ 60  and  2x + 5y ≥ 250',
        '2x + 5y ≤ 60  and  x + y ≥ 250',
      ],
      0
    ),
    hint: '"At least 60" means ≥ 60. "Cannot exceed $250" means ≤ 250.',
    explanation: 'Total items x + y ≥ 60 and total cost 2x + 5y ≤ 250.',
  },
  {
    id: 'ost-exp-sys-ineq-2',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 31,
    type: 'multiple-choice',
    prompt:
      'A club sells caps (x) for $10 and shirts (y) for $15. They want to sell at most 120 items total and earn at least $1,400. Which system models these goals?',
    ...makeMcOptions(
      'x + y ≤ 120  and  10x + 15y ≥ 1,400',
      [
        'x + y ≥ 120  and  10x + 15y ≤ 1,400',
        'x + y ≤ 120  and  10x + 15y ≤ 1,400',
        '10x + 15y ≤ 120  and  x + y ≥ 1,400',
      ],
      3
    ),
    hint: '"At most 120" means ≤ 120. "At least $1,400" means ≥ 1,400.',
    explanation: 'Total items x + y ≤ 120 and revenue 10x + 15y ≥ 1,400.',
  },
];

// ============================================================================
// 9. SIMPLIFYING EXPRESSIONS (+26 -> 34 total) — Basic Simplifying Problems
// ============================================================================
const simpCombineSpecs: [number, number, number, number][] = [
  // a*x + b + c*x + d
  [7, 4, -3, 9],
  [8, -5, -2, 11],
  [4, 9, 3, -6],
  [9, -7, -4, -2],
  [6, 12, -5, -8],
];

const simpCombineQuestions: OstQuestion[] = simpCombineSpecs.map(([a, b, c, d], i) => {
  const ansA = a + c;
  const ansB = b + d;
  const ans = fmtLinearExpr(ansA, ansB);
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtLinearExpr(a - c, ansB),
      fmtLinearExpr(ansA, b - d),
      fmtLinearExpr(a + c, -ansB),
    ],
    i
  );
  return {
    id: `ost-exp-simp-comb-${i + 1}`,
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression by combining like terms:',
    equation: `${a}x ${fmtSignNum(b)} ${c >= 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`} ${fmtSignNum(d)}`,
    options,
    correctAnswer,
    hint: `Group the x-terms (${a}x ${c >= 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`}) and group the constants (${b} ${fmtSignNum(d)}).`,
    explanation: `(${a}x ${c >= 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`}) + (${b} ${fmtSignNum(d)}) = ${ans}.`,
  };
});

const simpSingleDistSpecs: [number, number, number, number, number][] = [
  // k(a*x + b) + c*x + d
  [3, 1, 4, 2, -5],
  [5, 2, -3, 1, 8],
  [2, 3, -4, 5, 7],
  [4, 2, 1, -3, 6],
  [6, 1, -2, 3, -4],
];

const simpSingleDistQuestions: OstQuestion[] = simpSingleDistSpecs.map(([k, a, b, c, d], i) => {
  const ansA = k * a + c;
  const ansB = k * b + d;
  const ans = fmtLinearExpr(ansA, ansB);
  const aLead = a === 1 ? 'x' : `${a}x`;
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtLinearExpr(ansA, b + d),
      fmtLinearExpr(a + c, ansB),
      fmtLinearExpr(ansA, -ansB),
    ],
    i + 1
  );
  return {
    id: `ost-exp-simp-dist-${i + 1}`,
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression by distributing and combining like terms:',
    equation: `${k}(${aLead} ${fmtSignNum(b)}) ${c >= 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`} ${fmtSignNum(d)}`,
    options,
    correctAnswer,
    hint: `Multiply ${k} by BOTH terms inside (${aLead} ${fmtSignNum(b)}), then combine like terms.`,
    explanation: `${k * a}x ${fmtSignNum(k * b)} ${c >= 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`} ${fmtSignNum(d)} = ${ans}.`,
  };
});

const simpNegDistSpecs: [number, number, number, number][] = [
  // a*x - k(b*x - c) -> (a - k*b)x + k*c
  [8, 2, 1, 5],
  [10, 4, 1, 3],
  [11, 3, 2, 4],
  [7, 2, 3, 6],
  [9, 5, 1, 2],
];

const simpNegDistQuestions: OstQuestion[] = simpNegDistSpecs.map(([a, k, b, c], i) => {
  const ansA = a - k * b;
  const ansB = k * c;
  const ans = fmtLinearExpr(ansA, ansB);
  const bLead = b === 1 ? 'x' : `${b}x`;
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtLinearExpr(ansA, -ansB),
      fmtLinearExpr(ansA, -c),
      fmtLinearExpr(a + k * b, ansB),
    ],
    i + 2
  );
  return {
    id: `ost-exp-simp-neg-${i + 1}`,
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression (watch the negative sign!):',
    equation: `${a}x - ${k}(${bLead} - ${c})`,
    options,
    correctAnswer,
    hint: `Distribute -${k} to BOTH ${bLead} and -${c}: (-${k})(-${c}) = +${k * c}.`,
    explanation: `${a}x - ${k * b}x + ${k * c} = ${ans}.`,
  };
});

const simpFracDistSpecs: [number, number, number, number, number][] = [
  // (num/den)(m*x + p) + q*x + r -> with den | m and den | p
  [1, 3, 9, -6, 5], // (1/3)(9x - 6) + 5 = 3x + 3
  [1, 4, 8, 12, -2], // (1/4)(8x + 12) - 2 = 2x + 1
  [2, 5, 10, -15, 7], // (2/5)(10x - 15) + 7 = 4x + 1
  [3, 4, 12, 8, -9], // (3/4)(12x + 8) - 9 = 9x - 3
  [1, 2, 10, -4, 6], // (1/2)(10x - 4) + 6 = 5x + 4
];

const simpFracDistQuestions: OstQuestion[] = simpFracDistSpecs.map(([num, den, m, p, r], i) => {
  const ansA = (num * m) / den;
  const innerConst = (num * p) / den;
  const ansB = innerConst + r;
  const ans = fmtLinearExpr(ansA, ansB);
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtLinearExpr(ansA, p + r),
      fmtLinearExpr(m, ansB),
      fmtLinearExpr(ansA, innerConst - r),
    ],
    i
  );
  return {
    id: `ost-exp-simp-frac-${i + 1}`,
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression:',
    equation: `\\frac{${num}}{${den}}(${m}x ${fmtSignNum(p)}) ${fmtSignNum(r)}`,
    options,
    correctAnswer,
    hint: `Multiply \\frac{${num}}{${den}} by BOTH ${m}x and ${p}, then combine with ${r}.`,
    explanation: `${ansA}x ${fmtSignNum(innerConst)} ${fmtSignNum(r)} = ${ans}.`,
  };
});

const simpTwoGroupSpecs: [number, number, number, number][] = [
  // p(x + a) - q(x + b)
  [5, 3, 2, 4],
  [6, 2, 4, 1],
  [4, 5, 3, 2],
];

const simpTwoGroupQuestions: OstQuestion[] = simpTwoGroupSpecs.map(([p, a, q, b], i) => {
  const ansA = p - q;
  const ansB = p * a - q * b;
  const ans = fmtLinearExpr(ansA, ansB);
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtLinearExpr(ansA, p * a + q * b),
      fmtLinearExpr(p + q, ansB),
      fmtLinearExpr(ansA, a - b),
    ],
    i + 1
  );
  return {
    id: `ost-exp-simp-two-${i + 1}`,
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression:',
    equation: `${p}(x + ${a}) - ${q}(x + ${b})`,
    options,
    correctAnswer,
    hint: `Distribute ${p} into (x + ${a}) and -${q} into (x + ${b}) before combining.`,
    explanation: `${p}x + ${p * a} - ${q}x - ${q * b} = ${ans}.`,
  };
});

const simpNumericSpecs: [number, number, number, number, number, number, 'a' | 'b'][] = [
  // p(m*x + c) - q(n*x - d) = ax + b
  [4, 2, 3, 3, 1, 2, 'b'], // 8x + 12 - 3x + 6 = 5x + 18 -> b = 18
  [5, 3, 1, 2, 4, 3, 'a'], // 15x + 5 - 8x + 6 = 7x + 11 -> a = 7
  [3, 4, -2, 2, 3, 5, 'b'], // 12x - 6 - 6x + 10 = 6x + 4 -> b = 4
];

const simpNumericQuestions: OstQuestion[] = simpNumericSpecs.map(([p, m, c, q, n, d, ask], i) => {
  const aVal = p * m - q * n;
  const bVal = p * c + q * d;
  const ans = ask === 'a' ? aVal : bVal;
  const nLead = n === 1 ? 'x' : `${n}x`;
  return {
    id: `ost-exp-simp-num-${i + 1}`,
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'numeric',
    prompt: `When ${p}(${m}x ${fmtSignNum(c)}) - ${q}(${nLead} - ${d}) is simplified into the form ax + b, what is the value of ${ask}?`,
    equation: `${p}(${m}x ${fmtSignNum(c)}) - ${q}(${nLead} - ${d}) = ax + b`,
    correctAnswer: [String(ans)],
    placeholder: `Enter ${ask}`,
    hint: `Distribute both groups carefully (remember -${q} × -${d} = +${q * d}), then combine like terms.`,
    explanation: `Distributing gives ${p * m}x ${fmtSignNum(p * c)} - ${q * n}x + ${q * d} = ${fmtLinearExpr(aVal, bVal)}, so ${ask} = ${ans}.`,
  };
});

// ============================================================================
// 10. SOLVING EQUATIONS (+25 -> 32 total)
// ============================================================================
const solveDistSpecs: [number, number, number, number][] = [
  // a(x + b) + c = d, where ans = x
  [3, 4, 5, 2], // 3(x + 4) + 5 = 23
  [4, -3, 7, 5], // 4(x - 3) + 7 = 15
  [5, 2, -6, 4], // 5(x + 2) - 6 = 24
  [2, 7, -3, 3], // 2(x + 7) - 3 = 17
  [6, -1, 4, 4], // 6(x - 1) + 4 = 22
];

const solveDistQuestions: OstQuestion[] = solveDistSpecs.map(([a, b, c, ans], i) => {
  const rhs = a * (ans + b) + c;
  return {
    id: `ost-exp-solv-dist-${i + 1}`,
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 32,
    type: 'numeric',
    prompt: 'Solve for x:',
    equation: `${a}(x ${fmtSignNum(b)}) ${fmtSignNum(c)} = ${rhs}`,
    correctAnswer: [String(ans)],
    placeholder: 'Enter x',
    hint: `Distribute ${a} into (x ${fmtSignNum(b)}), combine the constants, and isolate x.`,
    explanation: `${a}x ${fmtSignNum(a * b + c)} = ${rhs} -> ${a}x = ${rhs - (a * b + c)} -> x = ${ans}.`,
  };
});

const solveBothSidesSpecs: [number, number, number, number][] = [
  // a(x + b) = c*x + d -> solve for x = ans
  [6, 4, 2, 5], // 6(x + 4) = 2x + 44? Wait: 6(5+4)=54, 2(5)=10, d=44
  [8, -3, 3, 7], // 8(7-3)=32, 3(7)=21, d=11
  [9, 2, 4, 4], // 9(4+2)=54, 4(4)=16, d=38
  [5, -4, 2, 8], // 5(8-4)=20, 2(8)=16, d=4
  [7, 3, 3, 6], // 7(6+3)=63, 3(6)=18, d=45
];

const solveBothSidesQuestions: OstQuestion[] = solveBothSidesSpecs.map(([a, b, c, ans], i) => {
  const d = a * (ans + b) - c * ans;
  return {
    id: `ost-exp-solv-both-${i + 1}`,
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'What is the solution to the equation shown?',
    equation: `${a}(x ${fmtSignNum(b)}) = ${fmtLinearExpr(c, d)}`,
    correctAnswer: [String(ans)],
    placeholder: 'Enter x',
    hint: `Distribute ${a} on the left side first: ${a}x ${fmtSignNum(a * b)} = ${fmtLinearExpr(c, d)}.`,
    explanation: `${a}x ${fmtSignNum(a * b)} = ${fmtLinearExpr(c, d)} -> ${a - c}x = ${d - a * b} -> x = ${ans}.`,
  };
});

const solveFracDistSpecs: [number, number, number, number, number, number][] = [
  // (num/den)(m*x + p) + q = r -> with den | m, den | p
  [3, 4, 4, -8, 5, 7], // (3/4)(4x - 8) + 5 = 3x - 6 + 5 = 3x - 1; at x=7 -> 20
  [2, 5, 5, 10, -3, 6], // (2/5)(5x + 10) - 3 = 2x + 1; at x=6 -> 13
  [1, 2, 6, -10, 4, 8], // (1/2)(6x - 10) + 4 = 3x - 1; at x=8 -> 23
  [3, 5, 5, -15, 2, 9], // (3/5)(5x - 15) + 2 = 3x - 7; at x=9 -> 20
  [4, 3, 3, 6, -5, 4], // (4/3)(3x + 6) - 5 = 4x + 3; at x=4 -> 19
];

const solveFracDistQuestions: OstQuestion[] = solveFracDistSpecs.map(([num, den, m, p, q, ans], i) => {
  const c1 = (num * m) / den;
  const c0 = (num * p) / den;
  const rhs = c1 * ans + c0 + q;
  return {
    id: `ost-exp-solv-fdist-${i + 1}`,
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 3,
    type: 'numeric',
    prompt: 'Solve for x:',
    equation: `\\frac{${num}}{${den}}(${m}x ${fmtSignNum(p)}) ${fmtSignNum(q)} = ${rhs}`,
    correctAnswer: [String(ans)],
    placeholder: 'Enter x',
    hint: `Distribute \\frac{${num}}{${den}} across (${m}x ${fmtSignNum(p)}) to get ${c1}x ${fmtSignNum(c0)}, then combine constants.`,
    explanation: `${c1}x ${fmtSignNum(c0 + q)} = ${rhs} -> ${c1}x = ${rhs - (c0 + q)} -> x = ${ans}.`,
  };
});

const solveClearFracQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-solv-clr-1',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'What is the solution to the equation shown?',
    equation: '4x + 3 - \\frac{x}{2} = 24',
    correctAnswer: ['6'],
    placeholder: 'Enter x',
    hint: 'Multiply every term by 2 (or combine 4x - \\frac{x}{2} = \\frac{7}{2}x) to clear the fraction.',
    explanation: '\\frac{7}{2}x + 3 = 24 -> \\frac{7}{2}x = 21 -> x = 6.',
  },
  {
    id: 'ost-exp-solv-clr-2',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'What is the solution to the equation shown?',
    equation: '5x - 6 + \\frac{x}{2} = 16',
    correctAnswer: ['4'],
    placeholder: 'Enter x',
    hint: 'Combine 5x + \\frac{x}{2} = 5.5x (or multiply the entire equation by 2: 10x - 12 + x = 32).',
    explanation: '11x - 12 = 32 -> 11x = 44 -> x = 4.',
  },
  {
    id: 'ost-exp-solv-clr-3',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 34,
    type: 'numeric',
    prompt: 'What is the correct solution to the equation shown?',
    equation: '\\frac{1}{2}(x + 10) = 3(x - 4) - 8',
    correctAnswer: ['10'],
    placeholder: 'Enter x',
    hint: 'Multiply the ENTIRE equation by 2 (including the -8!): x + 10 = 6(x - 4) - 16.',
    explanation: 'x + 10 = 6x - 24 - 16 -> x + 10 = 6x - 40 -> 50 = 5x -> x = 10.',
  },
  {
    id: 'ost-exp-solv-clr-4',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 34,
    type: 'numeric',
    prompt: 'What is the correct solution to the equation shown?',
    equation: '\\frac{1}{2}(x + 14) = 2(x - 5) + 5',
    correctAnswer: ['8'],
    placeholder: 'Enter x',
    hint: 'Multiply every term by 2: x + 14 = 4(x - 5) + 10.',
    explanation: 'x + 14 = 4x - 20 + 10 -> x + 14 = 4x - 10 -> 24 = 3x -> x = 8.',
  },
  {
    id: 'ost-exp-solv-clr-5',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'Solve for x:',
    equation: '2x + 7 - \\frac{x}{3} = 22',
    correctAnswer: ['9'],
    placeholder: 'Enter x',
    hint: 'Multiply every term by 3 to clear the denominator: 6x + 21 - x = 66.',
    explanation: '5x + 21 = 66 -> 5x = 45 -> x = 9.',
  },
];

const solveErrorQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-solv-err-1',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'A student solved 3x + 7 = 29 - (x - 6) and made a sign error. What is the CORRECT value of x?',
    equation: '3x + 7 = 29 - (x - 6)',
    correctAnswer: ['7'],
    placeholder: 'Enter x',
    hint: 'Distribute the negative sign to BOTH x and -6: -(x - 6) = -x + 6.',
    explanation: '3x + 7 = 29 - x + 6 -> 3x + 7 = 35 - x -> 4x = 28 -> x = 7.',
  },
  {
    id: 'ost-exp-solv-err-2',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'A student solved 5x - 4 = 40 - (2x - 6) and made a distribution error. What is the CORRECT value of x?',
    equation: '5x - 4 = 40 - (2x - 6)',
    correctAnswer: ['7.14', '50/7'], // wait let's make it an exact integer!
    placeholder: 'Enter x',
    hint: 'Distribute the minus sign: 40 - 2x + 6.',
    explanation: '7x = 50 -> x = \\frac{50}{7}.',
  },
  {
    id: 'ost-exp-solv-err-3',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 34,
    type: 'numeric',
    prompt: 'Maya solved the equation below and made a sign error. What is the CORRECT solution?',
    equation: '6(2x - 5) = -4(x + 3) + 14',
    correctAnswer: ['2'],
    placeholder: 'Enter x',
    hint: 'Distribute carefully: 12x - 30 = -4x - 12 + 14.',
    explanation: '12x - 30 = -4x + 2 -> 16x = 32 -> x = 2.',
  },
  {
    id: 'ost-exp-solv-err-4',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 34,
    type: 'numeric',
    prompt: 'Carlos solved the equation below and missed a negative sign. What is the CORRECT solution?',
    equation: '4(3x - 2) = -3(x + 6) + 25',
    correctAnswer: ['1'],
    placeholder: 'Enter x',
    hint: 'Expand both sides: 12x - 8 = -3x - 18 + 25.',
    explanation: '12x - 8 = -3x + 7 -> 15x = 15 -> x = 1.',
  },
  {
    id: 'ost-exp-solv-err-5',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'Find the CORRECT solution to the equation:',
    equation: '6x - 5 = 35 - (2x - 8)',
    correctAnswer: ['6'],
    placeholder: 'Enter x',
    hint: 'Distribute the minus sign to get 35 - 2x + 8 = 43 - 2x.',
    explanation: '6x - 5 = 43 - 2x -> 8x = 48 -> x = 6.',
  },
];

// Clean integer for solveErrorQuestions[1]: 5x - 4 = 36 - (2x - 9) -> 5x - 4 = 45 - 2x -> 7x = 49 -> x = 7!
solveErrorQuestions[1] = {
  id: 'ost-exp-solv-err-2',
  topic: 'solving-equations',
  unit: 'Solving Equations',
  playbookPage: 33,
  type: 'numeric',
  prompt: 'A student solved 5x - 4 = 36 - (2x - 9) and made a distribution error. What is the CORRECT value of x?',
  equation: '5x - 4 = 36 - (2x - 9)',
  correctAnswer: ['7'],
  placeholder: 'Enter x',
  hint: 'Distribute the minus sign to BOTH terms inside parentheses: -(2x - 9) = -2x + 9.',
  explanation: '5x - 4 = 36 - 2x + 9 -> 5x - 4 = 45 - 2x -> 7x = 49 -> x = 7.',
};

export const OST_EXPANSION_PART_2: OstQuestion[] = [
  ...expPopQuestions,
  ...expInitialQuestions,
  ...expFixDecayQuestions,
  ...expRateQuestions,
  ...expConceptQuestions,
  ...linearTaxiQuestions,
  ...linearTableQuestions,
  ...linearInterceptQuestions,
  ...linearGraphQuestions,
  ...linearInterpretQuestions,
  ...linearWordQuestions,
  ...sysCountQuestions,
  ...sysFracSolveQuestions,
  ...sysFxGxQuestions,
  ...sysSumDiffQuestions,
  ...sysTicketQuestions,
  ...sysEquivQuestions,
  ...sysIneqQuestions,
  ...simpCombineQuestions,
  ...simpSingleDistQuestions,
  ...simpNegDistQuestions,
  ...simpFracDistQuestions,
  ...simpTwoGroupQuestions,
  ...simpNumericQuestions,
  ...solveDistQuestions,
  ...solveBothSidesQuestions,
  ...solveFracDistQuestions,
  ...solveClearFracQuestions,
  ...solveErrorQuestions,
];
