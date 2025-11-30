# Prompt Horizon: Just-in-Time Learning for AI Mastery

## The Pitch

Most users are stuck in a local maximum with AI. They found a few patterns that work and repeat them, unaware of the vast landscape of possibilities just beyond their current habits. Traditional solutions—tutorials, tooltips, documentation—fail because they're disconnected from the moment of motivation.

**Prompt Horizon** embeds learning into the act of prompting itself. As users compose their prompts, subtle suggestions surface adjacent possibilities—ways to reframe, expand, or deepen their request. Users remain in control; they type everything themselves. But they're gently made aware of edges they didn't know existed.

Over time, their explorations are reflected back to them as a visual map—not a scoreboard of achievements, but a mirror of their journey. The map shows where they've been, and invites curiosity about where they haven't.

The result: users who don't just use AI more, but use it *better*—with greater range, confidence, and creativity.

---

## Core Principles

**Learning by doing, not reading.** Suggestions point toward possibilities; users must act on them themselves. Typing something yourself encodes learning in a way that clicking a button never can.

**Expansive, not corrective.** Chips never imply the user is wrong. They whisper "you could also..." rather than "you should have..."

**In the flow, not beside it.** Learning happens during real work toward real goals, not in separate tutorials or sandboxes.

**The map is a mirror, not a scoreboard.** Progress is reflected through visual depth, not numbers. The system recognizes your journey without prescribing what it should be.

---

## How It Works

### 1. Just-in-Time Suggestion Chips

As users pause while composing a prompt (debounced ~800ms), the system analyzes their partial prompt and surfaces 1-3 small chips below the text input.

**What the chips look like:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ What constraints matter here?  ·  Claude could ask you first       │
└─────────────────────────────────────────────────────────────────────┘
```

**Chip characteristics:**
- Compact, single-line, muted visual presence
- Maximum 2-3 visible at once
- Subtle fade-in animation (arrives, doesn't interrupt)
- Easily dismissable

**Language principles:**
- Plain language describing benefit, not jargon naming features
- Possibility framing: "You could..." / "What if..." / "Claude could..."
- Questions that prompt reflection, not offers to take action

**Examples:**

| Mastery | Chip text |
|---------|-----------|
| Socratic Mode | "What if Claude asked the questions first?" |
| Constraint Specification | "What constraints matter here?" |
| Artifact Creation | "Claude could make this a document you can edit" |
| Iterative Refinement | "This could be a starting point" |
| Thinking Partner | "You could ask Claude to push back on this" |
| Extended Thinking | "Claude could reason through this slowly" |
| Context Loading | "What context would help Claude here?" |
| Role Framing | "Who should Claude be for this?" |

### 2. Expandable Detail

Clicking a chip expands it to show a tailored example—generated from the user's actual prompt.

```
┌─────────────────────────────────────────────────────────────────────┐
│ What if Claude asked the questions first?                          │
│                                                                     │
│ Try something like:                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ "Before suggesting solutions, ask me 5 questions about what    │ │
│ │  I've already tried and what constraints I'm working with."    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Why this works →                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Key detail:** The example is illustrative, not insertable. Users read it, then type their own version. This preserves active learning.

**"Why this works"** links to a deeper explanation for curious users, but the primary interaction is seeing the example.

### 3. Satisfaction Detection

As the user continues typing, the system checks whether they've addressed what the chip suggested.

**When satisfied:**

```
┌─────────────────────────────────────────────┐
│ ✓ Socratic Mode                             │
└─────────────────────────────────────────────┘
```

The chip transforms: a checkmark appears, the mastery name is revealed (teaching vocabulary), and the chip fades out with a subtle, satisfying animation.

**What this achieves:**
- Confirms the user did something meaningful
- Introduces the term for what they just learned
- Creates a quiet moment of recognition without gamification

### 4. Background Mastery Tracking

Behind the scenes, the system tracks:
- Which masteries have been surfaced to this user
- Which have been satisfied, and how many times
- When a mastery crosses its learning threshold (typically 3-5 satisfactions)

Once a mastery is "learned," the system stops surfacing it—trusting the user now has it in their repertoire.

**No numbers are shown to the user.** Progress is internal, used only to personalize future suggestions and feed the map visualization.

### 5. The Mastery Map

A separate view (accessible from profile or settings) visualizes the user's AI capability landscape.

**Visual representation:**
- Regions representing mastery categories (Interaction Patterns, Prompt Craft, Capabilities, etc.)
- Nodes within regions for individual masteries
- Visual density indicates depth of practice:
  - Unexplored: Faded, desaturated, hazy
  - Tried once: Faint color, low opacity
  - Practiced: More saturated, solidifying
  - Learned: Full color, crisp edges

