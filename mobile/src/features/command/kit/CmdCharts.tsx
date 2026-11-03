import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { BODY, LINE, NAVY, WHITE } from '@/features/portal/tokens';

/** Chart text uses the app's font, not the SVG default serif. */
const FONT = Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined;
const LEFT = 44;
const BOTTOM = 22;

export interface Trend {
  name: string;
  color: string;
  values: readonly number[];
  /** Shade the area under the line. */
  fill?: boolean;
  dots?: boolean;
}

function useWidth(): [number, (w: number) => void] {
  const [w, setW] = useState(0);
  return [w, setW];
}

/** Horizontal grid lines and their labels from `min` to `max`. */
function Grid({ min, max, ticks, plotH, width, format, left = LEFT, right }: { min: number; max: number; ticks: number; plotH: number; width: number; format: (n: number) => string; left?: number; right?: { max: number; format: (n: number) => string } }) {
  return (
    <>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = min + ((max - min) / ticks) * i;
        const y = 6 + plotH - (i / ticks) * plotH;
        return (
          <G key={i}>
            <Line x1={left} x2={right ? width - 40 : width} y1={y} y2={y} stroke={LINE} strokeWidth={1} />
            <SvgText fontFamily={FONT} x={left - 6} y={y + 4} fontSize={10.5} fill={BODY} textAnchor="end">
              {format(v)}
            </SvgText>
            {right ? (
              <SvgText fontFamily={FONT} x={width - 4} y={y + 4} fontSize={10.5} fill={BODY} textAnchor="end">
                {right.format((right.max / ticks) * i)}
              </SvgText>
            ) : null}
          </G>
        );
      })}
    </>
  );
}

