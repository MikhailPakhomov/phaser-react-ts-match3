import { EventBus } from "../EventBus";
import { Scene } from "phaser";

const levelGrid: (string | null)[][] = [
    [
        "youtube",
        "whatsapp",
        "youtube",
        "telegram",
        "youtube",
        "whatsapp",
        "whatsapp",
        "vk",
    ],
    [
        "youtube",
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
        "youtube",
        "whatsapp",
        "telegram",
        "whatsapp",
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
        "vk",
        "telegram",
        "vk",
        "youtube",
        "whatsapp",
        "youtube",
        "vk",
    ],
    [
        "youtube",
        "vk",
        "telegram",
        "instagram",
        "instagram",
        "telegram",
        "instagram",
        "instagram",
    ],
    [
        "whatsapp",
        "telegram",
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
    lastMovedCell: { row: number; col: number } | null = null;

    rows = 8;
    cols = 8;

    offsetX = 0;
    offsetY = 0;

    posForHelpersX = 0;
    posForHelpersY = 0;

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

        this.lastMovedCell = { row: xB ?? 0, col: yB ?? 0 };

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

        if (tileA?.getData("isHelper")) {
            this.activateHelper(tileA, tileB);
            return;
        }
        if (tileB?.getData("isHelper")) {
            this.activateHelper(tileB, tileA);
            return;
        }

        tileA.setScale(1);
        tileB.setScale(1);

        this.time.delayedCall(400, () => {
            const matches = this.findMatches?.();
            if (matches && matches.length > 0) {
                this.removeMatches(matches);

                for (const match of matches) {
                    if (match.length === 4 || match.length === 5) {
                        console.log(1);
                        const isHorizontal = this.isHorizontalMatch(match);

                        const type =
                            match.length === 5
                                ? "discoball"
                                : isHorizontal
                                ? "verticalHelper"
                                : "horizontalHelper";

                        this.time.delayedCall(250, () => {
                            this.createSprite(
                                this.lastMovedCell.row,
                                this.lastMovedCell.col,
                                type
                            );
                        });
                    }
                }

                this.time.delayedCall(350, () => {
                    this.dropTiles();
                });

                this.time.delayedCall(400, () => {
                    this.fillEmptyTiles();
                    this.processMatchesLoop();
                });
            } else {
                // Нет совпадений — откатываем свайп обратно
                this.undoSwap(tileA, tileB, oldCoords); // можно сделать отдельный метод undoSwap
            }
        });
    }

    // findMatches() {
    //     const matches: Phaser.GameObjects.Sprite[][] = [];

    //     const height = this.grid.length;
    //     const width = this.grid[0].length;

    //     for (let y = 0; y < height; y++) {
    //         let streak: Phaser.GameObjects.Sprite[] = [];
    //         let prevType = null;

    //         for (let x = 0; x < width; x++) {
    //             const tile = this.grid[y][x];
    //             const type = tile?.getData("type") || null;

    //             if (type === prevType && tile) {
    //                 streak.push(tile);
    //             } else {
    //                 if (streak.length >= 3) {
    //                     streak.forEach((tile) => matches.push(tile));
    //                 }
    //                 streak = tile ? [tile] : [];
    //             }
    //             prevType = type;
    //         }
    //         if (streak.length >= 3) {
    //             streak.forEach((tile) => matches.push(tile));
    //         }
    //     }

    //     for (let x = 0; x < width; x++) {
    //         let streak: Phaser.GameObjects.Sprite[] = [];
    //         let prevType = null;

    //         for (let y = 0; y < height; y++) {
    //             const tile = this.grid[y][x];
    //             const type = tile?.getData("type") || null;

    //             if (type === prevType && tile) {
    //                 streak.push(tile);
    //             } else {
    //                 if (streak.length >= 3) {
    //                     streak.forEach((t) => matches.push(t));
    //                 }
    //                 streak = tile ? [tile] : [];
    //             }
    //             prevType = type;
    //         }

    //         if (streak.length >= 3) {
    //             streak.forEach((t) => matches.push(t));
    //         }
    //     }

    //     return matches;
    // }

    findMatches(): Phaser.GameObjects.Sprite[][] {
        const matches: Phaser.GameObjects.Sprite[][] = [];

        const height = this.grid.length;
        const width = this.grid[0].length;

        // Горизонтальные матчи
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
                        matches.push([...streak]);
                    }
                    streak = tile ? [tile] : [];
                }
                prevType = type;
            }

            if (streak.length >= 3) {
                matches.push([...streak]);
            }
        }

        // Вертикальные матчи
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
                        matches.push([...streak]);
                    }
                    streak = tile ? [tile] : [];
                }
                prevType = type;
            }

            if (streak.length >= 3) {
                matches.push([...streak]);
            }
        }

        // Угловые совпадения (проверяем только углы)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = this.grid[y][x];
                if (!tile) continue;

                const type = tile.getData("type");

                // Проверка угловых совпадений (смотрим, есть ли элементы по горизонтали и вертикали)
                if (
                    // Угловые проверки
                    (x === 0 || x === width - 1) &&
                    (y === 0 || y === height - 1)
                ) {
                    let streak: Phaser.GameObjects.Sprite[] = [tile];

                    // Проверяем, если слева или справа есть совпадения
                    if (
                        x > 0 &&
                        this.grid[y][x - 1]?.getData("type") === type
                    ) {
                        streak.push(this.grid[y][x - 1]);
                    }
                    if (
                        x < width - 1 &&
                        this.grid[y][x + 1]?.getData("type") === type
                    ) {
                        streak.push(this.grid[y][x + 1]);
                    }

                    // Проверяем, если сверху или снизу есть совпадения
                    if (
                        y > 0 &&
                        this.grid[y - 1][x]?.getData("type") === type
                    ) {
                        streak.push(this.grid[y - 1][x]);
                    }
                    if (
                        y < height - 1 &&
                        this.grid[y + 1][x]?.getData("type") === type
                    ) {
                        streak.push(this.grid[y + 1][x]);
                    }

                    // Если находим комбинацию
                    if (streak.length >= 3) {
                        matches.push(streak);
                    }
                }
            }
        }

        // Объединяем совпадения, если они близки друг к другу (угловые)
        const mergedMatches: Phaser.GameObjects.Sprite[][] = [];
        matches.forEach((match) => {
            let merged = false;
            for (let i = 0; i < mergedMatches.length; i++) {
                const existingMatch = mergedMatches[i];
                if (match.some((tile) => existingMatch.includes(tile))) {
                    mergedMatches[i] = [
                        ...new Set([...existingMatch, ...match]),
                    ]; // Объединяем совпадения
                    merged = true;
                    break;
                }
            }
            if (!merged) {
                mergedMatches.push(match); // Добавляем как отдельное совпадение
            }
        });
        console.log(mergedMatches);
        return mergedMatches;
    }
    // removeMatches(matches: Phaser.GameObjects.Sprite[][]) {
    //     matches.forEach((tile) => {
    //         const x = tile.getData("gridX");
    //         const y = tile.getData("gridY");

    //         this.grid[y][x] = null;

    //         this.tweens.add({
    //             targets: tile,
    //             alpha: 0,
    //             scale: 0,
    //             duration: 300,
    //             onComplete: () => tile.destroy(),
    //         });
    //     });
    // }

    removeMatches(matches: Phaser.GameObjects.Sprite[][]) {
        matches.forEach((group) => {
            group.forEach((tile) => {
                const x = tile.getData("gridX");
                const y = tile.getData("gridY");

                this.grid[y][x] = null;

                this.tweens.add({
                    targets: tile,
                    alpha: 0,
                    scale: 0,
                    duration: 100,
                    onComplete: () => tile.destroy(),
                });
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
    // dropTiles() {
    //     const cellSize = 74;
    //     const gap = 8;

    //     for (let x = 0; x < this.grid[0].length; x++) {
    //         for (let y = this.grid.length - 1; y >= 0; y--) {
    //             if (
    //                 this.grid[y][x] === null &&
    //                 !this.holePositions.has(`${x},${y}`)
    //             ) {
    //                 // Ищем выше фишку
    //                 for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
    //                     const tileAbove = this.grid[aboveY][x];
    //                     if (tileAbove) {
    //                         // Сдвигаем фишку
    //                         this.grid[y][x] = tileAbove;
    //                         this.grid[aboveY][x] = null;

    //                         tileAbove.setData("gridY", y);

    //                         const newY = this.offsetY + y * (cellSize + gap);

    //                         this.tweens.add({
    //                             targets: tileAbove,
    //                             y: newY,
    //                             duration: 200,
    //                             ease: "Power2",
    //                         });

    //                         break; // Переходим к следующей пустой ячейке
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    dropTiles() {
        const cellSize = 74;
        const gap = 8;

        const height = this.grid.length;
        const width = this.grid[0].length;

        for (let x = 0; x < width; x++) {
            let emptySpots = 0;

            for (let y = height - 1; y >= 0; y--) {
                if (
                    this.grid[y][x] === null &&
                    !this.holePositions.has(`${x},${y}`)
                ) {
                    emptySpots++;
                } else if (emptySpots > 0) {
                    const tile = this.grid[y][x];
                    if (tile) {
                        this.grid[y + emptySpots][x] = tile;
                        this.grid[y][x] = null;

                        tile.setData("gridY", y + emptySpots);

                        this.tweens.add({
                            targets: tile,
                            y:
                                this.offsetY +
                                (y + emptySpots) * (cellSize + gap),
                            duration: 200,
                            ease: "Power2",
                        });
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

                    this.createSprite(x, y, type);
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
    // processMatchesLoop() {
    //     this.isProcessing = true;
    //     const matches = this.findMatches();
    //     if (matches && matches.size > 0) {
    //         this.removeMatches(matches);
    //         if (matches.size >= 4) {
    //             this.time.delayedCall(250, () => {
    //                 this.createHelpers(
    //                     this.posForHelpersX,
    //                     this.posForHelpersY,
    //                     "horizontalHelper"
    //                 );
    //             });
    //         }
    //         this.time.delayedCall(300, () => {
    //             this.dropTiles();

    //             this.time.delayedCall(300, () => {
    //                 this.fillEmptyTiles();

    //                 this.time.delayedCall(400, () => {
    //                     this.processMatchesLoop();
    //                 });
    //             });
    //         });
    //     } else {
    //         this.isProcessing = false;
    //     }
    // }

    // processMatchesLoop(swapInfo?: {
    //     from: { x: number; y: number };
    //     to: { x: number; y: number };
    // }) {
    //     this.isProcessing = true;
    //     const matches = this.findMatches();

    //     if (matches && matches.size > 0) {
    //         this.removeMatches(matches);

    //         // Обработка хелперов
    //         for (const match of matches) {
    //             if (match.length === 4) {
    //                 const isHorizontal = this.isHorizontalMatch(match);
    //                 const helperType = isHorizontal
    //                     ? "verticalHelper"
    //                     : "horizontalHelper";

    //                 // Приоритет: позиция свапа -> позиция первой фишки в комбе
    //                 const spawnX = swapInfo?.to?.x ?? match[0].getData("gridX");
    //                 const spawnY = swapInfo?.to?.y ?? match[0].getData("gridY");

    //                 this.time.delayedCall(250, () => {
    //                     this.createHelpers(spawnX, spawnY, helperType);
    //                 });
    //             } else if (match.length === 5) {
    //                 // Дискошар
    //                 const spawnX = swapInfo?.to?.x ?? match[0].getData("gridX");
    //                 const spawnY = swapInfo?.to?.y ?? match[0].getData("gridY");

    //                 this.time.delayedCall(250, () => {
    //                     this.createHelpers(spawnX, spawnY, "discoBall");
    //                 });
    //             }
    //         }

    //         // Продолжаем процесс падения и заполнения
    //         this.time.delayedCall(300, () => {
    //             this.dropTiles();

    //             this.time.delayedCall(300, () => {
    //                 this.fillEmptyTiles();

    //                 this.time.delayedCall(400, () => {
    //                     // Следующий цикл — уже без swapInfo
    //                     this.processMatchesLoop();
    //                 });
    //             });
    //         });
    //     } else {
    //         this.isProcessing = false;
    //     }
    // }

    // processMatchesLoop() {
    //     this.isProcessing = true;
    //     const matches = this.findMatches(); // Теперь массив массивов

    //     if (matches.length > 0) {
    //         // Создаем хелперы
    //         const helpersToCreate: { x: number; y: number; type: string }[] =
    //             [];

    //         for (const match of matches) {
    //             if (match.length === 4 || match.length === 5) {
    //                 const isHorizontal = this.isHorizontalMatch(match);

    //                 const type =
    //                     match.length === 5
    //                         ? "discoball"
    //                         : isHorizontal
    //                         ? "verticalHelper"
    //                         : "horizontalHelper";

    //                 const spawnTile = match.find((tile) => tile.active); // любой живой тайл
    //                 const spawnX = spawnTile?.getData("gridX") ?? 0;
    //                 const spawnY = spawnTile?.getData("gridY") ?? 0;

    //                 helpersToCreate.push({ x: spawnX, y: spawnY, type });

    //                 for (const sprite of match) {
    //                     const x = sprite.getData("gridX");
    //                     const y = sprite.getData("gridY");
    //                     this.grid[y][x] = null;
    //                 }

    //                 this.time.delayedCall(100, () => {
    //                     this.removeMatches(matches);
    //                 });

    //                 this.time.delayedCall(300, () => {
    //                     for (const helper of helpersToCreate) {
    //                         this.createSprite(helper.x, helper.y, helper.type);
    //                     }
    //                 });

    //                 this.time.delayedCall(500, () => {
    //                     this.dropTiles();

    //                     this.time.delayedCall(300, () => {
    //                         this.fillEmptyTiles();

    //                         this.time.delayedCall(300, () => {
    //                             this.processMatchesLoop();
    //                         });
    //                     });
    //                 });
    //             }
    //         }
    //     } else {
    //         this.isProcessing = false;
    //     }
    // }
    processMatchesLoop() {
        this.isProcessing = true;
        const matches = this.findMatches();

        if (matches.length > 0) {
            const helpersToCreate: { x: number; y: number; type: string }[] =
                [];

            for (const match of matches) {
                // Собираем координаты хелперов
                if (match.length === 4 || match.length === 5) {
                    const isHorizontal = this.isHorizontalMatch(match);
                    const type =
                        match.length === 5
                            ? "discoball"
                            : isHorizontal
                            ? "verticalHelper"
                            : "horizontalHelper";

                    let spawnX = 0;
                    let spawnY = 0;

                    const movedCell = this.lastMovedCell;
                    const movedMatchTile = match.find(
                        (tile) =>
                            tile.getData("gridX") === movedCell?.col &&
                            tile.getData("gridY") === movedCell?.row
                    );

                    if (movedMatchTile) {
                        spawnX = movedMatchTile.getData("gridX");
                        spawnY = movedMatchTile.getData("gridY");
                    } else {
                        const spawnTile =
                            match.find((tile) => tile.active) ??
                            match[Math.floor(match.length / 2)];
                        spawnX = spawnTile.getData("gridX");
                        spawnY = spawnTile.getData("gridY");
                    }

                    helpersToCreate.push({ x: spawnX, y: spawnY, type });
                }

                // Удаляем тайлы из сетки
                for (const sprite of match) {
                    const x = sprite.getData("gridX");
                    const y = sprite.getData("gridY");
                    this.grid[y][x] = null;
                }
            }

            // 1. Удаляем анимированно
            this.time.delayedCall(200, () => {
                this.removeMatches(matches);
            });

            // 2. После удаления создаем хелперы
            this.time.delayedCall(300, () => {
                for (const helper of helpersToCreate) {
                    this.createSprite(helper.x, helper.y, helper.type);
                }
            });

            // 3. Дропаем всё после
            this.time.delayedCall(550, () => {
                this.dropTiles();

                this.time.delayedCall(300, () => {
                    this.fillEmptyTiles();

                    this.time.delayedCall(300, () => {
                        this.processMatchesLoop();
                    });
                });
            });
        } else {
            this.isProcessing = false;
        }
    }

    createSprite(x: number, y: number, type: string) {
        console.log(type);
        const cellSize = 74;
        const spacing = 8;

        const sprite = this.add.sprite(
            this.offsetX + x * (cellSize + spacing),
            -cellSize, // старт выше экрана
            type
        );
        sprite.setOrigin(0);
        sprite.setDisplaySize(cellSize, cellSize);
        sprite.setInteractive();

        sprite.setData("gridX", x);
        sprite.setData("gridY", y);
        sprite.setData("type", type);

        if (
            type === "verticalHelper" ||
            type === "horizontalHelper" ||
            type === "discoball"
        ) {
            sprite.setData("isHelper", true);
            sprite.setData("helperType", type);
            sprite.on("pointerdown", () => {
                this.activateHelper(sprite);
            });
        }

        sprite.on("pointerover", () => sprite.setAlpha(0.7));
        sprite.on("pointerout", () => sprite.setAlpha(1));
        sprite.on("pointerdown", () => this.handleTileClick(sprite));

        this.grid[y][x] = sprite;

        this.tweens.add({
            targets: sprite,
            y: this.offsetY + y * (cellSize + spacing),
            duration: 250,
            ease: "Power2",
        });
    }

    isHorizontalMatch(match: Phaser.GameObjects.Sprite[]): boolean {
        if (match.length < 2) return false;
        const y = match[0].getData("gridY");
        return match.every((sprite) => sprite.getData("gridY") === y);
    }
    activateHelper(
        sprite: Phaser.GameObjects.Sprite,
        tile?: Phaser.GameObjects.Sprite
    ) {
        const x = sprite.getData("gridX");
        const y = sprite.getData("gridY");
        const type = sprite.getData("helperType");
        const typeToRemove = tile?.getData("type");
        const toRemove: Phaser.GameObjects.Sprite[] = [];

        if (type === "verticalHelper") {
            for (let row = 0; row < this.rows; row++) {
                const tile = this.grid[row][x];
                if (tile && tile !== sprite) {
                    toRemove.push(tile);
                    this.grid[row][x] = null;
                }
            }
        } else if (type === "horizontalHelper") {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.grid[y][col];
                if (tile && tile !== sprite) {
                    toRemove.push(tile);
                    this.grid[y][col] = null;
                }
            }
        } else if (type === "discoball") {
            for (let y = 0; y < this.grid.length; y++) {
                for (let x = 0; x < this.grid[y].length; x++) {
                    const currentTile = this.grid[y][x];
                    if (
                        currentTile &&
                        currentTile.getData("type") === typeToRemove
                    ) {
                        toRemove.push(currentTile);
                        this.grid[y][x] = null;
                    }
                }
            }
        }

        // Удаляем саму ракету
        this.grid[y][x] = null;
        toRemove.push(sprite);

        // Анимация и удаление
        this.removeTiles(toRemove);

        this.time.delayedCall(200, () => {
            this.dropTiles();
            this.time.delayedCall(300, () => {
                this.fillEmptyTiles();
                this.time.delayedCall(300, () => {
                    this.processMatchesLoop();
                });
            });
        });
    }
    removeTiles(tiles: Phaser.GameObjects.Sprite[]) {
        for (const tile of tiles) {
            this.tweens.add({
                targets: tile,
                scale: 0,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    tile.destroy();
                },
            });
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
