import React from 'react';

type MathToken =
  | { type: 'text'; value: string }
  | { type: 'frac'; num: MathToken[]; den: MathToken[] }
  | { type: 'sup'; content: MathToken[] };

function extractBraced(input: string, startIdx: number): { content: string; nextIdx: number } | null {
  if (input[startIdx] !== '{') return null;
  let depth = 0;
  for (let i = startIdx; i < input.length; i++) {
    if (input[i] === '{') depth++;
    else if (input[i] === '}') {
      depth--;
      if (depth === 0) {
        return {
          content: input.slice(startIdx + 1, i),
          nextIdx: i + 1,
        };
      }
    }
  }
  return null;
}

function tokenizeMath(input: string): MathToken[] {
  const tokens: MathToken[] = [];
  let i = 0;
  let buffer = '';

  const flushText = () => {
    if (buffer.length > 0) {
      tokens.push({ type: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < input.length) {
    // Vertical fraction: \frac{numerator}{denominator}
    if (input.startsWith('\\frac{', i)) {
      const numPart = extractBraced(input, i + 5);
      if (numPart) {
        const denPart = extractBraced(input, numPart.nextIdx);
        if (denPart) {
          flushText();
          tokens.push({
            type: 'frac',
            num: tokenizeMath(numPart.content),
            den: tokenizeMath(denPart.content),
          });
          i = denPart.nextIdx;
          continue;
        }
      }
    }

    // Braced exponent: ^{...}
    if (input.startsWith('^{', i)) {
      const expPart = extractBraced(input, i + 1);
      if (expPart) {
        flushText();
        tokens.push({
          type: 'sup',
          content: tokenizeMath(expPart.content),
        });
        i = expPart.nextIdx;
        continue;
      }
    }

    // Unbraced single-token exponent fallback: ^2, ^x, ^-2
    if (input[i] === '^' && i + 1 < input.length) {
      const rest = input.slice(i + 1);
      const match = rest.match(/^(-?[a-zA-Z0-9.]+)/);
      if (match) {
        flushText();
        tokens.push({
          type: 'sup',
          content: [{ type: 'text', value: match[1] }],
        });
        i += 1 + match[1].length;
        continue;
      }
    }

    // Unicode superscripts fallback
    if (input[i] === '²' || input[i] === '³') {
      flushText();
      tokens.push({
        type: 'sup',
        content: [{ type: 'text', value: input[i] === '²' ? '2' : '3' }],
      });
      i++;
      continue;
    }

    buffer += input[i];
    i++;
  }

  flushText();
  return tokens;
}

function renderTokens(tokens: MathToken[], keyPrefix = 'm'): React.ReactNode {
  return tokens.map((token, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (token.type === 'text') {
      return <React.Fragment key={key}>{token.value}</React.Fragment>;
    }
    if (token.type === 'frac') {
      return (
        <span
          key={key}
          className="inline-flex flex-col items-center justify-center align-middle mx-[3px] text-[0.84em] leading-[1.05]"
        >
          <span className="w-full px-1 pb-[1.5px] border-b border-current text-center">
            {renderTokens(token.num, `${key}-n`)}
          </span>
          <span className="w-full px-1 pt-[2px] text-center">
            {renderTokens(token.den, `${key}-d`)}
          </span>
        </span>
      );
    }
    // Superscript exponent
    return (
      <sup
        key={key}
        className="relative -top-[0.42em] text-[0.72em] leading-none font-semibold inline-flex items-center ml-[0.5px] mr-[1px]"
      >
        {renderTokens(token.content, `${key}-s`)}
      </sup>
    );
  });
}

export const MathText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const tokens = React.useMemo(() => tokenizeMath(text), [text]);
  return <span className={className}>{renderTokens(tokens)}</span>;
};
