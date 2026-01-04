'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-xl text-white hover:opacity-80 transition-opacity">
            <strong><em>SMS</em></strong>
          </Link>
        </div>
      </header>

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[20%] left-[-20%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(52, 199, 89, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 150, 0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-6 py-32 md:py-40">
        <article className="max-w-2xl mx-auto">
          {/* Opening */}
          <header className="mb-20">
            <p className="text-lg md:text-xl opacity-50 mb-4 tracking-wide">
              Strangers Meeting Strangers
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
              Meet New People
            </h1>
            <p className="text-xl md:text-2xl opacity-80 leading-relaxed">
              Find your community. Make new friends. Have fun — all in real life.
            </p>
          </header>

          {/* Greeting */}
          <section className="mb-16">
            <p className="text-xl md:text-2xl leading-relaxed opacity-90 mb-6">
              Hi <em>Strangers</em>,
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              This is Liban <span className="opacity-50">(pronounced lee-ben)</span>. I organized this thing called Strangers Meeting Strangers (<strong className="text-white"><em>SMS</em></strong> for short). I need to tell you something.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              A few years ago, I moved back home here to Minneapolis. I was gone for about 10 years. I didn't know if I was going to come back home. And something changed.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              I came home and I realized many things have changed and some not. Of those changes, I realize I was the one that changed the most. And as such, I didn't know where to start. I had a sense of desperation, loneliness, and a yearning ambition to figure something out.
            </p>
          </section>

          {/* Pull quote */}
          <blockquote className="my-20 py-8 border-l-2 border-white/20 pl-8">
            <p className="text-2xl md:text-3xl italic opacity-90 leading-relaxed">
              What was I going to do with the rest of my life?
            </p>
          </blockquote>

          {/* The First Life */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The First Life
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I served active duty for 10 years in the Air Force (2011-2021) as a program manager, managing base logistics deployments with 24+ direct reports across 6 different duty locations: Utah, United Kingdom, South Korea, Japan, Germany, and Ohio.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I wasn't planning to leave. The original plan was to stay 20 years and retire around 40.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              But Covid gave me a year to pause and reconsider everything. I started to imagine: at 40, I'd come home and ask my younger brother—two years younger than me—how his life had been.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              That image didn't sit right with me.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              So I left. It was a difficult decision. But I felt I could find my own way. I had the fortitude, the discipline, and the capacity to venture on my own. I consider this now my second life. The first was in the military.
            </p>
          </section>

          {/* The Yearning */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Yearning
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              In this yearning, I contemplated and bet my life—specifically my life savings. I took massive risks, leveraging all my assets for margins so I could buy as many stocks as I could, so that I could have more capital to try to build an inkling of an idea.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              That idea was not <strong className="text-white"><em>SMS</em></strong>.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I wanted and needed anything to figure out or to find an anchor. Something to replace what the military gave me. I very much enjoyed "Humans of New York." Reading Brandon's blog, the strangers he would encounter, the exquisite stories he would document behind a singular photo—it was so poetic and tantalizing in nature it would pull at my string.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              And then I noticed a small opening within Humans of New York. I noticed the stories ended.
            </p>
          </section>

          {/* Life of Humans */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              Life of Humans
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              It inspired me to write my own story—especially as the transition from military to civilian life was difficult on me. I thought a blog would be nice, but when I started I thought how boring would it be to just be Liban's blog. And so I thought: what about if I created a blog similar to HONY but it allowed people to register and write their own blogs with me?
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I built a clone of Medium.com and called it lifeofhumans.com.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              Within Life of Humans, instead of categories defined by typical genres, writers and readers would define their categories by human emotions.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I placed everything into that idea. I started like Brandon, going person-to-person interviewing people and transcribing their stories, and the idea was to help jumpstart their blog—and this time with no ending, because they can continue their story.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              I leveraged all my assets to bet on high leverage stocks in hopes of using that funding to build Life of Humans.
            </p>
          </section>

          {/* Pull quote */}
          <blockquote className="my-20 py-8 border-l-2 border-white/20 pl-8">
            <p className="text-2xl md:text-3xl italic opacity-90 leading-relaxed">
              I lost it all. I lost my entire life savings in pursuit.
            </p>
          </blockquote>

          {/* The Fork in the Road */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Fork in the Road
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              In November of 2021, the stock market collapsed.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I lost 90% of my life savings and I fell into madness.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              And in that moment of delirium, I met God. Who gave me a choice between anger and peace.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              This moment of choice felt like I was driving a hundred miles an hour towards a fork in the road. Choose anger, and allow it to consume you, and experience the full rage. Or peace, and start from nothing. Begin by accepting what is, as it is.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              I chose peace.
            </p>
          </section>

          {/* The Birth */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Birth
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I thought to myself: what do I do now? How do I bring people to Life of Humans?
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              And just then I had this idea: what if I bring strangers together first? Maybe I'll have to bring strangers to meet other strangers.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              <em>Strangers meeting strangers.</em>
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I could almost immediately feel <strong className="text-white"><em>SMS</em></strong> generating a life of its own, separate from Life of Humans—and I listened.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              But it wasn't actually immediate, because only the words "Strangers Meeting Strangers" came to me. Looking back, I think things come to me first as a name, and only then does it carry an idea.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              In this instance I had a name but I didn't know the idea until I was in San Francisco. I was with a friend and we were walking on a beach near the Golden Gate Bridge when we saw people in the distance dancing during the sunset. I remember how groovy and fun it looked. As we got closer, I noticed they were all wearing the same headphones and all in step, just letting it loose.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              As I stared, someone approached us and invited us to step in and grab a headphone. We picked it up, put it on, and immediately felt "connected-in" and realized it was a silent disco party. Just when I thought I understood what it was—someone's voice came over the headset and I noticed everyone could hear the same thing.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              And just like that, Eureka. I could feel the birth of <strong className="text-white"><em>SMS</em></strong>.
            </p>
          </section>

          {/* Pull quote */}
          <blockquote className="my-20 py-8 border-l-2 border-white/20 pl-8">
            <p className="text-2xl md:text-3xl italic opacity-90 leading-relaxed">
              Two strangers meet in front of a live audience using silent disco headphones. And we all listen.
            </p>
          </blockquote>

          {/* The First One */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The First One
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I ran the first one in June of 2022.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              My friend was an event producer. I went and bought the headphones. I was going around inviting my friends to a social experiment where I would bring two strangers together to meet in front of a live audience.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              It was the headphones that solved the paradox of how do you gather people together to allow them to listen to each other in front of a live audience. That's why I invited them to a park on Saturday. He told me he couldn't make it because he was hosting a party on a rooftop on Sunday starting at 5 PM.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              As I was understanding that he couldn't make it, something dawned on me the next morning when I asked him: if it's Sunday 5 PM on that rooftop, do you think I could take a slice of your hour from 5 PM to 6 PM before everybody shows up?
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              He was so cordial and kind that he allowed me to bring it to an elevated state—we brought the venue to the VIP section where there was refreshments and drinks and it looked so elaborate.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              About 25 people showed up. Of them, only three were strangers.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              And it was beautiful, because it was quite funny that 22 of my friends and three random people happened to be there. That was enough for me to see that this concept, as crazy as it sounds, had merit. For everyone enjoyed listening to two people meeting for the first time.
            </p>
          </section>

          {/* What It Became */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              What It Became
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-8">
              The thing I built to save myself started saving other people too.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-4">
              Since June 2022:
            </p>
            <ul className="text-lg md:text-xl leading-relaxed opacity-80 mb-8 space-y-3 pl-6">
              <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-[0.6em] before:w-2 before:h-2 before:bg-[#34c759] before:rounded-full">
                2,800+ strangers have come through our gatherings
              </li>
              <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-[0.6em] before:w-2 before:h-2 before:bg-[#34c759] before:rounded-full">
                35+ events across Minneapolis
              </li>
              <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-[0.6em] before:w-2 before:h-2 before:bg-[#34c759] before:rounded-full">
                700 people showed up to Talk to Me Day in Loring Park
              </li>
              <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-[0.6em] before:w-2 before:h-2 before:bg-[#34c759] before:rounded-full">
                Town Halls filled theaters with entrepreneurs and artists
              </li>
              <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-[0.6em] before:w-2 before:h-2 before:bg-[#34c759] before:rounded-full">
                Salons created space for men to talk about weakness and vulnerability
              </li>
              <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-[0.6em] before:w-2 before:h-2 before:bg-[#34c759] before:rounded-full">
                Tiny <strong className="text-white"><em>SMS</em></strong> gatherings happened on lakes, in coffee shops, on sailing boats
              </li>
            </ul>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I've watched strangers become collaborators. I've seen people find business partners, friends, lovers—just because they said yes to being in a room with people they didn't know.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              The formats worked. The philosophy held. "What happens when two strangers meet" turned out to be a question worth asking over and over again.
            </p>
          </section>

          {/* The Weight */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Weight
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              But here's what I didn't say out loud for a long time:
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I was exhausted.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              Every event ran through me. Every detail. Every decision. Every relationship. <strong className="text-white"><em>SMS</em></strong> wasn't a platform. It was me. I was the bottleneck, the brand, the logistics, the vision, the execution—all of it funneled through one person who was already tired when this started.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              People would ask: "Can I host an <strong className="text-white"><em>SMS</em></strong>?"
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              And I'd say yes, but then I'd have to be involved. I'd have to manage it. I'd have to make sure it felt right. Because the brand was fragile—it was just me and whatever trust I'd built.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              I was fighting entropy. And I don't believe in fighting entropy.
            </p>
          </section>

          {/* The Logo */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Logo
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              My friend Janine—a nuclear reactor of energy who had supported <strong className="text-white"><em>SMS</em></strong> from the beginning—wanted to host her own event. And in her own way, she made it simple:
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              "Liban, just give me the logo."
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              That's all she needed. The logo. The permission. The ability to say "this is <strong className="text-white"><em>SMS</em></strong>" without going through me.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              And I realized: the thing I built to escape loneliness had become its own kind of trap. I couldn't step away. I couldn't rest. I couldn't even attend an <strong className="text-white"><em>SMS</em></strong> in Tokyo without first building a franchise system.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              What if, instead, we opened <strong className="text-white"><em>SMS</em></strong> to the public?
            </p>
            <p className="text-base md:text-lg leading-relaxed opacity-60 italic">
              P.S. Thank you, Weldon, the man behind the evolution of <strong className="text-white"><em>SMS</em></strong> (story for another time).
            </p>
          </section>

          {/* The Evolution */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Evolution
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              <strong className="text-white"><em>SMS</em></strong> becomes the infrastructure for strangers to meet strangers—everywhere, hosted by anyone.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              <strong className="opacity-100">For hosts:</strong> You have an impulse to gather people. You open your door. <strong className="text-white"><em>SMS</em></strong> handles the rest—the invitations, the RSVPs, the trust layer that took three years to build.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              <strong className="opacity-100">For attendees:</strong> You tell us what you're into. You wait—not for a feed to scroll, but for an invitation. When the right gathering happens near you, we reach out. You say yes. You show up.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              We handle everything except what happens in the room. That part is human. That part is yours.
            </p>
          </section>

          {/* Pull quote */}
          <blockquote className="my-20 py-8 border-l-2 border-white/20 pl-8">
            <p className="text-2xl md:text-3xl italic opacity-90 leading-relaxed">
              Strangers Meeting Strangers. Hosted by You.
            </p>
          </blockquote>

          {/* Hosted by You */}
          <section className="mb-16">
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              The brand stays the same. The mission stays the same. What changes is who gets to use it.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              I built it. Now it works for everyone—including me.
            </p>
          </section>

          {/* The Invitation */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Invitation
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-8">
              Do the hard thing — join us : )
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/discover"
                className="inline-block px-8 py-4 bg-white text-black font-medium rounded-full text-center hover:bg-white/90 transition-colors"
              >
                I want to attend
              </Link>
              <Link
                href="/host/onboarding"
                className="inline-block px-8 py-4 border border-white/30 text-white font-medium rounded-full text-center hover:bg-white/10 transition-colors"
              >
                I want to host
              </Link>
            </div>
          </section>

          {/* The Close */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 opacity-90">
              The Close
            </h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              I bought <strong className="text-white"><em>SMS</em></strong> for $95,000.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-6">
              That's what it cost. Everything I had. That was the price of admission to this life.
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-80">
              Most people would call losing 90% of their life savings a tragedy. I call it a purchase. A transaction. I gave up one future and got this one instead.
            </p>
          </section>

          {/* Pull quote */}
          <blockquote className="my-20 py-8 border-l-2 border-white/20 pl-8">
            <p className="text-2xl md:text-3xl italic opacity-90 leading-relaxed">
              And I'm grateful.
            </p>
          </blockquote>

          {/* Signature */}
          <footer className="pt-12 border-t border-white/10">
            <p className="text-lg md:text-xl italic opacity-80 mb-2">
              From one stranger to another,
            </p>
            <p className="text-xl md:text-2xl font-semibold mb-1">
              Liban
            </p>
            <p className="text-sm opacity-50">
              (pronounced "lee~ben")
            </p>

            <div className="mt-16 pt-8 border-t border-white/10 text-center">
              <Link href="/" className="text-2xl text-white hover:opacity-80 transition-opacity">
                <strong><em>SMS</em></strong>
              </Link>
              <p className="text-xs opacity-30 mt-2 tracking-widest">
                MINNEAPOLIS · SINCE 2022
              </p>
            </div>
          </footer>
        </article>
      </main>
    </div>
  )
}
