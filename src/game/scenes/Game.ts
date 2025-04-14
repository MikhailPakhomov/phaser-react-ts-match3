import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { delayPromise, tweenPromise } from "../utils/tween-utils";

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
        "instagram",
        "youtube",
        "vk",
    ],
    [
        "youtube",
        "horizontalHelper",
        "telegram",
        "discoball",
        "discoball",
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
        "instagram",
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

    selectedSprite: Phaser.GameObjects.Sprite | null = null;
    pointerDownPos: { x: number; y: number } | null = null;

    rows = 8;
    cols = 8;

    offsetX = 0;
    offsetY = 0;

    posForHelpersX = 0;
    posForHelpersY = 0;

    isInputLocked = false;
    isProcessing = false;
    constructor() {
        super("Game");
    }
    setupPointerEvents(sprite: Phaser.GameObjects.Sprite) {
        sprite.on("pointerover", () => sprite.setAlpha(0.7));
        sprite.on("pointerout", () => sprite.setAlpha(1));

        sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // 👉 Блокируем ранние клики
            if (this.isInputLocked) return;

            sprite.setData("pointerDown", {
                x: pointer.x,
                y: pointer.y,
            });

            this.selectedSprite = sprite;
            this.pointerDownPos = {
                x: pointer.x,
                y: pointer.y,
            };
        });
    }

    async handleTileClick(tile: Phaser.GameObjects.Sprite) {
        if (this.isProcessing || this.isInputLocked) return;

        this.isInputLocked = true;

        try {
            const isHelper = tile.getData("isHelper");
            const helperType = tile.getData("helperType");

            if (isHelper) {
                if (this.selectedTileTween) {
                    this.tweens.remove(this.selectedTileTween);
                    this.selectedTileTween = null;
                }
                if (this.selectedTile) {
                    const x1 = this.selectedTile.getData("gridX");
                    const y1 = this.selectedTile.getData("gridY");
                    const x2 = tile.getData("gridX");
                    const y2 = tile.getData("gridY");

                    const dx = Math.abs(x1 - x2);
                    const dy = Math.abs(y1 - y2);

                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        this.selectedTile.setScale(1);
                        await this.basicSwap(this.selectedTile, tile);
                        await this.activateHelperChain([tile]);

                        this.selectedTile = null;
                        return;
                    } else {
                        this.selectedTile.setScale(1);
                        await this.activateHelperChain([tile]);
                        this.selectedTile = null;
                        return;
                    }
                }
                await this.activateHelperChain([tile]);
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
                await this.swapTiles(this.selectedTile, tile);
                this.selectedTile = null;
                this.selectedTileTween = null;
            } else {
                this.tweens.remove(this.selectedTileTween);
                this.selectedTile.setScale(1);
                this.selectedTile = tile;
                this.selectedTileTween = this.tweens.add(selectedAnimation);
            }
        } finally {
            this.isInputLocked = false;
        }
    }

    async handleSwipe(
        tile: Phaser.GameObjects.Sprite,
        pointer: Phaser.Input.Pointer,
        start: { x: number; y: number }
    ) {
        if (this.isProcessing || this.isInputLocked) return;

        this.isInputLocked = true;

        if (this.selectedTileTween) {
            this.tweens.remove(this.selectedTileTween);
            this.selectedTileTween = null;
        }
        if (this.selectedTile) {
            this.selectedTile.setScale(1);
            this.selectedTile = null;
        }

        try {
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
                    await this.swapTiles(tile, neighbor);
                }
            }
        } finally {
            this.isInputLocked = false;
        }
    }

    async basicSwap(
        tileA: Phaser.GameObjects.Sprite,
        tileB: Phaser.GameObjects.Sprite
    ) {
        // 🧩 Обычный свап
        const xA = tileA.getData("gridX");
        const yA = tileA.getData("gridY");
        const xB = tileB.getData("gridX");
        const yB = tileB.getData("gridY");

        const oldCoords = {
            tileA: { x: xA, y: yA },
            tileB: { x: xB, y: yB },
        };

        // Меняем местами в сетке
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

        await Promise.all([
            tweenPromise(this, {
                targets: tileA,
                x: newPosA.x,
                y: newPosA.y,
                duration: 300,
                ease: "Power2",
            }),
            tweenPromise(this, {
                targets: tileB,
                x: newPosB.x,
                y: newPosB.y,
                duration: 300,
                ease: "Power2",
            }),
        ]);

        if (tileA.getData("isHelper") || tileB.getData("isHelper")) return;

        tileA.setScale(1);
        tileB.setScale(1);

        const matches = this.findMatches?.();
        if (matches && matches.length > 0) {
            this.removeMatches(matches);

            let helperSpawned = false;

            let spawnX = xB;
            let spawnY = yB;

            for (const match of matches) {
                let type: string | null = null;

                if (match.length >= 5) {
                    type = "discoball";
                } else if (match.length === 4) {
                    const isHorizontal = this.isHorizontalMatch(match);
                    type = isHorizontal ? "verticalHelper" : "horizontalHelper";
                }

                if (type) {
                    const found = match.find((t) => t === tileA || t === tileB);
                    if (found) {
                        spawnX = found.getData("gridX");
                        spawnY = found.getData("gridY");
                    }

                    helperSpawned = true;
                    await delayPromise(this, 150);
                    this.createHelperWithEffect(spawnX, spawnY, type);
                }
            }

            await delayPromise(this, helperSpawned ? 450 : 300);
            await this.dropTiles();
            await delayPromise(this, 100);
            await this.fillEmptyTiles();
            await this.processMatchesLoop();
            await this.reshuffleBoardIfNoMoves();
        } else {
            await this.undoSwap(tileA, tileB, oldCoords);
        }
    }
    async swapTiles(
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

        // 🎯 Обработка дискошара
        if (isDiscoA && !isDiscoB) {
            await this.basicSwap(tileA, tileB);
            await this._activateSingleHelper(tileA, tileB, new Set());
            return;
        }
        if (isDiscoB && !isDiscoA) {
            await this.basicSwap(tileA, tileB);
            await this._activateSingleHelper(tileB, tileA, new Set());
            return;
        }
        if (isDiscoA && isDiscoB) {
            await this.clearBoard();
            await this.fillEmptyTiles();
            await this.processMatchesLoop();
            return;
        }

        // 💥 Обычные хелперы
        if (isHelperA && isHelperB) {
            await this.activateHelperChain([tileA, tileB]);
            return;
        }
        if (isHelperA) {
            await this.basicSwap(tileA, tileB);
            await this.activateHelperChain([tileA]);
            return;
        }
        if (isHelperB) {
            await this.basicSwap(tileA, tileB);
            await this.activateHelperChain([tileB]);
            return;
        }
        await this.basicSwap(tileA, tileB);
    }

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

    async removeMatches(matches: Phaser.GameObjects.Sprite[][]): Promise<void> {
        const tweens: Promise<void>[] = [];

        for (const group of matches) {
            for (const tile of group) {
                const x = tile.getData("gridX");
                const y = tile.getData("gridY");
                this.grid[y][x] = null;
                tweens.push(
                    tweenPromise(this, {
                        targets: tile,
                        alpha: 0,
                        scale: 0,
                        duration: 150,
                        ease: "Power1",
                        onComplete: () => tile.destroy(),
                    })
                );
            }
        }

        await Promise.all(tweens);
    }

    async undoSwap(
        tileA: Phaser.GameObjects.Sprite,
        tileB: Phaser.GameObjects.Sprite,
        coords: {
            tileA: { x: number; y: number };
            tileB: { x: number; y: number };
        }
    ): Promise<void> {
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

        await Promise.all([
            tweenPromise(this, {
                targets: tileA,
                x: posA.x,
                y: posA.y,
                duration: 250,
                ease: "Power2",
            }),
            tweenPromise(this, {
                targets: tileB,
                x: posB.x,
                y: posB.y,
                duration: 250,
                ease: "Power2",
            }),
        ]);
        this.isProcessing = false;
    }

    async dropTiles(): Promise<void> {
        const cellSize = 74;
        const gap = 8;
        const height = this.grid.length;
        const width = this.grid[0].length;

        const tweenPromises: Promise<void>[] = [];

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

                        const newY =
                            this.offsetY + (y + emptySpots) * (cellSize + gap);

                        const tweenPromise = new Promise<void>((resolve) => {
                            this.tweens.add({
                                targets: tile,
                                y: newY,
                                duration: 250,
                                ease: "Power2",
                                onComplete: () => resolve(),
                            });
                        });

                        tweenPromises.push(tweenPromise);
                    }
                }
            }
        }

        // Ждём окончания всех твинов
        await Promise.all(tweenPromises);
    }

    async fillEmptyTiles(): Promise<void> {
        const cellSize = 74;
        const gap = 8;
        const types = ["youtube", "whatsapp", "telegram", "vk", "instagram"];

        const tweenPromises: Promise<void>[] = [];

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

                    this.setupPointerEvents(sprite);

                    this.grid[y][x] = sprite;

                    const tweenPromise = new Promise<void>((resolve) => {
                        this.tweens.add({
                            targets: sprite,
                            y: this.offsetY + y * (cellSize + gap),
                            duration: 200,
                            delay: x * 20,
                            ease: "Cubic.easeOut",
                            onComplete: () => resolve(),
                        });
                    });

                    tweenPromises.push(tweenPromise);
                }
            }
        }

        await Promise.all(tweenPromises);
    }
    async processMatchesLoop(): Promise<void> {
        this.isProcessing = true;

        const matches = this.findMatches();

        if (matches.length > 0) {
            const helpersToCreate: { x: number; y: number; type: string }[] =
                [];

            for (const match of matches) {
                if (match.length >= 5) {
                    // 🎯 Авто-диско: всегда по центру
                    const centerIndex = Math.floor(match.length / 2);
                    const centerTile = match[centerIndex];
                    const spawnX = centerTile.getData("gridX");
                    const spawnY = centerTile.getData("gridY");

                    helpersToCreate.push({
                        x: spawnX,
                        y: spawnY,
                        type: "discoball",
                    });
                } else if (match.length === 4) {
                    const isHorizontal = this.isHorizontalMatch(match);
                    const type = isHorizontal
                        ? "verticalHelper"
                        : "horizontalHelper";

                    const centerIndex = Math.floor(match.length / 2);
                    const centerTile = match[centerIndex];
                    const spawnX = centerTile.getData("gridX");
                    const spawnY = centerTile.getData("gridY");

                    helpersToCreate.push({ x: spawnX, y: spawnY, type });
                }

                // 🔥 Помечаем тайлы для удаления
                for (const tile of match) {
                    const x = tile.getData("gridX");
                    const y = tile.getData("gridY");
                    this.grid[y][x] = null;
                }
            }

            await this.removeMatches(matches);

            for (const helper of helpersToCreate) {
                await this.createHelperWithEffect(
                    helper.x,
                    helper.y,
                    helper.type
                );
            }

            // await delayPromise(this, 200); // ждём после спавна хелперов
            await this.dropTiles();
            // await delayPromise(this, 125);
            await this.fillEmptyTiles();
            await delayPromise(this, 200);

            await this.processMatchesLoop(); // рекурсивный запуск
            await this.reshuffleBoardIfNoMoves();
        } else {
            this.isProcessing = false;
        }
    }
    async createHelperWithEffect(
        x: number,
        y: number,
        type: string
    ): Promise<void> {
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

        this.setupPointerEvents(sprite);
        this.grid[y][x] = sprite;

        // ✨ Ждём анимацию
        await tweenPromise(this, {
            targets: sprite,
            alpha: 1,
            scale: 1,
            duration: 350, // можно оставить 500, чтобы не тормозило сильно
            ease: "Back.easeOut",
            onStart: () => {
                sprite.setAlpha(0);
                sprite.setScale(0.5);
            },
        });
    }

    isHorizontalMatch(match: Phaser.GameObjects.Sprite[]): boolean {
        if (match.length < 2) return false;
        const y = match[0].getData("gridY");
        return match.every((sprite) => sprite.getData("gridY") === y);
    }

    async activateHelperChain(
        helpers: Phaser.GameObjects.Sprite[]
    ): Promise<void> {
        const triggerChain = new Set<Phaser.GameObjects.Sprite>();
        for (const helper of helpers) {
            await this._activateSingleHelper(helper, undefined, triggerChain);
        }

        await delayPromise(this, 100);
        await this.dropTiles();
        await this.fillEmptyTiles();
        await this.processMatchesLoop();
        await this.reshuffleBoardIfNoMoves();
    }
    async _activateSingleHelper(
        sprite: Phaser.GameObjects.Sprite,
        tile?: Phaser.GameObjects.Sprite,
        triggerChain?: Set<Phaser.GameObjects.Sprite>
    ): Promise<void> {
        const x = sprite.getData("gridX");
        const y = sprite.getData("gridY");
        const type = sprite.getData("helperType");
        const typeToRemove = tile?.getData("type");
        const toRemove: Phaser.GameObjects.Sprite[] = [];

        if (triggerChain?.has(sprite)) return;
        triggerChain?.add(sprite);

        const helpersToActivate: Phaser.GameObjects.Sprite[] = [];

        const triggerHelper = (target: Phaser.GameObjects.Sprite) => {
            helpersToActivate.push(target);
        };

        const collectLine = (tiles: Phaser.GameObjects.Sprite[]) => {
            let discoCount = 0;

            for (const tile of tiles) {
                if (!tile || tile === sprite) continue;

                const tileType = tile.getData("type");
                if (tileType === "discoball") discoCount++;
            }

            if (discoCount >= 2) {
                // удалим все и выйдем
                this.clearBoard().then(() => {
                    // возможно тебе нужно сбросить цепочку хелперов — или можно вызвать drop+fill+loop вручную
                });
                return;
            }

            for (const tile of tiles) {
                if (!tile || tile === sprite) continue;

                if (tile.getData("isHelper")) {
                    triggerHelper(tile);
                } else {
                    const tx = tile.getData("gridX");
                    const ty = tile.getData("gridY");
                    this.grid[ty][tx] = null;
                    toRemove.push(tile);
                }
            }
        };

        if (type === "verticalHelper") {
            const column = this.grid.map((row) => row[x]);
            collectLine(column);
        } else if (type === "horizontalHelper") {
            const row = this.grid[y];
            collectLine(row);
        } else if (type === "discoball") {
            if (!typeToRemove) {
                await tweenPromise(this, {
                    targets: sprite,
                    angle: 360,
                    duration: 300,
                    ease: "Cubic.easeOut",
                });
                sprite.setAngle(0);
                await this.activateDiscoballWithRandomNeighbor(sprite);
            } else {
                await this.removeDiscoTiles(x, y, typeToRemove, sprite);
            }
            return;
        }

        this.grid[y][x] = null;
        toRemove.push(sprite);

        await this.removeTiles(toRemove);

        for (const helper of helpersToActivate) {
            await this._activateSingleHelper(helper, undefined, triggerChain);
        }
    }
    async activateDiscoballWithRandomNeighbor(
        sprite: Phaser.GameObjects.Sprite
    ): Promise<void> {
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

            await tweenPromise(this, {
                targets: randomNeighbor,
                duration: 300,
                scale: 1.2,
                yoyo: true,
                ease: "Power1",
            });

            randomNeighbor.setScale(1);

            await this.removeDiscoTiles(x, y, finalTypeToRemove, sprite);
        }
    }

    async removeDiscoTiles(
        centerX: number,
        centerY: number,
        typeToRemove: string,
        discoSprite: Phaser.GameObjects.Sprite
    ): Promise<void> {
        const toRemove: Phaser.GameObjects.Sprite[] = [];
        const helpersToActivate: Phaser.GameObjects.Sprite[] = [];
        const tweenPromises: Promise<void>[] = [];

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

                        // Визуальная анимация удаления
                        tweenPromises.push(
                            tweenPromise(this, {
                                targets: tile,
                                duration: 300,
                                scale: 1.2,
                                yoyo: true,
                                ease: "Power1",
                                onStart: () => tile.setTint(0xffff00),
                                onComplete: () => {
                                    tile.setScale(1);
                                    tile.clearTint();
                                    tile.destroy();
                                },
                            })
                        );
                    }
                }
            }
        }

        // Удаляем сам дискошар
        this.grid[centerY][centerX] = null;
        toRemove.push(discoSprite);

        tweenPromises.push(
            tweenPromise(this, {
                targets: discoSprite,
                duration: 250,
                alpha: 0,
                scale: 0,
                ease: "Power2",
                onComplete: () => discoSprite.destroy(),
            })
        );

        await Promise.all(tweenPromises);

        if (helpersToActivate.length > 0) {
            // Активируем хелперы (внутри них processMatchesLoop вызовется)
            await this.activateHelperChain(helpersToActivate);
            return;
        }

        // Если хелперов не было — продолжаем цепочку вручную
        await delayPromise(this, 400);
        await this.dropTiles();
        await delayPromise(this, 350);
        await this.fillEmptyTiles();
        await delayPromise(this, 450);
        await this.processMatchesLoop();
        await this.reshuffleBoardIfNoMoves();
    }
    async removeTiles(tiles: Phaser.GameObjects.Sprite[]): Promise<void> {
        const tweenPromises: Promise<void>[] = [];

        for (const tile of tiles) {
            tweenPromises.push(
                tweenPromise(this, {
                    targets: tile,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    ease: "Power1",
                    onComplete: () => tile.destroy(),
                })
            );
        }

        await Promise.all(tweenPromises);
    }

    hasAvailableMoves(): boolean {
        const rows = this.rows;
        const cols = this.cols;

        const isMatch = (
            a: Phaser.GameObjects.Sprite,
            b: Phaser.GameObjects.Sprite,
            c: Phaser.GameObjects.Sprite
        ): boolean => {
            if (!a || !b || !c) return false;
            const t1 = a.getData("type");
            const t2 = b.getData("type");
            const t3 = c.getData("type");
            return t1 === t2 && t2 === t3;
        };

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tile = this.grid[y][x];
                if (!tile) continue;

                const type = tile.getData("type");

                // Попробуем свапнуть вправо
                if (x < cols - 1) {
                    const right = this.grid[y][x + 1];
                    if (!right) continue;

                    // Поменять местами
                    this.grid[y][x] = right;
                    this.grid[y][x + 1] = tile;

                    const match = this.findMatches();

                    // Вернуть обратно
                    this.grid[y][x] = tile;
                    this.grid[y][x + 1] = right;

                    if (match.length > 0) return true;
                }

                // Попробуем свапнуть вниз
                if (y < rows - 1) {
                    const down = this.grid[y + 1][x];
                    if (!down) continue;

                    this.grid[y][x] = down;
                    this.grid[y + 1][x] = tile;

                    const match = this.findMatches();

                    this.grid[y][x] = tile;
                    this.grid[y + 1][x] = down;

                    if (match.length > 0) return true;
                }
            }
        }

        return false;
    }

    async reshuffleBoardIfNoMoves(): Promise<void> {
        while (!this.hasAvailableMoves()) {
            console.log("😶 Нет доступных ходов, перезаполняем поле");

            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const tile = this.grid[y][x];
                    if (tile) tile.destroy();
                    this.grid[y][x] = null;
                }
            }

            await this.fillEmptyTiles();
        }
    }
    async clearBoard(): Promise<void> {
        const tweenPromises: Promise<void>[] = [];

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                const tile = this.grid[y][x];
                if (!tile) continue;

                this.grid[y][x] = null;

                tweenPromises.push(
                    tweenPromise(this, {
                        targets: tile,
                        scale: 0,
                        alpha: 0,
                        duration: 400,
                        delay: Phaser.Math.Between(0, 300),
                        ease: "Power2",
                        onComplete: () => tile.destroy(),
                    })
                );
            }
        }

        await Promise.all(tweenPromises);
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

                if (
                    type === "verticalHelper" ||
                    type === "horizontalHelper" ||
                    type === "discoball"
                ) {
                    sprite.setData("isHelper", true);
                    sprite.setData("helperType", type);
                }
                this.setupPointerEvents(sprite);
                this.grid[y][x] = sprite;
            });
        });

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
