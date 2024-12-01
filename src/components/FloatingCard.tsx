import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Html, useTexture } from "@react-three/drei";

interface FloatingCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  card: {
    title: string;
    content: any;
  };
}

export function FloatingCard({ position, rotation, card }: FloatingCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState(0);
  const { camera } = useThree();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
      meshRef.current.rotation.y =
        rotation[1] + Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  const handleClick = (url: string) => {
    if (url.startsWith("mailto:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  };

  const ProjectCarousel = ({ projects }: { projects: any[] }) => {
    const texture = useTexture(projects[currentProject].image);

    const nextProject = () => {
      setCurrentProject((prev) => (prev + 1) % projects.length);
    };

    const prevProject = () => {
      setCurrentProject(
        (prev) => (prev - 1 + projects.length) % projects.length
      );
    };

    return (
      <group position={[0, 0.5, 0.06]}>
        {/* Project Image */}
        <mesh position={[0, 0.2, 0]}>
          <planeGeometry args={[3.5, 2]} />
          <meshBasicMaterial map={texture} transparent opacity={0.9} />
        </mesh>

        {/* Project Info */}
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {projects[currentProject].name}
        </Text>


        <Text
          position={[0, -2.1, 0]}
          fontSize={0.18}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {projects[currentProject].tech}
        </Text>

        {/* Navigation Buttons */}
        <group position={[0, -1.5, 0]}>
          {/* Prev Button */}
          <group
            position={[-1.5, 0, 0]}
            onClick={prevProject}
            onPointerOver={() => setHovered("prev")}
            onPointerOut={() => setHovered(null)}
          >
            <mesh>
              <planeGeometry args={[0.8, 0.4]} />
              <meshBasicMaterial
                color={hovered === "prev" ? "#ff5d5c" : "#bb1615"}
                transparent
                opacity={0.3}
              />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.2}
              color={hovered === "prev" ? "#ffffff" : "#00ff00"}
            >
              Prev
            </Text>
          </group>

          {/* Demo Button */}
          <group
            position={[-0.6, -1.2, 0]}
            onClick={() => handleClick(projects[currentProject].demoUrl)}
            onPointerOver={() => setHovered("demo")}
            onPointerOut={() => setHovered(null)}
          >
            <mesh>
              <planeGeometry args={[0.8, 0.4]} />
              <meshBasicMaterial
                color={hovered === "demo" ? "#00ff00" : "#003300"}
                transparent
                opacity={0.3}
              />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.2}
              color={hovered === "demo" ? "#ffffff" : "#00ff00"}
            >
              Demo
            </Text>
          </group>

          {/* Code Button */}
          <group
            position={[0.6, -1.2, 0]}
            onClick={() => handleClick(projects[currentProject].codeUrl)}
            onPointerOver={() => setHovered("code")}
            onPointerOut={() => setHovered(null)}
          >
            <mesh>
              <planeGeometry args={[0.8, 0.4]} />
              <meshBasicMaterial
                color={hovered === "code" ? "#00ff00" : "#003300"}
                transparent
                opacity={0.3}
              />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.2}
              color={hovered === "code" ? "#ffffff" : "#00ff00"}
            >
              Code
            </Text>
          </group>

          {/* Next Button */}
          <group
            position={[1.5, 0, 0]}
            onClick={nextProject}
            onPointerOver={() => setHovered("next")}
            onPointerOut={() => setHovered(null)}
          >
            <mesh>
              <planeGeometry args={[0.8, 0.4]} />
              <meshBasicMaterial
                color={hovered === "next" ? "#8888f2" : "#1414b8"}
                transparent
                opacity={0.3}
              />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.2}
              color={hovered === "next" ? "#ffffff" : "#00ff00"}
            >
              Next
            </Text>
          </group>
        </group>

        {/* Project Counter */}
        <Text
          position={[0, -3.2, 0]}
          fontSize={0.18}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          {`${currentProject + 1}/${projects.length}`}
        </Text>
      </group>
    );
  };

  const renderContent = () => {
    if (card.title === "Profile") {
      return (
        <group position={[0, -0.5, 0.06]}>
          {" "}
          {/* Ajusta el eje Y para centrar */}
          {/* Profile Image */}
          <mesh position={[0, 1.2, 0]}>
            {" "}
            {/* Imagen ligeramente más arriba */}
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial
              map={useTexture(card.content.image)}
              transparent
              opacity={1}
            />
          </mesh>
          {/* Nombre */}
          <Text
            position={[0, -0.2, 0]} // Centrado, un poco más abajo de la imagen
            fontSize={0.3}
            color="#00ff00"
            anchorX="center"
          >
            {card.content.name}
          </Text>
          {/* Apellido */}
          <Text
            position={[0, -0.6, 0]} // Justo debajo del nombre
            fontSize={0.3}
            color="#00ff00"
            anchorX="center"
          >
            {card.content.last}
          </Text>
          {/* Rol */}
          <Text
            position={[0, -1.2, 0]} // Más abajo del apellido
            fontSize={0.25}
            color="#00ff00"
            anchorX="center"
          >
            {card.content.role}
          </Text>
          {/* Descripción */}
          <Text
            position={[0, -1.8, 0]} // Más abajo del rol
            fontSize={0.2}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
          >
            {card.content.description}
          </Text>
        </group>
      );
    }

    // Código para ambas secciones
    if (card.title === "Experience" || card.title === "Education") {
      return (
        <group position={[0, 0.5, 0.06]}>
          {card.content.map((item, index) => (
            <group key={index} position={[0, -index * 1.2, 0]}>
              <Text
                position={[0, 0.3, 0]}
                fontSize={0.2}
                color="#00ff00"
                anchorX="center"
                maxWidth={3} // Establece un ancho máximo para el texto
                wrapText // Habilita el ajuste de texto
              >
                {item.role || item.degree}
              </Text>

              <Text
                position={[0, -0.1, 0]}
                fontSize={0.15}
                color="#75ff75"
                anchorX="center"
              >
                {item.company || item.institution}
              </Text>
              <Text
                position={[0, -0.4, 0]}
                fontSize={0.12}
                color="#75ff75"
                anchorX="center"
              >
                {item.period}
              </Text>
            </group>
          ))}
        </group>
      );
    }



    
    if (card.title === "Projects") {
      return <ProjectCarousel projects={card.content} />;
    }

    if (card.title === "Contact") {
      const links = [
        { label: "GitHub", url: "https://github.com/Mangelo22" },
        {
          label: "LinkedIn",
          url: "https://linkedin.com/in/miguelangelnunezlopez",
        },
        { label: "Email", url: "mailto:miguelangel.developer@gmail.com" },
        { label: "Web 2D", url: "https://miguelangeldeveloper.netlify.app/" },
        { label: "Web 3D", url: "https://manl3d.netlify.app/" }
      ];

      return (
        <group position={[0, 1.2, 0.06]}>
          {links.map((link, index) => (
            <group
              key={link.label}
              position={[0, -index * 0.8, 0]}
              onClick={() => handleClick(link.url)}
              onPointerOver={() => setHovered(link.label)}
              onPointerOut={() => setHovered(null)}
            >
              <mesh>
                <planeGeometry args={[2.5, 0.4]} />
                <meshBasicMaterial
                  color={hovered === link.label ? "#00ff00" : "#003300"}
                  transparent
                  opacity={0.3}
                />
              </mesh>
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.25}
                color={hovered === link.label ? "#ffffff" : "#00ff00"}
                anchorX="center"
                anchorY="middle"
              >
                {link.label}
              </Text>
            </group>
          ))}
        </group>
      );
    }

    return (
      <group position={[0, 0.5, 0.06]}>
        {Array.isArray(card.content)
          ? card.content.map((item, index) => (
              <Text
                key={index}
                position={[0, -index * 0.8, 0]}
                fontSize={0.25}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
                maxWidth={3}
              >
                {Object.values(item).join(" - ")}
              </Text>
            ))
          : Object.entries(card.content).map(([key, value], index) => (
              <Text
                key={key}
                position={[0, -index * 0.8, 0]}
                fontSize={0.25}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
                maxWidth={3}
              >
                {`${value}`}
              </Text>
            ))}
      </group>
    );
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Glow effect */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[4.2, 6.2]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.1} />
      </mesh>

      {/* Main card */}
      <mesh>
        <boxGeometry args={[4, 6, 0.1]} />
        <meshPhongMaterial
          color="#000000"
          emissive="#001100"
          transparent
          opacity={0.95}
          shininess={100}
        />
      </mesh>

      {/* Title */}
      <group position={[0, 2.5, 0.06]}>
        <mesh>
          <planeGeometry args={[3.8, 0.8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.2} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.4}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          {card.title}
        </Text>
      </group>

      {/* Content */}
      {renderContent()}
    </group>
  );
}
