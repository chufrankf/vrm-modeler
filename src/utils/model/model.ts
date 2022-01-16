import React from 'react'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM } from '@pixiv/three-vrm'
import { LRUCache } from '../LRU'

export type ModelMeshes = {
    id: string,
    gltf: GLTF | null,
    vrm: VRM | null,
}
export const useModel = (modelUrl: string): [ModelMeshes, boolean] => {
    const GltfLoader = React.useRef(new GLTFLoader());
    const GltfCache = React.useRef(new LRUCache<GLTF>(10));
    const VRMCache = React.useRef(new LRUCache<VRM>(10));
    
    const [characterMeshes, setCharacterMeshes] = React.useState<ModelMeshes>( { id: "", gltf: null, vrm: null } )
    const [isLoading, setIsLoading] = React.useState(false);

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

    React.useEffect(() => {
        if( !modelUrl ) return;

        setIsLoading(true)
        const id = modelUrl;
        getGLTF(id).then((gltf) => {
            console.log("Got Character GLTF", gltf)
            getVRM(id, gltf).then((vrm) => {
                console.log("Set Character VRM", vrm)
                if( characterMeshes.id !== id ) {
                    setCharacterMeshes({ id: id, gltf: gltf, vrm: vrm })
                }
            }).finally(() => {
                setIsLoading(false)
            });
        }).catch((error) => {
            console.log("Error loading GLTF", error)
            setIsLoading(false)
        });
    }, [modelUrl])

    return [characterMeshes, isLoading]
}