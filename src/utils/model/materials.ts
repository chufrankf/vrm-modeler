import React from 'react'
import { MToonMaterial, RawVector4, VRM, VRMPose } from '@pixiv/three-vrm'
import { ModelMeshes } from './model'
import { TextureLoader } from "three";


export const useMaterials = (materials: Map<string, string>, model: ModelMeshes): void => {
    const TexLoader = React.useRef(new TextureLoader())

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
        const vrm = model.vrm;
        if( !vrm ) {
            return;
        }

        // Apply all materials
        if( materials.size > 0 ){
            Promise.all(getAllMaterials(materials)).then( (textureItems) => {
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
    }, [model.id, JSON.stringify([...materials.entries()].sort())])

}