import React from 'react'
import { InteractiveCharacterDisplay } from '../components/InteractiveCharacterDisplay'
import {CharacterModelState, CharacterModelProvider} from '../contexts/CharacterModel'

const initialCharacterModel: CharacterModelState = {
    modelUrl: '/model/three-vrm-girl.vrm',
    materials: new Map([['Tops','/clothes/shirts/purple-butterfly.png']]),
    poseUrl: '/poses/pose.test.json',
}

export function Interactive() {
    return(
        <CharacterModelProvider cms={initialCharacterModel}>
            <div className="basicApp" style={{width: '100vw', height: '100vh'}}>
                <InteractiveCharacterDisplay/>
            </div>
        </CharacterModelProvider>
    )
}