/**
 * Initial Default Configuration & Seed Data for Gautham's Fitness App
 */

export const FIREBASE_CONFIG = {
  projectId: "fitnessmojo-a898d",
  authDomain: "fitnessmojo-a898d.firebaseapp.com",
  storageBucket: "fitnessmojo-a898d.firebasestorage.app",
  messagingSenderId: "392517507591",
  appId: "1:392517507591:web:ac5400922515904c47e8a2",
  apiKey: "" // Loaded dynamically from saved settings or filled by user
};

export const DEFAULT_PROFILE = {
  name: 'Gautham',
  age: 26,
  heightCm: 178,
  weightKg: 74.5,
  goalSummary: 'General fitness with mild muscle gain',
  proteinTargetG: 103,
  waterTargetL: 3.0,
  stepTarget: 8000,
  workoutTargetDaysPerWeek: 5,
  theme: 'dark'
};

export const INITIAL_INDIAN_FOODS = [
  { id: 'f_chicken_breast', name: 'Chicken Breast (Cooked)', defaultQty: '100g', proteinG: 31, category: 'Poultry' },
  { id: 'f_paneer', name: 'Paneer (Cottage Cheese)', defaultQty: '100g', proteinG: 18, category: 'Dairy' },
  { id: 'f_egg_whites', name: 'Egg Whites (3 Large)', defaultQty: '3 eggs', proteinG: 11, category: 'Eggs' },
  { id: 'f_whole_egg', name: 'Whole Egg', defaultQty: '1 large', proteinG: 6, category: 'Eggs' },
  { id: 'f_whey_protein', name: 'Whey Protein Scoop', defaultQty: '1 scoop (32g)', proteinG: 24, category: 'Supplements' },
  { id: 'f_curd_dahi', name: 'Curd / Dahi (Greek / Thick)', defaultQty: '150g', proteinG: 12, category: 'Dairy' },
  { id: 'f_soya_chunks', name: 'Soya Chunks (Raw)', defaultQty: '50g', proteinG: 26, category: 'Plant-Based' },
  { id: 'f_dal_tadka', name: 'Cooked Moong / Toor Dal', defaultQty: '1 bowl (200g)', proteinG: 9, category: 'Lentils' },
  { id: 'f_chana_masala', name: 'Boiled Chana / Rajma', defaultQty: '1 bowl (180g)', proteinG: 12, category: 'Lentils' },
  { id: 'f_roti_chapati', name: 'Whole Wheat Roti', defaultQty: '1 piece', proteinG: 3, category: 'Grains' },
  { id: 'f_tofu', name: 'Firm Tofu', defaultQty: '100g', proteinG: 14, category: 'Plant-Based' },
  { id: 'f_milk_toned', name: 'Toned Milk', defaultQty: '250ml', proteinG: 8, category: 'Dairy' },
  { id: 'f_oats', name: 'Rolled Oats', defaultQty: '50g', proteinG: 6.5, category: 'Grains' },
  { id: 'f_peanut_butter', name: 'Peanut Butter', defaultQty: '2 tbsp (32g)', proteinG: 8, category: 'Nuts & Seeds' }
];

export const INITIAL_SAVED_MEALS = [
  {
    id: 'sm_power_breakfast',
    name: 'High-Protein Breakfast',
    items: [
      { name: 'Rolled Oats', qty: '50g', proteinG: 6.5 },
      { name: 'Toned Milk', qty: '250ml', proteinG: 8 },
      { name: 'Whey Protein Scoop', qty: '1 scoop', proteinG: 24 }
    ],
    totalProteinG: 38.5
  },
  {
    id: 'sm_post_workout',
    name: 'Post-Workout Shake',
    items: [
      { name: 'Whey Protein Scoop', qty: '1 scoop', proteinG: 24 },
      { name: 'Toned Milk', qty: '200ml', proteinG: 6.5 }
    ],
    totalProteinG: 30.5
  },
  {
    id: 'sm_protein_dinner',
    name: 'Chicken & Roti Dinner',
    items: [
      { name: 'Chicken Breast (Cooked)', qty: '150g', proteinG: 46.5 },
      { name: 'Whole Wheat Roti', qty: '2 pieces', proteinG: 6 }
    ],
    totalProteinG: 52.5
  }
];

