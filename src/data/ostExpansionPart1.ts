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

function fmtTerm(coef: number, varPart: string, isFirst = false): string {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const mag = abs === 1 && varPart ? varPart : `${abs}${varPart}`;
  if (isFirst) return coef < 0 ? `-${mag}` : mag;
  return coef < 0 ? ` - ${mag}` : ` + ${mag}`;
}

function fmtPoly2(a: number, b: number, c: number): string {
  let out = '';
  if (a !== 0) out += fmtTerm(a, 'x^{2}', true);
  if (b !== 0) out += fmtTerm(b, 'x', out.length === 0);
  if (c !== 0) out += out.length === 0 ? `${c}` : ` ${fmtSignNum(c)}`;
  return out || '0';
}

function fmtPoly3(a: number, b: number, c: number, d: number): string {
  let out = '';
  if (a !== 0) out += fmtTerm(a, 'x^{3}', true);
  if (b !== 0) out += fmtTerm(b, 'x^{2}', out.length === 0);
  if (c !== 0) out += fmtTerm(c, 'x', out.length === 0);
  if (d !== 0) out += out.length === 0 ? `${d}` : ` ${fmtSignNum(d)}`;
  return out || '0';
}

// ============================================================================
// 1. LAZY WAY STRATEGIES (+26 -> 32 total)
// ============================================================================
const lazyBacksolveEqs: [number, number, number, number, number][] = [
  // [a, b, c, d, x] where a*x + b = c*x + d
  [5, -3, 2, 12, 5],
  [6, 4, 3, 22, 6],
  [7, -8, 4, 13, 7],
  [3, 11, 5, -3, 7],
  [8, -5, 3, 15, 4],
  [4, 9, -2, 27, 3],
  [9, -12, 5, 16, 7],
];

const lazyBacksolveQuestions: OstQuestion[] = lazyBacksolveEqs.map(([a, b, c, d, ans], i) => {
  const { options, correctAnswer } = makeMcOptions(
    `${ans}`,
    [`${ans - 2}`, `${ans + 2}`, `${ans + 4}`],
    i + 1
  );
  return {
    id: `ost-exp-lazy-bs-${i + 1}`,
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 2,
    type: 'multiple-choice',
    prompt: 'Use back-solving (plugging in choices) to solve for x:',
    equation: `${a}x ${fmtSignNum(b)} = ${c}x ${fmtSignNum(d)}`,
    options,
    correctAnswer,
    hint: 'Plug each answer choice in for x until the left and right sides evaluate to the same number.',
    explanation: `At x = ${ans}: ${a}(${ans}) ${fmtSignNum(b)} = ${a * ans + b}, and ${c}(${ans}) ${fmtSignNum(d)} = ${c * ans + d}.`,
  };
});

const lazyFuncBacksolveSpecs: [number, number, number, number][] = [
  // [m, b, target, x] -> f(x) = m*x + b = target
  [-3, 14, 2, 4],
  [4, -7, 17, 6],
  [-4, 25, 5, 5],
  [5, -11, 19, 6],
  [-2, 15, -1, 8],
  [3, -8, 13, 7],
];

const lazyFuncBacksolveQuestions: OstQuestion[] = lazyFuncBacksolveSpecs.map(([m, b, target, ans], i) => {
  const { options, correctAnswer } = makeMcOptions(
    `${ans}`,
    [`${ans - 1}`, `${ans + 2}`, `${ans + 3}`],
    i + 2
  );
  return {
    id: `ost-exp-lazy-fn-${i + 1}`,
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 2,
    type: 'multiple-choice',
    prompt: `If f(x) = ${m}x ${fmtSignNum(b)}, find x such that f(x) = ${target}.`,
    equation: `f(x) = ${m}x ${fmtSignNum(b)},   f(x) = ${target}`,
    options,
    correctAnswer,
    hint: `Plug each choice into ${m}x ${fmtSignNum(b)} until the result equals ${target}.`,
    explanation: `${m}(${ans}) ${fmtSignNum(b)} = ${m * ans + b} = ${target}, so x = ${ans}.`,
  };
});

const lazyQuadInterceptSpecs: [number, number, number][] = [
  // roots r1, r2; k -> x^2 - (r1+r2)x + (r1*r2 + k) = k
  [1, 6, 4],
  [2, 5, 3],
  [3, 7, 5],
  [2, 8, 6],
  [1, 7, 5],
];

const lazyQuadInterceptQuestions: OstQuestion[] = lazyQuadInterceptSpecs.map(([r1, r2, k], i) => {
  const b = -(r1 + r2);
  const c = r1 * r2 + k;
  const c0 = r1 * r2;
  return {
    id: `ost-exp-lazy-desmos-${i + 1}`,
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'numeric',
    prompt: 'What is one solution to the equation shown?',
    equation: `${fmtPoly2(1, b, c)} = ${k}`,
    correctAnswer: [String(r1), String(r2)],
    placeholder: 'Enter x',
    hint: `Subtract ${k} from both sides to get ${fmtPoly2(1, b, c0)} = 0, then find two numbers that multiply to ${c0} and add to ${b}.`,
    explanation: `${fmtPoly2(1, b, c0)} = (x - ${r1})(x - ${r2}) = 0, so x = ${r1} or x = ${r2}.`,
  };
});

const lazyDiffSqSpecs: [number, number][] = [
  [3, 5],
  [5, 4],
  [6, 7],
  [7, 2],
];

const lazyDiffSqQuestions: OstQuestion[] = lazyDiffSqSpecs.map(([a, b], i) => {
  const a2 = a * a;
  const b2 = b * b;
  const { options, correctAnswer } = makeMcOptions(
    `(${a}x - ${b})(${a}x + ${b})`,
    [`(${a}x - ${b})^{2}`, `(${a2}x - ${b})(x + ${b})`, `(${a}x + ${b})^{2}`],
    i
  );
  return {
    id: `ost-exp-lazy-dsq-${i + 1}`,
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given expression?',
    equation: `${a2}x^{2} - ${b2}`,
    options,
    correctAnswer,
    hint: `Use difference of squares (${a}x)^{2} - ${b}^{2}, or plug in x = 1 to match ${a2 - b2}.`,
    explanation: `${a2}x^{2} - ${b2} = (${a}x - ${b})(${a}x + ${b}).`,
  };
});

const lazyEquivSpecs: [number, number, number][] = [
  // y = a(x - h) + k -> a*x + (k - a*h)
  [3, 4, 7],
  [4, 2, -3],
  [5, 3, 2],
  [-2, 5, 11],
];

