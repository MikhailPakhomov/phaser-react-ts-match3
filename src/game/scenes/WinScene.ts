import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";

export class WinScene extends Scene {
    private step: number = 0;
    private continueButton!: Phaser.GameObjects.Text;
    private levelId!: number;
    private difficult!: string;
    private tileSprite!: Phaser.GameObjects.Sprite;
    private backPiece!: Phaser.GameObjects.Image;

    constructor() {
        super("WinScene");
    }

    init(data: { levelId: number; difficult: string }) {
        this.levelId = data.levelId;
        this.difficult = data.difficult;
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
        // const gift = this.add.sprite(centerX, centerY - 130, "gift");
        // gift.setScale(0);

        // this.tweens.add({
        //     targets: gift,
        //     scale: 0.3,
        //     duration: 1000,
        //     ease: "Cubic.easeInOut",
        // });

        // this.tweens.add({
        //     targets: gift,
        //     angle: { from: -5, to: 5 },
        //     duration: 600,
        //     ease: "Sine.easeInOut",
        //     yoyo: true,
        //     repeat: -1,
        // });
        this.showLevelTile(centerX, centerY);

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
            .on("pointerdown", () => this.nextStep());

        EventBus.emit("current-scene-ready", this);
    }

    private nextStep() {
        // this.tweens.add({
        //     targets: gift,
        //     scale: 0,
        //     duration: 700,
        //     ease: "Cubic.easeInOut",
        //     onComplete: () => {
        //         gift.destroy();
        //         this.continueButton.setVisible(false);
        //         this.showLevelTile();
        //     },
        // });
        this.scene.stop("WinScene");
        this.scene.start("MainMenu", {
            revealPiece: this.levelId,
        });
    }

    private showLevelTile(centerX: number, centerY: number) {
        // 🔢 Плитка с номером уровня
        const tileSprite = this.add.sprite(0, 0, this.difficult);
        tileSprite.setDisplaySize(172, 192);
        tileSprite.setOrigin(0.5);

        const levelTextColor: ILevelTextColor = {
            easy: "#00AEEF",
            medium: "#202020",
            hard: "#FFFFFF",
        };

        const levelText = this.add
            .text(0, 0, `${this.levelId}`, {
                font: "800 112px Nunito",
                color: levelTextColor[this.difficult],
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
        tileContainer.setAngle(0);

        // 🌟 Плавное появление и вращение
        this.tweens.add({
            targets: tileContainer,
            scale: 1,
            angle: 720,
            duration: 1800,
            delay: 300,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                this.continueButton.setVisible(true);

                // 🔁 Разворот плитки и показ картинки-пазла
                this.tweens.add({
                    targets: tileContainer,
                    scaleX: 0,
                    duration: 300,
                    ease: "Cubic.easeIn",
                    onComplete: () => {
                        tileContainer.setVisible(false);

                        this.backPiece = this.add.image(
                            centerX,
                            centerY - 100,
                            `puzzle_${this.levelId}`
                        );
                        this.backPiece.setDisplaySize(172, 192);
                        this.backPiece.setOrigin(0.5);
                        this.backPiece.setScale(0, 1);
                        this.backPiece.setVisible(true);

                        this.tweens.add({
                            targets: this.backPiece,
                            scaleX: 1,
                            duration: 300,
                            ease: "Cubic.easeOut",
                        });
                    },
                });
            },
        });
    }
}
