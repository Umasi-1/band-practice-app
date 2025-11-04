import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Play, Wind, TrendingUp, TrendingDown, Repeat, Check, ChevronsRight, Target, Clock, Zap, ArrowLeft, Pause, SkipForward, Music, BellOff, Plus, Minus, Home, BarChart2, Crosshair, Award, Ear, Drum, BookOpen } from 'lucide-react'; // Added Drum, BookOpen, Clock

// --- Progression System ---
const MAX_MASTERY_SCORE = 1000;
const TIER_THRESHOLDS = [0, 50, 150, 300, 500]; // Tier 1 starts at 0, Tier 3 at 150, Tier 5 at 500
const TIER_DESCRIPTIONS = {
  1: { name: 'Beginner', desc: 'Laying the foundation' },
  2: { name: 'Fundamental', desc: 'Building good habits' },
  3: { name: 'Intermediate', desc: 'Developing consistency & control' },
  4: { name: 'Advanced', desc: 'Expanding technique & expression' },
  5: { name: 'Expert', desc: 'Refining and mastering the craft' }
};

const getTierFromScore = (score) => {
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= TIER_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

// --- Instrument Definitions ---
const instrumentFamilies = {
  brass: [
    { id: 'trumpet', name: 'Trumpet', icon: <Play /> },
    { id: 'frenchHorn', name: 'French Horn', icon: <Wind /> },
    { id: 'mellophone', name: 'Mellophone', icon: <Wind /> },
    { id: 'trombone', name: 'Trombone', icon: <Wind /> },
    { id: 'baritone', name: 'Baritone/Euph', icon: <Wind /> },
    { id: 'tuba', name: 'Tuba/Sousa', icon: <Wind /> },
  ],
  woodwind: [
    { id: 'flute', name: 'Flute', icon: <Wind /> },
    { id: 'clarinet', name: 'Clarinet', icon: <Wind /> },
    { id: 'saxophone', name: 'Saxophone', icon: <Wind /> },
    { id: 'oboe', name: 'Oboe', icon: <Wind /> },
    { id: 'bassoon', name: 'Bassoon', icon: <Wind /> },
  ],
  percussion: [
    { id: 'snare', name: 'Snare (Battery)', icon: <Drum /> },
    { id: 'tenors', name: 'Tenors (Battery)', icon: <Drum /> },
    { id: 'bassDrum', name: 'Bass Drum (Battery)', icon: <Drum /> },
    { id: 'mallets', name: 'Mallets (Pit)', icon: <Music /> },
    { id: 'concertPerc', name: 'Concert Perc.', icon: <Music /> },
  ]
};

const allInstruments = [
  ...instrumentFamilies.brass,
  ...instrumentFamilies.woodwind,
  ...instrumentFamilies.percussion
];

const getFamily = (instrumentId) => {
  if (!instrumentId) return null;
  if (instrumentFamilies.brass.find(i => i.id === instrumentId)) return 'brass';
  if (instrumentFamilies.woodwind.find(i => i.id === instrumentId)) return 'woodwind';
  if (instrumentFamilies.percussion.find(i => i.id === instrumentId)) return 'percussion';
  return null;
};

// --- Exercise Databases ---

// --- 1. WIND EXERCISES (Brass & Woodwind) ---

const getWindLongToneExercise = (tier, instrument) => {
  let pitches;
  if (instrument === 'flute') pitches = ['Bb', 'F', 'C'];
  else if (instrument === 'clarinet') pitches = ['G', 'C', 'F'];
  else if (instrument === 'saxophone') pitches = ['G', 'D', 'A'];
  else if (instrument === 'trumpet') pitches = ['C (Concert Bb)', 'G (Concert F)'];
  else pitches = ['G (Concert C)', 'C (Concert F)']; // Horn/Mello/Low Brass

  if (tier === 1) return { description: `(Tier 1) Play long tones on the first 5 notes of your ${pitches[0]} scale. Focus on a steady, clear tone.`, bpm: 60 };
  if (tier <= 3) return { description: `(Tier 2-3) Play long tones on your ${pitches[1]} scale. Perform a 'crescendo-decrescendo' (p < f > p) over 8 beats for each note.`, bpm: 60 };
  return { description: `(Tier 4+) Play a two-octave chromatic scale in whole notes. Perform a 'pp < ff > pp' crescendo on *each* note over 8 beats.`, bpm: 60 };
};

const getWindFlexibilityExercise = (tier, instrument) => {
  if (getFamily(instrument) === 'woodwind') {
    // Woodwinds get "Technical" exercises (e.g., fingerings)
    if (tier === 1) return { description: `(Tier 1) Practice "finger wiggles" on your ${instrument === 'flute' ? 'F' : 'G'} scale. Isolate tricky finger combinations (e.g., C-D on clarinet).`, bpm: 70 };
    if (tier <= 3) return { description: `(Tier 2-3) Play your ${instrument === 'saxophone' ? 'D' : 'C'} scale, focusing on smooth transitions over the "break" (e.g., A-B on clarinet, C#-D on flute).`, bpm: 80 };
    return { description: `(Tier 4+) Practice "trill" fingerings. Slowly alternate between notes (e.g., G-A, F#-G#) for 10 seconds each, focusing on minimal hand movement.`, bpm: 90 };
  } else {
    // Brass get Lip Slurs
    const slurs = (instrument === 'trumpet' || instrument === 'baritone') ? 'C-G-C' : 'Bb-F-Bb';
    if (tier === 1) return { description: `(Tier 1) Practice simple slurs, like ${slurs}, on all valve/slide combinations. Start slow, focus on clean transitions.`, bpm: 70 };
    if (tier <= 3) return { description: `(Tier 2-3) Expand to 5-note slurs (e.g., ${slurs}-E-G). Perform on all valve/slide combinations, ascending and descending.`, bpm: 80 };
    return { description: `(Tier 4+) Practice extended slurs up the overtone series as high as you can comfortably go.`, bpm: 70 };
  }
};

const getWindScaleExercise = (tier, instrument) => {
  const scale = (tier <= 2) ? { name: 'Concert Bb', concert: 'Bb' } : { name: 'Concert F', concert: 'F' };
  if (tier === 1) return { description: `(Tier 1) Play your ${scale.name} scale, one octave. Play in quarter notes. **Memorize**: ${scale.name} is Concert ${scale.concert}.`, bpm: 70 };
  if (tier <= 3) return { description: `(Tier 2-3) Play your ${scale.name} scale, two octaves if comfortable. Play in eighth notes.`, bpm: 80 };
  return { description: `(Tier 4+) Play your ${scale.name} scale in thirds (e.g., C-E, D-F, E-G...).`, bpm: 90 };
};

const getWindArticulationExercise = (tier, instrument) => {
  const note = (instrument === 'trumpet' || instrument === 'saxophone') ? 'G' : 'C';
  if (tier === 1) return { description: `(Tier 1) Single Tonguing: On a single note (${note}), practice crisp 'ta-ta-ta-ta' articulations as 16th notes.`, bpm: 80 };
  if (tier <= 3) return { description: `(Tier 2-3) Articulation Styles: Play a ${note} scale using different articulations: Legato ('dah'), Staccato ('dit'), and Marcato ('dat').`, bpm: 70 };
  return { description: `(Tier 4+) Double Tonguing: On a ${note} scale, practice 'tu-ku-tu-ku' in eighth notes. Strive for an even sound.`, bpm: 70 };
};

const getWindRangeExercise = (tier, instrument) => {
  if (getFamily(instrument) === 'woodwind' || instrument === 'trumpet') {
    if (tier === 1) return { description: `(Tier 1) High Range: Practice gentle 'sirens' or octave slurs (e.g., Middle C to High C). Focus on fast air, not pressure/biting.`, bpm: null };
    return { description: `(Tier 2+) High Range: Practice arpeggio 'expansion' (C-E-G-C(high)-G-E-C). Move up by half steps. Stop immediately if you feel strain.`, bpm: 70 };
  } else { // Low Brass / Horn
    if (tier === 1) return { description: `(Tier 1) Low Range: Play a Bb scale descending into the low register. Focus on a relaxed, open embouchure.`, bpm: 60 };
    return { description: `(Tier 2+) Low Range: Practice pedal tones. Start on low F and descend chromatically. Keep the aperture open.`, bpm: null };
  }
};

// --- 2. PERCUSSION EXERCISES (UPDATED) ---

// NEW: Specific Rudiment Exercises
const getSingleStrokeExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) 8 on a hand: Play (RRRRRRRR LLLLLLLL). Focus on even heights and sound.`, bpm: 100 };
  if (tier <= 3) return { description: `(Tier 2-3) Accent Grid: Play 16th notes with an accent on 1e&a, 2e&a, etc. (R-l-r-l, r-L-r-l...)`, bpm: 90 };
  return { description: `(Tier 4+) Timing Builder: Play 1 bar of 8th notes, 1 bar of triplets, 1 bar of 16ths. Loop.`, bpm: 80 };
};

const getDoubleStrokeExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) Slow Doubles: Play (RR LL) slowly. Focus on a clean, clear second note.`, bpm: 80 };
  if (tier <= 3) return { description: `(Tier 2-3) Open Roll: Play a 5-stroke roll (RRLL R). Try to speed up, but keep it clean, not buzzed.`, bpm: 90 };
  return { description: `(Tier 4+) Triplet Diddles: Practice (RRL RRL LLR LLR). Focus on the timing and sound quality.`, bpm: 100 };
};

const getParadiddleExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) Basic Paradiddle: Play (RLRR LRLL). Go slow. Say "Pa-ra-did-dle".`, bpm: 80 };
  if (tier <= 3) return { description: `(Tier 2-3) Paradiddle Accent: Accent the first note (R-lrr L-rll). Keep other notes low.`, bpm: 90 };
  return { description: `(Tier 4+) Paradiddle-diddle: Practice (RLRRLL LRLLRR). Six notes per beat.`, bpm: 80 };
};

const getFlamExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) Basic Flams: Play (lR rL). Focus on a *tiny* grace note before the main note.`, bpm: 70 };
  if (tier <= 3) return { description: `(Tier 2-3) Flam Taps: Play (lR-L-R-L rL-R-L-R). Keep taps even.`, bpm: 80 };
  return { description: `(Tier 4+) Flam Drags: Practice (lR-r-l rL-l-r). A flam followed by a drag.`, bpm: 70 };
};

// NEW: Bass Drum Exercise
const getBassDrumExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) Unison 8ths: Play 8th notes (1 + 2 + 3 + 4 +) in perfect unison with the metronome. Focus on clean sound and timing.`, bpm: 80 };
  if (tier <= 3) return { description: `(Tier 2-3) Simple Splits: Practice 16th-note "splits" (e.g., 1e+a). If you are Bass 1, play '1'. If Bass 2, play 'e', etc. Focus on clean hand-to-hand timing.`, bpm: 70 };
  return { description: `(Tier 4+) Split Roll-Offs: Practice a 16th-note roll-off down the line (1e+a 2e+a...). Focus on a smooth, even roll sound across the drums.`, bpm: 90 };
};


const getStickControlExercise = (tier, instrument) => {
  if (instrument === 'tenors') {
    if (tier === 1) return { description: `(Tier 1) Arounds: Practice simple "around" patterns (drum 1-2-3-4). Focus on clean wrist turns and moving together.`, bpm: 80 };
    return { description: `(Tier 2+) Crossovers: Practice crossover patterns (RH over LH to hit drum). Start slow and build consistency.`, bpm: 70 };
  } else { // Snare / Bass
    if (tier === 1) return { description: `(Tier 1) Heights: Play 8th notes. Left hand at 3", Right hand at 9". Switch. Focus on control.`, bpm: 90 };
    return { description: `(Tier 2+) Dynamics: Play 16th notes. 4 bars 'pp', 4 'mf', 4 'ff', 4 'ff' > 'pp'. Loop.`, bpm: 100 };
  }
};

const getMalletControlExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) Scales: Play a one-octave C Major scale with alternating strokes (R L R L). Focus on striking the center of the bar.`, bpm: 100 };
  if (tier <= 3) return { description: `(Tier 2-3) Arpeggios: Play C Major arpeggios (C-E-G-C) across two octaves. Focus on accuracy.`, bpm: 90 };
  return { description: `(Tier 4+) Double Stops: Play a C Major scale in 3rds (C/E, D/F, E/G...). Focus on striking both notes at the exact same time.`, bpm: 80 };
};

const getReadingExercise = (tier, instrument) => {
  if (tier === 1) return { description: `(Tier 1) Sight-Reading: Find a simple rhythm sheet. Set metronome and play. Don't stop for mistakes.`, bpm: 80 };
  return { description: `(Tier 2+) Sight-Reading: Find a piece of music you've never seen. Set metronome. 1) 'Check' (finger/air) 2) Play.`, bpm: 90 };
};

// --- Helper Functions ---
const instrPitch = (instrument, scaleName) => { /* ... (unchanged) ... */
  const transposition = (instrument === 'trumpet' || instrument === 'clarinet') ? 2 :
    (instrument === 'saxophone') ? -3 : // Alto Sax, common default
      (instrument === 'frenchHorn' || instrument === 'mellophone') ? -7 : 0; // Flute/Trombone/etc.
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const root = scaleName.split(' ')[0];
  let rootIndex = notes.indexOf(root);
  // Handle Concert pitches
  if (root === 'Bb') rootIndex = 10;
  if (root === 'F') rootIndex = 5;
  if (root === 'Eb') rootIndex = 3;
  if (root === 'Ab') rootIndex = 8;

  if (rootIndex === -1) return scaleName;

  let transposedIndex = (rootIndex + transposition) % 12;
  if (transposedIndex < 0) transposedIndex += 12;

  return `${notes[transposedIndex]} ${scaleName.split(' ')[1] || ''}`;
};
const formatTime = (seconds) => { /* ... (unchanged) ... */
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// --- Ear Training Audio Logic ---
// NOTE: All sound functions are now wrapped by or call `getAudioContext`
// to ensure audio is unlocked on mobile devices after a user tap.

const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25
};
const noteToFrequency = (note) => { /* ... (unchanged) ... */
  return noteFrequencies[note] || 440.00; // Default to A4
};

// --- Dynamic Skill Definitions ---
const WIND_SKILLS = {
  longTones: 'Long Tones',
  flexibility: 'Flexibility', // Renamed from Lip Flexibility
  scales: 'Scales',
  articulation: 'Articulation', // Renamed from Tonguing
  range: 'Range',
  improvisation: 'Improvisation',
  repertoire: 'Repertoire'
};

// NEW: Percussion rudiments
const PERCUSSION_RUDIMENTS = {
  singleStrokes: 'Single Strokes',
  doubleStrokes: 'Double Strokes',
  paradiddles: 'Paradiddles',
  flams: 'Flams',
};

const PERCUSSION_SKILLS = {
  ...PERCUSSION_RUDIMENTS, // Add all the rudiments
  stickControl: 'Stick Control', // (Snare, Tenors, Bass)
  bassUnisons: 'Unisons/Splits', // NEW (Bass)
  malletControl: 'Mallet Control', // (Mallets)
  reading: 'Reading', // (All)
  repertoire: 'Repertoire' // (All)
};

const ALL_SKILLS = {
  ...WIND_SKILLS,
  ...PERCUSSION_SKILLS
};

// --- NEW: Rhythm Flashcard Database ---
const RHYTHM_FLASHCARDS = {
  1: [ // Tier 1 (Quarter & Eighths)
    { id: 't1_1', notation: '1 2 3 4' },
    { id: 't1_2', notation: '1 2 3 + 4' },
    { id: 't1_3', notation: '1 + 2 + 3 4' },
    { id: 't1_4', notation: '1 + 2 + 3 + 4 +' },
    { id: 't1_5', notation: '1 2 + 3 4 +' },
    { id: 't1_6', notation: '1 + 2 3 + 4' },
  ],
  2: [ // Tier 2 (Sixteenths)
    { id: 't2_1', notation: '1e+a 2 3 4' },
    { id: 't2_2', notation: '1 + 2e+a 3 4' },
    { id: 't2_3', notation: '1 + 2 + 3e+a 4 +' },
    { id: 't2_4', notation: '1e+a 2e+a 3 4' },
    { id: 't2_5', notation: '1e+a 2 + 3e+a 4' },
    { id: 't2_6', notation: '1 +a 2 +a 3 4' },
  ],
  3: [ // Tier 3 (Syncopation & Rests)
    { id: 't3_1', notation: '(e)+a 2 + 3 4' }, // (1)e+a
    { id: 't3_2', notation: '1e a 2e a 3 4' },
    { id: 't3_3', notation: '1e+ (a) 2 +a 3 4' }, // 1e+ 2+a
    { id: 't3_4', notation: '1 + 2 + 3 +a 4e+' },
    { id: 't3_5', notation: '1 ( ) 2 + 3 ( ) 4 +' }, // Quarter rests
    { id: 't3_6', notation: '1e( )a 2 + (e)+a 4' }, // Eighth rests
  ]
};