export const INITIAL_EXERCISE_LIBRARY = [
  // CHEST
  { id: 'ex_incline_smith', name: 'Incline Smith Machine Press', primaryCategory: 'Chest', targetRegion: 'Upper chest', secondaryMuscles: ['Front delts', 'Triceps'] },
  { id: 'ex_flat_machine_bench', name: 'Flat Machine Bench Press', primaryCategory: 'Chest', targetRegion: 'Middle chest', secondaryMuscles: ['Front delts', 'Triceps'] },
  { id: 'ex_chest_fly', name: 'Chest Fly', primaryCategory: 'Chest', targetRegion: 'Middle chest', secondaryMuscles: ['Front delts'] },
  
  // BACK
  { id: 'ex_lat_pulldown', name: 'Normal Lat Pulldown', primaryCategory: 'Back', targetRegion: 'Lats', secondaryMuscles: ['Biceps', 'Upper back'] },
  { id: 'ex_close_grip_row', name: 'Close-Grip Row', primaryCategory: 'Back', targetRegion: 'Mid back', secondaryMuscles: ['Lats', 'Biceps'] },
  { id: 'ex_chest_supported_row', name: 'Chest-Supported Upper-Back Dumbbell Row', primaryCategory: 'Back', targetRegion: 'Upper back', secondaryMuscles: ['Rear delts', 'Biceps'] },
  { id: 'ex_close_grip_pulldown', name: 'Close-Grip Lat Pulldown', primaryCategory: 'Back', targetRegion: 'Lats', secondaryMuscles: ['Biceps'] },
  
  // SHOULDERS
  { id: 'ex_lateral_raises', name: 'Lateral Raises', primaryCategory: 'Shoulders', targetRegion: 'Side delts', secondaryMuscles: ['Traps'] },
  { id: 'ex_shrugs', name: 'Shrugs', primaryCategory: 'Shoulders', targetRegion: 'Traps / Upper back', secondaryMuscles: ['Forearms'] },
  { id: 'ex_machine_shoulder_press', name: 'Machine Shoulder Press', primaryCategory: 'Shoulders', targetRegion: 'Front delts', secondaryMuscles: ['Triceps', 'Side delts'] },
  { id: 'ex_reverse_pec_deck', name: 'Reverse Pec Deck', primaryCategory: 'Shoulders', targetRegion: 'Rear delts', secondaryMuscles: ['Upper back'] },
  { id: 'ex_front_raises', name: 'Front Raises', primaryCategory: 'Shoulders', targetRegion: 'Front delts', secondaryMuscles: [] },

  // ARMS - TRICEPS
  { id: 'ex_cable_pushdown', name: 'Cable Pushdown', primaryCategory: 'Arms', targetRegion: 'Triceps', secondaryMuscles: [] },
  { id: 'ex_overhead_cable_triceps', name: 'Overhead Cable Triceps Extension', primaryCategory: 'Arms', targetRegion: 'Triceps (Long head)', secondaryMuscles: [] },
  { id: 'ex_single_arm_triceps', name: 'Single-Arm Triceps Finisher', primaryCategory: 'Arms', targetRegion: 'Triceps', secondaryMuscles: [] },

  // ARMS - BICEPS
  { id: 'ex_seated_preacher_curl', name: 'Seated Preacher Curl', primaryCategory: 'Arms', targetRegion: 'Biceps (Short head)', secondaryMuscles: ['Forearms'] },
  { id: 'ex_incline_db_curl', name: 'Incline Dumbbell Curl', primaryCategory: 'Arms', targetRegion: 'Biceps (Long head)', secondaryMuscles: ['Forearms'] },
  { id: 'ex_21s_bar', name: '21s With Bar', primaryCategory: 'Arms', targetRegion: 'Biceps', secondaryMuscles: ['Forearms'] },

  // LEGS
  { id: 'ex_squat', name: 'Squat', primaryCategory: 'Legs', targetRegion: 'Quads', secondaryMuscles: ['Glutes', 'Lower back'] },
  { id: 'ex_leg_press', name: 'Leg Press', primaryCategory: 'Legs', targetRegion: 'Quads', secondaryMuscles: ['Glutes'] },
  { id: 'ex_seated_leg_curl', name: 'Seated Leg Curl', primaryCategory: 'Legs', targetRegion: 'Hamstrings', secondaryMuscles: ['Calves'] },
  { id: 'ex_lunges', name: 'Lunges', primaryCategory: 'Legs', targetRegion: 'Quads & Glutes', secondaryMuscles: ['Hamstrings'] },
  { id: 'ex_calf_raises', name: 'Calf Raises', primaryCategory: 'Legs', targetRegion: 'Calves', secondaryMuscles: [] },

  // ABS / CORE
  { id: 'ex_weighted_knee_crunch', name: 'Weighted Knee Crunch', primaryCategory: 'Core', targetRegion: 'Abs', secondaryMuscles: [] },
  { id: 'ex_knee_raises', name: 'Knee Raises', primaryCategory: 'Core', targetRegion: 'Lower Abs', secondaryMuscles: [] },
  { id: 'ex_single_leg_raises', name: 'Single-Leg Raises', primaryCategory: 'Core', targetRegion: 'Lower Abs', secondaryMuscles: [] },
  { id: 'ex_around_the_world', name: 'Around the World', primaryCategory: 'Core', targetRegion: 'Obliques & Core', secondaryMuscles: [] },
  { id: 'ex_side_crunches', name: 'Side Crunches', primaryCategory: 'Core', targetRegion: 'Obliques', secondaryMuscles: [] },
  { id: 'ex_plank', name: 'Plank', primaryCategory: 'Core', targetRegion: 'Core Stability', secondaryMuscles: [] },
  { id: 'ex_pallof_press', name: 'Pallof Press', primaryCategory: 'Core', targetRegion: 'Anti-rotation Core', secondaryMuscles: [] },
  { id: 'ex_lateral_lunges', name: 'Lateral Lunges', primaryCategory: 'Legs', targetRegion: 'Adductors & Quads', secondaryMuscles: ['Glutes'] },
  { id: 'ex_dead_hang', name: 'Dead Hang', primaryCategory: 'Core', targetRegion: 'Grip & Shoulder Health', secondaryMuscles: ['Forearms', 'Lats'] },
  { id: 'ex_deep_squat_hold', name: 'Deep Squat Hold', primaryCategory: 'Legs', targetRegion: 'Hip Mobility & Ankle', secondaryMuscles: [] },

  // FOREARMS
  { id: 'ex_wrist_curls', name: 'Wrist Curls', primaryCategory: 'Arms', targetRegion: 'Forearms (Flexors)', secondaryMuscles: [] },
  { id: 'ex_reverse_wrist_curls', name: 'Reverse Wrist Curls', primaryCategory: 'Arms', targetRegion: 'Forearms (Extensors)', secondaryMuscles: [] },
  { id: 'ex_farmers_carry', name: 'Farmer\'s Carry', primaryCategory: 'Arms', targetRegion: 'Forearms & Traps', secondaryMuscles: ['Core'] }
];

