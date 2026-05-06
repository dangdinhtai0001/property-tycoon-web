import React from 'react';

const ENV_ASSETS = {
  sky: '/assets/environment/board-status-left/serene-gradient-of-sunrise-hues.png',
  cloudFar: '/assets/environment/board-status-left/soft-pastel-cloud-border-design.png',
  cloudMid: '/assets/environment/board-status-left/pastel-cloud-border-with-soft-gradients.png',
  cloudNear: '/assets/environment/board-status-left/fluffy-cloud-overlay-with-soft-gradients.png',
  panorama: '/assets/environment/board-status-left/seamless-city-and-hills-panorama.png',
  groundBase: '/assets/environment/board-status-left/cartoon-stone-path-with-grassy-borders.png',
  groundDetail: '/assets/environment/board-status-left/decorative-ground-with-glowing-accents.png',
  shadow: '/assets/environment/board-status-left/soft-gradient-shadow-on-transparency.png',
} as const;

type LayerStyle = React.CSSProperties & {
  '--env-image'?: string;
  '--env-duration'?: string;
  '--env-opacity'?: string;
  '--env-size'?: string;
  '--env-position-x'?: string;
  '--env-position-y'?: string;
};

const createMotionLayerStyle = (
  image: string,
  duration: string,
  extra?: Omit<LayerStyle, '--env-image' | '--env-duration'>
): LayerStyle => ({
  '--env-image': `url("${image}")`,
  '--env-duration': duration,
  ...extra,
});

export const BoardStatusLeftEnvironment: React.FC = () => {
  return (
    <div className="board-status-left-environment" aria-hidden="true">
      <div
        className="env-layer env-sky"
        style={{ backgroundImage: `url("${ENV_ASSETS.sky}")` }}
      />

      <div
        className="env-layer env-panorama env-motion"
        style={createMotionLayerStyle(ENV_ASSETS.panorama, '90s', {
          '--env-size': 'auto 46%',
          '--env-position-y': 'bottom 24%',
          opacity: 0.62,
        })}
      />

      <div
        className="env-layer env-cloud-far env-motion"
        style={createMotionLayerStyle(ENV_ASSETS.cloudFar, '80s', {
          '--env-size': 'auto 34%',
          '--env-position-y': 'top 8%',
          opacity: 0.28,
        })}
      />

      <div
        className="env-layer env-cloud-mid env-motion"
        style={createMotionLayerStyle(ENV_ASSETS.cloudMid, '60s', {
          '--env-size': 'auto 42%',
          '--env-position-y': 'top 14%',
          opacity: 0.42,
        })}
      />

      <div
        className="env-layer env-cloud-near env-motion"
        style={createMotionLayerStyle(ENV_ASSETS.cloudNear, '45s', {
          '--env-size': 'auto 52%',
          '--env-position-y': 'top 2%',
          opacity: 0.36,
        })}
      />

      <div
        className="env-layer env-ground-base env-motion"
        style={createMotionLayerStyle(ENV_ASSETS.groundBase, '28s', {
          '--env-size': 'auto 34%',
          '--env-position-y': 'bottom 0',
          opacity: 0.96,
        })}
      />

      <div
        className="env-layer env-ground-detail env-motion"
        style={createMotionLayerStyle(ENV_ASSETS.groundDetail, '22s', {
          '--env-size': 'auto 30%',
          '--env-position-y': 'bottom 0',
          opacity: 0.82,
        })}
      />

      <div
        className="env-layer env-shadow"
        style={{ backgroundImage: `url("${ENV_ASSETS.shadow}")` }}
      />

      <div className="env-layer env-readability" />
    </div>
  );
};