// --- Main App Component ---
export default function App() {
  // Navigation State
  const [mainScreen, setMainScreen] = useState('practice');
  const [practiceScreen, setPracticeScreen] = useState('welcome'); // Default, will be checked
  const [isCheckingPlacement, setIsCheckingPlacement] = useState(true); // NEW: For initial load

  // Session Setup State
  const [instrumentFamily, setInstrumentFamily] = useState(null); // NEW
  const [instrument, setInstrument] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(30);
  const [focusArea, setFocusArea] = useState('balanced');

  // Active Session State
  const [currentSession, setCurrentSession] = useState([]);
  const [feedbackLevels, setFeedbackLevels] = useState({});

  // Timer State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [actualTimePracticed, setActualTimePracticed] = useState(0);

  // Metronome State
  const [metronomeBpm, setMetronomeBpm] = useState(60);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const audioContextRef = useRef(null);
  const metronomeIntervalRef = useRef(null);

  // Training State
  const [trainingMode, setTrainingMode] = useState('intervals');
  const [intervalQuestion, setIntervalQuestion] = useState(null);
  const [intervalOptions, setIntervalOptions] = useState([]);
  const [intervalFeedback, setIntervalFeedback] = useState('');
  const [pitchQuestion, setPitchQuestion] = useState(null);
  const [pitchFeedback, setPitchFeedback] = useState('');
  // NEW: Rhythm Trainer State
  const [rhythmTier, setRhythmTier] = useState(1);
  const [rhythmQuestion, setRhythmQuestion] = useState(null);


  // --- NEW: Placement Test State (moved from renderPlacementTest) ---
  const [placementFamily, setPlacementFamily] = useState(null);
  const [placementInstrument, setPlacementInstrument] = useState(null);
  const [placementRatings, setPlacementRatings] = useState({});

  // --- Stats & Progress State ---
  const [practiceLog, setPracticeLog] = useState(() => {
    const savedLog = localStorage.getItem('bandPracticeLog'); // RENAMED
    try {
      return savedLog ? JSON.parse(savedLog) : [];
    } catch (e) {
      return [];
    }
  });

  // UPDATED: skillLevels state with new rudiments
  const [skillLevels, setSkillLevels] = useState(() => {
    const savedLevels = localStorage.getItem('bandSkillScores'); // RENAMED
    const defaultLevels = {
      // Wind
      longTones: 0, flexibility: 0, scales: 0,
      articulation: 0, range: 0, improvisation: 0, repertoire: 0,
      // Percussion
      singleStrokes: 0, doubleStrokes: 0, paradiddles: 0, flams: 0,
      stickControl: 0, bassUnisons: 0, malletControl: 0, reading: 0
    };
    if (savedLevels) {
      try {
        const parsed = JSON.parse(savedLevels);
        // Ensure new rudiment skills are added if loading old save
        return { ...defaultLevels, ...parsed };
      } catch (e) { /* fall through to default */ }
    }
    return defaultLevels;
  });

  // --- AUDIO FIX: Function to get/resume AudioContext on user gesture ---
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API not supported in this browser", e);
        return null;
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playMetronomeTick = () => {
    const audioContext = getAudioContext(); // Get/resume context
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  const playNote = (note) => {
    const audioContext = getAudioContext(); // Get/resume context
    if (!audioContext) return;
    const t = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.frequency.setValueAtTime(noteToFrequency(note), t);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  };

  const playInterval = (note1, note2, harmonic = false) => {
    // Note: This function calls playNote, which will handle getting/resuming the audio context.
    playNote(note1); // Play first note
    
    // Get context *again* just for the second note's timing.
    const audioContext = getAudioContext(); 
    if (!audioContext) return;
    const t = audioContext.currentTime;

    // Play second note after a delay (if melodic) or at the same time (if harmonic)
    const t2 = t + (harmonic ? 0 : 0.6);
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.frequency.setValueAtTime(noteToFrequency(note2), t2);
    gain2.gain.setValueAtTime(0.5, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.5);
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.5);
  };


  // --- NEW: Placement Test Check ---
  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedPlacementTest');
    const savedLevels = localStorage.getItem('bandSkillScores');

    if (hasCompleted === 'true') {
      // User has done the test or skipped it before
      setPracticeScreen('welcome');
    } else {
      // New user OR user from before this feature
      if (savedLevels) {
        try {
          const parsed = JSON.parse(savedLevels);
          // If they have any points, they are not a new user
          if (Object.values(parsed).some(val => val > 0)) {
            localStorage.setItem('hasCompletedPlacementTest', 'true'); // Mark as completed
            setPracticeScreen('welcome');
          } else {
            setPracticeScreen('placementTest'); // All scores are 0, show test
          }
        } catch (e) {
          setPracticeScreen('placementTest'); // Error parsing, show test
        }
      } else {
        setPracticeScreen('placementTest'); // No levels saved, show test
      }
    }
    setIsCheckingPlacement(false); // Done checking
  }, []); // Empty array, runs only once on mount

  // --- NEW: Effect for Placement Test (moved from renderPlacementTest) ---
  useEffect(() => {
    if (!placementInstrument) {
      setPlacementRatings({});
      return;
    }
    const family = getFamily(placementInstrument);
    let skillsToRate = [];
    // Get only the *relevant* skills, excluding repertoire
    if (family === 'brass' || family === 'woodwind') {
      skillsToRate = ['longTones', 'flexibility', 'scales', 'articulation', 'range'];
      // NEW: Add improv for these instruments
      const improvInstruments = ['trumpet', 'saxophone', 'trombone'];
      if (improvInstruments.includes(placementInstrument)) {
        skillsToRate.push('improvisation');
      }
    } else if (family === 'percussion') {
      skillsToRate = [];
      // UPDATED: Add new rudiments
      if (placementInstrument === 'snare' || placementInstrument === 'tenors' || placementInstrument === 'concertPerc') {
        skillsToRate.push('singleStrokes', 'doubleStrokes', 'paradiddles', 'flams');
      }
      if (placementInstrument === 'snare' || placementInstrument === 'tenors' || placementInstrument === 'bassDrum') {
        skillsToRate.push('stickControl');
      }
      if (placementInstrument === 'bassDrum') { // NEW
        skillsToRate.push('bassUnisons');
      }
      if (placementInstrument === 'mallets' || placementInstrument === 'concertPerc') {
        skillsToRate.push('malletControl');
      }
      skillsToRate.push('reading');
    }

    const initialRatings = {};
    skillsToRate.forEach(skill => {
      initialRatings[skill] = 0; // Default to Beginner (Tier 1)
    });
    setPlacementRatings(initialRatings);
  }, [placementInstrument]);

  // --- Save skill levels to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem('bandSkillScores', JSON.stringify(skillLevels));
    } catch (e) {
      console.error("Failed to save skill levels", e);
    }
  }, [skillLevels]);

  // --- Save practice log to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem('bandPracticeLog', JSON.stringify(practiceLog));
    } catch (e) {
      console.error("Failed to save practice log", e);
    }
  }, [practiceLog]);

  // --- Reset focusArea if instrument changes ---
  useEffect(() => {
    setFocusArea('balanced');
    const improvInstruments = ['trumpet', 'saxophone', 'trombone'];
    if (!improvInstruments.includes(instrument) && focusArea === 'improvisation') {
      setFocusArea('balanced');
    }
  }, [instrument]);

  // --- Metronome Timer Logic ---
  useEffect(() => {
    // AUDIOFIX: Removed context creation from here.
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    if (isMetronomeOn && metronomeBpm > 0) {
      const intervalDuration = 60000 / metronomeBpm;
      metronomeIntervalRef.current = setInterval(() => {
        playMetronomeTick(); // No arg, will call getAudioContext()
      }, intervalDuration);
    }
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [isMetronomeOn, metronomeBpm, mainScreen]); // mainScreen dependency is still good

  // ---
  // --- Progress Page hooks (Moved to top level) ---
  // ---

  const today = useMemo(() => new Date(), []);
  const daysToShow = 35;

  const logDates = useMemo(() =>
    new Set(
      (Array.isArray(practiceLog) ? practiceLog : [])
        .filter(log => log && typeof log.date === 'string')
        .map(log => log.date)
    ), [practiceLog]);

  const calendarDays = useMemo(() => {
    let days = [];
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - (daysToShow - 1));

    for (let i = 0; i < daysToShow; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      const dateString = day.toISOString().split('T')[0];
      days.push({
        date: dateString,
        isToday: dateString === today.toISOString().split('T')[0],
        isPracticed: logDates.has(dateString),
      });
    }
    return days;
  }, [logDates, today]);

  // --- Total Practice Time Logic (UPDATED) ---
  const practiceTimes = useMemo(() => {
    const safeLog = Array.isArray(practiceLog) ? practiceLog : [];
    let totals = {};

    allInstruments.forEach(instr => {
      const minutes = safeLog
        .filter(log => log && log.instrument === instr.id && typeof log.duration === 'number')
        .reduce((sum, log) => sum + log.duration, 0);
      totals[instr.id] = (minutes / 60).toFixed(1);
    });

    const totalMinutes = Object.values(totals).reduce((sum, hours) => sum + (parseFloat(hours) * 60), 0);
    totals.total = (totalMinutes / 60).toFixed(1);

    return totals;
  }, [practiceLog]);

  // --- NEW: Practice Streak Logic ---
  const practiceStreak = useMemo(() => {
    const safeLog = Array.isArray(practiceLog) ? practiceLog : [];
    if (safeLog.length === 0) return 0;

    // Get all unique practice dates in a Set for fast lookups
    const practiceDates = new Set(
      safeLog
        .filter(log => log && typeof log.date === 'string')
        .map(log => log.date)
    );
    
    const toDateString = (date) => date.toISOString().split('T')[0];
    
    let streak = 0;
    let dayToTest = new Date();
    
    if (practiceDates.has(toDateString(dayToTest))) {
      // Practiced today
      streak = 1;
      dayToTest.setDate(dayToTest.getDate() - 1); // Set to yesterday
    } else {
      // Did not practice today, check yesterday
      dayToTest.setDate(dayToTest.getDate() - 1); // Set to yesterday
      if (practiceDates.has(toDateString(dayToTest))) {
        // Practiced yesterday
        streak = 1;
        dayToTest.setDate(dayToTest.getDate() - 1); // Set to day before yesterday
      } else {
        // Did not practice today or yesterday
        return 0;
      }
    }

    // Loop backwards from the day before the last counted day
    while (practiceDates.has(toDateString(dayToTest))) {
      streak++;
      dayToTest.setDate(dayToTest.getDate() - 1);
    }
    
    return streak;
  }, [practiceLog]);


  // --- Focus Mode Logic (DYNAMIC) ---
  const getFocusOptions = () => {
    const family = getFamily(instrument);

    if (family === 'brass' || family === 'woodwind') {
      let options = [
        { id: 'balanced', name: 'Balanced', icon: <Crosshair /> },
        { id: 'repertoire', name: 'Repertoire', icon: <Music /> },
        { id: 'longTones', name: 'Long Tones', icon: <Repeat /> },
        { id: 'flexibility', name: 'Flexibility', icon: <Zap /> },
        { id: 'scales', name: 'Scales', icon: <ChevronsRight /> },
        { id: 'articulation', name: 'Articulation', icon: <Zap /> },
        { id: 'range', name: 'Range', icon: <Target /> },
      ];
      // UPDATED: Add improv for sax and trombone
      const improvInstruments = ['trumpet', 'saxophone', 'trombone'];
      if (improvInstruments.includes(instrument)) {
        options.push({ id: 'improvisation', name: 'Improv', icon: <Play /> });
      }
      return options;
    }

    if (family === 'percussion') {
      let options = [
        { id: 'balanced', name: 'Balanced', icon: <Crosshair /> },
        { id: 'repertoire', name: 'Repertoire', icon: <Music /> },
        { id: 'reading', name: 'Reading', icon: <BookOpen /> },
      ];
      // UPDATED: Add specific rudiment options
      if (instrument === 'snare' || instrument === 'tenors' || instrument === 'concertPerc') {
        options.push({ id: 'singleStrokes', name: 'Singles', icon: <Drum /> });
        options.push({ id: 'doubleStrokes', name: 'Doubles', icon: <Drum /> });
        options.push({ id: 'paradiddles', name: 'Paradiddles', icon: <Drum /> });
        options.push({ id: 'flams', name: 'Flams', icon: <Drum /> });
      }
      if (instrument === 'snare' || instrument === 'tenors' || instrument === 'bassDrum') {
        options.push({ id: 'stickControl', name: 'Stick Control', icon: <Drum /> });
      }
      if (instrument === 'bassDrum') { // NEW
        options.push({ id: 'bassUnisons', name: 'Unisons/Splits', icon: <Drum /> });
      }
      if (instrument === 'mallets' || instrument === 'concertPerc') {
        options.push({ id: 'malletControl', name: 'Mallet Control', icon: <Music /> });
      }
      return options;
    }

    return []; // No instrument selected
  };

  const getWindAllocations = () => {
    let base = {
      longTones: 0.12, flexibility: 0.13, scales: 0.15,
      articulation: 0.15, range: 0.15, improvisation: 0.30, repertoire: 0.0
    };
    // UPDATED: Don't zero out improv for sax and trombone
    const improvInstruments = ['trumpet', 'saxophone', 'trombone'];
    if (!improvInstruments.includes(instrument)) {
      base.scales += 0.30;
      base.improvisation = 0;
    }
    return base;
  };

  // UPDATED: Percussion allocations
  const getPercussionAllocations = () => {
    let base = {
      singleStrokes: 0.0625, doubleStrokes: 0.0625, paradiddles: 0.0625, flams: 0.0625, // = 0.25
      stickControl: 0.25, malletControl: 0.25,
      reading: 0.25, repertoire: 0.0,
      bassUnisons: 0.25 // NEW, total base is 1.25 now
    };
    
    // Adjust based on specific instrument
    if (instrument === 'snare') {
      base.malletControl = 0;
      base.bassUnisons = 0;
    } else if (instrument === 'mallets') {
      base.singleStrokes = 0; base.doubleStrokes = 0; base.paradiddles = 0; base.flams = 0;
      base.stickControl = 0;
      base.bassUnisons = 0;
    } else if (instrument === 'bassDrum') {
      base.singleStrokes = 0; base.doubleStrokes = 0; base.paradiddles = 0; base.flams = 0;
      base.malletControl = 0;
    } else if (instrument === 'tenors') {
      base.malletControl = 0;
      base.bassUnisons = 0;
    } else if (instrument === 'concertPerc') {
      base.bassUnisons = 0; // Concert perc doesn't do bass splits
    }

    // Normalize
    const total = Object.values(base).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(base).forEach(k => base[k] = base[k] / total);
    }
    return base;
  };

  const getFinalAllocations = () => {
    const family = getFamily(instrument);
    let baseAlloc = {};

    if (family === 'brass' || family === 'woodwind') baseAlloc = getWindAllocations();
    else if (family === 'percussion') baseAlloc = getPercussionAllocations();

    if (focusArea === 'balanced') return baseAlloc;
    if (focusArea === 'repertoire') {
      let repAlloc = {};
      Object.keys(baseAlloc).forEach(k => repAlloc[k] = 0);
      repAlloc.repertoire = 1.0;
      return repAlloc;
    }

    const focusAmount = 0.40;
    const totalBaseOther = 1.0 - (baseAlloc[focusArea] || 0);
    const scaleFactor = totalBaseOther > 0 ? (1.0 - focusAmount) / totalBaseOther : 0;

    const finalAlloc = {};
    Object.keys(baseAlloc).forEach(area => {
      if (area === focusArea) finalAlloc[area] = focusAmount;
      else finalAlloc[area] = baseAlloc[area] * scaleFactor;
    });

    return finalAlloc;
  };

  // --- Session Generation (DYNAMIC) ---
  const handleGenerateSession = () => {
    if (!instrument) return;

    const levels = skillLevels;
    const finalAlloc = getFinalAllocations();
    const family = getFamily(instrument);
    let session = [];

    // UPDATED: Exercise icons
    const exerciseIcons = {
      // Wind
      longTones: <Repeat className="w-5 h-5 text-blue-500" />,
      flexibility: <Zap className="w-5 h-5 text-yellow-500" />,
      scales: <ChevronsRight className="w-5 h-5 text-green-500" />,
      articulation: <Zap className="w-5 h-5 text-red-500" />,
      range: <Target className="w-5 h-5 text-purple-500" />,
      improvisation: <Play className="w-5 h-5 text-indigo-500" />,
      // Percussion
      singleStrokes: <Drum className="w-5 h-5 text-red-500" />,
      doubleStrokes: <Drum className="w-5 h-5 text-orange-500" />,
      paradiddles: <Drum className="w-5 h-5 text-yellow-500" />,
      flams: <Drum className="w-5 h-5 text-lime-500" />,
      bassUnisons: <Drum className="w-5 h-5 text-purple-500" />, // NEW
      stickControl: <Drum className="w-5 h-5 text-blue-500" />,
      malletControl: <Music className="w-5 h-5 text-green-500" />,
      reading: <BookOpen className="w-5 h-5 text-cyan-500" />,
      // Shared
      repertoire: <Music className="w-5 h-5 text-teal-500" />
    };

    if (focusArea === 'repertoire') {
      session.push({
        id: 'ex_repertoire', title: 'Repertoire Practice', duration: sessionDuration,
        description: "Focus on your own music (e.g., marching show, solo, excerpts).\n\nUse the timer and metronome to structure your practice.",
        bpm: 80, icon: exerciseIcons['repertoire'], area: 'repertoire'
      });
    } else if (family === 'brass' || family === 'woodwind') {
      const windFunctions = {
        longTones: getWindLongToneExercise,
        flexibility: getWindFlexibilityExercise,
        scales: getWindScaleExercise,
        articulation: getWindArticulationExercise,
        range: getWindRangeExercise,
        improvisation: (tier, instr) => ({ description: '(Tier 1+) Find a backing track (e.g., "Bb Blues") and practice soloing using the blues scale.', bpm: 120 }), // Simplified
      };

      Object.keys(finalAlloc).forEach(area => {
        const duration = Math.round(sessionDuration * finalAlloc[area]);
        if (duration < 1 || area === 'repertoire' || !windFunctions[area]) return;

        const score = levels[area] || 0;
        const tier = getTierFromScore(score);
        const exercise = windFunctions[area](tier, instrument);

        session.push({
          id: `ex_${area}`, title: ALL_SKILLS[area], duration: duration,
          description: exercise.description, bpm: exercise.bpm,
          icon: exerciseIcons[area], area: area
        });
      });
    } else if (family === 'percussion') {
      // UPDATED: Percussion functions
      const percFunctions = {
        singleStrokes: getSingleStrokeExercise,
        doubleStrokes: getDoubleStrokeExercise,
        paradiddles: getParadiddleExercise,
        flams: getFlamExercise,
        bassUnisons: getBassDrumExercise, // NEW
        stickControl: getStickControlExercise,
        malletControl: getMalletControlExercise,
        reading: getReadingExercise,
      };

      Object.keys(finalAlloc).forEach(area => {
        const duration = Math.round(sessionDuration * finalAlloc[area]);
        if (duration < 1 || area === 'repertoire' || !percFunctions[area]) return;

        const score = levels[area] || 0;
        const tier = getTierFromScore(score);
        const exercise = percFunctions[area](tier, instrument);

        session.push({
          id: `ex_${area}`, title: ALL_SKILLS[area], duration: duration,
          description: exercise.description, bpm: exercise.bpm,
          icon: exerciseIcons[area], area: area
        });
      });
    }

    // ... (Duration adjustment logic, unchanged) ...
    const totalAllocated = session.reduce((sum, item) => sum + item.duration, 0);
    if (totalAllocated === 0) return;
    const scalingFactor = sessionDuration / totalAllocated;
    let scaledSession = session.map(item => ({ ...item, duration: Math.max(1, Math.round(item.duration * scalingFactor)) }));
    let finalSum = scaledSession.reduce((sum, item) => sum + item.duration, 0);
    const diff = sessionDuration - finalSum;
    if (diff !== 0 && scaledSession.length > 0) {
      let targetIndex = scaledSession.reduce((maxIndex, item, i, arr) => item.duration > arr[maxIndex].duration ? i : maxIndex, 0);
      scaledSession[targetIndex].duration += diff;
      if (scaledSession[targetIndex].duration < 1) scaledSession[targetIndex].duration = 1;
    }
    scaledSession = scaledSession.filter(item => item.duration > 0);
    if (scaledSession.length === 0) return;
    // ... (End of duration logic) ...

    const initialFeedback = {};
    scaledSession.forEach(item => { initialFeedback[item.area] = 'justRight'; });
    setFeedbackLevels(initialFeedback);
    setCurrentSession(scaledSession);
    setPracticeScreen('session');
    setCurrentExerciseIndex(0);
    setTimeRemaining(scaledSession[0].duration * 60);
    setActualTimePracticed(0);
    setIsTimerRunning(false);
    setMetronomeBpm(scaledSession[0].bpm || 60);
    setIsMetronomeOn(false);
  };

  // --- Feedback & Stats Logic ---
  const handleIndividualFeedback = (area, feedback) => { /* ... (unchanged) ... */
    setFeedbackLevels(prev => ({ ...prev, [area]: feedback }));
  };

  const applyFeedbackAndFinish = () => { /* ... (unchanged) ... */
    let newScores = { ...skillLevels };
    setSkillLevels(prevScores => {
      Object.entries(feedbackLevels).forEach(([area, feedback]) => {
        const currentScore = newScores[area] || 0;
        if (feedback === 'easy') newScores[area] = Math.min(MAX_MASTERY_SCORE, currentScore + 5);
        else if (feedback === 'justRight') newScores[area] = Math.min(MAX_MASTERY_SCORE, currentScore + 2);
        else if (feedback === 'hard') newScores[area] = Math.max(0, currentScore - 3);
      });
      return newScores;
    });

    const todayString = new Date().toISOString().split('T')[0];
    const newLogEntry = {
      date: todayString,
      duration: Math.round(actualTimePracticed / 60),
      skills: newScores,
      instrument: instrument
    };

    setPracticeLog(prevLog => {
      const validPrevLog = Array.isArray(prevLog) ? prevLog.filter(Boolean) : [];
      const otherDaysLog = validPrevLog.filter(entry => entry && entry.date !== todayString);
      return [...otherDaysLog, newLogEntry];
    });

    setIsMetronomeOn(false);
    setActualTimePracticed(0);
    setPracticeScreen('welcome');
    setMainScreen('practice');
  };

  // --- NEW: Placement Test Handlers ---
  const handleSavePlacement = (ratings) => {
    // UPDATED: Default levels object
    const defaultLevels = {
      longTones: 0, flexibility: 0, scales: 0,
      articulation: 0, range: 0, improvisation: 0, repertoire: 0,
      singleStrokes: 0, doubleStrokes: 0, paradiddles: 0, flams: 0,
      stickControl: 0, bassUnisons: 0, malletControl: 0, reading: 0
    };
    const newLevels = { ...defaultLevels };

    Object.entries(ratings).forEach(([skill, score]) => {
      newLevels[skill] = score;
    });

    setSkillLevels(newLevels); // This will trigger the save to localStorage
    localStorage.setItem('hasCompletedPlacementTest', 'true');
    setPracticeScreen('welcome');
  };

  const handleSkipPlacement = () => {
    // Skill levels are already 0 (from initialState), so just set the flag
    localStorage.setItem('hasCompletedPlacementTest', 'true');
    setPracticeScreen('welcome');
  };

  // --- Timer Logic ---
  useEffect(() => { /* ... (unchanged) ... */
    if (!isTimerRunning || timeRemaining <= 0) return;
    const timerId = setInterval(() => {
      setTimeRemaining(p => p - 1);
      setActualTimePracticed(p => p + 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => { /* ... (unchanged) ... */
    if (timeRemaining === 0 && isTimerRunning) {
      handleNextExercise(false);
    }
  }, [timeRemaining, isTimerRunning]);

  const handleNextExercise = (autoStart = false) => { /* ... (unchanged) ... */
    setIsMetronomeOn(false);
    if (currentExerciseIndex < currentSession.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setTimeRemaining(currentSession[nextIndex].duration * 60);
      setMetronomeBpm(currentSession[nextIndex].bpm || 60);
      if (autoStart) setIsTimerRunning(true);
      else setIsTimerRunning(false);
    } else {
      setTimeRemaining(0);
      setIsTimerRunning(false);
    }
  };
  const handlePlayPause = () => { /* ... (unchanged) ... */
    if (timeRemaining === 0 && currentExerciseIndex === currentSession.length - 1) return;
    if (timeRemaining === 0) {
      handleNextExercise(true);
      return;
    }
    setIsTimerRunning(!isTimerRunning);
  };
  const handleBackToSetup = () => { /* ... (unchanged) ... */
    setIsTimerRunning(false);
    setIsMetronomeOn(false);
    setActualTimePracticed(0);
    setPracticeScreen('welcome');
  };

  // --- Training Logic ---
  const allIntervals = [ /* ... (unchanged) ... */
    { name: 'Major 2nd', semitones: 2, note: 'D4' },
    { name: 'Major 3rd', semitones: 4, note: 'E4' },
    { name: 'Perfect 4th', semitones: 5, note: 'F4' },
    { name: 'Perfect 5th', semitones: 7, note: 'G4' },
    { name: 'Major 6th', semitones: 9, note: 'A4' },
    { name: 'Octave', semitones: 12, note: 'C5' },
  ];
  const allNotes = [ /* ... (unchanged) ... */
    { name: 'C', note: 'C4' }, { name: 'C#', note: 'C#4' }, { name: 'D', note: 'D4' },
    { name: 'D#', note: 'D#4' }, { name: 'E', note: 'E4' }, { name: 'F', note: 'F4' },
    { name: 'F#', note: 'F#4' }, { name: 'G', note: 'G4' }, { name: 'G#', note: 'G#4' },
    { name: 'A', note: 'A4' }, { name: 'A#', note: 'A#4' }, { name: 'B', note: 'B4' },
  ];
  const generateIntervalQuestion = () => { /* ... (unchanged) ... */
    setIntervalFeedback('');
    const correctInterval = allIntervals[Math.floor(Math.random() * allIntervals.length)];
    setIntervalQuestion({ ...correctInterval, baseNote: 'C4' });
    let options = [correctInterval];
    while (options.length < 3) {
      const randomOption = allIntervals[Math.floor(Math.random() * allIntervals.length)];
      if (!options.find(opt => opt.name === randomOption.name)) {
        options.push(randomOption);
      }
    }
    setIntervalOptions(options.sort(() => Math.random() - 0.5));
  };
  const generatePitchQuestion = () => { /* ... (unchanged) ... */
    setPitchFeedback('');
    const correctNote = allNotes[Math.floor(Math.random() * allNotes.length)];
    setPitchQuestion(correctNote);
  };
  // NEW: Generate Rhythm Question
  const generateRhythmQuestion = () => {
    const tierRhythms = RHYTHM_FLASHCARDS[rhythmTier];
    let newRhythm = tierRhythms[Math.floor(Math.random() * tierRhythms.length)];
    // Ensure we don't get the same question twice in a row
    if (rhythmQuestion && newRhythm.id === rhythmQuestion.id && tierRhythms.length > 1) {
      newRhythm = tierRhythms[(tierRhythms.findIndex(r => r.id === rhythmQuestion.id) + 1) % tierRhythms.length];
    }
    setRhythmQuestion(newRhythm);
  };

  const handleIntervalGuess = (guess) => { /* ... (unchanged) ... */
    // AUDIOFIX: This will call playInterval, which now calls getAudioContext
    playInterval(intervalQuestion.baseNote, guess.note, false);
    if (guess.name === intervalQuestion.name) setIntervalFeedback('Correct!');
    else setIntervalFeedback(`Incorrect. That was a ${intervalQuestion.name}.`);
  };
  const handlePitchGuess = (guess) => { /* ... (unchanged) ... */
    // AUDIOFIX: This will call playNote, which now calls getAudioContext
    playNote(guess.note);
    if (guess.note === pitchQuestion.note) setPitchFeedback('Correct!');
    else setPitchFeedback(`Incorrect. That was a ${pitchQuestion.name}.`);
  };

  useEffect(() => { /* ... (unchanged) ... */
    if (mainScreen === 'training' && trainingMode === 'intervals' && !intervalQuestion) {
      generateIntervalQuestion();
    }
    if (mainScreen === 'training' && trainingMode === 'pitch' && !pitchQuestion) {
      generatePitchQuestion();
    }
    // NEW: Generate rhythm question on load or tier change
    if (mainScreen === 'training' && trainingMode === 'rhythm') {
      if (!rhythmQuestion || (rhythmQuestion && !RHYTHM_FLASHCARDS[rhythmTier].find(r => r.id === rhythmQuestion.id))) {
         generateRhythmQuestion();
      }
    }
  }, [mainScreen, trainingMode, intervalQuestion, pitchQuestion, rhythmTier]); // Added rhythmTier
  
  // NEW: Effect for rhythm question
  useEffect(() => {
    if(mainScreen === 'training' && trainingMode === 'rhythm') {
      generateRhythmQuestion();
    }
  }, [rhythmTier, trainingMode, mainScreen]);


  // --- Render Functions ---

  const renderWelcome = () => {
    const focusOptions = getFocusOptions();
    return (
      <div className="p-6 pt-12">
        <h1 className="text-3xl font-bold mb-2 text-white">Band Practice Generator</h1>
        <p className="text-gray-400 mb-8">Create a practice session tailored to you.</p>

        {/* 1. Instrument Family */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-sky-400">1. Choose Instrument Family:</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(instrumentFamilies).map(family => (
              <button
                key={family}
                onClick={() => {
                  setInstrumentFamily(family);
                  setInstrument(null); // Clear instrument selection
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${instrumentFamily === family ? 'bg-sky-900 border-sky-500' : 'bg-gray-800 border-gray-700 hover:border-sky-500'}`}
              >
                {family === 'brass' ? <Play className="w-8 h-8 mb-2 text-gray-300" /> :
                  family === 'woodwind' ? <Wind className="w-8 h-8 mb-2 text-gray-300" /> :
                    <Drum className="w-8 h-8 mb-2 text-gray-300" />}
                <span className="font-medium text-sm text-gray-200 capitalize">{family}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Instrument (Conditional) */}
        {instrumentFamily && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-sky-400">2. Choose Your Instrument:</h2>
            <div className="grid grid-cols-3 gap-3">
              {instrumentFamilies[instrumentFamily].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setInstrument(opt.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${instrument === opt.id ? 'bg-sky-900 border-sky-500' : 'bg-gray-800 border-gray-700 hover:border-sky-500'}`}
                >
                  {React.cloneElement(opt.icon, { className: `w-6 h-6 mb-2 ${instrument === opt.id ? 'text-sky-400' : 'text-gray-300'}` })}
                  <span className={`font-medium text-xs text-center ${instrument === opt.id ? 'text-white' : 'text-gray-200'}`}>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Duration (Conditional) */}
        {instrument && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-sky-400">3. Choose Session Duration:</h2>
            <div className="grid grid-cols-4 gap-3">
              {timeOptions.map(time => (
                <button
                  key={time}
                  onClick={() => setSessionDuration(time)}
                  className={`p-3 rounded-lg border-2 transition-all ${sessionDuration === time ? 'bg-sky-900 border-sky-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-sky-500'}`}
                >
                  {time} <span className="text-sm">min</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Focus Mode (Conditional) */}
        {instrument && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-sky-400">4. (Optional) Choose a Focus:</h2>
            <div className="grid grid-cols-4 gap-3">
              {focusOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFocusArea(opt.id)}
                  className={`flex flex-col items-center justify-center text-center p-3 rounded-lg border-2 transition-all ${focusArea === opt.id ? 'bg-sky-900 border-sky-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-sky-500'}`}
                >
                  {React.cloneElement(opt.icon, { className: `w-5 h-5 mb-1 ${focusArea === opt.id ? 'text-sky-400' : 'text-gray-400'}` })}
                  <span className="text-xs font-medium">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateSession}
          disabled={!instrument}
          className="w-full bg-sky-600 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center shadow-lg hover:bg-sky-700 disabled:bg-gray-700 disabled:text-gray-400"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Practice
        </button>
      </div>
    );
  };

  // --- NEW: Placement Test Screen (UPDATED with 5 Tiers) ---
  const renderPlacementTest = () => {
    // This function NO LONGER calls hooks.
    // It now uses state from the App component:
    // placementFamily, setPlacementFamily
    // placementInstrument, setPlacementInstrument
    // placementRatings, setPlacementRatings

    const handleRatingChange = (skill, score) => {
      setPlacementRatings(prev => ({ ...prev, [skill]: score }));
    };

    // UPDATED: Build rating options from the constants
    const ratingOptions = Object.keys(TIER_DESCRIPTIONS).map((tierKey, index) => {
      const tierNum = parseInt(tierKey);
      return {
        name: `Tier ${tierNum}: ${TIER_DESCRIPTIONS[tierNum].name}`,
        desc: TIER_DESCRIPTIONS[tierNum].desc,
        score: TIER_THRESHOLDS[index], // Maps Tier 1 to index 0, Tier 2 to index 1...
        tier: tierNum,
      };
    });

    const tierColors = {
      1: { text: 'text-gray-300', border: 'border-gray-600', bg: 'bg-gray-800' },
      2: { text: 'text-blue-300', border: 'border-blue-600', bg: 'bg-blue-900' },
      3: { text: 'text-sky-300', border: 'border-sky-500', bg: 'bg-sky-900' },
      4: { text: 'text-green-300', border: 'border-green-500', bg: 'bg-green-900' },
      5: { text: 'text-yellow-300', border: 'border-yellow-500', bg: 'bg-yellow-900' },
    };

    return (
      <div className="p-6 pt-12">
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome!</h1>
        <p className="text-gray-400 mb-8">Let's find your starting point. Select your instrument and rate your current ability.</p>

        {/* 1. Instrument Family */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-sky-400">1. Choose Instrument Family:</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(instrumentFamilies).map(family => (
              <button
                key={family}
                onClick={() => {
                  setPlacementFamily(family);
                  setPlacementInstrument(null); // Clear instrument selection
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${placementFamily === family ? 'bg-sky-900 border-sky-500' : 'bg-gray-800 border-gray-700 hover:border-sky-500'}`}
              >
                {family === 'brass' ? <Play className="w-8 h-8 mb-2 text-gray-300" /> :
                  family === 'woodwind' ? <Wind className="w-8 h-8 mb-2 text-gray-300" /> :
                    <Drum className="w-8 h-8 mb-2 text-gray-300" />}
                <span className="font-medium text-sm text-gray-200 capitalize">{family}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Instrument (Conditional) */}
        {placementFamily && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-sky-400">2. Choose Your Instrument:</h2>
            <div className="grid grid-cols-3 gap-3">
              {instrumentFamilies[placementFamily].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPlacementInstrument(opt.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${placementInstrument === opt.id ? 'bg-sky-900 border-sky-500' : 'bg-gray-800 border-gray-700 hover:border-sky-500'}`}
                >
                  {React.cloneElement(opt.icon, { className: `w-6 h-6 mb-2 ${placementInstrument === opt.id ? 'text-sky-400' : 'text-gray-300'}` })}
                  <span className={`font-medium text-xs text-center ${placementInstrument === opt.id ? 'text-white' : 'text-gray-200'}`}>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Skill Ratings (Conditional & UPDATED) */}
        {placementInstrument && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-sky-400">3. Rate Your Skills:</h2>
            <div className="space-y-4">
              {Object.keys(placementRatings).map(skill => (
                <div key={skill} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{ALL_SKILLS[skill]}</h3>
                  <div className="space-y-2">
                    {ratingOptions.map(opt => {
                      const colors = tierColors[opt.tier] || tierColors[1];
                      const isSelected = placementRatings[skill] === opt.score;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => handleRatingChange(skill, opt.score)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${isSelected ? `${colors.bg} ${colors.border}` : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                        >
                          <span className={`text-sm font-medium ${isSelected ? colors.text : 'text-gray-200'}`}>{opt.name}</span>
                          <span className="text-xs block text-gray-400">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Actions (Conditional) */}
        {placementInstrument && (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => handleSavePlacement(placementRatings)}
              className="w-full bg-sky-600 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center shadow-lg hover:bg-sky-700"
            >
              <Check className="w-5 h-5 mr-2" />
              Save & Start
            </button>
            <button
              onClick={handleSkipPlacement}
              className="w-full bg-gray-700 text-white font-medium py-3 px-6 rounded-lg text-lg flex items-center justify-center hover:bg-gray-600"
            >
              Skip, Start at Tier 1
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSession = () => {
    // ... (This function is unchanged, just renders `currentSession`) ...
    const currentExercise = currentSession[currentExerciseIndex];
    if (!currentExercise) return null;

    const isSessionFinished = timeRemaining === 0 && currentExerciseIndex === currentSession.length - 1;
    let instrName = allInstruments.find(i => i.id === instrument)?.name || "Practice";

    const focusName = ALL_SKILLS[focusArea] || 'Balanced';

    return (
      <div className="p-6 bg-black min-h-screen pt-12">
        <h1 className="text-3xl font-bold mb-2 text-white">{sessionDuration} Min {instrName} Session</h1>
        <p className="text-gray-400 mb-6">Focus: <span className="font-medium text-sky-400">{focusName}</span></p>

        {/* Timer Display */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            {React.cloneElement(currentExercise.icon, { className: "w-6 h-6 mr-3" })}
            <h2 className="text-2xl font-semibold text-white">{currentExercise.title}</h2>
          </div>
          <p className="text-7xl font-bold text-sky-400 my-4">{formatTime(timeRemaining)}</p>
          <p className="text-gray-300 whitespace-pre-line text-left mb-6">{currentExercise.description}</p>

          {/* Metronome UI */}
          {currentExercise.bpm && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Music className="w-5 h-5 text-sky-400 mr-3" />
                  <span className="text-white font-medium text-lg">{metronomeBpm} BPM</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMetronomeBpm(b => Math.max(30, b - 5))} className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600"><Minus className="w-5 h-5" /></button>
                  <button onClick={() => setMetronomeBpm(b => Math.min(200, b + 5))} className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600"><Plus className="w-5 h-5" /></button>
                  <button onClick={() => setIsMetronomeOn(!isMetronomeOn)} className={`w-20 font-medium py-2 px-3 rounded-lg ${isMetronomeOn ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{isMetronomeOn ? 'Off' : 'On'}</button>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={handlePlayPause} disabled={isSessionFinished} className={`w-32 flex items-center justify-center font-bold py-3 px-6 rounded-lg text-lg ${isTimerRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-sky-600 hover:bg-sky-700'} text-white ${isSessionFinished ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : ''}`}>
              {isTimerRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />} {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => handleNextExercise(false)} disabled={isSessionFinished} className={`w-32 flex items-center justify-center bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-700 ${isSessionFinished ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : ''}`}>
              <SkipForward className="w-5 h-5 mr-2" /> Skip
            </button>
          </div>
        </div>

        {/* Exercise List */}
        <h3 className="text-lg font-semibold mb-3 text-sky-400">Session Plan</h3>
        <div className="space-y-2 mb-6">
          {currentSession.map((item, index) => (
            <div key={item.id} className={`p-3 rounded-lg border-2 ${index === currentExerciseIndex ? 'bg-sky-900 border-sky-500' : 'bg-gray-800 border-gray-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {index === currentExerciseIndex && isTimerRunning ? <Play className="w-4 h-4 mr-2 text-sky-400 animate-pulse" /> : <Check className={`w-4 h-4 mr-2 ${index < currentExerciseIndex ? 'text-green-500' : 'text-gray-600'}`} />}
                  <span className={`font-medium ${index === currentExerciseIndex ? 'text-white' : 'text-gray-200'}`}>{item.title}</span>
                </div>
                <span className={`text-sm font-medium ${index === currentExerciseIndex ? 'text-sky-300' : 'text-gray-400'}`}>{item.duration} min</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setPracticeScreen('feedback')} className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center hover:bg-green-700">
          <Check className="w-5 h-5 mr-2" /> Finish & Give Feedback
        </button>
        <button onClick={handleBackToSetup} className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center hover:bg-gray-600 mt-3">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Setup
        </button>
      </div>
    );
  };

  const renderFeedback = () => {
    // ... (This function is unchanged, just renders `feedbackLevels`) ...
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-black pt-12">
        <h1 className="text-3xl font-bold mb-4 text-white">Session Feedback</h1>
        <p className="text-gray-400 mb-8 text-lg text-center">Rate the difficulty of each exercise <br /> to adapt your next session.</p>

        <div className="space-y-5 w-full mb-6">
          {Object.keys(feedbackLevels).map(area => (
            <div key={area} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3 text-center">{ALL_SKILLS[area] || area}</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleIndividualFeedback(area, 'hard')} className={`flex flex-col items-center p-3 rounded-lg border-2 ${feedbackLevels[area] === 'hard' ? 'bg-red-900 border-red-500' : 'bg-gray-800 border-gray-800 hover:bg-gray-700'}`}>
                  <TrendingUp className="w-5 h-5 mb-1 text-red-500" /> <span className="text-sm font-medium text-red-400">Too Hard (-3)</span>
                </button>
                <button onClick={() => handleIndividualFeedback(area, 'justRight')} className={`flex flex-col items-center p-3 rounded-lg border-2 ${feedbackLevels[area] === 'justRight' ? 'bg-green-900 border-green-500' : 'bg-gray-800 border-gray-800 hover:bg-gray-700'}`}>
                  <Check className="w-5 h-5 mb-1 text-green-500" /> <span className="text-sm font-medium text-green-400">Just Right (+2)</span>
                </button>
                <button onClick={() => handleIndividualFeedback(area, 'easy')} className={`flex flex-col items-center p-3 rounded-lg border-2 ${feedbackLevels[area] === 'easy' ? 'bg-blue-900 border-blue-500' : 'bg-gray-800 border-gray-800 hover:bg-gray-700'}`}>
                  <TrendingDown className="w-5 h-5 mb-1 text-blue-500" /> <span className="text-sm font-medium text-blue-400">Too Easy (+5)</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={applyFeedbackAndFinish} className="w-full bg-sky-600 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center shadow-lg hover:bg-sky-700">
          Save Feedback & Finish
        </button>
      </div>
    );
  };

  // --- Practice Log / Stats Screen (DYNAMIC) ---
  const renderProgressScreen = () => {

    // Get the current user's most practiced family to show relevant skills
    // This is a simple version. A better one would be a toggle.
    const lastInstrument = practiceLog.length > 0 ? practiceLog[practiceLog.length - 1].instrument : 'trumpet';
    const lastFamily = getFamily(lastInstrument);

    let skillsToShow = [];
    if (lastFamily === 'brass' || lastFamily === 'woodwind') {
      skillsToShow = Object.keys(WIND_SKILLS);
    } else if (lastFamily === 'percussion') {
      skillsToShow = Object.keys(PERCUSSION_SKILLS);
    } else {
      skillsToShow = Object.keys(WIND_SKILLS); // Default
    }

    return (
      <div className="p-6 pt-12">
        <h1 className="text-3xl font-bold mb-6 text-white">Your Progress</h1>

        {/* --- DYNAMIC Per-Instrument & Total Hours --- */}
          <div className="grid grid-cols-3 gap-3 mb-8">
    {Object.keys(instrumentFamilies).map(family => {
      // ... (some code here) ...
      return (
        <div key={family} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          {/* --- CHANGED --- */}
          <span className="text-xs sm:text-sm font-medium text-sky-400 block uppercase tracking-wider">{family}</span>
          {/* --- CHANGED --- */}
          <span className="text-xl sm:text-2xl font-bold text-white block mt-1">{familyHours}</span>
  
          <span className="text-xs text-gray-400 block">hours</span>
        </div>
      );
    })}
  </div>
          
          {/* --- NEW: Practice Streak --- */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
            <span className="text-sm font-medium text-sky-400 block uppercase tracking-wider">Current Streak</span>
            <div className="flex items-center justify-center mt-1">
              <Zap className="w-8 h-8 text-yellow-400 mr-2" />
              <span className="text-4xl font-bold text-white block">{practiceStreak}</span>
            </div>
            <span className="text-sm text-gray-400 block">day{practiceStreak !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {Object.keys(instrumentFamilies).map(family => {
            const familyInstruments = instrumentFamilies[family];
            const familyHours = familyInstruments.reduce((sum, instr) => sum + parseFloat(practiceTimes[instr.id] || 0), 0).toFixed(1);
            return (
              <div key={family} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-sky-400 block uppercase tracking-wider">{family}</span>
                <span className="text-2xl font-bold text-white block mt-1">{familyHours}</span>
                <span className="text-xs text-gray-400 block">hours</span>
              </div>
            );
          })}
        </div>

        {/* --- DYNAMIC Skill Scores --- */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-sky-400">Current Skill Scores</h2>
          <p className="text-gray-400 text-sm -mt-3 mb-4">Showing skills for your last-practiced instrument family.</p>
          <div className="space-y-4">
            {skillsToShow.map(area => {
              const score = skillLevels[area] || 0;
              const tier = getTierFromScore(score);
              const currentTierInfo = TIER_DESCRIPTIONS[tier] || TIER_DESCRIPTIONS[TIER_THRESHOLDS.length];

              const currentTierThreshold = TIER_THRESHOLDS[tier - 1];
              let nextTierScore = MAX_MASTERY_SCORE;
              let pointsToNext = 0;
              let nextTierInfo = null;

              if (tier < TIER_THRESHOLDS.length) {
                nextTierScore = TIER_THRESHOLDS[tier];
                pointsToNext = nextTierScore - score;
                nextTierInfo = TIER_DESCRIPTIONS[tier + 1];
              }

              const progressPercent = (nextTierScore > currentTierThreshold) ?
                ((score - currentTierThreshold) / (nextTierScore - currentTierThreshold)) * 100 :
                (score >= MAX_MASTERY_SCORE ? 100 : 0);

              return (
                <div key={area} className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-gray-100 font-medium text-lg">{ALL_SKILLS[area]}</span>
                    <span className="text-sm font-bold text-sky-400">
                      Tier {tier}: {currentTierInfo.name}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 my-2">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  {nextTierInfo ? (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-400">Score: {score} / {nextTierScore}</span>
                      <span className="text-xs text-sky-300">{pointsToNext} points to Tier {tier + 1}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-400">Score: {score} / {MAX_MASTERY_SCORE}</span>
                      <span className="text-xs text-green-400">Max Tier Reached!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Heatmap */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-sky-400">Practice Log (Last 35 Days)</h2>
          <p className="text-gray-400 text-sm -mt-3 mb-4">Each blue square is a day you practiced!</p>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => (
              <div key={day.date} className={`w-full aspect-square rounded ${day.isPracticed ? 'bg-sky-600' : 'bg-gray-800'} ${day.isToday ? 'border-2 border-sky-400' : 'border border-transparent'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- Training Screen (NEW STRUCTURE) ---
  const renderIntervalTrainer = () => { /* ... (unchanged) ... */
    if (!intervalQuestion) return null; // Wait for question
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-4">What interval is this?</h2>

        <div className="flex justify-center gap-4 my-6">
          <button onClick={() => playInterval(intervalQuestion.baseNote, intervalQuestion.note, false)} className="w-40 flex items-center justify-center font-bold py-3 px-6 rounded-lg text-lg bg-sky-600 hover:bg-sky-700 text-white">
            <Play className="w-5 h-5 mr-2" /> Melodic
          </button>
          <button onClick={() => playInterval(intervalQuestion.baseNote, intervalQuestion.note, true)} className="w-40 flex items-center justify-center font-bold py-3 px-6 rounded-lg text-lg bg-gray-600 hover:bg-gray-700 text-white">
            <Music className="w-5 h-5 mr-2" /> Harmonic
          </button>
        </div>

        <div className="space-y-3 my-6">
          {intervalOptions.map((option) => (
            <button key={option.name} onClick={() => handleIntervalGuess(option)} disabled={!!intervalFeedback} className="w-full bg-gray-800 border-gray-700 border-2 text-white font-medium py-4 px-6 rounded-lg text-lg hover:border-sky-500 disabled:opacity-50">
              {option.name}
            </button>
          ))}
        </div>

        {intervalFeedback && (
          <div className="mt-6">
            <p className={`text-xl font-bold ${intervalFeedback === 'Correct!' ? 'text-green-400' : 'text-red-400'}`}>{intervalFeedback}</p>
            <button onClick={generateIntervalQuestion} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4">
              Next Question
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPitchTrainer = () => { /* ... (unchanged) ... */
    if (!pitchQuestion) return null; // Wait for question
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-4">What note is this?</h2>

        <div className="flex justify-center gap-4 my-6">
          <button onClick={() => playNote(pitchQuestion.note)} className="w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg text-lg bg-sky-600 hover:bg-sky-700 text-white">
            <Play className="w-5 h-5 mr-2" /> Play Note
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 my-6">
          {allNotes.map((note) => (
            <button key={note.name} onClick={() => handlePitchGuess(note)} disabled={!!pitchFeedback} className="w-full aspect-square bg-gray-800 border-gray-700 border-2 text-white font-bold text-lg rounded-lg hover:border-sky-500 disabled:opacity-50">
              {note.name}
            </button>
          ))}
        </div>

        {pitchFeedback && (
          <div className="mt-6">
            <p className={`text-xl font-bold ${pitchFeedback === 'Correct!' ? 'text-green-400' : 'text-red-400'}`}>{pitchFeedback}</p>
            <button onClick={generatePitchQuestion} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4">
              Next Question
            </button>
          </div>
        )}
      </div>
    );
  };

  // NEW: Render Rhythm Trainer
  const renderRhythmTrainer = () => {
    if (!rhythmQuestion) return null; // Wait for question

    const handleTierChange = (newTier) => {
      if (newTier === rhythmTier) return;
      setRhythmTier(newTier);
    };

    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-4">Rhythm Flashcards</h2>

        {/* Tier Selector */}
        <div className="flex mb-4 rounded-lg bg-gray-800 p-1 border border-gray-700">
          <button onClick={() => handleTierChange(1)} className={`w-1/3 py-2.5 rounded-md font-medium ${rhythmTier === 1 ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>
            Tier 1
          </button>
          <button onClick={() => handleTierChange(2)} className={`w-1/3 py-2.5 rounded-md font-medium ${rhythmTier === 2 ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>
            Tier 2
          </button>
           <button onClick={() => handleTierChange(3)} className={`w-1/3 py-2.5 rounded-md font-medium ${rhythmTier === 3 ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>
            Tier 3
          </button>
        </div>
        
        {/* Rhythm Display */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 my-6">
           <p className="text-3xl font-mono font-bold text-sky-300 tracking-wider">{rhythmQuestion.notation}</p>
           <p className="text-xs text-gray-400 mt-2">Practice playing this rhythm. ( ) = Rest</p>
        </div>

        {/* Metronome UI */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Music className="w-5 h-5 text-sky-400 mr-3" />
              <span className="text-white font-medium text-lg">{metronomeBpm} BPM</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMetronomeBpm(b => Math.max(30, b - 5))} className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600"><Minus className="w-5 h-5" /></button>
              <button onClick={() => setMetronomeBpm(b => Math.min(200, b + 5))} className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600"><Plus className="w-5 h-5" /></button>
              <button onClick={() => setIsMetronomeOn(!isMetronomeOn)} className={`w-20 font-medium py-2 px-3 rounded-lg ${isMetronomeOn ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{isMetronomeOn ? 'Off' : 'On'}</button>
            </div>
          </div>
        </div>

        <button onClick={generateRhythmQuestion} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4">
          New Rhythm
        </button>
      </div>
    );
  };


  const renderTrainingScreen = () => {
    return (
      <div className="p-6 pt-12">
        <h1 className="text-3xl font-bold mb-2 text-white">Musicianship Training</h1>
        <p className="text-gray-400 mb-6">Train your ear, mind, and reading.</p>

        {/* --- Training Mode Tabs --- */}
        <div className="flex mb-4 rounded-lg bg-gray-800 p-1 border border-gray-700">
          <button onClick={() => setTrainingMode('intervals')} className={`w-1/3 py-2.5 rounded-md font-medium ${trainingMode === 'intervals' ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>
            Intervals
          </button>
          <button onClick={() => setTrainingMode('pitch')} className={`w-1/3 py-2.5 rounded-md font-medium ${trainingMode === 'pitch' ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>
            Pitch
          </button>
          <button onClick={() => setTrainingMode('rhythm')} className={`w-1/3 py-2.5 rounded-md font-medium ${trainingMode === 'rhythm' ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>
            Rhythm
          </button>
        </div>

        {/* --- Render selected trainer --- */}
        {trainingMode === 'intervals' && renderIntervalTrainer()}
        {trainingMode === 'pitch' && renderPitchTrainer()}
        {trainingMode === 'rhythm' && renderRhythmTrainer()}

      </div>
    );
  };

  // --- Main Render Function with Navigation ---

  const renderPracticeFlow = () => {
    if (practiceScreen === 'placementTest') return renderPlacementTest(); // NEW
    if (practiceScreen === 'session') return renderSession();
    if (practiceScreen === 'feedback') return renderFeedback();
    return renderWelcome(); // Default is 'welcome'
  };

  const timeOptions = [15, 30, 45, 60];

  // This is now just for the render function, logic is in instrumentFamilies
  const instrumentOptions = [
    { id: 'trumpet', name: 'Trumpet', icon: <Play className="w-6 h-6" /> },
    { id: 'frenchHorn', name: 'French Horn', icon: <Wind className="w-6 h-6" /> },
    { id: 'mellophone', name: 'Mellophone', icon: <Wind className="w-6 h-6" /> },
  ];

  // --- NEW: Loading check ---
  if (isCheckingPlacement) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <Clock className="w-12 h-12 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black font-sans antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full min-h-screen pb-20"> {/* Add padding-bottom for nav */}

        {/* Main Content Area */}
        {mainScreen === 'practice' && renderPracticeFlow()}
        {mainScreen === 'progress' && renderProgressScreen()}
        {mainScreen === 'training' && renderTrainingScreen()} {/* UPDATED */}

      </div>

      {/* --- Bottom Navigation Bar (UPDATED) --- */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setMainScreen('practice')} className={`flex flex-col items-center justify-center p-2 rounded-lg w-1/3 ${mainScreen === 'practice' ? 'text-sky-400' : 'text-gray-400 hover:text-sky-400'}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Practice</span>
          </button>

          <button onClick={() => setMainScreen('progress')} className={`flex flex-col items-center justify-center p-2 rounded-lg w-1/3 ${mainScreen === 'progress' ? 'text-sky-400' : 'text-gray-400 hover:text-sky-400'}`}>
            <BarChart2 className="w-6 h-6" />
            <span className="text-xs font-medium">Progress</span>
          </button>

          <button onClick={() => setMainScreen('training')} className={`flex flex-col items-center justify-center p-2 rounded-lg w-1/3 ${mainScreen === 'training' ? 'text-sky-400' : 'text-gray-400 hover:text-sky-400'}`}>
            <Ear className="w-6 h-6" />
            <span className="text-xs font-medium">Training</span>
          </button>
        </div>
      </div>


{/* --- ADD THIS NEW SECTION --- */}
<div className="mt-12"> 
  <a
    // --- !!! IMPORTANT: CHANGE THIS URL !!! ---
    href="https://buymeacoffee.com/dt8rsh4ykxz" 
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-center text-gray-300 font-medium hover:bg-gray-700 transition-colors"
  >
    Like this app? Support its development! ☕
  </a>
</div>
{/* --- END OF NEW SECTION --- */}



      
    </div>
  );
}

