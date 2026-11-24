/**
 * Ohio State Test (OST) Algebra 1 Playbook Question Bank
 * ---------------------------------------------------------------------------
 * Sorted by the section topics at the top of THE_OST_PLAYBOOK_b6a0c5e5.pdf,
 * with "Simplifying Expressions" split out as its own topic of basic
 * expression-simplifying problems.
 *
 * Math Formatting:
 *   - All fractions use \frac{num}{den} so <MathText /> renders vertical fractions.
 *   - All exponents use ^{exp} so <MathText /> renders proper superscripts.
 */

import { OST_EXPANSION_PART_1 } from './ostExpansionPart1';
import { OST_EXPANSION_PART_2 } from './ostExpansionPart2';

export type QuestionType = 'multiple-choice' | 'numeric';

export type OstTopicId =
  | 'all'
  | 'lazy-way'
  | 'data-analysis'
  | 'polynomials'
  | 'functions'
  | 'quadratics'
  | 'exponential'
  | 'linear'
  | 'systems'
  | 'simplifying-expressions'
  | 'solving-equations';

export interface OstTopicMeta {
  id: OstTopicId;
  label: string;
  shortLabel: string;
  playbookHeader: string;
  playbookPages: string;
}

export const OST_TOPICS: OstTopicMeta[] = [
  {
    id: 'all',
    label: 'All Playbook Topics',
    shortLabel: 'All Topics',
    playbookHeader: 'Full Algebra 1 OST Playbook',
    playbookPages: 'pp. 2–34',
  },
  {
    id: 'lazy-way',
    label: 'Lazy Way Strategies',
    shortLabel: 'Lazy Way Strategies',
    playbookHeader: 'The Lazy Way Strategies',
    playbookPages: 'pp. 2–3',
  },
  {
    id: 'data-analysis',
    label: 'Data Analysis',
    shortLabel: 'Data Analysis',
    playbookHeader: 'Data Analysis (Box Whisker, Line of Best Fit, Data, Etc.)',
    playbookPages: 'pp. 4–9',
  },
  {
    id: 'polynomials',
    label: 'All Things Polynomials',
    shortLabel: 'Polynomials',
    playbookHeader: 'All Things Polynomials',
    playbookPages: 'pp. 10–11',
  },
  {
    id: 'functions',
    label: 'Functions & Function Notation',
    shortLabel: 'Functions & Notation',
    playbookHeader: 'Functions and Function Notations',
    playbookPages: 'pp. 12–13',
  },
  {
    id: 'quadratics',
    label: 'Quadratics (Factor, Solve, Model)',
    shortLabel: 'Quadratics',
    playbookHeader: 'Factoring, Solving, Modeling, Analyzing Quadratics',
    playbookPages: 'pp. 14–16',
  },
  {
    id: 'exponential',
    label: 'Exponential Functions',
    shortLabel: 'Exponential Functions',
    playbookHeader: 'Create, Analyze, Model Exponential Functions',
    playbookPages: 'pp. 17–19',
  },
  {
    id: 'linear',
    label: 'Linear Functions',
    shortLabel: 'Linear Functions',
    playbookHeader: 'Creating, Graphing, Modeling Linear',
    playbookPages: 'pp. 20–25',
  },
  {
    id: 'systems',
    label: 'Systems of Equations & Inequalities',
    shortLabel: 'Systems of Equations',
    playbookHeader: 'Creating, Solving, Modeling Systems of Equations',
    playbookPages: 'pp. 27–31',
  },
  {
    id: 'simplifying-expressions',
    label: 'Simplifying Expressions',
    shortLabel: 'Simplifying Expressions',
    playbookHeader: 'Simplifying Expressions',
    playbookPages: 'p. 32',
  },
  {
    id: 'solving-equations',
    label: 'Solving Equations',
    shortLabel: 'Solving Equations',
    playbookHeader: 'Solving Equations',
    playbookPages: 'pp. 32–34',
  },
];

export type OstDiagram =
  | {
      kind: 'box-summary';
      stats: {
        mean: number;
        median: number;
        mode: number;
        min: number;
        max: number;
        q1: number;
        q3: number;
      };
    }
  | {
      kind: 'box-compare';
      targetLabel: string;
      target: { min: number; q1: number; median: number; q3: number; max: number };
      options: {
        label: string;
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
      }[];
      domain: [number, number];
      step: number;
      unit: string;
    }
  | {
      kind: 'box-rasheed-valentina';
    }
  | {
      kind: 'dot-plot-compare';
    }
  | {
      kind: 'histogram-skew';
    }
  | {
      kind: 'two-way-car-interiors';
    }
  | {
      kind: 'scatterplot';
      title?: string;
      xLabel: string;
      yLabel: string;
      xMax: number;
      yMax: number;
      xStep: number;
      yStep: number;
      points: [number, number][];
    }
  | {
      kind: 'function-table-choices';
    }
  | {
      kind: 'linear-table';
      rows: { x: number; fx: string }[];
    }
  | {
      kind: 'linear-graph';
      points: [number, number][];
      slopeLabel?: string;
    }
  | {
      kind: 'quadratic-min-graph';
    }
  | {
      kind: 'quadratic-max-graph';
    }
  | {
      kind: 'two-way-table';
      title: string;
      colHeaders: [string, string];
      rowHeaders: [string, string];
      cells: [[string, string, string], [string, string, string], [string, string, string]];
    }
  | {
      kind: 'function-table-set';
      tables: { label: string; rows: [number, number][] }[];
    }
  | {
      kind: 'quadratic-vertex-graph';
      a: number;
      h: number;
      k: number;
    };

export interface OstQuestion {
  id: string;
  topic: Exclude<OstTopicId, 'all'>;
  unit: string;
  playbookPage: number;
  type: QuestionType;
  prompt: string;
  equation?: string;
  diagram?: OstDiagram;
  /** Multiple-choice options (if type === 'multiple-choice') */
  options?: { id: string; label: string }[];
  /** Correct option id for MC, or array of accepted numeric strings for numeric */
  correctAnswer: string | string[];
  /** Unit suffix shown next to numeric input (e.g. "seconds", "days", "%") */
  unitLabel?: string;
  /** Placeholder text for numeric input */
  placeholder?: string;
  /** Strategy hint shown when the player answers incorrectly */
  hint: string;
  /** Brief step-by-step explanation shown upon solving or retrying */
  explanation: string;
}

