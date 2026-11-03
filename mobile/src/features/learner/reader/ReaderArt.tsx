import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Trees as round crowns along a ridge: [x, y, r]. */
const CROWNS: readonly (readonly [number, number, number])[] = [
  [12, 150, 20],
  [40, 142, 22],
  [70, 150, 18],
  [96, 140, 20],
  [250, 146, 22],
  [280, 138, 20],
  [306, 148, 22],
  [326, 140, 18],
  [26, 170, 18],
  [60, 172, 16],
  [262, 168, 18],
  [298, 172, 16],
];
const PALMS: readonly (readonly [number, number, number])[] = [
  [22, 230, 1],
  [304, 226, 1.1],
  [52, 205, 0.7],
];

function Palm({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0 C 2 -30, 4 -55, 8 -80" stroke="#6B4F2A" strokeWidth={5} fill="none" />
      <Path d="M8 -80 C -14 -86, -30 -78, -40 -64 C -22 -74, -6 -76, 8 -80 Z" fill="#2E8B3A" />
      <Path d="M8 -80 C 30 -88, 46 -80, 54 -66 C 36 -76, 22 -78, 8 -80 Z" fill="#2E8B3A" />
      <Path d="M8 -80 C -6 -100, -22 -104, -34 -100 C -16 -98, -4 -92, 8 -80 Z" fill="#3FA34D" />
      <Path d="M8 -80 C 22 -102, 40 -106, 50 -98 C 34 -96, 20 -90, 8 -80 Z" fill="#3FA34D" />
    </G>
  );
}

/** Figure 1.1: forests, a river and mountains, drawn so the page needs no photo. */
export function EnvironmentArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 330 260" preserveAspectRatio="xMidYMid slice" accessibilityLabel="A natural environment with forests, a river and mountains">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7EC3F2" />
          <Stop offset="1" stopColor="#D7EEFB" />
        </LinearGradient>
        <LinearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9FD8F0" />
          <Stop offset="1" stopColor="#3C9BD0" />
        </LinearGradient>
        <LinearGradient id="mount" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4F8F5A" />
          <Stop offset="1" stopColor="#2F6E3E" />
        </LinearGradient>
      </Defs>
      <Rect width={330} height={260} fill="url(#sky)" />
      <Circle cx={268} cy={44} r={18} fill="#FFF3B0" opacity={0.9} />
      <Ellipse cx={80} cy={40} rx={30} ry={9} fill="#FFFFFF" opacity={0.85} />
      <Ellipse cx={104} cy={34} rx={20} ry={8} fill="#FFFFFF" opacity={0.85} />
      <Path d="M0 120 L60 70 L110 100 L170 40 L230 95 L280 66 L330 108 L330 170 L0 170 Z" fill="#8FB3C9" opacity={0.8} />
      <Path d="M0 140 L50 100 L100 126 L165 70 L225 120 L285 92 L330 128 L330 190 L0 190 Z" fill="url(#mount)" />
      <Path d="M120 108 C 150 96, 185 98, 210 112 L 215 125 C 190 116, 150 114, 118 122 Z" fill="#FFFFFF" opacity={0.25} />
      {CROWNS.map(([x, y, r]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={y > 160 ? '#2C7A36' : '#3D9447'} />
      ))}
      <Path d="M0 180 C 60 168, 120 176, 165 170 C 210 164, 270 176, 330 168 L330 260 L0 260 Z" fill="#4E9E3F" />
      <Path d="M160 112 C 150 140, 176 150, 160 172 C 140 198, 110 210, 90 260 L 240 260 C 214 218, 190 196, 196 172 C 202 150, 178 136, 174 112 Z" fill="url(#river)" />
      <Path d="M150 190 C 160 186, 172 188, 180 194" stroke="#FFFFFF" strokeWidth={2} opacity={0.6} fill="none" />
      <Path d="M126 226 C 140 220, 160 222, 172 230" stroke="#FFFFFF" strokeWidth={2} opacity={0.6} fill="none" />
      <Ellipse cx={118} cy={236} rx={16} ry={8} fill="#8C8577" />
      <Ellipse cx={212} cy={232} rx={18} ry={9} fill="#9A9284" />
      <Ellipse cx={196} cy={206} rx={10} ry={5} fill="#A59D8F" />
      <Ellipse cx={138} cy={204} rx={9} ry={5} fill="#8C8577" />
      {PALMS.map(([x, y, s]) => (
        <Palm key={`${x}-${y}`} x={x} y={y} s={s} />
      ))}
      <Path d="M0 260 C 20 236, 40 240, 60 260 Z" fill="#2C7A36" />
      <Path d="M270 260 C 290 232, 312 236, 330 250 L330 260 Z" fill="#2C7A36" />
    </Svg>
  );
}
