import React from 'react'
import { SingleCharacterDisplay } from '../components/SingleCharacterDisplay'
import {CharacterModelState, CharacterModelProvider} from '../contexts/CharacterModel'

const initialCharacterModel: CharacterModelState = {
    modelUrl: '/model/test_naming.vrm',
    materials: new Map([]),
    poseUrl: '/poses/pose.test.json',
}

export function Bare() {
    return(
        <CharacterModelProvider cms={initialCharacterModel}>
            <div className="basicApp" style={{width: '100vw', height: '100vh'}}>
                <SingleCharacterDisplay/>
            </div>
        </CharacterModelProvider>
    )
}