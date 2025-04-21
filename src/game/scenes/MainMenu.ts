import { GameObjects, Scene } from "phaser";
import { levelConfigs } from "../levels/levelConfig";
import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;

    logoTween: Phaser.Tweens.Tween | null;

    constructor() {
        super("MainMenu");
    }

    create() {
        // this.cameras.main.setZoom(1 / window.devicePixelRatio);

        const camera = this.cameras.main;

        const centerX = camera.centerX;
        const centerY = camera.centerY;
        const bottomY = camera.height;

        const cols = 5;
        const rows = 5;
        const cellWidth = 64;
        const cellHeight = 72;
        const spacing = 0;

        const gridWidth = cols * cellWidth + (cols - 1) * spacing;
        const gridHeight = rows * cellHeight + (rows - 1) * spacing;

        const startX = centerX - gridWidth / 2 + cellWidth / 2;
        const startY = centerY - gridHeight / 2 + cellHeight / 2;

        const padding = 20; // запас по краям
        const availableWidth = this.cameras.main.width - padding;
        const availableHeight = this.cameras.main.height - padding;
        const scaleFactor = Math.min(
            1,
            availableWidth / gridWidth,
            availableHeight / gridHeight
        );

        this.cameras.main.setZoom(scaleFactor);

        this.add
            .text(centerX, startY - 140, "Выбери уровень", {
                fontFamily: "Nunito",
                fontSize: "28px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setResolution(2)
            .setOrigin(0.5);

        this.add
            .text(centerX, startY - 100, "Пройди все уровни, чтобы", {
                fontFamily: "Nunito",
                fontSize: "18px",
                color: "#ffffff",
            })
            .setResolution(2)
            .setOrigin(0.5);

        this.add
            .text(centerX, startY - 75, "собрать пазл", {
                fontFamily: "Nunito",
                fontSize: "18px",
                color: "#ffffff",
            })
            .setResolution(2)
            .setOrigin(0.5);

        levelConfigs.forEach((level, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * (cellWidth + spacing);
            const y = startY + row * (cellHeight + spacing);

            // Фоновая плитка
            const tile = this.add
                .sprite(x, y, level.difficult)
                .setDisplaySize(cellWidth, cellHeight)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    this.scene.stop("MainMenu");
                    this.scene.start("Game", {
                        config: level,
                    });
                });

            // Номер уровня по центру
            const label = this.add
                .text(x, y, `${level.id}`, {
                    fontSize: "24px",
                    color: "#ffffff",
                    fontStyle: "bold",
                })
                .setResolution(2)
                .setOrigin(0.5);

            // Наведение на плитку
            tile.on("pointerover", () => tile.setTint(0xaaaaaa));
            tile.on("pointerout", () => tile.clearTint());
        });

        const logoY = startY + gridHeight + 30;
        const logo = this.add.image(
            centerX,
            this.cameras.main.height - 120,
            "logo"
        );
        logo.setOrigin(0.5);
        logo.setDepth(1);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("Game");
    }
}
