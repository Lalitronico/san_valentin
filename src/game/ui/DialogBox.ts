import Phaser from 'phaser';
import { COLORS, GAME_H, GAME_W } from '../constants';
import { playTypeSound } from '../systems/audio';

type DialogItem = {
  speaker: string;
  text: string;
};

export class DialogBox {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private msgText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text;
  private queue: DialogItem[] = [];
  private active = false;
  private charTimer?: Phaser.Time.TimerEvent;
  private currentFull = '';
  private currentIndex = 0;
  private onDone?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.body = scene
      .add.rectangle(GAME_W / 2, GAME_H - 66, GAME_W - 24, 116, COLORS.uiBg)
      .setStrokeStyle(3, COLORS.uiEdge);
    this.nameText = scene.add.text(20, GAME_H - 116, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '10px',
      color: '#ffe39f'
    });
    this.msgText = scene.add.text(20, GAME_H - 92, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '10px',
      color: COLORS.text,
      wordWrap: { width: GAME_W - 42 }
    });
    this.hintText = scene.add.text(GAME_W - 170, GAME_H - 30, 'ENTER / E', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#bdd7ff'
    });

    this.root = scene.add.container(0, 0, [this.body, this.nameText, this.msgText, this.hintText]);
    this.root.setDepth(50);
    this.root.setVisible(false);
  }

  isActive(): boolean {
    return this.active;
  }

  start(items: DialogItem[], onDone?: () => void): void {
    this.queue = [...items];
    this.active = true;
    this.onDone = onDone;
    this.root.setVisible(true);
    this.showNext();
  }

  advance(): void {
    if (!this.active) return;
    if (this.currentIndex < this.currentFull.length) {
      this.currentIndex = this.currentFull.length;
      this.msgText.setText(this.currentFull);
      this.charTimer?.remove();
      return;
    }
    this.showNext();
  }

  hide(): void {
    this.charTimer?.remove();
    this.root.setVisible(false);
    this.active = false;
  }

  private showNext(): void {
    const next = this.queue.shift();
    if (!next) {
      this.hide();
      this.onDone?.();
      return;
    }

    this.nameText.setText(next.speaker);
    this.currentFull = next.text;
    this.currentIndex = 0;
    this.msgText.setText('');

    this.charTimer?.remove();
    this.charTimer = this.scene.time.addEvent({
      delay: 18,
      callback: () => {
        this.currentIndex += 1;
        const chunk = this.currentFull.slice(0, this.currentIndex);
        this.msgText.setText(chunk);
        if (this.currentIndex % 2 === 0) playTypeSound();
        if (this.currentIndex >= this.currentFull.length) {
          this.charTimer?.remove();
        }
      },
      repeat: Math.max(this.currentFull.length - 1, 0)
    });
  }
}
