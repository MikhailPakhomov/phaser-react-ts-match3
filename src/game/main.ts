import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { WinScene } from "./scenes/WinScene";
import { LoseScene } from "./scenes/LoseScene";
import { Onboarding } from "./scenes/Onboarding";
import { Tutorial } from "./scenes/Tutorial";
import { Pause } from "./scenes/Pause";
import { PromoInfo } from "./scenes/PromoInfo";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

const deviceWidth = window.innerWidth;
const deviceHeight = window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#00adef",

    width: deviceWidth,
    height: deviceHeight,

    resolution: window.devicePixelRatio, // 📱 Чёткая отрисовка на retina и мобилках

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: deviceWidth,
        height: deviceHeight,
    },

    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
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
        await document.fonts.load("24px 'Nunito'");
        await document.fonts.load("800 24px 'Nunito'");

        return new Game({
            ...config,
            parent,
            resolution: window.devicePixelRatio > 1 ? 2 : 1,
        } as Phaser.Types.Core.GameConfig & { resolution: number });
    })();
};

export default StartGame;
