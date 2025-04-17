import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { delayPromise, tweenPromise } from "../utils/tween-utils";

const levelGrid = [
    [
        { type: "phone" },
        {
            type: "phone",
        },
        { type: "message" },
        { type: "phone" },
        { type: "message" },
        { type: "phone" },
        { type: "phone" },
    ],
    [
        { type: "box", strength: 2 },
        { type: "phone" },
        { type: "energy" },
        { type: "discoball", isHelper: true, helperType: "discoball" },
        { type: "smartphone" },
        { type: "phone" },
        { type: "box", strength: 2 },
    ],
    [
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        {
            type: "ice",
            content: {
                type: "horizontalHelper",
                isHelper: true,
                helperType: "horizontalHelper",
            },
            strength: 2,
        },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
    ],
    [
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
        { type: "box", strength: 2 },
    ],
    [
        { type: "energy" },
        { type: "smartphone" },
        { type: "energy" },
        { type: "smartphone" },
        { type: "energy" },
        { type: "smartphone" },
        { type: "energy" },
    ],
    [
        { type: "smartphone" },
        { type: "ice", content: { type: "energy" }, strength: 2 },
        { type: "smartphone" },
        { type: "energy" },
        { type: "smartphone" },
        { type: "ice", content: { type: "energy" }, strength: 2 },
        { type: "smartphone" },
    ],
    [
        { type: "energy" },
        { type: "ice", content: { type: "smartphone" }, strength: 2 },
        { type: "energy" },
        { type: "smartphone" },
        { type: "energy" },
        { type: "ice", content: { type: "smartphone" }, strength: 2 },
        { type: "energy" },
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

            const iceData = sprite.getData("ice");
            if (iceData && iceData.strength > 0) return;

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
                        if (helperType === "discoball") {
                            console.log("привет");
                            await this._activateSingleHelper(
                                tile,
                                this.selectedTile,
                                new Set()
                            );
                            this.selectedTile = null;
                            return;
                        }
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
                    if (tile.getData("ice") || neighbor.getData("ice")) {
                        return;
                    }
                    if (tile.getData("box") || neighbor.getData("box")) {
                        return;
                    }
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

        const isMatchable = (
            tile: Phaser.GameObjects.Sprite | null
        ): boolean => {
            if (!tile) return false;
            if (tile.getData("box")) return false;
            if (tile.getData("isHelper")) return false;
            if (!tile.getData("type")) return false;
            return true;
        };

        // Горизонтальные
        for (let y = 0; y < height; y++) {
            let streak: Phaser.GameObjects.Sprite[] = [];
            let prevType: string | null = null;

            for (let x = 0; x < width; x++) {
                const tile = this.grid[y][x];

                if (!isMatchable(tile)) {
                    if (streak.length >= 3) matches.push([...streak]);
                    streak = [];
                    prevType = null;
                    continue;
                }

                const type = tile.getData("type");

                if (type === prevType) {
                    streak.push(tile);
                } else {
                    if (streak.length >= 3) matches.push([...streak]);
                    streak = [tile];
                }

                prevType = type;
            }

            if (streak.length >= 3) matches.push([...streak]);
        }

        // Вертикальные
        for (let x = 0; x < width; x++) {
            let streak: Phaser.GameObjects.Sprite[] = [];
            let prevType: string | null = null;

            for (let y = 0; y < height; y++) {
                const tile = this.grid[y][x];

                if (!isMatchable(tile)) {
                    if (streak.length >= 3) matches.push([...streak]);
                    streak = [];
                    prevType = null;
                    continue;
                }

                const type = tile.getData("type");

                if (type === prevType) {
                    streak.push(tile);
                } else {
                    if (streak.length >= 3) matches.push([...streak]);
                    streak = [tile];
                }

                prevType = type;
            }

            if (streak.length >= 3) matches.push([...streak]);
        }

        return matches;
    }
    async removeMatches(matches: Phaser.GameObjects.Sprite[][]): Promise<void> {
        const tweens: Promise<void>[] = [];
        const damagedTiles = new Set<Phaser.GameObjects.Sprite>();

        // 1. Урон фишкам, участвующим в совпадении
        for (const group of matches) {
            for (const tile of group) {
                const ice = tile.getData("ice");
                const iceSprite = tile.getData("iceSprite");

                if (ice) {
                    if (ice.strength > 1) {
                        ice.strength--;

                        if (iceSprite) {
                            iceSprite.setTexture("ice_cracked");
                        }

                        const gridX = tile.getData("gridX");
                        const gridY = tile.getData("gridY");
                        this.grid[gridY][gridX] = tile;
                        tile.setDepth(5);
                        tile.alpha = 1;
                        tile.scale = 1;
                        tile.y = this.offsetY + gridY * (74 + 8);

                        damagedTiles.add(tile);
                        continue;
                    }

                    if (iceSprite) {
                        iceSprite.destroy();
                    }

                    tile.setData("ice", null);
                    tile.setData("iceSprite", null);
                    tile.setDepth(5);

                    const gridX = tile.getData("gridX");
                    const gridY = tile.getData("gridY");
                    this.grid[gridY][gridX] = tile;
                    tile.y = this.offsetY + gridY * (74 + 8);

                    damagedTiles.add(tile);
                    continue;
                }

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

        // 2. Урон льду, находящемуся рядом
        const directions = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
        ];

        for (const group of matches) {
            for (const tile of group) {
                const x = tile.getData("gridX");
                const y = tile.getData("gridY");

                for (const { dx, dy } of directions) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (
                        ny >= 0 &&
                        ny < this.grid.length &&
                        nx >= 0 &&
                        nx < this.grid[0].length
                    ) {
                        const neighbor = this.grid[ny][nx];
                        if (
                            neighbor &&
                            !damagedTiles.has(neighbor) &&
                            neighbor.getData("ice")
                        ) {
                            const ice = neighbor.getData("ice");
                            const iceSprite = neighbor.getData("iceSprite");

                            if (ice.strength > 1) {
                                ice.strength--;

                                if (iceSprite) {
                                    iceSprite.setTexture("ice_cracked");
                                }

                                const gridX = neighbor.getData("gridX");
                                const gridY = neighbor.getData("gridY");
                                this.grid[gridY][gridX] = neighbor;
                                neighbor.setDepth(5);
                                neighbor.alpha = 1;
                                neighbor.scale = 1;
                                neighbor.y = this.offsetY + gridY * (74 + 8);
                            } else {
                                if (iceSprite) iceSprite.destroy();
                                neighbor.setData("ice", null);
                                neighbor.setData("iceSprite", null);
                                neighbor.setDepth(5);
                            }

                            damagedTiles.add(neighbor);
                        }
                        if (neighbor?.getData("box")) {
                            const box = neighbor.getData("box");
                            const sprite =
                                neighbor.getData("boxSprite") || neighbor;

                            if (box.strength > 1) {
                                box.strength--;
                                if (sprite) sprite.setTexture("box_cracked");
                            } else {
                                const gx = neighbor.getData("gridX");
                                const gy = neighbor.getData("gridY");

                                this.grid[gy][gx] = null;

                                tweens.push(
                                    tweenPromise(this, {
                                        targets: sprite,
                                        alpha: 0,
                                        scale: 0,
                                        duration: 200,
                                        ease: "Power2",
                                        onComplete: () => sprite.destroy(),
                                    })
                                );
                            }

                            damagedTiles.add(neighbor);
                        }
                    }
                }
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

    // async dropTiles(): Promise<void> {
    //     const cellSize = 74;
    //     const gap = 8;
    //     const height = this.grid.length;
    //     const width = this.grid[0].length;

    //     const tweenPromises: Promise<void>[] = [];

    //     for (let x = 0; x < width; x++) {
    //         let emptySpots = 0;

    //         for (let y = height - 1; y >= 0; y--) {
    //             if (
    //                 this.grid[y][x] === null &&
    //                 !this.holePositions.has(`${x},${y}`)
    //             ) {
    //                 emptySpots++;
    //             } else if (emptySpots > 0) {
    //                 const tile = this.grid[y][x];
    //                 if (tile) {
    //                     this.grid[y + emptySpots][x] = tile;
    //                     this.grid[y][x] = null;

    //                     tile.setData("gridY", y + emptySpots);

    //                     const newY =
    //                         this.offsetY + (y + emptySpots) * (cellSize + gap);

    //                     const tweenPromise = new Promise<void>((resolve) => {
    //                         this.tweens.add({
    //                             targets: tile,
    //                             y: newY,
    //                             duration: 250,
    //                             ease: "Power2",
    //                             onComplete: () => resolve(),
    //                         });
    //                     });

    //                     tweenPromises.push(tweenPromise);
    //                 }
    //             }
    //         }
    //     }

    //     // Ждём окончания всех твинов
    //     await Promise.all(tweenPromises);
    // }
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

                        const moveTile = new Promise<void>((resolve) => {
                            this.tweens.add({
                                targets: tile,
                                y: newY,
                                duration: 250,
                                ease: "Power2",
                                onComplete: () => resolve(),
                            });
                        });

                        tweenPromises.push(moveTile);

                        // 👇 Если у фишки есть лёд — тоже двигаем
                        const iceSprite = tile.getData("iceSprite");
                        if (iceSprite) {
                            const moveIce = new Promise<void>((resolve) => {
                                this.tweens.add({
                                    targets: iceSprite,
                                    y: newY - 10, // учёт смещения (если у тебя -10 в create)
                                    duration: 250,
                                    ease: "Power2",
                                    onComplete: () => resolve(),
                                });
                            });

                            tweenPromises.push(moveIce);
                        }
                    }
                }
            }
        }

        await Promise.all(tweenPromises);
    }

    async fillEmptyTiles(): Promise<void> {
        const cellSize = 74;
        const gap = 8;
        const types = [
            "phone",
            "smartphone",
            // "sim",
            // "signal",
            "energy",
            "message",
        ];

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

                    sprite.setDepth(5);

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

            await delayPromise(this, helpersToCreate.length > 0 ? 200 : 0); // ждём после спавна хелперов
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
        // await tweenPromise(this, {
        //     targets: sprite,
        //     alpha: 1,
        //     scale: 1,
        //     duration: 350, // можно оставить 500, чтобы не тормозило сильно
        //     ease: "Back.easeOut",
        //     onStart: () => {
        //         sprite.setAlpha(0);
        //         sprite.setScale(0.5);
        //     },
        // });
        await tweenPromise(this, {
            // targets: sprite,
            // scale: 1.4,
            // alpha: 1,
            // duration: 200,
            // ease: "Cubic.easeOut",
            targets: sprite,
            scale: 1.2,
            alpha: 1,
            duration: 200,
            ease: "Power2",
            yoyo: true,
        });

        await tweenPromise(this, {
            // targets: sprite,
            // scale: 1,
            // duration: 100,
            // ease: "Sine.easeOut",
            targets: sprite,
            scale: 1,
            duration: 100,
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
        const damagedIce = new Set<string>();
        const damagedBoxes = new Set<string>();

        const damageIceAt = (x: number, y: number): boolean => {
            const tile = this.grid?.[y]?.[x];
            if (!tile) return false;

            const key = `${x},${y}`;
            if (damagedIce.has(key)) return false;

            const ice = tile.getData("ice");
            const iceSprite = tile.getData("iceSprite");
            if (!ice) return false;

            damagedIce.add(key);

            if (ice.strength > 1) {
                ice.strength--;
                if (iceSprite) iceSprite.setTexture("ice_cracked");
            } else {
                // 💥 Лёд разрушен, но не удаляем сразу
                ice.destroyed = true;
            }

            return true;
        };

        const damageBoxAt = (x: number, y: number): boolean => {
            const tile = this.grid?.[y]?.[x];
            if (!tile) return false;

            const box = tile.getData("box");
            if (!box) return false;

            const key = `${x},${y}`;
            if (damagedBoxes.has(key)) return true;

            damagedBoxes.add(key);

            if (box.strength > 1) {
                box.strength--;
                tile.setTexture("box_cracked");
            } else {
                if (!tile.getData("__scheduledForDestroy")) {
                    tile.setData("__scheduledForDestroy", true);
                    this.grid[y][x] = null;
                    this.tweens.add({
                        targets: tile,
                        alpha: 0,
                        scale: 0,
                        duration: 200,
                        ease: "Power2",
                        onComplete: () => tile.destroy(),
                    });
                }
            }

            return true;
        };

        const triggerHelper = (target: Phaser.GameObjects.Sprite) => {
            helpersToActivate.push(target);
        };

        const collectLine = (tiles: Phaser.GameObjects.Sprite[]) => {
            for (const tile of tiles) {
                if (!tile || tile === sprite) continue;

                const tx = tile.getData("gridX");
                const ty = tile.getData("gridY");

                const boxWasDamaged = damageBoxAt(tx, ty);
                const iceWasDamaged = damageIceAt(tx, ty);

                const stillHasBox = tile.getData("box");
                const stillHasIce = tile.getData("ice");

                const canRemove =
                    !boxWasDamaged &&
                    !iceWasDamaged &&
                    !stillHasBox &&
                    !stillHasIce;

                if (canRemove) {
                    if (tile.getData("isHelper")) {
                        triggerHelper(tile);
                    } else {
                        console.log(
                            `👉 Удаляем фишку в (${tx},${ty}), тип: ${tile.getData(
                                "type"
                            )}`
                        );
                        this.grid[ty][tx] = null;
                        toRemove.push(tile);
                    }
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
                    duration: 400,
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

        for (const key of damagedIce) {
            const [x, y] = key.split(",").map(Number);
            const tile = this.grid?.[y]?.[x];
            const ice = tile?.getData("ice");
            const iceSprite = tile?.getData("iceSprite");

            if (ice?.destroyed) {
                console.log(`💥 Лёд в (${x},${y}) разрушен`);
                if (iceSprite) iceSprite.destroy();
                tile?.setData("ice", null);
                tile?.setData("iceSprite", null);
                tile?.setDepth(5);
            } else {
                console.log(
                    `🧊 УРОН льду в (${x},${y}), осталось жизней: ${ice?.strength}`
                );
            }
        }

        await this.removeTiles(toRemove);

        for (let row of this.grid) {
            for (let tile of row) {
                if (tile?.getData("__scheduledForDestroy")) {
                    tile.data.remove("__scheduledForDestroy");
                }
            }
        }

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
                ny < this.grid.length &&
                nx >= 0 &&
                nx < this.grid[0].length
            ) {
                const neighbor = this.grid[ny][nx];

                if (!neighbor) continue;

                const neighborType = neighbor.getData("type");
                const isHelper = neighbor.getData("isHelper");

                // Фильтрация только обычных фишек с типом
                if (!isHelper && neighborType) {
                    neighbors.push(neighbor);
                }
            }
        }

        let selectedTile: Phaser.GameObjects.Sprite | undefined;

        if (neighbors.length > 0) {
            selectedTile = Phaser.Math.RND.pick(neighbors);
        } else {
            // fallback: на случайную подходящую фишку из всей сетки
            const candidates: Phaser.GameObjects.Sprite[] = [];
            for (let row of this.grid) {
                for (let tile of row) {
                    if (
                        tile &&
                        !tile.getData("isHelper") &&
                        tile.getData("type")
                    ) {
                        candidates.push(tile);
                    }
                }
            }

            if (candidates.length > 0) {
                selectedTile = Phaser.Math.RND.pick(candidates);
            }
        }

        if (selectedTile) {
            await tweenPromise(this, {
                targets: selectedTile,
                duration: 300,
                scale: 1.2,
                yoyo: true,
                ease: "Power1",
            });

            selectedTile.setScale(1);

            const finalTypeToRemove = selectedTile.getData("type");
            const centerX = sprite.getData("gridX");
            const centerY = sprite.getData("gridY");

            await this.removeDiscoTiles(
                centerX,
                centerY,
                finalTypeToRemove,
                sprite
            );
        } else {
            console.warn(
                "❗ Не удалось найти соседнюю или случайную фишку для дискошара"
            );
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
        const damagedIce = new Set<string>();

        const damageIceAt = (x: number, y: number) => {
            const tile = this.grid?.[y]?.[x];
            if (!tile) return;

            const key = `${x},${y}`;
            if (damagedIce.has(key)) return;

            const ice = tile.getData("ice");
            const iceSprite = tile.getData("iceSprite");
            if (!ice) return;

            damagedIce.add(key);

            if (ice.strength > 1) {
                ice.strength--;
                if (iceSprite) {
                    iceSprite.setTexture("ice_cracked");
                }
            } else {
                if (iceSprite) iceSprite.destroy();
                tile.setData("ice", null);
                tile.setData("iceSprite", null);
                tile.setDepth(5);
                this.grid[y][x] = tile;
            }
        };

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                const tile = this.grid[y][x];
                if (!tile) continue;

                const tileType = tile.getData("type");
                const isHelper = tile.getData("isHelper");

                if (tileType === typeToRemove) {
                    const ice = tile.getData("ice");
                    if (ice) {
                        // Лёд блокирует удаление — только повреждаем лёд
                        damageIceAt(x, y);
                        continue;
                    }

                    // Также урон соседнему льду
                    const directions = [
                        { dx: -1, dy: 0 },
                        { dx: 1, dy: 0 },
                        { dx: 0, dy: -1 },
                        { dx: 0, dy: 1 },
                    ];
                    for (const { dx, dy } of directions) {
                        damageIceAt(x + dx, y + dy);
                    }

                    if (isHelper) {
                        helpersToActivate.push(tile);
                    } else {
                        if (!tile.getData("ice")) {
                            this.grid[y][x] = null;
                            toRemove.push(tile);

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
            await this.activateHelperChain(helpersToActivate);
            return;
        }
        // Если хелперов не было — продолжаем цепочку вручную
        // await delayPromise(this, 400);
        await this.dropTiles();
        // await delayPromise(this, 350);
        await this.fillEmptyTiles();
        // await delayPromise(this, 450);
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

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tile = this.grid[y][x];
                if (!tile) continue;

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

                const iceSprite = tile.getData("iceSprite");

                this.grid[y][x] = null;

                tweenPromises.push(
                    tweenPromise(this, {
                        targets: tile,
                        scale: 0,
                        alpha: 0,
                        duration: 400,
                        delay: Phaser.Math.Between(0, 300),
                        ease: "Power2",
                        onComplete: () => {
                            tile.destroy();
                            if (iceSprite) {
                                iceSprite.destroy();
                                tile.setData("ice", null);
                                tile.setData("iceSprite", null);
                            }
                        },
                    })
                );
            }
        }

        await Promise.all(tweenPromises);
    }
    attachIceToSprite(sprite: Phaser.GameObjects.Sprite, strength: number) {
        const cellSize = 74;
        const posX = sprite.x;
        const posY = sprite.y;
        const textureKey = strength === 2 ? "ice_full" : "ice_cracked";

        const iceSprite = this.add.sprite(posX - 10, posY - 10, textureKey);
        iceSprite.setOrigin(0);

        iceSprite.setDisplaySize(94, 94);
        iceSprite.setDepth(10);
        iceSprite.setAlpha(0.7);

        iceSprite.disableInteractive();

        sprite.setData("ice", { strength });
        sprite.setData("iceSprite", iceSprite);
    }

    createDoubleRocketVertical(
        x: number,
        y: number
    ): Phaser.GameObjects.Container {
        const rocketUp = this.add.sprite(0, -20, "rocket");
        rocketUp.setAngle(0); // вверх, без поворота

        const rocketDown = this.add.sprite(0, 20, "rocket");
        rocketDown.setAngle(180); // вниз

        const container = this.add.container(x, y, [rocketUp, rocketDown]);
        container.setSize(50, 100); // размер для интерактива, если нужно
        container.setData("type", "verticalHelper");
        container.setData("rockets", { up: rocketUp, down: rocketDown });

        return container;
    }
    createDoubleRocketHorizontal(
        x: number,
        y: number
    ): Phaser.GameObjects.Container {
        const rocketLeft = this.add.sprite(-20, 0, "rocket");
        rocketLeft.setAngle(-90);

        const rocketRight = this.add.sprite(20, 0, "rocket");
        rocketRight.setAngle(90);

        const container = this.add.container(x, y, [rocketLeft, rocketRight]);
        container.setSize(100, 50);
        container.setData("type", "horizontalHelper");
        container.setData("rockets", { left: rocketLeft, right: rocketRight });

        return container;
    }

    create() {
        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (this.selectedSprite && this.pointerDownPos) {
                const dx = pointer.x - this.pointerDownPos.x;
                const dy = pointer.y - this.pointerDownPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 10) {
                    this.handleTileClick(this.selectedSprite);
                } else {
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

        const cellSize = 74;
        const gap = 8;

        const cols = levelGrid[0].length;
        const rows = levelGrid.length;

        const fieldWidth = cols * (cellSize + gap);
        const fieldHeight = rows * (cellSize + gap);

        this.offsetX = (this.cameras.main.width - fieldWidth) / 2;
        this.offsetY = (this.cameras.main.height - fieldHeight) / 2;

        this.grid = [];

        levelGrid.forEach((row, y) => {
            this.grid[y] = [];

            row.forEach((cell, x) => {
                if (!cell) {
                    this.grid[y][x] = null;
                    this.holePositions.add(`${x},${y}`);
                    return;
                }

                let type = cell.type;
                let data = cell;
                if (cell.type === "box") {
                    const posX = this.offsetX + x * (cellSize + gap);
                    const posY = this.offsetY + y * (cellSize + gap);

                    const strength = cell.strength ?? 2;
                    const texture = strength === 1 ? "box_cracked" : "box_full";

                    const box = this.add.sprite(posX, posY, texture);
                    box.setOrigin(0);
                    box.setDisplaySize(cellSize, cellSize);
                    box.setInteractive();
                    box.setDepth(8);

                    box.setData("gridX", x);
                    box.setData("gridY", y);
                    box.setData("type", "box");
                    box.setData("box", { strength });

                    this.grid[y][x] = box;
                    return;
                }
                if (cell.type === "ice") {
                    type = cell.content.type;
                    data = {
                        type: cell.content.type,
                        isHelper: cell.content.isHelper,
                        helperType: cell.content.helperType,
                        ice: {
                            strength: cell.strength,
                        },
                    };
                }

                const posX = this.offsetX + x * (cellSize + gap);
                const posY = this.offsetY + y * (cellSize + gap);

                // 👉 Базовая фишка (под льдом)
                const sprite = this.add.sprite(posX, posY, type);
                sprite.setOrigin(0);
                sprite.setDisplaySize(cellSize, cellSize);
                sprite.setInteractive();
                sprite.setDepth(5); // 👈 Фишка подо льдом

                sprite.setData("gridX", x);
                sprite.setData("gridY", y);
                sprite.setData("type", type);

                for (const key in data) {
                    sprite.setData(key, data[key]);
                }

                this.setupPointerEvents(sprite);

                this.grid[y][x] = sprite;

                // 👇 Если лёд — создаём поверх ледяной спрайт
                if (cell.type === "ice") {
                    this.attachIceToSprite(sprite, cell.strength);
                }
            });
        });

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
