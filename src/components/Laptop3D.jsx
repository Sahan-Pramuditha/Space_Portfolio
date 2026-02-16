import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Environment, Html } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';
import * as THREE from 'three';

const SatelliteGlobe = () => {
  const meshRef = useRef();
  const sweepRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (sweepRef.current) {
      sweepRef.current.rotation.z += delta * 1.2;
    }
  });
  return (
    <group>
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.5, 64, 64]} />
            <meshStandardMaterial color="#ef4444" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Scanning ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.62, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        {/* Radar sweep wedge */}
        <mesh ref={sweepRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.62, 32, 1, 0, Math.PI / 5]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
    </group>
  );
};

const Screen = () => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [screenState, setScreenState] = useState('initial'); // initial, hacking, dashboard, programs
  const [lines, setLines] = useState([
    "> SYSTEM READY...",
    "> SECURE CONNECTION ESTABLISHED",
    "> AWAITING COMMAND",
    "",
    "> PRESS [ENTER] TO INITIATE SEQUENCE"
  ]);
  
  // Satellite telemetry state
  const [telemetry, setTelemetry] = useState({ lat: 34.0522, lon: -118.2437, alt: 405.2, lock: 0 });
  
  // Breach Sequence State
  const [breachStep, setBreachStep] = useState(0); // 0: Selection, 1: Auth, 2: Takeover, 3: Sequence, 4: Success
  const [inputVal, setInputVal] = useState("");
  const [breachLogs, setBreachLogs] = useState([]);
  const [bypassProgress, setBypassProgress] = useState(0);
  const [cmdActive, setCmdActive] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const [subMenuIndex, setSubMenuIndex] = useState(0);
  const [flowLines, setFlowLines] = useState([]);
  const [flowStage, setFlowStage] = useState('idle');
  const [inputTarget, setInputTarget] = useState('');
  const [alertPulse, setAlertPulse] = useState(false);
  const [activeProgram, setActiveProgram] = useState('TRACKING');
  const [programLoading, setProgramLoading] = useState(false);
  const [programNotice, setProgramNotice] = useState('');
  const [programStatus, setProgramStatus] = useState({
    TRACKING: 'LIVE',
    INTRUSION: 'ARMED',
    WEAPONIZE: 'LOCKED',
    BLACKOUT: 'READY',
  });
  const [programLogs, setProgramLogs] = useState([
    "> SYSTEM READY",
    "> PROGRAMS IDLE",
  ]);
  const [liveBlink, setLiveBlink] = useState(true);
  const [waveTick, setWaveTick] = useState(0);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootStatus, setBootStatus] = useState('');
  const [booting, setBooting] = useState(false);
  const dashboardRef = useRef();
  const programsRef = useRef();
  const bootScanRef = useRef();
  const transitionRef = useRef(0);
  const transitionTargetRef = useRef(0);
  const menuItems = ["Target Tracking Operations","Network Intrusion Gateway","Strategic Systems Control","Signal Manipulation","Orbital Weaponization","Blackout & Disruption","Self-Destruction Protocol","Exit Command Interface"];
  const trackingItems = ["Track Individual","Track Device Signature","Track Signal Origin","Predict Movement Path","Live Telemetry Feed","Return to Main Menu"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (screenState !== 'dashboard') return undefined;
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        lat: prev.lat + 0.001,
        lon: prev.lon - 0.001,
        alt: 405 + Math.sin(Date.now() / 1000) * 0.5,
        lock: Math.min(prev.lock + 0.5, 100)
      }));
    }, 250);
    return () => clearInterval(interval);
  }, [screenState]);

  useEffect(() => {
    if (screenState !== 'dashboard') return undefined;
    const blink = setInterval(() => setLiveBlink(prev => !prev), 500);
    const wave = setInterval(() => setWaveTick(prev => prev + 1), 120);
    return () => {
      clearInterval(blink);
      clearInterval(wave);
    };
  }, [screenState]);

  useEffect(() => {
    if (screenState === 'breach' && breachStep === 6) {
      const interval = setInterval(() => {
        setAlertPulse(prev => !prev);
      }, 250);
      return () => clearInterval(interval);
    }
    setAlertPulse(false);
    return undefined;
  }, [screenState, breachStep]);

  useFrame((state, delta) => {
    const target = transitionTargetRef.current;
    transitionRef.current += (target - transitionRef.current) * Math.min(1, delta * 4);
    if (dashboardRef.current && programsRef.current) {
      const t = transitionRef.current;
      dashboardRef.current.position.x = 0.6 * t;
      programsRef.current.position.x = -0.6 * (1 - t);
      dashboardRef.current.scale.setScalar(1 - t * 0.04);
      programsRef.current.scale.setScalar(0.96 + t * 0.04);
    }

    if (bootScanRef.current) {
      const t = state.clock.elapsedTime;
      const active = screenState === 'hacking';
      bootScanRef.current.position.y = Math.sin(t * 1.4) * 0.6;
      const targetOpacity = active ? 0.12 + Math.sin(t * 3) * 0.05 : 0;
      bootScanRef.current.material.opacity = THREE.MathUtils.lerp(
        bootScanRef.current.material.opacity,
        targetOpacity,
        Math.min(1, delta * 6)
      );
    }
  });

  const pushLine = (line) => {
    setLines((prev) => [...prev.slice(-12), line]);
  };

  const replaceLastLine = (line) => {
    setLines((prev) => {
      if (prev.length === 0) return [line];
      const trimmed = prev.slice(0, -1);
      return [...trimmed, line];
    });
  };

  const updateProgressLine = (label, progress) => {
    const total = 20;
    const filled = Math.round((progress / 100) * total);
    const bar = `${"#".repeat(filled)}${".".repeat(total - filled)}`;
    setBootProgress(progress);
    setBootStatus(label);
    replaceLastLine(`> ${label} [${bar}] ${String(progress).padStart(3, " ")}%`);
  };

  const launchProgram = (name) => {
    if (programLoading) return;
    setProgramLoading(true);
    setProgramNotice(`Launching ${name}...`);
    setProgramLogs((prev) => [
      ...prev.slice(-6),
      `> ${name} SELECTED`,
      "> INITIATING SEQUENCE",
    ]);
    setTimeout(() => {
      setActiveProgram(name);
      setProgramNotice(`${name} online`);
      setProgramLogs((prev) => [
        ...prev.slice(-6),
        `> ${name} ONLINE`,
      ]);
      setProgramStatus((prev) => ({
        ...prev,
        [name]:
          name === 'TRACKING'
            ? 'LIVE'
            : name === 'INTRUSION'
              ? 'BREACHING'
              : name === 'WEAPONIZE'
                ? 'ARMED'
                : 'ACTIVE',
      }));
      dispatchSceneEvent(name);
      setProgramLoading(false);
    }, 900);
  };

  const dispatchSceneEvent = (name) => {
    if (name === 'TRACKING') {
      window.dispatchEvent(new CustomEvent('tracking-cinematic', { detail: { lat: 6.8412, lon: 80.0034 } }));
    } else if (name === 'INTRUSION') {
      window.dispatchEvent(new Event('cinematic-clouds-peel'));
      window.dispatchEvent(new Event('cinematic-night-to-day'));
    } else if (name === 'WEAPONIZE') {
      window.dispatchEvent(new Event('satellite-rotate-to-front'));
      window.dispatchEvent(new Event('satellite-focus'));
    } else if (name === 'BLACKOUT') {
      window.dispatchEvent(new Event('blackout-on'));
      setTimeout(() => window.dispatchEvent(new Event('blackout-off')), 6000);
    }
  };

  // Breach Sequence Animation
  useEffect(() => {
    if (screenState === 'breach' && breachStep === 2) {
        // Takeover Sequence
        const runTakeover = async () => {
            await new Promise(r => setTimeout(r, 2000));
            setBreachStep(3); // Go to Hacking Sequence
        };
        runTakeover();
    }

    if (screenState === 'breach' && breachStep === 3) {
        // Hacking Sequence
        const runSequence = async () => {
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            const addLog = (msg) => setBreachLogs(prev => [...prev.slice(-8), msg]);

            addLog("[INFO] Establishing shadow uplink...");
            await delay(400);
            addLog("[OK] Signal lock achieved");
            await delay(300);
            addLog("[WARN] Redundant control loop detected");
            await delay(400);
            addLog("[ACTION] Rerouting command authority");
            await delay(500);
            
            // Bypass Progress
            for(let i=0; i<=100; i+=5) {
                setBypassProgress(i);
                await delay(50);
            }
            
            await delay(500);
            addLog("REQUESTING ADMINISTRATION OVERRIDE...");
            await delay(800);
            addLog("OVERRIDE GRANTED (WINDOW: 00:01:12)");
            await delay(400);
            addLog("ROOT CONTROL ASSIGNED");
            await delay(400);
            setBreachStep(4); // Success
        };
        runSequence();
    }

    if (screenState === 'breach' && breachStep === 5) {
        // Execution Sequence
        const runExecution = async () => {
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            const addLog = (msg) => setBreachLogs(prev => [...prev.slice(-8), msg]);

            addLog("COMMAND AUTHENTICATED");
            await delay(500);
            addLog("ARMING PAYLOAD...");
            await delay(800);
            addLog("TARGET LOCK CONFIRMED");
            await delay(500);
            addLog("FIRING ORBITAL BEAM...");
            
            // Flash effect or just text changes
            await delay(2000);
            
            // Reset to initial
            setScreenState('initial');
            setBreachStep(0);
            setLines(["> SYSTEM REBOOT...", "> MEMORY FLUSHED", "> READY"]);
        };
        runExecution();
    }

    if (screenState === 'breach' && breachStep === 6) {
        // Self Destruct Sequence
        const runDestruct = async () => {
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            
            // Countdown
            for(let i=5; i>0; i--) {
                setBreachLogs([`SELF DESTRUCT IN: ${i}`]);
                await delay(1000);
            }
            
            setBreachLogs(["ARMING CORE..."]);
            await delay(600);
            setBreachLogs(["LINK STABLE", "ACQUIRING VISUAL..."]);
            window.dispatchEvent(new Event('satellite-rotate-to-front'));
            await delay(1200);
            window.dispatchEvent(new Event('satellite-focus'));
            await delay(1200);
            window.dispatchEvent(new Event('satellite-zoom'));
            await delay(2000);

            window.dispatchEvent(new Event('satellite-destruct'));
            
            setBreachLogs(["CORE BREACH CONFIRMED", "*** SIGNAL LOST ***"]);
            await delay(2000);
            
            // Reset
            setScreenState('initial');
            setBreachStep(0);
            setLines(["> NO CARRIER", "> SEARCHING FOR SIGNAL...", "> SYSTEM READY"]);
        };
        runDestruct();
    }
  }, [screenState, breachStep]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Prevent triggering if typing in a form
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;

      if (screenState === 'initial' && e.key === 'Enter') {
            if (booting) return;
            setBooting(true);
            setScreenState('hacking');
            setBootProgress(0);
            setBootStatus('BOOTING');
            setLines([
              "> SYSTEM WAKE SIGNAL RECEIVED",
              "> POWER RAILS: STABLE",
              "> MEMORY CHECK: PASS",
              "> BOOT SEQUENCE: START",
            ]);

            const delay = (ms) => new Promise(r => setTimeout(r, ms));

            const stages = [
              { label: "VERIFYING FIRMWARE", from: 0, to: 22, step: 2, tempo: 35 },
              { label: "CALIBRATING SENSORS", from: 22, to: 46, step: 2, tempo: 35 },
              { label: "NEGOTIATING ENCRYPTION", from: 46, to: 74, step: 2, tempo: 32 },
              { label: "ESTABLISHING UPLINK", from: 74, to: 100, step: 2, tempo: 30 },
            ];

            await delay(300);
            pushLine("> BUS CONTROLLER: ONLINE");
            await delay(280);
            pushLine("> SECURITY MODULES: LOADED");
            pushLine("> ");

            for (const stage of stages) {
              for (let p = stage.from; p <= stage.to; p += stage.step) {
                updateProgressLine(stage.label, p);
                await delay(stage.tempo);
              }
            }

            await delay(250);
            pushLine("> LINK STABLE");
            await delay(300);
            pushLine("> CONNECTION ESTABLISHED");
            pushLine("> PRESS [ENTER] TO OPEN DASHBOARD");
            setBooting(false);
      } 
      else if (screenState === 'hacking' && e.key === 'Enter' && lines[lines.length - 1].includes("PRESS [ENTER]")) {
             setScreenState('dashboard');
      }
      else if (screenState === 'dashboard' && e.key === 'Enter') {
             setScreenState('breach');
             setBreachStep(0); // Start at selection
      }
      else if (screenState === 'dashboard' && e.key.toLowerCase() === 'p') {
             transitionTargetRef.current = 1;
             setScreenState('programs');
      }
      else if (screenState === 'programs' && e.key === 'Escape') {
             transitionTargetRef.current = 0;
             setScreenState('dashboard');
      }
      else if (screenState === 'breach') {
          if (breachStep === 4) {
              if (!cmdActive && e.key === 'Enter') {
                  setCmdActive(true);
                  setFlowStage('menu');
                  setFlowLines([
                    "SATELLITE CONTROL ACQUIRED",
                    "COMMAND AUTHORITY: LUCIFER",
                    "MODE: DIRECTIVE SELECTION"
                  ]);
                  return;
              }
              if (cmdActive) {
                  if (flowStage === 'menu') {
                      if (e.key === 'ArrowUp') setMenuIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
                      else if (e.key === 'ArrowDown') setMenuIndex(prev => (prev + 1) % menuItems.length);
                      else if (e.key === 'Enter') {
                          if (menuIndex === 0) {
                              setFlowStage('submenu');
                              setSubMenuIndex(0);
                              setFlowLines(["> Track Individual","  Track Device Signature","  Track Signal Origin","  Predict Movement Path","  Live Telemetry Feed","  Return to Main Menu"]);
                          } else if (menuIndex === 6) {
                              setBreachStep(6);
                          } else if (menuIndex === 7) {
                              setCmdActive(false);
                              setFlowStage('idle');
                              setFlowLines([]);
                          } else {
                              setFlowLines([menuItems[menuIndex].toUpperCase(),"READY"]);
                          }
                      }
                  } else if (flowStage === 'submenu') {
                      if (e.key === 'ArrowUp') setSubMenuIndex(prev => (prev - 1 + trackingItems.length) % trackingItems.length);
                      else if (e.key === 'ArrowDown') setSubMenuIndex(prev => (prev + 1) % trackingItems.length);
                      else if (e.key === 'Enter') {
                          const item = trackingItems[subMenuIndex];
                          if (item === "Return to Main Menu") {
                              setFlowStage('menu');
                              setFlowLines([
                                "SATELLITE CONTROL ACQUIRED",
                                "COMMAND AUTHORITY: LUCIFER",
                                "MODE: DIRECTIVE SELECTION"
                              ]);
                          } else if (item === "Track Individual") {
                              setFlowStage('track-input');
                              setInputTarget('');
                              setFlowLines(["TARGET IDENTIFIER ENTERED:",""]);
                          } else {
                              setFlowLines([item.toUpperCase(),"READY"]);
                          }
                      }
                      } else if (flowStage === 'track-input') {
                          if (e.key === 'Enter') {
                              const runFlow = async () => {
                                  const delay = (ms) => new Promise(r => setTimeout(r, ms));
                                  setFlowLines([`TARGET IDENTIFIER ENTERED:`,`> ${inputTarget || 'UNKNOWN'}`]);
                                  await delay(600);
                                  setFlowLines(["ACCESSING: GODS_EYE","GLOBAL OBSERVATION LAYER ONLINE"]);
                                  await delay(800);
                                  setFlowLines(["RUNNING FACIAL RECOGNITION ALGORITHMS...","MULTI-SOURCE IMAGE CORRELATION","CONFIDENCE SCORE: 99.8%","FACE IDENTIFIED","BIOMETRIC PROFILE MATCHED"]);
                                  await delay(1200);
                                  setFlowLines(["TRACING SIGNAL ORIGIN...","ANALYZING MOVEMENT PATTERNS","RESOLVING GEO-SPATIAL VECTOR"]);
                                  await delay(1000);
                                  setFlowLines(["PLANETARY VIEW: EARTH","REGION: SOUTH ASIA","COUNTRY IDENTIFIED: SRI LANKA","METROPOLITAN ZONE: COLOMBO"]);
                                  await delay(1200);
                                  setFlowLines(["POINT OF INTEREST IDENTIFIED","RESIDENTIAL COMPLEX DETECTED","","LOCATION TAG:","PITIPANA NORTH","NSBM GREEN UNIVERSITY AREA","","LATITUDE: 6.8412 deg N","LONGITUDE: 80.0034 deg E"]);
                                  await delay(1500);
                                  window.dispatchEvent(new CustomEvent('tracking-cinematic', { detail: { target: inputTarget || 'UNKNOWN', lat: 6.8412, lon: 80.0034 } }));
                                  setFlowStage('submenu');
                              };
                              runFlow();
                          } else if (e.key === 'Backspace') {
                              setInputTarget(prev => prev.slice(0, -1));
                          setFlowLines(["TARGET IDENTIFIER ENTERED:",`> ${inputTarget.slice(0, -1)}`]);
                      } else if (e.key.length === 1) {
                          const next = (inputTarget + e.key).slice(0, 24);
                          setInputTarget(next);
                          setFlowLines(["TARGET IDENTIFIER ENTERED:",`> ${next}`]);
                      }
                  } else if (e.key === 'Escape') {
                      setFlowStage('menu');
                      setFlowLines([
                        "SATELLITE CONTROL ACQUIRED",
                        "COMMAND AUTHORITY: LUCIFER",
                        "MODE: DIRECTIVE SELECTION"
                      ]);
                  }
              }
              return;
          }
          if (breachStep === 0) {
              if (e.key === '3') {
                  setBreachStep(1); // Go to Auth
                  setInputVal("");
              }
          } else if (breachStep === 1) {
              if (e.key === 'Enter') {
                  if (inputVal === '1234') {
                      setBreachStep(2); // Takeover
                  } else {
                      setInputVal(""); // Reset on wrong password
                  }
              } else if (e.key === 'Backspace') {
                  setInputVal(prev => prev.slice(0, -1));
              } else if (/^[0-9]$/.test(e.key)) {
                  setInputVal(prev => (prev + e.key).slice(0, 4));
              }
          } else if (breachStep === 4) {
              if (e.key === 'Enter') {
                  setBreachStep(5); // Go to execution
              } else if (e.key === 'Delete' || e.key === 'Backspace') {
                  setBreachStep(6); // Go to self destruct
              }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenState, lines, breachStep, inputVal, cmdActive, flowStage, menuIndex, subMenuIndex, inputTarget]);

  const renderBreachScreen = () => {
    switch(breachStep) {
      case 0: // Selection
              return (
                  <group position={[0, 0, 0]}>
                      <Text position={[0, 0.6, 0]} fontSize={0.1} color="#ef4444" anchorX="center">ORBITAL ASSET DIRECTORY</Text>
                      <Text position={[0, 0.45, 0]} fontSize={0.06} color="#ef4444" anchorX="center">CLASSIFIED ACCESS</Text>
                      
                      <Text position={[-1.1, 0.1, 0]} fontSize={0.07} color="#94a3b8" anchorX="left">
                        [1] SAT-A17 | GEO | ACTIVE
                      </Text>
                      <Text position={[-1.1, -0.1, 0]} fontSize={0.07} color="#94a3b8" anchorX="left">
                        [2] SAT-K09 | LEO | STANDBY
                      </Text>
                      <Text position={[-1.1, -0.3, 0]} fontSize={0.07} color="#ef4444" anchorX="left">
                        [3] SAT-X41 | MIL-RELAY | RESTRICTED
                      </Text>

                      <Text position={[0, -0.7, 0]} fontSize={0.07} color="#ffffff" anchorX="center">
                        SELECT ASSET [1-3]
                      </Text>
                  </group>
              );
          case 1: // Auth
              return (
                  <group position={[0, 0, 0]}>
                      <Text position={[0, 0.3, 0]} fontSize={0.08} color="#ef4444" anchorX="center">WARNING: RESTRICTED ASSET</Text>
                      <Text position={[0, 0.15, 0]} fontSize={0.08} color="#ef4444" anchorX="center">AUTHORIZATION REQUIRED</Text>
                      
                      <Text position={[0, -0.2, 0]} fontSize={0.1} color="#ffffff" anchorX="center">
                        ENTER ACCESS KEY:
                      </Text>
                      <Text position={[0, -0.4, 0]} fontSize={0.12} color="#38bdf8" anchorX="center">
                        {inputVal.padEnd(4, '_')}
                      </Text>
                  </group>
              );
          case 2: // Takeover
              return (
                  <group position={[0, 0, 0]}>
                      <Text position={[0, 0.2, 0]} fontSize={0.12} color="#ef4444" anchorX="center" maxWidth={2.5} textAlign="center">
                        TRANSFERRING CONTROL TO: LUCIFER
                      </Text>
                      <Text position={[0, -0.2, 0]} fontSize={0.06} color="#ef4444" anchorX="center">
                        NEURAL COMMAND INTERFACE INITIALIZING...
                      </Text>
                  </group>
              );
          case 3: // Sequence
              return (
                  <group position={[0, 0, 0]}>
                      <Text position={[0, 0.7, 0]} fontSize={0.08} color="#ef4444" anchorX="center">SYSTEM INTEGRITY CHECK</Text>
                      
                      {/* Status Blocks */}
                      <Text position={[-0.8, 0.4, 0]} fontSize={0.06} color="#ef4444" anchorX="left">COMM LAYER: ❌ LOCKED</Text>
                      <Text position={[-0.8, 0.25, 0]} fontSize={0.06} color="#f59e0b" anchorX="left">COMMAND BUS: !! PARTIAL</Text>
                      <Text position={[-0.8, 0.1, 0]} fontSize={0.06} color="#ef4444" anchorX="left">FAILSAFE CORE: ❌ ACTIVE</Text>
                      
                      {/* Logs */}
                      <Text position={[0.4, 0.25, 0]} fontSize={0.05} color="#94a3b8" anchorX="left" maxWidth={1.2}>
                          {breachLogs.join('\n')}
                      </Text>

                      <Text position={[0, -0.3, 0]} fontSize={0.08} color="#ffffff" anchorX="center">INITIATING SYSTEM BYPASS...</Text>
                      
                      {/* Progress Bar */}
                      <mesh position={[0, -0.5, 0]}>
                          <planeGeometry args={[2, 0.1]} />
                          <meshBasicMaterial color="#1e293b" />
                      </mesh>
                      <mesh position={[-1 + (bypassProgress/100), -0.5, 0.01]}>
                          <planeGeometry args={[2 * (bypassProgress/100), 0.1]} />
                          <meshBasicMaterial color="#ef4444" />
                      </mesh>
                      
                      <Text position={[0, -0.7, 0]} fontSize={0.08} color="#ef4444" anchorX="center">
                        ANOMALOUS ACTIVITY DETECTED
                      </Text>
                  </group>
              );
          case 4: // Success
              return (
                  <group position={[0, 0, 0]}>
                      {!cmdActive ? (
                        <>
                          <Text position={[0, 0.5, 0]} fontSize={0.15} color="#00ff00" anchorX="center">SATELLITE CONTROL ACQUIRED</Text>
                          <Text position={[0, 0.2, 0]} fontSize={0.09} color="#38bdf8" anchorX="center">COMMAND AUTHORITY: LUCIFER</Text>
                          <Text position={[0, -0.05, 0]} fontSize={0.08} color="#ffffff" anchorX="center">MODE: DIRECTIVE SELECTION</Text>
                          <mesh position={[0, -0.4, 0]}>
                              <planeGeometry args={[1.8, 0.3]} />
                              <meshBasicMaterial color="#ef4444" />
                          </mesh>
                          <Text position={[0, -0.4, 0.01]} fontSize={0.1} color="#ffffff" anchorX="center" anchorY="middle">{">> [ENTER] OPEN INTERFACE"}</Text>
                        </>
                      ) : (
                        <>
                          <Text position={[0, 0.6, 0]} fontSize={0.12} color="#38bdf8" anchorX="center">LUCIFER SATELLITE COMMAND SYSTEM</Text>
                          <group position={[0, 0.2, 0]}>
                            <Text position={[0, 0.2, 0]} fontSize={0.08} color="#00ff00" anchorX="center">{flowLines[0] || ""}</Text>
                            <Text position={[0, 0.05, 0]} fontSize={0.06} color="#38bdf8" anchorX="center">{flowLines[1] || ""}</Text>
                            <Text position={[0, -0.08, 0]} fontSize={0.06} color="#ffffff" anchorX="center">{flowLines[2] || ""}</Text>
                          </group>
                          {flowStage === 'menu' && (
                            <group position={[-0.8, -0.2, 0]}>
                              {menuItems.map((m, i) => (
                                <Text key={m} position={[0, -0.12 * i, 0]} fontSize={0.065} color={i === menuIndex ? "#38bdf8" : "#94a3b8"} anchorX="left">
                                  {(i === menuIndex ? "> " : "  ") + m}
                                </Text>
                              ))}
                            </group>
                          )}
                          {flowStage === 'submenu' && (
                            <group position={[-0.8, -0.2, 0]}>
                              {trackingItems.map((m, i) => (
                                <Text key={m} position={[0, -0.12 * i, 0]} fontSize={0.065} color={i === subMenuIndex ? "#38bdf8" : "#94a3b8"} anchorX="left">
                                  {(i === subMenuIndex ? "> " : "  ") + m}
                                </Text>
                              ))}
                            </group>
                          )}
                          {flowStage === 'track-input' && (
                            <group position={[0, -0.25, 0]}>
                              <Text position={[0, 0.1, 0]} fontSize={0.07} color="#ffffff" anchorX="center">TARGET IDENTIFIER ENTERED:</Text>
                              <Text position={[0, -0.05, 0]} fontSize={0.1} color="#38bdf8" anchorX="center">{"> " + inputTarget}</Text>
                              <Text position={[0, -0.2, 0]} fontSize={0.06} color="#94a3b8" anchorX="center">[ENTER] CONFIRM * [ESC] BACK</Text>
                            </group>
                          )}
                        </>
                      )}
                  </group>
              );
          case 5: // Execution
              return (
                  <group position={[0, 0, 0]}>
                      <mesh>
                          <planeGeometry args={[2.8, 1.8]} />
                          <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
                      </mesh>
                      <Text position={[0, 0, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
                          TARGET NEUTRALIZED
                      </Text>
                      <Text position={[0, -0.3, 0]} fontSize={0.1} color="#ffffff" anchorX="center">
                          MISSION COMPLETE
                      </Text>
                  </group>
              );
          case 6: // Self Destruct
              return (
                  <group position={[0, 0, 0]}>
                      <mesh>
                          <planeGeometry args={[2.8, 1.8]} />
                          <meshBasicMaterial color="#ef4444" transparent opacity={alertPulse ? 0.95 : 0.5} />
                      </mesh>
                      <Text position={[0, 0.2, 0.01]} fontSize={0.2} color="#ffffff" anchorX="center">
                          !! WARNING !!
                      </Text>
                      <Text position={[0, 0.02, 0.01]} fontSize={0.1} color="#ffffff" anchorX="center">
                          SELF DESTRUCT SEQUENCE
                      </Text>
                      <Text position={[0, -0.2, 0.01]} fontSize={0.15} color="#000000" anchorX="center">
                          {breachLogs[0] || "INITIATING..."}
                      </Text>
                  </group>
              );
          default:
              return null;
      }
  };

  const getHint = () => {
       switch(screenState) {
           case 'initial': return "Press [ENTER] to Start System";
           case 'hacking': 
                if (lines.length > 0 && lines[lines.length - 1].includes("PRESS [ENTER]")) {
                    return "Press [ENTER] to Launch Dashboard";
                }
                return "System Hacking in Progress...";
          case 'dashboard': return "Press [ENTER] to Initiate Breach | [P] Programs";
          case 'programs': return "[ESC] Return to Dashboard";
          case 'breach':
               if (breachStep === 0) return "Select Asset [3] for Classified";
               if (breachStep === 1) return "Hint: Passkey is '1234'";
               if (breachStep === 2) return "Establishing Neural Link...";
               if (breachStep === 3) return "Bypassing Security...";
               if (breachStep === 4) return cmdActive ? "Use Arrow Keys * [ENTER] Select * [ESC] Back" : "[ENTER] Enter LUCIFER Command Interface";
               if (breachStep === 5) return "Mission In Progress...";
               if (breachStep === 6) return "Destruction Imminent...";
               return "";
           default: return "";
       }
   };

  return (
    <group>
      {/* Dynamic Interaction Hints */}
      <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
          {getHint() && (
              <div className="absolute bottom-4 right-4 text-xs font-mono text-cyan-400/80 bg-black/80 px-3 py-1.5 rounded select-none pointer-events-none border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  {`> ${getHint()}`}
              </div>
          )}
      </Html>

      <mesh>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {screenState === 'hacking' && (
        <mesh ref={bootScanRef} position={[0, 0, 0.02]}>
          <planeGeometry args={[2.8, 0.035]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0} />
        </mesh>
      )}
      
      <group position={[-1.3, 0.8, 0.01]}>
        {screenState === 'initial' || screenState === 'hacking' ? (
            <>
                <Text
                fontSize={0.08}
                color="#00ff00"
                anchorX="left"
                anchorY="top"
                maxWidth={2.6}
                lineHeight={1.2}
                >
                {lines.join('\n')}
                </Text>
                {screenState === 'initial' && (
                    <mesh position={[0, -1.4, 0]}>
                        <planeGeometry args={[0.08, 0.12]} />
                        <meshBasicMaterial color="#00ff00" transparent opacity={cursorVisible  ? 0.8 : 0} />
                    </mesh>
                )}
                {screenState === 'hacking' && (
                    <group position={[1.3, -1.25, 0.01]}>
                        <Text position={[0, 0.18, 0.01]} fontSize={0.05} color="#38bdf8" anchorX="center">
                          {bootStatus || "BOOTING..."}
                        </Text>
                        <mesh>
                          <planeGeometry args={[2.3, 0.1]} />
                          <meshBasicMaterial color="#0f172a" />
                        </mesh>
                        <mesh position={[(-1.15 + (bootProgress / 100) * 2.3 / 2), 0, 0.01]}>
                          <planeGeometry args={[2.3 * (bootProgress / 100), 0.1]} />
                          <meshBasicMaterial color="#22d3ee" transparent opacity={0.75} />
                        </mesh>
                    </group>
                )}
            </>
        ) : screenState === 'dashboard' ? (
            <group position={[0, 0, 0]} ref={dashboardRef}>
                {/* Header Bar */}
                <mesh position={[1.3, 0, 0]}>
                    <planeGeometry args={[2.8, 0.25]} />
                    <meshBasicMaterial color="#1e293b" />
                </mesh>
                <Text position={[1.3, 0, 0.01]} fontSize={0.1} color="#ef4444" anchorX="center" anchorY="middle">
                    !! SATELLITE UPLINK ACTIVE !!
                </Text>
                <Text position={[2.35, 0.02, 0.01]} fontSize={0.05} color="#38bdf8" anchorX="right" anchorY="middle">
                    SECURE TUNNEL: ONLINE
                </Text>

                {/* Left Column - Globe/Radar */}
                <group position={[0.7, -0.7, 0]}>
                     <SatelliteGlobe />
                     <group position={[0, -0.7, 0]}>
                        <Text position={[0, 0, 0]} fontSize={0.06} color="#ef4444" anchorX="center">
                          TARGET: ORION-7 [LOCKED]
                        </Text>
                        <Text position={[0.78, 0, 0]} fontSize={0.045} color={liveBlink ? "#22d3ee" : "#0f172a"} anchorX="left">
                          LIVE FEED
                        </Text>
                     </group>
                     {/* Signal strength meter */}
                     <mesh position={[0, -0.95, 0]}>
                        <planeGeometry args={[1.1, 0.12]} />
                        <meshBasicMaterial color="#0f172a" />
                     </mesh>
                     <mesh position={[(-0.55 + (Math.min(100, telemetry.lock) / 100) * 1.1 / 2), -0.95, 0.01]}>
                        <planeGeometry args={[1.1 * (Math.min(100, telemetry.lock) / 100), 0.12]} />
                        <meshBasicMaterial color="#22d3ee" transparent opacity={0.6 + Math.sin(waveTick * 0.35) * 0.2} />
                     </mesh>
                     <Text position={[0, -1.12, 0]} fontSize={0.045} color="#94a3b8" anchorX="center">
                        LINK QUALITY
                     </Text>
                </group>

                {/* Right Column - Telemetry Data */}
                <group position={[1.9, -0.8, 0]}>
                    {/* Orbital Panel */}
                    <mesh position={[0, 0.55, 0]}>
                        <planeGeometry args={[1.3, 0.55]} />
                        <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
                    </mesh>
                    <Text position={[-0.55, 0.78, 0.01]} fontSize={0.055} color="#22d3ee" anchorX="left">ORBITAL</Text>
                    <Text
                        position={[-0.55, 0.63, 0.01]}
                        fontSize={0.055}
                        color="#38bdf8"
                        anchorX="left"
                        anchorY="top"
                        maxWidth={1.2}
                        lineHeight={1.4}
                    >
                        {`LAT:  ${telemetry.lat.toFixed(4)} deg N
LON:  ${telemetry.lon.toFixed(4)} deg W
ALT:  ${telemetry.alt.toFixed(1)} km
VEL:  7,600 m/s
AZM:  142.5 deg`}
                    </Text>

                    {/* Signal Panel */}
                    <mesh position={[0, -0.05, 0]}>
                        <planeGeometry args={[1.3, 0.45]} />
                        <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
                    </mesh>
                    <Text position={[-0.55, 0.1, 0.01]} fontSize={0.055} color="#22d3ee" anchorX="left">SIGNAL</Text>
                    <Text position={[-0.55, -0.02, 0.01]} fontSize={0.055} color="#38bdf8" anchorX="left">
                      {`STRENGTH: ${Math.floor(85 + Math.sin(Date.now()/1000)*5)}%
STATUS: ${telemetry.lock < 100 ? 'DECRYPTING...' : 'VULNERABLE'}`}
                    </Text>

                    {/* Lock Panel */}
                    <mesh position={[0, -0.62, 0]}>
                        <planeGeometry args={[1.3, 0.45]} />
                        <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
                    </mesh>
                    <Text position={[-0.55, -0.47, 0.01]} fontSize={0.055} color="#22d3ee" anchorX="left">TARGET LOCK</Text>
                    <Text position={[-0.55, -0.6, 0.01]} fontSize={0.055} color="#38bdf8" anchorX="left">
                      {`LOCK: [${'|'.repeat(Math.floor(telemetry.lock/5)).padEnd(20, '.')}]`}
                    </Text>

                    {/* Status badges */}
                    <group position={[0.25, -0.88, 0.01]}>
                        <mesh position={[-0.4, 0, 0]}>
                          <planeGeometry args={[0.7, 0.16]} />
                          <meshBasicMaterial color="#1f2937" />
                        </mesh>
                        <Text position={[-0.4, 0, 0.01]} fontSize={0.05} color="#94a3b8" anchorX="center">SYNC</Text>
                        <mesh position={[0.45, 0, 0]}>
                          <planeGeometry args={[0.7, 0.16]} />
                          <meshBasicMaterial color="#0ea5e9" />
                        </mesh>
                        <Text position={[0.45, 0, 0.01]} fontSize={0.05} color="#ffffff" anchorX="center">UPLINK</Text>
                    </group>

                    {/* Waveform */}
                    <Text
                        position={[-0.55, -0.18, 0.01]}
                        fontSize={0.045}
                        color="#22d3ee"
                        anchorX="left"
                        anchorY="top"
                        maxWidth={1.2}
                >
                        {[
                          ".-==--=---==--.",
                          "--==---=--==---",
                          "==--==---=--==.",
                          "-=---==--=---==",
                          ".==--=---==--=-",
                          "--=---==--=---=",
                          "==---=--==---=-",
                          "-==--=---==--=-",
                        ][waveTick % 8]}
                </Text>
                </group>
            </group>
        ) : screenState === 'programs' ? (
            <group position={[0, 0, 0]} ref={programsRef}>
                {/* Header */}
                <mesh position={[1.3, 0.9, 0]}>
                    <planeGeometry args={[2.8, 0.25]} />
                    <meshBasicMaterial color="#0f172a" />
                </mesh>
                <Text position={[1.3, 0.9, 0.01]} fontSize={0.09} color="#38bdf8" anchorX="center" anchorY="middle">
                    LUCIFER PROGRAMS
                </Text>

                {/* Apps grid */}
                <mesh position={[0.35, -0.1, 0]}>
                    <planeGeometry args={[1.4, 1.6]} />
                    <meshBasicMaterial color="#0b1220" />
                </mesh>
                <Text position={[-0.25, 0.55, 0.01]} fontSize={0.07} color="#94a3b8" anchorX="left">APPS</Text>
                {[
                  ["TRACKING", "LIVE", "ring"],
                  ["INTRUSION", programStatus.INTRUSION, "triangle"],
                  ["WEAPONIZE", programStatus.WEAPONIZE, "diamond"],
                  ["BLACKOUT", programStatus.BLACKOUT, "square"],
                ].map((app, i) => {
                  const active = activeProgram === app[0];
                  const pulse = 0.6 + Math.sin(waveTick * 0.35) * 0.2;
                  return (
                    <group key={app[0]} position={[-0.35 + (i % 2) * 0.62, 0.35 - Math.floor(i / 2) * 0.35, 0.01]}>
                      <mesh onClick={() => launchProgram(app[0])}>
                        <planeGeometry args={[0.55, 0.28]} />
                        <meshBasicMaterial color={active ? "#0ea5e9" : "#111827"} transparent opacity={active ? pulse : 1} />
                      </mesh>
                      {app[2] === "ring" && (
                        <mesh position={[-0.22, 0.01, 0.02]}>
                          <ringGeometry args={[0.035, 0.055, 24]} />
                          <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} side={THREE.DoubleSide} />
                        </mesh>
                      )}
                      {app[2] === "triangle" && (
                        <mesh position={[-0.22, 0.01, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                          <coneGeometry args={[0.055, 0.08, 3]} />
                          <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
                        </mesh>
                      )}
                      {app[2] === "diamond" && (
                        <mesh position={[-0.22, 0.01, 0.02]} rotation={[0, 0, Math.PI / 4]}>
                          <boxGeometry args={[0.07, 0.07, 0.01]} />
                          <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
                        </mesh>
                      )}
                      {app[2] === "square" && (
                        <mesh position={[-0.22, 0.01, 0.02]}>
                          <boxGeometry args={[0.07, 0.07, 0.01]} />
                          <meshBasicMaterial color="#94a3b8" transparent opacity={0.9} />
                        </mesh>
                      )}
                      <Text position={[-0.22, 0.05, 0.01]} fontSize={0.055} color="#e2e8f0" anchorX="left">{app[0]}</Text>
                      <Text position={[-0.22, -0.06, 0.01]} fontSize={0.045} color="#94a3b8" anchorX="left">{app[1]}</Text>
                    </group>
                  );
                })}

                {/* Console panel */}
                <mesh position={[2.05, -0.05, 0]}>
                    <planeGeometry args={[1.4, 1.6]} />
                    <meshBasicMaterial color="#0b1220" />
                </mesh>
                <Text position={[1.5, 0.55, 0.01]} fontSize={0.07} color="#94a3b8" anchorX="left">CONSOLE</Text>
                <Text position={[1.5, 0.35, 0.01]} fontSize={0.055} color="#38bdf8" anchorX="left">
                  {programLogs.slice(-7).join('\n')}
                </Text>
                <Text position={[1.5, -0.45, 0.01]} fontSize={0.05} color="#22d3ee" anchorX="left">
                  {programNotice || `${activeProgram} active`}
                </Text>

                {/* Actions */}
                <group position={[1.3, -0.85, 0.01]}>
                  <mesh position={[-0.6, 0, 0]} onClick={() => setProgramNotice("ALL PROGRAMS PAUSED")}>
                    <planeGeometry args={[0.75, 0.22]} />
                    <meshBasicMaterial color="#1f2937" />
                  </mesh>
                  <Text position={[-0.6, 0, 0.01]} fontSize={0.055} color="#94a3b8" anchorX="center">PAUSE</Text>
                  <mesh position={[0.2, 0, 0]} onClick={() => launchProgram('WEAPONIZE')}>
                    <planeGeometry args={[0.75, 0.22]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                  <Text position={[0.2, 0, 0.01]} fontSize={0.055} color="#ffffff" anchorX="center">ARM</Text>
                  <mesh position={[1.0, 0, 0]} onClick={() => launchProgram('INTRUSION')}>
                    <planeGeometry args={[0.75, 0.22]} />
                    <meshBasicMaterial color="#0ea5e9" />
                  </mesh>
                  <Text position={[1.0, 0, 0.01]} fontSize={0.055} color="#ffffff" anchorX="center">OVERRIDE</Text>
                </group>
            </group>
        ) : (
            <group position={[1.3, -0.9, 0]}>
                {renderBreachScreen()}
            </group>
        )}
      </group>
    </group>
  );
};

const Laptop = (props) => {
  const { theme } = useTheme();
  const lidGroup = useRef();
  const laptopGroup = useRef();
  const hoverRef = useRef(0);
  const clickPulseRef = useRef(0);
  const bodyColor = theme === 'dark'  ? '#334155' : '#94a3b8';
  
  // Animation state
  const [isOpen, setIsOpen] = useState(false);
  const [rgbEnabled, setRgbEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Trigger open animation after mount
    setTimeout(() => setIsOpen(true), 500);

    const handleKeyDown = (e) => {
        if (e.key.toLowerCase() === 'r' && document.activeElement && document.activeElement.tagName !== 'INPUT') {
            setRgbEnabled(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  
  const aluminumMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.9,
    roughness: 0.28,
    clearcoat: 0.3,
    clearcoatRoughness: 0.35,
  }), [bodyColor]);

  const edgeHighlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: theme === 'dark' ? '#9ca3af' : '#e2e8f0',
    metalness: 0.7,
    roughness: 0.4,
  }), [theme]);

  const brushedStripMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: theme === 'dark' ? '#475569' : '#cbd5e1',
    metalness: 0.6,
    roughness: 0.5,
    transparent: true,
    opacity: 0.35,
  }), [theme]);

  const keyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.85,
    metalness: 0.05,
  }), []);

  const screenBezelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0b1120',
    roughness: 0.35,
    metalness: 0.1,
  }), []);

  const trackpadMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#374151',
    roughness: 0.4,
    metalness: 0.2,
  }), []);

  const speakerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0b0f18',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  const portMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0b0f18',
    roughness: 0.8,
    metalness: 0.2,
  }), []);

  const hingeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1f2937',
    roughness: 0.45,
    metalness: 0.6,
  }), []);

  const screenGlassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0b1220',
    transparent: true,
    opacity: 0.55,
    metalness: 0.2,
    roughness: 0.15,
    emissive: '#0ea5e9',
    emissiveIntensity: 0.22,
  }), []);

  useFrame((state, delta) => {
    if (lidGroup.current) {
      const clickPulse = clickPulseRef.current;
      const targetRotation = isOpen ? -0.25 + clickPulse * 0.06 : Math.PI / 2;
      lidGroup.current.rotation.x = THREE.MathUtils.lerp(
        lidGroup.current.rotation.x,
        targetRotation,
        delta * 3
      );
    }

    const hoverTarget = isHovered ? 1 : 0;
    hoverRef.current += (hoverTarget - hoverRef.current) * Math.min(1, delta * 6);

    if (laptopGroup.current) {
      const hoverAmount = hoverRef.current;
      laptopGroup.current.rotation.z = THREE.MathUtils.lerp(
        laptopGroup.current.rotation.z,
        -0.03 * hoverAmount,
        delta * 4
      );
      laptopGroup.current.rotation.x = THREE.MathUtils.lerp(
        laptopGroup.current.rotation.x,
        0.02 * hoverAmount,
        delta * 4
      );
      laptopGroup.current.position.y = THREE.MathUtils.lerp(
        laptopGroup.current.position.y,
        0.02 * hoverAmount,
        delta * 4
      );
    }

    if (clickPulseRef.current > 0) {
      clickPulseRef.current = Math.max(0, clickPulseRef.current - delta * 3);
    }

    screenGlassMaterial.emissiveIntensity = 0.22 + 0.2 * hoverRef.current;
  });

  // RGB Material - We'll use a dynamic color in the render loop or just a simple emissive material
  // But standard material with emissive property is better
  const rgbKeyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.85,
    metalness: 0.05,
    emissive: '#ff0000',
    emissiveIntensity: 0.5
  }), []);

  useFrame((state) => {
      if (rgbEnabled) {
          const t = state.clock.getElapsedTime();
          const r = Math.sin(t) * 0.5 + 0.5;
          const g = Math.sin(t + 2) * 0.5 + 0.5;
          const b = Math.sin(t + 4) * 0.5 + 0.5;
          rgbKeyMaterial.emissive.setRGB(r, g, b);
      } else {
          rgbKeyMaterial.emissive.setHex(0x000000);
      }
  });

  return (
    <group
      {...props}
      ref={laptopGroup}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={() => {
        clickPulseRef.current = 1;
      }}
    >
      {/* RGB Hint Text */}
      <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
          <div className="absolute bottom-4 left-4 text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded select-none pointer-events-none">
              Press [R] for RGB
          </div>
      </Html>

      {/* Base */}
      <mesh position={[0, -0.07, 0]} material={aluminumMaterial} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.12, 2.2]} />
      </mesh>

      {/* Brushed strip highlight */}
      <mesh position={[0, -0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} material={brushedStripMaterial} receiveShadow>
        <planeGeometry args={[2.95, 1.95]} />
      </mesh>

      {/* Edge Highlights */}
      <mesh position={[0, -0.015, 1.08]} material={edgeHighlightMaterial} castShadow>
        <boxGeometry args={[3.0, 0.02, 0.03]} />
      </mesh>
      <mesh position={[0, -0.015, -1.08]} material={edgeHighlightMaterial} castShadow>
        <boxGeometry args={[2.7, 0.02, 0.03]} />
      </mesh>
      <mesh position={[-1.58, -0.015, 0]} material={edgeHighlightMaterial} castShadow>
        <boxGeometry args={[0.03, 0.02, 2.05]} />
      </mesh>
      <mesh position={[1.58, -0.015, 0]} material={edgeHighlightMaterial} castShadow>
        <boxGeometry args={[0.03, 0.02, 2.05]} />
      </mesh>

      {/* Trackpad */}
      <mesh
        position={[0, -0.002, 0.62]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={rgbEnabled ? rgbKeyMaterial : trackpadMaterial}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[0.95, 0.6]} />
      </mesh>

      {/* Speaker Grills */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`sp-l-${i}`} position={[-1.05 + i * 0.1, 0.015, 0.42]} material={speakerMaterial}>
          <boxGeometry args={[0.05, 0.01, 0.14]} />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`sp-r-${i}`} position={[0.15 + i * 0.1, 0.015, 0.42]} material={speakerMaterial}>
          <boxGeometry args={[0.05, 0.01, 0.14]} />
        </mesh>
      ))}

      {/* Underside Vents */}
      <group position={[0, -0.12, -0.85]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={`vent-${i}`} position={[-0.6 + i * 0.2, 0, 0]} material={speakerMaterial}>
            <boxGeometry args={[0.12, 0.01, 0.04]} />
          </mesh>
        ))}
      </group>

      {/* Side Ports (USB-C) */}
      <mesh position={[-1.61, -0.055, -0.5]} rotation={[0, 0, Math.PI / 2]} material={portMaterial} castShadow>
          <capsuleGeometry args={[0.02, 0.1, 4, 8]} />
      </mesh>
      <mesh position={[-1.61, -0.055, -0.2]} rotation={[0, 0, Math.PI / 2]} material={portMaterial} castShadow>
          <capsuleGeometry args={[0.02, 0.1, 4, 8]} />
      </mesh>
      {/* Headphone Jack */}
      <mesh position={[1.61, -0.055, 0.5]} rotation={[0, 0, Math.PI / 2]} material={portMaterial} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.01, 16]} />
      </mesh>

      {/* Keyboard Area */}
      <group position={[0, 0.02, -0.2]}>
         {/* Function Row */}
         {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`fr-${i}`} position={[-1.4 + i * 0.215, 0.02, -0.9]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
                <boxGeometry args={[0.165, 0.015, 0.11]} />
            </mesh>
         ))}

         {/* Number Row */}
         {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`nr-${i}`} position={[-1.4 + i * 0.215, 0.02, -0.7]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
                <boxGeometry args={[0.17, 0.03, 0.16]} />
            </mesh>
         ))}

         {/* QWERTY Row */}
         {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`qr-${i}`} position={[-1.35 + i * 0.215, 0.02, -0.48]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
                <boxGeometry args={[i === 0 ? 0.26 : 0.17, 0.03, 0.16]} />
            </mesh>
         ))}

         {/* ASDF Row */}
         {Array.from({ length: 13 }).map((_, i) => (
            <mesh key={`ar-${i}`} position={[-1.35 + i * 0.215, 0.02, -0.26]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
                <boxGeometry args={[i === 0 ? 0.3 : (i === 12 ? 0.32 : 0.17), 0.03, 0.16]} />
            </mesh>
         ))}

         {/* ZXCV Row */}
         {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={`zr-${i}`} position={[-1.25 + i * 0.215, 0.02, -0.04]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
                <boxGeometry args={[i === 0 || i === 11 ? 0.38 : 0.17, 0.03, 0.16]} />
            </mesh>
         ))}

         {/* Bottom Row */}
         <mesh position={[-1.35, 0.02, 0.18]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.18, 0.03, 0.16]} />
         </mesh>
         <mesh position={[-1.1, 0.02, 0.18]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.18, 0.03, 0.16]} />
         </mesh>
         <mesh position={[-0.85, 0.02, 0.18]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.22, 0.03, 0.16]} />
         </mesh>
         <mesh position={[0, 0.02, 0.18]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[1.1, 0.03, 0.16]} />
         </mesh>
         <mesh position={[0.85, 0.02, 0.18]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.22, 0.03, 0.16]} />
         </mesh>
         
         {/* Arrow Keys */}
         <mesh position={[1.25, 0.02, 0.18]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.16, 0.03, 0.07]} />
         </mesh>
         <mesh position={[1.25, 0.02, 0.27]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.16, 0.03, 0.07]} />
         </mesh>
         <mesh position={[1.05, 0.02, 0.27]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.16, 0.03, 0.07]} />
         </mesh>
         <mesh position={[1.45, 0.02, 0.27]} material={rgbEnabled ? rgbKeyMaterial : keyMaterial}>
             <boxGeometry args={[0.16, 0.03, 0.07]} />
         </mesh>
      </group>

      {/* Hinge Cylinder */}
      <mesh position={[0, -0.055, -1.08]} rotation={[0, 0, Math.PI / 2]} material={hingeMaterial} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.2, 32]} />
      </mesh>

      {/* Screen Hinge Group */}
      <group ref={lidGroup} position={[0, -0.055, -1.08]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Offset for pivot point */}
        <group position={[0, 0, 0]}> 
            {/* Lid Back */}
            <mesh position={[0, 1.1, -0.055]} material={aluminumMaterial} castShadow receiveShadow>
                <boxGeometry args={[3.2, 2.2, 0.065]} />
            </mesh>
            
            {/* Logo */}
            <mesh position={[0, 1.1, -0.101]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.08, 32]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.2} />
            </mesh>

            {/* Screen Bezel */}
            <mesh position={[0, 1.1, 0.015]} material={screenBezelMaterial} castShadow receiveShadow>
                <boxGeometry args={[3.04, 2.04, 0.055]} />
            </mesh>

            {/* Screen Glass */}
            <mesh position={[0, 1.1, 0.05]} material={screenGlassMaterial}>
                <planeGeometry args={[2.84, 1.86]} />
            </mesh>
            
            {/* Camera */}
            <mesh position={[0, 2.05, 0.04]}>
                <circleGeometry args={[0.03, 32]} />
                <meshBasicMaterial color="#111" />
            </mesh>

            {/* Screen Content */}
            <group position={[0, 1.1, 0.041]}>
                <Screen />
            </group>
        </group>
      </group>
    </group>
  );
};

const Laptop3D = () => {
  const group = useRef();
  
  useFrame((state) => {
      const t = state.clock.getElapsedTime();
      if(group.current){
          group.current.rotation.y = -0.5 + Math.sin(t * 0.2) * 0.1;
          group.current.position.y = Math.sin(t * 0.5) * 0.1;
      }
  });

  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
        <Environment preset="city" />
        <Float rotationIntensity={0.1} floatIntensity={0} speed={0}>
            <Laptop />
        </Float>
        
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#0b0f18" transparent opacity={0.25} />
        </mesh>
    </group>
  );
};

export default Laptop3D;
