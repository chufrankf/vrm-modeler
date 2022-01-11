import React from "react";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MToonMaterial, RawVector4, VRM, VRMPose } from '@pixiv/three-vrm'
import { LRUCache } from "../utils/LRU";
import { TextureLoader } from "three";

type ModelItemState<Type> = {
    id: string,
    value: Type | null
}
export type CharacterModelState =  {
    modelUrl: string,
    materials: Map<string, string>,
    poseUrl: string
}
export type CharacterModelContextType = {
    characterVRM: ModelItemState<VRM>,
    characterGLTF: ModelItemState<GLTF>,
    characterModelState: CharacterModelState,
    setCharacterModelState: React.Dispatch<React.SetStateAction<CharacterModelState>>,
}
export const CharacterModelContext = React.createContext<CharacterModelContextType>({
    characterVRM: { value: null, id: "" },
    characterGLTF: { value: null, id: "" },
    characterModelState: {
        modelUrl: "",
        materials: new Map(),
        poseUrl: ""
    },
    setCharacterModelState: () => null,
})

export const CharacterModelProvider: React.FC<{cms: CharacterModelState}> = ({children, cms}) => {
    const TexLoader = React.useRef(new TextureLoader())
    const GltfLoader = React.useRef(new GLTFLoader());
    const GltfCache = React.useRef(new LRUCache<GLTF>(10));
    const VRMCache = React.useRef(new LRUCache<VRM>(10));
    const PoseCache = React.useRef(new LRUCache<VRMPose>(20));

    const [characterModel, setCharacterModel] = React.useState<CharacterModelState>(cms);
    const [characterGLTF, setCharacterGLTF] = React.useState<ModelItemState<GLTF>>( { value: null, id: "" } )
    const [characterVRM, setCharacterVRM] = React.useState<ModelItemState<VRM>>( { value: null, id: "" } )

    const getGLTF = (url: string): Promise<GLTF> => new Promise((resolve, reject) => {
        const foundCache = GltfCache.current.get(url);
        if( foundCache ) {
            resolve(foundCache);
        } else {
            GltfLoader.current.load( url, (g) => {
                GltfCache.current.put( url, g);
                resolve(g);
            }, (progress) => {
                console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' )
            }, (error) => {
                reject(error);
            } );
        }
    })

    const getVRM = (id: string, g: GLTF): Promise<VRM> => new Promise ((resolve, reject) => {
        const foundCache = VRMCache.current.get(id);
        if( foundCache ) {
            resolve(foundCache);
        } else {
            VRM.from(g).then((v: VRM) => {
                VRMCache.current.put(id, v);
                resolve(v);
            })
        }
    })

    type PoseJSON = {
        rotations: { [s: string]: RawVector4 }
    }
    const getPose = (url: string): Promise<VRMPose> => new Promise ((resolve, reject) => {
        const foundCache = PoseCache.current.get(url);
        if( foundCache ) {
            resolve(foundCache);
        } else {
            fetch(url, {
                headers : { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then( response => response.json() )
            .then( (data: PoseJSON ) => {
                const pose: VRMPose = {}
                for( const [key, value] of Object.entries<RawVector4>(data.rotations) ) {
                    pose[key] = {
                        rotation: value
                    }
                }
                PoseCache.current.put(url, pose);
                resolve(pose);
            })
            .catch(reject)
        }
    })

    type TextureItem = {type: string, texture: THREE.Texture};
    const getAllMaterials = (materials: Map<string,string>): Promise<TextureItem>[] => {
        const promises: Promise<TextureItem>[] = [];
        materials.forEach( (value, key) => {
            promises.push( new Promise((resolve, reject) => resolve({
                type: key, 
                texture: TexLoader.current.load(value)
            })));
        })
        return promises;
    }

    React.useEffect(() => {
        if( !characterModel.modelUrl ) return;

        const id = characterModel.modelUrl;
        getGLTF(characterModel.modelUrl).then((gltf) => {
            if( characterGLTF.id !== id ) {
                setCharacterGLTF({ value: gltf, id: id });
                console.log("Set Character GLTF", gltf)
            }
        }).catch((error) => {
            console.log("Error loading GLTF", error)
        });
    }, [characterModel.modelUrl])

    React.useEffect(() => {
        if( !characterGLTF.value ) return;

        const id = characterGLTF.id;
        getVRM(id, characterGLTF.value).then((vrm) => {
            // Only set the value of the new vrm if the id is different than the current vrm
            // Otherwise we should just apply the materials and poses to the current vrm
            if( characterVRM.id !== id ) {
                setCharacterVRM({ id: id, value: vrm })
                console.log("Set Character VRM", vrm)
            }
            
            // Apply all materials
            if( characterModel.materials.size > 0 ){
                Promise.all(getAllMaterials(characterModel.materials)).then( (textureItems) => {
                    if( vrm.materials ) {
                        console.log("Applying Materials", textureItems)
                        for( const item of textureItems) {
                            item.texture.flipY = false;
                            const mat = vrm.materials.find(mat => mat.name === item.type );
                            if( mat instanceof MToonMaterial ) {
                                mat.mainTex = item.texture
                                mat.shouldApplyUniforms = true
                            }
                        }
                        vrm.update(0)
                    }
                });
            }
            
            // Apply Poses
            if( characterModel.poseUrl ) {
                getPose(characterModel.poseUrl).then((vrmPose) => {
                    if( vrm.humanoid ) {
                        console.log("Applying Pose", vrmPose)
                        vrm.humanoid.setPose(vrmPose);
                    }
                })
            }
        })

    }, [characterGLTF.id, JSON.stringify([...characterModel.materials.entries()].sort()), characterModel.poseUrl])

    return (
        <CharacterModelContext.Provider value={{ 
            characterVRM: characterVRM, 
            characterGLTF: characterGLTF, 
            characterModelState: characterModel, 
            setCharacterModelState: setCharacterModel}}
        >
            { children }
        </CharacterModelContext.Provider>
    )
}
