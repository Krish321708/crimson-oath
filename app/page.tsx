"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const navigation = [
  ["gate", "The Gate"],
  ["realm", "The Realm"],
  ["laws", "The Oath"],
  ["relics", "The Relics"],
] as const;

const laws = [
  {
    numeral: "I",
    title: "The hand may serve a crown.",
    line: "The soul serves only its word.",
    body: "A command ends when the throne falls silent. A promise begins precisely there—when no eye remains to praise the keeping of it.",
  },
  {
    numeral: "II",
    title: "Mercy is not surrender.",
    line: "It is strength that has mastered itself.",
    body: "Any sword can answer anger. The rarer courage is to hold power without becoming its prisoner, and to leave tomorrow more honourable than today.",
  },
  {
    numeral: "III",
    title: "Names fade from the stone.",
    line: "Deeds remain in those they sheltered.",
    body: "Glory begs to be remembered. Duty asks for nothing. The finest legacy is a world made safer by hands history never learned to applaud.",
  },
];

const dust = Array.from({ length: 22 }, (_, index) => ({
  x: (index * 41 + 7) % 100,
  y: (index * 29 + 13) % 100,
  delay: (index % 7) * 0.7,
  duration: 7 + (index % 5) * 1.8,
  size: 1 + (index % 3),
}));

function moveTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const realmRef = useRef<HTMLElement>(null);
  const relicRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeLaw, setActiveLaw] = useState(0);
  const [oathOpen, setOathOpen] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [activeSection, setActiveSection] = useState("gate");

  const { scrollYProgress } = useScroll();
  const pageProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 28,
    mass: 0.35,
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroArtY = useTransform(heroProgress, [0, 1], ["0%", "18%"]);
  const heroArtScale = useTransform(heroProgress, [0, 1], [1.03, 1.14]);
  const heroCopyY = useTransform(heroProgress, [0, 0.72], [0, -150]);
  const heroCopyOpacity = useTransform(heroProgress, [0, 0.68], [1, 0]);
  const heroBladeX = useTransform(heroProgress, [0, 1], ["0%", "22%"]);

  const { scrollYProgress: realmProgress } = useScroll({
    target: realmRef,
    offset: ["start end", "end start"],
  });
  const realmArtX = useTransform(realmProgress, [0, 1], ["-3%", "3%"]);
  const realmArtScale = useTransform(realmProgress, [0, 0.5, 1], [1.12, 1.02, 1.08]);
  const realmTitleX = useTransform(realmProgress, [0.15, 0.8], ["18%", "-16%"]);
  const realmPanelY = useTransform(realmProgress, [0.18, 0.72], [110, -90]);

  const { scrollYProgress: relicProgress } = useScroll({
    target: relicRef,
    offset: ["start end", "end start"],
  });
  const relicArtY = useTransform(relicProgress, [0, 1], [70, -80]);
  const relicCopyY = useTransform(relicProgress, [0, 1], [110, -60]);

  useEffect(() => {
    const pointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => window.removeEventListener("pointermove", pointer);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map(([id]) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-38% 0px -50%", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = oathOpen ? "hidden" : "";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOathOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [oathOpen]);

  return (
    <main className="chronicle">
      <div className="pointer-aura" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <motion.div className="page-progress" style={{ scaleY: pageProgress }} aria-hidden="true" />

      <header className="royal-header">
        <button className="monogram" onClick={() => moveTo("gate")} aria-label="Return to the gate">
          <span>C</span><i /><span>O</span>
        </button>
        <nav aria-label="Chronicle navigation">
          {navigation.map(([id, label]) => (
            <button key={id} className={activeSection === id ? "active" : ""} onClick={() => moveTo(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="header-oath" onClick={() => setOathOpen(true)}>
          <span>Read the vow</span><b aria-hidden="true">↗</b>
        </button>
      </header>

      <section className="hero-scroll" id="gate" ref={heroRef}>
        <div className="hero-stage">
          <motion.div
            className="hero-art"
            style={{ y: prefersReducedMotion ? 0 : heroArtY, scale: prefersReducedMotion ? 1.03 : heroArtScale }}
            aria-hidden="true"
          />
          <div className="hero-shade" aria-hidden="true" />
          <motion.div className="hero-blade" style={{ x: prefersReducedMotion ? 0 : heroBladeX }} aria-hidden="true">
            <span>HONOUR</span><span>MEMORY</span><span>DUTY</span>
          </motion.div>
          <div className="dust-field" aria-hidden="true">
            {dust.map((particle, index) => (
              <i
                key={index}
                style={{
                  "--x": `${particle.x}%`, "--y": `${particle.y}%`, "--delay": `${particle.delay}s`,
                  "--duration": `${particle.duration}s`, "--size": `${particle.size}px`,
                } as CSSProperties}
              />
            ))}
          </div>

          <motion.div
            className="hero-copy"
            style={{ y: prefersReducedMotion ? 0 : heroCopyY, opacity: prefersReducedMotion ? 1 : heroCopyOpacity }}
          >
            <p className="kicker"><span /> An original interactive chronicle</p>
            <h1><span>The</span>Crimson<em>Oath</em></h1>
            <p className="hero-deck">
              Before the crown was gold, it was a promise. Before the kingdom learned its name, one knight gave his.
            </p>
            <div className="hero-actions">
              <button className="primary-cta" onClick={() => moveTo("prologue")}>
                <span>Begin the chronicle</span><i aria-hidden="true">↓</i>
              </button>
              <button className="text-cta" onClick={() => setOathOpen(true)}>
                Open the oath <span aria-hidden="true">—</span>
              </button>
            </div>
          </motion.div>

          <div className="hero-folio"><span>Folio</span><strong>I</strong><small>713 · A.R.</small></div>
          <div className="hero-side-title" aria-hidden="true">THE KEEPER</div>
          <button className="scroll-cue" onClick={() => moveTo("prologue")}>
            <span>Descend</span><i aria-hidden="true"><b /></i>
          </button>
        </div>
      </section>

      <section className="prologue" id="prologue">
        <div className="chapter-mark"><span>Folio II</span><i /><span>The debt of kings</span></div>
        <motion.p
          className="prologue-lead"
          initial={{ opacity: 0.15, y: 80 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Some inherit kingdoms.<br />Others inherit the <em>debts</em><br />of those who built them.
        </motion.p>
        <div className="prologue-columns">
          <motion.div
            className="illuminated-letter" initial={{ opacity: 0, rotate: -12, scale: 0.8 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
            aria-hidden="true"
          >W</motion.div>
          <motion.p
            initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }}
          >
            hen the bells of Caer Veyl ceased, no army stood at its gate. No enemy had crossed the bridge. The kingdom had simply forgotten the promise that made it worthy of surviving.
          </motion.p>
          <motion.blockquote
            initial={{ opacity: 0, x: 45 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.25 }}
          >
            “A realm does not fall when its walls are taken. It falls when its word is worth less than its fear.”
            <cite>— The Keeper’s Testament</cite>
          </motion.blockquote>
        </div>
      </section>

      <section className="realm-scroll" id="realm" ref={realmRef}>
        <div className="realm-stage">
          <motion.div
            className="realm-art"
            style={{ x: prefersReducedMotion ? 0 : realmArtX, scale: prefersReducedMotion ? 1.05 : realmArtScale }}
            aria-hidden="true"
          />
          <div className="realm-vignette" aria-hidden="true" />
          <motion.div className="realm-title" style={{ x: prefersReducedMotion ? 0 : realmTitleX }} aria-hidden="true">
            CAER VEYL
          </motion.div>
          <div className="realm-heading"><p>Folio III · The realm</p><h2>A kingdom<br /><em>above the clouds.</em></h2></div>
          <motion.aside className="realm-card" style={{ y: prefersReducedMotion ? 0 : realmPanelY }}>
            <span className="card-index">03 / 07</span>
            <p>
              Seven provinces kneel beneath these towers. One bridge binds them. And in the highest hall, an empty throne still waits for a promise strong enough to sit upon it.
            </p>
            <div className="realm-stats">
              <div><strong>713</strong><span>Years standing</span></div>
              <div><strong>01</strong><span>Road inward</span></div>
              <div><strong>00</strong><span>Kings remaining</span></div>
            </div>
            <button onClick={() => moveTo("laws")}>Cross the bridge <b>→</b></button>
          </motion.aside>
          <div className="coordinates">47° 19′ N&nbsp;&nbsp; / &nbsp;&nbsp;THE HIGH MARCH</div>
        </div>
      </section>

      <section className="laws" id="laws">
        <div className="running-words" aria-hidden="true">
          <motion.div animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
            HONOUR OUTLIVES THE CROWN&nbsp;&nbsp;·&nbsp;&nbsp;HONOUR OUTLIVES THE CROWN&nbsp;&nbsp;·&nbsp;&nbsp;
            HONOUR OUTLIVES THE CROWN&nbsp;&nbsp;·&nbsp;&nbsp;HONOUR OUTLIVES THE CROWN&nbsp;&nbsp;·&nbsp;&nbsp;
          </motion.div>
        </div>
        <div className="laws-shell">
          <div className="chapter-mark"><span>Folio IV</span><i /><span>The three laws</span></div>
          <div className="laws-intro">
            <h2>The oath was never<br />written for <em>easy days.</em></h2>
            <p>It was made for the hour after applause ends—when duty remains, unseen and uncompromising.</p>
          </div>
          <div className="law-book">
            <div className="law-tabs" role="tablist" aria-label="The three laws">
              {laws.map((law, index) => (
                <button
                  key={law.numeral} role="tab" aria-selected={activeLaw === index}
                  className={activeLaw === index ? "active" : ""} onClick={() => setActiveLaw(index)}
                >
                  <span>{law.numeral}</span><b>{law.title}</b><i aria-hidden="true">↗</i>
                </button>
              ))}
            </div>
            <div className="law-page" role="tabpanel">
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeLaw} initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(5px)" }}
                  transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="law-number">{laws[activeLaw].numeral}</span>
                  <p className="law-line">{laws[activeLaw].line}</p>
                  <p className="law-body">{laws[activeLaw].body}</p>
                  <div className="law-seal" aria-hidden="true">CO</div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="relics" id="relics" ref={relicRef}>
        <div className="relic-number" aria-hidden="true">V</div>
        <motion.div className="relic-image-wrap" style={{ y: prefersReducedMotion ? 0 : relicArtY }}>
          <div className="relic-image" role="img" aria-label="A ceremonial sword, crown, and sealed oath-scroll beside an empty throne" />
          <span className="image-caption">The crown, the blade, the word · Hall of Veyl</span>
        </motion.div>
        <motion.div className="relic-copy" style={{ y: prefersReducedMotion ? 0 : relicCopyY }}>
          <div className="chapter-mark"><span>Folio V</span><i /><span>What remains</span></div>
          <h2>The king departed.<br />The throne remained.<br /><em>The oath belonged<br />to neither.</em></h2>
          <p>
            Steel can be inherited. Gold can be stolen. A title may pass from one uncertain hand to another. But a promise belongs only to the person willing to keep it when keeping it costs more than breaking it.
          </p>
          <button className="primary-cta relic-cta" onClick={() => setOathOpen(true)}>
            <span>Unseal the final folio</span><i aria-hidden="true">↗</i>
          </button>
        </motion.div>
      </section>

      <section className="finale" id="finale">
        <motion.div
          className="final-panel final-panel-left" initial={{ x: "-92%" }} whileInView={{ x: 0 }}
          viewport={{ once: true, amount: 0.25 }} transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }} aria-hidden="true"
        />
        <motion.div
          className="final-panel final-panel-right" initial={{ x: "92%" }} whileInView={{ x: 0 }}
          viewport={{ once: true, amount: 0.25 }} transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }} aria-hidden="true"
        />
        <motion.div
          className="final-content" initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }} transition={{ delay: 0.65, duration: 1 }}
        >
          <span className="final-kicker">The last question</span>
          <h2>Will you keep<br />what the crown <em>could not?</em></h2>
          <p>The chronicle ends here. The measure of its words begins elsewhere.</p>
          <div className="final-actions">
            <button className="primary-cta" onClick={() => setOathOpen(true)}><span>Read the Crimson Oath</span><i>↗</i></button>
            <button className="text-cta" onClick={() => moveTo("gate")}>Return to the gate ↑</button>
          </div>
        </motion.div>
      </section>

      <footer>
        <div className="monogram footer-mark"><span>C</span><i /><span>O</span></div>
        <p>An original digital chronicle</p>
        <p>Forged in black · bound in crimson · remembered in gold</p>
        <button onClick={() => moveTo("gate")}>Top ↑</button>
      </footer>

      <AnimatePresence>
        {oathOpen && (
          <motion.div
            className="oath-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setOathOpen(false); }}
          >
            <motion.section
              className="oath-modal" role="dialog" aria-modal="true" aria-labelledby="oath-title"
              initial={{ scale: 0.9, y: 50, rotateX: -8 }} animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.94, y: 25, opacity: 0 }} transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="modal-close" onClick={() => setOathOpen(false)} aria-label="Close the oath">×</button>
              <div className="modal-folio">THE FINAL FOLIO · VII</div>
              <div className={`modal-seal ${sealed ? "sealed" : ""}`}>CO</div>
              <h2 id="oath-title">The Crimson Oath</h2>
              <p className="oath-text">
                I shall not ask the dark to spare me. I shall ask only that my word outlive it. What I guard, I guard without witness. What I promise, I carry beyond praise or blame. Let the crown be lost before the oath is broken.
              </p>
              <button className={`seal-button ${sealed ? "done" : ""}`} onClick={() => setSealed(true)} disabled={sealed}>
                {sealed ? "The oath is sealed" : "Set your seal"}
              </button>
              <small>{sealed ? "Your word now stands without witness." : "A promise is measured after the hall is empty."}</small>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
