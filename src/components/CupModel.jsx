import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import cupData from '../data/cups6.json'

const CUP_URL = '/models/cup.glb'
const DRACO_PATH = '/draco/'
const TARGET_HEIGHT = 2.15

// Компактная печать щенка: короткая дуга и небольшая высота, чтобы логотип
// выглядел как напечатанный на стакане, а не как отдельная табличка.
const LABEL_ARC = 0.45 // thetaLength
const LABEL_HEIGHT = 0.24
const LABEL_Y = 0

// Радиус передней стенки на заданной высоте — берём из самой геометрии,
// чтобы наклейка лежала вплотную к пластику (зазор ~0.002).
function frontRadiusAt(positions, y) {
  let radius = 0
  for (let i = 0; i < positions.length; i += 3) {
    const px = positions[i]
    const py = positions[i + 1]
    const pz = positions[i + 2]
    if (Math.abs(py - y) < 0.07 && Math.abs(px) < 0.3 && pz > 0) {
      const r = Math.hypot(px, pz)
      if (r > radius) radius = r
    }
  }
  return radius
}

function makeFadeable(material) {
  material.onBeforeCompile = (shader) => {
    material.userData.shader = shader
    shader.uniforms.uFade = { value: 1 }
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform float uFade;\nvoid main() {')
      .replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\ngl_FragColor.a *= uFade;',
      )
  }
  material.customProgramCacheKey = () => 'label-fade-v1'
  material.needsUpdate = true
  return material
}

const LIQUID_COLORS = {
  0: '#A78BFA', // 01 Виноградный чай
  1: '#F48FB1', // 02 Клубника Жасмин
  3: '#FBB03B', // 04 Король-апельсин
  4: '#9DC183', // 05 Матча Чиз
  5: '#F4A887', // 06 Персиковый Улун
}

function applyZoneShader(material, colorHex, mode, wallAlpha, withPearls) {
  // mode: 'solid' | 'caramel'
  material.transparent = true
  material.depthWrite = true
  material.roughness = 0.35
  material.envMapIntensity = 1.45

  material.onBeforeCompile = (shader) => {
    material.userData.shader = shader

    shader.uniforms.uLiquid = {
      value: new THREE.Color(colorHex || '#F5E6D3'),
    }
    shader.uniforms.uFoam = { value: new THREE.Color('#FFFDF7') }
    shader.uniforms.uPearl = { value: new THREE.Color('#3B2314') }
    shader.uniforms.uCap = { value: new THREE.Color('#FFFFFF') }
    shader.uniforms.uMilk = { value: new THREE.Color('#F5E6D3') }
    shader.uniforms.uCaramel = { value: new THREE.Color('#6B3E26') }
    shader.uniforms.uCaramelMode = { value: mode === 'caramel' ? 1 : 0 }
    shader.uniforms.uWallAlpha = { value: wallAlpha }
    shader.uniforms.uFade = { value: 1 }
    shader.uniforms.uPearls = { value: withPearls ? 1 : 0 }

    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        'varying float vCupY;\nvarying vec2 vCupXZ;\nvoid main() {',
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vCupY = position.y;
        vCupXZ = position.xz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        `uniform vec3 uLiquid;
        uniform vec3 uFoam;
        uniform vec3 uPearl;
        uniform vec3 uCap;
        uniform vec3 uMilk;
        uniform vec3 uCaramel;
        uniform float uCaramelMode;
        uniform float uWallAlpha;
        uniform float uFade;
        uniform float uPearls;
        varying float vCupY;
        varying vec2 vCupXZ;
        float pearlMask;
        void main() {`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          float y = vCupY;

          float capMask = smoothstep(0.64, 0.76, y);
          float foamMask =
              smoothstep(0.36, 0.50, y)
            * (1.0 - smoothstep(0.56, 0.66, y));

          float bottomZone = 1.0 - smoothstep(-0.92, -0.52, y);
          float bodyMask = 1.0 - capMask;

          vec3 lc = diffuseColor.rgb;
          float lum = dot(lc, vec3(0.299, 0.587, 0.114));

          // Узкий диапазон яркости: блики остаются, но чужие розовые
          // пятна старой текстуры больше не просвечивают.
          float shade = clamp(0.86 + lum * 0.24, 0.86, 1.10);

          vec3 liquid = uLiquid * shade;

          if (uCaramelMode > 0.5) {
            // Тигровые разводы по окружности, узор не зависит от текстуры.
            // Угол считаем из непрерывных x/z во фрагменте — иначе на шве
            // ±π интерполяция даёт тонкие линии посередине стакана.
            float angle = atan(vCupXZ.y, vCupXZ.x);
            float stripe1 = sin(angle * 5.0 + sin(y * 7.0) * 1.2) * 0.5 + 0.5;
            float stripe2 = sin(angle * 9.0 - y * 4.0) * 0.5 + 0.5;
            float syrup = clamp(stripe1 * 0.72 + stripe2 * 0.28, 0.0, 1.0);
            syrup = smoothstep(0.40, 0.76, syrup)
                  * smoothstep(-0.78, 0.50, y);
            liquid = mix(uMilk, uCaramel, syrup * 0.95);
          }

          // Только тёмные пиксели в нижней зоне — сами шарики тапиоки.
          pearlMask = bottomZone * (1.0 - smoothstep(0.16, 0.40, lum)) * uPearls;

          vec3 result = mix(lc, liquid, bodyMask * (1.0 - foamMask) * (1.0 - pearlMask));
          result = mix(result, uFoam * clamp(shade, 0.94, 1.06), foamMask * bodyMask);
          result = mix(result, uPearl * clamp(shade, 0.75, 1.20), pearlMask);
          result = mix(result, uCap, capMask);
          diffuseColor.rgb = result;

          float alpha = mix(1.0, uWallAlpha, bodyMask);
          alpha = mix(alpha, 0.65, capMask);
          alpha = mix(alpha, 0.96, pearlMask);
          diffuseColor.a = alpha * uFade;
        }`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.16, pearlMask);`,
      )
  }

  material.customProgramCacheKey = () =>
    `zone-liquid-${mode}-${colorHex || 'caramel'}-${wallAlpha}-${withPearls}`
  material.needsUpdate = true
}

