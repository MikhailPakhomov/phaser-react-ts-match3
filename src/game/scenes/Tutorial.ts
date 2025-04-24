import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { LevelConfig } from "../levels/levelConfig";
import { tutorialLevel, TutorialGoal } from "../levels/tutorialConfig";

export class Tutorial extends Scene {
    private step: number = 0;
    currentLevel!: LevelConfig;
    private continueButton!: Phaser.GameObjects.Image;

    movesText!: Phaser.GameObjects.Text;
    movesBg!: Phaser.GameObjects.Image;
    pauseButton!: Phaser.GameObjects.Image;

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
    createGoalsPanel(goals: TutorialGoal[]) {
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
        background.setDepth(10);

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
            icon.setDepth(11);

            // Кружок под счётчиком
            const circle = this.add.graphics();
            const radius = 12;
            const circleX = iconX + 12;
            const circleY = panelY + 10;

            circle.fillStyle(0x000000, 1);
            circle.fillCircle(radius, radius, radius);
            circle.setPosition(circleX - radius, circleY - radius);
            circle.setDepth(12);

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
            text.setDepth(13);
            text.setResolution(2);

            // Сохраняем для обновления прогресса
            this.goalIcons[goal.type] = {
                icon,
                circle,
                text,
                target: goal.count,
                current: 0,
            };
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

        this.createGoalsPanel(tutorialLevel.goals);

        const visibleTiles: Phaser.GameObjects.Sprite[] = [];

        this.grid.forEach((row, rowY) => {
            row.forEach((col, colX) => {
                if (colX === 2 || colX === 3 || colX === 4) {
                    if (rowY === 0 || rowY === 1 || rowY === 2 || rowY === 3) {
                        const visibleTile = this.grid[rowY][colX];
                        if (visibleTile !== null)
                            visibleTiles.push(visibleTile);
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

        visibleTiles.forEach((tile) => {
            const bg = this.add.image(tile.x, tile.y, "tile_bg");
            bg.setOrigin(0.5);
            bg.setDisplaySize(cellSize, cellSize);
            bg.setAlpha(0.4);
            bg.setDepth(1000);

            tile.setDepth(1001);
        });

        const finger = this.add.image(
            this.cameras.main.centerX - 45,
            this.cameras.main.centerY - 5,
            "tutorial_finger"
        );
        finger.setScale(0.333);
        finger.setOrigin(0.5);
        finger.setDepth(1002);

        const startX = this.cameras.main.centerX - 35;
        const endX = this.cameras.main.centerX + 10;

        const playFingerAnimation = () => {
            this.tweens.add({
                targets: finger,
                x: endX,
                duration: 600,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    this.tweens.add({
                        targets: finger,
                        x: startX,
                        duration: 600,
                        ease: "Sine.easeInOut",
                        onComplete: () => {
                            this.time.delayedCall(1000, playFingerAnimation);
                        },
                    });
                },
            });
        };

        finger.setX(startX); // начальная позиция
        playFingerAnimation(); // запускаем цикл

        const tutorialTitle = this.add.text(
            centerX,
            centerY + 90,
            "Три в ряд",
            {
                font: "800 28px Nunito",
                color: "#ffffff",
            }
        );
        tutorialTitle.setOrigin(0.5);
        tutorialTitle.setDepth(1002);

        const tutorialText = this.add.text(
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
        tutorialText.setOrigin(0.5);
        tutorialText.setDepth(1002);

        this.continueButton = this.add
            .image(centerX, centerY + 230, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.nextStep();
            });

        if (this.step === 1) {
            this.grid[2][4]?.destroy();
            this.grid[2][4] = this.add
                .sprite(
                    this.offsetX + 2 * cellSize,
                    this.offsetY + 4 * cellSize,
                    "horizontalHelper"
                )
                .setScale(0.5)
                .setOrigin(0.5)
                .setDepth(1001);
        }

        this.continueButton.setDepth(1002);

        EventBus.emit("current-scene-ready", this);
    }
}
