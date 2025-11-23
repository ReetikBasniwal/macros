import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

type DonutRingsProps = {
  size?: number;
  carbsPercent?: number; // 0-100
  fatPercent?: number;
  proteinPercent?: number;
};

export default function DonutRings({ size = 280, carbsPercent = 55, fatPercent = 65, proteinPercent = 48, }: DonutRingsProps) {
  const center = size / 2;

  // circle circumferences
  const r1 = 150; // outer
  const r2 = 126; // mid
  const r3 = 102; // inner

  const circ1 = 2 * Math.PI * r1;
  const circ2 = 2 * Math.PI * r2;
  const circ3 = 2 * Math.PI * r3;

  const dash1 = (carbsPercent / 100) * circ1;
  const dash2 = (fatPercent / 100) * circ2;
  const dash3 = (proteinPercent / 100) * circ3;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width="100%" height="100%" viewBox="0 0 320 320" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="carbsGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#81C784" />
            <Stop offset="100%" stopColor="#4CAF50" />
          </LinearGradient>
          <LinearGradient id="fatGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#4FC3F7" />
            <Stop offset="100%" stopColor="#0288D1" />
          </LinearGradient>
          <LinearGradient id="proteinGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFB74D" />
            <Stop offset="100%" stopColor="#FF9800" />
          </LinearGradient>
        </Defs>

        <Circle cx="160" cy="160" r={r1} stroke="#E8E8E8" strokeWidth={20} fill="transparent" />
        <Circle cx="160" cy="160" r={r2} stroke="#E8E8E8" strokeWidth={18} fill="transparent" />
        <Circle cx="160" cy="160" r={r3} stroke="#E8E8E8" strokeWidth={16} fill="transparent" />

        <Circle
          cx="160"
          cy="160"
          r={r1}
          stroke="url(#carbsGradient)"
          strokeWidth={20}
          strokeLinecap="round"
          strokeDasharray={`${dash1} ${circ1 - dash1}`}
          fill="transparent"
        />

        <Circle
          cx="160"
          cy="160"
          r={r2}
          stroke="url(#fatGradient)"
          strokeWidth={18}
          strokeLinecap="round"
          strokeDasharray={`${dash2} ${circ2 - dash2}`}
          fill="transparent"
        />

        <Circle
          cx="160"
          cy="160"
          r={r3}
          stroke="url(#proteinGradient)"
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${dash3} ${circ3 - dash3}`}
          fill="transparent"
        />
      </Svg>
    </View>
  );
}
