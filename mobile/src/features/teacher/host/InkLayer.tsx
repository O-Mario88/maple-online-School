import { type ComponentRef, type Dispatch, useReducer, useRef, useState } from 'react';
import { type GestureResponderEvent, Platform, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { type BoardBox, type InkAction, inkReducer, type InkState, type Point, strokePath, toBoardPoint } from '@/lib/board-ink';

export type InkTool = 'select' | 'pen' | 'highlighter' | 'rect' | 'circle' | 'text' | 'image' | 'formula';

export interface Mark {
  id: number;
  kind: 'pen' | 'highlighter' | 'rect' | 'circle' | 'text';
  color: string;
  points: readonly Point[];
  text?: string;
}

const DRAWS: readonly InkTool[] = ['pen', 'highlighter', 'rect', 'circle', 'text', 'formula'];
const EMPTY: InkState<Mark> = { items: [], undone: [] };

export interface Ink {
  marks: readonly Mark[];
  canUndo: boolean;
  canRedo: boolean;
  dispatch: Dispatch<InkAction<Mark>>;
}

/** The whiteboard's drawing history, shared by the toolbar's undo and redo. */
export function useInk(): Ink {
  const [state, dispatch] = useReducer(inkReducer<Mark>, EMPTY);
  return { marks: state.items, canUndo: state.items.length > 0, canRedo: state.undone.length > 0, dispatch };
}

let nextId = 1;

/**
 * Draws over the whiteboard with the chosen tool and colour: pen and highlighter strokes, rectangles,
 * circles, and text you can type where you tap. With the select tool it lets taps through.
 */
export function InkLayer({ tool, color, ink }: { tool: InkTool; color: string; ink: Ink }) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const width = useRef(0);
  const box = useRef<BoardBox>({ left: 0, top: 0, scale: 1 });
  const [editing, setEditing] = useState<number | null>(null);
  const drawing = DRAWS.includes(tool);

  // The console is drawn scaled to fit the window, so page touches are converted back to board units.
  const measure = () => {
    if (Platform.OS !== 'web' || !ref.current) return;
    const r = (ref.current as unknown as HTMLElement).getBoundingClientRect();
    box.current = { left: r.left + window.scrollX, top: r.top + window.scrollY, scale: width.current ? r.width / width.current : 1 };
  };
  const point = (e: GestureResponderEvent): Point =>
    Platform.OS === 'web' ? toBoardPoint(e.nativeEvent, box.current) : { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };

  const start = (e: GestureResponderEvent) => {
    measure();
    const p = point(e);
    const id = nextId++;
    if (tool === 'text' || tool === 'formula') {
      ink.dispatch({ type: 'add', item: { id, kind: 'text', color, points: [p], text: tool === 'formula' ? 'x = ' : '' } });
      setEditing(id);
      return;
    }
    const kind = tool === 'highlighter' ? 'highlighter' : tool === 'rect' ? 'rect' : tool === 'circle' ? 'circle' : 'pen';
    ink.dispatch({ type: 'add', item: { id, kind, color, points: [p] } });
  };
  const move = (e: GestureResponderEvent) => {
    const last = ink.marks[ink.marks.length - 1];
    if (!last || last.kind === 'text') return;
    const p = point(e);
    const points = last.kind === 'pen' || last.kind === 'highlighter' ? [...last.points, p] : [last.points[0], p];
    ink.dispatch({ type: 'update', item: { ...last, points } });
  };

  return (
    <View
      ref={ref}
      style={[StyleSheet.absoluteFill, drawing && styles.drawing]}
      pointerEvents={drawing ? 'auto' : 'box-none'}
      onLayout={(e) => (width.current = e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => drawing && tool !== 'image'}
      onMoveShouldSetResponder={() => drawing}
      onResponderGrant={start}
      onResponderMove={move}
      accessibilityLabel={drawing ? 'Whiteboard: drag to draw' : undefined}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        {ink.marks.map((m) => {
          const [a, b = a] = m.points;
          if (m.kind === 'rect') return <Rect key={m.id} x={Math.min(a.x, b.x)} y={Math.min(a.y, b.y)} width={Math.abs(b.x - a.x)} height={Math.abs(b.y - a.y)} stroke={m.color} strokeWidth={2.5} fill="none" rx={4} />;
          if (m.kind === 'circle') return <Ellipse key={m.id} cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} rx={Math.abs(b.x - a.x) / 2} ry={Math.abs(b.y - a.y) / 2} stroke={m.color} strokeWidth={2.5} fill="none" />;
          if (m.kind === 'text') return null;
          const hi = m.kind === 'highlighter';
          return <Path key={m.id} d={strokePath(m.points)} stroke={m.color} strokeWidth={hi ? 14 : 3} strokeOpacity={hi ? 0.35 : 1} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
        })}
      </Svg>
      {ink.marks
        .filter((m) => m.kind === 'text')
        .map((m) => (
          <TextInput
            key={m.id}
            style={[styles.text, { left: m.points[0].x, top: m.points[0].y - 12, color: m.color }]}
            defaultValue={m.text}
            placeholder="Type here"
            placeholderTextColor="#94A3B8"
            ref={(el) => {
              // Focus once, just after the box is placed (the mouse release would otherwise take focus back).
              if (el && m.id === editing) setTimeout(() => el.focus(), 0);
            }}
            onFocus={() => setEditing(null)}
            accessibilityLabel="Whiteboard text"
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  drawing: { cursor: 'crosshair' } as object,
  text: { position: 'absolute', minWidth: 90, paddingHorizontal: 2, fontSize: 18, fontStyle: 'italic', fontWeight: '600' },
});