/** Lines over time, optionally shaded, optionally stacked (connection usage). */
export function AreaChart({
  labels,
  series,
  min = 0,
  max,
  ticks = 4,
  height = 160,
  format = (n) => `${n}`,
  every = 1,
  stacked = false,
}: {
  labels: readonly string[];
  series: readonly Trend[];
  min?: number;
  max: number;
  ticks?: number;
  height?: number;
  format?: (n: number) => string;
  /** Print every nth x label. */
  every?: number;
  stacked?: boolean;
}) {
  const [width, setWidth] = useWidth();
  const plotH = height - BOTTOM - 6;
  const n = Math.max(...series.map((s) => s.values.length));
  const x = (i: number) => LEFT + 6 + (n > 1 ? (i / (n - 1)) * (width - LEFT - 12) : 0);
  const y = (v: number) => 6 + plotH - ((v - min) / (max - min)) * plotH;
  // Stacked areas sit on the ones before them.
  const bases = series.map((_, k) => Array.from({ length: n }, (__, i) => (stacked ? series.slice(0, k).reduce((sum, s) => sum + (s.values[i] ?? 0), 0) : min)));
  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Grid min={min} max={max} ticks={ticks} plotH={plotH} width={width} format={format} />
          {series.map((s, k) => {
            const top = s.values.map((v, i) => v + (stacked ? bases[k][i] : 0));
            const line = top.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
            const under = bases[k]
              .map((v, i) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`)
              .reverse()
              .join(' ');
            return (
              <G key={s.name}>
                {s.fill || stacked ? <Path d={`${line} ${under} Z`} fill={s.color} opacity={stacked ? 0.85 : 0.14} /> : null}
                <Path d={line} stroke={s.color} strokeWidth={stacked ? 1 : 2} fill="none" />
                {s.dots ? top.map((v, i) => <Circle key={i} cx={x(i)} cy={y(v)} r={3} fill={WHITE} stroke={s.color} strokeWidth={1.6} />) : null}
              </G>
            );
          })}
          {labels.map((l, i) =>
            i % every === 0 ? (
              <SvgText key={`${l}-${i}`} fontFamily={FONT} x={x(Math.round((i / Math.max(1, labels.length - 1)) * (n - 1)))} y={height - 4} fontSize={10.5} fill={BODY} textAnchor="middle">
                {l}
              </SvgText>
            ) : null,
          )}
        </Svg>
      ) : null}
    </View>
  );
}

/** Bars (grouped or stacked) on the left axis with an optional line on its own right axis (conversion, commission %). */
export function ComboChart({
  labels,
  bars,
  max,
  mode = 'grouped',
  line,
  lineMax = 100,
  ticks = 4,
  height = 180,
  format = (n) => `${n}`,
  lineFormat = (n) => `${Math.round(n)}%`,
  every = 1,
  barWidth,
  rightAxis = true,
}: {
  labels: readonly string[];
  bars: readonly Trend[];
  max: number;
  mode?: 'grouped' | 'stacked';
  line?: Trend;
  lineMax?: number;
  ticks?: number;
  height?: number;
  format?: (n: number) => string;
  lineFormat?: (n: number) => string;
  every?: number;
  barWidth?: number;
  /** Print the line's own scale on the right. */
  rightAxis?: boolean;
}) {
  const [width, setWidth] = useWidth();
  const plotH = height - BOTTOM - 6;
  const right = line && rightAxis ? 40 : 0;
  const n = labels.length;
  const slot = n ? (width - LEFT - right) / n : 0;
  const y = (v: number) => 6 + plotH - (v / max) * plotH;
  const ly = (v: number) => 6 + plotH - (v / lineMax) * plotH;
  const cx = (i: number) => LEFT + slot * i + slot / 2;
  const bw = barWidth ?? (mode === 'stacked' ? Math.min(26, slot * 0.55) : Math.min(12, (slot * 0.75) / bars.length));
  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Grid min={0} max={max} ticks={ticks} plotH={plotH} width={width} format={format} right={line && rightAxis ? { max: lineMax, format: lineFormat } : undefined} />
          {labels.map((l, i) => {
            let base = 0;
            return (
              <G key={`${l}-${i}`}>
                {bars.map((s, k) => {
                  const v = s.values[i] ?? 0;
                  if (mode === 'stacked') {
                    const top = base + v;
                    const el = <Rect key={s.name} x={cx(i) - bw / 2} y={y(top)} width={bw} height={Math.max(0, y(base) - y(top))} fill={s.color} rx={k === bars.length - 1 ? 3 : 0} />;
                    base = top;
                    return el;
                  }
                  return <Rect key={s.name} x={cx(i) - (bw * bars.length) / 2 + bw * k} y={y(v)} width={bw - 1} height={Math.max(0, y(0) - y(v))} fill={s.color} rx={1.5} />;
                })}
                {i % every === 0 ? (
                  <SvgText fontFamily={FONT} x={cx(i)} y={height - 4} fontSize={10.5} fill={BODY} textAnchor="middle">
                    {l}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
          {line ? (
            <>
              <Path d={line.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${ly(v).toFixed(1)}`).join(' ')} stroke={line.color} strokeWidth={2} fill="none" />
              {line.values.map((v, i) => (
                <Circle key={i} cx={cx(i)} cy={ly(v)} r={3.2} fill={line.color} />
              ))}
            </>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

/** Vertical bars each split into shares that add up to 100% (good, fair, poor). */
export function ShareBars({ labels, parts, height = 150 }: { labels: readonly string[]; parts: readonly { name: string; color: string; values: readonly number[] }[]; height?: number }) {
  const [width, setWidth] = useWidth();
  const plotH = height - BOTTOM - 6;
  const n = parts[0]?.values.length ?? 0;
  const slot = n ? (width - LEFT) / n : 0;
  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Grid min={0} max={100} ticks={4} plotH={plotH} width={width} format={(v) => `${v}%`} />
          {Array.from({ length: n }, (_, i) => {
            const total = parts.reduce((s, p) => s + p.values[i], 0) || 1;
            let base = 0;
            return (
              <G key={i}>
                {parts.map((p) => {
                  const h = (p.values[i] / total) * plotH;
                  const el = <Rect key={p.name} x={LEFT + slot * i + 1} y={6 + plotH - base - h} width={Math.max(1, slot - 2)} height={h} fill={p.color} />;
                  base += h;
                  return el;
                })}
              </G>
            );
          })}
          {labels.map((l, i) => (
            <SvgText key={l} fontFamily={FONT} x={LEFT + ((width - LEFT) / Math.max(1, labels.length - 1)) * i} y={height - 4} fontSize={10.5} fill={BODY} textAnchor="middle">
              {l}
            </SvgText>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

export interface Stage {
  value: number;
  color: string;
}

/** A sales funnel: one band per stage, narrowing down, with the count on each. */
export function Funnel({ stages, width = 170, band = 34, gap = 6 }: { stages: readonly Stage[]; width?: number; band?: number; gap?: number }) {
  const h = stages.length * (band + gap);
  return (
    <Svg width={width} height={h}>
      {stages.map((s, i) => {
        const inset = (i / stages.length) * width * 0.32;
        const next = ((i + 1) / stages.length) * width * 0.32;
        const top = i * (band + gap);
        return (
          <G key={i}>
            <Polygon points={`${inset},${top} ${width - inset},${top} ${width - next},${top + band} ${next},${top + band}`} fill={s.color} />
            <SvgText fontFamily={FONT} x={width / 2} y={top + band / 2 + 6} fontSize={16} fontWeight="700" fill={NAVY} textAnchor="middle">
              {s.value.toLocaleString('en-US')}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

/* ─── Africa map ─── */

type Pt = readonly [number, number];

/** Rough outlines (longitude, latitude) — enough for a growth heat map, not for borders. */
const AFRICA: readonly Pt[] = [
  [-5.8, 35.8], [10.2, 37], [11, 37], [15, 32], [20, 32], [20, 31], [25, 31.5], [32, 31.3], [32.5, 30], [34, 27], [36, 23], [37.5, 19], [39, 16], [41, 14], [43, 12.5], [44, 10.5], [48, 11.3], [51.3, 11.8],
  [51, 10], [49, 6], [47, 4], [44, 1.5], [42, -1], [40.5, -3], [39.3, -5], [39.5, -8], [40.3, -10.5], [40.5, -14.5], [40, -16.5], [37, -18], [35, -21], [35.5, -24], [33, -26], [32.5, -28.5], [30.5, -31], [27.5, -33.5],
  [25, -34], [22, -34.2], [20, -34.8], [18.4, -34], [18, -32], [17.5, -30], [16.5, -28.5], [15, -26], [14.5, -23], [13, -20], [11.8, -17], [12.2, -13], [13.5, -10], [12.3, -6], [11.8, -3], [9.2, 0], [9.5, 3],
  [8.7, 4.5], [6, 4.3], [4, 6.4], [1.5, 6.1], [-2, 4.8], [-4, 5.2], [-7.5, 4.4], [-9, 5.3], [-11.5, 6.9], [-13.3, 9], [-15, 11], [-16.7, 12.5], [-17.2, 14.7], [-16.5, 16], [-16.2, 19], [-17, 21], [-15, 24], [-13, 27],
  [-10, 29], [-9.7, 31], [-8.5, 33], [-6.8, 34],
];
const MADAGASCAR: readonly Pt[] = [[49.3, -12], [50.4, -15.5], [49.5, -17.5], [47.5, -24.5], [45.2, -25.5], [43.6, -23], [44.2, -20], [44, -17], [46.5, -15.8], [48, -13.5]];

const COUNTRIES: Readonly<Record<string, readonly Pt[]>> = {
  UG: [[29.6, -1.4], [30.5, -1], [33.9, -1], [34, 1.2], [35, 1.5], [34.5, 3.7], [33.5, 3.8], [31, 3.7], [30.8, 2.4], [29.9, 1]],
  KE: [[34, 4.6], [36, 4.4], [38.6, 3.6], [41, 4], [41.9, 3.9], [41, 2.8], [41, -1.6], [40, -2.5], [39.2, -4.7], [37.6, -3.4], [33.9, -1], [34, 1.2], [35, 1.5], [34.5, 3.7]],
  TZ: [[30.5, -1], [33.9, -1], [37.6, -3.4], [39.2, -4.7], [39.3, -6.5], [39.5, -8], [40.4, -10.4], [38, -11.3], [35.6, -11.6], [34.6, -11.5], [33, -9.4], [31, -8.6], [30.5, -7.5], [29.4, -6], [30.4, -4], [30.8, -3.4]],
  RW: [[29, -1.2], [30.5, -1], [30.8, -2.4], [29.9, -2.8], [28.9, -2.6]],
  NG: [[2.7, 6.3], [4, 6.4], [5.6, 4.3], [8.5, 4.5], [9.6, 6.5], [11.7, 7], [13.6, 10.8], [14.5, 12.9], [13.2, 13.6], [10.8, 13.4], [8, 12.9], [4, 13.5], [3.6, 11.7], [2.8, 9]],
  GH: [[-3.2, 5], [1.2, 6], [0.6, 8.3], [-0.1, 11.1], [-2.8, 11], [-2.9, 9]],
  ET: [[33, 8.4], [35, 5.4], [38.6, 3.6], [41.9, 3.9], [45, 5], [47.9, 8], [44, 9], [42.8, 11], [41.5, 13.4], [39.7, 14.6], [36.5, 14.3], [35, 12.7], [34, 10.5]],
  ZA: [[16.5, -28.6], [19, -28.8], [20, -25], [25.6, -25.6], [28, -23.5], [31.3, -22.4], [32, -26], [32.9, -26.8], [32.5, -28.5], [30.5, -31], [27.5, -33.5], [25, -34], [22, -34.2], [20, -34.8], [18.4, -34], [18, -32], [17.5, -30]],
};

/** A heat map of Africa: the continent in pale blue, each listed country tinted by its share of `values`. */
export function AfricaMap({ values, width = 300, color = '#1E6BF0' }: { values: Readonly<Record<string, number>>; width?: number; color?: string }) {
  const scale = width / 72;
  const height = 74 * scale;
  const pts = (list: readonly Pt[]) => list.map(([lon, lat]) => `${((lon + 19) * scale).toFixed(1)},${((38 - lat) * scale).toFixed(1)}`).join(' ');
  const max = Math.max(1, ...Object.values(values));
  return (
    <Svg width={width} height={height} accessibilityLabel="Map of Africa shaded by growth">
      <Polygon points={pts(AFRICA)} fill="#D6E4FB" stroke={WHITE} strokeWidth={1} />
      <Polygon points={pts(MADAGASCAR)} fill="#D6E4FB" stroke={WHITE} strokeWidth={1} />
      {Object.entries(COUNTRIES).map(([code, list]) => {
        const v = values[code] ?? 0;
        return <Polygon key={code} points={pts(list)} fill={color} opacity={v ? 0.25 + 0.75 * (v / max) : 0} stroke={WHITE} strokeWidth={0.8} />;
      })}
    </Svg>
  );
}

/** "Fewer ▬▬▬ More" under a heat map. */
export function HeatScale({ low, high }: { low: string; high: string }) {
  return (
    <View style={styles.scale}>
      <Text style={styles.scaleText}>{low}</Text>
      <Svg width={140} height={8}>
        {Array.from({ length: 14 }, (_, i) => (
          <Rect key={i} x={i * 10} y={0} width={10} height={8} fill="#1E6BF0" opacity={0.15 + (i / 13) * 0.85} />
        ))}
      </Svg>
      <Text style={styles.scaleText}>{high}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scaleText: { fontSize: 12, color: BODY },
});
