import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import '../styles/Landing.css';

const Landing = ({ onNavigate }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating geometric shapes
    const shapes = [];
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.ConeGeometry(0.7, 1.5, 32),
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(1)
    ];

    // Create materials with glassmorphism effect
    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0x667eea, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x764ba2, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x48bb78, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xed8936, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x4299e1, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      })
    ];

    // Create multiple floating shapes
    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const shape = new THREE.Mesh(geometry, material);
      
      // Random positioning
      shape.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      
      // Random rotation
      shape.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Store initial position and random movement properties
      shape.userData = {
        initialPosition: shape.position.clone(),
        floatSpeed: 0.01 + Math.random() * 0.02,
        rotationSpeed: 0.005 + Math.random() * 0.01,
        amplitude: 2 + Math.random() * 3
      };
      
      shapes.push(shape);
      scene.add(shape);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x667eea, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    camera.position.z = 15;

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      shapes.forEach((shape, index) => {
        const userData = shape.userData;
        
        // Floating animation
        shape.position.y = userData.initialPosition.y + 
          Math.sin(time * userData.floatSpeed + index) * userData.amplitude;
        
        shape.position.x = userData.initialPosition.x + 
          Math.cos(time * userData.floatSpeed * 0.7 + index) * (userData.amplitude * 0.5);

        // Rotation animation
        shape.rotation.x += userData.rotationSpeed;
        shape.rotation.y += userData.rotationSpeed * 1.2;
        shape.rotation.z += userData.rotationSpeed * 0.8;

        // Mouse interaction effect
        const mouseInfluence = 0.5;
        shape.position.x += mouse.x * mouseInfluence * (index % 3);
        shape.position.y += mouse.y * mouseInfluence * (index % 3);
      });

      // Camera slight movement based on mouse
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();
    sceneRef.current = { scene, camera, renderer, shapes };

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(geo => geo.dispose());
      materials.forEach(mat => mat.dispose());
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sceneRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="landing-container">
      <div ref={mountRef} className="three-canvas" />
      
      <div className="landing-content">
        <div className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">
              AI-Powered <span className="gradient-text">Resume Analyzer</span>
            </h1>
            <p className="hero-subtitle">
              Transform your career with intelligent resume analysis. Get AI-driven insights, 
              personalized feedback, and actionable recommendations to land your dream job.
            </p>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <span>AI Analysis</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>Detailed Insights</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <span>Career Growth</span>
              </div>
            </div>

            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => onNavigate('analyzer')}
              >
                Analyze Resume
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => onNavigate('history')}
              >
                View History
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Resumes Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2 className="section-title">Why Choose Our Resume Analyzer?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">🔍</div>
              <h3>Deep Analysis</h3>
              <p>Our AI examines every aspect of your resume, from content structure to keyword optimization.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📈</div>
              <h3>Performance Scoring</h3>
              <p>Get a comprehensive rating with detailed breakdown of strengths and improvement areas.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">💡</div>
              <h3>Smart Suggestions</h3>
              <p>Receive personalized recommendations for skills to learn and career advancement strategies.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📚</div>
              <h3>Learning Resources</h3>
              <p>Access curated learning materials based on your profile and industry trends.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🎯</div>
              <h3>ATS Optimization</h3>
              <p>Ensure your resume passes Applicant Tracking Systems with our specialized analysis.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔄</div>
              <h3>Version Tracking</h3>
              <p>Keep track of all your resume versions and improvements over time.</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Boost Your Career?</h2>
            <p>Join thousands of professionals who have improved their resumes with our AI-powered analysis.</p>
            <button 
              className="btn btn-primary btn-large pulse"
              onClick={() => onNavigate('analyzer')}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;