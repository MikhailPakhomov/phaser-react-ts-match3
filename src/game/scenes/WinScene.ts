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
            scale: { from: 1, to: 1.2 },
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
            .text(centerX, centerY + 80, "Поздравляем!", {
                font: "800 28px Nunito",
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setResolution(2);

        this.add
            .text(
                centerX,
                centerY + 120,
                `Уровень ${this.levelId} пройден, вы открыли`,
                {
                    font: "600 18px Nunito",
                    color: "#ffffff",
                }
            )
            .setOrigin(0.5)
            .setResolution(2);
        this.add
            .text(centerX + 10, centerY + 140, `один фрагмент пазла `, {
                font: "600 18px Nunito",
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setResolution(2);

        this.continueButton = this.add
            .image(centerX, centerY + 250, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.nextStep());

        EventBus.emit("current-scene-ready", this);
    }

    private nextStep() {
        if (this.isFinal) {
            this.scene.stop("WinScene");
            this.scene.start("MainMenu", { isShowInfoPromo: true });
            window.localStorage.setItem("gameOver", JSON.stringify(true));
            window.localStorage.setItem("isFinal", JSON.stringify(true));
        } else {
            this.scene.stop("WinScene");
            this.scene.start("MainMenu", {
                revealPiece: this.levelId,
            });
        }
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
    private showPromocode(
        centerX: number,
        centerY: number,
        rays: Phaser.GameObjects.Sprite,
        code?: string
    ) {
        // 🧧 Шаг 1 — Подарок

        rays.setPosition(centerX, centerY - 160)
            .setAlpha(0.9)
            .setOrigin(0.5);

        const gift = this.add.sprite(centerX - 60, centerY - 200, "gift");
        gift.setScale(0);

        this.tweens.add({
            targets: gift,
            scale: 0.3,
            duration: 1000,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                const promo = this.add.sprite(
                    centerX + 30,
                    centerY - 130,
                    "promo"
                );
                promo.setScale(0);

                this.tweens.add({
                    targets: promo,
                    scale: 0.3,
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
                    centerX + 55,
                    centerY - 250,
                    "energy"
                );
                const energy2 = this.add.sprite(
                    centerX - 85,
                    centerY - 80,
                    "energy"
                );
                const energy3 = this.add.sprite(
                    centerX + 85,
                    centerY - 70,
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
                    scale: 0.29,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.tweens.add({
                            targets: energy1,
                            scale: { from: 0.29, to: 0.44 },
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
                    scale: 0.25,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.tweens.add({
                            targets: energy2,
                            scale: { from: 0.25, to: 0.33 },
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
                    scale: 0.18,
                    duration: 1000,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.tweens.add({
                            targets: energy3,
                            scale: { from: 0.18, to: 0.28 },
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
            .text(centerX, centerY + 10, "Победа!", {
                font: "800 28px Nunito",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(2);

        this.add
            .text(
                centerX,
                centerY + 55,
                "Получи крутой промокод за полное прохождение игры",
                {
                    font: "600 18px Nunito",
                    color: "#ffffff",
                    align: "center",
                    wordWrap: { width: 278 },
                }
            )
            .setOrigin(0.5)
            .setResolution(2);

        const copyBg = this.add.image(0, 0, "copy_bg");
        copyBg.setDisplaySize(278, 68);
        copyBg.setOrigin(0.5);

        const copyButton = this.add.image(110, 0, "copy_btn");
        copyButton.setDisplaySize(28, 28);
        copyButton.setOrigin(0.5);

        const copyText = this.add.text(-50, 10, "Скопировать промокод", {
            font: "600 12px Nunito",
            color: "#ffffff",
        });
        copyText.setOrigin(0.5);
        copyText.setResolution(2);

        const promoText = this.add
            .text(-65, -10, code, {
                font: "800 20px Nunito",
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setResolution(2);

        const copyContainer = this.add.container(centerX, centerY + 140, [
            copyBg,
            copyButton,
            copyText,
            promoText,
        ]);

        copyContainer.setDisplaySize(278, 68);
        copyContainer.setScale(1);

        copyContainer
            .setInteractive(
                new Phaser.Geom.Rectangle(-140, -35, 278, 68),
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
                        copyText.setPosition(-75, 10);
                        copyText.setOrigin(0.5);

                        setTimeout(() => {
                            copyText.setText("Скопировать промокод");
                            copyText.setPosition(-50, 10);
                        }, 3000);
                    })
                    .catch((err) => {
                        console.error("Ошибка копирования:", err);
                        copyText.setText("Ошибка ❌");
                    });
            });

        this.continueButton = this.add
            .image(centerX, centerY + 220, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.nextStep());
    }
}
