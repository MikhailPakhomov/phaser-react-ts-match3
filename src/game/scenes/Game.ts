import { EventBus } from "../EventBus";
import { Scene } from "phaser";

const levelGrid: (string | null)[][] = [
    [
        "youtube",
        "whatsapp",
        "telegram",
        "telegram",
        "youtube",
        "whatsapp",
        "whatsapp",
        "vk",
    ],
    [
        "whatsapp",
        "youtube",
        "vk",
        "telegram",
        "instagram",
        "instagram",
        "telegram",
        "youtube",
    ],
    [
        "telegram",
        "vk",
        "instagram",
        "youtube",
        "whatsapp",
        "telegram",
        "vk",
        "instagram",
    ],
    [
        "vk",
        "telegram",
        "youtube",
        "whatsapp",
        "instagram",
        "vk",
        "telegram",
        "youtube",
    ],
    [
        "instagram",
        "whatsapp",
        "telegram",
        "vk",
        "youtube",
        "whatsapp",
        "youtube",
        "vk",
    ],
    [
        "youtube",
        "telegram",
        "vk",
        "whatsapp",
        "instagram",
        "telegram",
        "vk",
        "instagram",
    ],
    [
        "whatsapp",
        "vk",
        "youtube",
        "telegram",
        "vk",
        "instagram",
        "whatsapp",
        "youtube",
    ],
    [
        "telegram",
        "whatsapp",
        "instagram",
        "youtube",
        "whatsapp",
        "vk",
        "telegram",
        "instagram",
    ],
];
export class Game extends Scene {
    background: Phaser.GameObjects.Image;
    selectedTile: Phaser.GameObjects.Sprite | null = null;
    selectedTileTween: Phaser.Tweens.Tween | null = null;
    grid: (Phaser.GameObjects.Sprite | null)[][] = [];
    holePositions: Set<string> = new Set();

    offsetX = 0;
    offsetY = 0;

    isProcessing = false;
    constructor() {
        super("Game");
    }