**The map invites exploration** by making the unexplored visible *as* unexplored. Users see the edges of their knowledge and feel natural curiosity about what lies beyond.

---

## Mastery Architecture

Each mastery is defined in a markdown file with a structured format:

```markdown
# /masteries/interaction/socratic-mode.md

---
id: interaction/socratic-mode
name: Socratic Mode
category: Interaction Patterns
learning_threshold: 3
---

## Chip

What if Claude asked the questions first?

## Triggers

- User prompt suggests uncertainty or open-ended exploration
- User is describing a problem without clear constraints
- User asks "how do I" or "what should I" type questions
- User seems unsure what they actually want

## Satisfaction

- Prompt asks Claude to ask questions before solving
- Phrases: "ask me", "what questions", "before solving", "help me figure out", "interview me", "what do you need to know"

## Detail

Asking Claude to interview you before solving flips the dynamic. Instead of guessing what you need, Claude surfaces your assumptions, constraints, and hidden requirements.
```

**Nesting:** Masteries use slash-path IDs (e.g., `capabilities/artifacts/canvas-editing`) to represent hierarchy. Top-level categories contain specific skills.

**Example hierarchy:**

```
interaction/
  socratic-mode
  iterative-refinement
  thinking-partner

prompt-craft/
  constraint-specification
  context-loading
  role-framing

capabilities/
  artifacts/
    create-basic
    canvas-editing
  extended-thinking
  multi-modal-input
  web-search
```

**Data split:** The mastery loader extracts fields for different purposes:
- Sent to Claude for analysis: `id`, `triggers`, `satisfaction`
- Kept on frontend for display: `id`, `name`, `chip_text`, `category`, `detail`, `learning_threshold`

This minimizes tokens sent to Claude while keeping all display content available client-side.

---

## Prompt Analysis System

### Analysis Prompt

When the user pauses typing (debounced ~800ms), we send their partial prompt to Claude along with the mastery catalog. The prompt uses XML delimiters for clean parsing:

```xml
<task>
Analyze the user's partial prompt to identify relevant mastery suggestions and check if any active suggestions have been satisfied.

For surfacing: identify 0-3 masteries relevant to what the user seems to be trying to do. Only suggest masteries not already in active_chips. Be conservative—only surface genuinely relevant suggestions.

For satisfaction: check if the user's prompt now demonstrates the behavior described in any active chip's satisfaction criteria.
</task>

<partial_prompt>
{{PARTIAL_PROMPT}}
</partial_prompt>

<masteries>
{{MASTERIES_JSON}}
</masteries>

<active_chips>
{{ACTIVE_CHIPS_JSON}}
</active_chips>
```

### Masteries JSON (Sent to Claude)

Trimmed to only what Claude needs for analysis:

```json
[
  {
    "id": "interaction/socratic-mode",
    "triggers": "User prompt suggests uncertainty or open-ended exploration. User is describing a problem without clear constraints. User asks 'how do I' or 'what should I' type questions.",
    "satisfaction": "Prompt asks Claude to ask questions before solving. Phrases like 'ask me', 'what questions', 'before solving', 'interview me'."
  },
  {
    "id": "prompt-craft/constraint-specification",
    "triggers": "User is asking for creative or open-ended output. User hasn't specified format, length, tone, or audience.",
    "satisfaction": "User specifies boundaries: format, length, tone, audience, what to avoid, or other constraints."
  }
]
```

### Active Chips JSON

Tracks what's currently displayed to the user:

```json
[
  {
    "mastery_id": "prompt-craft/constraint-specification",
    "surfaced_at": "2024-01-15T10:30:00Z"
  }
]
```

### Structured Output Schema

Using Vercel AI SDK / Claude API structured output (no JSON instructions needed in prompt):

```typescript
const analysisSchema = z.object({
  surface: z.array(z.object({
    mastery_id: z.string(),
    relevance: z.enum(["high", "medium"]),
    reason: z.string()
  })).max(3),
  satisfied: z.array(z.object({
    mastery_id: z.string(),
    evidence: z.string()
  }))
});
```

### Detail Generation Prompt

When a user clicks to expand a chip, a separate call generates a tailored example:

```xml
<task>
Generate a brief, tailored example showing how the user could apply this mastery to their specific prompt. Keep to 1-2 sentences. Write it as something they could actually type.
</task>

<partial_prompt>
{{PARTIAL_PROMPT}}
</partial_prompt>

<mastery>
{{MASTERY_DETAIL}}
</mastery>
```

