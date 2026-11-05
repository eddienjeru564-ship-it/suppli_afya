/**
 * Guides for BF Suma distributors: practical, plain-language articles that answer what people
 * search for. They follow docs/VOICE.md: no health claims, no made-up numbers, no buzzwords, short
 * sentences. Each ends by pointing to the part of Suppli Afya that helps, without overselling.
 */

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  /** Optional short list after the paragraphs. */
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  /** For search results and link previews, under about 155 characters. */
  description: string;
  /** One line under the title on the page and in the guides list. */
  summary: string;
  readMinutes: number;
  published: string;
  updated: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: "sell-bf-suma-products-on-whatsapp",
    title: "How to Sell BF Suma Products on WhatsApp",
    description:
      "A practical guide for BF Suma distributors in Kenya: how to turn \"which one should I take?\" messages on WhatsApp into orders, without sending photo after photo.",
    summary: "Turn \"which one should I take?\" into an order, without sending photo after photo.",
    readMinutes: 5,
    published: "2026-11-05",
    updated: "2026-11-05",
    sections: [
      {
        heading: "Most sales start with one question",
        paragraphs: [
          "If you sell BF Suma products, you know the message. Someone sees your WhatsApp status and writes: \"Which one should I take?\" It's a good sign. They're interested, and they trust you enough to ask.",
          "What happens next decides whether they buy. Many distributors reply with photos of five products and a price list. The customer looks, says \"let me think about it\", and the chat goes quiet.",
          "The problem isn't the products or the price. A list of products asks the customer to choose alone, and most people won't.",
        ],
      },
      {
        heading: "Ask before you recommend",
        paragraphs: [
          "A good recommendation starts with a few questions. What are they hoping to change? How is their day: their sleep, their meals, how much water they drink? Do they take any medicines, or are they pregnant?",
          "These questions do two things. They show the customer you care about getting it right. And they give you what you need to suggest one or two products with a reason, instead of five without one.",
          "Keep it short. Three or four questions in a chat is plenty. If someone mentions a medical condition or medicines, suggest they check with their doctor or pharmacist before starting anything new.",
        ],
      },
      {
        heading: "Give one clear suggestion, with a reason",
        paragraphs: [
          "When you reply, lead with what you heard, then the suggestion. For example: \"You said you're often tired by mid-afternoon and you skip breakfast. I'd start with one product, and here's why.\"",
          "One or two products with a reason is easier to say yes to than a catalogue. Include the price, how long a pack lasts and how to take it. Then ask a simple question: \"Shall I set one aside for you?\"",
        ],
      },
      {
        heading: "Make it easy to order",
        paragraphs: [
          "Once they say yes, remove every small obstacle. Confirm the total, how they'll pay and when it arrives. M-Pesa is what most customers expect, so share your number or Till clearly in one message.",
          "Write down what they bought and when. You'll need it in a few weeks, when the pack is about to run out.",
        ],
        list: [
          "Confirm the products, the total and the delivery day in one message",
          "Share how to pay by M-Pesa, clearly, once",
          "Note the date, so you know when they'll need more",
        ],
      },
      {
        heading: "Where Suppli Afya helps",
        paragraphs: [
          "Suppli Afya gives you your own page with your name on it. Customers answer a short assessment there and see which products may suit them, with the reasons. Then they message you on WhatsApp with their answers already written.",
          "You still do the selling, on your own WhatsApp. You just start every conversation knowing what the customer needs.",
        ],
      },
    ],
  },
  {
    slug: "follow-up-with-customers",
    title: "How to Follow Up With Customers Without Being Pushy",
    description:
      "Follow-up messages for BF Suma distributors: when to send them, what to say, and how to keep track of who needs you today.",
    summary: "When to message, what to say, and how to keep track of who needs you today.",
    readMinutes: 4,
    published: "2026-11-05",
    updated: "2026-11-05",
    sections: [
      {
        heading: "Most sales are lost after the first chat",
        paragraphs: [
          "A customer asks about a product, says \"let me think about it\", and you both get busy. A week later, neither of you remembers. The interest was real, but nobody followed up.",
          "Following up isn't being pushy. It's being helpful at the right time. The trick is knowing who to message, when, and what to say.",
        ],
      },
      {
        heading: "Five moments worth a message",
        paragraphs: ["Each of these is a natural reason to reach out. None of them needs a sales pitch."],
        list: [
          "Someone asked but hasn't bought yet: a day or two later, ask if they have any questions",
          "An order isn't paid: a gentle reminder a few days on, with the amount and the date",
          "A customer started a product two weeks ago: ask how they're finding it",
          "A pack is about to run out: ask if they'd like the next one set aside",
          "A regular customer has gone quiet: a friendly hello, with no product in it",
        ],
      },
      {
        heading: "What to say",
        paragraphs: [
          "Keep follow-ups short, personal and about them. Use their name. Mention what they bought or asked about, so they know you remember.",
          "For example: \"Hi Sarah, it's been two weeks on the coffee. How are you finding it?\" Or: \"Hi John, your tablets should be running low about now. Shall I set the next pack aside?\"",
          "Never promise what a product will do for their health. If someone tells you about a health problem, the kind answer is to suggest they speak to a doctor.",
        ],
      },
      {
        heading: "Keep a list, not a memory",
        paragraphs: [
          "Most distributors keep track in their heads, a notebook or old chats. That works for ten customers. It breaks at fifty.",
          "Each morning, you need a short list: who to message today, and why. Write down every order with its date, and every customer who asked but didn't buy. Check the list before you start your day.",
        ],
      },
      {
        heading: "Where Suppli Afya helps",
        paragraphs: [
          "Suppli Afya makes that list for you. Each morning your app shows who needs you today and why, each with a WhatsApp message ready to send. Customers who are about to run out can also get a short reminder text, signed with your name.",
        ],
      },
    ],
  },
  {
    slug: "get-repeat-orders",
    title: "How BF Suma Distributors Can Get More Repeat Orders",
    description:
      "Repeat orders are where a distributor's income grows. How to know when customers will run out, and how to be there before they buy elsewhere.",
    summary: "Know when customers will run out, and be there before they buy elsewhere.",
    readMinutes: 4,
    published: "2026-11-05",
    updated: "2026-11-05",
    sections: [
      {
        heading: "Your best customers already know you",
        paragraphs: [
          "Finding a new customer takes time: posts, chats, questions, trust. A customer who has already bought from you and liked it is much easier to serve again.",
          "Yet many repeat orders never happen. The customer runs out, gets busy, and either forgets or buys from whoever is in front of them that day.",
        ],
      },
      {
        heading: "Know when each customer will run out",
        paragraphs: [
          "Every pack has a rough life. A pack of 60 capsules taken twice a day lasts about a month. A box of 15 sachets taken once a day lasts about two weeks.",
          "When you record an order, note the date and work out when it will run out. A few days before that date is the best time to get in touch.",
        ],
      },
      {
        heading: "Reach out a few days early",
        paragraphs: [
          "Message before they run out, not after. Before, you're helping them keep going. After, they may already have stopped, or bought elsewhere.",
          "Keep it simple: \"Hi Grace, your capsules should be running low this week. Shall I set the next pack aside?\" A yes takes them a second.",
        ],
      },
      {
        heading: "Make paying and receiving easy",
        paragraphs: [
          "Repeat customers value convenience. Confirm the total, the M-Pesa details and the delivery day in one message. If they usually order the same thing, say so: \"Same as last time?\"",
        ],
      },
      {
        heading: "Where Suppli Afya helps",
        paragraphs: [
          "Suppli Afya works out when each customer is likely to run out from what they bought. A few days before, it puts them on your morning list with a message ready to send, and it can send them a short reminder text in your name.",
          "Customers can also reorder from your own shop page at any time, and their order comes straight to your WhatsApp.",
        ],
      },
    ],
  },
];

export const GUIDES_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g])) as Record<string, Guide>;
