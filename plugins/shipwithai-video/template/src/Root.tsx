import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { brand } from "./brand";
import { scenes } from "./scenes";

const total = scenes.reduce((n, s) => n + s.durationInFrames, 0);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={total}
      fps={brand.fps}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
