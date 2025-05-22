import { Scene } from "phaser";
import { EventBus } from "../EventBus";

const dpr = window.devicePixelRatio || 1;  
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
                this.cameras.main.centerX + 120*dpr,
                this.cameras.main.centerY - 115*dpr,
                "close_btn"
            )
            .setOrigin(0.5)
            .setScale(0.333*dpr)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.sound.add("click").play();
                this.scene.stop("Pause");
                this.scene.resume("Game");
            });
        closeButton.setDepth(102);

        const soundButtonTexture = this.isSoundOn ? "sound_off" : "sound_on";
        const soundButton = this.add
            .image(centerX, centerY + 30*dpr, soundButtonTexture)
            .setOrigin(0.5)
            .setScale(0.333*dpr)
            .setInteractive({ useHandCursor: true })
            .setDepth(102);

        soundButton.on("pointerdown", () => {
            this.sound.add("click").play();
            this.isSoundOn = !this.isSoundOn;
            this.sound.mute = !this.isSoundOn;

            if (this.isSoundOn) {
                soundButton.setTexture("sound_off");
            } else {
                soundButton.setTexture("sound_on");
            }
        });

        const gameOverButton = this.add
            .image(centerX, centerY + 90*dpr, "gameover_btn")
            .setOrigin(0.5)
            .setScale(0.333*dpr)
            .setInteractive({ useHandCursor: true })
            .setDepth(102)
            .on("pointerdown", () => {
                this.sound.add("click").play();
                this.scene.stop("Pause");
                this.scene.stop("Game");
                this.scene.start("MainMenu", { revealPiece: null });
            });

        const pauseBg = this.add
            .image(centerX, centerY, "info_bg")
            .setOrigin(0.5)
            .setDepth(101)
            .setDisplaySize(300*dpr, 284*dpr);

        const pauseTitle = this.add.text(centerX, centerY - 100*dpr, "Пауза", {
            font: `800 ${28*dpr}px Nunito`,
            color: "#434C5D",
        });
        pauseTitle.setOrigin(0.5);
        pauseTitle.setDepth(102);
        pauseTitle.setResolution(dpr < 2 ? 2 : dpr);

        const pauseText = this.add.text(
            centerX,
            centerY - 50*dpr,
            "Если завершить игру сейчас, прогресс уровня не сохранится",
            {
                font: `600 ${16*dpr}px Nunito`,
                color: "#434C5D",
                align: "center",
                wordWrap: { width: 248*dpr },
            }
        );
        pauseText.setOrigin(0.5);
        pauseText.setDepth(102);
        pauseText.setResolution(dpr < 2 ? 2 : dpr);

        EventBus.emit("current-scene-ready", this);
    }
}
