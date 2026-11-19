const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

async function main() {
  // Read services data directly from DB to inspect
  const services = await prisma.service.findMany();
  console.log("Current services in DB:", services.map((s) => s.slug));

  // Speech Therapy rich data to sync
  const speechData = {
    tagline: "Fun, effective speech & language therapy combining SLP expertise with ABA practices.",
    badge: "Communication Care",
    clinicalLead: "April Adebayo (Registered Speech & Language Pathologist - SLP)",
    ageGroup: "Toddler to Youth",
    sessionFormat: "1:1 Clinical Speech & AAC Therapy",
    duration: "45 to 60 Min Sessions",
    image: "/hero_speech_therapy.jpg",
    shortDescription:
      "Trusted standardized assessments and individualized treatment combining Speech-Language Pathology (SLP) and ABA practices to make communication fun and effective.",
    overviewParagraphs: JSON.stringify([
      "Our Registered Speech and Language Pathologist (SLP), April Adebayo, provides trusted standardized assessments and individualized treatment in combination with ABA practices to target each child's communication goals.",
      "At Radiant Autism Center, our speech services are all about making communication fun and effective. Using evidence-based methods and standardized assessments, we create engaging activities that help children improve their speech, articulation, fluency, and expressive language.",
      "By combining SLP practices with ABA methods, our goal is to build confidence and communication abilities in a supportive environment. Every child's progress is closely monitored. (Covered with OAP funding)."
    ]),
    features: JSON.stringify([
      "Registered SLP Lead",
      "Language & Articulation Skills",
      "Combined SLP + ABA Methods"
    ]),
    whoNeedsThis: JSON.stringify({
      subtitle: "Speech Therapy is recommended if your child demonstrates:",
      signs: [
        "Speech delays or difficulty pronouncing words clearly (articulation)",
        "Challenges understanding language instructions or expressing thoughts",
        "Need for Alternative and Augmentative Communication (AAC) device training",
        "Stuttering, fluency challenges, or oral-motor coordination difficulties",
        "Social pragmatics and conversational communication barriers"
      ]
    }),
    keyBenefits: JSON.stringify([
      {
        title: "Clear Articulation & Speech",
        description: "Enhancing pronunciation, sound clarity, and verbal confidence."
      },
      {
        title: "Expressive & Receptive Language",
        description: "Expanding vocabulary, sentence building, and comprehension skills."
      },
      {
        title: "AAC Device Setup & Training",
        description: "Integrating speech-generating tablets and visual communication systems."
      },
      {
        title: "Social Communication & Pragmatics",
        description: "Building conversational turn-taking, eye contact, and peer play dialogue."
      }
    ]),
    faqs: JSON.stringify([
      {
        question: "What age group is eligible for speech therapy?",
        answer: "We support children from early toddlers (as young as 18 months) through school-age children and youth."
      },
      {
        question: "Can speech therapy be combined with ABA therapy?",
        answer: "Yes, our Speech-Language Pathologist works directly alongside our Registered Behaviour Analysts for cohesive 360-degree care."
      },
      {
        question: "Is Speech Therapy covered under OAP funding?",
        answer: "Yes, Speech-Language Pathology is fully eligible under Core Clinical Services of the Ontario Autism Program (OAP)."
      }
    ])
  };

  await prisma.service.update({
    where: { slug: "speech-therapy" },
    data: speechData
  });
  console.log("Successfully synced speech-therapy rich data into DB!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
