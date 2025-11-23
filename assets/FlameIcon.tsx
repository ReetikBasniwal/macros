import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function FlameIcon({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2s4 3.5 4 7.5C16 14 12 17 12 17s-4-3-4-7.5C8 5.5 12 2 12 2z"
        fill="#FF7043"
      />
      <Path
        d="M10.2 9.3c.7-.6 1.8-.5 2.4.2.8.9.5 2.4-.6 3.4-1.1 1-2.4 1.1-3.1.2-.7-.9-.4-2.5.3-3.8z"
        fill="#FFF3E0"
        opacity={0.9}
      />
    </Svg>
  );
}