function CupModel({
  cupIndex = 0,
  groupRef,
  position = [0, 0, 0],
  onPointerOver,
  onPointerOut,
  onClick,
  labelRotation = 0,
  logoTexture,
}) {
  const { scene } = useGLTF(CUP_URL, DRACO_PATH)

  const labelMaterial = useMemo(
    () =>
      makeFadeable(
        new THREE.MeshStandardMaterial({
          map: logoTexture,
          transparent: true,
          depthWrite: false,
          roughness: 0.35,
          opacity: 0.92,
          side: THREE.FrontSide,
        }),
      ),
    [logoTexture],
  )

  const model = useMemo(() => {
    let sourceMesh = null
    scene.traverse((child) => {
      if (!sourceMesh && child.isMesh) sourceMesh = child
    })

    if (!sourceMesh) return null

    const sourceMaterial = Array.isArray(sourceMesh.material)
      ? sourceMesh.material[0]
      : sourceMesh.material

    const cup = cupData.cups[cupIndex]
    if (!cup) return null

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(cup.positions), 3),
    )
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(cup.normals), 3),
    )
    geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(cup.uvs), 2),
    )
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(cup.indices), 1))
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    const box = geometry.boundingBox
    const center = box.getCenter(new THREE.Vector3())
    geometry.translate(-center.x, -center.y, -center.z)
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    const size = box.getSize(new THREE.Vector3())
    if (size.z > size.y && size.z >= size.x) {
      geometry.rotateX(Math.PI / 2)
    } else if (size.x > size.y && size.x >= size.z) {
      geometry.rotateZ(Math.PI / 2)
    }

    geometry.computeBoundingBox()
    const height = geometry.boundingBox.getSize(new THREE.Vector3()).y
    const scale = TARGET_HEIGHT / Math.max(height, 0.001)
    geometry.scale(scale, scale, scale)
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    // Сглаживаем дно у всех стаканов, кроме Браун Шугар: жемчужины
    // слиты с геометрией дна, поэтому просто отодвигаем их вершины
    // на радиус стенки — бугорки исчезают, контур остаётся ровным.
    if (cupIndex !== 2) {
      const pos = geometry.attributes.position.array
      for (let i = 0; i < pos.length; i += 3) {
        const y = pos[i + 1]
        if (y < -0.55) {
          const x = pos[i]
          const z = pos[i + 2]
          const r = Math.hypot(x, z)
          if (r > 0.01 && r < 0.44) {
            const wallR = 0.46 - (y + 1.07) * 0.08
            const k = Math.max(wallR, r) / r
            pos[i] = x * k
            pos[i + 2] = z * k
          }
        }
      }
      geometry.attributes.position.needsUpdate = true
      geometry.computeVertexNormals()
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
    }

    const material = sourceMaterial.clone()
    material.envMapIntensity = 1.45
    material.needsUpdate = true

    if (cupIndex === 2) {
      // Только Браун Шугар сохраняет фирменные шарики тапиоки.
      applyZoneShader(material, null, 'caramel', 1, true)
    } else if (LIQUID_COLORS[cupIndex]) {
      applyZoneShader(
        material,
        LIQUID_COLORS[cupIndex],
        'solid',
        cupIndex === 0 ? 0.45 : 1,
        false,
      )
    } else {
      // Оставные стаканы тоже должны уметь плавно растворяться
      material.transparent = true
      material.depthWrite = true
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uFade = { value: 1 }
        material.userData.shader = shader
        shader.fragmentShader = shader.fragmentShader
          .replace(
            'void main() {',
            'uniform float uFade;\nvoid main() {',
          )
          .replace(
            '#include <dithering_fragment>',
            '#include <dithering_fragment>\ngl_FragColor.a *= uFade;',
          )
      }
      material.customProgramCacheKey = () => 'plain-fade'
      material.needsUpdate = true
    }

    const positions = geometry.attributes.position.array
    const labelTop = frontRadiusAt(positions, LABEL_Y + LABEL_HEIGHT / 2) + 0.012
    const labelBottom = frontRadiusAt(positions, LABEL_Y - LABEL_HEIGHT / 2) + 0.012

    return { geometry, material, labelTop, labelBottom }
  }, [scene, cupIndex])

  if (!model) return null

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={model.geometry} material={model.material} castShadow receiveShadow />

      {/* Фирменная печать щенка — изогнута по передней стенке стакана */}
      <mesh
        material={labelMaterial}
        position={[0, LABEL_Y, 0]}
        rotation={[0, labelRotation, 0]}
        renderOrder={2}
      >
        <cylinderGeometry
          args={[
            model.labelTop,
            model.labelBottom,
            LABEL_HEIGHT,
            32,
            1,
            true,
            -LABEL_ARC / 2,
            LABEL_ARC,
          ]}
        />
      </mesh>

      {/* Один простой невидимый хитбокс на весь стакан */}
      <mesh
        visible={false}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <cylinderGeometry args={[0.9, 0.75, 2.6, 16]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}

useGLTF.preload(CUP_URL, DRACO_PATH)

export default CupModel
