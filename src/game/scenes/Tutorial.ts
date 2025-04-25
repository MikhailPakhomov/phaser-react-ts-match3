import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { LevelConfig } from "../levels/levelConfig";
import { tutorialLevel, TutorialGoal } from "../levels/tutorialConfig";

export class Tutorial extends Scene {
    private step: number = 0;
    currentLevel!: LevelConfig;
    private continueButton!: Phaser.GameObjects.Image;
    private playButton!: Phaser.GameObjects.Image;

    private fingerTween?: Phaser.Tweens.Tween;
    private fingerDelay?: Phaser.Time.TimerEvent;

    visibleTiles: Phaser.GameObjects.Sprite[] = [];
    visibleTileBgs: Phaser.GameObjects.Image[] = [];

    visibleGoals: Phaser.GameObjects.Image[] = [];

    movesText!: Phaser.GameObjects.Text;
    movesBg!: Phaser.GameObjects.Image;
    pauseButton!: Phaser.GameObjects.Image;

    tutorialTitle: Phaser.GameObjects.Text;
    tutorialText: Phaser.GameObjects.Text;
    finger: Phaser.GameObjects.Image;
    arrowTop: Phaser.GameObjects.Image;
    arrowLeft: Phaser.GameObjects.Image;
    tapTimer: Phaser.Time.TimerEvent | null = null;

    goalIcons: {
        [type: string]: {
            icon: Phaser.GameObjects.Sprite;
            text: Phaser.GameObjects.Text;
            circle: Phaser.GameObjects.Image;
            target: number;
            current: number;
        };
    } = {};

    grid: (Phaser.GameObjects.Sprite | null)[][] = [];
    cellSize = 48;
    gap = 2;

    rows: number;
    cols: number;

    offsetX = 0;
    offsetY = 0;

    scaleFactor = 1;

    posForHelpersX = 0;
    posForHelpersY = 0;

