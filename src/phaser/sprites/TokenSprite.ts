import Phaser from 'phaser';
import type { Player } from '../../game-engine/types/game';
import { THEME } from '../../ui/theme/tokens';

const CHARACTER_CONFIGS: Record<string, { key: string, path: string, frameWidth: number, frameHeight: number }> = {
  ghost: { 
    key: 'ghost_character', 
    path: '/assets/characters/ghost_character.png',
    frameWidth: 251,
    frameHeight: 251
  },
  cat: {
    key: 'cat_character',
    path: '/assets/characters/charming-chibi-cat.png',
    frameWidth: 251,
    frameHeight: 251
  },
  magician: {
    key: 'magician_character',
    path: '/assets/characters/chibi-cat-magican.png',
    frameWidth: 251,
    frameHeight: 251
  }
};

const CHARACTER_MAP: Record<string, string> = {
  ghost: CHARACTER_CONFIGS.ghost.key,
  cat: CHARACTER_CONFIGS.cat.key,
  magician: CHARACTER_CONFIGS.magician.key,
};

// Tăng / giảm số này nếu nhân vật quá to hoặc quá nhỏ trên bàn cờ
const TOKEN_SPRITE_SCALE_MULTIPLIER = 3.12;

type TokenAnimationState = 'idle' | 'run' | 'win' | 'sad';

function getAnimationKey(charId: string, state: TokenAnimationState) {
  const textureKey = CHARACTER_MAP[charId] || CHARACTER_MAP.ghost;
  return `${textureKey}_${state}`;
}

export function preloadTokenSpriteAssets(scene: Phaser.Scene) {
  Object.values(CHARACTER_CONFIGS).forEach(config => {
    scene.load.spritesheet(
      config.key,
      config.path,
      {
        frameWidth: config.frameWidth,
        frameHeight: config.frameHeight,
      }
    );
  });
}

export function createTokenSpriteAnimations(scene: Phaser.Scene) {
  Object.values(CHARACTER_CONFIGS).forEach(config => {
    const key = config.key;
    
    if (!scene.anims.exists(`${key}_idle`)) {
      scene.anims.create({
        key: `${key}_idle`,
        frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(`${key}_run`)) {
      scene.anims.create({
        key: `${key}_run`,
        frames: scene.anims.generateFrameNumbers(key, { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(`${key}_win`)) {
      scene.anims.create({
        key: `${key}_win`,
        frames: scene.anims.generateFrameNumbers(key, { start: 8, end: 11 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(`${key}_sad`)) {
      scene.anims.create({
        key: `${key}_sad`,
        frames: scene.anims.generateFrameNumbers(key, { start: 12, end: 15 }),
        frameRate: 6,
        repeat: -1,
      });
    }
  });
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
    const charId = player.avatarUrl || 'ghost';
    const textureKey = CHARACTER_MAP[charId] || CHARACTER_MAP.ghost;

    if (scene.textures.exists(textureKey)) {
      createTokenSpriteAnimations(scene);

      this.sprite = scene.add.sprite(0, 0, textureKey, 0);
      this.sprite.setOrigin(0.5);

      // Vì mỗi frame có khá nhiều khoảng trắng,
      // nên displaySize cần lớn hơn token gốc một chút.
      const displaySize = size * TOKEN_SPRITE_SCALE_MULTIPLIER;
      this.sprite.setDisplaySize(displaySize, displaySize);

      this.sprite.play(getAnimationKey(charId, 'idle'));

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

    const charId = this.charId();
    const key = getAnimationKey(charId, state);

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

  setWinTemporarily(duration: number = 2000) {
    if (this.isBankrupt || this.isJailed) return;
    this.playAnimation('win');
    this.scene.time.delayedCall(duration, () => {
      // Chỉ quay lại idle nếu vẫn đang trong trạng thái bình thường
      if (!this.isBankrupt && !this.isJailed && this.scene) {
        this.playAnimation('idle');
      }
    });
  }

  setSadTemporarily(duration: number = 2000) {
    if (this.isBankrupt || this.isJailed) return;
    this.playAnimation('sad');
    this.scene.time.delayedCall(duration, () => {
      if (!this.isBankrupt && !this.isJailed && this.scene) {
        this.playAnimation('idle');
      }
    });
  }

  private charId(): string {
    return this.sprite?.texture.key.replace('_character', '') || 'ghost';
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