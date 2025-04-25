import { LevelConfig } from "./../levels/levelConfig";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";
import { LevelConfig } from "../levels/levelConfig";

export class LoseScene extends Scene {
    private step: number = 0;
    private menuButton!: Phaser.GameObjects.Image;
    private replayButton!: Phaser.GameObjects.Image;
    private levelConfig!: LevelConfig;
    private tileSprite!: Phaser.GameObjects.Sprite;
    private backPiece!: Phaser.GameObjects.Image;

    constructor() {
        super("LoseScene");
    }

    init(data: { config: LevelConfig }) {
        this.levelConfig = data.config;
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
        rays.setAlpha(0.7);
        rays.setOrigin(0.5);

        // 🌞 Появление + медленное вращение и пульсация
        this.tweens.add({
            targets: rays,
            alpha: 0.5,
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

        const sadMobile = this.add.sprite(centerX, centerY - 130, "sad_mobile");
        sadMobile.setScale(0);

        this.tweens.add({
            targets: sadMobile,
            scale: 0.35,
            duration: 1000,
            ease: "Cubic.easeInOut",
        });

        this.tweens.add({
            targets: sadMobile,
            angle: { from: -5, to: 5 },
            duration: 600,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        this.add
            .text(centerX, centerY + 40, "Ты проиграл", {
                font: "800 28px Nunito",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(2);

        this.add
            .text(
                centerX,
                centerY + 90,
                `Выбери другой уровень или попробуй снова`,
                {
                    font: "600 18px Nunito",
                    color: "#ffffff",
                    align: "center", // выравнивание
                    wordWrap: { width: 276, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(2);

        // this.continueButton = this.add
        //     .text(centerX, centerY + 200, "Продолжить", {
        //         fontFamily: "Nunito",
        //         fontSize: "18px",
        //         backgroundColor: "#34c7fd",
        //         color: "#ffffff",
        //         padding: { x: 16, y: 8 },
        //     })
        //     .setOrigin(0.5)
        //     .setResolution(2)
        //     .setInteractive({ useHandCursor: true })
        //     .on("pointerdown", () => this.scene.start("MainMenu", {}));

        this.replayButton = this.add
            .image(centerX, centerY + 200, "replay_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.tweens.add({
                    targets: sadMobile,
                    scale: 0,
                    duration: 700,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.scene.stop("LoseScene");
                        this.scene.start("Game", { config: this.levelConfig });
                    },
                });
            });

        this.menuButton = this.add
            .image(centerX, centerY + 250, "main_menu_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.tweens.add({
                    targets: sadMobile,
                    scale: 0,
                    duration: 700,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.scene.stop("LoseScene");
                        this.scene.start("MainMenu", {});
                    },
                });
            });

        EventBus.emit("current-scene-ready", this);
    }
}