const lazyEquivQuestions: OstQuestion[] = lazyEquivSpecs.map(([a, h, k], i) => {
  const finalC = k - a * h;
  const wrongSign = k + a * h;
  const wrongDist = k - h;
  const { options, correctAnswer } = makeMcOptions(
    `y = ${a}x ${fmtSignNum(finalC)}`,
    [
      `y = ${a}x ${fmtSignNum(wrongSign)}`,
      `y = ${a}x ${fmtSignNum(wrongDist)}`,
      `y = ${a}x ${fmtSignNum(-finalC)}`,
    ],
    i + 1
  );
  return {
    id: `ost-exp-lazy-eqv-${i + 1}`,
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'multiple-choice',
    prompt: 'Which equation is equivalent to the given equation?',
    equation: `y = ${a}(x - ${h}) ${fmtSignNum(k)}`,
    options,
    correctAnswer,
    hint: `Distribute ${a} into (x - ${h}) and combine constants, or plug x = ${h} into y = ${k} to test each choice.`,
    explanation: `y = ${a}x ${fmtSignNum(-a * h)} ${fmtSignNum(k)} = ${a}x ${fmtSignNum(finalC)}.`,
  };
});

// ============================================================================
// 2. DATA ANALYSIS (+24 -> 33 total)
// ============================================================================
const dataBoxSummarySpecs: {
  context: string;
  ask: 'iqr' | 'range';
  stats: { mean: number; median: number; mode: number; min: number; max: number; q1: number; q3: number };
}[] = [
  {
    context: 'Maya records daily smoothie sales for 1 month. Based on her 5-number summary, what is the interquartile range (IQR)?',
    ask: 'iqr',
    stats: { mean: 54.2, median: 58, mode: 60, min: 22, max: 87, q1: 41, q3: 73 },
  },
  {
    context: 'A bike shop logs daily rentals for 30 days. Based on the summary table, what is the interquartile range (IQR)?',
    ask: 'iqr',
    stats: { mean: 42.5, median: 44, mode: 45, min: 14, max: 76, q1: 29, q3: 57 },
  },
  {
    context: 'A library tracks visitors per hour over a week. Based on the summary table, what is the range of the data?',
    ask: 'range',
    stats: { mean: 63.4, median: 65, mode: 70, min: 18, max: 94, q1: 45, q3: 81 },
  },
  {
    context: 'Coach Diaz tracks free throws made by players during practice. Based on the summary table, what is the interquartile range (IQR)?',
    ask: 'iqr',
    stats: { mean: 31.8, median: 34, mode: 36, min: 12, max: 50, q1: 24, q3: 43 },
  },
  {
    context: 'An arcade counts tokens redeemed each evening. Based on the summary table, what is the range?',
    ask: 'range',
    stats: { mean: 112.5, median: 118, mode: 120, min: 48, max: 185, q1: 88, q3: 144 },
  },
  {
    context: 'A coffee cart records cups sold per morning. Based on the summary table, what is the interquartile range (IQR)?',
    ask: 'iqr',
    stats: { mean: 84.0, median: 86, mode: 90, min: 40, max: 126, q1: 66, q3: 102 },
  },
];

const dataBoxSummaryQuestions: OstQuestion[] = dataBoxSummarySpecs.map((item, i) => {
  const ans = item.ask === 'iqr' ? item.stats.q3 - item.stats.q1 : item.stats.max - item.stats.min;
  return {
    id: `ost-exp-data-sum-${i + 1}`,
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 5,
    type: 'numeric',
    prompt: item.context,
    diagram: { kind: 'box-summary', stats: item.stats },
    correctAnswer: [String(ans)],
    placeholder: item.ask === 'iqr' ? 'Enter IQR' : 'Enter range',
    hint:
      item.ask === 'iqr'
        ? 'IQR = Third Quartile (Q3) - First Quartile (Q1).'
        : 'Range = Maximum - Minimum.',
    explanation:
      item.ask === 'iqr'
        ? `Q3 - Q1 = ${item.stats.q3} - ${item.stats.q1} = ${ans}.`
        : `Max - Min = ${item.stats.max} - ${item.stats.min} = ${ans}.`,
  };
});

const dataBoxCompareSpecs: {
  prompt: string;
  targetLabel: string;
  target: { min: number; q1: number; median: number; q3: number; max: number };
  options: { label: string; min: number; q1: number; median: number; q3: number; max: number }[];
  correctIdx: number;
  unit: string;
}[] = [
  {
    prompt: 'A teacher compares quiz scores across 5 groups. Which group has an interquartile range (IQR) equal to Group E?',
    targetLabel: 'Group E',
    target: { min: 15, q1: 25, median: 35, q3: 40, max: 55 },
    options: [
      { label: 'Group A', min: 10, q1: 20, median: 30, q3: 35, max: 50 },
      { label: 'Group B', min: 15, q1: 30, median: 40, q3: 50, max: 60 },
      { label: 'Group C', min: 5, q1: 15, median: 25, q3: 40, max: 55 },
      { label: 'Group D', min: 20, q1: 35, median: 40, q3: 45, max: 55 },
    ],
    correctIdx: 0,
    unit: 'Quiz Score',
  },
  {
    prompt: 'Five cross-country teams logged weekly miles. Which team has the same interquartile range (IQR) as Team 5?',
    targetLabel: 'Team 5',
    target: { min: 10, q1: 20, median: 30, q3: 45, max: 55 },
    options: [
      { label: 'Team 1', min: 5, q1: 15, median: 25, q3: 30, max: 45 },
      { label: 'Team 2', min: 15, q1: 25, median: 35, q3: 50, max: 60 },
      { label: 'Team 3', min: 10, q1: 20, median: 30, q3: 35, max: 50 },
      { label: 'Team 4', min: 20, q1: 30, median: 35, q3: 40, max: 55 },
    ],
    correctIdx: 1,
    unit: 'Miles Run',
  },
  {
    prompt: 'Five science classes recorded minutes spent on a lab. Which class has an IQR equal to Class E?',
    targetLabel: 'Class E',
    target: { min: 10, q1: 15, median: 25, q3: 30, max: 45 },
    options: [
      { label: 'Class A', min: 5, q1: 10, median: 20, q3: 30, max: 40 },
      { label: 'Class B', min: 15, q1: 20, median: 30, q3: 45, max: 55 },
      { label: 'Class C', min: 10, q1: 25, median: 30, q3: 40, max: 50 },
      { label: 'Class D', min: 20, q1: 30, median: 40, q3: 55, max: 60 },
    ],
    correctIdx: 2,
    unit: 'Minutes',
  },
  {
    prompt: 'Five gardens measured plant heights (cm). Which garden has the same median as Garden 5?',
    targetLabel: 'Garden 5',
    target: { min: 10, q1: 20, median: 35, q3: 45, max: 55 },
    options: [
      { label: 'Garden 1', min: 5, q1: 15, median: 25, q3: 40, max: 50 },
      { label: 'Garden 2', min: 15, q1: 25, median: 30, q3: 45, max: 55 },
      { label: 'Garden 3', min: 10, q1: 20, median: 40, q3: 50, max: 60 },
      { label: 'Garden 4', min: 15, q1: 25, median: 35, q3: 50, max: 55 },
    ],
    correctIdx: 3,
    unit: 'Height (cm)',
  },
];