```typescript
const detailSchema = z.object({
  example: z.string()
});
```

---

## System Flow

```
User types → debounce (800ms) → Analysis Prompt
                                      ↓
                              ┌───────────────────┐
                              │ Claude returns:   │
                              │ surface: [...]    │
                              │ satisfied: [...]  │
                              └───────────────────┘
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
            Show new chips                    Animate satisfied chips
         (resolve display content             (show checkmark + name,
          from frontend by ID)                      then fade)
                                                       ↓
                                              Update mastery store
                                              (increment count)

User clicks chip → Detail Prompt → Show tailored example
```

---

## Implementation Plan

### Phase 1: Core Chip Experience

**Build the modified prompt input component:**
- Text input area with chip display zone below text, above toolbar
- Chips render as subtle, rounded pills
- Support for 1-3 chips, horizontal layout
- Dismiss button on each chip
- Expand/collapse interaction for detail view

**Implement debounced prompt analysis:**
- On typing pause (~800ms), send partial prompt to Claude
- Include list of available masteries with their triggers
- Claude returns 0-3 most relevant masteries
- Display corresponding chips

**Implement satisfaction checking:**
- On continued typing, periodically check if active chips are satisfied
- Send chip's satisfaction criteria + current prompt to Claude
- If satisfied: trigger satisfaction animation, fade chip, log event

**Create initial mastery files:**
- Write 10-15 mastery definitions covering:
  - Interaction patterns (3-4)
  - Prompt craft (3-4)
  - Capability awareness (4-5)
- Include chip text, detail prompts, triggers, satisfaction criteria

### Phase 2: Tracking & Persistence

**Build mastery tracking store:**
- Track per-user: masteries encountered, satisfied, satisfaction count
- Persist to local storage (prototype) or database (production)
- Calculate "learned" status based on threshold

**Personalize chip surfacing:**
- Filter out learned masteries from suggestions
- Potentially weight toward masteries user hasn't encountered yet

### Phase 3: Map Visualization (Stretch)

**Build map view component:**
- Visual layout of mastery categories as regions
- Individual masteries as nodes within regions
- Visual density based on practice depth
- Hover states showing mastery name/description
- Click to see details or start a conversation exploring that capability

**Polish map aesthetics:**
- Fog of war / unexplored haziness
- Smooth transitions as masteries are learned
- Satisfying visual feedback when new areas are explored

---

## Technical Components

```
/masteries
  /interaction
    socratic-mode.md
    iterative-refinement.md
    thinking-partner.md
  /prompt-craft
    constraint-specification.md
    context-loading.md
    role-framing.md
  /capabilities
    artifact-creation.md
    extended-thinking.md
    multi-modal-input.md
    web-search.md

/src
  /components
    PromptInput.tsx          # Modified input with chip area
    MasteryChip.tsx          # Individual chip component
    ChipDetail.tsx           # Expanded detail view
    MasteryMap.tsx           # Map visualization (Phase 3)
  
  /hooks
    usePromptAnalysis.ts     # Debounced Claude calls for suggestions
    useSatisfactionCheck.ts  # Check if chips are satisfied
    useMasteryStore.ts       # Track user's mastery progress
  
  /lib
    masteryLoader.ts         # Parse mastery markdown files
    claudeApi.ts             # API wrapper for Claude calls
  
  /stores
    masteryProgress.ts       # User's mastery state
```

---

## Measuring Success

Traditional metrics (time on site, messages sent) don't capture what we care about. Instead:

**Capability breadth:** Are users exploring more mastery areas over time?

**Capability depth:** Are users reaching "learned" status on masteries they engage with?

**Organic adoption:** After chips stop surfacing for a mastery, do users continue using that pattern unprompted?

**Prompt sophistication:** Are prompts becoming richer in context, constraints, and intentionality?

**Self-reported confidence:** Do users feel more capable and creative with AI over time?

---

## What This Is Not

**Not a tutorial system.** No step-by-step lessons, no required curriculum.

**Not gamification.** No points, badges, streaks, or leaderboards.

**Not prescriptive.** The system never tells users what they *should* do—only what they *could*.

**Not interruptive.** Chips are peripheral and dismissable. The user's flow is sacred.

---

## Summary

Prompt Horizon meets users where they are—in the act of composing a prompt—and gently expands their awareness of what's possible. By making suggestions contextual, actionable, and optional, it transforms every interaction into a learning opportunity without ever feeling like a lesson.

The map reflects their growth back to them, inviting continued exploration not through manufactured incentives, but through genuine curiosity about the edges of their own knowledge.

The result is users who don't just use AI—they master it.
