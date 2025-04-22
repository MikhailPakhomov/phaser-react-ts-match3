import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";

export class WinScene extends Scene {
    private step: number = 0;
    private continueButton!: Phaser.GameObjects.Text;
    private levelId!: number;
    private tileSprite!: Phaser.GameObjects.Sprite;
    private backPiece!: Phaser.GameObjects.Image;

    constructor() {
        super("WinScene");
    }

    init(data: { levelId: number }) {
        this.levelId = data.levelId;
    }

    create() {
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        this.cameras.main.fadeIn(500);
        this.step = 0;

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const rays = this.add.sprite(centerX, centerY - 120, "win_bg");
        rays.setAlpha(0.9);
        rays.setOrigin(0.5);

        // 🌞 Появление + медленное вращение и пульсация
        this.tweens.add({
            targets: rays,
            alpha: 0.8,
            duration: 2000,
            ease: "Power1",
        });

        // 🌀 Медленное вращение (едва заметное)
        this.tweens.add({
            targets: rays,
            angle: 360,
            duration: 35000,
            ease: "Linear",
            repeat: -1,
        });

        // 💫 Лёгкая пульсация масштаба
        this.tweens.add({
            targets: rays,
            scale: { from: 1, to: 1.2 },
            duration: 2000,
            yoyo: true,
            ease: "Sine.easeInOut",
            repeat: -1,
        });

        // 🧧 Шаг 1 — Подарок
        const gift = this.add.sprite(centerX, centerY - 130, "gift");
        gift.setScale(0);

        this.tweens.add({
            targets: gift,
            scale: 0.3,
            duration: 1000,
            ease: "Cubic.easeInOut",
        });

        this.tweens.add({
            targets: gift,
            angle: { from: -5, to: 5 },
            duration: 600,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        this.add
            .text(centerX, centerY + 80, "Поздравляю!", {
                fontFamily: "Nunito",
                fontSize: "28px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        this.add
            .text(centerX, centerY + 120, `Ты прошел ${this.levelId} уровень`, {
                fontFamily: "Nunito",
                fontSize: "20px",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        this.continueButton = this.add
            .image(centerX, centerY + 250, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.nextStep(gift));

        EventBus.emit("current-scene-ready", this);
    }

    private nextStep(gift: Phaser.GameObjects.Image) {
        this.step++;

        if (this.step === 1) {
            this.tweens.add({
                targets: gift,
                scale: 0,
                duration: 700,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    gift.destroy();
                    this.continueButton.setVisible(false);
                    this.showLevelTile();
                },
            });
        } else if (this.step === 2) {
            this.scene.stop("WinScene");
            
            this.scene.start("MainMenu", {
                revealPiece: this.levelId,
            });
        }
    }

    private showLevelTile() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // 🔢 Плитка с номером уровня
        const tileSprite = this.add.sprite(0, 0, "tile_green");
        tileSprite.setDisplaySize(172, 192);
        tileSprite.setOrigin(0.5);

        const levelText = this.add
            .text(0, 0, `${this.levelId}`, {
                font: "800 112px Nunito",
                color: "#00AEEF",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(2);

        // 📦 Контейнер с плиткой и номером
        const tileContainer = this.add.container(centerX, centerY - 100, [
            tileSprite,
            levelText,
        ]);
        this.tileSprite = tileContainer;
        tileContainer.setScale(0);
        this.tweens.add({
            targets: tileContainer,
            scale: 1,
            duration: 700,
            ease: "Cubic.easeInOut",
        });

        // 🎯 Скрытый фрагмент картинки
        this.backPiece = this.add.image(
            centerX,
            centerY - 100,
            `puzzle_${this.levelId}`
        );
        this.backPiece.setDisplaySize(172, 192);
        this.backPiece.setOrigin(0.5);
        this.backPiece.setVisible(false);

        // 🔄 Анимация поворота контейнера
        this.tweens.add({
            targets: tileContainer,
            delay: 1000,
            angle: 720,
            duration: 1500,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                this.continueButton.setVisible(true);

                this.tweens.add({
                    targets: tileContainer,
                    scaleX: 0,
                    duration: 250,
                    ease: "Cubic.easeIn",
                    onComplete: () => {
                        // Скрываем контейнер с номером уровня
                        tileContainer.setVisible(false);

                        // Показываем картинку-пазл
                        this.backPiece.setScale(0, 1);
                        this.backPiece.setVisible(true);

                        // ⏳ Этап 2: разворот картинки-пазла обратно от 0 до 1
                        this.tweens.add({
                            targets: this.backPiece,
                            scaleX: 1,
                            duration: 250,
                            ease: "Cubic.easeOut",
                        });
                    },
                });
            },
        });
    }
}
