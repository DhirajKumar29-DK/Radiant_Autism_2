const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const blogs = [
    {
      title: "Early Intervention in Autism: Why the First 5 Years Shape Lifelong Milestones",
      slug: "early-intervention-in-autism-first-5-years",
      category: "ABA Therapy",
      authorName: "Jesenia Duran, RBA",
      authorRole: "Clinical Director & Registered Behaviour Analyst",
      coverImage: "/hero_bg_aba.jpg",
      excerpt: "Discover why pediatric neuroplasticity makes early childhood the golden window for individualized ABA therapy, speech milestones, and foundational social skills.",
      content: `<h2>The Power of Early Brain Neuroplasticity</h2>
<p>Between birth and age five, the human brain develops faster than at any other point in life, creating over 1 million new neural connections every single second. For children diagnosed with Autism Spectrum Disorder (ASD), this early window represents an extraordinary opportunity for transformative growth.</p>
<p>Evidence-based pediatric Applied Behavior Analysis (ABA) leverages this natural neuroplasticity. Rather than trying to change who the child is, modern person-centered ABA focuses on teaching essential functional communication, self-advocacy, emotional regulation, and daily living skills.</p>

<h2>Core Developmental Milestones Targeted in Early ABA</h2>
<p>Our clinical team at Radiant Autism & Skill Center emphasizes play-based, naturalistic developmental interventions (NDBI) targeting:</p>
<ul>
  <li><strong>Functional Communication Training (FCT):</strong> Helping non-speaking or speech-delayed children express their needs, drastically reducing frustration-related behaviors.</li>
  <li><strong>Joint Attention & Social Engagement:</strong> Learning to share enjoyment, follow pointing, and participate in reciprocal play routines.</li>
  <li><strong>Motor Planning & Imitation:</strong> Developing foundational physical imitation skills that pave the way for speech sounds and self-care routines.</li>
  <li><strong>Emotional & Sensory Self-Regulation:</strong> Recognizing sensory overload early and utilizing co-regulation tools in our sensory integration rooms.</li>
</ul>

<h2>1:1 Supervision by Registered Behaviour Analysts (RBA)</h2>
<p>In Ontario, quality ABA care requires direct design, continuous supervision, and systematic data analysis by a Registered Behaviour Analyst (RBA) in good standing with the College of Psychologists and Behaviour Analysts of Ontario (CPBAO). Every child's individualized care plan evolves as they master goals, ensuring continuous progress and real-world independence.</p>

<blockquote>"Early intervention is not about conforming to neurotypical standards; it is about providing every child with the tools, voice, and confidence to navigate the world comfortably."</blockquote>

<h2>How Ontario Families Can Get Started via OAP</h2>
<p>Families registered with the Ontario Autism Program (OAP) can utilize their Core Clinical Services funding directly for early intervention programs at Radiant Autism Center. Early consultation ensures that therapy begins precisely when the brain is most receptive to developmental scaffolding.</p>`,
      metaTitle: "Early Intervention in Autism: First 5 Years Guide | Radiant Autism Center",
      metaDescription: "Discover why early childhood is the critical window for pediatric ABA therapy and developmental milestone growth under OAP funding in Ontario.",
      metaKeywords: "early intervention autism, aba therapy ontario, oap funding core clinical services, pediatric autism clinic, rba supervision",
      ogImage: "/hero_bg_aba.jpg",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Speech Therapy vs. AAC Devices: Unlocking Communication for Non-Speaking Children",
      slug: "speech-therapy-vs-aac-devices-unlocking-communication",
      category: "Speech & Language",
      authorName: "Dr. Marcus Vance",
      authorRole: "Lead Speech-Language Pathologist (SLP)",
      coverImage: "/hero_speech_therapy.jpg",
      excerpt: "Debunking common myths about Augmentative & Alternative Communication (AAC) and exploring how speech pathologists integrate speech therapy with assistive communication devices.",
      content: `<h2>Dispelling the Biggest Myth: Does AAC Prevent Verbal Speech?</h2>
<p>One of the most persistent fears parents express when discussing Augmentative and Alternative Communication (AAC) devices is: <em>"If my child uses an iPad or picture board to talk, will they stop trying to speak with their mouth?"</em></p>
<p>Extensive clinical research consistently demonstrates the exact opposite: <strong>AAC does not hinder verbal speech—it often accelerates it.</strong> By removing the immense motor-planning pressure required to articulate verbal sounds, AAC immediately relieves communication frustration and bridges the gap between receptive thoughts and expressive words.</p>

<h2>What Are the Different Types of AAC?</h2>
<p>AAC spans a broad spectrum of supportive communication modalities tailored to each child's motor, cognitive, and sensory strengths:</p>
<ul>
  <li><strong>No-Tech AAC:</strong> Gestures, sign language, pointing, and body language.</li>
  <li><strong>Low-Tech AAC:</strong> Picture Exchange Communication System (PECS), visual schedules, and paper communication flipbooks.</li>
  <li><strong>High-Tech Dedicated AAC:</strong> Speech-generating devices and specialized iPad applications (such as TouchChat, Proloquo2Go, and LAMP Words for Life).</li>
</ul>

<h2>The Multidisciplinary Approach: SLP and ABA Collaboration</h2>
<p>At Radiant Autism Center, our Speech-Language Pathologists (SLP) work shoulder-to-shoulder with our Registered Behaviour Analysts (RBA). When a child receives an AAC device, the entire clinical team and the child's family are trained to model vocabulary throughout the day during snack time, sensory gym play, and circle time.</p>

<h2>Key Signs Your Child May Benefit from an AAC Evaluation</h2>
<p>If your child is experiencing significant communication breakdowns, high frustration, or limited functional vocabulary, an AAC assessment provides clarity. Communication is a fundamental human right, and introducing multi-modal communication tools early empowers children to express thoughts, preferences, humor, and emotions.</p>`,
      metaTitle: "Speech Therapy & AAC Devices for Non-Speaking Children | Radiant Clinic",
      metaDescription: "How Speech-Language Pathologists use AAC devices alongside speech therapy to unlock functional communication for children with autism in Ontario.",
      metaKeywords: "speech therapy autism, aac devices ontario, non speaking autism, slp speech language pathologist, proloquo2go",
      ogImage: "/hero_speech_therapy.jpg",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Sensory Processing in Daily Life: Clinician-Approved OT Strategies for Home & School",
      slug: "sensory-processing-daily-life-ot-strategies",
      category: "Occupational Therapy",
      authorName: "Elena Rostova",
      authorRole: "Head of Occupational & Sensory Therapy",
      coverImage: "/gallery_sensory_gym.jpg",
      excerpt: "Learn how to identify sensory-seeking and sensory-avoidant behaviors, and create an effective sensory diet to prevent meltdowns and support smooth transitions.",
      content: `<h2>Understanding the Eight Sensory Systems</h2>
<p>Most of us grew up learning about the five senses: sight, sound, touch, taste, and smell. In pediatric occupational therapy, however, we recognize three additional critical internal senses that dictate how children experience their environment:</p>
<ul>
  <li><strong>Proprioception:</strong> Body awareness and sense of muscle effort (knowing where limbs are in space).</li>
  <li><strong>Vestibular:</strong> Balance, spatial orientation, and movement detection (coordinated by the inner ear).</li>
  <li><strong>Interoception:</strong> Internal body signals such as hunger, thirst, heart rate, and bathroom urges.</li>
</ul>

<h2>Sensory Seeking vs. Sensory Avoiding</h2>
<p>Children on the autism spectrum frequently process sensory inputs differently than neurotypical peers. A child who is <strong>sensory seeking</strong> may crash into furniture, spin continuously, or touch every textured surface to satisfy a sensory craving. Conversely, a child who is <strong>sensory avoidant</strong> may cover their ears in grocery stores, reject clothing tags, or feel distressed by bright fluorescent lighting.</p>

<h2>Building a Daily "Sensory Diet" at Home</h2>
<p>Just as our bodies require nutritional food throughout the day to function, our nervous systems need targeted sensory input to maintain a regulated state of alert calmness. Practical daily strategies include:</p>
<ul>
  <li><strong>Heavy Work Activities:</strong> Carrying groceries, pushing a laundry basket, or playing with weighted blankets to deliver calming proprioceptive feedback.</li>
  <li><strong>Linear Swinging:</strong> Gentle front-to-back swinging in a hammock or lycra swing to soothe an overstimulated vestibular system.</li>
  <li><strong>Dedicated Calm Corners:</strong> A quiet sanctuary equipped with noise-canceling headphones, soft lighting, and deep-pressure beanbags.</li>
  <li><strong>Oral Motor Chew Tools:</strong> Safe, non-toxic sensory chews for children who chew clothes or pencils during focused tasks.</li>
</ul>

<h2>Occupational Therapy Integration at Radiant Center</h2>
<p>Our sensory gym is custom-engineered with suspended swings, rock walls, tactile balance beams, and crash zones. By incorporating sensory regulation directly into daily therapy sessions, children build the endurance and emotional stability needed to thrive in classroom and community settings.</p>`,
      metaTitle: "Sensory Processing & Daily OT Strategies | Radiant Autism Center",
      metaDescription: "Pediatric occupational therapy techniques and sensory diets to regulate energy, reduce meltdowns, and support children with autism.",
      metaKeywords: "occupational therapy autism, sensory processing disorder, sensory diet home, pediatric ot clinic ontario, proprioceptive input",
      ogImage: "/gallery_sensory_gym.jpg",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const b of blogs) {
    const upserted = await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    console.log(`Upserted blog: "${upserted.title}" (slug: ${upserted.slug})`);
  }

  const allBlogs = await prisma.blogPost.findMany({
    where: { isDeleted: false },
    select: { id: true, title: true, slug: true, category: true, status: true },
  });
  console.log("\nTotal active blogs in database:", allBlogs.length);
  console.log(JSON.stringify(allBlogs, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
