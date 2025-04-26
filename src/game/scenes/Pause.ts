import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Pause extends Scene {
    private continueButton!: Phaser.GameObjects.Image;
    cols!: number;
    cellSize!: number;
    offsetX!: number;
    offsetY!: number;
    isSoundOn = true;

    constructor() {
        super("Pause");
    }

    init(data: {
        cols: number;
        cellSize: number;
        offsetX: number;
        offsetY: number;
    }) {
        this.cols = data.cols;
        this.cellSize = data.cellSize;
        this.offsetX = data.offsetX;
        this.offsetY = data.offsetY;
    }

    create() {
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const overlay = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "tutorial_overlay"
        );
        overlay.setDisplaySize(
            this.cameras.main.width + 10,
            this.cameras.main.height + 10
        );
        overlay.setOrigin(0.5);
        overlay.setDepth(100);

        const closeButton = this.add
            .image(
                this.offsetX + this.cellSize * this.cols - 10,
                this.offsetY - 104,
                "close"
            )
            .setOrigin(0.5)
            .setDisplaySize(this.cellSize, this.cellSize)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.scene.stop("Pause");
                this.scene.resume("Game");
            });
        closeButton.setDepth(101);

        const soundButtonTexture = this.isSoundOn ? "sound_off" : "sound_on";
        const soundButton = this.add
            .image(centerX, centerY + 30, soundButtonTexture)
            .setOrigin(0.5)
            .setScale(0.333)
            .setInteractive({ useHandCursor: true })
            .setDepth(102);

        soundButton.on("pointerdown", () => {
            this.isSoundOn = !this.isSoundOn;
            this.sound.mute = !this.isSoundOn;

            if (this.isSoundOn) {
                soundButton.setTexture("sound_off");
            } else {
                soundButton.setTexture("sound_on");
            }
        });

        const gameOverButton = this.add
            .image(centerX, centerY + 90, "gameover_btn")
            .setOrigin(0.5)
            .setScale(0.333)
            .setInteractive({ useHandCursor: true })
            .setDepth(102)
            .on("pointerdown", () => {
                this.scene.stop("Pause");
                this.scene.stop("Game");
                this.scene.start("MainMenu");
            });

        const pauseBg = this.add
            .image(centerX, centerY, "info_bg")
            .setOrigin(0.5)
            .setDepth(101)
            .setDisplaySize(300, 284);

        const pauseTitle = this.add.text(centerX, centerY - 100, "Пауза", {
            font: "800 28px Nunito",
            color: "#ffffff",
        });
        pauseTitle.setOrigin(0.5);
        pauseTitle.setDepth(102);
        pauseTitle.setResolution(2);

        const pauseText = this.add.text(
            centerX,
            centerY - 50,
            "Если завершить игру сейчас, прогресс уровня не сохранится",
            {
                font: "600 16px Nunito",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 248 },
            }
        );
        pauseText.setOrigin(0.5);
        pauseText.setDepth(102);
        pauseText.setResolution(2);

        EventBus.emit("current-scene-ready", this);
    }
}
