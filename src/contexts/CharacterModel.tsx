import React from "react";
import { ModelMeshes, useModel } from '../utils/model/model'
import { useMaterials } from '../utils/model/materials'
import { usePoses } from '../utils/model/poses'

export type CharacterModelState =  {
    modelUrl: string,
    materials: Map<string, string>,
    poseUrl: string
}
export type CharacterModelContextType = {
    characterMeshes: ModelMeshes,
    isLoading: boolean,
    characterModelState: CharacterModelState,
    setCharacterModelState: React.Dispatch<React.SetStateAction<CharacterModelState>>,
}
export const CharacterModelContext = React.createContext<CharacterModelContextType>({
    characterMeshes: { id: "", gltf: null, vrm: null },
    isLoading: false,
    characterModelState: {
        modelUrl: "",
        materials: new Map(),
        poseUrl: ""
    },
    setCharacterModelState: () => null,
})

export const CharacterModelProvider: React.FC<{cms: CharacterModelState}> = ({children, cms}) => {
    const [characterModel, setCharacterModel] = React.useState<CharacterModelState>(cms);
    const [characterMeshes, isLoading] = useModel(characterModel.modelUrl);
    useMaterials(characterModel.materials, characterMeshes);
    usePoses(characterModel.poseUrl, characterMeshes);

    return (
        <CharacterModelContext.Provider value={{ 
            isLoading: isLoading,
            characterMeshes: characterMeshes,
            characterModelState: characterModel, 
            setCharacterModelState: setCharacterModel}}
        >
            { children }
        </CharacterModelContext.Provider>
    )
}