const dataBoxCompareQuestions: OstQuestion[] = dataBoxCompareSpecs.map((spec, i) => {
  const ids = ['a', 'b', 'c', 'd'];
  const askMedian = spec.prompt.includes('median');
  const targetVal = askMedian
    ? spec.target.median
    : spec.target.q3 - spec.target.q1;
  return {
    id: `ost-exp-data-boxcmp-${i + 1}`,
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 6,
    type: 'multiple-choice',
    prompt: spec.prompt,
    diagram: {
      kind: 'box-compare',
      targetLabel: spec.targetLabel,
      target: spec.target,
      options: spec.options,
      domain: [0, 60],
      step: 10,
      unit: spec.unit,
    },
    options: spec.options.map((opt, idx) => ({
      id: ids[idx],
      label: askMedian
        ? `${opt.label} (Median = ${opt.median})`
        : `${opt.label} (Q1 = ${opt.q1}, Q3 = ${opt.q3})`,
    })),
    correctAnswer: ids[spec.correctIdx],
    hint: askMedian
      ? `Find the vertical line inside ${spec.targetLabel}'s box (${targetVal}), then match it.`
      : `Compute IQR = Q3 - Q1 for ${spec.targetLabel}: ${spec.target.q3} - ${spec.target.q1} = ${targetVal}.`,
    explanation: askMedian
      ? `${spec.options[spec.correctIdx].label} shares the median ${targetVal}.`
      : `${spec.targetLabel} has IQR = ${targetVal}, matching ${spec.options[spec.correctIdx].label}.`,
  };
});

const dataTwoWaySpecs: {
  title: string;
  prompt: string;
  colHeaders: [string, string];
  rowHeaders: [string, string];
  cells: [[string, string, string], [string, string, string], [string, string, string]];
  ans: number;
  hint: string;
  explanation: string;
}[] = [
  {
    title: 'After-School Activities',
    prompt: 'A school surveyed 120 students about sports and music. How many 10th graders chose Music?',
    colHeaders: ['Sports', 'Music'],
    rowHeaders: ['9th Grade', '10th Grade'],
    cells: [
      ['38', '—', '64'],
      ['—', '?', '56'],
      ['72', '—', '120'],
    ],
    ans: 22,
    hint: 'Find 10th Graders in Sports first: 72 - 38 = 34. Then subtract 34 from Total 10th Graders (56).',
    explanation: '10th Grade Sports = 72 - 38 = 34. 10th Grade Music = 56 - 34 = 22.',
  },
  {
    title: 'Pet Preferences',
    prompt: 'A neighborhood survey asked 90 residents about pets. How many Adults prefer Cats?',
    colHeaders: ['Dogs', 'Cats'],
    rowHeaders: ['Teens', 'Adults'],
    cells: [
      ['24', '—', '40'],
      ['—', '?', '50'],
      ['53', '—', '90'],
    ],
    ans: 21,
    hint: 'Adults preferring Dogs = 53 - 24 = 29. Subtract 29 from Total Adults (50).',
    explanation: 'Adults with Dogs = 53 - 24 = 29. Adults with Cats = 50 - 29 = 21.',
  },
  {
    title: 'Lunch Choices',
    prompt: 'Cafeteria staff tracked 150 lunch orders. How many Seniors ordered Pizza?',
    colHeaders: ['Pizza', 'Salad'],
    rowHeaders: ['Juniors', 'Seniors'],
    cells: [
      ['—', '28', '70'],
      ['?', '—', '80'],
      ['—', '54', '150'],
    ],
    ans: 54,
    hint: 'Seniors ordering Salad = 54 - 28 = 26. Subtract 26 from Total Seniors (80).',
    explanation: 'Seniors Salad = 54 - 28 = 26. Seniors Pizza = 80 - 26 = 54.',
  },
  {
    title: 'Movie Formats',
    prompt: 'A theater logged 200 ticket sales. How many Weekend buyers watched 3D?',
    colHeaders: ['Standard', '3D'],
    rowHeaders: ['Weekday', 'Weekend'],
    cells: [
      ['52', '—', '80'],
      ['—', '?', '120'],
      ['135', '—', '200'],
    ],
    ans: 37,
    hint: 'Weekend Standard = 135 - 52 = 83. Subtract 83 from Total Weekend (120).',
    explanation: 'Weekend Standard = 135 - 52 = 83. Weekend 3D = 120 - 83 = 37.',
  },
  {
    title: 'Commute Method',
    prompt: 'An office polled 110 employees on how they commute. How many Part-Time workers take the Bus?',
    colHeaders: ['Car', 'Bus'],
    rowHeaders: ['Full-Time', 'Part-Time'],
    cells: [
      ['46', '—', '68'],
      ['—', '?', '42'],
      ['74', '—', '110'],
    ],
    ans: 14,
    hint: 'Part-Time Car = 74 - 46 = 28. Subtract 28 from Total Part-Time (42).',
    explanation: 'Part-Time Car = 74 - 46 = 28. Part-Time Bus = 42 - 28 = 14.',
  },
];

const dataTwoWayQuestions: OstQuestion[] = dataTwoWaySpecs.map((item, i) => ({
  id: `ost-exp-data-twoway-${i + 1}`,
  topic: 'data-analysis',
  unit: 'Data Analysis',
  playbookPage: 8,
  type: 'numeric',
  prompt: item.prompt,
  diagram: {
    kind: 'two-way-table',
    title: item.title,
    colHeaders: item.colHeaders,
    rowHeaders: item.rowHeaders,
    cells: item.cells,
  },
  correctAnswer: [String(item.ans)],
  placeholder: 'Enter count',
  hint: item.hint,
  explanation: item.explanation,
}));

const dataScatterSpecs: {
  mLabel: string;
  b: number;
  points: [number, number][];
  distractors: [string, string, string];
  hint: string;
  explanation: string;
}[] = [
  {
    mLabel: '2',
    b: 4,
    points: [[0, 4], [1, 5.5], [2, 8], [3, 10.5], [4, 12], [5, 13.5], [6, 16]],
    distractors: ['y = 4x + 2', 'y = \\frac{1}{2}x + 4', 'y = 2x'],
    hint: 'Check the y-intercept at x = 0 (around 4) and notice y rises by about 2 for each 1 step in x.',
    explanation: 'At (0, 4) the line starts at 4, and at (6, 16) the slope is \\frac{16 - 4}{6} = 2, giving y = 2x + 4.',
  },
  {
    mLabel: '\\frac{1}{2}',
    b: 2,
    points: [[0, 2], [2, 3], [4, 4.5], [6, 5], [8, 6], [10, 7]],
    distractors: ['y = 2x + 2', 'y = \\frac{1}{2}x + 6', 'y = 2x'],
    hint: 'At x = 0, y is 2; at x = 10, y is around 7. Find rise/run = \\frac{7 - 2}{10}.',
    explanation: 'Slope = \\frac{5}{10} = \\frac{1}{2} and y-intercept = 2, giving y = \\frac{1}{2}x + 2.',
  },
  {
    mLabel: '2.5',
    b: 1,
    points: [[0, 1], [1, 3.5], [2, 6], [3, 8.5], [4, 11], [5, 13.5]],
    distractors: ['y = x + 2.5', 'y = 2.5x + 5', 'y = 0.4x + 1'],
    hint: 'At x = 0, y = 1. At x = 4, y = 11. Compute \\frac{11 - 1}{4}.',
    explanation: 'Slope = \\frac{10}{4} = 2.5 and y-intercept = 1, so y = 2.5x + 1.',
  },
  {
    mLabel: '1.5',
    b: 3,
    points: [[0, 3], [2, 6], [4, 8.5], [6, 12], [8, 15]],
    distractors: ['y = 3x + 1.5', 'y = 1.5x', 'y = \\frac{2}{3}x + 3'],
    hint: 'Notice the trend starts near (0, 3) and reaches (6, 12): slope is \\frac{12 - 3}{6}.',
    explanation: 'Slope = \\frac{9}{6} = 1.5 and y-intercept = 3, giving y = 1.5x + 3.',
  },
  {
    mLabel: '4',
    b: 0,
    points: [[1, 4], [2, 8.5], [3, 12], [4, 15.5], [5, 20]],
    distractors: ['y = \\frac{1}{4}x', 'y = 4x + 4', 'y = 2x + 2'],
    hint: 'When x = 0 the trend passes near (0, 0), and at x = 5, y = 20.',
    explanation: 'Slope = \\frac{20}{5} = 4 with y-intercept 0, giving y = 4x.',
  },
];

