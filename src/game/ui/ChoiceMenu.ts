import Phaser from 'phaser';
import { COLORS, GAME_H, GAME_W } from '../constants';
import { playConfirmSound } from '../systems/audio';

export type ChoiceOption = {
  label: string;
  value: string;
};

export class ChoiceMenu {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private labels: Phaser.GameObjects.Text[] = [];
  private index = 0;
  private active = false;
  private onPick?: (value: string) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const bg = scene
      .add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W - 120, 170, COLORS.uiBg)
      .setStrokeStyle(3, COLORS.uiEdge);
    this.root = scene.add.container(0, 0, [bg]).setDepth(70).setVisible(false);
  }

  isActive(): boolean {
    return this.active;
  }

  open(options: ChoiceOption[], onPick: (value: string) => void): void {
    this.clearLabels();
    this.onPick = onPick;
    this.active = true;
    this.root.setVisible(true);
    this.index = 0;

    options.forEach((opt, i) => {
      const t = this.scene.add.text(80, GAME_H / 2 - 44 + i * 30, `> ${opt.label}`, {
        fontFamily: 'Press Start 2P',
        fontSize: '11px',
        color: '#dbe8ff'
      });
      this.root.add(t);
      this.labels.push(t);
      t.setData('value', opt.value);
    });

    this.refreshVisuals();
  }

  move(dir: 1 | -1): void {
    if (!this.active) return;
    this.index = Phaser.Math.Wrap(this.index + dir, 0, this.labels.length);
    this.refreshVisuals();
  }

  confirm(): void {
    if (!this.active) return;
    const choice = this.labels[this.index].getData('value') as string;
    playConfirmSound();
    this.close();
    this.onPick?.(choice);
  }

  close(): void {
    this.clearLabels();
    this.root.setVisible(false);
    this.active = false;
  }

  private refreshVisuals(): void {
    this.labels.forEach((t, i) => {
      const base = t.text.replace(/^> |^  /, '');
      t.setText(`${i === this.index ? '>' : ' '} ${base}`);
      t.setColor(i === this.index ? '#ffe39f' : '#dbe8ff');
    });
  }

  private clearLabels(): void {
    this.labels.forEach((t) => t.destroy());
    this.labels = [];
  }
}
