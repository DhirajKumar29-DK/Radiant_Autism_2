const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SERVICES_TO_SYNC = [
  {
    slug: "aba-therapy",
    title: "ABA Therapy (Applied Behavior Analysis)",
    tagline: "Evidence-based Applied Behavior Analysis for autism & developmental goals.",
    badge: "OAP Covered",
    badgeBg: "bg-blue-600",
    iconBg: "bg-blue-600",
    bulletColor: "text-blue-600",
    iconName: "Brain",
    image: "/hero_child_therapy.jpg",
    shortDescription: "Applied Behaviour Analysis (ABA) autism therapy using research-based methods to target verbal skills, self-help, play, social skills, and socially significant goals for ages 2 to 20.",
    overviewParagraphs: JSON.stringify([
      "Applied Behaviour Analysis (ABA) is a scientific approach to understanding and improving behaviour using data and research-based methods. At Radiant Autism Center, our ABA therapy targets each child's socially significant goals, such as verbal skills, academics, self-help, play skills, social skills, and life skills.",
      "We utilize the principles of reinforcement, using play and motivation to increase desired behaviours safely and ethically. All ABA services are supervised by our Registered Behaviour Analyst, Jesenia Duran, ensuring the happiness, trust, and success of each individual.",
      "We work with neurodivergent individuals (autism, ADHD, ADD, ID) as young as 2 years old and up to 20 years old. This program is fully covered under Ontario Autism Program (OAP) funding."
    ]),
    ageGroup: "2 to 20 Years",
    sessionFormat: "1:1 & Small Group Individualized Clinical Sessions",
    duration: "Customized per Individualized Care Plan",
    clinicalLead: "Jesenia Duran, RBA (Registered Behaviour Analyst, Ontario)",
    features: JSON.stringify(["Ages 2 to 20 Years", "Registered Behaviour Analyst", "Target Verbal & Life Skills"]),
    whoNeedsThis: JSON.stringify({
      subtitle: "ABA/IBI Therapy is recommended if your child demonstrates:",
      signs: [
        "Delays in speech, verbal communication, or expressing wants/needs",
        "Difficulty with self-help skills like dressing, feeding, and toilet training",
        "Challenging behaviors at home or school needing structured reinforcement",
        "Challenges in turn-taking, interactive play, or social interaction",
        "Need for data-driven, individualized skill acquisition goals"
      ]
    }),
    keyBenefits: JSON.stringify([
      { title: "Verbal & Communication Growth", description: "Building functional language, speech, and alternative communication tools." },
      { title: "Positive Behavior Reinforcement", description: "Using motivation and play to build constructive, positive behavioral habits." },
      { title: "Self-Help & Academic Skills", description: "Empowering children with daily self-care, focus, and classroom readiness." },
      { title: "OAP Funding Covered", description: "100% eligible for Ontario Autism Program (OAP) funding support." }
    ]),
    faqs: JSON.stringify([
      { question: "What age group is eligible for ABA/IBI therapy?", answer: "We support neurodivergent individuals (Autism, ADHD, ADD, ID) from 2 years old up to 20 years old." },
      { question: "Is ABA Therapy covered by OAP funding?", answer: "Yes, all our ABA/IBI therapy services are covered under Ontario Autism Program (OAP) funding." }
    ]),
    order: 1,
    isActive: true
  },
  {
    slug: "speech-therapy",
    title: "Speech and Language Service (SLP)",
    tagline: "Fun, effective speech & language therapy combining SLP expertise with ABA practices.",
    badge: "Communication Care",
    badgeBg: "bg-teal-600",
    iconBg: "bg-teal-600",
    bulletColor: "text-teal-600",
    iconName: "MessageCircle",
    image: "/hero_speech_therapy.jpg",
    shortDescription: "Trusted standardized assessments and individualized treatment combining Speech-Language Pathology (SLP) and ABA practices to make communication fun and effective.",
    overviewParagraphs: JSON.stringify([
      "Our Registered Speech and Language Pathologist (SLP), April Adebayo, provides trusted standardized assessments and individualized treatment in combination with ABA practices to target each child's communication goals.",
      "At Radiant Autism Center, our speech services are all about making communication fun and effective. Using evidence-based methods and standardized assessments, we create engaging activities that help children improve their speech, articulation, fluency, and expressive language.",
      "By combining SLP practices with ABA methods, our goal is to build confidence and communication abilities in a supportive environment. Every child's progress is closely monitored. (Covered with OAP funding)."
    ]),
    ageGroup: "Toddler to Youth",
    sessionFormat: "1:1 Clinical Speech & AAC Therapy",
    duration: "45 to 60 Min Sessions",
    clinicalLead: "April Adebayo (Registered Speech & Language Pathologist - SLP)",
    features: JSON.stringify(["Registered SLP Lead", "Language & Articulation Skills", "Combined SLP + ABA Methods"]),
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
      { title: "Clear Articulation & Speech", description: "Enhancing pronunciation, sound clarity, and verbal confidence." },
      { title: "Expressive & Receptive Language", description: "Expanding vocabulary, sentence building, and comprehension skills." },
      { title: "AAC Device Setup & Training", description: "Integrating speech-generating tablets and visual communication systems." },
      { title: "Social Communication & Pragmatics", description: "Building conversational turn-taking, eye contact, and peer play dialogue." }
    ]),
    faqs: JSON.stringify([
      { question: "What age group is eligible for speech therapy?", answer: "We support children from early toddlers (as young as 18 months) through school-age children and youth." },
      { question: "Can speech therapy be combined with ABA therapy?", answer: "Yes, our Speech-Language Pathologist works directly alongside our Registered Behaviour Analysts for cohesive 360-degree care." },
      { question: "Is Speech Therapy covered under OAP funding?", answer: "Yes, Speech-Language Pathology is fully eligible under Core Clinical Services of the Ontario Autism Program (OAP)." }
    ]),
    order: 2,
    isActive: true
  },
  {
    slug: "occupational-therapy",
    title: "Occupational Therapy (OT)",
    tagline: "Building fine and gross motor skills, sensory regulation, and daily living independence.",
    badge: "Motor & Sensory",
    badgeBg: "bg-indigo-600",
    iconBg: "bg-indigo-600",
    bulletColor: "text-indigo-600",
    iconName: "Activity",
    image: "/gallery_sensory_gym.jpg",
    shortDescription: "Tailored occupational therapy focusing on fine & gross motor skills, sensory regulation, core strength, handwriting, and building essential daily living independence.",
    overviewParagraphs: JSON.stringify([
      "After a comprehensive assessment, our Registered Occupational Therapist, Saghar Baqizada, tailors services to help your child build essential life skills.",
      "We focus on developing fine motor and gross motor skills, enhancing sensory regulation, strengthening core muscles, and fostering independence in daily activities. Through play-based and evidence-based strategies, we create a supportive environment where your child can thrive.",
      "Whether it's improving handwriting, coordination, or self-care routines, we are here to support every step of their journey. Our goal is to empower children with the tools they need to navigate their world with confidence. (Covered with OAP funding)."
    ]),
    ageGroup: "Children & Youth",
    sessionFormat: "1:1 Sensory Gym & OT Clinical Sessions",
    duration: "45 to 60 Min Sessions",
    clinicalLead: "Saghar Baqizada (Registered Occupational Therapist)",
    features: JSON.stringify(["Registered OT Lead", "Sensory Regulation", "Fine & Gross Motor Skills"]),
    whoNeedsThis: JSON.stringify({
      subtitle: "Occupational Therapy is recommended if your child demonstrates:",
      signs: [
        "Sensory processing sensitivities (overwhelmed by noise, textures, lights)",
        "Difficulty with fine motor skills like holding a pencil, cutting, or buttoning",
        "Gross motor challenges with balance, jumping, catching, or core strength",
        "Trouble staying calm and self-regulating during emotional meltdowns",
        "Delays in mastering independent self-care routines (eating, dressing)"
      ]
    }),
    keyBenefits: JSON.stringify([
      { title: "Sensory Gym Training", description: "Utilizing specialized equipment to help children process sensory inputs comfortably." },
      { title: "Fine & Gross Motor Mastery", description: "Building hand strength, writing precision, balance, and physical coordination." },
      { title: "Independent Daily Routines", description: "Fostering confidence in self-dressing, hygiene, and daily task management." },
      { title: "OAP Funding Covered", description: "Covered under Ontario Autism Program (OAP) funding." }
    ]),
    faqs: JSON.stringify([
      { question: "Who leads the Occupational Therapy program?", answer: "Our Occupational Therapy program is led by Registered Occupational Therapist Saghar Baqizada." },
      { question: "Is Occupational Therapy covered by OAP?", answer: "Yes, all Occupational Therapy services are covered with OAP funding." }
    ]),
    order: 3,
    isActive: true
  },
  {
    slug: "group-programs",
    title: "Group Programs",
    tagline: "Peer socialization, emotional regulation, and group learning for ages 4 to 24.",
    badge: "Social & Emotional",
    badgeBg: "bg-purple-600",
    iconBg: "bg-purple-600",
    bulletColor: "text-purple-600",
    iconName: "Compass",
    image: "/gallery_group_play.jpg",
    shortDescription: "Structured group sessions (RoboSocials, PEERS®, Emotional ABCs®, Mood Masters, Study Buddies) for ages 4-24 to build social skills, emotional regulation, and lasting peer relationships.",
    overviewParagraphs: JSON.stringify([
      "Our group programs offer children, teens, and young adults ages 4-24 with autism and related disorders an opportunity to develop meaningful social and emotional skills in a supportive, engaging environment.",
      "Through evidence-based therapeutic practices, we help participants improve emotional regulation, use coping strategies, and build lasting friendships. Our structured sessions incorporate role-play, guided discussions, and real-world practice to enhance communication, problem-solving, and conflict resolution.",
      "Group offerings include RoboSocials (7-17), PEERS® for Teens (12-17), PEERS® for Young Adults (18-24), Emotional ABCs® for Preteens (8-11), Mood Masters for Teens (12-17), Summer Group Camp (4-12), and Study Buddies (7-12). All covered with OAP funding."
    ]),
    ageGroup: "4 to 24 Years",
    sessionFormat: "Small Peer Groups & Guided Workshops",
    duration: "Weekly Group Modules & Seasonal Camps",
    clinicalLead: "Certified Group Facilitators & RBA Supervisory Team",
    features: JSON.stringify(["Ages 4 to 24 Years", "PEERS® & Emotional ABCs®", "Social Skills & Peer Groups"]),
    whoNeedsThis: JSON.stringify({
      subtitle: "Group Programs are ideal if your child or teen:",
      signs: [
        "Struggles to make or maintain age-appropriate peer friendships",
        "Experiences difficulty regulating emotions during stress or conflict",
        "Needs structured practice with conversational turn-taking and social cues",
        "Wants to participate in evidence-based peer groups like PEERS® or RoboSocials",
        "Benefits from guided group study and cooperative learning environments"
      ]
    }),
    keyBenefits: JSON.stringify([
      { title: "Peer Connection & Friendships", description: "Building authentic, lasting relationships in a safe and supportive group setting." },
      { title: "Evidence-Based Curricula", description: "Utilizing proven frameworks like PEERS®, Emotional ABCs®, and Mood Masters." },
      { title: "Conflict & Emotion Regulation", description: "Learning real-world coping mechanisms for managing frustration and social stress." },
      { title: "OAP Funding Covered", description: "Fully eligible for Ontario Autism Program (OAP) funding support." }
    ]),
    faqs: JSON.stringify([
      { question: "What group programs do you offer?", answer: "We offer RoboSocials (7-17), PEERS® for Teens (12-17), PEERS® for Young Adults (18-24), Emotional ABCs® (8-11), Mood Masters (12-17), Summer Group Camp (4-12), and Study Buddies (7-12)." },
      { question: "Are group programs covered by OAP funding?", answer: "Yes, all our group programs are covered under OAP funding." }
    ]),
    order: 4,
    isActive: true
  },
  {
    slug: "behaviour-consultation",
    title: "Behaviour Consultation",
    tagline: "In-person & online consultation + parent video modules for home behavior management.",
    badge: "Parent & Professional",
    badgeBg: "bg-amber-600",
    iconBg: "bg-amber-600",
    bulletColor: "text-amber-600",
    iconName: "ShieldCheck",
    image: "/about_center_photo.jpg",
    shortDescription: "Personalized behaviour consultations (in-person & online) and self-paced video training modules for parents and professionals to manage problem behaviors, toilet training, and feeding.",
    overviewParagraphs: JSON.stringify([
      "Whether you are a parent facing challenges at home or a professional seeking assistance, Radiant Autism Center offers personalized behaviour consultation. We equip you with the tools and strategies needed to effectively support those who matter most to you.",
      "Our consultation services help families address challenging behaviors and develop independence in the home environment. We also support individual professionals and organizations in developing behaviour treatment goals. Consultations can be provided in person or online.",
      "Additionally, we offer online training programs consisting of short video modules that can be completed at your own pace. Topics include managing problem behaviors at home, toilet training, feeding, parent self-care, and more. (Covered with OAP funding)."
    ]),
    ageGroup: "Parents, Families & Organizations",
    sessionFormat: "In-Person, Online Consultation & Video Modules",
    duration: "1:1 Consultations & Self-Paced Courses",
    clinicalLead: "Clinical Behaviour Consultants & RBA Supervisory Team",
    features: JSON.stringify(["In-Person & Online", "Self-Paced Parent Courses", "Toilet Training & Behaviour"]),
    whoNeedsThis: JSON.stringify({
      subtitle: "Behaviour Consultation is recommended if you need:",
      signs: [
        "Strategies for managing challenging behaviors at home or in public",
        "Step-by-step guidance for successful toilet training or mealtime feeding routines",
        "Professional support for designing behavioral treatment plans in school/care settings",
        "Self-paced online video modules to learn ABA techniques at home",
        "Expert guidance on parent self-care and reducing caregiver stress"
      ]
    }),
    keyBenefits: JSON.stringify([
      { title: "Targeted Home Strategies", description: "Actionable, evidence-based tools to replace frustration with positive home routines." },
      { title: "Toilet & Feeding Solutions", description: "Specialized protocols for toilet training, selective eating, and bedtime routines." },
      { title: "Flexible Formats", description: "Available in-person, via telehealth, or through self-paced video training modules." },
      { title: "OAP Funding Covered", description: "Covered under Ontario Autism Program (OAP) funding." }
    ]),
    faqs: JSON.stringify([
      { question: "Are consultations available online?", answer: "Yes, consultations are offered both in-person and online via telehealth, along with self-paced video modules." },
      { question: "Is Behaviour Consultation covered by OAP?", answer: "Yes, Behaviour Consultation services are covered with OAP funding." }
    ]),
    order: 5,
    isActive: true
  },
  {
    slug: "psychoeducational-assessments",
    title: "Psychoeducational Assessments",
    tagline: "Comprehensive academic, ADHD, and learning disability evaluations for ages 7+.",
    badge: "Academic & IQ",
    badgeBg: "bg-rose-600",
    iconBg: "bg-rose-600",
    bulletColor: "text-rose-600",
    iconName: "ShieldCheck",
    image: "/service_physio.jpg",
    shortDescription: "Comprehensive assessments in collaboration with The PsychoEd Clinic to identify learning disabilities, academic challenges, ADHD, IQ levels, and academic strengths for ages 7+.",
    overviewParagraphs: JSON.stringify([
      "In collaboration with The PsychoEd Clinic, these comprehensive assessments help identify academic challenges, learning disabilities, and/or ADHD, providing valuable insight into learning profiles, IQ levels, and academic strengths and challenges.",
      "Psychoeducational assessments are helpful for children struggling with school and lacking support or accommodations, and to identify potential mental diagnoses. A minimum age of 7 years is required for eligibility.",
      "The process includes an intake meeting, administered questionnaires, an in-person assessment, a written report, and a final feedback meeting. Please note: Psychoeducational assessments are provided in collaboration with a clinical psychologist through The PsychoEd Clinic. They are covered by extended health benefits."
    ]),
    ageGroup: "7 Years and Up",
    sessionFormat: "Standardized Clinical Evaluation & Report Review",
    duration: "Comprehensive 4-Stage Assessment Process",
    clinicalLead: "Clinical Psychologist (In collaboration with The PsychoEd Clinic)",
    features: JSON.stringify(["Collaboration with PsychoEd Clinic", "Ages 7+", "Identifies ADHD & Learning Profiles"]),
    whoNeedsThis: JSON.stringify({
      subtitle: "A Psychoeducational Assessment is recommended if your child:",
      signs: [
        "Struggles academically despite effort and needs school accommodations (IEP / 504)",
        "Shows signs of ADHD, attention difficulties, or executive functioning challenges",
        "Needs formal IQ testing or comprehensive learning disability identification",
        "Requires a diagnostic evaluation for potential learning or mental health profiles",
        "Wants clarity on specific cognitive strengths and academic growth areas"
      ]
    }),
    keyBenefits: JSON.stringify([
      { title: "Comprehensive Learning Profile", description: "Mapping cognitive IQ, processing speed, memory, and academic achievement." },
      { title: "School Accommodation Support", description: "Providing formal documentation for Individual Education Plans (IEP) and accommodations." },
      { title: "ADHD & Learning Diagnosis", description: "Identifying underlying learning disabilities or attention deficit disorders." },
      { title: "Insurance Coverage Eligible", description: "Covered under extended health insurance & benefit plans." }
    ]),
    faqs: JSON.stringify([
      { question: "What is the minimum age for a Psychoeducational Assessment?", answer: "A minimum age of 7 years is required for eligibility." },
      { question: "Is this assessment covered by OAP or extended benefits?", answer: "Psychoeducational assessments are provided in collaboration with a clinical psychologist through The PsychoEd Clinic and can be covered with extended health insurance benefits." }
    ]),
    order: 6,
    isActive: true
  },
  {
    slug: "psychotherapy-services",
    title: "Psychotherapy Services",
    tagline: "Therapeutic mental health care for anxiety, depression, OCD, and ADHD.",
    badge: "Mental Health",
    badgeBg: "bg-emerald-600",
    iconBg: "bg-emerald-600",
    bulletColor: "text-emerald-600",
    iconName: "Smile",
    image: "/hero_bg_speech.jpg",
    shortDescription: "Evidence-based CBT, DBT, and Emotion-Focused Therapy for pre-teens, adolescents, and young adults facing anxiety, OCD, depression, or ADHD, with active parent involvement.",
    overviewParagraphs: JSON.stringify([
      "We are pleased to offer psychotherapy services from our Registered Psychotherapist, Charlotte Dirken. Our psychotherapy services cater to pre-teens, adolescents, and young adults with autism, ADHD, anxiety, OCD, depression, and more.",
      "We provide a safe and supportive environment where individuals can explore their thoughts and emotions. Charlotte Dirken is skilled in using techniques of Cognitive Behavioural Therapy (CBT), Dialectical Behaviour Therapy (DBT), and Emotion-Focused Therapy (EFT) to manage symptoms, develop coping strategies, and improve overall well-being.",
      "This program also includes parent involvement, guiding parents on how to integrate psychotherapy practices into the home environment. (Covered with OAP funding)."
    ]),
    ageGroup: "Pre-Teens, Teens & Young Adults",
    sessionFormat: "1:1 Individual Psychotherapy & Parent Coaching",
    duration: "50 Min Therapeutic Sessions",
    clinicalLead: "Charlotte Dirken (Registered Psychotherapist)",
    features: JSON.stringify(["Registered Psychotherapist", "CBT, DBT & EFT Techniques", "Anxiety & Mood Management"]),
    whoNeedsThis: JSON.stringify({
      subtitle: "Psychotherapy Services are recommended if your pre-teen or teen experiences:",
      signs: [
        "Anxiety, panic, social stress, or persistent worries",
        "Symptoms of depression, low self-esteem, or mood fluctuations",
        "Obsessive-compulsive tendencies (OCD) or emotional regulation challenges",
        "Navigating life transitions, peer conflicts, or identity exploration",
        "Need for evidence-based CBT, DBT, or Emotion-Focused therapeutic tools"
      ]
    }),
    keyBenefits: JSON.stringify([
      { title: "Evidence-Based Modalities", description: "Utilizing Cognitive Behavioural Therapy (CBT), DBT, and Emotion-Focused Therapy." },
      { title: "Emotional Self-Regulation", description: "Developing lifelong coping strategies for stress, anxiety, and depression." },
      { title: "Integrated Parent Guidance", description: "Empowering parents to support mental health practices effectively at home." },
      { title: "OAP Funding Covered", description: "Covered under Ontario Autism Program (OAP) funding." }
    ]),
    faqs: JSON.stringify([
      { question: "Who conducts Psychotherapy sessions?", answer: "Psychotherapy is conducted by Registered Psychotherapist Charlotte Dirken." },
      { question: "Is Psychotherapy covered by OAP?", answer: "Yes, Psychotherapy Services are covered with OAP funding." }
    ]),
    order: 7,
    isActive: true
  }
];

async function main() {
  console.log("Starting full services database synchronization...");

  for (const svc of SERVICES_TO_SYNC) {
    const existing = await prisma.service.findFirst({
      where: { slug: svc.slug }
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: svc
      });
      console.log(`Updated service [${svc.slug}] with full rich data.`);
    } else {
      await prisma.service.create({
        data: svc
      });
      console.log(`Created service [${svc.slug}] in database.`);
    }
  }

  const all = await prisma.service.findMany({
    select: { id: true, title: true, slug: true, order: true, isActive: true }
  });
  console.log("All services in DB now:", all);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