const dataScatterQuestions: OstQuestion[] = dataScatterSpecs.map((sp, i) => {
  const correctEq = sp.b === 0 ? `y = ${sp.mLabel}x` : `y = ${sp.mLabel}x + ${sp.b}`;
  const { options, correctAnswer } = makeMcOptions(correctEq, sp.distractors, i + 1);
  return {
    id: `ost-exp-data-scat-${i + 1}`,
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 9,
    type: 'multiple-choice',
    prompt: 'Which equation best describes the line of best fit for the scatterplot shown?',
    diagram: {
      kind: 'scatterplot',
      xLabel: 'x',
      yLabel: 'y',
      xMax: 10,
      yMax: 20,
      xStep: 2,
      yStep: 4,
      points: sp.points,
    },
    options,
    correctAnswer,
    hint: sp.hint,
    explanation: sp.explanation,
  };
});

const dataConceptQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-data-conc-1',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 6,
    type: 'multiple-choice',
    prompt:
      'Daily quiz scores (out of 20): Class X = [14, 15, 15, 16, 16, 17] vs. Class Y = [6, 9, 14, 16, 19, 20]. Which class has a LOWER standard deviation?',
    ...makeMcOptions(
      'Class X, because its scores are clustered closely together',
      [
        'Class Y, because its maximum score is higher',
        'Class Y, because its range is larger',
        'Class X, because it has a lower maximum',
      ],
      1
    ),
    hint: 'Standard deviation measures how spread out values are from the mean.',
    explanation: 'Class X scores span only 14 to 17, so Class X has much less spread and a lower standard deviation.',
  },
  {
    id: 'ost-exp-data-conc-2',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 7,
    type: 'multiple-choice',
    prompt:
      'A survey of home prices in a town has Median = $210,000 and Mean = $295,000. Why is the mean significantly higher than the median?',
    ...makeMcOptions(
      'The data are skewed right by a few very expensive homes',
      [
        'The data are skewed left by low outliers',
        'The distribution is completely symmetric',
        'The median is always smaller than the mean in every data set',
      ],
      2
    ),
    hint: 'High outliers on the right pull the mean upward while the median stays near the middle.',
    explanation: 'A right-skewed distribution (high-value tail) pulls the mean above the median.',
  },
  {
    id: 'ost-exp-data-conc-3',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 7,
    type: 'multiple-choice',
    prompt:
      'Test scores for 150 students are strongly skewed left, with several very low scores. How do the mean and median typically compare?',
    ...makeMcOptions(
      'The mean is less than the median',
      [
        'The mean is greater than the median',
        'The mean and median are guaranteed to be equal',
        'The mode is always 0',
      ],
      0
    ),
    hint: 'Think of the left tail of low values pulling the average (mean) downward.',
    explanation: 'Left-skewed data have low outliers that pull the mean below the median.',
  },
  {
    id: 'ost-exp-data-conc-4',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 5,
    type: 'multiple-choice',
    prompt:
      'A teacher adds 5 bonus points to every student’s test score in a class. Which statistic stays the SAME?',
    ...makeMcOptions(
      'Interquartile range (IQR)',
      ['Mean', 'Median', 'Maximum'],
      3
    ),
    hint: 'Adding 5 shifts every value up by 5, so centers move up, while distances between quartiles do not change.',
    explanation: 'Both Q3 and Q1 increase by 5, so Q3 - Q1 (the IQR) stays unchanged.',
  },
];

// ============================================================================
// 3. ALL THINGS POLYNOMIALS (+26 -> 32 total)
// ============================================================================
const polyDistComboSpecs: [number, number, number, number, number][] = [
  // (a*x + b) + [c*x(d*x + e)] = (c*d)x^2 + (a + c*e)x + b
  [3, -4, 2, 5, 1],
  [5, 2, 3, 2, -4],
  [-2, 7, 4, 3, 2],
  [6, -5, 2, 4, 3],
  [4, 9, 5, 2, -1],
];

const polyDistComboQuestions: OstQuestion[] = polyDistComboSpecs.map(([a, b, c, d, e], i) => {
  const c2 = c * d;
  const c1 = a + c * e;
  const c0 = b;
  const ans = fmtPoly2(c2, c1, c0);
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtPoly2(c2, a + e, b),
      fmtPoly2(c + d, c1, b),
      fmtPoly2(c2, c1, b + c),
    ],
    i
  );
  return {
    id: `ost-exp-poly-dist-${i + 1}`,
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given expression?',
    equation: `(${a}x ${fmtSignNum(b)}) + [${c}x(${d}x ${fmtSignNum(e)})]`,
    options,
    correctAnswer,
    hint: `Distribute ${c}x into (${d}x ${fmtSignNum(e)}) first, then combine like terms with (${a}x ${fmtSignNum(b)}).`,
    explanation: `Distributing gives ${c2}x^{2} ${fmtSignNum(c * e)}x. Combining with ${a}x ${fmtSignNum(b)} yields ${ans}.`,
  };
});

const polyDeg2TimesDeg1Specs: [number, number, number, number][] = [
  // (a*x^2 + b)(c*x + d) = (ac)x^3 + (ad)x^2 + (bc)x + bd
  [3, 2, 1, 5],
  [2, -5, 1, 3],
  [4, 1, 2, -3],
  [3, -2, 2, 5],
  [5, 4, 1, -2],
];

const polyDeg2TimesDeg1Questions: OstQuestion[] = polyDeg2TimesDeg1Specs.map(([a, b, c, d], i) => {
  const t3 = a * c;
  const t2 = a * d;
  const t1 = b * c;
  const t0 = b * d;
  const ans = fmtPoly3(t3, t2, t1, t0);
  const cLead = c === 1 ? 'x' : `${c}x`;
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtPoly3(t3, 0, 0, t0),
      fmtPoly3(t3, t1, t2, t0),
      fmtPoly2(t3 + t2, t1, t0),
    ],
    i + 1
  );
  return {
    id: `ost-exp-poly-deg3-${i + 1}`,
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given product?',
    equation: `(${a}x^{2} ${fmtSignNum(b)})(${cLead} ${fmtSignNum(d)})`,
    options,
    correctAnswer,
    hint: 'Multiply every term in the first parentheses by every term in the second (Box Method).',
    explanation: `Expanding gives ${ans}.`,
  };
});

