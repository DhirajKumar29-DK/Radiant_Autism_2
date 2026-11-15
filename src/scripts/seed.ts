import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Radiant Autism...");

  // 1. Admin
  const adminEmail = "admin@radiantautism.com";
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("RadiantAdmin2026!", 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Radiant Clinical Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log("Created default admin:", adminEmail);
  }

  // 2. Services
  const services = [
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
      shortDescription:
        "Applied Behaviour Analysis (ABA) autism therapy using research-based methods to target verbal skills, self-help, play, social skills, and socially significant goals for ages 2 to 20.",
      overviewParagraphs: JSON.stringify([
        "Applied Behaviour Analysis (ABA) is a scientific approach to understanding and improving behaviour using data and research-based methods. At Radiant Autism Center, our ABA therapy targets each child's socially significant goals, such as verbal skills, academics, self-help, play skills, social skills, and life skills.",
        "We utilize the principles of reinforcement, using play and motivation to increase desired behaviours safely and ethically. All ABA services are supervised by our Registered Behaviour Analyst, Jesenia Duran, ensuring the happiness, trust, and success of each individual.",
        "We work with neurodivergent individuals (autism, ADHD, ADD, ID) as young as 2 years old and up to 20 years old. This program is fully covered under Ontario Autism Program (OAP) funding."
      ]),
      ageGroup: "2 to 20 Years",
      sessionFormat: "1:1 & Small Group Individualized Clinical Sessions",
      duration: "Customized per Individualized Care Plan",
      clinicalLead: "Jesenia Duran, RBA (Registered Behaviour Analyst, Ontario)",
      features: JSON.stringify(["RBA Supervised Clinical Care", "Ages 2 to 20 Years", "Target Verbal & Daily Life Skills"]),
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
        { title: "Positive Behavior Support", description: "Replacing maladaptive habits with calming, constructive daily routines." },
        { title: "Parent Collaboration", description: "Empowering families with transferrable techniques to use at home." }
      ]),
      order: 1,
    },
    {
      slug: "speech-therapy",
      title: "Speech and Language Service (SLP)",
      tagline: "Comprehensive speech pathology and verbal communication therapy.",
      badge: "Communication Care",
      badgeBg: "bg-teal-600",
      iconBg: "bg-teal-600",
      bulletColor: "text-teal-600",
      iconName: "MessageCircle",
      image: "/hero_speech_therapy.jpg",
      shortDescription:
        "Comprehensive Speech-Language Pathology (SLP) assessments and individualized therapy targeting verbal articulation, early vocalizations, receptive language, and alternative communication (AAC).",
      overviewParagraphs: JSON.stringify([
        "Our Speech and Language Services address articulation, early vocalizations, receptive and expressive language milestones, and alternative and augmentative communication (AAC).",
        "Sessions are led by registered Speech-Language Pathologists who coordinate closely with our behavior team to ensure consistent, child-centered progress."
      ]),
      ageGroup: "All Ages",
      sessionFormat: "1:1 Focused Sessions & Collaborative Care",
      duration: "45–60 Minutes per session",
      clinicalLead: "Registered Speech-Language Pathologist (SLP Lead)",
      features: JSON.stringify(["Registered SLP Clinical Lead", "Language & Articulation Skills", "Combined SLP + ABA Methods"]),
      whoNeedsThis: JSON.stringify({
        subtitle: "Speech Therapy is recommended if your child experiences:",
        signs: [
          "Limited vocabulary or delay in first words",
          "Difficulty pronouncing words clearly or being understood",
          "Frustration when attempting to express needs or ideas",
          "Challenges following instructions or comprehending spoken language"
        ]
      }),
      keyBenefits: JSON.stringify([
        { title: "Clearer Articulation", description: "Helping children form sounds accurately and speak with confidence." },
        { title: "AAC Integration", description: "Custom communication board and iPad device setup when needed." }
      ]),
      order: 2,
    },
    {
      slug: "occupational-therapy",
      title: "Occupational Therapy (OT)",
      tagline: "Enhancing sensory processing, motor skills, and daily independence.",
      badge: "Motor & Sensory",
      badgeBg: "bg-indigo-600",
      iconBg: "bg-indigo-600",
      bulletColor: "text-indigo-600",
      iconName: "Activity",
      image: "/gallery_sensory_gym.jpg",
      shortDescription:
        "Targeted occupational therapy directly addressing fine and gross motor development, sensory regulation, core coordination, handwriting, and essential daily living independence.",
      overviewParagraphs: JSON.stringify([
        "Occupational therapy empowers children to engage fully in their everyday activities—from dressing and eating to playing and classroom tasks.",
        "Our purpose-built sensory gym provides a supportive space for movement, sensory regulation, and motor coordination."
      ]),
      ageGroup: "Ages 2 to 18",
      sessionFormat: "1:1 Sensory Gym & Tabletop Tasks",
      duration: "45–60 Minutes",
      clinicalLead: "Registered Occupational Therapist (OT)",
      features: JSON.stringify(["Fine & Gross Motor Skills", "Sensory Processing & Regulation", "Daily Living Independence"]),
      whoNeedsThis: JSON.stringify({
        subtitle: "Occupational Therapy is recommended if your child shows:",
        signs: [
          "Hypersensitivity or hyposensitivity to sound, touch, or movement",
          "Difficulties with buttoning, shoelaces, or utensil use",
          "Handwriting and pencil grasp challenges",
          "Clumsiness or poor balance and body awareness"
        ]
      }),
      keyBenefits: JSON.stringify([
        { title: "Sensory Regulation", description: "Strategies to stay calm and focused across different environments." },
        { title: "Daily Living Mastery", description: "Independence in self-care, school tasks, and play." }
      ]),
      order: 3,
    },
    {
      slug: "life-skills",
      title: "Life Skills & Group Programs",
      tagline: "Structured peer circles, community navigation, and practical life skills.",
      badge: "Ages 9–18 & Groups",
      badgeBg: "bg-purple-600",
      iconBg: "bg-purple-600",
      bulletColor: "text-purple-600",
      iconName: "Compass",
      image: "/gallery_group_play.jpg",
      shortDescription:
        "Integrated peer social groups and practical life skills training for ages 9–18, plus pre-employment readiness to build lasting friendship, independence, and career exploration.",
      overviewParagraphs: JSON.stringify([
        "Our Life Skills & Group Programs bridge clinical therapy with real-world independence. Participants engage in structured peer circles, practical everyday routines, and pre-vocational exploration.",
        "Pre-employment and advanced modules have specific behavioral prerequisites to ensure readiness and maximum benefit."
      ]),
      ageGroup: "Ages 9 to 18",
      sessionFormat: "Small Peer Groups & Community Outings",
      duration: "Weekly 2-Hour Modules",
      clinicalLead: "RBA & Senior Behaviour Technician Team",
      features: JSON.stringify(["Ages 9–18 Dedicated Focus", "Structured Peer Social Groups", "Pre-Employment Skills (Prerequisite Needed)"]),
      whoNeedsThis: JSON.stringify({
        subtitle: "Recommended for pre-teens and teens who want to build:",
        signs: [
          "Peer socialization, conversations, and friendship building",
          "Meal prep, money handling, and self-advocacy",
          "Community travel and public navigation confidence",
          "Workplace readiness and structured task completion"
        ]
      }),
      keyBenefits: JSON.stringify([
        { title: "Social Connection", description: "Safe, guided space to make lasting friends and share interests." },
        { title: "Lifelong Independence", description: "Practical tools for adulthood, high school, and future careers." }
      ]),
      order: 4,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log("Seeded 4 core services.");

  // 3. Team Members
  const team = [
    {
      name: "Shyni Gopal",
      role: "RBA, QBA - Clinical Director & Founder",
      badge: "Registered Behaviour Analyst (Ontario)",
      image: "/founder_portrait.jpg",
      bio: "Over 12+ years of clinical expertise specializing in person-centered ABA, VB-MAPP assessment, and compassionate family-focused therapy.",
      order: 1,
    },
    {
      name: "Dr. Marcus Vance",
      role: "Lead Speech-Language Pathologist (SLP)",
      badge: "Speech & AAC Specialist",
      image: "/hero_speech_therapy.jpg",
      bio: "Specializing in pediatric articulation, early vocalization, AAC augmentative communication devices, and oral-motor feeding coordination.",
      order: 2,
    },
    {
      name: "Elena Rostova",
      role: "Head of Occupational & Sensory Therapy",
      badge: "Sensory Integration Expert",
      image: "/hero_child_therapy.jpg",
      bio: "Expert in sensory processing gym training, fine motor dexterity, emotional self-regulation, and independent daily life skills.",
      order: 3,
    },
    {
      name: "Sarah Jenkins",
      role: "Senior Registered Behavior Technician (RBT)",
      badge: "Early Intervention Lead",
      image: "/gallery_group_play.jpg",
      bio: "Dedicated to play-infused 1:1 ABA implementation, peer socialization circles, and toddler classroom bridge readiness.",
      order: 4,
    },
  ];

  await prisma.teamMember.deleteMany({});
  for (const t of team) {
    await prisma.teamMember.create({ data: t });
  }
  console.log("Seeded team members.");

  // 4. Page Heroes
  const heroes = [
    {
      pageKey: "home",
      badgeText: "Registered Behaviour Analyst (RBA, Ontario) Supervised Care",
      title: "Empowering Children with Autism & Developmental Determination",
      subtitle: "Compassionate, evidence-based ABA, speech-language, and occupational therapy for children, youth, and their families across Ontario.",
      primaryBtnText: "Book Free Consultation",
      primaryBtnLink: "/contact",
      secondaryBtnText: "Explore Our Programs",
      secondaryBtnLink: "/services",
      slidesJson: JSON.stringify([
        { id: 1, image: "/hero_child_therapy.jpg", title: "Play-Based ABA Therapy", desc: "1:1 individualized behavioural support" },
        { id: 2, image: "/hero_speech_therapy.jpg", title: "Speech & Language Care", desc: "Fostering functional communication and articulation" },
        { id: 3, image: "/gallery_sensory_gym.jpg", title: "Sensory & Motor Regulation", desc: "Purpose-built sensory spaces for children" }
      ]),
    },
    {
      pageKey: "about",
      badgeText: "About Radiant Autism Center",
      title: "Empowering Growth, Building Confidence",
      subtitle: "Discover our mission, our multidisciplinary RBA-supervised care team, and our commitment to compassionate, evidence-based pediatric therapy.",
      bgImage: "/about_center_photo.jpg",
    },
    {
      pageKey: "services",
      badgeText: "Radiant Clinical Services",
      title: "Evidence-Based Therapy & Skill Development",
      subtitle: "Explore our comprehensive range of 1:1 individualized therapy and group services supervised by registered RBA clinicians.",
      bgImage: "/hero_child_therapy.jpg",
    },
    {
      pageKey: "contact",
      badgeText: "Get In Touch",
      title: "We Are Here To Support Your Journey",
      subtitle: "Connect with our clinical intake team to ask questions, explore OAP funding coverage, or schedule your initial consultation.",
      bgImage: "/gallery_sensory_gym.jpg",
    },
  ];

  for (const h of heroes) {
    await prisma.pageHero.upsert({
      where: { pageKey: h.pageKey },
      update: h,
      create: h,
    });
  }
  console.log("Seeded page heroes.");

  // 5. Site Navigation Settings
  const existingNav = await prisma.siteNavigation.findFirst();
  if (!existingNav) {
    await prisma.siteNavigation.create({
      data: {
        navItemsJson: JSON.stringify([
          { id: "home", label: "Home", name: "Home", href: "/", path: "/", isVisible: true },
          { id: "about", label: "About Us", name: "About Us", href: "/about", path: "/about", isVisible: true },
          { id: "services", label: "Services", name: "Services", href: "/services", path: "/services", isVisible: true },
          { id: "gallery", label: "Gallery", name: "Gallery", href: "/gallery", path: "/gallery", isVisible: true },
          { id: "blogs", label: "Articles & Blog", name: "Articles & Blog", href: "/blogs", path: "/blogs", isVisible: true },
          { id: "contact", label: "Contact Us", name: "Contact Us", href: "/contact", path: "/contact", isVisible: true },
        ]),
        sectionsVisibilityJson: JSON.stringify({
          hero: true,
          about: true,
          careApproach: true,
          services: true,
          process: true,
          gallery: true,
        }),
      },
    });
    console.log("Seeded navigation and section visibility settings.");
  }

  // 6. Initial Blog Post
  const existingBlog = await prisma.blogPost.findFirst();
  if (!existingBlog) {
    await prisma.blogPost.create({
      data: {
        title: "Understanding OAP Funding: A Practical Guide for Ontario Families",
        slug: "understanding-oap-funding-ontario-families",
        excerpt: "Learn how the Ontario Autism Program (OAP) funding works, which services are covered, and how Registered Behaviour Analysts (RBA) oversee your child's care plan.",
        content: `<h2>Navigating Autism Funding in Ontario</h2><p>Navigating pediatric developmental services can feel overwhelming for parents. Fortunately, in Ontario, the Ontario Autism Program (OAP) provides eligible families with essential financial support to access high-quality therapy.</p><h3>What Services are Covered Under OAP?</h3><p>OAP funding can be utilized for core clinical services that directly target your child's communication, behavior, and motor milestones, including ABA, Speech Therapy, and Occupational Therapy.</p><h3>Why RBA Supervision Matters</h3><p>In Ontario, Behaviour Analysts are regulated healthcare professionals registered with the CPBAO. Having an RBA supervise your child's therapy ensures the highest clinical, ethical, and safety standards.</p>`,
        coverImage: "/hero_child_therapy.jpg",
        category: "OAP & Funding",
        authorName: "Shyni Gopal, RBA",
        authorRole: "Clinical Director",
        status: "PUBLISHED",
        metaTitle: "Understanding OAP Funding for Ontario Families | Radiant Autism",
        metaDescription: "Practical guide explaining Ontario Autism Program (OAP) funding, covered services like ABA, Speech, OT, and RBA supervision standards.",
      },
    });
    console.log("Seeded sample clinical blog post.");
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
