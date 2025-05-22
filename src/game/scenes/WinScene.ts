import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";

const dpr = window.devicePixelRatio || 1;
export class WinScene extends Scene {
    private step: number = 0;
    private continueButton!: Phaser.GameObjects.Text;
    private levelId!: number;
    private difficult!: string;
    private tileSprite!: Phaser.GameObjects.Sprite;
    private backPiece!: Phaser.GameObjects.Image;

    private isFinal!: boolean;

    constructor() {
        super("WinScene");
    }

    init(data: { levelId: number; difficult: string; isFinal: boolean }) {
        this.levelId = data.levelId;
        this.difficult = data.difficult;
        this.isFinal = data.isFinal;
    }

    create() {
        setTimeout(() => {
            this.sound.add("win").play();
        }, 500);
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        this.cameras.main.fadeIn(500);
        this.step = 0;

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const rays = this.add.sprite(centerX, centerY - 120*dpr, "win_bg");
        rays.setScale(0.333 * dpr);
        rays.setAlpha(0.9);
        rays.setOrigin(0.5);

        this.tweens.add({
            targets: rays,
            alpha: 0.8,
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

        if (this.isFinal) {
            this.showPromocode(centerX, centerY, rays, "YOTA2025");
            return;
        }

        this.showLevelTile(centerX, centerY);

        this.add
            .text(centerX, centerY + 80*dpr, "Поздравляем!", {
                font: `800 ${28*dpr}px Nunito`,
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        this.add
            .text(
                centerX,
                centerY + 120*dpr,
                `Уровень ${this.levelId} пройден, вы открыли`,
                {
                    font: `600 ${18*dpr}px Nunito`,
                    color: "#ffffff",
                }
            )
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);
        this.add
            .text(centerX + 10*dpr, centerY + 140*dpr, `один фрагмент пазла `, {
                font: `600 ${18*dpr}px Nunito`,
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        this.continueButton = this.add
            .image(centerX, centerY + 250*dpr, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176*dpr, 48*dpr)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.sound.add("click").play();
                this.nextStep();
            });

        EventBus.emit("current-scene-ready", this);
    }

    private nextStep() {
        if (this.isFinal) {
            window.localStorage.setItem("gameOver", JSON.stringify(true));
            this.scene.stop("WinScene");
            this.scene.start("MainMenu");
            return;
        } else {
            this.scene.stop("WinScene");
            this.scene.start("MainMenu", {
                revealPiece: this.levelId,
            });
        }
    }

    private showLevelTile(centerX: number, centerY: number) {
        const tileSprite = this.add.sprite(0, 0, this.difficult);
        tileSprite.setScale(1*dpr);
        tileSprite.setOrigin(0.5);

        const levelTextColor: ILevelTextColor = {
            easy: "#00AEEF",
            medium: "#202020",
            hard: "#FFFFFF",
        };

        const levelText = this.add
            .text(0, 0, `${this.levelId}`, {
                font: `800 ${112*dpr}px Nunito`,
                color: levelTextColor[this.difficult],
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        const tileContainer = this.add.container(centerX, centerY - 100*dpr, [
            tileSprite,
            levelText,
        ]);
        this.tileSprite = tileContainer;
        tileContainer.setScale(0);
        tileContainer.setAngle(0);

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
                            centerY - 100*dpr,
                            `puzzle_${this.levelId}`
                        );

                        this.backPiece.setOrigin(0.5);
                        this.backPiece.setScale(0, 1*dpr);
                        this.backPiece.setVisible(true);

                        this.tweens.add({
                            targets: this.backPiece,
                            scaleX: 1*dpr,
                            duration: 300,
                            ease: "Cubic.easeOut",
                        });
                    },
                });
            },
        });
    }
    private showPromocode(
        centerX: number,
        centerY: number,
        rays: Phaser.GameObjects.Sprite,
        code?: string
    ) {
        rays.setPosition(centerX, centerY - 160*dpr)
            .setAlpha(0.9)
            .setOrigin(0.5);

        const gift = this.add.sprite(centerX - 60*dpr, centerY - 200*dpr, "gift");
        gift.setScale(0);

        this.tweens.add({
            targets: gift,
            scale: 0.333*dpr,
            duration: 1000,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                const promo = this.add.sprite(
                    centerX + 30*dpr,
                    centerY - 130*dpr,
                    "promo"
                );
                promo.setScale(0);

                this.tweens.add({
                    targets: promo,
                    scale: 0.333*dpr,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                });

                this.tweens.add({
                    targets: promo,
                    angle: { from: 5, to: -5 },
                    duration: 600,
                    ease: "Sine.easeInOut",
                    yoyo: true,
                    repeat: -1,
                });

                const energy1 = this.add.sprite(
                    centerX + 55*dpr,
                    centerY - 250*dpr,
                    "energy"
                );
                const energy2 = this.add.sprite(
                    centerX - 85*dpr,
                    centerY - 80*dpr,
                    "energy"
                );
                const energy3 = this.add.sprite(
                    centerX + 85*dpr,
                    centerY - 70*dpr,
                    "energy"
                );
                energy1.setScale(0);
                energy2.setScale(0);
                energy3.setScale(0);

                energy1.setAngle(20);
                energy2.setAngle(-20);
                energy3.setAngle(20);

                this.tweens.add({
                    targets: energy1,
                    scale: 0.29*dpr,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.tweens.add({
                            targets: energy1,
                            scale: { from: 0.29*dpr, to: 0.44*dpr },
                            angle: { from: 20, to: 40 },
                            repeat: -1,
                            yoyo: true,
                            duration: 2000,
                            ease: "Cubic.easeInOut",
                        });
                    },
                });
                this.tweens.add({
                    targets: energy2,
                    scale: 0.25*dpr,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.tweens.add({
                            targets: energy2,
                            scale: { from: 0.25*dpr, to: 0.333*dpr },
                            angle: { from: -20, to: -40 },
                            duration: 2000,
                            repeat: -1,
                            yoyo: true,
                            ease: "Cubic.easeInOut",
                        });
                    },
                });
                this.tweens.add({
                    targets: energy3,
                    scale: 0.18*dpr,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.tweens.add({
                            targets: energy3,
                            scale: { from: 0.18*dpr, to: 0.28*dpr },
                            angle: { from: 20, to: 40 },
                            duration: 2000,
                            repeat: -1,
                            yoyo: true,
                            ease: "Cubic.easeInOut",
                        });
                    },
                });
            },
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
            .text(centerX, centerY + 10*dpr, "Победа!", {
                font: `800 ${28*dpr}px Nunito`,
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        this.add
            .text(
                centerX,
                centerY + 55*dpr,
                "Получи крутой промокод за полное прохождение игры",
                {
                    font: `600 ${18*dpr}px Nunito`,
                    color: "#ffffff",
                    align: "center",
                    wordWrap: { width: 278*dpr },
                }
            )
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        const copyBg = this.add.image(0, 0, "copy_bg");
        copyBg.setDisplaySize(278*dpr, 68*dpr);
        copyBg.setOrigin(0.5);

        const copyButton = this.add.image(110*dpr, 0, "copy_btn");
        copyButton.setDisplaySize(28*dpr, 28*dpr);
        copyButton.setOrigin(0.5);

        const copyText = this.add.text(-50*dpr, 10*dpr, "Скопировать промокод", {
            font: `600 ${12*dpr}px Nunito`,
            color: "#0083C4",
        });
        copyText.setOrigin(0.5);
        copyText.setResolution(dpr < 2 ? 2 : dpr);

        const promoText = this.add
            .text(-65*dpr, -10*dpr, code, {
                font: `800 ${20*dpr}px Nunito`,
                color: "#0083C4",
            })
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        const copyContainer = this.add.container(centerX, centerY + 120*dpr, [
            copyBg,
            copyButton,
            copyText,
            promoText,
        ]);

        copyContainer.setDisplaySize(278*dpr, 68*dpr);
        copyContainer.setScale(1);

        copyContainer
            .setInteractive(
                new Phaser.Geom.Rectangle(-140*dpr, -35*dpr, 278*dpr, 68*dpr),
                Phaser.Geom.Rectangle.Contains
            )
            .on("pointerover", () => this.input.setDefaultCursor("pointer"))
            .on("pointerout", () => this.input.setDefaultCursor("default"))
            .on("pointerdown", () => {
                navigator.clipboard
                    .writeText(code)
                    .then(() => {
                        console.log("Скопировано:", code);
                        copyText.setText("Скопировано");
                        copyText.setPosition(-75*dpr, 10*dpr);
                        copyText.setOrigin(0.5);

                        setTimeout(() => {
                            copyText.setText("Скопировать промокод");
                            copyText.setPosition(-50*dpr, 10*dpr);
                        }, 3000);
                    })
                    .catch((err) => {
                        console.error("Ошибка копирования:", err);
                        copyText.setText("Ошибка ❌");
                    });
            });

        const showInfoText = this.add.text(
            this.cameras.main.centerX - 130*dpr,
            this.cameras.main.centerY + 160*dpr,
            "Инструкция по активации промокода",
            {
                font: `700 ${14*dpr}px Nunito`,
                color: "#ffffff",
                align: "center",
            }
        );
        showInfoText.setInteractive({ useHandCursor: true });
        showInfoText.setResolution(dpr < 2 ? 2 : dpr);
        showInfoText.on("pointerdown", () => {
            this.scene.pause("WinScene");
            this.scene.start("MainMenu");
            this.scene.start("PromoInfo");
        });

        const showInfoTextBounds = showInfoText.getBounds();
        const underline = this.add.graphics();
        underline.lineStyle(1, 0xffffff, 1);
        underline.beginPath();
        underline.moveTo(
            showInfoTextBounds.left,
            showInfoTextBounds.bottom + 1
        );
        underline.lineTo(
            showInfoTextBounds.right,
            showInfoTextBounds.bottom + 1
        );
        underline.strokePath();

        this.continueButton = this.add
            .image(centerX, centerY + 220*dpr, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176*dpr, 48*dpr)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.nextStep());
    }
}
