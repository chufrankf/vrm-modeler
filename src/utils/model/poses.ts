import React from 'react'
import { MToonMaterial, RawVector4, VRM, VRMPose } from '@pixiv/three-vrm'
import { ModelMeshes } from './model'
import { LRUCache } from '../LRU';


export const usePoses = (poseUrl: string, model: ModelMeshes): void => {
    const PoseCache = React.useRef(new LRUCache<VRMPose>(20));

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

    React.useEffect(() => {
        const vrm = model.vrm;
        if( !vrm ) {
            return;
        }

        // Apply Poses
        if( poseUrl ) {
            getPose(poseUrl).then((vrmPose) => {
                if( vrm.humanoid ) {
                    console.log("Applying Pose", vrmPose)
                    vrm.humanoid.setPose(vrmPose);
                }
            })
        }
    }, [model.id, poseUrl])
}