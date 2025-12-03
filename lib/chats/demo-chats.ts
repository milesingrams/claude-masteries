import type { Chat } from "@/lib/types";

// Demo chats for a Product Designer using Claude
export const demoChats: Chat[] = [
  {
    id: "demo-1",
    title: "Design system color tokens",
    messages: [
      {
        id: "demo-1-1",
        role: "user",
        content:
          "I'm building a design system and need to create semantic color tokens. We have a primary blue (#2563EB) and want to generate a full palette with proper naming.",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: "demo-1-2",
        role: "assistant",
        content:
          "I'll help you create semantic color tokens from your primary blue. Here's a suggested structure:\n\n**Base Palette (from #2563EB)**\n- `blue-50`: #EFF6FF\n- `blue-100`: #DBEAFE\n- `blue-500`: #2563EB (your primary)\n- `blue-600`: #1D4ED8\n- `blue-900`: #1E3A8A\n\n**Semantic Tokens**\n- `color-primary`: blue-500\n- `color-primary-hover`: blue-600\n- `color-primary-subtle`: blue-50\n- `color-focus-ring`: blue-500/50\n\nWant me to generate the full scale with all 10 steps, or focus on the semantic mapping first?",
        createdAt: new Date(Date.now() - 86400000 * 2 + 30000),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2 + 30000),
  },
  {
    id: "demo-2",
    title: "Usability test script",
    messages: [
      {
        id: "demo-2-1",
        role: "user",
        content:
          "Need to write a usability test script for our new checkout flow. 5 participants, 30 min sessions.",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "demo-2-2",
        role: "assistant",
        content:
          "Here's a 30-minute usability test script for your checkout flow:\n\n**Intro (3 min)**\n- Welcome, explain think-aloud protocol\n- \"There are no wrong answers—we're testing the design, not you\"\n\n**Warm-up (2 min)**\n- \"Tell me about your last online purchase\"\n\n**Tasks (20 min)**\n1. Add item to cart and proceed to checkout\n2. Enter shipping information\n3. Select shipping method\n4. Complete payment\n\n**Wrap-up (5 min)**\n- Overall impressions\n- \"What would you change?\"\n\nShould I add specific probe questions for each task?",
        createdAt: new Date(Date.now() - 86400000 + 45000),
      },
    ],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000 + 45000),
  },
  {
    id: "demo-3",
    title: "Apartment plant recommendations",
    messages: [
      {
        id: "demo-3-1",
        role: "user",
        content:
          "My apartment gets indirect light and I travel a lot. What plants would actually survive?",
        createdAt: new Date(Date.now() - 43200000),
      },
      {
        id: "demo-3-2",
        role: "assistant",
        content:
          "For indirect light + frequent travel, these are nearly indestructible:\n\n**Top picks:**\n- **ZZ Plant** - Thrives on neglect, water every 2-3 weeks\n- **Snake Plant** - Goes weeks without water, tolerates low light\n- **Pothos** - Trailing vine, very forgiving, tells you when thirsty (leaves droop)\n\n**Bonus:** Get a self-watering planter or terracotta pot (dries evenly) to extend time between waterings.\n\nHow long are your typical trips?",
        createdAt: new Date(Date.now() - 43200000 + 20000),
      },
    ],
    createdAt: new Date(Date.now() - 43200000),
    updatedAt: new Date(Date.now() - 43200000 + 20000),
  },
  {
    id: "demo-4",
    title: "Component API feedback",
    messages: [
      {
        id: "demo-4-1",
        role: "user",
        content:
          "Reviewing this Button component API. Does this make sense?\n\n<Button variant=\"primary\" size=\"md\" isLoading disabled>Submit</Button>",
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: "demo-4-2",
        role: "assistant",
        content:
          "The API looks solid. A few thoughts:\n\n**Good:**\n- `variant` and `size` are standard, intuitive\n- `isLoading` is clear\n\n**Consider:**\n- `disabled` + `isLoading` together—loading usually implies disabled. Maybe `isLoading` auto-disables?\n- Some teams prefer `loading` over `isLoading` (shorter, HTML attributes don't use \"is\")\n\n**Question:** Will you need `leftIcon`/`rightIcon` props, or handle that with children?",
        createdAt: new Date(Date.now() - 7200000 + 25000),
      },
    ],
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 7200000 + 25000),
  },
  {
    id: "demo-5",
    title: "Gift ideas for dad",
    messages: [
      {
        id: "demo-5-1",
        role: "user",
        content: "Dad's birthday coming up. He likes woodworking and jazz. Budget around $100.",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: "demo-5-2",
        role: "assistant",
        content:
          "Nice combo! Some ideas:\n\n**Woodworking:**\n- Veritas marking gauge (~$50) - precision tool, great gift\n- Japanese pull saw (~$40) - different cutting experience\n- Wood identification book + sample set (~$35)\n\n**Jazz:**\n- Blue Note vinyl reissue (~$30)\n- Tickets to a local jazz show\n- \"But Beautiful\" by Geoff Dyer - essays on jazz legends (~$15)\n\n**Combo idea:** Nice bluetooth speaker for the workshop (~$80) so he can listen while working.\n\nKnow what tools he already has?",
        createdAt: new Date(Date.now() - 3600000 + 30000),
      },
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000 + 30000),
  },
];
