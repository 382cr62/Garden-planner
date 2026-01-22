// TOMATO PLANNING CALCULATOR PROTOTYPE
// This demonstrates the core calculation logic for your garden planning app

// ===== DATA STRUCTURES =====

// Sample tomato database (you'll expand this with Johnny's full catalog)
const tomatoVarieties = {
  cherry: {
    avgDTM: 65, // Average days to maturity
    dtmRange: '55-79',
    transplantWeeks: 6, // weeks to start seeds indoors
    yieldPerPlant: {
      fruits: 120, // typical fruit count
      pounds: 8 // typical weight
    },
    spacing: 24, // inches between plants
    companion: ['basil', 'marigold', 'carrots'],
    growthHabit: 'indeterminate',
    examples: ['Sungold', 'Sweet Million', 'Black Cherry']
  },
  grape: {
    avgDTM: 72,
    dtmRange: '70-74',
    transplantWeeks: 6,
    yieldPerPlant: {
      fruits: 100,
      pounds: 7
    },
    spacing: 24,
    companion: ['basil', 'marigold', 'carrots'],
    growthHabit: 'indeterminate',
    examples: ['Juliet', 'Santa']
  },
  slicing: {
    avgDTM: 75,
    dtmRange: '65-89',
    transplantWeeks: 6,
    yieldPerPlant: {
      fruits: 25,
      pounds: 15
    },
    spacing: 30,
    companion: ['basil', 'marigold', 'carrots'],
    growthHabit: 'indeterminate',
    examples: ['Big Beef', 'Better Boy']
  },
  beefsteak: {
    avgDTM: 78,
    dtmRange: '70-85',
    transplantWeeks: 6,
    yieldPerPlant: {
      fruits: 20,
      pounds: 12
    },
    spacing: 36,
    companion: ['basil', 'marigold', 'carrots'],
    growthHabit: 'indeterminate',
    examples: ['Brandywine', 'Cherokee Purple']
  },
  paste: {
    avgDTM: 80,
    dtmRange: '75-85',
    transplantWeeks: 6,
    yieldPerPlant: {
      fruits: 30,
      pounds: 10
    },
    spacing: 24,
    companion: ['basil', 'marigold', 'carrots'],
    growthHabit: 'determinate',
    examples: ['San Marzano', 'Roma']
  }
};

// Sample frost date database (you'd integrate with a real API or zip code lookup)
const frostDates = {
  '25301': { // Charleston, WV
    lastSpring: '2026-04-25',
    firstFall: '2026-10-15'
  },
  // Add more zip codes as needed
};

// ===== HELPER FUNCTIONS =====

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// ===== CORE CALCULATION ENGINE =====

