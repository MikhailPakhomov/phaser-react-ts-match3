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
const dpr = window.devicePixelRatio || 1;
export class MainMenu extends Scene {
    mainMenuTitle: Phaser.GameObjects.Text;
    isFirstLevelPlay!: boolean;
    isFirstLaunch!: boolean;
    isShowInfo!: boolean;
    isShowInfoPromo!: boolean;
    levelId!: number | undefined;
    levelsArray!: LevelConfig[];
    gameOver!: boolean;
    isFinal!: boolean;
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    coordsLevels: CoordLevel[] = [];
    completedCount: number;

    isInputLocked = false;

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

        this.coordsLevels = this.coordsLevels.filter(
            (entry) => entry.id !== levelId
        );
    }

    music:
        | Phaser.Sound.WebAudioSound
        | Phaser.Sound.HTML5AudioSound
        | Phaser.Sound.NoAudioSound;
    create() {
        
        this.time.delayedCall(0, () => {
            const soundData = this.cache.audio.get("background");
            if (soundData && !this.music) {
                this.music = this.sound.add("background", { loop: true, volume: 0.3 });
                this.music.play();
            }
        });
      
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
        const cellWidth = 64*dpr;
        const cellHeight = 66*dpr;
        const spacing = 0;

        const gridWidth = cols * cellWidth + (cols - 1) * spacing;
        const gridHeight = rows * cellHeight + (rows - 1) * spacing;
        const startX = centerX - gridWidth / 2 + cellWidth / 2;
        let startY = centerY - gridHeight / 2 + cellHeight / 2;

        const padding = 20; // запас по краям
        const availableWidth = this.cameras.main.width - padding;
        const availableHeight = this.cameras.main.height - padding;
        const scaleFactor = Math.min(
            1,
            availableWidth / gridWidth,
            availableHeight / gridHeight
        );

        this.cameras.main.setZoom(scaleFactor);

        this.mainMenuTitle = this.add
            .text(
                centerX,
                startY - 70*dpr,
                "Пройди все уровни, чтобы собрать пазл",
                {
                    font: `600 ${18*dpr}px Nunito`,
                    color: "#ffffff",
                    align: "center",
                    wordWrap: { width: 278*dpr },
                }
            )
            .setResolution(dpr < 2 ? 2 : dpr)
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

        if (this.gameOver) {
            setTimeout(() => {
                this.sound.add("full_puzzle").play();
            }, 200);

            this.mainMenuTitle.destroy();
            startY = startY - 130*dpr;

            this.puzzleFull = this.add.image(
                centerX,
                centerY - 130*dpr,
                "puzzle_full"
            );

            this.puzzleFull.setDisplaySize(320*dpr, 330*dpr);
            this.puzzleFull.setOrigin(0.5);
            this.puzzleFull.setDepth(20);
            this.puzzleFull.setAlpha(0);

            this.tweens.add({
                targets: this.puzzleFull,
                alpha: 1,
                duration: 1200,
                ease: "Cubic.easeInOut",
            });
            const showInfoText = this.add.text(
                this.cameras.main.centerX - 130*dpr,
                this.cameras.main.centerY + 60*dpr,
                "Инструкция по активации промокода",
                {
                    font: `700 ${14*dpr}px Nunito`,
                    color: "#ffffff",
                    align: "center",
                }
            );
            showInfoText.setInteractive({ useHandCursor: true });
            showInfoText.setResolution(dpr < 2 ? 2 : dpr);
            showInfoText.on("pointerdown", () => {
                this.sound.add("click").play();
                this.scene.pause("MainMenu");
                this.scene.launch("PromoInfo");
            });

            const showInfoTextBounds = showInfoText.getBounds();
            const underline = this.add.graphics();
            underline.lineStyle(1, 0xffffff, 1);
            underline.beginPath();
            underline.moveTo(
                showInfoTextBounds.left,
                showInfoTextBounds.bottom + 1
            );
            underline.lineTo(
                showInfoTextBounds.right,
                showInfoTextBounds.bottom + 1
            );
            underline.strokePath();

            const copyBg = this.add.image(0, 0, "copy_bg");
            copyBg.setDisplaySize(278*dpr, 68*dpr);
            copyBg.setOrigin(0.5);

            const copyButton = this.add.image(110*dpr, 0, "copy_btn");
            copyButton.setDisplaySize(28*dpr, 28*dpr);
            copyButton.setOrigin(0.5);

            const copyText = this.add.text(-50*dpr, 10*dpr, "Скопировать промокод", {
                font: `600 ${12*dpr}px Nunito`,
                color: "#0083C4",
            });
            copyText.setOrigin(0.5);
            copyText.setResolution(dpr < 2 ? 2 : dpr);

            const promoText = this.add
                .text(-65*dpr, -10*dpr, "YOTA2025", {
                    font: `800 ${20*dpr}px Nunito`,
                    color: "#0083C4",
                })
                .setOrigin(0.5)
                .setResolution(dpr < 2 ? 2 : dpr);

            const copyContainer = this.add.container(centerX, centerY + 140*dpr, [
                copyBg,
                copyButton,
                copyText,
                promoText,
            ]);

            copyContainer.setDisplaySize(278*dpr, 68*dpr);
            copyContainer.setScale(1);

            copyContainer
                .setInteractive(
                    new Phaser.Geom.Rectangle(-140*dpr, -35*dpr, 278*dpr, 68*dpr),
                    Phaser.Geom.Rectangle.Contains
                )
                .on("pointerover", () => this.input.setDefaultCursor("pointer"))
                .on("pointerout", () => this.input.setDefaultCursor("default"))
                .on("pointerdown", () => {
                    this.sound.add("click").play();
                    if (navigator.clipboard && navigator.clipboard.writeText){
                        navigator.clipboard
                        .writeText("YOTA2025")
                        .then(() => {
                            copyText.setText("Скопировано");
                            copyText.setPosition(-75*dpr, 10*dpr);
                            copyText.setOrigin(0.5);

                            setTimeout(() => {
                                copyText.setText("Скопировать промокод");
                                copyText.setPosition(-50*dpr, 10*dpr);
                            }, 3000);
                        })
                        .catch((err) => {
                            console.error("Ошибка копирования:", err);
                            copyText.setText("Ошибка ❌");
                        });
                    }

                });
        }

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
                tile.setPosition(x, y);
                tile.setDisplaySize(cellWidth, cellHeight);
            }

            let label: Phaser.GameObjects.Text | undefined;

            if (!isCompleted) {
                tile.setInteractive({ useHandCursor: true }).on(
                    "pointerdown",
                    () => {
                        if (this.isInputLocked) return;

                        this.sound.add("click").play();
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

                            //Тест экрана победы
                            // this.scene.start("WinScene", {
                            //     levelId: level.id,
                            //     difficult: level.difficult,
                            // });

                            //Тест экрана промокода
                            // this.scene.start("WinScene", {
                            //     isFinal: true,
                            // });
                            //Тест экрана поражения
                            // this.scene.start("LoseScene", {});
                        }
                    }
                );

                label = this.add
                    .text(x, y, `${level.id}`, {
                        font: `800 ${24*dpr}px Nunito`,
                        color: levelTextColor[level.difficult],
                    })
                    .setResolution(dpr < 2 ? 2 : dpr)
                    .setOrigin(0.5);
            }

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
            this.cameras.main.height - 120*dpr,
            "logo"
        );
        logo.setOrigin(0.5);
        logo.setDepth(1);
        logo.setScale(0.333 * dpr);

        if (this.isShowInfo) {
            this.isInputLocked = true;

            const overlay = this.add.image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "tutorial_overlay"
            );
            overlay.setDisplaySize(
                this.cameras.main.width + 10,
                this.cameras.main.height + 10
            );
            overlay.setOrigin(0.5);
            overlay.setDepth(100);

            const bgInfo = this.add.image(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 20*dpr,
                "info_bg"
            );
            bgInfo.setDisplaySize(300*dpr, 244*dpr);
            bgInfo.setOrigin(0.5);
            bgInfo.setDepth(1001);

            const infoTitle = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 85*dpr,
                "Это бета-версия игры, возможны ошибки",
                {
                    font: `800 ${20*dpr}px Nunito`,
                    color: "#434C5D",
                    align: "center",
                    wordWrap: { width: 300*dpr },
                }
            );
            infoTitle.setOrigin(0.5);
            infoTitle.setDepth(1002);
            infoTitle.setResolution(dpr < 2 ? 2 : dpr);

            const infoText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 35*dpr,
                "Мы продолжаем улучшать игру, чтобы играть было приятнее!",
                {
                    font: `600 ${16*dpr}px Nunito`,
                    color: "#434C5D",
                    align: "center",
                    wordWrap: { width: 300*dpr },
                }
            );
            infoText.setOrigin(0.5);
            infoText.setDepth(1002);
            infoText.setResolution(dpr < 2 ? 2 : dpr);

            const infoBtn = this.add
                .image(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 40*dpr,
                    "info_btn"
                )
                .setOrigin(0.5)
                .setDisplaySize(196*dpr, 48*dpr)
                .setDepth(1002)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    this.isInputLocked = false;
                    this.sound.add("click").play();
                    window.localStorage.setItem(
                        "isShowInfo",
                        JSON.stringify(false)
                    );
                    this.scene.stop("MainMenu", {});
                    this.scene.start("MainMenu", {});
                });
        }

        if (this.completedCount === 25) {
            if (this.gameOver) return;

            this.scene.stop("MainMenu", {});
            this.scene.start("WinScene", {
                isFinal: true,
            });
            return;
        }

        if (this.levelId) {
            console.log(this.levelId);
            this.puzzle = this.add.image(
                centerX,
                centerY - 100*dpr,
                `puzzle_${this.levelId}`
            );
            this.puzzle.setDisplaySize(172*dpr, 192*dpr);
            this.puzzle.setOrigin(0.5);
            this.puzzle.setDepth(10);

            const currentLevelcoords = this.coordsLevels.find((level) => {
                return level.id === this.levelId;
            });

            if (currentLevelcoords) {
                currentLevelcoords.tile.disableInteractive();
                currentLevelcoords.label.destroy();
            }
            setTimeout(() => {
                this.sound.add("move_puzzle").play();
            }, 200);
            this.tweens.add({
                targets: this.puzzle,
                x: currentLevelcoords?.x,
                y: currentLevelcoords?.y,
                scale: 0.333*dpr,
                duration: 700,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    this.puzzle.setDisplaySize(cellWidth, cellHeight);
                    currentLevelcoords?.tile.destroy();
                    this.coordsLevels = this.coordsLevels.filter(
                        (entry) => entry.id !== this.levelId
                    );

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
                    if (this.completedCount === 25) {
                        if (this.gameOver) return;

                        this.scene.stop("MainMenu", {});
                        this.scene.start("WinScene", {
                            isFinal: true,
                        });
                        return;
                    }
                },
            });
        }

        EventBus.emit("current-scene-ready", this);
    }

    init(data: { revealPiece?: number; isShowInfoPromo?: boolean }) {
        this.levelId = data.revealPiece;

        if (data.isShowInfoPromo) {
            this.isShowInfoPromo = data.isShowInfoPromo;
        }

        this.isFirstLaunch = JSON.parse(
            window.localStorage.getItem("isFirstLaunch")
        );
        if (this.isFirstLaunch === null) {
            this.isFirstLaunch = true;
            window.localStorage.setItem("isFirstLaunch", JSON.stringify(false));
        } else {
            this.isFirstLaunch = false;
        }

        this.isShowInfo = JSON.parse(window.localStorage.getItem("isShowInfo"));
        if (this.isShowInfo === null) {
            this.isShowInfo = false;
            window.localStorage.setItem("isShowInfo", JSON.stringify(false));
        }

        this.isFirstLevelPlay = JSON.parse(
            window.localStorage.getItem("isFirstLevelPlay")
        );

        if (this.isFirstLevelPlay === null) {
            this.isFirstLevelPlay = true;
            window.localStorage.setItem(
                "isFirstLevelPlay",
                JSON.stringify(true)
            );
        }

        this.gameOver = JSON.parse(window.localStorage.getItem("gameOver"));
        if (!this.gameOver) {
            this.gameOver = false;
        }

        this.levelsArray = JSON.parse(window.localStorage.getItem("levels"));
        if (!this.levelsArray) {
            window.localStorage.setItem("levels", JSON.stringify(levelConfigs));
            this.levelsArray = JSON.parse(
                window.localStorage.getItem("levels")
            );
        }

        this.completedCount = this.levelsArray.reduce((count, level) => {
            if (level.isCompleted) {
                count++;
            }
            return count;
        }, 0);
        console.log(this.completedCount);
    }
}
