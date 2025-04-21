import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

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
    resolution: window.devicePixelRatio, // ← максимально чёткая отрисовка
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: deviceWidth,
        height: deviceHeight,
    },
    render: {
        antialias: true,     // сглаживание округлых форм
        pixelArt: false,     // отключить пиксельную графику
        roundPixels: false,  // не округлять координаты
    },
    scene: [Boot, Preloader, MainMenu, MainGame],
};

const StartGame = (parent: string) => {
    return new Game({
        ...config,
        parent,
        resolution: window.devicePixelRatio > 1 ? 2 : 1,
    } as Phaser.Types.Core.GameConfig & { resolution: number });
};

export default StartGame;