export const INITIAL_WORKOUT_PLAN = [
  {
    dayIndex: 1,
    name: 'Day 1 — Chest + Shoulders + Triceps',
    tag: 'Chest & Push Focus',
    isRest: false,
    exercises: [
      { exerciseId: 'ex_incline_smith', name: 'Incline Smith Machine Press', sets: 2, reps: '8–12', category: 'Chest' },
      { exerciseId: 'ex_flat_machine_bench', name: 'Flat Machine Bench Press', sets: 2, reps: '8–12', category: 'Chest' },
      { exerciseId: 'ex_chest_fly', name: 'Chest Fly', sets: 2, reps: '10–15', category: 'Chest' },
      { exerciseId: 'ex_lateral_raises', name: 'Lateral Raises', sets: 2, reps: '12–15', category: 'Shoulders' },
      { exerciseId: 'ex_shrugs', name: 'Shrugs', sets: 2, reps: '10–15', category: 'Shoulders' },
      { exerciseId: 'ex_cable_pushdown', name: 'Cable Pushdown', sets: 2, reps: '8–12', category: 'Triceps' },
      { exerciseId: 'ex_overhead_cable_triceps', name: 'Overhead Cable Triceps Extension', sets: 2, reps: '10–15', category: 'Triceps' }
    ]
  },
  {
    dayIndex: 2,
    name: 'Day 2 — Back + Biceps',
    tag: 'Back & Pull Focus',
    isRest: false,
    exercises: [
      { exerciseId: 'ex_lat_pulldown', name: 'Normal Lat Pulldown', sets: 2, reps: '8–12', category: 'Back' },
      { exerciseId: 'ex_close_grip_row', name: 'Close-Grip Row', sets: 2, reps: '8–12', category: 'Back' },
      { exerciseId: 'ex_chest_supported_row', name: 'Chest-Supported Upper-Back Dumbbell Row', sets: 2, reps: '8–12', category: 'Back' },
      { exerciseId: 'ex_close_grip_pulldown', name: 'Close-Grip Lat Pulldown', sets: 2, reps: '10–12', category: 'Back' },
      { exerciseId: 'ex_seated_preacher_curl', name: 'Seated Preacher Curl', sets: 2, reps: '8–12', note: 'Short-head bias', category: 'Biceps' },
      { exerciseId: 'ex_incline_db_curl', name: 'Incline Dumbbell Curl', sets: 2, reps: '8–12', note: 'Long-head bias', category: 'Biceps' }
    ]
  },
  {
    dayIndex: 3,
    name: 'Day 3 — Legs',
    tag: 'Legs & Lower Body',
    isRest: false,
    exercises: [
      { exerciseId: 'ex_squat', name: 'Squat', sets: 2, reps: '6–10', category: 'Legs' },
      { exerciseId: 'ex_leg_press', name: 'Leg Press', sets: 2, reps: '8–12', category: 'Legs' },
      { exerciseId: 'ex_seated_leg_curl', name: 'Seated Leg Curl', sets: 2, reps: '10–15', category: 'Legs' },
      { exerciseId: 'ex_lunges', name: 'Lunges', sets: 2, reps: '8–12', category: 'Legs' },
      { exerciseId: 'ex_calf_raises', name: 'Calf Raises', sets: 2, reps: '10–15', category: 'Legs' }
    ]
  },
  {
    dayIndex: 4,
    name: 'Day 4 — Shoulders + Arms',
    tag: 'Shoulders & Arms Hypertrophy',
    isRest: false,
    exercises: [
      { exerciseId: 'ex_machine_shoulder_press', name: 'Machine Shoulder Press', sets: 2, reps: '8–12', category: 'Shoulders' },
      { exerciseId: 'ex_lateral_raises', name: 'Lateral Raises', sets: 2, reps: '12–15', category: 'Shoulders' },
      { exerciseId: 'ex_reverse_pec_deck', name: 'Reverse Pec Deck', sets: 2, reps: '12–15', category: 'Shoulders' },
      { exerciseId: 'ex_front_raises', name: 'Front Raises', sets: 2, reps: '12–15', category: 'Shoulders' },
      { exerciseId: 'ex_shrugs', name: 'Shrugs', sets: 2, reps: '10–15', category: 'Shoulders' },
      { exerciseId: 'ex_cable_pushdown', name: 'Cable Pushdown', sets: 2, reps: '8–12', category: 'Triceps' },
      { exerciseId: 'ex_overhead_cable_triceps', name: 'Overhead Cable Triceps Extension', sets: 2, reps: '10–15', category: 'Triceps' },
      { exerciseId: 'ex_single_arm_triceps', name: 'Single-Arm Triceps Finisher', sets: 2, reps: '10–15', category: 'Triceps' },
      { exerciseId: 'ex_seated_preacher_curl', name: 'Seated Preacher Curl', sets: 2, reps: '8–12', category: 'Biceps' },
      { exerciseId: 'ex_incline_db_curl', name: 'Incline Dumbbell Curl', sets: 2, reps: '10–12', category: 'Biceps' },
      { exerciseId: 'ex_21s_bar', name: '21s With Bar', sets: 1, reps: 'Finishers', category: 'Biceps' }
    ]
  },
  {
    dayIndex: 5,
    name: 'Day 5 — Chest + Back',
    tag: 'Torso Upper Body',
    isRest: false,
    exercises: [
      { exerciseId: 'ex_incline_smith', name: 'Incline Smith Press', sets: 2, reps: '8–12', category: 'Chest' },
      { exerciseId: 'ex_flat_machine_bench', name: 'Flat Machine Bench Press', sets: 2, reps: '8–12', category: 'Chest' },
      { exerciseId: 'ex_chest_fly', name: 'Chest Fly', sets: 2, reps: '10–15', category: 'Chest' },
      { exerciseId: 'ex_lat_pulldown', name: 'Lat Pulldown', sets: 2, reps: '8–12', category: 'Back' },
      { exerciseId: 'ex_close_grip_row', name: 'Close-Grip Row', sets: 2, reps: '8–12', category: 'Back' },
      { exerciseId: 'ex_chest_supported_row', name: 'Chest-Supported Upper-Back Dumbbell Row', sets: 2, reps: '8–12', category: 'Back' }
    ]
  },
  {
    dayIndex: 6,
    name: 'Day 6 — Optional Abs + Forearms',
    tag: 'Core, Mobility & Forearms',
    isRest: false,
    exercises: [
      { exerciseId: 'ex_weighted_knee_crunch', name: 'Weighted Knee Crunch', sets: 2, reps: '10–15', category: 'Abs' },
      { exerciseId: 'ex_knee_raises', name: 'Knee Raises', sets: 2, reps: '10–15', category: 'Abs' },
      { exerciseId: 'ex_single_leg_raises', name: 'Single-Leg Raises', sets: 2, reps: '10–15', category: 'Abs' },
      { exerciseId: 'ex_around_the_world', name: 'Around the World', sets: 2, reps: '8–12 / dir', category: 'Abs' },
      { exerciseId: 'ex_side_crunches', name: 'Side Crunches', sets: 2, reps: '10–15', category: 'Abs' },
      { exerciseId: 'ex_plank', name: 'Plank', sets: 2, reps: '1–2 sets', category: 'Abs' },
      { exerciseId: 'ex_pallof_press', name: 'Pallof Press', sets: 2, reps: '10–15', category: 'Core' },
      { exerciseId: 'ex_lateral_lunges', name: 'Lateral Lunges', sets: 2, reps: '8–12 / side', category: 'Core' },
      { exerciseId: 'ex_dead_hang', name: 'Dead Hang', sets: 2, reps: '20–40 sec', category: 'Core' },
      { exerciseId: 'ex_deep_squat_hold', name: 'Deep Squat Hold', sets: 2, reps: '30–60 sec', category: 'Legs' },
      { exerciseId: 'ex_wrist_curls', name: 'Wrist Curls', sets: 2, reps: '12–15', category: 'Forearms' },
      { exerciseId: 'ex_reverse_wrist_curls', name: 'Reverse Wrist Curls', sets: 2, reps: '12–15', category: 'Forearms' },
      { exerciseId: 'ex_farmers_carry', name: 'Farmer\'s Carry', sets: 2, reps: '2 rounds', category: 'Forearms' }
    ]
  },
  {
    dayIndex: 0,
    name: 'Day 7 — Rest',
    tag: 'Recovery & Mobility',
    isRest: true,
    exercises: []
  }
];

export const INITIAL_REMINDERS = [
  { id: 'rem_creatine', name: 'Creatine', time: '09:00', frequency: 'daily', enabled: true, type: 'fixed' },
  { id: 'rem_breakfast', name: 'Breakfast', time: '09:30', frequency: 'daily', enabled: true, type: 'fixed' },
  { id: 'rem_lunch', name: 'Lunch', time: '13:30', frequency: 'daily', enabled: true, type: 'fixed' },
  { id: 'rem_protein', name: 'Protein Target Check', time: '19:00', frequency: 'daily', enabled: true, type: 'intelligent', thresholdG: 30 },
  { id: 'rem_dinner', name: 'Dinner', time: '20:30', frequency: 'daily', enabled: true, type: 'fixed' },
  { id: 'rem_sleep', name: 'Sleep Target (7.5+ hrs)', time: '22:30', frequency: 'daily', enabled: true, type: 'fixed' }
];
