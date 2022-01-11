import React from 'react'
import { useControls } from 'leva'
import { SingleCharacterDisplay } from './SingleCharacterDisplay'
import { CharacterModelContext, CharacterModelState } from '../contexts/CharacterModel'

type PoseUrls = {
    [x: string]: string
}
const getAllPoses = (): Promise<PoseUrls> => new Promise ((resolve, reject) => {
    fetch("/poses/poseUrls.json", {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then( response => response.json() )
    .then( (data: PoseUrls ) => {
        resolve(data);
    })
    .catch(reject)
})

type ClothingUrls = {
    [x:string] : {
        bodyType: string,
        urls: {
            [x: string]: string
        }
    }
}
const getClothingUrls = (): Promise<ClothingUrls> => new Promise ((resolve, reject) => {
    fetch("/clothes/clothingUrls.json", {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then( response => response.json() )
    .then( (data: ClothingUrls) => {
        resolve(data);
    })
    .catch(reject);
})

export function InteractiveCharacterDisplay() {
    const { characterModelState, setCharacterModelState } = React.useContext(CharacterModelContext)
    const [ poseUrlMap, setPoseUrlMap ] = React.useState<PoseUrls>({'default':'/poses/pose.test.json'})
    const [ clothingUrlsMap, setClothingUrlsMap ] = React.useState<ClothingUrls>({
        default: {
            bodyType: "shirt_pants",
            urls: {}
        }
    })

    const [ values ] = useControls(() => ({
        pose: {
            value: 'default',
            options: { ...Object.fromEntries(Object.entries(poseUrlMap).map(([k]) => [k, k]))}
        },
        outfit: {
            value: 'default',
            options: { ...Object.fromEntries(Object.entries(clothingUrlsMap).map(([k]) => [k, k]))}
        }
    }), [poseUrlMap, clothingUrlsMap])

    React.useEffect( () => {
        Promise.all([
            getAllPoses(),
            getClothingUrls()
        ]).then( ([ poseUrls, clothingUrls ]) => {
            setPoseUrlMap( poseUrls );
            setClothingUrlsMap( clothingUrls );
        })
    }, [])

    React.useEffect( () => {
        let nextState: Partial<CharacterModelState> = {}
        nextState.poseUrl = poseUrlMap[values.pose]
        nextState.materials = new Map( Object.entries(clothingUrlsMap[values.outfit].urls) )
        setCharacterModelState(prevState => ({
            ...prevState,
            ...nextState
        }))
    }, [values])

    return(
        <SingleCharacterDisplay/>
    )
}