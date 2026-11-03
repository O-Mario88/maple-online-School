import { type ReactNode, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { BODY, LINE, NAVY } from '@/features/portal/tokens';

export interface Slice {
  value: number;
  color: string;
}

/** A ring chart: each slice's share of the total, with whatever sits in the middle. */
export function Donut({ slices, size = 150, stroke = 22, children }: { slices: readonly Slice[]; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  // Each slice starts where the ones before it end.
  const arcs = slices.map((s, i) => ({
    color: s.color,
    len: (s.value / total) * c,
    start: slices.slice(0, i).reduce((sum, x) => sum + (x.value / total) * c, 0),
  }));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F8" strokeWidth={stroke} fill="none" />
          {arcs.map((a, i) => (
            <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={a.color} strokeWidth={stroke} fill="none" strokeDasharray={`${Math.max(0, a.len - 1.5)} ${c}`} strokeDashoffset={-a.start} />
          ))}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

export interface Series {
  name: string;
  color: string;
  values: readonly number[];
}

/** Lays a chart out at the width it is given. */
function useWidth(): [number, (w: number) => void] {
  const [w, setW] = useState(0);
  return [w, setW];
}

const AXIS = 70;
/** Chart text uses the app's font, not the SVG default serif. */
const FONT = Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined;
const BOTTOM = 26;

/** Y-axis labels from 0 to max in `ticks` steps. */
function Axis({ max, ticks, height, format, width }: { max: number; ticks: number; height: number; format: (n: number) => string; width: number }) {
  const plotH = height - BOTTOM;
  return (
    <>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        const y = plotH - (v / max) * plotH + 6;
        return (
          <G key={i}>
            <Line x1={AXIS} x2={width} y1={y} y2={y} stroke={LINE} strokeWidth={1} />
            <SvgText fontFamily={FONT} x={AXIS - 8} y={y + 4} fontSize={11} fill={BODY} textAnchor="end">
              {format(v)}
            </SvgText>
          </G>
        );
      })}
    </>
  );
}

/**
 * Bars per label: stacked (collected + outstanding) or side by side (income vs expenses),
 * with an optional line series drawn over them.
 */
export function BarChart({
  labels,
  series,
  max,
  ticks = 5,
  height = 200,
  mode = 'grouped',
  line,
  format = (n) => `${n}`,
}: {
  labels: readonly string[];
  series: readonly Series[];
  max: number;
  ticks?: number;
  height?: number;
  mode?: 'grouped' | 'stacked';
  line?: Series;
  format?: (n: number) => string;
}) {
  const [width, setWidth] = useWidth();
  const plotH = height - BOTTOM;
  const slot = labels.length ? (width - AXIS) / labels.length : 0;
  const y = (v: number) => plotH - (v / max) * plotH + 6;
  const barW = mode === 'stacked' ? Math.min(28, slot * 0.5) : Math.min(series.length === 1 ? 36 : 14, (slot * 0.6) / series.length);
  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Axis max={max} ticks={ticks} height={height} format={format} width={width} />
          {labels.map((l, i) => {
            const cx = AXIS + slot * i + slot / 2;
            let base = 0;
            return (
              <G key={l}>
                {series.map((s, k) => {
                  const v = s.values[i] ?? 0;
                  if (mode === 'stacked') {
                    const top = base + v;
                    const el = <Rect key={s.name} x={cx - barW / 2} y={y(top)} width={barW} height={Math.max(0, y(base) - y(top))} fill={s.color} rx={k === series.length - 1 ? 3 : 0} />;
                    base = top;
                    return el;
                  }
                  const x = cx - (barW * series.length) / 2 + barW * k + 1;
                  return <Rect key={s.name} x={x} y={y(v)} width={barW - 2} height={Math.max(0, y(0) - y(v))} fill={s.color} rx={2} />;
                })}
                <SvgText fontFamily={FONT} x={cx} y={height - 6} fontSize={11.5} fill={BODY} textAnchor="middle">
                  {l}
                </SvgText>
              </G>
            );
          })}
          {line ? (
            <>
              <Polyline points={line.values.map((v, i) => `${AXIS + slot * i + slot / 2},${y(v)}`).join(' ')} fill="none" stroke={line.color} strokeWidth={2} />
              {line.values.map((v, i) => (
                <Circle key={i} cx={AXIS + slot * i + slot / 2} cy={y(v)} r={4} fill={line.color} />
              ))}
            </>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

/** Lines over labelled points (attendance by week), on an axis from `min` to `max`. */
export function LineChart({ labels, series, min, max, ticks = 5, height = 170, format = (n) => `${n}` }: { labels: readonly string[]; series: readonly Series[]; min: number; max: number; ticks?: number; height?: number; format?: (n: number) => string }) {
  const [width, setWidth] = useWidth();
  const plotH = height - BOTTOM;
  const slot = labels.length > 1 ? (width - AXIS - 24) / (labels.length - 1) : 0;
  const y = (v: number) => plotH - ((v - min) / (max - min)) * plotH + 6;
  const x = (i: number) => AXIS + 12 + slot * i;
  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {Array.from({ length: ticks + 1 }, (_, i) => {
            const v = min + ((max - min) / ticks) * i;
            return (
              <G key={i}>
                <Line x1={AXIS} x2={width} y1={y(v)} y2={y(v)} stroke={LINE} strokeWidth={1} />
                <SvgText fontFamily={FONT} x={AXIS - 8} y={y(v) + 4} fontSize={11} fill={BODY} textAnchor="end">
                  {format(v)}
                </SvgText>
              </G>
            );
          })}
          {labels.map((l, i) => (
            <SvgText fontFamily={FONT} key={l} x={x(i)} y={height - 6} fontSize={11.5} fill={BODY} textAnchor="middle">
              {l}
            </SvgText>
          ))}
          {series.map((s) => (
            <G key={s.name}>
              <Path d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={2.5} />
              {s.values.map((v, i) => (
                <Circle key={i} cx={x(i)} cy={y(v)} r={4.5} fill={s.color} stroke="#FFFFFF" strokeWidth={1.5} />
              ))}
            </G>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

/** Tiny rising bars beside a stat ("12% from last term"). */
export function Spark({ color, values = [5, 8, 6, 11, 14] }: { color: string; values?: readonly number[] }) {
  const max = Math.max(...values);
  return (
    <Svg width={values.length * 8} height={26}>
      {values.map((v, i) => (
        <Rect key={i} x={i * 8} y={26 - (v / max) * 26} width={5} height={(v / max) * 26} rx={1.5} fill={color} />
      ))}
    </Svg>
  );
}

/** Big centred value and caption for the middle of a donut. */
export function DonutLabel({ value, caption, size = 26 }: { value: string; caption: string; size?: number }) {
  return (
    <View style={styles.center}>
      <Text style={[styles.value, { fontSize: size }]}>{value}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '800', color: NAVY },
  caption: { fontSize: 12.5, color: BODY, textAlign: 'center' },
});
