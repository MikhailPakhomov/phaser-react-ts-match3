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
        "verticalHelper",
        "horizontalHelper",
        "youtube",
        "instagram",
        "verticalHelper",
        "vk",
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

    selectedSprite: Phaser.GameObjects.Sprite | null = null;
    pointerDownPos: { x: number; y: number } | null = null;

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

        const isHelper = tile.getData("isHelper");
        if (isHelper) {
            this.activateHelper(tile);
            return;
        }

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
            this.selectedTile.setScale(1);
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

    handleSwipe(
        tile: Phaser.GameObjects.Sprite,
        pointer: Phaser.Input.Pointer,
        start: { x: number; y: number }
    ) {
        if (this.isProcessing) return;

        const dx = pointer.x - start.x;
        const dy = pointer.y - start.y;

        let dirX = 0;
        let dirY = 0;

        const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));

        if (angle >= -45 && angle <= 45) dirX = 1;
        else if (angle >= 135 || angle <= -135) dirX = -1;
        else if (angle > 45 && angle < 135) dirY = 1;
        else if (angle < -45 && angle > -135) dirY = -1;

        const gridX = tile.getData("gridX");
        const gridY = tile.getData("gridY");

        const targetX = gridX + dirX;
        const targetY = gridY + dirY;

        if (
            targetX >= 0 &&
            targetX < this.cols &&
            targetY >= 0 &&
            targetY < this.rows
        ) {
            const neighbor = this.grid[targetY][targetX];
            if (neighbor) {
                this.swapTiles(tile, neighbor);
            }
        }
    }

    swapTiles(
        tileA: Phaser.GameObjects.Sprite,
        tileB: Phaser.GameObjects.Sprite
    ) {
        if (this.isProcessing) return;

        this.isProcessing = true;

        const isHelperA = tileA?.getData("isHelper");
        const isHelperB = tileB?.getData("isHelper");

        const typeA = tileA?.getData("type");
        const typeB = tileB?.getData("type");

        const isDiscoA = typeA === "discoball";
        const isDiscoB = typeB === "discoball";

        if (isDiscoA && !isDiscoB) {
            this.activateHelper(tileA, tileB); // диско шар активируется, второй — обычный/хелпер
            return;
        }
        if (isDiscoB && !isDiscoA) {
            this.activateHelper(tileB, tileA);
            return;
        }
        if (isDiscoA && isDiscoB) {
            this.activateHelper(tileA); // оба дискошара — активируем любой
            return;
        }

        // если оба хелперы, но не дискошары — активируем оба
        if (isHelperA && isHelperB) {
            this.activateHelper(tileA);
            this.activateHelper(tileB);
            return;
        }
        if (isHelperA) {
            this.activateHelper(tileA, tileB);
            return;
        }
        if (isHelperB) {
            this.activateHelper(tileB, tileA);
            return;
        }

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

        tileA.setScale(1);
        tileB.setScale(1);

        this.time.delayedCall(400, () => {
            const matches = this.findMatches?.();
            if (matches && matches.length > 0) {
                this.removeMatches(matches);

                let helperSpawned = false;

                for (const match of matches) {
                    if (match.length === 4 || match.length === 5) {
                        const isHorizontal = this.isHorizontalMatch(match);
                        const type =
                            match.length === 5
                                ? "discoball"
                                : isHorizontal
                                ? "verticalHelper"
                                : "horizontalHelper";

                        helperSpawned = true;

                        // Сначала спавним хелпер
                        this.time.delayedCall(250, () => {
                            this.createHelperWithEffect(xB, yB, type);
                        });
                    }
                }

                // Если хелпер был создан — подождать чуть дольше перед падением
                const delay = helperSpawned ? 650 : 350;

                this.time.delayedCall(delay, () => {
                    this.dropTiles();
                });

                this.time.delayedCall(delay + 100, () => {
                    this.fillEmptyTiles();
                    this.processMatchesLoop();
                });
            } else {
                this.undoSwap(tileA, tileB, oldCoords);
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

    removeMatches(
        matches: Phaser.GameObjects.Sprite[][],
        onComplete?: () => void
    ) {
        let tweensRemaining = 0;

        matches.forEach((group) => {
            group.forEach((tile) => {
                const x = tile.getData("gridX");
                const y = tile.getData("gridY");

                this.grid[y][x] = null;
                tweensRemaining++;

                this.tweens.add({
                    targets: tile,
                    alpha: 0,
                    scale: 0,
                    duration: 200,
                    delay: 100 + y * 15,
                    ease: "Power1",
                    onComplete: () => {
                        tile.destroy();
                        tweensRemaining--;
                        if (tweensRemaining === 0 && onComplete) {
                            onComplete();
                        }
                    },
                });
            });
        });

        // если совпадений не было, сразу вызываем
        if (tweensRemaining === 0 && onComplete) {
            onComplete();
        }
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
                            duration: 300,
                            delay: emptySpots * 40, // последовательность
                            ease: "Cubic.easeIn",
                        });
                    }
                }
            }
        }
    }
    // fillEmptyTiles() {
    //     const cellSize = 74;
    //     const gap = 8;
    //     const types = ["youtube", "whatsapp", "telegram", "vk", "instagram"];

    //     for (let y = 0; y < this.grid.length; y++) {
    //         for (let x = 0; x < this.grid[0].length; x++) {
    //             if (!this.grid[y][x] && !this.holePositions.has(`${x},${y}`)) {
    //                 const type = Phaser.Utils.Array.GetRandom(types);

    //                 this.createSprite(x, y, type);
    //             }
    //         }
    //     }
    // }

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

                    // Hover эффекты
                    sprite.on("pointerover", () => sprite.setAlpha(0.7));
                    sprite.on("pointerout", () => sprite.setAlpha(1));

                    // 👇 ОБЯЗАТЕЛЬНО: сохранение выбранного спрайта и позиции при нажатии
                    sprite.on(
                        "pointerdown",
                        (pointer: Phaser.Input.Pointer) => {
                            this.selectedSprite = sprite;
                            this.pointerDownPos = {
                                x: pointer.x,
                                y: pointer.y,
                            };
                        }
                    );

                    this.grid[y][x] = sprite;

                    // 🧈 Анимация с каскадом
                    this.tweens.add({
                        targets: sprite,
                        y: this.offsetY + y * (cellSize + gap),
                        delay: x * 40,
                        duration: 500,
                        ease: "Bounce.easeOut",
                    });
                }
            }
        }
    }

    processMatchesLoop() {
        this.isProcessing = true;
        const matches = this.findMatches();

        if (matches.length > 0) {
            const helpersToCreate: { x: number; y: number; type: string }[] =
                [];

            for (const match of matches) {
                if (match.length === 4 || match.length === 5) {
                    const isHorizontal = this.isHorizontalMatch(match);
                    const type =
                        match.length === 5
                            ? "discoball"
                            : isHorizontal
                            ? "verticalHelper"
                            : "horizontalHelper";

                    const spawnTile = match.find((tile) => tile.active);
                    const spawnX = spawnTile?.getData("gridX") ?? 0;
                    const spawnY = spawnTile?.getData("gridY") ?? 0;

                    helpersToCreate.push({ x: spawnX, y: spawnY, type });
                }

                for (const sprite of match) {
                    const x = sprite.getData("gridX");
                    const y = sprite.getData("gridY");
                    this.grid[y][x] = null;
                }
            }

            // 💣 Удаление совпадений + создание хелперов → потом дроп
            this.removeMatches(matches, () => {
                for (const helper of helpersToCreate) {
                    this.createHelperWithEffect(
                        helper.x,
                        helper.y,
                        helper.type
                    );
                }

                // 🧊 Подождём, пока хелпер приземлится
                this.time.delayedCall(450, () => {
                    this.dropTiles();

                    this.time.delayedCall(350, () => {
                        this.fillEmptyTiles();

                        this.time.delayedCall(450, () => {
                            this.processMatchesLoop();
                        });
                    });
                });
            });
        } else {
            this.isProcessing = false;
        }
    }

    // createSprite(x: number, y: number, type: string) {
    //     const cellSize = 74;
    //     const spacing = 8;

    //     const sprite = this.add.sprite(
    //         this.offsetX + x * (cellSize + spacing),
    //         -cellSize,
    //         type
    //     );
    //     sprite.setOrigin(0);
    //     sprite.setDisplaySize(cellSize, cellSize);
    //     sprite.setInteractive();

    //     sprite.setData("gridX", x);
    //     sprite.setData("gridY", y);
    //     sprite.setData("type", type);

    //     sprite.on("pointerover", () => sprite.setAlpha(0.7));
    //     sprite.on("pointerout", () => sprite.setAlpha(1));

    //     sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    //         sprite.setData("pointerDown", { x: pointer.x, y: pointer.y });
    //         this.selectedSprite = sprite;
    //         this.pointerDownPos = { x: pointer.x, y: pointer.y };
    //     });

    //     if (
    //         type === "verticalHelper" ||
    //         type === "horizontalHelper" ||
    //         type === "discoball"
    //     ) {
    //         sprite.setData("isHelper", true);
    //         sprite.setData("helperType", type);
    //     }

    //     this.grid[y][x] = sprite;

    //     this.tweens.add({
    //         targets: sprite,
    //         y: this.offsetY + y * (cellSize + spacing),
    //         duration: 400,
    //         delay: y * 40 + 100, // каскад по Y и доп. задержка
    //         ease: "Bounce.easeOut",
    //     });
    // }
    createHelperWithEffect(x: number, y: number, type: string) {
        const cellSize = 74;
        const spacing = 8;

        const sprite = this.add.sprite(
            this.offsetX + x * (cellSize + spacing),
            this.offsetY + y * (cellSize + spacing),
            type
        );

        sprite.setOrigin(0);
        sprite.setDisplaySize(cellSize, cellSize);
        sprite.setInteractive();

        sprite.setData("gridX", x);
        sprite.setData("gridY", y);
        sprite.setData("type", type);
        sprite.setData("isHelper", true);
        sprite.setData("helperType", type);

        sprite.on("pointerover", () => sprite.setAlpha(0.7));
        sprite.on("pointerout", () => sprite.setAlpha(1));
        sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            sprite.setData("pointerDown", { x: pointer.x, y: pointer.y });
            this.selectedSprite = sprite;
            this.pointerDownPos = { x: pointer.x, y: pointer.y };
        });

        // 👇 Эффект появления
        sprite.setAlpha(0);
        sprite.setScale(0.5);
        this.tweens.add({
            targets: sprite,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: "Back.easeOut",
        });

        this.grid[y][x] = sprite;
    }

    isHorizontalMatch(match: Phaser.GameObjects.Sprite[]): boolean {
        if (match.length < 2) return false;
        const y = match[0].getData("gridY");
        return match.every((sprite) => sprite.getData("gridY") === y);
    }
    activateHelper(
        sprite: Phaser.GameObjects.Sprite,
        tile?: Phaser.GameObjects.Sprite,
        triggerChain: Set<Phaser.GameObjects.Sprite> = new Set()
    ) {
        // Блокируем действия
        this.isProcessing = true;

        const x = sprite.getData("gridX");
        const y = sprite.getData("gridY");
        const type = sprite.getData("helperType");
        const typeToRemove = tile?.getData("type");
        const toRemove: Phaser.GameObjects.Sprite[] = [];

        // Если уже был активирован — выходим
        if (triggerChain.has(sprite)) return;
        triggerChain.add(sprite);

        const triggerHelper = (target: Phaser.GameObjects.Sprite) => {
            this.activateHelper(target, undefined, triggerChain);
        };

        if (type === "verticalHelper") {
            for (let row = 0; row < this.rows; row++) {
                const tile = this.grid[row][x];
                if (tile && tile !== sprite) {
                    if (tile.getData("isHelper")) {
                        triggerHelper(tile);
                    } else {
                        toRemove.push(tile);
                        this.grid[row][x] = null;
                    }
                }
            }
        } else if (type === "horizontalHelper") {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.grid[y][col];
                if (tile && tile !== sprite) {
                    if (tile.getData("isHelper")) {
                        triggerHelper(tile);
                    } else {
                        toRemove.push(tile);
                        this.grid[y][col] = null;
                    }
                }
            }
        } else if (type === "discoball") {
            if (!typeToRemove) {
                this.tweens.add({
                    targets: sprite,
                    angle: 360,
                    duration: 400,
                    ease: "Cubic.easeOut",
                    onComplete: () => {
                        sprite.setAngle(0);
                        this.activateDiscoballWithRandomNeighbor(sprite);
                    },
                });
                return;
            } else {
                this.removeDiscoTiles(x, y, typeToRemove, sprite);
                return;
            }
        }

        // Удаляем сам хелпер
        this.grid[y][x] = null;
        toRemove.push(sprite);

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
    activateDiscoballWithRandomNeighbor(sprite: Phaser.GameObjects.Sprite) {
        const x = sprite.getData("gridX");
        const y = sprite.getData("gridY");

        const neighbors: Phaser.GameObjects.Sprite[] = [];
        const directions = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
        ];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (
                ny >= 0 &&
                ny < this.rows &&
                nx >= 0 &&
                nx < this.cols &&
                this.grid[ny][nx]
            ) {
                const neighbor = this.grid[ny][nx];
                const neighborType = neighbor.getData("type");
                const isHelper = neighbor.getData("helperType");

                if (!isHelper && neighborType) {
                    neighbors.push(neighbor);
                }
            }
        }

        if (neighbors.length > 0) {
            const randomNeighbor = Phaser.Math.RND.pick(neighbors);
            const finalTypeToRemove = randomNeighbor.getData("type");

            // ✨ Анимация выбранного соседа
            this.tweens.add({
                targets: randomNeighbor,
                duration: 300,
                scale: 1.2,
                ease: "Power1",
                yoyo: true,
                onComplete: () => {
                    randomNeighbor.setScale(1);

                    this.time.delayedCall(300, () => {
                        this.removeDiscoTiles(x, y, finalTypeToRemove, sprite);

                        // ⏱ После удаления, запуск дропа и последующих шагов
                        this.time.delayedCall(400, () => {
                            this.dropTiles();
                            this.time.delayedCall(300, () => {
                                this.fillEmptyTiles();
                                this.time.delayedCall(350, () => {
                                    this.processMatchesLoop();
                                    // ✅ Блокировка снимается в processMatchesLoop
                                });
                            });
                        });
                    });
                },
            });
        } else {
            // ❗️Если соседей нет — разблокируем вручную
            this.isProcessing = false;
        }
    }

    removeDiscoTiles(
        centerX: number,
        centerY: number,
        typeToRemove: string,
        discoSprite: Phaser.GameObjects.Sprite
    ) {
        const toRemove: Phaser.GameObjects.Sprite[] = [];
        const helpersToActivate: Phaser.GameObjects.Sprite[] = [];
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                const tile = this.grid[y][x];
                if (!tile) continue;

                const tileType = tile.getData("type");
                const isHelper = tile.getData("isHelper");

                if (tileType === typeToRemove) {
                    if (isHelper) {
                        helpersToActivate.push(tile); // отложим активацию
                    } else {
                        toRemove.push(tile);
                        this.grid[y][x] = null;

                        tile.setTint(0xffff00);
                        this.tweens.add({
                            targets: tile,
                            duration: 300,
                            scale: 1.2,
                            yoyo: true,
                            ease: "Power1",
                            onComplete: () => {
                                tile.setScale(1);
                                tile.clearTint();
                            },
                        });
                    }
                }
            }
        }

        // Удаляем сам дискошар
        this.grid[centerY][centerX] = null;
        toRemove.push(discoSprite);

        this.removeTiles(toRemove);

        this.time.delayedCall(400, () => {
            if (helpersToActivate.length > 0) {
                // Активируем хелперы, они сами потом продолжат
                helpersToActivate.forEach((helper) => {
                    this.activateHelper(helper);
                });
                return; // не запускаем повторно dropTiles
            }

            // Если нет хелперов — вручную продолжаем
            this.dropTiles();
            this.time.delayedCall(350, () => {
                this.fillEmptyTiles();
                this.time.delayedCall(450, () => {
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
        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (this.selectedSprite && this.pointerDownPos) {
                const dx = pointer.x - this.pointerDownPos.x;
                const dy = pointer.y - this.pointerDownPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 10) {
                    // 👉 Это клик
                    this.handleTileClick(this.selectedSprite);
                } else {
                    // 👉 Это свайп
                    this.handleSwipe(
                        this.selectedSprite,
                        pointer,
                        this.pointerDownPos
                    );
                }

                this.selectedSprite = null;
                this.pointerDownPos = null;
            }
        });

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
                // this.createSprite(x, y, type);
                const sprite = this.add.sprite(posX, posY, type);
                sprite.setOrigin(0);
                sprite.setDisplaySize(cellSize, cellSize);
                sprite.setInteractive();

                sprite.setData("gridX", x);
                sprite.setData("gridY", y);
                sprite.setData("type", type);

                if (type === "verticalHelper" || type === "horizontalHelper") {
                    sprite.setData("isHelper", true);
                    sprite.setData("helperType", type);
                }
                sprite.on("pointerover", () => {
                    sprite.setAlpha(0.7);
                });

                sprite.on("pointerout", () => {
                    sprite.setAlpha(1);
                });

                sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                    sprite.setData("pointerDown", {
                        x: pointer.x,
                        y: pointer.y,
                    });
                    this.selectedSprite = sprite;
                    this.pointerDownPos = { x: pointer.x, y: pointer.y };
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