const polyFghSpecs: [number, number, number, number, 'F' | 'G' | 'H'][] = [
  // (a*x + b)(c*x + d) = F x^2 + G x + H
  [5, -3, 2, 7, 'H'],
  [4, 5, 3, -6, 'G'],
  [6, -2, 3, 4, 'F'],
  [3, -7, 4, 5, 'H'],
  [2, 9, 5, -3, 'G'],
];

const polyFghQuestions: OstQuestion[] = polyFghSpecs.map(([a, b, c, d, target], i) => {
  const F = a * c;
  const G = a * d + b * c;
  const H = b * d;
  const ans = target === 'F' ? F : target === 'G' ? G : H;
  return {
    id: `ost-exp-poly-fgh-${i + 1}`,
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'numeric',
    prompt: `An equation is given. What is the value of ${target}?`,
    equation: `(${a}x ${fmtSignNum(b)})(${c}x ${fmtSignNum(d)}) = Fx^{2} + Gx + H`,
    correctAnswer: [String(ans)],
    placeholder: `Enter ${target}`,
    hint:
      target === 'H'
        ? `H is the constant term: multiply (${b}) × (${d}).`
        : target === 'F'
        ? `F is the x^{2} coefficient: multiply (${a}) × (${c}).`
        : `G is the x coefficient: add the outer (${a} × ${d}) and inner (${b} × ${c}) products.`,
    explanation: `Expanding gives ${fmtPoly2(F, G, H)}, so ${target} = ${ans}.`,
  };
});

const polyGcfSpecs: [number, number, number, number, number][] = [
  // k*(px + q)(rx + s) or (k*px + k*q)(rx + s) -> k(pr x^2 + (ps+qr)x + qs)
  [3, 1, 2, 2, -5],
  [4, 2, -1, 1, 3],
  [5, 1, 3, 2, -1],
  [2, 3, -2, 1, 4],
];

const polyGcfQuestions: OstQuestion[] = polyGcfSpecs.map(([k, p, q, r, s], i) => {
  const a1 = k * p;
  const b1 = k * q;
  const f2 = p * r;
  const f1 = p * s + q * r;
  const f0 = q * s;
  const inside = fmtPoly2(f2, f1, f0);
  const ans = `${k}(${inside})`;
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtPoly2(k * f2, 0, k * f0),
      `${k}(${fmtPoly2(f2, -f1, f0)})`,
      fmtPoly2(k * f2, k * f1 + 2 * k, k * f0),
    ],
    i + 2
  );
  return {
    id: `ost-exp-poly-gcf-${i + 1}`,
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given polynomial product?',
    equation: `(${a1}x ${fmtSignNum(b1)})(${r === 1 ? 'x' : `${r}x`} ${fmtSignNum(s)})`,
    options,
    correctAnswer,
    hint: `Multiply the binomials first, then factor out the GCF of ${k}.`,
    explanation: `Expanding gives ${fmtPoly2(k * f2, k * f1, k * f0)} = ${ans}.`,
  };
});

const polyAddSpecs: [number, number, number, number, number, number][] = [
  [4, 3, -5, 2, -7, 8],
  [5, -2, 6, -3, 9, -1],
  [2, 8, -3, 6, -5, 10],
];

const polyAddQuestions: OstQuestion[] = polyAddSpecs.map(([a, b, c, d, e, f], i) => {
  const ans = fmtPoly2(a + d, b + e, c + f);
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtPoly2(a - d, b + e, c + f),
      fmtPoly2(a + d, b - e, c + f),
      fmtPoly2(a + d, b + e, c - f),
    ],
    i
  );
  return {
    id: `ost-exp-poly-add-${i + 1}`,
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Create an equivalent expression using the fewest terms possible:',
    equation: `(${fmtPoly2(a, b, c)}) + (${fmtPoly2(d, e, f)})`,
    options,
    correctAnswer,
    hint: 'Combine x^{2} terms with x^{2} terms, x terms with x terms, and constants with constants.',
    explanation: `Combining like terms produces ${ans}.`,
  };
});

const polySubSpecs: [number, number, number, number, number, number][] = [
  [5, -3, 4, 2, 4, -3],
  [7, 2, -6, -3, 5, 2],
  [4, -8, 1, 2, -3, 7],
  [6, 5, -2, -2, -4, 9],
];

const polySubQuestions: OstQuestion[] = polySubSpecs.map(([a, b, c, d, e, f], i) => {
  const ans = fmtPoly2(a - d, b - e, c - f);
  const { options, correctAnswer } = makeMcOptions(
    ans,
    [
      fmtPoly2(a - d, b + e, c + f),
      fmtPoly2(a + d, b - e, c - f),
      fmtPoly2(a - d, b - e, c + f),
    ],
    i + 1
  );
  return {
    id: `ost-exp-poly-sub-${i + 1}`,
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Create an equivalent expression using the fewest terms possible:',
    equation: `(${fmtPoly2(a, b, c)}) - (${fmtPoly2(d, e, f)})`,
    options,
    correctAnswer,
    hint: 'Distribute the minus sign to EVERY term in the second parentheses before combining like terms.',
    explanation: `Flipping all signs in the second polynomial and combining gives ${ans}.`,
  };
});

// ============================================================================
// 4. FUNCTIONS & FUNCTION NOTATION (+26 -> 31 total)
// ============================================================================
const funcTableSpecs: {
  tables: { label: string; rows: [number, number][] }[];
  correctIdx: number;
  explanation: string;
}[] = [
  {
    tables: [
      { label: 'Table A', rows: [[1, 4], [2, 7], [3, 10]] },
      { label: 'Table B', rows: [[2, 5], [2, 8], [4, 9]] },
      { label: 'Table C', rows: [[-1, 3], [0, 4], [-1, 6]] },
      { label: 'Table D', rows: [[5, 1], [5, 2], [5, 3]] },
    ],
    correctIdx: 0,
    explanation: 'Table A has distinct x-values (1, 2, 3), so each input has exactly one output.',
  },
  {
    tables: [
      { label: 'Table A', rows: [[0, 1], [0, 3], [2, 5]] },
      { label: 'Table B', rows: [[4, 2], [4, -2], [9, 3]] },
      { label: 'Table C', rows: [[-2, 5], [0, 5], [3, 5]] },
      { label: 'Table D', rows: [[1, 4], [6, 2], [6, 7]] },
    ],
    correctIdx: 2,
    explanation: 'Table C has unique x-values (-2, 0, 3). Repeating y-values is fine; repeating x-values with different y-values is not.',
  },
  {
    tables: [
      { label: 'Table A', rows: [[3, 1], [3, 4], [3, 7]] },
      { label: 'Table B', rows: [[1, 2], [2, 4], [2, 6]] },
      { label: 'Table C', rows: [[5, 0], [6, 1], [5, 2]] },
      { label: 'Table D', rows: [[-3, 9], [-1, 1], [2, 4]] },
    ],
    correctIdx: 3,
    explanation: 'In Table D, x-values -3, -1, and 2 never repeat.',
  },
  {
    tables: [
      { label: 'Table A', rows: [[2, 6], [4, 6], [6, 6]] },
      { label: 'Table B', rows: [[1, 2], [1, 5], [3, 8]] },
      { label: 'Table C', rows: [[4, 0], [7, 2], [7, 5]] },
      { label: 'Table D', rows: [[-2, 1], [-2, 4], [0, 9]] },
    ],
    correctIdx: 0,
    explanation: 'Table A has unique inputs (2, 4, 6). Each input maps to one output.',
  },
  {
    tables: [
      { label: 'Table A', rows: [[0, 2], [3, 5], [0, 8]] },
      { label: 'Table B', rows: [[-4, 1], [0, 3], [4, 5]] },
      { label: 'Table C', rows: [[8, 1], [8, 2], [9, 3]] },
      { label: 'Table D', rows: [[2, 3], [5, 6], [5, 9]] },
    ],
    correctIdx: 1,
    explanation: 'In Table B, x-values -4, 0, and 4 are all distinct.',
  },
];

