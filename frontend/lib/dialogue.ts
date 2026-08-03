export const CREW_DIALOGUE = {
  login: [
    "Welcome aboard.",
    "I'm glad you're here.",
    "Let's see how I can help today.",
    "Whenever you're ready.",
  ],
  create: [
    "Tell me what's been troubling you.",
    "Describe the situation in your own words.",
    "Take your time.",
    "Every concern deserves attention.",
  ],
  viewing: [
    "Let's understand what happened.",
    "There's always more beneath the surface.",
    "I think we're missing part of the picture.",
    "Let's review this together.",
  ],
  resolved: [
    "I'm happy we could help.",
    "I hope things are a little easier now.",
    "Thank you for looking after the crew.",
  ],
} as const;

export const OFFICER_DIALOGUE = {
  // Also reused as the default line set for the kanban board overview
  // (logged in, no ticket open) — no dedicated set was specified for that state yet.
  login: [
    'Make it so.',
    'Engage.',
    'The bridge is yours, Commander.',
  ],
  blue: [
    'Proceed when ready.',
    'Carry on.',
    "Let's keep the ship running smoothly.",
  ],
  yellow: [
    'Yellow Alert.',
    "Let's evaluate the situation.",
    'Stay focused.',
    'Every detail matters.',
  ],
  red: [
    'Red Alert!',
    'Shields up.',
    'Arm photon torpedoes.',
    'All hands to battle stations.',
  ],
  resolved: [
    'Well done.',
    'Make it so.',
    'Carry on.',
  ],
} as const;

export type CrewScene = keyof typeof CREW_DIALOGUE;
export type OfficerScene = keyof typeof OFFICER_DIALOGUE;
