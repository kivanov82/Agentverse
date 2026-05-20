import * as React from 'react';
import { F } from './tokens';
import { Display } from './type';

/** Newsreader italic wordmark with the vermilion `.AI` suffix (SPEC §2.1). */
export function Wordmark({ size = 21 }: { size?: number }) {
  return (
    <Display
      size={size === 21 ? 'meta-l' : 'h-s'}
      as="span"
      italic
      color={F.ink}
      style={{ fontSize: size, letterSpacing: '-0.01em' }}
    >
      ShipWith<span style={{ color: F.accent }}>.AI</span>
    </Display>
  );
}