function calculatePlantingSchedule(params) {
  const {
    tomatoType,        // 'cherry', 'grape', 'slicing', etc.
    targetHarvestDate, // Date object or string
    zipCode,           // for frost date lookup
    useBiodynamic = false,
    desiredYield       // in pounds
  } = params;

  const variety = tomatoVarieties[tomatoType];
  if (!variety) {
    return { error: 'Unknown tomato type' };
  }

  const harvestDate = new Date(targetHarvestDate);
  const frostData = frostDates[zipCode] || frostDates['25301']; // default
  const lastFrostDate = new Date(frostData.lastSpring);

  // Calculate key dates working backward from harvest
  const transplantDate = subtractDays(harvestDate, variety.avgDTM);
  const seedStartDate = subtractDays(transplantDate, variety.transplantWeeks * 7);
  const hardenOffStart = subtractDays(transplantDate, 7);

  // Check if transplant date is safe (after last frost)
  const isSafePlanting = transplantDate >= lastFrostDate;
  
  // Calculate number of plants needed for desired yield
  const plantsNeeded = Math.ceil(desiredYield / variety.yieldPerPlant.pounds);

  // Calculate succession planting (for continuous harvest)
  const successionInterval = 14; // days between successive plantings
  const maxSuccessions = 3; // typical for home gardens

  const schedule = {
    tomatoType,
    variety: variety.examples[0], // default to first example
    timeline: {
      seedStart: formatDate(seedStartDate),
      seedStartDate: seedStartDate,
      hardenOff: formatDate(hardenOffStart),
      transplant: formatDate(transplantDate),
      transplantDate: transplantDate,
      firstHarvest: formatDate(harvestDate),
      harvestWindow: {
        start: formatDate(harvestDate),
        end: formatDate(addDays(harvestDate, 30)) // 30-day harvest window
      }
    },
    planting: {
      plantsNeeded,
      spacing: `${variety.spacing} inches`,
      spaceSqFt: (variety.spacing / 12) * (variety.spacing / 12) * plantsNeeded,
      growthHabit: variety.growthHabit
    },
    expectedYield: {
      perPlant: {
        pounds: variety.yieldPerPlant.pounds,
        fruits: variety.yieldPerPlant.fruits
      },
      total: {
        pounds: plantsNeeded * variety.yieldPerPlant.pounds,
        fruits: plantsNeeded * variety.yieldPerPlant.fruits
      }
    },
    companion: {
      goodCompanions: variety.companion,
      plantingTips: 'Plant basil between tomato plants to deter pests and improve flavor.'
    },
    warnings: !isSafePlanting ? [
      `Warning: Transplant date (${formatDate(transplantDate)}) is before last frost (${formatDate(lastFrostDate)}). Consider protection or delay planting.`
    ] : [],
    succession: Array.from({ length: maxSuccessions }, (_, i) => ({
      number: i + 1,
      seedStart: formatDate(addDays(seedStartDate, successionInterval * i)),
      transplant: formatDate(addDays(transplantDate, successionInterval * i)),
      harvest: formatDate(addDays(harvestDate, successionInterval * i))
    })),
    careTasks: [
      { week: 0, task: 'Start seeds indoors', date: formatDate(seedStartDate) },
      { week: 5, task: 'Begin hardening off', date: formatDate(hardenOffStart) },
      { week: 6, task: 'Transplant to garden', date: formatDate(transplantDate) },
      { week: 8, task: 'Begin fertilizing', date: formatDate(addDays(transplantDate, 14)) },
      { week: 10, task: 'Prune suckers, add support', date: formatDate(addDays(transplantDate, 28)) },
      { week: 12, task: 'Watch for first fruits', date: formatDate(addDays(transplantDate, 42)) }
    ]
  };

  // Add biodynamic calendar integration point (placeholder)
  if (useBiodynamic) {
    schedule.biodynamic = {
      note: 'Biodynamic planting dates would be calculated here based on lunar calendar',
      optimalSeedingDays: 'Fruit days when moon is in fire signs',
      optimalTransplantDays: 'Descending moon period'
    };
  }

  return schedule;
}

// ===== EXAMPLE USAGE =====

// Example 1: User wants cherry tomatoes by August 1st
const example1 = calculatePlantingSchedule({
  tomatoType: 'cherry',
  targetHarvestDate: '2026-08-01',
  zipCode: '25301',
  desiredYield: 30, // pounds
  useBiodynamic: false
});

console.log('=== CHERRY TOMATO PLAN ===');
console.log('Seed starting:', example1.timeline.seedStart);
console.log('Transplant:', example1.timeline.transplant);
console.log('First harvest:', example1.timeline.firstHarvest);
console.log('Plants needed:', example1.planting.plantsNeeded);
console.log('Expected yield:', example1.expectedYield.total.pounds, 'pounds');
console.log('\n');

// Example 2: Beefsteak tomatoes for fall harvest
const example2 = calculatePlantingSchedule({
  tomatoType: 'beefsteak',
  targetHarvestDate: '2026-09-15',
  zipCode: '25301',
  desiredYield: 50,
  useBiodynamic: true
});

console.log('=== BEEFSTEAK TOMATO PLAN ===');
console.log('Seed starting:', example2.timeline.seedStart);
console.log('Transplant:', example2.timeline.transplant);
console.log('First harvest:', example2.timeline.firstHarvest);
console.log('Plants needed:', example2.planting.plantsNeeded);
console.log('Space required:', Math.ceil(example2.planting.spaceSqFt), 'sq ft');
console.log('\n');

// Example 3: Show succession planting
console.log('=== SUCCESSION PLANTING SCHEDULE ===');
example1.succession.forEach(s => {
  console.log(`Planting ${s.number}: Seed ${s.seedStart}, Harvest ${s.harvest}`);
});

// ===== NEXT STEPS FOR YOUR APP =====
// 1. Expand tomatoVarieties database with ALL Johnny's varieties
// 2. Integrate real frost date API (or build comprehensive zip code database)
// 3. Add biodynamic calendar calculations (moon phases, sidereal zodiac)
// 4. Build UI layer with calendar visualization
// 5. Add companion planting logic
// 6. Integrate harvest management features
// 7. Add pest/disease timing based on planting dates
