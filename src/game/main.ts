import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { WinScene } from "./scenes/WinScene";
import { LoseScene } from "./scenes/LoseScene";
import { Onboarding } from "./scenes/Onboarding";
import { Tutorial } from "./scenes/Tutorial";
import { Pause } from "./scenes/Pause";
import { PromoInfo } from "./scenes/PromoInfo";

const deviceWidth = window.innerWidth;
const deviceHeight = window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#00adef",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: deviceWidth*window.devicePixelRatio,
        height: deviceHeight*window.devicePixelRatio,
    },
   
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        WinScene,
        LoseScene,
        Onboarding,
        Tutorial,
        Pause,
        PromoInfo,
    ],
};

const StartGame = (parent: string) => {
    (async () => {

        const game = new Game({
            ...config,
            parent,
        });
        window.game = game;

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            const scale = Math.min(
                width / config.scale!.width!,
                height / config.scale!.height!
            );

            const canvas = game.canvas;
            canvas.style.width = config.scale!.width! * scale + "px";
            canvas.style.height = config.scale!.height! * scale + "px";

            canvas.style.margin = "auto";
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.bottom = "0";
            canvas.style.right = "0";
        };

        resize();
        window.addEventListener("resize", resize);

    })();
};


export default StartGame;