const funcTableQuestions: OstQuestion[] = funcTableSpecs.map((sp, i) => {
  const ids = ['a', 'b', 'c', 'd'];
  return {
    id: `ost-exp-func-tbl-${i + 1}`,
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'multiple-choice',
    prompt: 'Which table represents y as a function of x?',
    diagram: { kind: 'function-table-set', tables: sp.tables },
    options: sp.tables.map((t, idx) => ({ id: ids[idx], label: t.label })),
    correctAnswer: ids[sp.correctIdx],
    hint: 'Check the x-column in each table. A function never assigns two different y-values to the same x-value.',
    explanation: sp.explanation,
  };
});

const funcPairsSpecs: {
  baseSet: string;
  goodPair: string;
  badPairs: [string, string, string];
  newX: number;
}[] = [
  { baseSet: '{(2, 5), (4, 7), (8, 1)}', goodPair: '(6, 5)', badPairs: ['(2, 9)', '(4, 1)', '(8, 3)'], newX: 6 },
  { baseSet: '{(-3, 2), (0, 5), (5, 9)}', goodPair: '(3, 2)', badPairs: ['(-3, 4)', '(0, 1)', '(5, 0)'], newX: 3 },
  { baseSet: '{(1, 8), (3, 4), (7, 2)}', goodPair: '(5, 4)', badPairs: ['(1, 2)', '(3, 9)', '(7, 6)'], newX: 5 },
  { baseSet: '{(-4, 1), (-1, 6), (2, 3)}', goodPair: '(4, 6)', badPairs: ['(-4, 5)', '(-1, 2)', '(2, 8)'], newX: 4 },
  { baseSet: '{(0, -2), (3, 7), (9, 4)}', goodPair: '(6, 7)', badPairs: ['(0, 3)', '(3, 1)', '(9, -2)'], newX: 6 },
];

const funcPairsQuestions: OstQuestion[] = funcPairsSpecs.map((sp, i) => {
  const { options, correctAnswer } = makeMcOptions(sp.goodPair, sp.badPairs, i + 1);
  return {
    id: `ost-exp-func-pair-${i + 1}`,
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'multiple-choice',
    prompt: `A set of ordered pairs representing a function is ${sp.baseSet}. Which ordered pair could be included so the set remains a function?`,
    equation: sp.baseSet,
    options,
    correctAnswer,
    hint: 'Choose the pair whose x-coordinate does NOT already appear in the set with a different y-value.',
    explanation: `Only ${sp.goodPair} uses a new x-value (${sp.newX}), keeping the relation a function.`,
  };
});

const funcWordSpecs: [string, number, number, number, string][] = [
  ['Jordan earns $12 per lawn mowed plus a $45 daily bonus, modeled by f(n) = 12n + 45. What is f(8)?', 12, 45, 8, 'dollars'],
  ['A bakery’s total muffins baked after h hours is modeled by f(h) = 24h + 36. What is f(5)?', 24, 36, 5, 'muffins'],
  ['A cyclist’s distance in miles after t hours is f(t) = 16t + 8. What is f(4)?', 16, 8, 4, 'miles'],
  ['A catering bill for g guests is f(g) = 18g + 75. What is f(10)?', 18, 75, 10, 'dollars'],
  ['Water in a tank (gallons) after m minutes is f(m) = 9m + 42. What is f(7)?', 9, 42, 7, 'gallons'],
];

const funcWordQuestions: OstQuestion[] = funcWordSpecs.map(([prompt, m, b, input, unit], i) => {
  const ans = m * input + b;
  return {
    id: `ost-exp-func-word-${i + 1}`,
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'numeric',
    prompt,
    equation: `f(${input}) = ${m}(${input}) + ${b}`,
    correctAnswer: [String(ans)],
    unitLabel: unit,
    placeholder: `Enter f(${input})`,
    hint: `Substitute ${input} into the formula: multiply ${m} × ${input}, then add ${b}.`,
    explanation: `${m}(${input}) + ${b} = ${m * input} + ${b} = ${ans} ${unit}.`,
  };
});

const funcFracSpecs: [number, number, number, number][] = [
  // f(x) = (num/den)x + c evaluated at xVal
  [3, 4, 5, 12],
  [2, 5, -3, 15],
  [3, 2, 4, 8],
  [4, 3, -5, 9],
  [5, 6, 2, 12],
  [-3, 4, 10, 8],
];

const funcFracQuestions: OstQuestion[] = funcFracSpecs.map(([num, den, c, xVal], i) => {
  const ans = (num * xVal) / den + c;
  return {
    id: `ost-exp-func-frac-${i + 1}`,
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'numeric',
    prompt: `A function is shown. What is the value of f(${xVal})?`,
    equation: `f(x) = \\frac{${num}}{${den}}x ${fmtSignNum(c)}`,
    correctAnswer: [String(ans)],
    placeholder: `f(${xVal}) =`,
    hint: `Divide ${xVal} by ${den} first, multiply by ${num}, then ${c >= 0 ? `add ${c}` : `subtract ${Math.abs(c)}`}.`,
    explanation: `f(${xVal}) = \\frac{${num}}{${den}}(${xVal}) ${fmtSignNum(c)} = ${(num * xVal) / den} ${fmtSignNum(c)} = ${ans}.`,
  };
});

const funcExpEvalSpecs: [number, number, number, string[]][] = [
  // f(x) = base^x + c evaluated at xVal
  [2, 5, -1, ['5.5', '11/2']],
  [4, 2, -1, ['2.25', '9/4']],
  [3, 4, -2, ['3.75', '15/4']], // wait 3^-2 + 4 = 4 + 1/9 -> let's use exact terminating decimals!
  [5, 3, -1, ['3.2', '16/5']],
  [2, 7, -3, ['7.125', '57/8']],
];

