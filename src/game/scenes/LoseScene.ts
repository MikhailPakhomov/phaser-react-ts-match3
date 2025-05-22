import { LevelConfig } from "./../levels/levelConfig";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";
import { LevelConfig } from "../levels/levelConfig";

const dpr = window.devicePixelRatio || 1;
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
        this.sound.play("lose");
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        this.cameras.main.fadeIn(500);
        this.step = 0;

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const rays = this.add.sprite(centerX, centerY - 120 * dpr, "win_bg");
        
        rays.setOrigin(0.5);
        rays.setScale(0.333 * dpr);

        this.tweens.add({
            targets: rays,
            alpha: 0.5,
            duration: 2000,
            ease: "Power1",
        });

        this.tweens.add({
            targets: rays,
            angle: 360,
            duration: 35000,
            ease: "Linear",
            repeat: -1,
        });

        this.tweens.add({
            targets: rays,
            scale: { from: 0.333*dpr, to: 0.444*dpr },
            duration: 2000,
            yoyo: true,
            ease: "Sine.easeInOut",
            repeat: -1,
        });

        const sadMobile = this.add.sprite(centerX, centerY - 130*dpr, "sad_mobile");
        sadMobile.setScale(0);

        this.tweens.add({
            targets: sadMobile,
            scale: 0.333*dpr,
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
            .text(centerX, centerY + 40*dpr, "Почти получилось!", {
                font: `800 ${28*dpr}px Nunito`,
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        this.add
            .text(
                centerX,
                centerY + 90*dpr,
                `Выбери другой уровень или попробуй снова`,
                {
                    font: `600 ${18*dpr}px Nunito`,
                    color: "#ffffff",
                    align: "center",
                    wordWrap: { width: 276*dpr, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        this.replayButton = this.add
            .image(centerX, centerY + 200*dpr, "replay_btn")
            .setOrigin(0.5)
            .setDisplaySize(176*dpr, 48*dpr)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.sound.add("click").play();
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
            .image(centerX, centerY + 250*dpr, "main_menu_btn")
            .setOrigin(0.5)
            .setDisplaySize(176*dpr, 48*dpr)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.sound.add("click").play();
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
