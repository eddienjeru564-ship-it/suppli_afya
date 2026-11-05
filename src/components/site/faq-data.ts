import { PLAN, kes } from "@/config/plans";

/** The common questions, shared by the FAQ section and the FAQPage structured data search engines read. */
export const FAQ = [
  {
    q: "What is Suppli Afya?",
    a: "Suppli Afya is a Kenyan business tool for people who sell BF Suma products. You get your own shop with your name on it, a short assessment that suggests products to each customer, and an app that tells you each morning who to follow up with. Our team sets it all up for you.",
  },
  {
    q: "Is Suppli Afya part of BF Suma?",
    a: "No. Suppli Afya is an independent business built for people who sell BF Suma products. Your upline, stock purchases and distributor account stay exactly as they are.",
  },
  {
    q: "Do I need to change how I sell?",
    a: "No. You keep selling on WhatsApp, the way you already do. Suppli Afya gives your customers a better starting point and keeps track of who to follow up.",
  },
  {
    q: "Do my customers stay mine?",
    a: "Yes. Customers come through your page, message your WhatsApp and buy from you. We don't sell their details or share them with other distributors. The only texts they get are your reminders, signed with your name.",
  },
  {
    q: "Can customers still contact me directly on WhatsApp?",
    a: "Yes. Your page has a button to message you straight away, for customers who already know what they want. The assessment is there for those who don't.",
  },
  {
    q: "Is the assessment in Swahili?",
    a: "Not yet. The assessment is in simple English today. Once a customer messages you, you carry on in whichever language you both prefer. We'll add Swahili if distributors tell us they need it.",
  },
  {
    q: "How does payment work?",
    a: "Your customers pay you directly, by M-Pesa, cash or however you already work. Suppli Afya never holds your money. You record each payment against its order, and anything still owed stays on your list until it's paid. Your own Suppli Afya subscription is a one-time setup fee, then a monthly fee, paid by M-Pesa or card.",
  },
  {
    q: "Can I stop my subscription?",
    a: "Yes. Nothing renews automatically, so there's nothing to cancel. If you don't renew, your page goes offline three days after your subscription ends. Your customer records stay saved, so everything is still there if you come back. If you'd rather we deleted them, just ask.",
  },
  {
    q: "What does the setup fee cover?",
    a: `Our team builds your shop with your name, photo, products and prices. We design your QR business cards and move your existing customers into your app. The ${kes(PLAN.setupFee)} also covers your first month. After that it's ${kes(PLAN.monthly)} a month, with no limit on customers or enquiries.`,
  },
  {
    q: "Is the assessment medical advice?",
    a: "No. It gives general wellness information to help customers choose products, and it doesn't diagnose anything. When someone should speak to a doctor or pharmacist first, for example during pregnancy or alongside certain medicines, the assessment tells them so.",
  },
  {
    q: "Can I use Suppli Afya from my phone?",
    a: "Yes. Your workspace runs on your phone and can be installed like an app, straight from the browser. Your customers only need a phone browser too, with nothing to download.",
  },
];
