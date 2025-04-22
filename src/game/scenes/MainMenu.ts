import { GameObjects, Scene } from "phaser";
import { LevelConfig, levelConfigs } from "../levels/levelConfig";
import { EventBus } from "../EventBus";

interface CoordLevel {
    x: number;
    y: number;
    id: number;
    tile: GameObjects.Image;
    label: GameObjects.Text;
}
export class MainMenu extends Scene {
    levelId!: number;
    levelsArray!:LevelConfig[];
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    coordsLevels: CoordLevel[] = [];

    private puzzle!: Phaser.GameObjects.Image;

    constructor() {
        super("MainMenu");
    }

    checkLevelBg(
        isLevelComplete: boolean,
        levelId: number,
        difficult: string
    ): string {
        if (isLevelComplete) {
            return "puzzle_" + levelId;
        } else {
            return difficult;
        }
    }
    removeLevelTile(levelId: number) {
        const levelEntry = this.coordsLevels.find(
            (entry) => entry.id === levelId
        );
        if (!levelEntry) return;
        levelEntry.tile.disableInteractive();
        levelEntry.tile.removeInteractive();
        levelEntry.tile?.destroy();
        levelEntry.label?.destroy();

        // опционально — удалим из массива координат:
        this.coordsLevels = this.coordsLevels.filter(
            (entry) => entry.id !== levelId
        );
    }
    create() {
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

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

        this.coordsLevels = [];



        this.levelsArray.forEach((level, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * (cellWidth + spacing);
            const y = startY + row * (cellHeight + spacing);

            // Фоновая плитка
            const tile = this.add
                .sprite(
                    x,
                    y,
                    this.checkLevelBg(
                        level.isCompleted,
                        level.id,
                        level.difficult
                    )
                )
                .setDisplaySize(cellWidth, cellHeight)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    this.scene.stop("MainMenu");
                    this.scene.start("Game", {
                        config: level,
                    });
                });
            // .on("pointerdown", () => {
            //     this.scene.stop("MainMenu");
            //     this.scene.start("WinScene", {
            //         levelId: level.id,
            //     });
            // });

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

            this.coordsLevels[index] = {
                x: x,
                y: y,
                id: level.id,
                tile,
                label,
            };
        });

        const logo = this.add.image(
            centerX,
            this.cameras.main.height - 120,
            "logo"
        );
        logo.setOrigin(0.5);
        logo.setDepth(1);

        if (this.levelId) {
            this.puzzle = this.add.image(
                centerX,
                centerY - 100,
                `puzzle_${this.levelId}`
            );
            this.puzzle.setDisplaySize(217, 231);
            this.puzzle.setOrigin(0.5);
            this.puzzle.setDepth(10);

            const currentLevelcoords = this.coordsLevels.find(
                (level) => level.id === this.levelId
            );

            this.tweens.add({
                targets: this.puzzle,
                x: currentLevelcoords?.x,
                y: currentLevelcoords?.y,
                scale: 0.285, // например, 0.37 или вычисленный scale
                duration: 700,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    this.removeLevelTile(this.levelId);
                    const levels = JSON.parse(
                        window.localStorage.getItem("levels")
                    );

                    const level = levels.find(
                        (level, index) => level.id === this.levelId
                    );
                    level.isCompleted = true;
                    levels[level.id - 1] = level;
                    window.localStorage.setItem(
                        "levels",
                        JSON.stringify(levels)
                    );
                    console.log("levels", level);
                },
            });
        }

        EventBus.emit("current-scene-ready", this);
    }

    createPuzzle() {}
    init(data: { revealPiece: number }) {
        this.levelId = data.revealPiece;
        this.levelsArray = JSON.parse(window.localStorage.getItem("levels"));
        if (!this.levelsArray) {
            window.localStorage.setItem("levels", JSON.stringify(levelConfigs));
            this.levelsArray = JSON.parse(window.localStorage.getItem("levels"));
        }
    }
}
