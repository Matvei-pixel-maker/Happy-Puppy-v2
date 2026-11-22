import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import CupModel from './CupModel'

function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    )

    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(0.32, 'rgba(255,255,255,0.26)')
    gradient.addColorStop(0.68, 'rgba(255,255,255,0.06)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)

    const canvasTexture = new THREE.CanvasTexture(canvas)
    canvasTexture.colorSpace = THREE.SRGBColorSpace
    canvasTexture.needsUpdate = true
    return canvasTexture
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}

// Horizontal step between cups — large enough to see neighbors at edges,
// small enough to keep them on screen during scroll
const CUP_SPACING = 3.8
const NUM_CUPS = 6

// Стакан целиком — вместе с крышкой и трубочкой — должен помещаться
// в кадр с запасом сверху и не задевать текст снизу.
const CUP_Y = 0.2

function Scene({ progressRef, textRefs, selectedDrink, onSelectDrink, scrollTargetOverrideRef }) {
  const { size } = useThree()
  const glowTexture = useGlowTexture()

  const cupRef1 = useRef(null)
  const cupRef2 = useRef(null)
  const cupRef3 = useRef(null)
  const cupRef4 = useRef(null)
  const cupRef5 = useRef(null)
  const cupRef6 = useRef(null)
  const cupRefs = [cupRef1, cupRef2, cupRef3, cupRef4, cupRef5, cupRef6]
  const ringRef = useRef(null)
  const smoothProgress = useRef(0)

  // Ховер-оборот: один полный оборот за каждое наведение на активный стакан.
  // Лежит ПОВЕРХ штатной анимации и её не меняет.
  const targetHoverSpin = useRef(new Array(NUM_CUPS).fill(0))
  const currentSpin = useRef(new Array(NUM_CUPS).fill(0))

  const handlePointerOver = useCallback(
    (i, event) => {
      event.stopPropagation()

      // Крутим только активный центральный стакан.
      const active = Math.round(progressRef.current * (NUM_CUPS - 1))
      if (i !== active) return

      document.body.style.cursor = 'pointer'
      targetHoverSpin.current[i] += Math.PI * 2
    },
    [progressRef],
  )

  const handlePointerOut = useCallback((event) => {
    event.stopPropagation()
    document.body.style.cursor = ''
  }, [])

  // Детальный просмотр: плавное затемнение соседей, непрерывное вращение
  const detailFade = useRef(0)
  const detailSpin = useRef(0)
  const textFade = useRef(1)

  const handleClick = useCallback(
    (i, event) => {
      event.stopPropagation()
      if (Math.abs(i - smoothProgress.current) > 0.45) return
      onSelectDrink(i)
    },
    [onSelectDrink],
  )

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  const aspect = size.width / Math.max(size.height, 1)
  const cameraZ = aspect < 1 ? 8.2 : 5.9
  const isMobile = aspect < 1
  const LAST_IDX = NUM_CUPS - 1

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)

    // Плавная инерция: текущий float-прогресс (0..5) догоняет целевой.
    // При возврате на главную используем override-цель 0 — карусель едет
    // к первому напитку с той же фирменной инерцией, без резкого рывка.
    const targetProgress =
      scrollTargetOverrideRef?.current != null
        ? scrollTargetOverrideRef.current
        : progressRef.current

    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      targetProgress * LAST_IDX,
      5,
      dt,
    )

    const currentProgress = smoothProgress.current // 0..5 непрерывный float
    const time = state.clock.elapsedTime

    const detailActive = selectedDrink !== null && selectedDrink !== undefined
    detailFade.current = THREE.MathUtils.damp(detailFade.current, detailActive ? 1 : 0, 5, dt)
    if (detailActive) detailSpin.current += dt * 0.55
    textFade.current = THREE.MathUtils.damp(textFade.current, detailActive ? 0 : 1, 6, dt)

    // Текст движется от ТОГО ЖЕ сглаженного прогресса, что и стаканы:
    // никаких резких переключений через React-стейт.
    if (textRefs?.current) {
      textRefs.current.forEach((node, i) => {
        if (!node) return

        const offset = i - currentProgress
        const absOffset = Math.abs(offset)

        node.style.transform = `translate3d(${offset * 120}px, ${absOffset * 18}px, 0)`
        node.style.opacity = String(Math.max(0, 1 - absOffset * 1.6) * textFade.current)
      })
    }

    cupRefs.forEach((ref, i) => {
      if (!ref.current) return

      // Всё считается от одного дробного смещения — никаких порогов и snap.
      const offset = i - currentProgress
      const absOffset = Math.abs(offset)
      const side = offset < 0 ? -1 : 1

      // Непрерывная «дальность» стакана от центра: 0 в центре, 1 у краёв.
      const far = THREE.MathUtils.smoothstep(absOffset, 0.35, 1.15)
      const distance = Math.min(absOffset / 1.5, 1)

      // Ховер-оборот поверх штатного вращения — 3.5 даёт сочный
      // оборот 360° с мягким торможением. Штатная анимация не заменяется.
      currentSpin.current[i] = THREE.MathUtils.damp(
        currentSpin.current[i],
        targetHoverSpin.current[i],
        3.5,
        dt,
      )

      const floatY = CUP_Y + Math.sin(time * 0.8) * 0.035
      const nearScale = 0.8 + Math.sin(time * 0.5) * 0.016
      const farScale = THREE.MathUtils.lerp(0.47, 0.39, distance)
      const scale = THREE.MathUtils.lerp(nearScale, farScale, far)

      const baseX = offset * CUP_SPACING
      const baseZ = far * absOffset * 1.5
      const baseRotationY =
        -0.45 + currentProgress * 1.1
        + Math.sin(time * 0.3) * 0.06 * (1 - far)
        + currentSpin.current[i]
      const baseRotationZ = side * distance * 0.2 * far

      const isSelected = detailActive && i === selectedDrink

      if (isSelected) {
        // Стакан остаётся строго по центру, чуть приподнимается и
        // уменьшается — под ним снизу выезжает карточка напитка.
        const detailX = 0
        const detailY = isMobile ? 1.15 : 0.9
        const detailScale = scale * 0.8

        ref.current.position.set(
          THREE.MathUtils.lerp(baseX, detailX, detailFade.current),
          THREE.MathUtils.lerp(floatY, detailY, detailFade.current),
          THREE.MathUtils.lerp(baseZ, 0, detailFade.current),
        )
        ref.current.rotation.set(
          0,
          baseRotationY + detailSpin.current,
          THREE.MathUtils.lerp(baseRotationZ, 0, detailFade.current),
        )
        const s = THREE.MathUtils.lerp(scale, detailScale, detailFade.current)
        ref.current.scale.set(s, s, s)
      } else {
        ref.current.position.set(baseX, floatY, baseZ)
        ref.current.rotation.set(0, baseRotationY, baseRotationZ)
        ref.current.scale.set(scale, scale, scale)
      }

      // Прозрачность: выбранный стакан остаётся, остальные растворяются.
      ref.current.children.forEach((child) => {
        const shader = child.material?.userData?.shader
        if (shader?.uniforms?.uFade) {
          shader.uniforms.uFade.value = isSelected ? 1 : 1 - detailFade.current
        }
      })
    })

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.04
    }

    const camera = state.camera
    camera.position.x = Math.sin(time * 0.18) * 0.07
    camera.position.y = 0.32 + Math.sin(time * 0.32) * 0.04
    camera.position.z = cameraZ
    camera.lookAt(0, 0.02, 0)
  })

  return (
    <>
      <fog attach="fog" args={['#f6ece1', 12, 28]} />

      {/* Тёплый мягкий свет для светлого пастельного фона */}
      <ambientLight intensity={0.75} color="#fff4e6" />
      <hemisphereLight args={['#fff8ee', '#e6cdb8', 0.85]} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.25}
        color="#fff3e2"
      />
      <spotLight
        position={[3.5, 4.5, 5]}
        angle={0.55}
        penumbra={0.85}
        intensity={70}
        distance={20}
        color="#fff6ea"
      />
      <pointLight
        position={[-6, 2, 4]}
        intensity={12}
        distance={22}
        color="#ffc79a"
      />
      <pointLight
        position={[6, -2, 3]}
        intensity={9}
        distance={22}
        color="#f7d9bd"
      />
      <pointLight
        position={[0, 2.5, -3.5]}
        intensity={16}
        distance={14}
        color="#ffe3c2"
      />

      <Environment resolution={512} frames={1}>
        <Lightformer
          intensity={5}
          color="#fff6e8"
          position={[0, 5, -9]}
          scale={[14, 6, 1]}
        />
        <Lightformer
          intensity={2.6}
          color="#f9dcc2"
          position={[-7, 1, 2]}
          rotation-y={Math.PI / 2}
          scale={[12, 4, 1]}
        />
        <Lightformer
          intensity={2.2}
          color="#fce8d8"
          position={[7, -1, -3]}
          rotation-y={-Math.PI / 2}
          scale={[12, 4, 1]}
        />
        <Lightformer
          intensity={1.8}
          color="#fffaf3"
          position={[0, -6, 0]}
          rotation-x={Math.PI / 2}
          scale={[12, 12, 1]}
        />
        <Lightformer
          intensity={2.2}
          color="#ffffff"
          position={[0, 1.5, 6]}
          scale={[7, 3, 1]}
        />
      </Environment>

      {/* Мягкое тёплое свечение позади стакана */}
      <sprite position={[0, CUP_Y, -1.6]} scale={[6, 6, 1]}>
        <spriteMaterial
          map={glowTexture}
          color="#f7dfc5"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
        />
      </sprite>

      <mesh ref={ringRef} position={[0, CUP_Y, -3]}>
        <torusGeometry args={[3.35, 0.008, 12, 220]} />
        <meshBasicMaterial
          color="#c9a88b"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, CUP_Y, -3.1]}>
        <torusGeometry args={[4.55, 0.006, 12, 220]} />
        <meshBasicMaterial
          color="#d6b79c"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      <Suspense fallback={null}>
        {Array.from({ length: NUM_CUPS }).map((_, i) => (
          <CupModel
            key={i}
            cupIndex={i}
            // Начальная позиция — будет перезаписана кадр за кадром в useFrame
            position={[i * CUP_SPACING, CUP_Y, 0]}
            groupRef={cupRefs[i]}
            onPointerOver={(event) => handlePointerOver(i, event)}
            onPointerOut={(event) => handlePointerOut(event)}
            onClick={(event) => handleClick(i, event)}
            // Базовый поворот стакана: -0.45 + progress * 1.1. На своём
            // слайде progress === i, поэтому компенсируем его, чтобы печать
            // стояла по центру лицевой стороны каждого стакана.
            labelRotation={0.45 - i * 1.1}
          />
        ))}
      </Suspense>

      {/* Мягкая контактная тень под стаканом */}
      <ContactShadows
        position={[0, CUP_Y - 1.08, 0]}
        opacity={0.28}
        scale={7}
        blur={2.6}
        far={3.2}
        resolution={512}
        color="#8a6a55"
      />

      <Sparkles
        count={70}
        scale={[26, 9, 8]}
        position={[0, CUP_Y, -1]}
        size={2}
        speed={0.25}
        opacity={0.26}
        color="#c9a17d"
        noise={1.5}
      />
    </>
  )
}

export default Scene
