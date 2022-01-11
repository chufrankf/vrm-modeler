import React from 'react'
import { useControls } from 'leva'
import { SingleCharacterDisplay } from './SingleCharacterDisplay'
import { CharacterModelContext, CharacterModelState } from '../contexts/CharacterModel'

type AllPoses = {
    [x: string]: string
}
const getAllPoses = (): Promise<AllPoses> => new Promise ((resolve, reject) => {
    fetch("/poses/allposes.json", {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then( response => response.json() )
    .then( (data: AllPoses ) => {
        resolve(data);
    })
    .catch(reject)
})

export function InteractiveCharacterDisplay() {
    const { characterModelState, setCharacterModelState } = React.useContext(CharacterModelContext)
    const [ poseUrlMap, setPoseUrlMap ] = React.useState<AllPoses>({'default':'/poses/pose.test.json'})

    const [ values, set ] = useControls(() => ({
        pose: {
            value: 'default',
            options: { ...Object.fromEntries(Object.entries(poseUrlMap).map(([k]) => [k, k])) }
        },
        clothes: {
            value: 'butterfly',
            options: { 'default': 'default', 'butterfly': 'butterfly' }
        }
    }), [poseUrlMap])

    React.useEffect( () => {
        getAllPoses().then((allPoses) => {
            setPoseUrlMap( allPoses )
        })
    }, [])

    React.useEffect( () => {
        let nextState: Partial<CharacterModelState> = {}
        nextState.poseUrl = poseUrlMap[values.pose]
        setCharacterModelState(prevState => ({
            ...prevState,
            ...nextState
        }))
    }, [values])

    return(
        <SingleCharacterDisplay/>
    )
}