import { Scene } from "phaser";
import { EventBus } from "../EventBus";

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

        const rays = this.add.image(centerX, centerY, "win_bg"); // фон с лучами
        this.tweens.add({
            targets: rays,
            angle: 360,
            duration: 3000,
            ease: "Cubic.easeInOut",
            yoyo: true,
        });
        rays.setAlpha(0.8);

        // 🧧 Шаг 1 — Подарок
        const gift = this.add.image(centerX, centerY - 80, "gift");
        gift.setScale(0);

        this.tweens.add({
            targets: gift,
            scale:0.2,
            duration: 1000,
            ease: "Cubic.easeInOut",

        });

        this.add
            .text(centerX, centerY + 80, "Поздравляем!", {
                fontFamily: "Nunito",
                fontSize: "28px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        this.continueButton = this.add
            .text(centerX, centerY + 150, "Продолжить", {
                fontFamily: "Nunito",
                fontSize: "20px",
                backgroundColor: "#34c7fd",
                color: "#ffffff",
                padding: { x: 16, y: 8 },
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.nextStep(gift));

        EventBus.emit("current-scene-ready", this);
    }

    private nextStep(gift: Phaser.GameObjects.Image) {
        this.step++;

        if (this.step === 1) {
            gift.destroy();
            this.continueButton.setVisible(false);

            this.showLevelTile();
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
                fontFamily: "Nunito",
                fontSize: "32px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(2);

        // 📦 Контейнер с плиткой и номером
        const tileContainer = this.add.container(centerX, centerY - 40, [
            tileSprite,
            levelText,
        ]);
        this.tileSprite = tileContainer;

        // 🎯 Скрытый фрагмент картинки
        this.backPiece = this.add.image(
            centerX,
            centerY - 40,
            `puzzle_${this.levelId}`
        );
        this.backPiece.setDisplaySize(172, 192);
        this.backPiece.setOrigin(0.5);
        this.backPiece.setVisible(false);

        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRoundedRect(0, 0, 172, 192, 20);
        maskShape.setPosition(centerX - 86, centerY - 136); // выравниваем
        const mask = maskShape.createGeometryMask();
        this.backPiece.setMask(mask);

        // 🔄 Анимация поворота контейнера
        this.tweens.add({
            targets: tileContainer,
            angle: 360,
            duration: 3000,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                tileContainer.setVisible(false);
                this.backPiece.setVisible(true);
                this.continueButton.setVisible(true);
            },
        });
    }
}
