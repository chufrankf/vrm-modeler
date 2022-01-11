import React, { Children } from 'react'
import * as THREE from 'three' 
import { VRM } from '@pixiv/three-vrm'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CharacterModelContext } from '../contexts/CharacterModel'

export const SingleCharacterDisplay: React.FC = (props) => {
    const mount = React.useRef<HTMLDivElement>(null);

    const renderer = React.useRef<THREE.WebGLRenderer>()
    const scene = React.useRef<THREE.Scene>()
    const camera = React.useRef<THREE.PerspectiveCamera>()

    const displayVRM = React.useRef<VRM>();
    const { characterVRM } = React.useContext(CharacterModelContext)

    React.useEffect(() => {
        window.addEventListener("resize", handleWindowResize);

        if( mount.current ) {
            const width = mount.current.clientWidth;
            const height = mount.current.clientHeight;
            console.log("Mounting display", width, height)
    
            // renderer
            renderer.current = new THREE.WebGLRenderer();
            renderer.current.setSize(width, height, false);
            renderer.current.setPixelRatio( window.devicePixelRatio );
            mount.current.appendChild(renderer.current.domElement);
            
            // scene
            scene.current = new THREE.Scene();
    
            // camera
            camera.current = new THREE.PerspectiveCamera( 30, width / height, 0.1, 20 );
            camera.current.position.set( 0.0, 1.0, -4.0 );
    
            // camera controls
            const controls = new OrbitControls( camera.current, renderer.current.domElement );
            controls.screenSpacePanning = true;
            controls.target.set( 0.0, 1.0, 0.0 );
            controls.update();
    
            // light
            const light = new THREE.DirectionalLight( 0xffffff );
            light.position.set( 1.0, 1.0, 1.0 ).normalize();
            scene.current.add( light );
        }

        animate();

        return function cleanup() {
            window.removeEventListener("resize", handleWindowResize);
            if( mount.current && renderer.current ) {
                mount.current.removeChild( renderer.current.domElement )
            }
        }
    }, [])

    React.useEffect(() => {
        if( characterVRM.value && scene.current ) {
            if( displayVRM.current ) {
                scene.current.remove( displayVRM.current.scene );
            }
            console.log("adding character vrm to scene", characterVRM.id);
            displayVRM.current = characterVRM.value

            // Set to middle of screen
            // Deeper into the screen is +z
            // Going up is +y
            // Going left is +x
            displayVRM.current.scene.position.set(0.1, 0.3, 0);
            scene.current.add( displayVRM.current.scene );
        }
    }, [scene.current, characterVRM.id])

    
    const handleWindowResize = () => {
        if( mount.current && camera.current && renderer.current && scene.current) {
            const width = mount.current.clientWidth;
            const height = mount.current.clientHeight;
    
            camera.current.aspect = width / height;
            camera.current.updateProjectionMatrix();
    
            renderer.current.setSize(width, height, false);
            
            renderer.current.render(scene.current, camera.current);
        }
    }

    const animate = () => {
        if( renderer.current && scene.current && camera.current) {
            requestAnimationFrame(animate);
            renderer.current.render(scene.current, camera.current);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <div style={{ flex: "1 1 auto", overflow: "hidden" }} ref={mount}/>
            {props.children}
        </div>
    )
}