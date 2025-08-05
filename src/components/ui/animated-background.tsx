"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: {
    [key: string]: {
      value: number[] | number[][] | number;
      type: string;
    };
  };
  maxFps?: number;
}

interface AnimatedBackgroundProps {
  className?: string;
  animationSpeed?: number;
  colors?: number[][];
  dotSize?: number;
  showGradient?: boolean;
}

const ShaderMaterial = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string;
  hovered?: boolean;
  maxFps?: number;
  uniforms: Uniforms;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lastTime = useRef(0);
  const frameCount = useRef(0);

  const getUniforms = () => {
    const uniformValues: { [key: string]: any } = {};
    Object.keys(uniforms).forEach((key) => {
      const uniform = uniforms[key];
      if (uniform.type === "uniform1f") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform2f") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform3f") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform4f") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform1i") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform2i") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform3i") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform4i") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform1fv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform2fv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform3fv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform4fv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform1iv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform2iv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform3iv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniform4iv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniformMatrix2fv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniformMatrix3fv") {
        uniformValues[key] = uniform.value;
      } else if (uniform.type === "uniformMatrix4fv") {
        uniformValues[key] = uniform.value;
      }
    });
    return uniformValues;
  };

  useFrame((state) => {
    if (!materialRef.current) return;

    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - lastTime.current;
    frameCount.current++;

    if (deltaTime >= 1 / maxFps) {
      materialRef.current.uniforms.u_time.value = currentTime;
      materialRef.current.uniforms.u_resolution.value = [
        state.viewport.width,
        state.viewport.height,
      ];
      materialRef.current.uniforms.u_mouse.value = [
        state.mouse.x * state.viewport.width,
        state.mouse.y * state.viewport.height,
      ];
      lastTime.current = currentTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={source}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        uniforms={{
          u_time: { value: 0 },
          u_resolution: { value: [800, 600] },
          u_mouse: { value: [0, 0] },
          ...getUniforms(),
        }}
      />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => {
  return (
    <Canvas>
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};

const DotMatrix: React.FC<{
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = useMemo(() => {
    // Garantir que temos pelo menos uma cor válida
    const defaultColor = [0, 255, 255];
    const safeColors = colors && colors.length > 0 ? colors : [defaultColor];
    
    // Criar array de 6 cores para o shader
    const colorsArray = [];
    for (let i = 0; i < 6; i++) {
      const colorIndex = i % safeColors.length;
      colorsArray.push(safeColors[colorIndex]);
    }
    
    return {
      u_colors: {
        value: colorsArray.map((color) => [
          (color[0] || 0) / 255,
          (color[1] || 0) / 255,
          (color[2] || 0) / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities && opacities.length >= 10 ? opacities : [0.1, 0.1, 0.1, 0.15, 0.15, 0.15, 0.2, 0.2, 0.2, 0.25],
        type: "uniform1fv",
      },
      u_totalSize: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dotSize: {
        value: dotSize,
        type: "uniform1f",
      },
    };
  }, [colors, opacities, totalSize, dotSize]);

  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform vec3 u_colors[6];
    uniform float u_opacities[10];
    uniform float u_totalSize;
    uniform float u_dotSize;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5);
      
      float time = u_time * 0.5;
      float animationSpeed = 2.0;
      
      vec2 grid = uv * u_totalSize;
      vec2 id = floor(grid);
      vec2 gv = fract(grid) - 0.5;
      
      float dist = length(gv);
      float size = u_dotSize * 0.01;
      
      float wave = sin(time * animationSpeed + id.x * 0.5 + id.y * 0.3) * 0.5 + 0.5;
      float opacity = u_opacities[int(mod(id.x + id.y, 10.0))];
      
      float alpha = smoothstep(size + wave * 0.02, size - wave * 0.02, dist) * opacity;
      
      vec3 color = u_colors[int(mod(id.x + id.y, 6.0))];
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return <Shader source={fragmentShader} uniforms={uniforms} />;
};

export const AnimatedBackground = ({
  className,
  animationSpeed = 5,
  colors = [[0, 255, 255]],
  dotSize = 2,
  showGradient = true,
}: AnimatedBackgroundProps) => {
  return (
    <div className={cn("h-full relative w-full", className)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors}
          dotSize={dotSize}
          opacities={[0.1, 0.1, 0.1, 0.15, 0.15, 0.15, 0.2, 0.2, 0.2, 0.25]}
          shader={`animation_speed_factor_${animationSpeed.toFixed(1)}_;`}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      )}
    </div>
  );
}; 