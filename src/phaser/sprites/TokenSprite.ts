import Phaser from 'phaser';
import type { Player } from '../../game-engine/types/game';
import { THEME } from '../../ui/theme/tokens';

const GHOST_TEXTURE_KEY = 'ghost_character';

const TOKEN_SPRITE_FRAME_WIDTH = 251;
const TOKEN_SPRITE_FRAME_HEIGHT = 251;

// Tăng / giảm số này nếu nhân vật quá to hoặc quá nhỏ trên bàn cờ
const TOKEN_SPRITE_SCALE_MULTIPLIER = 2.6;

type TokenAnimationState = 'idle' | 'run' | 'win' | 'sad';

function getAnimationKey(state: TokenAnimationState) {
  return `${GHOST_TEXTURE_KEY}_${state}`;
}

export function preloadTokenSpriteAssets(scene: Phaser.Scene) {
  scene.load.spritesheet(
    GHOST_TEXTURE_KEY,
    '/assets/characters/ghost_character.png',
    {
      frameWidth: TOKEN_SPRITE_FRAME_WIDTH,
      frameHeight: TOKEN_SPRITE_FRAME_HEIGHT,
    }
  );
}

export function createTokenSpriteAnimations(scene: Phaser.Scene) {
  if (!scene.anims.exists(getAnimationKey('idle'))) {
    scene.anims.create({
      key: getAnimationKey('idle'),
      frames: scene.anims.generateFrameNumbers(GHOST_TEXTURE_KEY, {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(getAnimationKey('run'))) {
    scene.anims.create({
      key: getAnimationKey('run'),
      frames: scene.anims.generateFrameNumbers(GHOST_TEXTURE_KEY, {
        start: 4,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(getAnimationKey('win'))) {
    scene.anims.create({
      key: getAnimationKey('win'),
      frames: scene.anims.generateFrameNumbers(GHOST_TEXTURE_KEY, {
        start: 8,
        end: 11,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(getAnimationKey('sad'))) {
    scene.anims.create({
      key: getAnimationKey('sad'),
      frames: scene.anims.generateFrameNumbers(GHOST_TEXTURE_KEY, {
        start: 12,
        end: 15,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }
}

export class TokenSprite extends Phaser.GameObjects.Container {
  public playerId: string;

  private visualContainer: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Ellipse;
  private ring: Phaser.GameObjects.Arc;
  private glow: Phaser.GameObjects.Arc;
  private glowTween: Phaser.Tweens.Tween;

  private sprite?: Phaser.GameObjects.Sprite;

  private fallbackCircle?: Phaser.GameObjects.Arc;
  private fallbackText?: Phaser.GameObjects.Text;

  private jailIcon?: Phaser.GameObjects.Text;
  private bankruptMarker?: Phaser.GameObjects.Text;

  private isBankrupt = false;
  private isJailed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y);

    this.playerId = player.id;

    const color = Phaser.Display.Color.HexStringToColor(player.color).color;
    const size = THEME.typography.token.size;

    // 1. Shadow
    this.shadow = scene.add.ellipse(
      0,
      8,
      size * 1.3,
      size * 0.45,
      THEME.effects.tokenShadow.color,
      THEME.effects.tokenShadow.alpha
    );
    this.add(this.shadow);

    // 2. Visual container
    this.visualContainer = scene.add.container(0, 0);
    this.add(this.visualContainer);

    // 3. Glow khi đang là lượt hiện tại
    this.glow = scene.add.arc(
      0,
      0,
      size * 1.5,
      0,
      360,
      false,
      color,
      THEME.effects.tokenGlowAlpha
    );
    this.glow.setVisible(false);
    this.visualContainer.add(this.glow);

    // 4. Nhân vật 2D
    if (scene.textures.exists(GHOST_TEXTURE_KEY)) {
      createTokenSpriteAnimations(scene);

      this.sprite = scene.add.sprite(0, 0, GHOST_TEXTURE_KEY, 0);
      this.sprite.setOrigin(0.5);

      // Vì mỗi frame 512x512 có khá nhiều khoảng trắng,
      // nên displaySize cần lớn hơn token gốc một chút.
      const displaySize = size * TOKEN_SPRITE_SCALE_MULTIPLIER;
      this.sprite.setDisplaySize(displaySize, displaySize);

      this.sprite.play(getAnimationKey('idle'));

      this.visualContainer.add(this.sprite);
    } else {
      // Fallback nếu spritesheet chưa được preload
      this.fallbackCircle = scene.add.arc(
        0,
        0,
        size / 2,
        0,
        360,
        false,
        color
      );
      this.visualContainer.add(this.fallbackCircle);

      const highlight = scene.add.arc(
        -size / 4,
        -size / 4,
        size / 4,
        0,
        360,
        false,
        0xffffff,
        0.3
      );
      this.visualContainer.add(highlight);

      this.fallbackText = scene.add.text(
        0,
        0,
        player.name.charAt(0).toUpperCase(),
        {
          fontSize: THEME.typography.token.fontSize,
          color: '#ffffff',
          fontStyle: '900',
          stroke: '#000000',
          strokeThickness: 1,
        }
      ).setOrigin(0.5);

      this.visualContainer.add(this.fallbackText);
    }

    // 5. Ring chọn player
    this.ring = scene.add.arc(
      0,
      0,
      size / 2 + 6,
      0,
      360,
      false,
      0xffffff,
      0
    );
    this.ring.setStrokeStyle(0);
    this.visualContainer.add(this.ring);

    // 6. Glow tween
    this.glowTween = scene.tweens.add({
      targets: this.glow,
      scale: 1.4,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Quad.easeOut',
    });
    this.glowTween.pause();

    scene.add.existing(this);

    // 7. Floating animation
    scene.tweens.add({
      targets: this.visualContainer,
      y: -8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 8. Shadow sync
    scene.tweens.add({
      targets: this.shadow,
      scaleX: 0.8,
      scaleY: 0.8,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playAnimation(state: TokenAnimationState) {
    if (!this.sprite) return;

    const key = getAnimationKey(state);

    if (this.scene.anims.exists(key)) {
      this.sprite.play(key, true);
    }
  }

  setSelected(selected: boolean) {
    if (selected) {
      this.glow.setVisible(true);
      this.glow.setAlpha(THEME.effects.tokenGlowAlpha);
      this.glow.setScale(1);

      this.glowTween.resume();

      this.ring.setStrokeStyle(4, 0xffffff, 1);
      this.ring.setAlpha(1);
    } else {
      this.glow.setVisible(false);
      this.glowTween.pause();

      this.ring.setStrokeStyle(0);
      this.ring.setScale(1);
      this.ring.setAlpha(1);
    }
  }

  setJailed(jailed: boolean) {
    this.isJailed = jailed;

    if (jailed) {
      this.playAnimation('sad');

      if (!this.jailIcon) {
        this.jailIcon = this.scene.add.text(14, -16, '⛓️', {
          fontSize: '16px',
        }).setOrigin(0.5);

        this.add(this.jailIcon);
      }

      this.jailIcon.setVisible(true);
    } else {
      this.jailIcon?.setVisible(false);

      if (!this.isBankrupt) {
        this.playAnimation('idle');
      }
    }
  }

  setBankrupt(bankrupt: boolean) {
    this.isBankrupt = bankrupt;

    if (bankrupt) {
      this.playAnimation('sad');

      this.visualContainer.setAlpha(0.45);
      this.visualContainer.setScale(0.85);

      if (!this.bankruptMarker) {
        this.bankruptMarker = this.scene.add.text(0, 0, '❌', {
          fontSize: '22px',
        }).setOrigin(0.5).setAlpha(0.75);

        this.add(this.bankruptMarker);
      }

      this.bankruptMarker.setVisible(true);
    } else {
      this.visualContainer.setAlpha(1);
      this.visualContainer.setScale(1);

      this.bankruptMarker?.setVisible(false);

      if (!this.isJailed) {
        this.playAnimation('idle');
      }
    }
  }

  setWin() {
    if (!this.isBankrupt && !this.isJailed) {
      this.playAnimation('win');
    }
  }

  setIdle() {
    if (!this.isBankrupt && !this.isJailed) {
      this.playAnimation('idle');
    }
  }

  moveToPosition(x: number, y: number, duration: number = 500) {
    if (!this.scene) return;

    if (!this.isBankrupt && !this.isJailed) {
      this.playAnimation('run');
      if (this.sprite && x !== this.x) {
        this.sprite.setFlipX(x < this.x);
      }
    }

    this.scene.tweens.killTweensOf(this);

    this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration,
      ease: 'Power2',
      onComplete: () => {
        if (!this.isBankrupt && !this.isJailed) {
          this.playAnimation('idle');
        }
      },
    });
  }

  async moveAlongPath(
    path: { x: number; y: number }[],
    durationPerTile: number = 250
  ) {
    if (path.length === 0) return;
    if (!this.scene) return;

    if (!this.isBankrupt && !this.isJailed) {
      this.playAnimation('run');
    }

    this.scene.tweens.killTweensOf(this);

    for (const point of path) {
      if (!this.scene) return;

      await new Promise<void>((resolve) => {
        if (!this.scene) {
          resolve();
          return;
        }

        if (this.sprite && point.x !== this.x) {
          this.sprite.setFlipX(point.x < this.x);
        }

        this.scene.tweens.add({
          targets: this,
          x: point.x,
          y: point.y,
          duration: durationPerTile,
          ease: 'Sine.easeInOut',
          onComplete: () => resolve(),
        });
      });
    }

    if (!this.isBankrupt && !this.isJailed) {
      this.playAnimation('idle');
    }
  }
}