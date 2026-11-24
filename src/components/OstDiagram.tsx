import React from 'react';
import { OstDiagram as OstDiagramData } from '../data/ostQuestions';

export const OstDiagram: React.FC<{ diagram: OstDiagramData }> = ({ diagram }) => {
  if (diagram.kind === 'box-summary') {
    const { stats } = diagram;
    const rows = [
      ['Mean', stats.mean],
      ['Median', stats.median],
      ['Mode', stats.mode],
      ['Minimum', stats.min],
      ['Maximum', stats.max],
      ['First Quartile (Q1)', stats.q1],
      ['Third Quartile (Q3)', stats.q3],
    ];
    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] overflow-hidden max-w-xs">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, val]) => (
              <tr key={String(label)} className="border-b border-slate-800 last:border-b-0">
                <td className="px-3 py-1.5 text-slate-300 font-medium">{label}</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums text-amber-300 font-semibold">
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.kind === 'box-compare') {
    const [dMin, dMax] = diagram.domain;
    const width = 460;
    const padL = 72;
    const padR = 20;
    const plotW = width - padL - padR;
    const toX = (v: number) => padL + ((v - dMin) / (dMax - dMin)) * plotW;

    const renderBoxRow = (
      item: { label: string; min: number; q1: number; median: number; q3: number; max: number },
      y: number,
      highlight: boolean
    ) => {
      const xMin = toX(item.min);
      const xQ1 = toX(item.q1);
      const xMed = toX(item.median);
      const xQ3 = toX(item.q3);
      const xMax = toX(item.max);
      const stroke = highlight ? '#FACC15' : '#38BDF8';
      const fill = highlight ? 'rgba(250, 204, 21, 0.16)' : 'rgba(56, 189, 248, 0.14)';

      return (
        <g key={item.label}>
          <text
            x={padL - 10}
            y={y + 4}
            textAnchor="end"
            fill={highlight ? '#FDE047' : '#CBD5E1'}
            fontSize="12"
            fontWeight={highlight ? '700' : '500'}
          >
            {item.label}
          </text>
          <line x1={xMin} y1={y} x2={xQ1} y2={y} stroke={stroke} strokeWidth="2" />
          <line x1={xQ3} y1={y} x2={xMax} y2={y} stroke={stroke} strokeWidth="2" />
          <line x1={xMin} y1={y - 7} x2={xMin} y2={y + 7} stroke={stroke} strokeWidth="2" />
          <line x1={xMax} y1={y - 7} x2={xMax} y2={y + 7} stroke={stroke} strokeWidth="2" />
          <rect
            x={xQ1}
            y={y - 11}
            width={Math.max(2, xQ3 - xQ1)}
            height={22}
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            rx="2"
          />
          <line x1={xMed} y1={y - 11} x2={xMed} y2={y + 11} stroke={stroke} strokeWidth="2.5" />
        </g>
      );
    };

    const ticks: number[] = [];
    for (let t = dMin; t <= dMax; t += diagram.step) ticks.push(t);

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-3">
        <svg viewBox={`0 0 ${width} 200`} className="w-full max-w-lg h-auto">
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={toX(t)}
                y1={14}
                x2={toX(t)}
                y2={168}
                stroke="rgba(148,163,184,0.12)"
                strokeWidth="1"
              />
              <text
                x={toX(t)}
                y={184}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
              >
                {t}
              </text>
            </g>
          ))}
          <line x1={padL} y1={168} x2={width - padR} y2={168} stroke="#64748B" strokeWidth="1.5" />
          {renderBoxRow({ label: diagram.targetLabel, ...diagram.target }, 28, true)}
          <line
            x1={10}
            y1={48}
            x2={width - 10}
            y2={48}
            stroke="rgba(148,163,184,0.22)"
            strokeDasharray="4 4"
          />
          {diagram.options.map((opt, i) => renderBoxRow(opt, 68 + i * 26, false))}
          <text x={(padL + width - padR) / 2} y={197} textAnchor="middle" fill="#64748B" fontSize="10">
            {diagram.unit}
          </text>
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'box-rasheed-valentina') {
    const width = 460;
    const padL = 82;
    const padR = 20;
    const min = 200;
    const max = 450;
    const toX = (v: number) => padL + ((v - min) / (max - min)) * (width - padL - padR);
    const ticks = [200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450];

    const drawPlot = (
      label: string,
      y: number,
      p: { min: number; q1: number; med: number; q3: number; max: number },
      color: string
    ) => (
      <g key={label}>
        <text x={padL - 10} y={y + 4} textAnchor="end" fill="#E2E8F0" fontSize="12" fontWeight="600">
          {label}
        </text>
        <line x1={toX(p.min)} y1={y} x2={toX(p.q1)} y2={y} stroke={color} strokeWidth="2" />
        <line x1={toX(p.q3)} y1={y} x2={toX(p.max)} y2={y} stroke={color} strokeWidth="2" />
        <line x1={toX(p.min)} y1={y - 7} x2={toX(p.min)} y2={y + 7} stroke={color} strokeWidth="2" />
        <line x1={toX(p.max)} y1={y - 7} x2={toX(p.max)} y2={y + 7} stroke={color} strokeWidth="2" />
        <rect
          x={toX(p.q1)}
          y={y - 11}
          width={toX(p.q3) - toX(p.q1)}
          height={22}
          fill="rgba(56,189,248,0.12)"
          stroke={color}
          strokeWidth="2"
        />
        <line x1={toX(p.med)} y1={y - 11} x2={toX(p.med)} y2={y + 11} stroke="#FACC15" strokeWidth="2.5" />
      </g>
    );

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-3">
        <svg viewBox={`0 0 ${width} 125`} className="w-full max-w-lg h-auto">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={toX(t)} y1={12} x2={toX(t)} y2={92} stroke="rgba(148,163,184,0.12)" />
              <text
                x={toX(t)}
                y={108}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {t}
              </text>
            </g>
          ))}
          <line x1={padL} y1={92} x2={width - padR} y2={92} stroke="#64748B" strokeWidth="1.5" />
          {drawPlot('Rasheed', 30, { min: 275, q1: 300, med: 350, q3: 375, max: 425 }, '#38BDF8')}
          {drawPlot('Valentina', 66, { min: 200, q1: 275, med: 300, q3: 375, max: 400 }, '#10B981')}
          <text x={(padL + width - padR) / 2} y={121} textAnchor="middle" fill="#64748B" fontSize="10">
            Total Pages per Book
          </text>
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'dot-plot-compare') {
    const productA = [1, 2, 2, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10];
    const productB = [3, 4, 4, 4, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10];

    const renderDots = (vals: number[], offsetX: number, title: string, color: string) => {
      const counts: Record<number, number> = {};
      vals.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1;
      });
      return (
        <g>
          <text x={offsetX + 95} y={16} textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="700">
            {title}
          </text>
          <line x1={offsetX + 8} y1={105} x2={offsetX + 188} y2={105} stroke="#64748B" strokeWidth="1.5" />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
            const x = offsetX + 12 + (n - 1) * 19;
            const c = counts[n] || 0;
            return (
              <g key={n}>
                <line x1={x} y1={102} x2={x} y2={108} stroke="#64748B" />
                <text
                  x={x}
                  y={121}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {n}
                </text>
                {Array.from({ length: c }).map((_, idx) => (
                  <circle key={idx} cx={x} cy={96 - idx * 9} r={3.2} fill={color} />
                ))}
              </g>
            );
          })}
        </g>
      );
    };

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-3">
        <svg viewBox="0 0 430 130" className="w-full max-w-lg h-auto">
          {renderDots(productA, 0, 'Product A', '#06B6D4')}
          {renderDots(productB, 225, 'Product B', '#F59E0B')}
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'histogram-skew') {
    const bars = [
      { score: '0-1', freq: 5 },
      { score: '1-2', freq: 2 },
      { score: '2-3', freq: 5 },
      { score: '3-4', freq: 5 },
      { score: '4-5', freq: 10 },
      { score: '5-6', freq: 15 },
      { score: '6-7', freq: 20 },
      { score: '7-8', freq: 38 },
      { score: '8-9', freq: 70 },
      { score: '9-10', freq: 30 },
    ];
    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-3 max-w-md">
        <svg viewBox="0 0 340 155" className="w-full h-auto">
          <text x={170} y={14} textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">
            Survey Results (n = 200)
          </text>
          {[0, 20, 40, 60].map((v) => {
            const y = 128 - (v / 75) * 95;
            return (
              <g key={v}>
                <line x1={38} y1={y} x2={320} y2={y} stroke="rgba(148,163,184,0.14)" />
                <text x={32} y={y + 3} textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">
                  {v}
                </text>
              </g>
            );
          })}
          {bars.map((b, i) => {
            const h = (b.freq / 75) * 95;
            const x = 42 + i * 27;
            return (
              <g key={b.score}>
                <rect
                  x={x}
                  y={128 - h}
                  width={25}
                  height={h}
                  fill="rgba(56, 189, 248, 0.55)"
                  stroke="#38BDF8"
                  strokeWidth="1"
                />
                <text x={x + 12.5} y={141} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <line x1={38} y1={128} x2={320} y2={128} stroke="#64748B" />
          <line x1={38} y1={28} x2={38} y2={128} stroke="#64748B" />
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'two-way-car-interiors') {
    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] overflow-hidden max-w-sm">
        <div className="px-3 py-1.5 bg-slate-800/70 text-xs font-semibold text-slate-200 border-b border-slate-700/80">
          Car Interiors
        </div>
        <table className="w-full text-sm text-center font-mono tabular-nums">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-sans text-xs">
              <th className="py-2 px-3 text-left"></th>
              <th className="py-2 px-3">Cloth</th>
              <th className="py-2 px-3">Leather</th>
              <th className="py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-800">
              <td className="py-2 px-3 text-left font-sans font-medium text-slate-200">Cars</td>
              <td className="py-2 px-3 text-slate-100">21</td>
              <td className="py-2 px-3 text-slate-500">—</td>
              <td className="py-2 px-3 text-slate-100">55</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="py-2 px-3 text-left font-sans font-medium text-slate-200">Trucks</td>
              <td className="py-2 px-3 text-slate-500">—</td>
              <td className="py-2 px-3 text-amber-300 font-bold">?</td>
              <td className="py-2 px-3 text-slate-100">45</td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-left font-sans font-medium text-slate-200">Total</td>
              <td className="py-2 px-3 text-slate-100">51</td>
              <td className="py-2 px-3 text-slate-500">—</td>
              <td className="py-2 px-3 text-slate-100">100</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.kind === 'scatterplot') {
    const w = 280;
    const h = 220;
    const padL = 34;
    const padB = 28;
    const padT = 16;
    const padR = 16;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const toX = (x: number) => padL + (x / diagram.xMax) * plotW;
    const toY = (y: number) => padT + plotH - (y / diagram.yMax) * plotH;

    const xTicks: number[] = [];
    for (let x = 0; x <= diagram.xMax; x += diagram.xStep) xTicks.push(x);
    const yTicks: number[] = [];
    for (let y = 0; y <= diagram.yMax; y += diagram.yStep) yTicks.push(y);

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-2.5 max-w-xs">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          {xTicks.map((x) => (
            <g key={`x-${x}`}>
              <line x1={toX(x)} y1={padT} x2={toX(x)} y2={padT + plotH} stroke="rgba(148,163,184,0.14)" />
              <text x={toX(x)} y={h - 10} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">
                {x}
              </text>
            </g>
          ))}
          {yTicks.map((y) => (
            <g key={`y-${y}`}>
              <line x1={padL} y1={toY(y)} x2={padL + plotW} y2={toY(y)} stroke="rgba(148,163,184,0.14)" />
              <text x={padL - 6} y={toY(y) + 3} textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">
                {y}
              </text>
            </g>
          ))}
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#64748B" strokeWidth="1.5" />
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#64748B" strokeWidth="1.5" />
          {diagram.points.map(([px, py], i) => (
            <circle key={i} cx={toX(px)} cy={toY(py)} r={4} fill="#FACC15" stroke="#09090E" strokeWidth="1" />
          ))}
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'function-table-choices') {
    const tables = [
      { label: 'Table A', rows: [[0, 3], [0, 5], [0, 7]] },
      { label: 'Table B', rows: [[3, 0], [5, 0], [7, 0]] },
      { label: 'Table C', rows: [[0, 0], [4, 2], [4, -2]] },
      { label: 'Table D', rows: [[1, 0], [9, -3], [9, 3]] },
    ];
    return (
      <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tables.map((t) => (
          <div key={t.label} className="rounded-lg border border-slate-700/80 bg-[#0E1018] overflow-hidden">
            <div className="px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-800/60 border-b border-slate-700/70">
              {t.label}
            </div>
            <table className="w-full text-xs text-center font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-1">x</th>
                  <th className="py-1">y</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map(([x, y], idx) => (
                  <tr key={idx} className="border-b border-slate-800/60 last:border-b-0">
                    <td className="py-1 text-slate-200">{x}</td>
                    <td className="py-1 text-slate-200">{y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  if (diagram.kind === 'linear-table') {
    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] overflow-hidden max-w-[200px]">
        <table className="w-full text-sm text-center font-mono tabular-nums">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/60 text-slate-300">
              <th className="py-1.5 px-3">x</th>
              <th className="py-1.5 px-3">f(x)</th>
            </tr>
          </thead>
          <tbody>
            {diagram.rows.map((r) => (
              <tr key={r.x} className="border-b border-slate-800 last:border-b-0">
                <td className="py-1.5 px-3 text-slate-200">{r.x}</td>
                <td
                  className={`py-1.5 px-3 font-semibold ${
                    r.fx === '?' ? 'text-amber-300' : 'text-slate-100'
                  }`}
                >
                  {r.fx}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.kind === 'linear-graph') {
    const w = 240;
    const h = 240;
    const pad = 26;
    const plot = w - pad * 2;
    const toX = (x: number) => pad + ((x + 10) / 20) * plot;
    const toY = (y: number) => pad + ((10 - y) / 20) * plot;

    let x1 = -9;
    let y1 = -9;
    let x2 = 9;
    let y2 = 9;
    if (diagram.points.length >= 2) {
      const [p1, p2] = diagram.points;
      const dx = p2[0] - p1[0];
      if (Math.abs(dx) > 1e-6) {
        const m = (p2[1] - p1[1]) / dx;
        const b = p1[1] - m * p1[0];
        const candidates: [number, number][] = [];
        for (const bx of [-10, 10]) {
          const cy = m * bx + b;
          if (cy >= -10 && cy <= 10) candidates.push([bx, cy]);
        }
        if (Math.abs(m) > 1e-6) {
          for (const by of [-10, 10]) {
            const cx = (by - b) / m;
            if (cx > -10 && cx < 10) candidates.push([cx, by]);
          }
        }
        if (candidates.length >= 2) {
          candidates.sort((a, c) => a[0] - c[0]);
          x1 = candidates[0][0];
          y1 = candidates[0][1];
          x2 = candidates[candidates.length - 1][0];
          y2 = candidates[candidates.length - 1][1];
        }
      }
    }

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-2 max-w-[250px]">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((v) => (
            <g key={v}>
              <line x1={toX(v)} y1={pad} x2={toX(v)} y2={pad + plot} stroke="rgba(148,163,184,0.13)" />
              <line x1={pad} y1={toY(v)} x2={pad + plot} y2={toY(v)} stroke="rgba(148,163,184,0.13)" />
            </g>
          ))}
          <line x1={pad} y1={toY(0)} x2={pad + plot} y2={toY(0)} stroke="#64748B" strokeWidth="1.5" />
          <line x1={toX(0)} y1={pad} x2={toX(0)} y2={pad + plot} stroke="#64748B" strokeWidth="1.5" />
          {[-6, -4, -2, 2, 4, 6, 8].map((v) => (
            <g key={`lbl-${v}`}>
              <text x={toX(v)} y={toY(0) + 11} textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">
                {v}
              </text>
              <text x={toX(0) - 5} y={toY(v) + 3} textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">
                {v}
              </text>
            </g>
          ))}
          <line
            x1={toX(x1)}
            y1={toY(y1)}
            x2={toX(x2)}
            y2={toY(y2)}
            stroke="#38BDF8"
            strokeWidth="2.5"
          />
          {diagram.points.map(([px, py], i) => (
            <circle key={i} cx={toX(px)} cy={toY(py)} r={3.5} fill="#FACC15" />
          ))}
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'quadratic-min-graph') {
    const w = 230;
    const h = 220;
    const padL = 28;
    const padB = 26;
    const padT = 14;
    const padR = 14;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const toX = (x: number) => padL + (x / 10) * plotW;
    const toY = (y: number) => padT + ((10 - y) / 10) * plotH;

    // Parabola y = (x - 5)^2 + 2
    const pts: string[] = [];
    for (let x = 2.1; x <= 7.9; x += 0.2) {
      const y = (x - 5) * (x - 5) + 2;
      if (y <= 10.2) {
        pts.push(`${toX(x).toFixed(1)},${toY(y).toFixed(1)}`);
      }
    }

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-2 max-w-[240px]">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={toX(v)} y1={padT} x2={toX(v)} y2={padT + plotH} stroke="rgba(148,163,184,0.14)" />
              <line x1={padL} y1={toY(v)} x2={padL + plotW} y2={toY(v)} stroke="rgba(148,163,184,0.14)" />
              <text x={toX(v)} y={h - 10} textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                {v}
              </text>
              <text x={padL - 5} y={toY(v) + 3} textAnchor="end" fill="#94A3B8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                {v}
              </text>
            </g>
          ))}
          <line x1={padL} y1={toY(0)} x2={padL + plotW} y2={toY(0)} stroke="#64748B" strokeWidth="1.5" />
          <line x1={toX(0)} y1={padT} x2={toX(0)} y2={padT + plotH} stroke="#64748B" strokeWidth="1.5" />
          <polyline fill="none" stroke="#10B981" strokeWidth="2.5" points={pts.join(' ')} />
          <circle cx={toX(5)} cy={toY(2)} r={4} fill="#FACC15" />
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'quadratic-vertex-graph') {
    const w = 230;
    const h = 220;
    const padL = 28;
    const padB = 26;
    const padT = 14;
    const padR = 14;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const toX = (x: number) => padL + (x / 10) * plotW;
    const toY = (y: number) => padT + ((10 - y) / 10) * plotH;

    const pts: string[] = [];
    for (let x = 0; x <= 10; x += 0.15) {
      const y = diagram.a * (x - diagram.h) * (x - diagram.h) + diagram.k;
      if (y >= -0.2 && y <= 10.2) {
        pts.push(`${toX(x).toFixed(1)},${toY(y).toFixed(1)}`);
      }
    }

    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] p-2 max-w-[240px]">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={toX(v)} y1={padT} x2={toX(v)} y2={padT + plotH} stroke="rgba(148,163,184,0.14)" />
              <line x1={padL} y1={toY(v)} x2={padL + plotW} y2={toY(v)} stroke="rgba(148,163,184,0.14)" />
              <text x={toX(v)} y={h - 10} textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                {v}
              </text>
              <text x={padL - 5} y={toY(v) + 3} textAnchor="end" fill="#94A3B8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                {v}
              </text>
            </g>
          ))}
          <line x1={padL} y1={toY(0)} x2={padL + plotW} y2={toY(0)} stroke="#64748B" strokeWidth="1.5" />
          <line x1={toX(0)} y1={padT} x2={toX(0)} y2={padT + plotH} stroke="#64748B" strokeWidth="1.5" />
          <polyline fill="none" stroke="#10B981" strokeWidth="2.5" points={pts.join(' ')} />
          <circle cx={toX(diagram.h)} cy={toY(diagram.k)} r={4} fill="#FACC15" />
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'two-way-table') {
    const rowLabels = [diagram.rowHeaders[0], diagram.rowHeaders[1], 'Total'];
    return (
      <div className="my-3 rounded-lg border border-slate-700/80 bg-[#0E1018] overflow-hidden max-w-sm">
        <div className="px-3 py-1.5 bg-slate-800/70 text-xs font-semibold text-slate-200 border-b border-slate-700/80">
          {diagram.title}
        </div>
        <table className="w-full text-sm text-center font-mono tabular-nums">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-sans text-xs">
              <th className="py-2 px-3 text-left"></th>
              <th className="py-2 px-3">{diagram.colHeaders[0]}</th>
              <th className="py-2 px-3">{diagram.colHeaders[1]}</th>
              <th className="py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {diagram.cells.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-slate-800 last:border-b-0">
                <td className="py-2 px-3 text-left font-sans font-medium text-slate-200">
                  {rowLabels[rIdx]}
                </td>
                {row.map((val, cIdx) => (
                  <td
                    key={cIdx}
                    className={`py-2 px-3 ${
                      val === '?'
                        ? 'text-amber-300 font-bold'
                        : val === '—'
                        ? 'text-slate-500'
                        : 'text-slate-100'
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.kind === 'function-table-set') {
    return (
      <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {diagram.tables.map((t) => (
          <div key={t.label} className="rounded-lg border border-slate-700/80 bg-[#0E1018] overflow-hidden">
            <div className="px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-800/60 border-b border-slate-700/70">
              {t.label}
            </div>
            <table className="w-full text-xs text-center font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-1">x</th>
                  <th className="py-1">y</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map(([x, y], idx) => (
                  <tr key={idx} className="border-b border-slate-800/60 last:border-b-0">
                    <td className="py-1 text-slate-200">{x}</td>
                    <td className="py-1 text-slate-200">{y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