// Fix index 2 to base 2, xVal -2 so it's 0.25 + 6 = 6.25
funcExpEvalSpecs[2] = [2, 6, -2, ['6.25', '25/4']];

const funcExpEvalQuestions: OstQuestion[] = funcExpEvalSpecs.map(([base, c, xVal, accepted], i) => ({
  id: `ost-exp-func-expeval-${i + 1}`,
  topic: 'functions',
  unit: 'Functions & Notation',
  playbookPage: 13,
  type: 'numeric',
  prompt: `A function is given. What is the value of f(${xVal})?`,
  equation: `f(x) = ${base}^{x} + ${c}`,
  correctAnswer: accepted,
  placeholder: `e.g. ${accepted[0]}`,
  hint: `A negative exponent flips the base: ${base}^{${xVal}} = \\frac{1}{${base}^{${Math.abs(xVal)}}} = \\frac{1}{${Math.pow(base, Math.abs(xVal))}}.`,
  explanation: `f(${xVal}) = \\frac{1}{${Math.pow(base, Math.abs(xVal))}} + ${c} = ${accepted[0]} (or \\frac{${accepted[1].split('/')[0]}}{${accepted[1].split('/')[1]}}).`,
}));

// ============================================================================
// 5. QUADRATICS (+27 -> 35 total)
// ============================================================================
const quadAX2Specs: [number, number, number, number, string[]][] = [
  // (p*x + q)(r*x + s) = 0 -> (pr)x^2 + (ps+qr)x + qs = 0
  [2, -1, 1, 4, ['0.5', '1/2', '-4']],
  [3, 1, 1, -2, ['2', '-1/3']],
  [2, 3, 1, -5, ['5', '-1.5', '-3/2']],
  [4, -1, 1, 2, ['0.25', '1/4', '-2']],
  [2, -5, 1, 1, ['2.5', '5/2', '-1']],
];

const fmtDisplayVal = (v: string): string => {
  if (!v.includes('/')) return v;
  const neg = v.startsWith('-');
  const [n, d] = v.replace('-', '').split('/');
  return `${neg ? '-' : ''}\\frac{${n}}{${d}}`;
};

const quadAX2Questions: OstQuestion[] = quadAX2Specs.map(([p, q, r, s, accepted], i) => {
  const a = p * r;
  const b = p * s + q * r;
  const c = q * s;
  const rLead = r === 1 ? 'x' : `${r}x`;
  return {
    id: `ost-exp-quad-ax2-${i + 1}`,
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'numeric',
    prompt: 'An equation is shown. Enter one value of x that makes the equation true.',
    equation: `${fmtPoly2(a, b, c)} = 0`,
    correctAnswer: accepted,
    placeholder: 'Enter x',
    hint: `Factor into (${p}x ${fmtSignNum(q)})(${rLead} ${fmtSignNum(s)}) = 0 and set each factor to 0.`,
    explanation: `(${p}x ${fmtSignNum(q)})(${rLead} ${fmtSignNum(s)}) = 0 gives x = ${fmtDisplayVal(accepted[0])} (or x = ${fmtDisplayVal(accepted[accepted.length - 1])}).`,
  };
});

const quadRearrangeSpecs: [number, number][] = [
  // roots r1, r2 -> k = -r1*r2 -> -r1*r2 = x^2 - (r1+r2)x -> wait x^2 - (r1+r2)x + r1*r2 = 0 => -(r1*r2) = x^2 - (r1+r2)x
  [7, -4],
  [9, -3],
  [6, -5],
  [8, -2],
  [10, -4],
];

const quadRearrangeQuestions: OstQuestion[] = quadRearrangeSpecs.map(([r1, r2], i) => {
  const b = -(r1 + r2);
  const k = -(r1 * r2); // positive! e.g. 28 = x^2 - 3x
  return {
    id: `ost-exp-quad-rearr-${i + 1}`,
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'numeric',
    prompt: 'An equation is given. What is one solution to the equation?',
    equation: `${k} = x^{2} ${fmtTerm(b, 'x', false)}`,
    correctAnswer: [String(r1), String(r2)],
    placeholder: 'Enter x',
    hint: `Move ${k} to the right side to get x^{2} ${fmtTerm(b, 'x', false)} - ${k} = 0, then factor.`,
    explanation: `x^{2} ${fmtTerm(b, 'x', false)} - ${k} = (x - ${r1})(x + ${Math.abs(r2)}) = 0, so x = ${r1} or x = ${r2}.`,
  };
});

const quadDecSpecs: [number, number, number, string[]][] = [
  // 2x^2 + bx + c = 0 divided by 2 -> x^2 + (b/2)x + c/2 = 0
  // (2x + q)(x + s) = 0
  [1, -3, 0, ['3', '-0.5', '-1/2']], // 2x^2 - 5x - 3 -> x^2 - 2.5x - 1.5 = 0
  [-3, 2, 0, ['1.5', '3/2', '-2']], // 2x^2 + x - 6 -> x^2 + 0.5x - 3 = 0
  [3, -4, 0, ['4', '-1.5', '-3/2']], // 2x^2 - 5x - 12 -> x^2 - 2.5x - 6 = 0
];

const quadDecQuestions: OstQuestion[] = quadDecSpecs.map(([q, s, _, accepted], i) => {
  const bHalf = (q + 2 * s) / 2;
  const cHalf = (q * s) / 2;
  return {
    id: `ost-exp-quad-dec-${i + 1}`,
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'numeric',
    prompt: 'What is one solution to the equation shown?',
    equation: `x^{2} ${bHalf >= 0 ? `+ ${bHalf}x` : `- ${Math.abs(bHalf)}x`} ${cHalf >= 0 ? `+ ${cHalf}` : `- ${Math.abs(cHalf)}`} = 0`,
    correctAnswer: accepted,
    placeholder: 'Enter x',
    hint: `Multiply the entire equation by 2 to clear decimals, then factor or test x = ${accepted[0]}.`,
    explanation: `Multiplying by 2 gives (2x ${fmtSignNum(q)})(x ${fmtSignNum(s)}) = 0, so x = ${fmtDisplayVal(accepted[0])} or x = ${fmtDisplayVal(accepted[accepted.length - 1])}.`,
  };
});

const quadGcfFactorSpecs: [number, number, number, number, number][] = [
  // k(px + q)(rx + s)
  [2, 3, -2, 2, 1],
  [4, 2, 1, 3, -2],
  [5, 2, -1, 1, 4],
  [3, 3, 2, 2, -3],
];

