import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { CompanionCharacter } from "@/lib/companion";
import { COMPANION_STYLES, type CompanionState } from "./states";

function damp(
  current: number,
  target: number,
  lambda: number,
  delta: number,
) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

function Companion({
  state,
  character,
}: {
  state: CompanionState;
  character: CompanionCharacter;
}) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const face = useRef<THREE.Group>(null);
  const eyeLeft = useRef<THREE.Mesh>(null);
  const eyeRight = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const armLeft = useRef<THREE.Mesh>(null);
  const armRight = useRef<THREE.Mesh>(null);
  const bodyMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const accentMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const accentMaterialRight = useRef<THREE.MeshStandardMaterial>(null);
  const orbGroup = useRef<THREE.Group>(null);

  const { palette } = character;
  const orbs = [palette.orb1, palette.orb2, palette.orb3];

  const targetColor = useRef(new THREE.Color(palette.body));
  targetColor.current.set(palette.body);
  const targetAccent = useRef(new THREE.Color(palette.accent));
  targetAccent.current.set(palette.accent);

  useFrame(({ clock }, delta) => {
    const style = COMPANION_STYLES[state];
    const time = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    if (root.current) {
      root.current.position.y = damp(
        root.current.position.y,
        Math.sin(time * style.bobSpeed) * style.bobAmplitude,
        4,
        dt,
      );
      root.current.rotation.z = damp(
        root.current.rotation.z,
        style.tilt,
        3,
        dt,
      );
      root.current.rotation.y = Math.sin(time * 0.35) * 0.08;
    }

    if (body.current) {
      const breath = 1 + Math.sin(time * style.bobSpeed * 1.15) * 0.013;
      body.current.scale.setScalar(damp(body.current.scale.x, breath, 5, dt));
    }

    if (face.current) {
      face.current.position.y = damp(
        face.current.position.y,
        style.lookUp,
        4,
        dt,
      );
    }

    const blinkPhase = time % 4.6;
    const blink =
      state === "thinking"
        ? 0
        : blinkPhase < 0.13
          ? Math.sin((blinkPhase / 0.13) * Math.PI)
          : 0;

    for (const eye of [eyeLeft.current, eyeRight.current]) {
      if (!eye) continue;
      const target = style.eyeOpen * (1 - blink * 0.94);
      eye.scale.y = damp(eye.scale.y, Math.max(0.06, target), 22, dt);
    }

    if (mouth.current) {
      const mouthScale = Math.max(0.18, 0.35 + style.smile * 0.85);
      mouth.current.scale.y = damp(mouth.current.scale.y, mouthScale, 6, dt);
      mouth.current.scale.x = damp(mouth.current.scale.x, 1, 6, dt);
      mouth.current.rotation.z = damp(
        mouth.current.rotation.z,
        style.smile < 0 ? 0 : Math.PI,
        6,
        dt,
      );
    }

    if (armLeft.current && armRight.current) {
      const swing = Math.sin(time * style.bobSpeed * 1.4) * 0.09;
      const lift = state === "listening" ? 0.22 : 0;
      armLeft.current.rotation.z = damp(
        armLeft.current.rotation.z,
        0.55 + swing + lift,
        4,
        dt,
      );
      armRight.current.rotation.z = damp(
        armRight.current.rotation.z,
        -0.55 - swing - lift,
        4,
        dt,
      );
    }

    if (orbGroup.current) {
      orbGroup.current.rotation.y = time * style.orbitSpeed;
      orbGroup.current.rotation.x = Math.sin(time * 0.4) * 0.12;
    }

    if (bodyMaterial.current) {
      bodyMaterial.current.color.lerp(targetColor.current, Math.min(1, dt * 3));
    }
    if (accentMaterial.current) {
      accentMaterial.current.color.lerp(
        targetAccent.current,
        Math.min(1, dt * 3),
      );
    }
    if (accentMaterialRight.current) {
      accentMaterialRight.current.color.lerp(
        targetAccent.current,
        Math.min(1, dt * 3),
      );
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, -0.52, 0]}
        scale={[1, 0.55, 1]}
      >
        <circleGeometry args={[0.62, 32]} />
        <meshBasicMaterial
          color={palette.shadow}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <group ref={body} position={[0, 0.38, 0]}>
        {character.accessory === "ears" ? (
          <group position={[0, 0.56, -0.02]}>
            <mesh position={[-0.5, 0, 0]} scale={[1, 1, 0.55]}>
              <sphereGeometry args={[0.19, 24, 24]} />
              <meshStandardMaterial color={palette.accessory} roughness={0.55} />
            </mesh>
            <mesh position={[0.5, 0, 0]} scale={[1, 1, 0.55]}>
              <sphereGeometry args={[0.19, 24, 24]} />
              <meshStandardMaterial color={palette.accessory} roughness={0.55} />
            </mesh>
            <mesh
              position={[-0.5, -0.005, 0.09]}
              scale={[1, 1, 0.4]}
            >
              <sphereGeometry args={[0.1, 20, 20]} />
              <meshStandardMaterial
                color={palette.accessorySoft}
                roughness={0.6}
              />
            </mesh>
            <mesh position={[0.5, -0.005, 0.09]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.1, 20, 20]} />
              <meshStandardMaterial
                color={palette.accessorySoft}
                roughness={0.6}
              />
            </mesh>
          </group>
        ) : null}

        <mesh scale={[1, 1.05, 0.94]}>
          <sphereGeometry args={[0.7, 64, 64]} />
          <meshPhysicalMaterial
            ref={bodyMaterial}
            color={palette.body}
            roughness={0.34}
            metalness={0.03}
            clearcoat={0.65}
            clearcoatRoughness={0.45}
            emissive={palette.accent}
            emissiveIntensity={0.045}
          />
        </mesh>

        <group ref={face} position={[0, 0, 0]}>
          <mesh
            ref={eyeLeft}
            position={[-0.215, 0.1, 0.64]}
            scale={[1, 1, 0.55]}
          >
            <sphereGeometry args={[0.072, 24, 24]} />
            <meshStandardMaterial color={palette.eye} roughness={0.35} />
          </mesh>
          <mesh
            ref={eyeRight}
            position={[0.215, 0.1, 0.64]}
            scale={[1, 1, 0.55]}
          >
            <sphereGeometry args={[0.072, 24, 24]} />
            <meshStandardMaterial color={palette.eye} roughness={0.35} />
          </mesh>

          <mesh position={[-0.25, 0.17, 0.68]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.25, 0.17, 0.68]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          <mesh position={[-0.36, -0.04, 0.59]} scale={[1, 0.62, 0.3]}>
            <sphereGeometry args={[0.105, 20, 20]} />
            <meshBasicMaterial
              color={palette.blush}
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0.36, -0.04, 0.59]} scale={[1, 0.62, 0.3]}>
            <sphereGeometry args={[0.105, 20, 20]} />
            <meshBasicMaterial
              color={palette.blush}
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>

          <mesh
            ref={mouth}
            position={[0, -0.09, 0.66]}
            rotation={[0, 0, Math.PI]}
          >
            <torusGeometry args={[0.115, 0.018, 12, 32, Math.PI]} />
            <meshStandardMaterial color={palette.mouth} roughness={0.5} />
          </mesh>
        </group>

        <mesh
          ref={armLeft}
          position={[-0.64, -0.02, 0.1]}
          rotation={[0, 0, 0.55]}
        >
          <capsuleGeometry args={[0.055, 0.17, 8, 16]} />
          <meshStandardMaterial
            ref={accentMaterial}
            color={palette.accent}
            roughness={0.45}
          />
        </mesh>
        <mesh
          ref={armRight}
          position={[0.64, -0.02, 0.1]}
          rotation={[0, 0, -0.55]}
        >
          <capsuleGeometry args={[0.055, 0.17, 8, 16]} />
          <meshStandardMaterial
            ref={accentMaterialRight}
            color={palette.accent}
            roughness={0.45}
          />
        </mesh>

        <mesh position={[-0.22, -0.66, 0.13]} scale={[1, 0.55, 1.15]}>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color={palette.limb} roughness={0.5} />
        </mesh>
        <mesh position={[0.22, -0.66, 0.13]} scale={[1, 0.55, 1.15]}>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color={palette.limb} roughness={0.5} />
        </mesh>

        {character.accessory === "sprout" ? (
          <group position={[0, 0.86, 0]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.018, 0.024, 0.2, 12]} />
              <meshStandardMaterial color={palette.accessory} roughness={0.6} />
            </mesh>
            <mesh
              position={[-0.115, 0.15, 0]}
              rotation={[0, 0, 0.6]}
              scale={[1, 0.4, 0.6]}
            >
              <sphereGeometry args={[0.14, 20, 20]} />
              <meshStandardMaterial
                color={palette.accessorySoft}
                roughness={0.55}
              />
            </mesh>
            <mesh
              position={[0.115, 0.15, 0]}
              rotation={[0, 0, -0.6]}
              scale={[1, 0.4, 0.6]}
            >
              <sphereGeometry args={[0.14, 20, 20]} />
              <meshStandardMaterial
                color={palette.accessoryAlt}
                roughness={0.55}
              />
            </mesh>
          </group>
        ) : null}

        {character.accessory === "star" ? (
          <group position={[0, 0.82, 0]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.014, 0.02, 0.2, 12]} />
              <meshStandardMaterial color={palette.accessory} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.3, 0]} scale={[1, 1, 0.6]}>
              <octahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial
                color={palette.accessorySoft}
                emissive={palette.accessorySoft}
                emissiveIntensity={0.5}
                roughness={0.35}
              />
            </mesh>
            <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <octahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial
                color={palette.accessoryAlt}
                emissive={palette.accessoryAlt}
                emissiveIntensity={0.35}
                roughness={0.4}
              />
            </mesh>
          </group>
        ) : null}
      </group>

      <group ref={orbGroup} position={[0, 0.35, 0]}>
        {orbs.map((color, index) => {
          const angle = (index / orbs.length) * Math.PI * 2;
          const radius = [1.34, 1.52, 1.2][index];
          const y = [0.55, 0.12, -0.18][index];
          const size = [0.07, 0.05, 0.045][index];
          return (
            <mesh
              key={color}
              position={[
                Math.cos(angle) * radius,
                y + Math.sin(angle) * 0.16,
                Math.sin(angle) * radius * 0.45,
              ]}
            >
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={color}
                roughness={0.4}
                emissive={color}
                emissiveIntensity={0.25}
                transparent
                opacity={0.85}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export default function CompanionCanvas({
  state,
  character,
}: {
  state: CompanionState;
  character: CompanionCharacter;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.18, 3.9], fov: 34, near: 0.1, far: 30 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden="true"
    >
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[3.2, 4.5, 5]}
        intensity={1.7}
        color="#fff7ee"
      />
      <pointLight
        position={[-3, 2.2, 2.5]}
        intensity={1.2}
        color={character.palette.glow}
        distance={14}
      />
      <pointLight
        position={[0, -2, 2]}
        intensity={0.55}
        color="#f5d3c0"
        distance={12}
      />
      <Companion state={state} character={character} />
    </Canvas>
  );
}