    handleTileClick(tile: Phaser.GameObjects.Sprite) {
        if (this.isProcessing) return;

        const selectedAnimation = {
            targets: tile,
            scale: { from: 1, to: 1.2, yoyo: true },
            ease: "Sine.easeInOut",
            duration: 300,
            repeat: -1,
        };

        if (!this.selectedTile) {
            this.selectedTile = tile;
            console.log("начало");
            if (this.selectedTileTween) {
                this.tweens.remove(this.selectedTileTween);
            }
            this.selectedTileTween = this.tweens.add(selectedAnimation);
            return;
        }
        if (tile === this.selectedTile) {
            this.tweens.remove(this.selectedTileTween);
            this.selectedTile?.setScale(1);
            this.selectedTile = null;
            this.selectedTileTween = null;
            return;
        }

        const x1 = this.selectedTile.getData("gridX");
        const y1 = this.selectedTile.getData("gridY");
        const x2 = tile.getData("gridX");
        const y2 = tile.getData("gridY");

        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.tweens.remove(this.selectedTileTween);
            this.swapTiles(this.selectedTile, tile);
            this.selectedTile = null;
            this.selectedTileTween = null;
        } else {
            this.tweens.remove(this.selectedTileTween);
            this.selectedTile.setScale(1);
            this.selectedTile = tile;
            this.selectedTileTween = this.tweens.add(selectedAnimation);
        }
    }

    swapTiles(
        tileA: Phaser.GameObjects.Sprite,
        tileB: Phaser.GameObjects.Sprite
    ) {
        const xA = tileA.getData("gridX");
        const yA = tileA.getData("gridY");
        const xB = tileB.getData("gridX");
        const yB = tileB.getData("gridY");

        const oldCoords = {
            tileA: { x: xA, y: yA },
            tileB: { x: xB, y: yB },
        };

        // Поменять местами в массиве
        this.grid[yA][xA] = tileB;
        this.grid[yB][xB] = tileA;

        tileA.setData("gridX", xB);
        tileA.setData("gridY", yB);

        tileB.setData("gridX", xA);
        tileB.setData("gridY", yA);

        const spacing = 8;
        const cellSize = 74;

        const newPosA = {
            x: this.offsetX + xB * (cellSize + spacing),
            y: this.offsetY + yB * (cellSize + spacing),
        };
        const newPosB = {
            x: this.offsetX + xA * (cellSize + spacing),
            y: this.offsetY + yA * (cellSize + spacing),
        };

        this.tweens.add({
            targets: tileA,
            x: newPosA.x,
            y: newPosA.y,
            duration: 300,
            ease: "Power2",
        });

        this.tweens.add({
            targets: tileB,
            x: newPosB.x,
            y: newPosB.y,
            duration: 300,
            ease: "Power2",
        });

        tileA.setScale(1);
        tileB.setScale(1);

        this.time.delayedCall(400, () => {
            const matches = this.findMatches?.();
            if (matches && matches.size > 0) {
                this.removeMatches(matches);

                this.time.delayedCall(250, () => {
                    this.dropTiles();
                });

                this.time.delayedCall(350, () => {
                    this.fillEmptyTiles();
                    this.processMatchesLoop();
                });
            } else {
                // Нет совпадений — откатываем свайп обратно
                this.undoSwap(tileA, tileB, oldCoords); // можно сделать отдельный метод undoSwap
            }
        });
    }

    findMatches() {
        const matches: Set<Phaser.GameObjects.Sprite> = new Set();

        const height = this.grid.length;
        const width = this.grid[0].length;

        for (let y = 0; y < height; y++) {
            let streak: Phaser.GameObjects.Sprite[] = [];
            let prevType = null;

            for (let x = 0; x < width; x++) {
                const tile = this.grid[y][x];
                const type = tile?.getData("type") || null;

                if (type === prevType && tile) {
                    streak.push(tile);
                } else {
                    if (streak.length >= 3) {
                        streak.forEach((tile) => matches.add(tile));
                    }
                    streak = tile ? [tile] : [];
                }
                prevType = type;
            }
            if (streak.length >= 3) {
                streak.forEach((tile) => matches.add(tile));
            }
        }

        for (let x = 0; x < width; x++) {
            let streak: Phaser.GameObjects.Sprite[] = [];
            let prevType = null;

            for (let y = 0; y < height; y++) {
                const tile = this.grid[y][x];
                const type = tile?.getData("type") || null;

                if (type === prevType && tile) {
                    streak.push(tile);
                } else {
                    if (streak.length >= 3) {
                        streak.forEach((t) => matches.add(t));
                    }
                    streak = tile ? [tile] : [];
                }
                prevType = type;
            }

            if (streak.length >= 3) {
                streak.forEach((t) => matches.add(t));
            }
        }

        return matches;
    }

    removeMatches(matches: Set<Phaser.GameObjects.Sprite>) {
        matches.forEach((tile) => {
            const x = tile.getData("gridX");
            const y = tile.getData("gridY");

            this.grid[y][x] = null;

            this.tweens.add({
                targets: tile,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => tile.destroy(),
            });
        });
    }

    undoSwap(
        tileA: Phaser.GameObjects.Sprite,
        tileB: Phaser.GameObjects.Sprite,
        coords: {
            tileA: { x: number; y: number };
            tileB: { x: number; y: number };
        }
    ) {
        const { tileA: oldA, tileB: oldB } = coords;

        // 👇 возвращаем обратно в массив
        this.grid[oldA.y][oldA.x] = tileA;
        this.grid[oldB.y][oldB.x] = tileB;

        tileA.setData("gridX", oldA.x);
        tileA.setData("gridY", oldA.y);
        tileB.setData("gridX", oldB.x);
        tileB.setData("gridY", oldB.y);

        const spacing = 8;
        const cellSize = 74;

        const posA = {
            x: this.offsetX + oldA.x * (cellSize + spacing),
            y: this.offsetY + oldA.y * (cellSize + spacing),
        };
        const posB = {
            x: this.offsetX + oldB.x * (cellSize + spacing),
            y: this.offsetY + oldB.y * (cellSize + spacing),
        };

        this.tweens.add({
            targets: tileA,
            x: posA.x,
            y: posA.y,
            duration: 300,
            ease: "Power2",
        });

        this.tweens.add({
            targets: tileB,
            x: posB.x,
            y: posB.y,
            duration: 300,
            ease: "Power2",
        });
    }

    // dropTiles(): Promise<void> {
    //     return new Promise((resolve) => {
    //         const cellSize = 50;
    //         const gap = 8;

    //         let falling = false;

    //         // Проходим по всем клеткам и проверяем, падают ли фишки
    //         for (let x = 0; x < this.grid[0].length; x++) {
    //             for (let y = this.grid.length - 1; y >= 0; y--) {
    //                 if (this.grid[y][x] === null) {
    //                     // Ищем выше фишку
    //                     for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
    //                         const tileAbove = this.grid[aboveY][x];
    //                         if (tileAbove) {
    //                             // Сдвигаем фишку
    //                             this.grid[y][x] = tileAbove;
    //                             this.grid[aboveY][x] = null;

    //                             tileAbove.setData("gridY", y);

    //                             const newY = y * (cellSize + gap);

    //                             this.tweens.add({
    //                                 targets: tileAbove,
    //                                 y: newY,
    //                                 duration: 200,
    //                                 ease: "Power2",
    //                             });

    //                             break; // Переходим к следующей пустой ячейке
    //                         }
    //                     }
    //                 }
    //                 falling = true;
    //             }
    //         }

    //         // Если фишки не падают — завершаем
    //         if (!falling) {
    //             resolve();
    //         }
    //     });
    // }
    dropTiles() {
        const cellSize = 74;
        const gap = 8;

        for (let x = 0; x < this.grid[0].length; x++) {
            for (let y = this.grid.length - 1; y >= 0; y--) {
                if (
                    this.grid[y][x] === null &&
                    !this.holePositions.has(`${x},${y}`)
                ) {
                    // Ищем выше фишку
                    for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
                        const tileAbove = this.grid[aboveY][x];
                        if (tileAbove) {
                            // Сдвигаем фишку
                            this.grid[y][x] = tileAbove;
                            this.grid[aboveY][x] = null;

                            tileAbove.setData("gridY", y);

                            const newY = this.offsetY + y * (cellSize + gap);

                            this.tweens.add({
                                targets: tileAbove,
                                y: newY,
                                duration: 200,
                                ease: "Power2",
                            });

                            break; // Переходим к следующей пустой ячейке
                        }
                    }
                }
            }
        }
    }
    fillEmptyTiles() {
        const cellSize = 74;
        const gap = 8;
        const types = ["youtube", "whatsapp", "telegram", "vk", "instagram"];

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[0].length; x++) {
                if (!this.grid[y][x] && !this.holePositions.has(`${x},${y}`)) {
                    const type = Phaser.Utils.Array.GetRandom(types);

                    const sprite = this.add.sprite(
                        this.offsetX + x * (cellSize + gap),
                        -cellSize, // старт выше экрана
                        type
                    );

                    sprite.setOrigin(0);
                    sprite.setDisplaySize(cellSize, cellSize);
                    sprite.setInteractive();

                    sprite.setData("gridX", x);
                    sprite.setData("gridY", y);
                    sprite.setData("type", type);

                    sprite.on("pointerover", () => sprite.setAlpha(0.7));
                    sprite.on("pointerout", () => sprite.setAlpha(1));
                    sprite.on("pointerdown", () =>
                        this.handleTileClick(sprite)
                    );

                    this.grid[y][x] = sprite;

                    this.tweens.add({
                        targets: sprite,
                        y: this.offsetY + y * (cellSize + gap),
                        duration: 250,
                        ease: "Power2",
                    });
                }
            }
        }
    }

    // fillEmptyTiles(): Promise<void> {
    //     return new Promise((resolve) => {
    //         const cellSize = 50;
    //         const gap = 8;
    //         const types = [
    //             "youtube",
    //             "whatsapp",
    //             "telegram",
    //             "vk",
    //             "instagram",
    //         ];
    //         let filling = false;

    //         for (let y = 0; y < this.grid.length; y++) {
    //             for (let x = 0; x < this.grid[0].length; x++) {
    //                 if (
    //                     !this.grid[y][x] &&
    //                     !this.holePositions.has(`${x},${y}`)
    //                 ) {
    //                     const type = Phaser.Utils.Array.GetRandom(types);

    //                     const sprite = this.add.sprite(
    //                         x * (cellSize + gap),
    //                         -cellSize, // старт выше экрана
    //                         type
    //                     );

    //                     sprite.setOrigin(0);
    //                     sprite.setDisplaySize(cellSize, cellSize);
    //                     sprite.setInteractive();

    //                     sprite.setData("gridX", x);
    //                     sprite.setData("gridY", y);
    //                     sprite.setData("type", type);

    //                     sprite.on("pointerover", () => sprite.setAlpha(0.7));
    //                     sprite.on("pointerout", () => sprite.setAlpha(1));
    //                     sprite.on("pointerdown", () =>
    //                         this.handleTileClick(sprite)
    //                     );

    //                     this.grid[y][x] = sprite;

    //                     // Анимируем падение новой фишки
    //                     this.tweens.add({
    //                         targets: sprite,
    //                         y: y * (cellSize + gap),
    //                         duration: 250,
    //                         ease: "Power2",
    //                         onComplete: () => {
    //                             filling = true;
    //                         },
    //                     });
    //                 }
    //             }
    //         }

    //         if (!filling) {
    //             resolve();
    //         }
    //     });
    // }
    // processMatchesLoop() {
    //     const matches = this.findMatches();
    //     if (matches.size > 0) {
    //         this.removeMatches(matches);
    //         this.time.delayedCall(450, () => {
    //             // Падаем после удаления совпадений
    //             this.dropTiles();
    //         });

    //         this.time.delayedCall(550, () => {
    //             // Заполняем пустые клетки
    //             this.fillEmptyTiles();
    //             this.processMatchesLoop(); // Рекурсивно ищем новые совпадения
    //         });
    //     }
    // }
    processMatchesLoop() {
        this.isProcessing = true;
        const matches = this.findMatches();
        if (matches && matches.size > 0) {
            this.removeMatches(matches);

            this.time.delayedCall(300, () => {
                this.dropTiles();

                this.time.delayedCall(300, () => {
                    this.fillEmptyTiles();

                    this.time.delayedCall(400, () => {
                        this.processMatchesLoop();
                    });
                });
            });
        } else {
            this.isProcessing = false;
        }
    }
    create() {
        const cellSize: number = 74;
        const gap: number = 8;

        const cols = levelGrid[0].length;
        const rows = levelGrid.length;

        const fieldWidth = cols * (cellSize + gap);
        const fieldHeight = rows * (cellSize + gap);

        this.offsetX = (this.cameras.main.width - fieldWidth) / 2;
        this.offsetY = (this.cameras.main.height - fieldHeight) / 2;

        this.grid = [];

        levelGrid.forEach((row, y) => {
            this.grid[y] = [];

            row.forEach((type, x) => {
                if (!type) {
                    this.grid[y][x] = null;
                    this.holePositions.add(`${x},${y}`);
                    return;
                }

                const posY = this.offsetY + y * (cellSize + gap);
                const posX = this.offsetX + x * (cellSize + gap);

                const sprite = this.add.sprite(posX, posY, type);
                sprite.setOrigin(0);
                sprite.setDisplaySize(cellSize, cellSize);
                sprite.setInteractive();

                sprite.setData("gridX", x);
                sprite.setData("gridY", y);
                sprite.setData("type", type);

                sprite.on("pointerover", () => {
                    sprite.setAlpha(0.7);
                });

                sprite.on("pointerout", () => {
                    sprite.setAlpha(1);
                });

                sprite.on("pointerdown", () => {
                    this.handleTileClick(sprite);
                });
                this.grid[y][x] = sprite;
            });
        });

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