    private nextStep() {
        this.step += 1;
        if (this.step === 1) {
            const helperX = this.grid[2][4]?.x ?? 0;
            const helperY = this.grid[2][4]?.y ?? 0;
            const simX = this.grid[1][4]?.x ?? 0;
            const simY = this.grid[1][4]?.y ?? 0;
            const messageX = this.grid[3][4]?.x ?? 0;
            const messageY = this.grid[3][4]?.y ?? 0;
            const energyX = this.grid[2][3]?.x ?? 0;
            const energyY = this.grid[2][3]?.y ?? 0;

            this.grid[2][4]?.destroy();
            this.grid[2][4] = null;
            const helper = this.createDoubleRocketHorizontal(helperX, helperY);
            helper.setDepth(1001);
            this.grid[2][4] = helper;

            this.visibleTiles.push(this.grid[2][4]);

            this.grid[1][4]?.destroy(); //sim
            this.grid[1][4] = null;
            this.grid[1][4] = this.add
                .sprite(simX, simY, "sim")
                .setDepth(1000)
                .setOrigin(0.5)
                .setDisplaySize(this.cellSize - 5, this.cellSize - 5);
            this.visibleTiles.push(this.grid[1][4]);

            this.grid[3][4]?.destroy(); //message
            this.grid[3][4] = null;
            this.grid[3][4] = this.add
                .sprite(messageX, messageY, "message")
                .setDepth(1000)
                .setOrigin(0.5)
                .setDisplaySize(this.cellSize - 5, this.cellSize - 5);
            this.visibleTiles.push(this.grid[3][4]);

            this.grid[2][3]?.destroy(); //energy
            this.grid[2][3] = null;
            this.grid[2][3] = this.add
                .sprite(energyX, energyY, "energy")
                .setDepth(1000)
                .setOrigin(0.5)
                .setDisplaySize(this.cellSize - 5, this.cellSize - 5);
            this.visibleTiles.push(this.grid[2][3]);

            this.tutorialTitle.setText("Хелпер");
            this.tutorialText.setText(
                "Собери 4 или 5 иконок в ряд, чтобы получить хелпер"
            );

            if (this.fingerTween) {
                this.fingerTween.stop();
            }

            if (this.fingerDelay) {
                this.fingerDelay.remove();
            }

            this.tweens.add({
                targets: this.finger,
                x: this.cameras.main.centerX + 90,
                y: this.cameras.main.centerY - 10,
                angle: -90,
                duration: 1000,
                ease: "Cubic.easeInOut",
            });

            // this.finger.setAngle(-90);
            this.tapTimer = this.time.delayedCall(1000, this.simulateTap);
        }

        if (this.step === 2) {
            this.tweens.killTweensOf(this.finger); // убиваем анимацию
            if (this.tapTimer) {
                this.tapTimer.remove();
                this.tapTimer = null;
            }
            this.finger.destroy();
            this.visibleTiles.forEach((tile) => {
                tile.setDepth(5);
            });
            this.visibleTileBgs.forEach((bg) => {
                bg.destroy();
            });

            this.tutorialTitle.setText("Цель уровня");
            this.tutorialText.setText(
                "Для победы на уровне нужно собрать все предметы из цели"
            );

            this.arrowTop = this.add.sprite(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "tutorial_arrow_top"
            );
            this.arrowTop.setOrigin(0.5);
            this.arrowTop.setDepth(1001);
            this.arrowTop.setScale(0);
            this.arrowTop.setAlpha(0);

            this.tweens.add({
                targets: this.tutorialTitle,
                y: this.cameras.main.centerY,
                duration: 600,
            });
            this.tweens.add({
                targets: this.tutorialText,
                y: this.cameras.main.centerY + 60,
                duration: 600,
            });

            this.tweens.add({
                targets: this.arrowTop,
                y: this.cameras.main.centerY - 80,
                scale: 0.333,
                alpha: 1,
                duration: 600,
            });

            this.createGoalsPanel(
                tutorialLevel.goals,
                1001,
                1002,
                1003,
                1004,
                0.4
            );
        }

        if (this.step === 3) {
            this.visibleGoals.forEach((goal) => {
                goal.destroy();
            });
            this.visibleGoals = [];
            this.arrowTop.destroy();

            this.tutorialTitle.setText("Внимание");
            this.tutorialText.setText(
                "Следи за количеством ходов,они ограничены. Если ты не достигнешь цели за оставшиеся ходы — проиграешь"
            );

            this.arrowLeft = this.add.sprite(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "tutorial_arrow_left"
            );
            this.arrowLeft.setOrigin(0.5);
            this.arrowLeft.setDepth(1001);
            this.arrowLeft.setScale(0);
            this.arrowLeft.setAlpha(0);
            this.tweens.add({
                targets: this.arrowLeft,
                x: this.cameras.main.centerX - 20,
                y: this.cameras.main.centerY - 150,
                scale: 0.333,
                alpha: 1,
                duration: 600,
            });

            this.movesBg.setDepth(1001);
            this.movesText.setDepth(1001);

            this.continueButton.destroy();

            this.playButton = this.add.sprite(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 230,
                "play_btn"
            );
            this.playButton.setOrigin(0.5);
            this.playButton.setScale(0.333);
            this.playButton.setDepth(1001);
            this.playButton.setInteractive({ useHandCursor: true });
            this.playButton.on("pointerdown", () => {
                this.nextStep();
                this.playButton.destroy();
                this.arrowLeft.destroy();
            });
        }

        if (this.step === 4) {
            window.localStorage.setItem(
                "isFirstLevelPlay",
                JSON.stringify(false)
            );
            this.scene.stop("Tutorial");
            this.scene.start("Game", { config: this.currentLevel });
        }
    }
    constructor() {
        super("Tutorial");
    }