export const OST_QUESTIONS: OstQuestion[] = [
  // =========================================================================
  // 1. LAZY WAY STRATEGIES (pp. 2–3)
  // =========================================================================
  {
    id: 'ost-p2-backsolve-2',
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 2,
    type: 'multiple-choice',
    prompt: 'Use back-solving (plugging in choices) to solve for x:',
    equation: '4x - 7 = 2x + 9',
    options: [
      { id: 'a', label: '4' },
      { id: 'b', label: '6' },
      { id: 'c', label: '7' },
      { id: 'd', label: '8' },
    ],
    correctAnswer: 'd',
    hint: 'Back-Solving Strategy: Plug each answer choice into x and check when both sides are equal (or subtract 2x from both sides).',
    explanation:
      'Plug in x = 8: 4(8) - 7 = 25 and 2(8) + 9 = 25. Both sides match!',
  },
  {
    id: 'ost-p2-backsolve-3',
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 2,
    type: 'multiple-choice',
    prompt: 'If f(x) = -2x + 9, find x such that f(x) = 1.',
    equation: 'f(x) = -2x + 9,   f(x) = 1',
    options: [
      { id: 'a', label: '3' },
      { id: 'b', label: '4' },
      { id: 'c', label: '5' },
      { id: 'd', label: '6' },
    ],
    correctAnswer: 'b',
    hint: 'Test each choice by plugging it into -2(x) + 9 until the output equals 1.',
    explanation: '-2(4) + 9 = -8 + 9 = 1, so x = 4.',
  },
  {
    id: 'ost-p3-desmos-1',
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'numeric',
    prompt: 'What is one solution to the equation shown?',
    equation: 'x^{2} - 5x + 8 = 2',
    correctAnswer: ['2', '3'],
    placeholder: 'Enter x',
    hint: 'Subtract 2 from both sides so it equals 0: x^{2} - 5x + 6 = 0. What two numbers multiply to 6 and add to -5?',
    explanation:
      'x^{2} - 5x + 6 = (x - 2)(x - 3) = 0, so the solutions are x = 2 and x = 3.',
  },
  {
    id: 'ost-p3-equiv-1',
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given expression?',
    equation: '4x^{2} - 81',
    options: [
      { id: 'a', label: '(2x - 9)(2x + 9)' },
      { id: 'b', label: '(2x - 3)(2x + 27)' },
      { id: 'c', label: '(2x + 9)^{2}' },
      { id: 'd', label: '(4x - 9)(x + 9)' },
    ],
    correctAnswer: 'a',
    hint: 'Recognize a difference of squares: (2x)^{2} - 9^{2}, or test x = 1 in each choice to match 4(1)^{2} - 81 = -77.',
    explanation:
      '4x^{2} - 81 factors as (2x - 9)(2x + 9) because 2x · 2x = 4x^{2} and (-9)(9) = -81 with middle terms canceling.',
  },
  {
    id: 'ost-p3-equiv-3',
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given expression?',
    equation: '4x^{2} + 14x + 6',
    options: [
      { id: 'a', label: '2(x + 3)(x + 1)' },
      { id: 'b', label: '(4x + 2)(x + 3)' },
      { id: 'c', label: '2x(x + 7) + 3' },
      { id: 'd', label: '2(2x + 1)(x + 3)' },
    ],
    correctAnswer: 'd',
    hint: 'Factor out the GCF 2 first: 2(2x^{2} + 7x + 3), or plug in x = 1 (value = 24) to check which choice matches.',
    explanation:
      '2(2x + 1)(x + 3) = 2(2x^{2} + 7x + 3) = 4x^{2} + 14x + 6. Note: (4x + 2)(x + 3) also expands to 4x^{2} + 14x + 6 when unfactored; 2(2x + 1)(x + 3) is the completely factored form.',
  },
  {
    id: 'ost-p3-equiv-4',
    topic: 'lazy-way',
    unit: 'Lazy Way Strategies',
    playbookPage: 3,
    type: 'multiple-choice',
    prompt: 'Which equation is equivalent to the given equation?',
    equation: 'y = 2(x - 3) + 5',
    options: [
      { id: 'a', label: 'y = 2x + 1' },
      { id: 'b', label: 'y = 2(x + 3) + 4' },
      { id: 'c', label: 'y = 2x - 1' },
      { id: 'd', label: 'y = 2x + 2' },
    ],
    correctAnswer: 'c',
    hint: 'Distribute 2 into (x - 3) to get 2x - 6, then add 5.',
    explanation: 'y = 2x - 6 + 5 = 2x - 1.',
  },

  // =========================================================================
  // 2. DATA ANALYSIS (pp. 4–9)
  // =========================================================================
  {
    id: 'ost-p5-bakery-iqr',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 5,
    type: 'numeric',
    prompt:
      'Jurrell tracks the number of customers at his bakery each day for 1 month. Based on his 5-number summary table, what is the interquartile range (IQR)?',
    diagram: {
      kind: 'box-summary',
      stats: {
        mean: 68.5,
        median: 77.5,
        mode: 80,
        min: 32,
        max: 103,
        q1: 51,
        q3: 89,
      },
    },
    correctAnswer: ['38'],
    placeholder: 'Enter IQR',
    hint: 'Playbook Tip: IQR (Interquartile Range) = Third Quartile (Q3) - First Quartile (Q1).',
    explanation: 'Q3 = 89 and Q1 = 51, so IQR = 89 - 51 = 38.',
  },
  {
    id: 'ost-p6-molly-city',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 6,
    type: 'multiple-choice',
    prompt:
      'Average high temperatures (°F) over 6 months: Chicago [33, 36, 46, 57, 67, 77] vs. Honolulu [79, 79, 80, 81, 83, 85]. Molly wants to live in a city with the least variation in temperature. Which conclusion is correct?',
    options: [
      { id: 'a', label: 'Chicago, because it has a lower mean' },
      { id: 'b', label: 'Chicago, because it has a higher standard deviation' },
      { id: 'c', label: 'Honolulu, because it has a lower standard deviation' },
      { id: 'd', label: 'Honolulu, because it has a higher median' },
    ],
    correctAnswer: 'c',
    hint: 'Variation / spread is measured by standard deviation (or range). Smaller spread = lower standard deviation.',
    explanation:
      'Honolulu temperatures stay tightly clustered between 79°F and 85°F, giving it a much lower standard deviation (less variation).',
  },
  {
    id: 'ost-p6-class5-iqr',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 6,
    type: 'multiple-choice',
    prompt:
      'Mr. Cooper asks his 5 classes how many pages they read last week. Which class has an interquartile range (IQR) equal to Class 5?',
    diagram: {
      kind: 'box-compare',
      targetLabel: 'Class 5',
      target: { min: 10, q1: 20, median: 25, q3: 40, max: 50 },
      options: [
        { label: 'Class 1', min: 5, q1: 15, median: 25, q3: 30, max: 55 },
        { label: 'Class 2', min: 20, q1: 25, median: 40, q3: 50, max: 60 },
        { label: 'Class 3', min: 5, q1: 15, median: 20, q3: 25, max: 40 },
        { label: 'Class 4', min: 15, q1: 30, median: 40, q3: 50, max: 55 },
      ],
      domain: [0, 60],
      step: 10,
      unit: 'Pages Read',
    },
    options: [
      { id: 'a', label: 'Class 1 (Q1 = 15, Q3 = 30)' },
      { id: 'b', label: 'Class 2 (Q1 = 25, Q3 = 50)' },
      { id: 'c', label: 'Class 3 (Q1 = 15, Q3 = 25)' },
      { id: 'd', label: 'Class 4 (Q1 = 30, Q3 = 50)' },
    ],
    correctAnswer: 'd',
    hint: 'IQR is the length of the box (Q3 - Q1). Class 5 has Q1 = 20 and Q3 = 40, so its IQR is 20.',
    explanation: 'Class 5 IQR = 40 - 20 = 20. Class 4 has Q1 = 30 and Q3 = 50, so 50 - 30 = 20.',
  },
  {
    id: 'ost-p7-dotplot-range',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 7,
    type: 'numeric',
    prompt:
      'Customers rated Product A and Product B on a scale of 1 to 10. What is the difference between the ranges of the two dot plots?',
    diagram: { kind: 'dot-plot-compare' },
    correctAnswer: ['2'],
    placeholder: 'Enter difference',
    hint: 'Range = Max - Min. Find the range for Product A (10 - 1) and Product B (10 - 3), then subtract.',
    explanation: 'Product A range = 10 - 1 = 9. Product B range = 10 - 3 = 7. Difference = 9 - 7 = 2.',
  },
  {
    id: 'ost-p7-rasheed-valentina',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 7,
    type: 'numeric',
    prompt:
      'Rasheed and Valentina each read 10 books. What is the difference in the median number of total pages per book Rasheed and Valentina read?',
    diagram: { kind: 'box-rasheed-valentina' },
    correctAnswer: ['50'],
    unitLabel: 'pages',
    placeholder: 'Enter difference',
    hint: 'Read the vertical line inside each box: Rasheed’s median is 350 and Valentina’s median is 300.',
    explanation: '350 - 300 = 50 pages.',
  },
  {
    id: 'ost-p7-histogram-skew',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 7,
    type: 'multiple-choice',
    prompt:
      'A restaurant surveyed 200 customers (Median = 8.00, Mean = 7.35, Standard Deviation = 2.01). Which statement justifies why the median is greater than the mean?',
    diagram: { kind: 'histogram-skew' },
    options: [
      { id: 'a', label: 'The data are skewed' },
      { id: 'b', label: 'There is a large standard deviation' },
      { id: 'c', label: 'There are gaps in the data distribution' },
      { id: 'd', label: 'The distribution is roughly symmetrical' },
    ],
    correctAnswer: 'a',
    hint: 'Look at the tail of the histogram on the left (low ratings). Low outliers/skew pull the mean downward more than the median.',
    explanation:
      'Because the distribution is skewed left, low scores pull the mean (7.35) below the median (8.00).',
  },
  {
    id: 'ost-p8-car-interiors',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 8,
    type: 'numeric',
    prompt:
      'The two-way frequency table shows information about the interiors of cars and trucks at a dealership. How many trucks have leather seats?',
    diagram: { kind: 'two-way-car-interiors' },
    correctAnswer: ['15'],
    unitLabel: 'trucks',
    placeholder: 'Enter count',
    hint: 'First find Trucks with Cloth seats: Total Cloth (51) - Cars Cloth (21) = 30. Then subtract from Total Trucks (45)!',
    explanation: 'Trucks with Cloth = 51 - 21 = 30. Trucks with Leather = 45 - 30 = 15.',
  },
  {
    id: 'ost-p9-scatter-1',
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
      yStep: 2,
      points: [
        [1, 2],
        [2, 7],
        [3, 9],
        [4, 13],
        [5, 14],
        [6, 18],
      ],
    },
    options: [
      { id: 'a', label: 'y = \\frac{1}{2}x' },
      { id: 'b', label: 'y = \\frac{1}{3}x' },
      { id: 'c', label: 'y = 2x' },
      { id: 'd', label: 'y = 3x' },
    ],
    correctAnswer: 'd',
    hint: 'Pick a point on the trend, such as (3, 9) or (6, 18), and check rise over run: \\frac{18}{6}.',
    explanation: 'At x = 3, y is around 9; at x = 6, y is 18. The slope is \\frac{18}{6} = 3, giving y = 3x.',
  },
  {
    id: 'ost-p9-scatter-2',
    topic: 'data-analysis',
    unit: 'Data Analysis',
    playbookPage: 9,
    type: 'multiple-choice',
    prompt: 'Which equation best describes the line of best fit for this scatterplot?',
    diagram: {
      kind: 'scatterplot',
      xLabel: 'x',
      yLabel: 'y',
      xMax: 12,
      yMax: 12,
      xStep: 2,
      yStep: 2,
      points: [
        [0, 3],
        [1, 4.5],
        [1, 5],
        [2, 7],
        [2.5, 7.5],
        [3, 7.5],
        [3, 8],
        [4, 10],
        [4, 11.5],
        [5, 11],
      ],
    },
    options: [
      { id: 'a', label: 'y = 3x + 1.75' },
      { id: 'b', label: 'y = 1.75x + 3' },
      { id: 'c', label: 'y = 3x + 3' },
      { id: 'd', label: 'y = 1.75x' },
    ],
    correctAnswer: 'b',
    hint: 'Check the y-intercept at x = 0 (y = 3) and test x = 4: 1.75(4) + 3 = 10.',
    explanation:
      'The line starts at y-intercept (0, 3) and rises by about 7 over 4 units (slope \\frac{7}{4} = 1.75), so y = 1.75x + 3.',
  },

  // =========================================================================
  // 3. ALL THINGS POLYNOMIALS (pp. 10–11)
  // =========================================================================
  {
    id: 'ost-p11-poly-1',
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given expression?',
    equation: '(2x - 3) + [4x(3x + 2)]',
    options: [
      { id: 'a', label: '9x - 1' },
      { id: 'b', label: '14x + 5' },
      { id: 'c', label: '12x^{2} + 2x - 1' },
      { id: 'd', label: '12x^{2} + 10x - 3' },
    ],
    correctAnswer: 'd',
    hint: 'First distribute 4x into (3x + 2) to get 12x^{2} + 8x, then combine like terms with (2x - 3).',
    explanation: '(2x - 3) + 12x^{2} + 8x = 12x^{2} + (2x + 8x) - 3 = 12x^{2} + 10x - 3.',
  },
  {
    id: 'ost-p11-poly-2',
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given product?',
    equation: '(2x^{2} + 3)(x + 4)',
    options: [
      { id: 'a', label: '2x^{3} + 12' },
      { id: 'b', label: '2x^{2} + 11x + 12' },
      { id: 'c', label: '2x^{3} + 6x^{2} + 4x + 12' },
      { id: 'd', label: '2x^{3} + 8x^{2} + 3x + 12' },
    ],
    correctAnswer: 'd',
    hint: 'Use the Box Method: multiply (2x^{2} + 3) across (x + 4) to get four terms.',
    explanation: '2x^{2}·x + 2x^{2}·4 + 3·x + 3·4 = 2x^{3} + 8x^{2} + 3x + 12.',
  },
  {
    id: 'ost-p11-poly-3',
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Which expression is equivalent to the given polynomial product?',
    equation: '(2x + 3)(6x - 12)',
    options: [
      { id: 'a', label: '12x^{2} - 36' },
      { id: 'b', label: '6(2x^{2} - x - 6)' },
      { id: 'c', label: '12x^{2} + 6x - 36' },
      { id: 'd', label: '12x^{2} - 42x - 36' },
    ],
    correctAnswer: 'b',
    hint: 'Multiply using the Box Method: 12x^{2} - 24x + 18x - 36 = 12x^{2} - 6x - 36. Then factor out the GCF 6!',
    explanation: '12x^{2} - 6x - 36 = 6(2x^{2} - x - 6).',
  },
  {
    id: 'ost-p11-poly-h',
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'An equation is given. What is the value of H?',
    equation: '(7x - 4)(5x + 3) = Fx^{2} + Gx + H',
    options: [
      { id: 'a', label: '-12' },
      { id: 'b', label: '-1' },
      { id: 'c', label: '1' },
      { id: 'd', label: '8' },
    ],
    correctAnswer: 'a',
    hint: 'H is the constant term! Multiply the two constant numbers: (-4) × (+3).',
    explanation: '(-4)(3) = -12, so H = -12.',
  },
  {
    id: 'ost-p11-poly-add',
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Create an equivalent expression using the fewest terms possible:',
    equation: '(3x^{2} + 3) + (-2x^{2} + 7)',
    options: [
      { id: 'a', label: 'x^{2} + 10' },
      { id: 'b', label: '5x^{2} + 10' },
      { id: 'c', label: 'x^{2} - 4' },
      { id: 'd', label: 'x^{4} + 10' },
    ],
    correctAnswer: 'a',
    hint: 'Drop parentheses and combine like terms (same variable and exponent): 3x^{2} + (-2x^{2}) and 3 + 7.',
    explanation: '(3x^{2} - 2x^{2}) + (3 + 7) = x^{2} + 10.',
  },
  {
    id: 'ost-p11-poly-sub',
    topic: 'polynomials',
    unit: 'All Things Polynomials',
    playbookPage: 11,
    type: 'multiple-choice',
    prompt: 'Create an equivalent expression using the fewest terms possible:',
    equation: '(3x^{2} - 4x + 1) - (-x^{2} + 6)',
    options: [
      { id: 'a', label: '2x^{2} - 4x + 7' },
      { id: 'b', label: '4x^{2} - 4x + 7' },
      { id: 'c', label: '4x^{2} - 4x - 5' },
      { id: 'd', label: '2x^{2} - 4x - 5' },
    ],
    correctAnswer: 'c',
    hint: 'Flip ALL signs in the second polynomial: -(-x^{2} + 6) becomes +x^{2} - 6. Then combine like terms!',
    explanation: '3x^{2} - 4x + 1 + x^{2} - 6 = (3x^{2} + x^{2}) - 4x + (1 - 6) = 4x^{2} - 4x - 5.',
  },

  // =========================================================================
  // 4. FUNCTIONS & FUNCTION NOTATION (pp. 12–13)
  // =========================================================================
  {
    id: 'ost-p13-func-table',
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'multiple-choice',
    prompt: 'Which table represents y as a function of x?',
    diagram: { kind: 'function-table-choices' },
    options: [
      { id: 'a', label: 'Table A' },
      { id: 'b', label: 'Table B' },
      { id: 'c', label: 'Table C' },
      { id: 'd', label: 'Table D' },
    ],
    correctAnswer: 'b',
    hint: 'Playbook Rule: Check the x-column! If any x-value repeats with a different y-value, it is NOT a function.',
    explanation:
      'In Table B, x-values are 3, 5, and 7 (none repeat). Tables A, C, and D all repeat an x-value with different y-values.',
  },
  {
    id: 'ost-p13-ordered-pairs',
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'multiple-choice',
    prompt:
      'A set of ordered pairs representing a function is {(1, 3), (2, 4), (5, 6)}. Which ordered pair could be included so the set remains a function?',
    equation: '{(1, 3), (2, 4), (5, 6)}',
    options: [
      { id: 'a', label: '(1, 5)' },
      { id: 'b', label: '(2, 2)' },
      { id: 'c', label: '(4, 4)' },
      { id: 'd', label: '(5, 7)' },
    ],
    correctAnswer: 'c',
    hint: 'An x-value cannot repeat with a different y-value. Check which choice introduces a brand-new x-value!',
    explanation:
      'The existing x-values are 1, 2, and 5. Only (4, 4) uses a new x-value (4), keeping it a valid function.',
  },
  {
    id: 'ost-p13-ryan-pay',
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'numeric',
    prompt:
      'Ryan works for a delivery service. His daily pay (in dollars) when he makes n deliveries is modeled by f(n) = 7n + 96. What is his pay for 10 deliveries?',
    equation: 'f(n) = 7n + 96,   f(10) = ?',
    correctAnswer: ['166'],
    unitLabel: 'dollars',
    placeholder: 'Enter f(10)',
    hint: 'Substitute n = 10 into 7n + 96: compute 7(10) + 96.',
    explanation: 'f(10) = 7(10) + 96 = 70 + 96 = 166 dollars.',
  },
  {
    id: 'ost-p13-eval-12',
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'numeric',
    prompt: 'A function is shown. What is the value of f(12)?',
    equation: 'f(x) = \\frac{2}{3}x + 3',
    correctAnswer: ['11'],
    placeholder: 'f(12) =',
    hint: 'Plug 12 in for x: \\frac{2}{3}(12) = \\frac{24}{3} = 8, then add 3.',
    explanation: 'f(12) = \\frac{2}{3}(12) + 3 = 8 + 3 = 11.',
  },
  {
    id: 'ost-p13-eval-neg2',
    topic: 'functions',
    unit: 'Functions & Notation',
    playbookPage: 13,
    type: 'numeric',
    prompt: 'A function is given. What is the value of f(-2)?',
    equation: 'f(x) = 2^{x} + 3',
    correctAnswer: ['3.25', '13/4'],
    placeholder: 'e.g. 3.25',
    hint: 'Remember negative exponents mean reciprocal: 2^{-2} = \\frac{1}{2^{2}} = \\frac{1}{4} = 0.25.',
    explanation: 'f(-2) = 2^{-2} + 3 = \\frac{1}{4} + 3 = 3.25 (or \\frac{13}{4}).',
  },

  // =========================================================================
  // 5. QUADRATICS (pp. 14–16)
  // =========================================================================
  {
    id: 'ost-p15-quad-2x2',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'numeric',
    prompt: 'An equation is shown. Enter one value of x that makes the equation true.',
    equation: '2x^{2} - 5x - 3 = 0',
    correctAnswer: ['3', '-0.5', '-1/2'],
    placeholder: 'Enter x',
    hint: 'Factor into (2x + 1)(x - 3) = 0, or test integer values like x = 3: 2(3)^{2} - 5(3) - 3 = 18 - 15 - 3 = 0.',
    explanation: '(2x + 1)(x - 3) = 0 gives x = -\\frac{1}{2} (-0.5) or x = 3.',
  },
  {
    id: 'ost-p15-quad-40',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'numeric',
    prompt: 'An equation is given. What is one solution to the equation?',
    equation: '40 = x^{2} - 3x',
    correctAnswer: ['8', '-5'],
    placeholder: 'Enter x',
    hint: 'Put in Standard Form first: x^{2} - 3x - 40 = 0. Find two numbers that multiply to -40 and add to -3.',
    explanation: 'x^{2} - 3x - 40 = (x - 8)(x + 5) = 0, so x = 8 or x = -5.',
  },
  {
    id: 'ost-p15-quad-dec',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'numeric',
    prompt: 'What is one solution to the equation shown?',
    equation: 'x^{2} + 3.5x - 2 = 0',
    correctAnswer: ['0.5', '1/2', '-4'],
    placeholder: 'Enter x',
    hint: 'Try testing x = -4 or x = \\frac{1}{2} (0.5): (-4)^{2} + 3.5(-4) - 2 = 16 - 14 - 2 = 0.',
    explanation:
      'Multiply by 2: 2x^{2} + 7x - 4 = (2x - 1)(x + 4) = 0, so x = \\frac{1}{2} (0.5) or x = -4.',
  },
  {
    id: 'ost-p15-quad-factor',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'multiple-choice',
    prompt: 'Which correctly factored form of f(x) = 36x^{2} + 15x - 6 can be used to identify the zeros?',
    equation: 'f(x) = 36x^{2} + 15x - 6',
    options: [
      { id: 'a', label: 'f(x) = (4x - 1)(3x + 2)' },
      { id: 'b', label: 'f(x) = (12x - 2)(3x + 3)' },
      { id: 'c', label: 'f(x) = 3(4x - 1)(3x + 2)' },
      { id: 'd', label: 'f(x) = 3(12x - 2)(3x + 3)' },
    ],
    correctAnswer: 'c',
    hint: 'Playbook X-Method Step 2: Always factor out the GCF first! 36, 15, and 6 are all divisible by 3.',
    explanation: 'Factor out GCF 3: 3(12x^{2} + 5x - 2) = 3(4x - 1)(3x + 2).',
  },
  {
    id: 'ost-p15-quad-ab',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 15,
    type: 'multiple-choice',
    prompt:
      'The function f(x) = x^{2} + 2x - 24 is equivalent to f(x) = (x + a)(x + b). What are the values of a and b?',
    equation: 'x^{2} + 2x - 24 = (x + a)(x + b)',
    options: [
      { id: 'a', label: '6 and -4' },
      { id: 'b', label: '-6 and 4' },
      { id: 'c', label: '8 and -3' },
      { id: 'd', label: '12 and -2' },
    ],
    correctAnswer: 'a',
    hint: 'Find two numbers that multiply to -24 and add to +2.',
    explanation: '6 × (-4) = -24 and 6 + (-4) = 2, so f(x) = (x + 6)(x - 4).',
  },
  {
    id: 'ost-p16-grasshopper',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt:
      'A grasshopper jumps off a tree stump. Its height (in feet) after t seconds is shown. After how many seconds will the grasshopper land on the ground?',
    equation: 'h(t) = -t^{2} + \\frac{4}{3}t + \\frac{1}{4}',
    correctAnswer: ['1.5', '3/2'],
    unitLabel: 'seconds',
    placeholder: 'e.g. 1.5',
    hint: 'Landing on the ground means h(t) = 0. Test values like t = \\frac{3}{2} (1.5): -(1.5)^{2} + \\frac{4}{3}(1.5) + \\frac{1}{4}.',
    explanation: 'At t = 1.5: -2.25 + 2 + 0.25 = 0, so the grasshopper lands after 1.5 (or \\frac{3}{2}) seconds.',
  },
  {
    id: 'ost-p16-vertex-min',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt: 'A function is shown in vertex form. What is the minimum value of the function?',
    equation: 'f(x) = 5(x - 2)^{2} + 3',
    correctAnswer: ['3'],
    placeholder: 'Enter minimum y',
    hint: 'The minimum value of a parabola is the y-coordinate of its vertex! Since (x - 2)^{2} is at least 0, what is the smallest f(x) can be?',
    explanation: 'In vertex form a(x - h)^{2} + k, the vertex is (2, 3), so the minimum value is 3.',
  },
  {
    id: 'ost-p16-graph-min',
    topic: 'quadratics',
    unit: 'Quadratics',
    playbookPage: 16,
    type: 'numeric',
    prompt: 'The graph of a quadratic function is shown. What is the minimum value of the function?',
    diagram: { kind: 'quadratic-min-graph' },
    correctAnswer: ['2'],
    placeholder: 'Enter minimum y',
    hint: 'Look for the lowest point (the vertex) on the parabola and read its y-value.',
    explanation: 'The vertex (turning point) is at (5, 2), so the minimum value is 2.',
  },

  // =========================================================================
  // 6. EXPONENTIAL FUNCTIONS (pp. 17–19)
  // =========================================================================
  {
    id: 'ost-p3-town-pop-6',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 3,
    type: 'numeric',
    prompt:
      'A small town has 500 residents, and its population doubles every 3 years, modeled by the equation below. What will the population be after 6 years?',
    equation: 'P = 500(2)^{\\frac{t}{3}},   t = 6',
    correctAnswer: ['2000', '2,000'],
    unitLabel: 'residents',
    placeholder: 'e.g. 1500',
    hint: 'Substitute t = 6 into the exponent: \\frac{6}{3} = 2. Then evaluate 500 × 2^{2}.',
    explanation: 'P = 500(2)^{\\frac{6}{3}} = 500(2^{2}) = 500 × 4 = 2,000 residents.',
  },
  {
    id: 'ost-p3-town-pop-1000',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 3,
    type: 'numeric',
    prompt:
      'A small town has 500 residents modeled by the equation below. After how many years will the population reach 1,000?',
    equation: '1000 = 500(2)^{\\frac{t}{3}}',
    correctAnswer: ['3'],
    unitLabel: 'years',
    placeholder: 'Enter years',
    hint: 'Since the town starts at 500 and doubles to 1,000, the exponent \\frac{t}{3} must equal 1!',
    explanation: '\\frac{1000}{500} = 2, so 2^{\\frac{t}{3}} = 2^{1}, which gives \\frac{t}{3} = 1 and t = 3 years.',
  },
  {
    id: 'ost-p18-isaac-200',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 18,
    type: 'multiple-choice',
    prompt:
      'Isaac deposits money into a bank account earning interest. Total money after n years is shown below. What does the number 200 represent?',
    equation: '200(1 + 0.08)^{n}',
    options: [
      { id: 'a', label: 'The percent interest earned annually' },
      { id: 'b', label: 'The number of times interest is compounded' },
      { id: 'c', label: 'The total amount of money after n years' },
      { id: 'd', label: 'The original amount of money deposited' },
    ],
    correctAnswer: 'd',
    hint: 'In y = a · (1 + r)^{x}, "a" is always the initial / starting amount when n = 0.',
    explanation: 'When n = 0, 200(1.08)^{0} = 200, which is the initial deposit.',
  },
  {
    id: 'ost-p18-alfred-decay',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 18,
    type: 'multiple-choice',
    prompt:
      'Equipment bought for $15,000 decreases in value at 12.5% per year. Alfred writes the incorrect inequality below. Which change fixes the inequality?',
    equation: '15,000(0.125)^{t} < 8,000',
    options: [
      { id: 'a', label: 'Replace 0.125 with 12.5' },
      { id: 'b', label: 'Replace 0.125 with 0.875' },
      { id: 'c', label: 'Replace 8,000 with 7,000' },
      { id: 'd', label: 'Replace 15,000 with 2,018' },
    ],
    correctAnswer: 'b',
    hint: 'Exponential decay uses (1 - r) as the base! Convert 12.5% to 0.125 and compute 1 - 0.125.',
    explanation: '1 - 0.125 = 0.875. Each year the equipment keeps 87.5% of its value.',
  },
  {
    id: 'ost-p18-insects-percent',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 18,
    type: 'numeric',
    prompt:
      'A scientist models an insect colony population using the formula below. By what percent does the insect population grow each year?',
    equation: 'P = 10,000(1.08)^{t}',
    correctAnswer: ['8', '8%'],
    unitLabel: '%',
    placeholder: 'e.g. 8',
    hint: 'Compare 1.08 to (1 + r). So r = 0.08 — convert that decimal into a percentage!',
    explanation: '1.08 = 1 + 0.08, and 0.08 = 8% annual growth.',
  },
  {
    id: 'ost-p19-exp-situation',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 19,
    type: 'multiple-choice',
    prompt:
      'Which situation could be represented by an exponential function g(t), where t represents time in years?',
    options: [
      { id: 'a', label: 'A city’s population increases by 300 people each year' },
      { id: 'b', label: 'A checking account decreases by $150 in one year' },
      { id: 'c', label: 'A car decreases in value by 17% in one year' },
      { id: 'd', label: 'A house increases in value by 3% each year' },
    ],
    correctAnswer: 'd',
    hint: 'Exponential functions change by a constant PERCENT each time period (like "each year"), not a fixed dollar/person amount.',
    explanation:
      'Increasing by 3% each year multiplies the value by 1.03 every year, which is exponential growth.',
  },
  {
    id: 'ost-p19-exp-percent-rate',
    topic: 'exponential',
    unit: 'Exponential Functions',
    playbookPage: 19,
    type: 'multiple-choice',
    prompt: 'Which situation describes a quantity that increases by a constant percent rate?',
    options: [
      { id: 'a', label: 'The size of one photo is 15% larger than the size of another photo.' },
      { id: 'b', label: 'The number of plants in a pond is 85% of the number from the previous year.' },
      { id: 'c', label: 'The population of one city is 85% greater than the population of another city.' },
      { id: 'd', label: 'The number of magazine subscribers each year is 15% greater than the previous year.' },
    ],
    correctAnswer: 'd',
    hint: 'Look for a situation that INCREASES repeatedly over time by a percentage each period.',
    explanation:
      'Being 15% greater than the previous year multiplies subscribers by 1.15 each year (constant percent rate increase).',
  },

  // =========================================================================
  // 7. LINEAR FUNCTIONS (pp. 2, 20–25)
  // =========================================================================
  {
    id: 'ost-p2-taxi',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 2,
    type: 'multiple-choice',
    prompt:
      'A taxi charges $4.50 for the first mile and $2.25 for each additional mile. If a passenger paid $13.50, how many miles did they travel?',
    options: [
      { id: 'a', label: '3 miles' },
      { id: 'b', label: '4 miles' },
      { id: 'c', label: '5 miles' },
      { id: 'd', label: '6 miles' },
    ],
    correctAnswer: 'c',
    hint: 'Remember $4.50 already covers the 1st mile! Subtract $4.50 from $13.50, divide by $2.25 for the additional miles, then add that 1st mile back.',
    explanation: '$13.50 - $4.50 = $9.00. $9.00 ÷ $2.25 = 4 additional miles. Total = 1 + 4 = 5 miles.',
  },
  {
    id: 'ost-p21-linear-table',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 21,
    type: 'numeric',
    prompt: 'A table of values for a linear function is shown. What is the missing value for x = 6?',
    diagram: {
      kind: 'linear-table',
      rows: [
        { x: 0, fx: '4' },
        { x: 1, fx: '6' },
        { x: 3, fx: '10' },
        { x: 5, fx: '14' },
        { x: 6, fx: '?' },
      ],
    },
    correctAnswer: ['16'],
    placeholder: 'Enter f(6)',
    hint: 'Find the constant rate of change (slope): from x = 0 to x = 1, f(x) increases by 2. Add 2 to f(5) = 14.',
    explanation: 'f(x) = 2x + 4, so f(6) = 2(6) + 4 = 16.',
  },
  {
    id: 'ost-p21-x-intercept',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 21,
    type: 'numeric',
    prompt: 'What is the x-intercept of the graph of the linear function shown?',
    equation: 'f(x) = 2x + 9',
    correctAnswer: ['-4.5', '-9/2'],
    placeholder: 'Enter x',
    hint: 'The x-intercept is where the graph crosses the x-axis (y = 0). Solve 0 = 2x + 9.',
    explanation: '2x + 9 = 0 implies 2x = -9, so x = -4.5 (or -\\frac{9}{2}).',
  },
  {
    id: 'ost-p21-linear-graph',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 21,
    type: 'multiple-choice',
    prompt: 'What is the equation of the linear function shown on the graph?',
    diagram: {
      kind: 'linear-graph',
      points: [
        [0, 4],
        [8, 8],
      ],
    },
    options: [
      { id: 'a', label: 'f(x) = 2x + 4' },
      { id: 'b', label: 'f(x) = \\frac{1}{2}x + 4' },
      { id: 'c', label: 'f(x) = 4x + 2' },
      { id: 'd', label: 'f(x) = 4x + \\frac{1}{2}' },
    ],
    correctAnswer: 'b',
    hint: 'Check the y-intercept at x = 0 (y = 4) and count rise/run from (0, 4) to (8, 8): \\frac{8 - 4}{8 - 0}.',
    explanation: 'Slope = \\frac{4}{8} = \\frac{1}{2}, y-intercept = 4, so f(x) = \\frac{1}{2}x + 4.',
  },
  {
    id: 'ost-p24-jamal',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 24,
    type: 'multiple-choice',
    prompt:
      'Jamal distributes items collected by a charity. The number of items remaining after w weeks is modeled below. What does the coefficient -60 represent?',
    equation: '800 - 60w',
    options: [
      { id: 'a', label: 'The number of weeks it takes Jamal to distribute 800 items' },
      { id: 'b', label: 'The number of weeks it takes Jamal to distribute 60 items' },
      { id: 'c', label: 'The number of items Jamal distributes every week' },
      { id: 'd', label: 'The total number of items Jamal started with' },
    ],
    correctAnswer: 'c',
    hint: 'In slope-intercept form y = mx + b, the number multiplied by w is the rate of change per week.',
    explanation: 'Every week (w), the remaining items decrease by 60, so Jamal distributes 60 items per week.',
  },
  {
    id: 'ost-p24-balloon',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 24,
    type: 'multiple-choice',
    prompt:
      'A hot air balloon moves downward at a steady rate. Its altitude in feet x minutes after starting its descent is modeled below. What does -375 represent?',
    equation: '-375x + 1,500',
    options: [
      { id: 'a', label: 'The rate of descent of the hot air balloon' },
      { id: 'b', label: 'The altitude of the hot air balloon after x minutes' },
      { id: 'c', label: 'The total descent of the hot air balloon after x minutes' },
      { id: 'd', label: 'The altitude of the hot air balloon before it begins descending' },
    ],
    correctAnswer: 'a',
    hint: 'The coefficient of x is the slope (rate of change in feet per minute).',
    explanation: '-375 is the slope, representing a descent rate of 375 feet per minute.',
  },
  {
    id: 'ost-p25-shipping',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 25,
    type: 'multiple-choice',
    prompt:
      'A shipping company charges a cost per pound plus a fixed fee. The total cost f(x) in dollars of shipping x pounds is shown. Which part represents the fixed fee?',
    equation: 'f(x) = 4.99x + 5.75',
    options: [
      { id: 'a', label: 'x' },
      { id: 'b', label: '4.99' },
      { id: 'c', label: '5.75' },
      { id: 'd', label: '4.99x' },
    ],
    correctAnswer: 'c',
    hint: 'The fixed fee is the starting value (y-intercept b) that does not depend on x.',
    explanation: '5.75 is the constant y-intercept, representing the $5.75 fixed fee.',
  },
  {
    id: 'ost-p25-sunflower',
    topic: 'linear',
    unit: 'Linear Functions',
    playbookPage: 25,
    type: 'numeric',
    prompt:
      'Trent plants a sunflower that is 6 inches tall. It grows at an average rate of 1.5 inches per day. How many days will it take to reach 45 inches?',
    correctAnswer: ['26'],
    unitLabel: 'days',
    placeholder: 'Enter days',
    hint: 'Set up 6 + 1.5x = 45. Subtract 6 from 45, then divide by 1.5.',
    explanation: '1.5x = 39 implies x = \\frac{39}{1.5} = 26 days.',
  },

  // =========================================================================
  // 8. SYSTEMS OF EQUATIONS & INEQUALITIES (pp. 27–31)
  // =========================================================================
  {
    id: 'ost-p28-no-solution',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'Which statement is true about a system of linear equations that has no solution?',
    options: [
      { id: 'a', label: 'The graphs of the equations are parallel lines.' },
      { id: 'b', label: 'The graphs of the equations are the same line.' },
      { id: 'c', label: 'The graphs of the equations are perpendicular lines.' },
      { id: 'd', label: 'The graphs of the equations are intersecting lines.' },
    ],
    correctAnswer: 'a',
    hint: 'Solutions happen where lines cross. If there is NO solution, the lines never cross!',
    explanation: 'Parallel lines have the same slope and never intersect, meaning zero solutions.',
  },
  {
    id: 'ost-p28-sys-frac',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'multiple-choice',
    prompt: 'A system of equations is given. What is the solution to the system?',
    equation: 'y = 2x + 5   and   y = \\frac{1}{4}x - \\frac{1}{4}',
    options: [
      { id: 'a', label: '(-3, -1)' },
      { id: 'b', label: '(-1, 3)' },
      { id: 'c', label: '(3, 11)' },
      { id: 'd', label: '(-2, 1)' },
    ],
    correctAnswer: 'a',
    hint: 'Plug x = -3 into both equations to check if both give y = -1!',
    explanation:
      'At x = -3: y = 2(-3) + 5 = -1, and y = \\frac{1}{4}(-3) - \\frac{1}{4} = -\\frac{4}{4} = -1.',
  },
  {
    id: 'ost-p28-fx-gx',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'numeric',
    prompt: 'Two functions are given: f(x) = 3x + 4 and g(x) = 7x - 2. What value of x makes f(x) = g(x) true?',
    equation: '3x + 4 = 7x - 2',
    correctAnswer: ['1.5', '3/2'],
    placeholder: 'Enter x',
    hint: 'Set 3x + 4 equal to 7x - 2, collect x terms on one side and constants on the other.',
    explanation: '6 = 4x implies x = \\frac{6}{4} = 1.5 (or \\frac{3}{2}).',
  },
  {
    id: 'ost-p28-sum-diff',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 28,
    type: 'numeric',
    prompt: 'Two numbers have a sum of 217 and a difference of 85. What is the LARGER of the two numbers?',
    equation: 'x + y = 217   and   x - y = 85',
    correctAnswer: ['151'],
    placeholder: 'Enter larger #',
    hint: 'Add the two equations together: (x + y) + (x - y) = 217 + 85, so 2x = 302!',
    explanation: '2x = 302 gives x = 151 (and the smaller number is y = 66).',
  },
  {
    id: 'ost-p29-theater',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 29,
    type: 'numeric',
    prompt:
      'Lower-level concert tickets sell for $35 each, and upper-level tickets sell for $25 each. A theater sells 350 tickets for $10,250. How many LOWER-level tickets were sold?',
    equation: 'L + U = 350   and   35L + 25U = 10,250',
    correctAnswer: ['150'],
    unitLabel: 'tickets',
    placeholder: 'Enter lower-level',
    hint: 'Substitute U = 350 - L into 35L + 25U = 10,250, or solve 10L + 8,750 = 10,250.',
    explanation: '35L + 25(350 - L) = 10,250 -> 10L + 8,750 = 10,250 -> 10L = 1,500 -> L = 150.',
  },
  {
    id: 'ost-p29-equiv-sys',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 29,
    type: 'multiple-choice',
    prompt: 'Which system of equations has the same solution as the given system?',
    equation: 'x + 3y = 1   and   -2x - y = -2',
    options: [
      { id: 'a', label: '-2x + 3y = 1  and  -2x - y = -2' },
      { id: 'b', label: '2x + 6y = 1  and  2x + y = 2' },
      { id: 'c', label: 'x + 3y = 1  and  -x - y = -2' },
      { id: 'd', label: '2x + 6y = 2  and  -2x - y = -2' },
    ],
    correctAnswer: 'd',
    hint: 'Multiplying EVERY term in the first equation (x + 3y = 1) by 2 keeps the exact same line and solution!',
    explanation: '2(x + 3y = 1) becomes 2x + 6y = 2, while the second equation stays -2x - y = -2.',
  },
  {
    id: 'ost-p31-company-ineq',
    topic: 'systems',
    unit: 'Systems of Equations',
    playbookPage: 31,
    type: 'multiple-choice',
    prompt:
      'Product X costs $3.50/unit and Product Y costs $2.50/unit. Weekly costs must not exceed $3,000, and at least 1,000 total units must be made. Which system represents these constraints?',
    options: [
      { id: 'a', label: 'x + y ≥ 1000  and  3.5x + 2.5y ≤ 3000' },
      { id: 'b', label: 'x + y ≥ 1000  and  x + y ≤ 3000' },
      { id: 'c', label: 'x + y ≤ 1000  and  x + y ≥ 3000' },
      { id: 'd', label: 'x + y ≤ 1000  and  3.5x + 2.5y ≥ 3000' },
    ],
    correctAnswer: 'a',
    hint: '"At least 1,000" means ≥ 1000. "Must not exceed $3,000" means ≤ 3000.',
    explanation: 'Total units x + y ≥ 1000 and total cost 3.5x + 2.5y ≤ 3000.',
  },

  // =========================================================================
  // 9. SIMPLIFYING EXPRESSIONS (Own Topic — Basic Expression Simplifying)
  // =========================================================================
  {
    id: 'ost-simp-1',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression by distributing and combining like terms:',
    equation: '2(x + 3) + 4x - 5',
    options: [
      { id: 'a', label: '6x + 1' },
      { id: 'b', label: '6x - 2' },
      { id: 'c', label: '8x + 1' },
      { id: 'd', label: '2x - 2' },
    ],
    correctAnswer: 'a',
    hint: 'Distribute 2 to BOTH terms in (x + 3) to get 2x + 6, then combine with + 4x - 5.',
    explanation: '2x + 6 + 4x - 5 = (2x + 4x) + (6 - 5) = 6x + 1.',
  },
  {
    id: 'ost-simp-2',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression by combining like terms:',
    equation: '5x + 8 - 2x - 3',
    options: [
      { id: 'a', label: '7x + 5' },
      { id: 'b', label: '3x + 5' },
      { id: 'c', label: '3x + 11' },
      { id: 'd', label: '7x + 11' },
    ],
    correctAnswer: 'b',
    hint: 'Combine the x terms (5x - 2x) and combine the constant numbers (8 - 3).',
    explanation: '(5x - 2x) + (8 - 3) = 3x + 5.',
  },
  {
    id: 'ost-simp-3',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression:',
    equation: '4(2x - 3) + 5x',
    options: [
      { id: 'a', label: '13x - 3' },
      { id: 'b', label: '8x - 12' },
      { id: 'c', label: '13x - 12' },
      { id: 'd', label: '9x - 12' },
    ],
    correctAnswer: 'c',
    hint: 'Multiply 4 by BOTH 2x and -3 first: 4(2x) = 8x and 4(-3) = -12.',
    explanation: '8x - 12 + 5x = 13x - 12.',
  },
  {
    id: 'ost-simp-4',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression (watch the negative sign!):',
    equation: '9x - 3(x - 4)',
    options: [
      { id: 'a', label: '6x - 12' },
      { id: 'b', label: '6x + 12' },
      { id: 'c', label: '6x - 4' },
      { id: 'd', label: '12x + 12' },
    ],
    correctAnswer: 'b',
    hint: 'Distribute -3 to BOTH x and -4: (-3)(x) = -3x and (-3)(-4) = +12.',
    explanation: '9x - 3x + 12 = 6x + 12.',
  },
  {
    id: 'ost-simp-5',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression:',
    equation: '\\frac{1}{2}(6x - 8) + 3',
    options: [
      { id: 'a', label: '3x - 5' },
      { id: 'b', label: '3x - 1' },
      { id: 'c', label: '3x + 1' },
      { id: 'd', label: '6x - 5' },
    ],
    correctAnswer: 'b',
    hint: 'Take \\frac{1}{2} of 6x (3x) and \\frac{1}{2} of -8 (-4), then add 3.',
    explanation: '3x - 4 + 3 = 3x - 1.',
  },
  {
    id: 'ost-simp-6',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression:',
    equation: '3(x + 4) - 2(x + 1)',
    options: [
      { id: 'a', label: 'x + 14' },
      { id: 'b', label: '5x + 10' },
      { id: 'c', label: 'x + 10' },
      { id: 'd', label: 'x + 3' },
    ],
    correctAnswer: 'c',
    hint: 'Distribute 3 into (x + 4) and distribute -2 into (x + 1): 3x + 12 - 2x - 2.',
    explanation: '(3x - 2x) + (12 - 2) = x + 10.',
  },
  {
    id: 'ost-simp-7',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'multiple-choice',
    prompt: 'Simplify the expression:',
    equation: '\\frac{2}{3}(9x + 6) - 4x',
    options: [
      { id: 'a', label: '2x + 6' },
      { id: 'b', label: '2x + 4' },
      { id: 'c', label: '6x + 4' },
      { id: 'd', label: '10x + 4' },
    ],
    correctAnswer: 'b',
    hint: 'Multiply \\frac{2}{3} × 9x = 6x and \\frac{2}{3} × 6 = 4, then subtract 4x.',
    explanation: '6x + 4 - 4x = 2x + 4.',
  },
  {
    id: 'ost-simp-8',
    topic: 'simplifying-expressions',
    unit: 'Simplifying Expressions',
    playbookPage: 32,
    type: 'numeric',
    prompt: 'When 3(2x + 5) - 4(x - 1) is simplified into the form ax + b, what is the value of a?',
    equation: '3(2x + 5) - 4(x - 1) = ax + b',
    correctAnswer: ['2'],
    placeholder: 'Enter a',
    hint: 'Distribute both parentheses: 6x + 15 - 4x + 4. Then find the coefficient in front of x.',
    explanation: '6x + 15 - 4x + 4 = 2x + 19, so a = 2.',
  },

  // =========================================================================
  // 10. SOLVING EQUATIONS (pp. 3, 32–34)
  // =========================================================================
  {
    id: 'ost-p3-desmos-2',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 3,
    type: 'numeric',
    prompt: 'Solve for x:',
    equation: '\\frac{2}{3}(3x - 9) + 5 = 11',
    correctAnswer: ['6'],
    placeholder: 'Enter x',
    hint: 'Distribute \\frac{2}{3} to both terms inside the parentheses: \\frac{2}{3}(3x) = 2x and \\frac{2}{3}(-9) = -6. Then combine like terms!',
    explanation: '2x - 6 + 5 = 11 -> 2x - 1 = 11 -> 2x = 12 -> x = 6.',
  },
  {
    id: 'ost-p32-solve-ex',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 32,
    type: 'numeric',
    prompt: 'Solve for x:',
    equation: '2(x + 3) + 4 = 10',
    correctAnswer: ['0'],
    placeholder: 'Enter x',
    hint: 'Distribute 2 to get 2x + 6 + 4 = 10, combine 6 + 4 = 10, then subtract 10 from both sides.',
    explanation: '2x + 10 = 10 -> 2x = 0 -> x = 0.',
  },
  {
    id: 'ost-p33-solve-12',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'What is the solution to the equation shown?',
    equation: '12(x + 5) = 4x',
    correctAnswer: ['-7.5', '-15/2'],
    placeholder: 'Enter x',
    hint: 'Distribute 12: 12x + 60 = 4x. Subtract 12x from both sides to get 60 = -8x.',
    explanation: '12x + 60 = 4x -> 60 = -8x -> x = -\\frac{60}{8} = -\\frac{15}{2} = -7.5.',
  },
  {
    id: 'ost-p33-solve-eq-3',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'What is the solution to the equation shown?',
    equation: '3x + 4 - \\frac{x}{2} = 19',
    correctAnswer: ['6'],
    placeholder: 'Enter x',
    hint: 'Combine 3x and -\\frac{x}{2} (which is \\frac{5}{2}x or 2.5x), then subtract 4 from 19.',
    explanation: '2.5x + 4 = 19 -> 2.5x = 15 -> x = 6.',
  },
  {
    id: 'ost-p33-err-sub',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 33,
    type: 'numeric',
    prompt: 'A student tried to solve 4x + 5 = 31 - (x - 4) and made an error. What is the CORRECT solution for x?',
    equation: '4x + 5 = 31 - (x - 4)',
    correctAnswer: ['6'],
    placeholder: 'Enter x',
    hint: 'Distribute the minus sign to BOTH terms in (x - 4): -(x - 4) = -x + 4, NOT -x - 4!',
    explanation: '4x + 5 = 31 - x + 4 -> 4x + 5 = 35 - x -> 5x = 30 -> x = 6.',
  },
  {
    id: 'ost-p34-eleanor',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 34,
    type: 'numeric',
    prompt: 'What is the correct solution to the equation shown?',
    equation: '\\frac{1}{2}(x + 18) = 4(2x - 6) - 9',
    correctAnswer: ['5.6', '28/5'],
    placeholder: 'e.g. 5.6',
    hint: 'Multiply the ENTIRE equation by 2 (including the -9!) to clear \\frac{1}{2}: x + 18 = 8(2x - 6) - 18.',
    explanation: 'x + 18 = 16x - 48 - 18 -> x + 18 = 16x - 66 -> 84 = 15x -> x = \\frac{84}{15} = \\frac{28}{5} = 5.6.',
  },
  {
    id: 'ost-p34-fred',
    topic: 'solving-equations',
    unit: 'Solving Equations',
    playbookPage: 34,
    type: 'numeric',
    prompt: 'Fred solved the equation shown below and made a sign error. What is the CORRECT solution?',
    equation: '8(3x - 7) = -6(x + 7) + 4',
    correctAnswer: ['0.6', '3/5'],
    placeholder: 'e.g. 0.6',
    hint: 'Distribute carefully: 24x - 56 = -6x - 42 + 4. Notice -42 + 4 equals -38!',
    explanation: '24x - 56 = -6x - 38 -> 30x = 18 -> x = \\frac{18}{30} = \\frac{3}{5} = 0.6.',
  },
  ...OST_EXPANSION_PART_1,
  ...OST_EXPANSION_PART_2,
];

/**
 * Normalizes and validates numeric/fraction answers (e.g., "1.5", "3/2", "2,000", "8%").
 */
export function isNumericAnswerCorrect(
  rawInput: string,
  accepted: string | string[]
): boolean {
  const cleaned = rawInput.trim().replace(/,/g, '').replace(/%$/, '').replace(/\s+/g, '');
  if (!cleaned) return false;

  const parseValue = (str: string): number | null => {
    const s = str.trim().replace(/,/g, '').replace(/%$/, '').replace(/\s+/g, '');
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length !== 2) return null;
      const num = Number(parts[0]);
      const den = Number(parts[1]);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
      return num / den;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const userVal = parseValue(cleaned);
  const targets = Array.isArray(accepted) ? accepted : [accepted];

  for (const t of targets) {
    if (cleaned.toLowerCase() === t.toLowerCase().replace(/,/g, '')) return true;
    const targetVal = parseValue(t);
    if (userVal !== null && targetVal !== null && Math.abs(userVal - targetVal) < 1e-4) {
      return true;
    }
  }
  return false;
}
