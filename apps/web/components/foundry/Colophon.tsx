import * as React from 'react';
import { F } from './tokens';
import { Asterism } from './marks';
import { Mono } from './type';

export function Colophon() {
  return (
    <footer style={{
      padding: '64px 96px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Asterism size={9} color={F.inkMute} />
        <Mono size="s" color={F.inkMute}>
          COLOPHON · SET IN NEWSREADER &amp; GEIST · PRINTED ON THE WEB
        </Mono>
      </div>
      <Mono size="m" color={F.accent}>SHIPWITHAI.NL</Mono>
    </footer>
  );
}