    createDoubleRocketVertical(
        x: number,
        y: number,
        initialSize = 34
    ): Phaser.GameObjects.Container {
        const height = initialSize * (15 / 34); // сохраняем соотношение

        const rocketLeft = this.add.sprite(-8, 0, "rocket");
        rocketLeft.setDisplaySize(initialSize, height);
        rocketLeft.setAngle(-90);
        rocketLeft.setOrigin(0.5);

        const rocketRight = this.add.sprite(8, 0, "rocket");
        rocketRight.setDisplaySize(initialSize, height);
        rocketRight.setAngle(90);
        rocketRight.setOrigin(0.5);

        const container = this.add.container(x, y, [rocketLeft, rocketRight]);
        container.setSize(this.cellSize, this.cellSize);
        container.setDepth(5);

        container.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.cellSize, this.cellSize),
            Phaser.Geom.Rectangle.Contains
        );

        container.setData("type", "verticalHelper");
        container.setData("isHelper", true);
        container.setData("helperType", "verticalHelper");

        return container;
    }

    simulateTap = () => {
        this.finger.setScale(0.333);

        this.tweens.add({
            targets: this.finger,
            scale: 0.27,
            duration: 120,
            yoyo: true,
            ease: "Sine.easeInOut",
            onComplete: () => {
                this.time.delayedCall(1000, this.simulateTap); // ⏳ задержка между тапами
            },
        });
    };

    createDoubleRocketHorizontal(
        x: number,
        y: number,
        initialSize = 34
    ): Phaser.GameObjects.Container {
        const height = initialSize * (15 / 34); // сохраняем пропорции

        const rocketTop = this.add.sprite(0, 8, "rocket");
        rocketTop.setDisplaySize(initialSize, height);
        rocketTop.setAngle(0);
        rocketTop.setOrigin(0.5);

        const rocketBottom = this.add.sprite(0, -8, "rocket");
        rocketBottom.setDisplaySize(initialSize, height);
        rocketBottom.setAngle(180);
        rocketBottom.setOrigin(0.5);

        const container = this.add.container(x, y, [rocketTop, rocketBottom]);
        container.setSize(this.cellSize, this.cellSize);
        container.setDepth(5);

        container.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.cellSize, this.cellSize),
            Phaser.Geom.Rectangle.Contains
        );

        container.setData("type", "horizontalHelper");
        container.setData("isHelper", true);
        container.setData("helperType", "horizontalHelper");

        return container;
    }
    createGoalsPanel(
        goals: TutorialGoal[],
        bgDepth: number,
        iconDepth: number,
        circleDepth: number,
        textDepth: number,
        bgAlpha?: number
    ) {
        const panelY = this.offsetY - 40;
        const centerX = this.cameras.main.centerX;

        const panelWidth =
            this.cellSize * goals.length + this.gap + this.cellSize / 2;
        const panelHeight = 50;
        const cornerRadius = 16;

        // 🧠 Уникальный ключ текстуры на основе количества целей
        const bgKey = `goalsPanelBg_${goals.length}`;

        // 🎨 Генерируем текстуру, если ещё не была создана
        if (!this.textures.exists(bgKey)) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x2ac5fc, 0.85);
            graphics.fillRoundedRect(
                0,
                0,
                panelWidth,
                panelHeight,
                cornerRadius
            );
            graphics.strokeRoundedRect(
                0,
                0,
                panelWidth,
                panelHeight,
                cornerRadius
            );
            graphics.generateTexture(bgKey, panelWidth, panelHeight);
            graphics.destroy();
        }

        // 📦 Панель
        const background = this.add.image(centerX, panelY, bgKey);
        background.setOrigin(0.5);
        background.setDepth(bgDepth);
        background.setAlpha(bgAlpha);

        if (bgDepth >= 1000) {
            this.visibleGoals.push(background);
        }

        // 🧩 Отрисовка иконок и счётчиков
        const iconSpacing = 50;
        const totalWidth = (goals.length - 1) * iconSpacing;
        const startX = centerX - totalWidth / 2;

        this.goalIcons = {};

        goals.forEach((goal, index) => {
            const iconX = startX + index * iconSpacing;

            // Иконка
            const icon = this.add.sprite(iconX, panelY, goal.type);
            icon.setDisplaySize(42, 42);
            icon.setOrigin(0.5);
            icon.setDepth(iconDepth);

            // Кружок под счётчиком
            const circle = this.add.graphics();
            const radius = 12;
            const circleX = iconX + 12;
            const circleY = panelY + 10;

            circle.fillStyle(0x000000, 1);
            circle.fillCircle(radius, radius, radius);
            circle.setPosition(circleX - radius, circleY - radius);
            circle.setDepth(circleDepth);

            // Текст-счётчик
            const text = this.add.text(
                circleX,
                circleY,
                goal.count.toString(),
                {
                    font: "800 14px Nunito",
                    color: "#ffffff",
                }
            );
            text.setOrigin(0.5);
            text.setDepth(textDepth);
            text.setResolution(2);

            // Сохраняем для обновления прогресса
            this.goalIcons[goal.type] = {
                icon,
                circle,
                text,
                target: goal.count,
                current: 0,
            };

            if (iconDepth >= 1000) {
                this.visibleGoals.push(icon);
                this.visibleGoals.push(circle);
                this.visibleGoals.push(text);
            }
        });
    }

    init(data: { currentLevel: LevelConfig }) {
        this.currentLevel = data.currentLevel;
    }

    create() {
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const levelGrid = tutorialLevel.grid;

        this.cols = tutorialLevel.cols;
        this.rows = tutorialLevel.rows;

        const gap = this.gap;
        const cellSize = this.cellSize;
        const cols = this.cols;
        const rows = this.rows;

        const gridWidth = cols * (cellSize + gap) - gap;
        const gridHeight = rows * (cellSize + gap) - gap;

        const padding = 40;
        const availableWidth = this.cameras.main.width - padding;
        const availableHeight = this.cameras.main.height - padding;

        const scaleFactor = Math.min(
            1,
            availableWidth / gridWidth,
            availableHeight / gridHeight
        );
        this.scaleFactor = scaleFactor;
        // this.cameras.main.setZoom(scaleFactor);

        this.offsetX = (this.cameras.main.width / scaleFactor - gridWidth) / 2;
        this.offsetY =
            (this.cameras.main.height / scaleFactor - gridHeight) / 2;

        this.grid = [];

        console.log(scaleFactor);
        levelGrid.forEach((row, y) => {
            this.grid[y] = [];

            row.forEach((cell, x) => {
                const posX = this.offsetX + x * (cellSize + gap) + cellSize / 2;
                const posY = this.offsetY + y * (cellSize + gap) + cellSize / 2;

                const bg = this.add.image(posX, posY, "tile_bg");
                bg.setOrigin(0.5);
                bg.setDisplaySize(cellSize, cellSize);
                bg.setAlpha(0.8);
                bg.setDepth(1);

                let type = cell.type;
                let data = cell;

                console.log(type);
                let sprite:
                    | Phaser.GameObjects.Sprite
                    | Phaser.GameObjects.Container;

                if (data.isHelper && data.helperType === "verticalHelper") {
                    sprite = this.createDoubleRocketVertical(posX, posY);
                } else if (
                    data.isHelper &&
                    data.helperType === "horizontalHelper"
                ) {
                    sprite = this.createDoubleRocketHorizontal(posX, posY);
                } else if (data.isHelper && data.helperType === "discoball") {
                    sprite = this.add.sprite(posX, posY, type);
                    sprite.setOrigin(0.5);
                    sprite.setDisplaySize(cellSize - 10, cellSize - 10);
                    sprite.setInteractive();
                    sprite.setDepth(5);
                } else {
                    sprite = this.add.sprite(posX, posY, type);

                    sprite.setOrigin(0.5);
                    sprite.setDisplaySize(cellSize - 5, cellSize - 5);
                    sprite.setInteractive();
                    sprite.setDepth(5);
                }

                sprite.setData("gridX", x);
                sprite.setData("gridY", y);
                sprite.setData("type", type);

                for (const key in data) {
                    sprite.setData(key, data[key]);
                }

                this.grid[y][x] = sprite;
            });
        });

        this.movesBg = this.add.image(
            this.offsetX + 50,
            this.offsetY - 104,
            "moves_bg"
        );
        this.movesBg.setOrigin(0.5);
        this.movesBg.setDepth(100);
        this.movesBg.setDisplaySize(83, 40);

        this.movesText = this.add.text(
            this.movesBg.x,
            this.movesBg.y - 2,
            `${tutorialLevel.moves}/${tutorialLevel.moves}`,
            {
                font: "800 20px Nunito",
                color: "#0095ff",
                fontStyle: "bold",
            }
        );
        this.movesText.setOrigin(0.5);
        this.movesText.setDepth(101);
        this.movesText.setResolution(2);

        this.pauseButton = this.add.image(
            this.offsetX + cellSize * cols - 10,
            this.offsetY - 104,
            "pause"
        );
        this.pauseButton.setOrigin(0.5);
        this.pauseButton.setDepth(100);
        this.pauseButton.setDisplaySize(this.cellSize, this.cellSize);
        this.pauseButton.on("pointerdown", () => {
            this.scene.start("MainMenu", {});
        });

        this.createGoalsPanel(tutorialLevel.goals, 10, 11, 12, 13);

        this.grid.forEach((row, rowY) => {
            row.forEach((col, colX) => {
                if (colX === 1 || colX === 2 || colX === 3 || colX === 4) {
                    if (rowY === 0 || rowY === 1 || rowY === 2 || rowY === 3) {
                        const visibleTile = this.grid[rowY][colX];
                        if (visibleTile !== null)
                            this.visibleTiles.push(visibleTile);
                    }
                }
            });
        });
        const overlay = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "tutorial_overlay"
        );
        overlay.setDisplaySize(
            this.cameras.main.width,
            this.cameras.main.height
        );
        overlay.setOrigin(0.5);
        overlay.setDepth(100);

        this.visibleTiles.forEach((tile) => {
            const bg = this.add.image(tile.x, tile.y, "tile_bg");
            bg.setOrigin(0.5);
            bg.setDisplaySize(cellSize, cellSize);
            bg.setAlpha(0.4);
            bg.setDepth(1000);

            this.visibleTileBgs.push(bg);

            tile.setDepth(1001);
        });

        this.finger = this.add.image(
            this.cameras.main.centerX - 45,
            this.cameras.main.centerY - 5,
            "tutorial_finger"
        );
        this.finger.setScale(0.333);
        this.finger.setOrigin(0.5);
        this.finger.setDepth(1002);

        const startX = this.cameras.main.centerX - 35;
        const endX = this.cameras.main.centerX + 15;

        const playFingerAnimation = () => {
            this.fingerTween = this.tweens.add({
                targets: this.finger,
                x: endX,
                duration: 600,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    this.fingerTween = this.tweens.add({
                        targets: this.finger,
                        x: startX,
                        duration: 600,
                        ease: "Sine.easeInOut",
                        onComplete: () => {
                            this.fingerDelay = this.time.delayedCall(
                                1000,
                                playFingerAnimation
                            );
                        },
                    });
                },
            });
        };

        this.finger.setX(startX); // начальная позиция
        playFingerAnimation(); // запускаем цикл

        this.tutorialTitle = this.add.text(centerX, centerY + 90, "Три в ряд", {
            font: "800 28px Nunito",
            color: "#ffffff",
        });
        this.tutorialTitle.setOrigin(0.5);
        this.tutorialTitle.setDepth(1002);
        this.tutorialTitle.setResolution(2);

        this.tutorialText = this.add.text(
            centerX,
            centerY + 150,
            "Перемещайте соседние иконки, соберите три одинаковых в ряд",
            {
                font: "600 18px Nunito",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 320, useAdvancedWrap: true },
            }
        );
        this.tutorialText.setOrigin(0.5);
        this.tutorialText.setDepth(1002);
        this.tutorialText.setResolution(2);

        this.continueButton = this.add
            .image(centerX, centerY + 230, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.nextStep();
            });

        this.continueButton.setDepth(1002);

        EventBus.emit("current-scene-ready", this);
    }
}
