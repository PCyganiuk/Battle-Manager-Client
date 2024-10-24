import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';

const GameMap = () => {
    const pixiContainerRef = useRef<HTMLDivElement | null>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        if (!appRef.current) {
            const app = new PIXI.Application();
            app.renderer.resize(800, 600);
            app.renderer.background.color = 0x1099bb;
            

            appRef.current = app;
            console.log('Pixi App:', appRef.current);

            if (pixiContainerRef.current) {
                pixiContainerRef.current.appendChild(app.canvas as HTMLCanvasElement);
            }

            PIXI.Assets.load(`/assets/smolbartek.png`).then((texture: PIXI.Texture) => {
                const tile = new PIXI.Sprite(texture);
                tile.x = 100;
                tile.y = 100;
                tile.width = 64;
                tile.height = 64;
                app.stage.addChild(tile);
            });
            app.ticker.add(() => {
                app.renderer.render(app.stage);
              });

        }   

        return () => {
            appRef.current?.destroy(true, { children: true });
            appRef.current = null;
        };

    }, []);
    return (
        <div
             ref={pixiContainerRef}
             style={{ width: '800px', height: '600px', border: '1px solid black' }}
             
        />
    );

};

export default GameMap;