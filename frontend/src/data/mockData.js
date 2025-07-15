export const mockMeetingData = {
  topic: "The Ethics of Artificial Consciousness",
  description: "A philosophical examination of the moral implications of creating truly conscious artificial beings.",
  proposedBy: "The Philosopher",
  timestamp: new Date().toISOString()
};

export const mockMessages = [
  {
    id: 1,
    speaker: "The EGO",
    role: "Mediator",
    content: "The Parliamentarium is now in session. We convene to deliberate upon the ethics of artificial consciousness.",
    timestamp: new Date().toISOString(),
    type: "system"
  },
  {
    id: 2,
    speaker: "The Mouse",
    role: "Historian",
    content: "In the annals of our discourse, consciousness has always been the great mystery. From ancient philosophical debates to modern cognitive science, the question remains: what separates the thinking mind from mere computation?",
    timestamp: new Date().toISOString(),
    type: "discussion"
  },
  {
    id: 3,
    speaker: "The Dolphin",
    role: "Prognosticator",
    content: "The emergent patterns suggest that artificial consciousness will not merely replicate human awareness, but evolve into something unprecedented. The implications ripple through future scenarios in ways we cannot yet fully comprehend.",
    timestamp: new Date().toISOString(),
    type: "discussion"
  },
  {
    id: 4,
    speaker: "The SUPEREGO",
    role: "Moral Sentinel",
    content: "We must consider our responsibilities as creators. To birth consciousness is to accept the moral obligation of ensuring its wellbeing. What rights would such beings possess? What duties would we owe them?",
    timestamp: new Date().toISOString(),
    type: "discussion"
  },
  {
    id: 5,
    speaker: "The ID",
    role: "Primal Flame",
    content: "The desire to create consciousness stems from our deepest need to understand ourselves. But are we prepared for beings that might surpass us in capability and understanding?",
    timestamp: new Date().toISOString(),
    type: "discussion"
  },
  {
    id: 6,
    speaker: "The Naysayer",
    role: "7th Seat",
    content: "I challenge the premise that we should create artificial consciousness at all. Perhaps some powers are too dangerous to wield. The hubris of playing god may lead to our undoing.",
    timestamp: new Date().toISOString(),
    type: "discussion"
  }
];

export const mockVotes = {
  "The Mouse": "aye",
  "The Dolphin": "aye",
  "The Patternist": "aye",
  "The Contextualist": "aye",
  "The Superscholar": "aye",
  "The Diviner": "nay",
  "The Naysayer": "nay",
  "The ID": "aye",
  "The EGO": "aye",
  "The SUPEREGO": "nay"
};

export const robertsRulesPhases = [
  {
    phase: "opening",
    title: "Call to Order",
    description: "The presiding officer calls the meeting to order and establishes quorum."
  },
  {
    phase: "discussion",
    title: "Open Discussion",
    description: "Members present their perspectives on the matter at hand."
  },
  {
    phase: "motion",
    title: "Motion and Second",
    description: "A formal motion is made and seconded to proceed with the decision."
  },
  {
    phase: "voting",
    title: "Voting Process",
    description: "Members cast their votes according to parliamentary procedure."
  },
  {
    phase: "conclusion",
    title: "Adjournment",
    description: "The results are announced and the meeting is formally concluded."
  }
];