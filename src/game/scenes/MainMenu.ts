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
    isFirstLevelPlay!: boolean;
    isFirstLaunch!: boolean;
    levelId!: number | undefined;
    levelsArray!: LevelConfig[];
    gameOver!: boolean;
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    coordsLevels: CoordLevel[] = [];
    completedCount: number;

    private puzzle!: Phaser.GameObjects.Image;
    private puzzleFull!: Phaser.GameObjects.Image;

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

        if (this.isFirstLaunch) this.scene.start("Onboarding");
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
        console.log(gridWidth, gridHeight);
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
                font: "800 28px Nunito",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setResolution(2)
            .setOrigin(0.5);

        this.add
            .text(centerX, startY - 100, "Пройди все уровни, чтобы", {
                font: "600 18px Nunito",
                color: "#ffffff",
            })
            .setResolution(2)
            .setOrigin(0.5);

        this.add
            .text(centerX, startY - 75, "собрать пазл", {
                font: "600 18px Nunito",
                color: "#ffffff",
            })
            .setResolution(2)
            .setOrigin(0.5);

        this.coordsLevels = [];

        interface ILevelTextColor {
            easy: string;
            medium: string;
            hard: string;
        }
        const levelTextColor: ILevelTextColor = {
            easy: "#00AEEF",
            medium: "#ffffff",
            hard: "#FFFFFF",
        };

        this.levelsArray.forEach((level, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * (cellWidth + spacing);
            const y = startY + row * (cellHeight + spacing);

            const isCompleted = level.isCompleted;

            const textureKey = this.checkLevelBg(
                isCompleted,
                level.id,
                level.difficult
            );

            const tile = this.add
                .sprite(x, y, textureKey)
                .setDisplaySize(cellWidth, cellHeight);

            if (isCompleted) {
                tile.setPosition(x, y - 2);
                tile.setScale(0.344);
            }

            let label: Phaser.GameObjects.Text | undefined;

            if (!isCompleted) {
                tile.setInteractive({ useHandCursor: true }).on(
                    "pointerdown",
                    () => {
                        console.log(this.isFirstLevelPlay);
                        if (this.isFirstLevelPlay) {
                            this.scene.stop("MainMenu");
                            this.scene.start("Tutorial", {
                                currentLevel: level,
                            });
                        } else {
                            this.scene.stop("MainMenu");
                            this.scene.start("Game", {
                                config: level,
                            });
                        }

                        // this.scene.start("WinScene", {
                        //     levelId: level.id,
                        //     difficult: level.difficult,
                        // });

                        // this.scene.start("LoseScene", {});
                    }
                );

                label = this.add
                    .text(x, y, `${level.id}`, {
                        font: "800 24px Nunito",
                        color: levelTextColor[level.difficult],
                    })
                    .setResolution(2)
                    .setOrigin(0.5);

                tile.on("pointerover", () => tile.setTint(0xaaaaaa));
                tile.on("pointerout", () => tile.clearTint());
            }

            // 🧩 Добавляем ВСЕ уровни в массив координат
            this.coordsLevels[index] = {
                x,
                y,
                id: level.id,
                tile,
                label, // undefined, если уровень завершён
            };
        });

        const logo = this.add.image(
            centerX,
            this.cameras.main.height - 120,
            "logo"
        );
        logo.setOrigin(0.5);
        logo.setDepth(1);

        if (this.gameOver) {
            this.puzzleFull = this.add.image(centerX, centerY, "puzzle_full");
            this.puzzleFull.setDisplaySize(320, 360);
            this.puzzleFull.setOrigin(0.5);
            this.puzzleFull.setDepth(20);
            this.puzzleFull.setAlpha(0);

            this.tweens.add({
                targets: this.puzzleFull,
                alpha: 1,
                duration: 1200,
                ease: "Cubic.easeInOut",
            });
            return;
        }

        if (this.levelId) {
            this.puzzle = this.add.image(
                centerX,
                centerY - 100,
                `puzzle_${this.levelId}`
            );
            this.puzzle.setDisplaySize(172, 192);
            this.puzzle.setOrigin(0.5);
            this.puzzle.setDepth(10);

            const currentLevelcoords = this.coordsLevels.find((level) => {
                return level.id === this.levelId;
            });

            // 💥 Отключаем интерактив и удаляем надпись сразу
            if (currentLevelcoords) {
                currentLevelcoords.tile.disableInteractive();
                currentLevelcoords.label.destroy();
            }

            // 🧩 Анимация вставки фрагмента
            this.tweens.add({
                targets: this.puzzle,
                x: currentLevelcoords?.x,
                y: currentLevelcoords?.y - 2,
                scale: 0.345,
                duration: 700,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    // 🧼 Полностью удаляем тайл после завершения (на всякий случай)
                    currentLevelcoords?.tile.destroy();
                    this.coordsLevels = this.coordsLevels.filter(
                        (entry) => entry.id !== this.levelId
                    );

                    // 💾 Обновление localStorage
                    const levels = JSON.parse(
                        window.localStorage.getItem("levels")
                    );
                    const level = levels.find(
                        (level) => level.id === this.levelId
                    );
                    if (level) {
                        level.isCompleted = true;
                        levels[level.id - 1] = level;
                        window.localStorage.setItem(
                            "levels",
                            JSON.stringify(levels)
                        );
                    }
                    this.completedCount++;
                    console.log(this.completedCount);
                    window.localStorage.setItem(
                        "completedCount",
                        JSON.stringify(this.completedCount)
                    );

                    if (this.completedCount === 25) {
                        this.scene.start("WinScene", {
                            isFinal: true,
                        });
                    }
                },
            });
        }

        EventBus.emit("current-scene-ready", this);
    }

    init(data: { revealPiece?: number }) {
        this.levelId = data.revealPiece;

        this.isFirstLaunch = JSON.parse(
            window.localStorage.getItem("isFirstLaunch")
        );
        if (this.isFirstLaunch === null) {
            this.isFirstLaunch = true;
            window.localStorage.setItem("isFirstLaunch", JSON.stringify(false));
        } else {
            this.isFirstLaunch = false;
        }

        this.isFirstLevelPlay = JSON.parse(
            window.localStorage.getItem("isFirstLevelPlay")
        );
        console.log(this.isFirstLevelPlay);
        if (this.isFirstLevelPlay === null) {
            this.isFirstLevelPlay = true;
            window.localStorage.setItem(
                "isFirstLevelPlay",
                JSON.stringify(true)
            );
        }

        this.gameOver = JSON.parse(window.localStorage.getItem("gameOver"));
        if (!this.gameOver) {
            window.localStorage.setItem("gameOver", JSON.stringify(false));
            this.gameOver = JSON.parse(window.localStorage.getItem("gameOver"));
        }

        this.levelsArray = JSON.parse(window.localStorage.getItem("levels"));
        if (!this.levelsArray) {
            window.localStorage.setItem("levels", JSON.stringify(levelConfigs));
            this.levelsArray = JSON.parse(
                window.localStorage.getItem("levels")
            );
        }

        this.completedCount = JSON.parse(
            window.localStorage.getItem("completedCount")
        );
        if (!this.completedCount) {
            window.localStorage.setItem("completedCount", JSON.stringify(0));
            this.completedCount = JSON.parse(
                window.localStorage.getItem("completedCount")
            );
        }
    }
}
