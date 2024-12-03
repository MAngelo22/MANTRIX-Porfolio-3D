import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { FloatingCard } from './FloatingCard';
import { MatrixBackground } from './MatrixBackground';


const CARD_DISTANCE = 8;

export function Scene() {
  const { camera } = useThree();
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const targetZ = -scroll.offset * (CARD_DISTANCE * 6);
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        5 + targetZ,
        0.075
      );
    }
  });

  const cards = [
    {
      title: 'Profile',
      content: {
        image:'https://static.wixstatic.com/media/c6eee4_c375618439054fe8bd5054d8806e73dc~mv2.png/v1/fill/w_331,h_331,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Photoroom-20240709_020211.png',
        name: 'Miguel Ángel',
        last: 'Núñez López',
        role: 'Full Stack Developer',
        description: 'Passionate developer with a creative mindset',
        CV: 'https://media.licdn.com/dms/document/media/v2/D4D2DAQG-_MDb4hkKig/profile-treasury-document-pdf-analyzed/profile-treasury-document-pdf-analyzed/0/1731675818862?e=1733961600&v=beta&t=pKKVDpDnaPWGh3JOIuyrOC6iVfcKJIF-brVcXBJRoW0',
      },
    },
    {
      title: 'Experience',
      content: [
        { company: 'Doers DF', role: 'Full Stack Developer Internship', period: 'Sep.2024-Nov.2024' },
        { company: 'Telefonica Global Technology', role: 'Salesforce Development Internship', period: 'Oct.2020-Feb.2021' },
        //{ company: 'Prosegur/Eulen', role: 'Security guard', period: 'May.2020-Sep.2023' },
        { company: 'Sage', role: 'Technician Support Internship', period: 'May.2017-Jun.2017' }
      ],
    },
    {
      title: 'Education',
      content: [
        { institution: 'UNIR', degree: 'FP II Desarrollo de Aplicaciones Web', period: '2023-2025' },
        { institution: 'ITT', degree: 'FP II Desarrollo de Aplicaciones Multiplataforma', period: '2019-2021' },
        { institution: 'Fundacion Tomillo', degree: 'FP I Tecnico Sistemas Microinformaticos y Redes', period: '2019-2021' },
      ],
    },
    {
      title: 'Languages',
      content: [
        { language: 'Spanish', level: 'Native' },
        { language: 'English', level: 'B1' },
        { language: 'Portuguese', level: 'A1' },
      ],
    },
    {
      title: 'Projects',
      content: [
        {
          name: '3D Portfolio',
          description: 'Interactive 3D portfolio showing projects in a virtual gallery using Three.js and React Three Fiber',
          tech: 'React, Three.js, TypeScript, Blender',
          image: 'https://static.wixstatic.com/media/c6eee4_68edbd0187ae496da8a16ce561bcb1ca~mv2.webp',
          demoUrl: 'https://manl3d.netlify.app',
          codeUrl: ''
        },
        {
          name: 'HandGame',
          description: 'Website designed so that you can interactively play classic games against the machine',
          tech: 'HTML, JS, CSS',
          image: 'https://static.wixstatic.com/media/c6eee4_e12c4b309eef48a093129e3328ef6e9f~mv2.webp',
          demoUrl: 'https://gamesclassic.netlify.app/piedra2',
          codeUrl: 'https://github.com/MAngelo22/HANDgame.git'
        },
        {
          name: 'Motenimiento',
          description: 'Website designed to generate motorcycle maintenance data according to the model',
          tech: 'HTML, JS, CSS',
          image: 'https://static.wixstatic.com/media/c6eee4_97da5bfb6c3c43bd9936b427b4eb1211~mv2.png',
          demoUrl: 'https://www.youtube.com/shorts/6ughobPjAeI',
          codeUrl: 'https://github.com/MAngelo22/Motenimiento.git'
        },
        {
          name: 'Redel',
          description: 'Website designed to reserve paddle tennis courts in an urbanization',
          tech: 'HTML, JS, CSS',
          image: 'https://static.wixstatic.com/media/c6eee4_852cc341de164daf8dfd9f7eabaac264~mv2.webp',
          demoUrl: 'https://www.youtube.com/watch?v=BuNRfIk7z44',
          codeUrl: 'https://github.com/MAngelo22/Redel.git'
        },
        {
          name: 'QRescato',
          description: 'App on Android, through which your device was geolocated to find the protector',
          tech: 'Android, Java, API Google Maps, Android Studio',
          image: 'https://static.wixstatic.com/media/c6eee4_f2e8d28d94084b39b27261e2dad1f293~mv2.webp',
          demoUrl: 'https://www.youtube.com/watch?v=6B9bn7RxE7k',
          codeUrl: 'https://github.com/MAngelo22/QRastreo-TFG.git'
        },
        {
          name: 'Juego 3D',
          description: 'I play recreating the ITT where I studied, in first person',
          tech: 'Unity, Java, C#, PhotoShop',
          image: 'https://static.wixstatic.com/media/c6eee4_d9e84b3abbf344faa343a7d7d897d419~mv2.png',
          demoUrl: 'https://www.youtube.com/watch?v=E7xc8kuUAeQ&t=34s',
          codeUrl: ''
        },
        {
          name: 'Juego 2D',
          description: "Game based on 'The Avengers', rigging characters from static assets",
          tech: 'Unity, Java, C#, PhotoShop',
          image: 'https://static.wixstatic.com/media/c6eee4_0328f5b5909f435fbedeeb28ecdd952a~mv2.png',
          demoUrl: 'https://www.youtube.com/watch?v=r-VIGDOk2UU&t=2s',
          codeUrl: ''
        },
        {
          name: 'Cronómetro Tabata',
          description: 'Website to train calisthenics with a free tabata stopwatch',
          tech: 'HTML, JS, CSS',
          image: 'https://static.wixstatic.com/media/c6eee4_e41584d954fb4aff93e9ecf1c5f17b18~mv2.jpg',
          demoUrl: 'https://proyectotamer.netlify.app/',
          codeUrl: 'https://github.com/MAngelo22/Proyecto-Tamers.git'
        }
      ]
    },
    {
      title: 'Contact',
      content: {
        email: '',
        linkedin: '',
        github: '',
      },
    },
  ];

  return (
    <group ref={groupRef}>
      <MatrixBackground />
      {cards.map((card, index) => (
        <FloatingCard
          key={card.title}
          position={[0, 0, -CARD_DISTANCE * index]}
          rotation={[0, Math.sin(index * 0.1) * 0.1, 0]}
          card={card}
        />
      ))}
    </group>
  );
}