const quadGcfFactorQuestions: OstQuestion[] = quadGcfFactorSpecs.map(([k, p, q, r, s], i) => {
  const A = k * p * r;
  const B = k * (p * s + q * r);
  const C = k * q * s;
  const rLead = r === 1 ? 'x' : `${r}x`;
  const correct = `f(x) = ${k}(${p}x ${fmtSignNum(q)})(${rLead} ${fmtSignNum(s)})`;
  const { options, correctAnswer } = makeMcOptions(
    correct,
    [
      `f(x) = (${p}x ${fmtSignNum(q)})(${rLead} ${fmtSignNum(s)})`,
      `f(x) = ${k}(${p}x ${fmtSignNum(-q)})(${rLead} ${fmtSignNum(-s)})`,
      `f(x) = (${k * p}x ${fmtSignNum(k * q)})(${rLead} ${fmtSignNum(s)})`,
    ],
    i + 1
  );
  return {
    id: `ost-exp-quad-gcf-${i + 1}`,
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'multiple-choice',
    prompt: `Which completely factored form of f(x) = ${fmtPoly2(A, B, C)} can be used to identify the zeros?`,
    equation: `f(x) = ${fmtPoly2(A, B, C)}`,
    options,
    correctAnswer,
    hint: `Factor out the GCF ${k} first, then factor the remaining quadratic.`,
    explanation: `Factor out ${k}: ${k}(${fmtPoly2(p * r, p * s + q * r, q * s)}) = ${correct.replace('f(x) = ', '')}.`,
  };
});

const quadABSpecs: [number, number][] = [
  [7, -3],
  [-8, 5],
  [9, -4],
  [-7, -2],
];

const quadABQuestions: OstQuestion[] = quadABSpecs.map(([a, b], i) => {
  const p = a + b;
  const q = a * b;
  const { options, correctAnswer } = makeMcOptions(
    `${a} and ${b}`,
    [`${-a} and ${-b}`, `${a + 1} and ${b - 1}`, `${p} and ${q}`],
    i
  );
  return {
    id: `ost-exp-quad-ab-${i + 1}`,
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'multiple-choice',
    prompt: `The function f(x) = ${fmtPoly2(1, p, q)} is equivalent to f(x) = (x + a)(x + b). What are the values of a and b?`,
    equation: `${fmtPoly2(1, p, q)} = (x + a)(x + b)`,
    options,
    correctAnswer,
    hint: `Find two numbers that multiply to ${q} and add to ${p}.`,
    explanation: `${a} × (${b}) = ${q} and ${a} + (${b}) = ${p}.`,
  };
});

const quadProjectileQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-quad-proj-1',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt:
      'A toy rocket is launched from a platform. Its height (in feet) after t seconds is shown. After how many seconds does it hit the ground?',
    equation: 'h(t) = -t^{2} + 4t + 5',
    correctAnswer: ['5'],
    unitLabel: 'seconds',
    placeholder: 'Enter t',
    hint: 'The ground is h(t) = 0. Factor -(t^{2} - 4t - 5) = -(t - 5)(t + 1) = 0 and use the positive time.',
    explanation: 'At t = 5, -(5)^{2} + 4(5) + 5 = -25 + 20 + 5 = 0 seconds.',
  },
  {
    id: 'ost-exp-quad-proj-2',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt:
      'A frog leaps from a rock. Its height (in feet) after t seconds is shown. After how many seconds does the frog land on the ground?',
    equation: 'h(t) = -t^{2} + \\frac{5}{2}t + \\frac{3}{2}',
    correctAnswer: ['3'],
    unitLabel: 'seconds',
    placeholder: 'Enter t',
    hint: 'Test t = 3 in h(t): -(3)^{2} + \\frac{5}{2}(3) + \\frac{3}{2} = -9 + \\frac{18}{2}.',
    explanation: 'At t = 3: -9 + 7.5 + 1.5 = 0, so it lands at 3 seconds.',
  },
  {
    id: 'ost-exp-quad-proj-3',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt:
      'A ball is tossed upward with height h(t) = -16t^{2} + 32t + 48 feet after t seconds. After how many seconds does it hit the ground?',
    equation: 'h(t) = -16t^{2} + 32t + 48',
    correctAnswer: ['3'],
    unitLabel: 'seconds',
    placeholder: 'Enter t',
    hint: 'Factor out -16 first: -16(t^{2} - 2t - 3) = -16(t - 3)(t + 1) = 0.',
    explanation: 'Since t > 0, t = 3 seconds.',
  },
];

const quadVertexQuestions: OstQuestion[] = [
  {
    id: 'ost-exp-quad-vert-1',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt: 'A quadratic function is shown in vertex form. What is the MINIMUM value of the function?',
    equation: 'f(x) = 3(x - 4)^{2} + 7',
    correctAnswer: ['7'],
    placeholder: 'Enter minimum y',
    hint: 'In f(x) = a(x - h)^{2} + k with a > 0, the minimum value is k.',
    explanation: 'The vertex is (4, 7), so the minimum value is 7.',
  },
  {
    id: 'ost-exp-quad-vert-2',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt: 'A quadratic function is shown in vertex form. What is the MAXIMUM value of the function?',
    equation: 'f(x) = -2(x + 1)^{2} + 11',
    correctAnswer: ['11'],
    placeholder: 'Enter maximum y',
    hint: 'Since a = -2 < 0, the parabola opens downward and reaches its maximum at the vertex (-1, 11).',
    explanation: 'The vertex is (-1, 11), so the maximum value is 11.',
  },
  {
    id: 'ost-exp-quad-vert-3',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt: 'The graph of a quadratic function is shown. What is the MINIMUM value of the function?',
    diagram: { kind: 'quadratic-vertex-graph', a: 1, h: 4, k: 3 },
    correctAnswer: ['3'],
    placeholder: 'Enter minimum y',
    hint: 'Read the y-coordinate of the lowest point (vertex) on the parabola.',
    explanation: 'The vertex is at (4, 3), so the minimum value is 3.',
  },
  {
    id: 'ost-exp-quad-vert-4',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt: 'The graph of a quadratic function is shown. What is the MAXIMUM value of the function?',
    diagram: { kind: 'quadratic-vertex-graph', a: -1, h: 5, k: 8 },
    correctAnswer: ['8'],
    placeholder: 'Enter maximum y',
    hint: 'Read the y-coordinate of the highest point (vertex) on the parabola.',
    explanation: 'The vertex is at (5, 8), so the maximum value is 8.',
  },
];

export const OST_EXPANSION_PART_1: OstQuestion[] = [
  ...lazyBacksolveQuestions,
  ...lazyFuncBacksolveQuestions,
  ...lazyQuadInterceptQuestions,
  ...lazyDiffSqQuestions,
  ...lazyEquivQuestions,
  ...dataBoxSummaryQuestions,
  ...dataBoxCompareQuestions,
  ...dataTwoWayQuestions,
  ...dataScatterQuestions,
  ...dataConceptQuestions,
  ...polyDistComboQuestions,
  ...polyDeg2TimesDeg1Questions,
  ...polyFghQuestions,
  ...polyGcfQuestions,
  ...polyAddQuestions,
  ...polySubQuestions,
  ...funcTableQuestions,
  ...funcPairsQuestions,
  ...funcWordQuestions,
  ...funcFracQuestions,
  ...funcExpEvalQuestions,
  ...quadAX2Questions,
  ...quadRearrangeQuestions,
  ...quadDecQuestions,
  ...quadGcfFactorQuestions,
  ...quadABQuestions,
  ...quadProjectileQuestions,
  ...quadVertexQuestions,
];
