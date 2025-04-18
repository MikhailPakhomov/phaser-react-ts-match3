import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    backgroundColor: "#00adef",
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
    scale: {
        mode: Phaser.Scale.FIT, // Масштабировать по размеру экрана
        autoCenter: Phaser.Scale.CENTER_BOTH, // Центрировать по горизонтали и вертикали
        width: 392,
        height: 640,
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
