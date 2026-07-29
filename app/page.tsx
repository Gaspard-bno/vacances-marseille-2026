"use client";

import { useState } from "react";

const days = [
  { day: "DIM", date: "09", title: "On pose les valises", tag: "Casa first", morning: "Arrivées & chambres", afternoon: "Courses en deux équipes · piscine", night: "Apéro, barbecue & jeux", mood: "● tranquille" },
  { day: "LUN", date: "10", title: "Cassis en bleu", tag: "activité #1", morning: "Kayak · 10h → 12h", afternoon: "Pique-nique · retour piscine", night: "Bar chill facultatif à Aix", mood: "● moyen" },
  { day: "MAR", date: "11", title: "Calanques by boat", tag: "grosse journée", morning: "Réveil doux · courses d’appoint", afternoon: "Bateau Calanques · à confirmer", night: "Dîner maison, retour calme", mood: "● moyen" },
  { day: "MER", date: "12", title: "Beach, then dance", tag: "sortie #1", morning: "Grasse mat’", afternoon: "Sainte-Croix ou Verdon", night: "Rooftop / club Marseille", mood: "● tardif" },
  { day: "JEU", date: "13", title: "Sans programme", tag: "recovery day", morning: "Aucun réveil imposé", afternoon: "Piscine · Rouet · impro", night: "Repas maison ou bar chill", mood: "● ultra light" },
  { day: "VEN", date: "14", title: "Full speed", tag: "activité #2", morning: "Libre jusqu’à midi", afternoon: "Karting Rognac · 17h30", night: "Club Marseille · sortie #2", mood: "● intense" },
  { day: "SAM", date: "15", title: "Last sunset", tag: "casino night", morning: "Brunch & piscine", afternoon: "Plage courte / farniente", night: "Casino Cassis · budget fermé", mood: "● léger" },
  { day: "DIM", date: "16", title: "On range, on repart", tag: "fin", morning: "Rangement en équipe", afternoon: "Départs", night: "—", mood: "● easy" },
];

const beaches = [
  { icon: "✦", name: "Sainte-Croix", label: "La carte postale", drive: "45–55 min", description: "Sable clair, eau turquoise, petite baie. À viser tôt.", best: "Le plus beau spot", link: "https://provence-alpes-cotedazur.com/que-faire/detente-et-loisirs/toutes-les-activites-detente-et-loisirs/plage-de-sainte-croix-martigues-fr-3310688/" },
  { icon: "◌", name: "Couronne-Vieille", label: "La plus calme", drive: "45–55 min", description: "Mini-crique sable & galets au pied des falaises.", best: "Pour chiller", link: "https://www.martigues-tourisme.com/autres-loisirs/plage-couronne-vieille.html" },
  { icon: "☼", name: "Verdon", label: "La plus simple", drive: "45–55 min", description: "Grande plage de sable, douches, parking et place pour 9.", best: "Le plan sans stress", link: "https://www.martigues-tourisme.com/autres-loisirs/plage-du-verdon.html" },
  { icon: "≈", name: "Le Rouet", label: "La base nautique", drive: "35–45 min", description: "Plage équipée à Carry : idéal pour décider paddle ou bouée sur place.", best: "Pour l’impro", link: "https://www.otcarrylerouet.fr/plage-du-rouet.html" },
];

const scenarios = {
  serré: { title: "Serré", totalGroup: "8 039 €", totalPerson: "893 €", color: "blue", items: [["Logement", "400 €"], ["Courses maison", "120 €"], ["Kayak 1h", "7 €"], ["Karting 1 session", "19 €"], ["Sorties + casino", "75 €"], ["Transport local", "28 €"], ["Bateau privé", "130 €"], ["Marge 10%", "81 €"]] },
  réaliste: { title: "Réaliste", totalGroup: "9 137 €", totalPerson: "1 015 €", color: "yellow", items: [["Logement", "400 €"], ["Courses maison", "145 €"], ["Restaurant", "35 €"], ["Kayak 2h", "13 €"], ["Karting 2 sessions", "37 €"], ["Sorties + casino", "125 €"], ["Transport + Compass", "38 €"], ["Bateau privé", "130 €"], ["Marge 10%", "92 €"]] },
  confort: { title: "Confort", totalGroup: "10 940 €", totalPerson: "1 216 €", color: "orange", items: [["Logement", "400 €"], ["Courses maison", "180 €"], ["Restaurant", "55 €"], ["Kayak 3h", "20 €"], ["Karting 3 sessions", "50 €"], ["Sorties + casino", "210 €"], ["Transport + extras", "60 €"], ["Bateau privé", "130 €"], ["Marge 10%", "111 €"]] },
};

const activityLinks = [
  { number: "01", name: "Bateau Calanques", price: "130 € / pers.", note: "Bateau privatisé pour le groupe · après-midi · skipper.", href: "https://www.bleuevasion.fr/calanques", status: "À réserver" },
  { number: "02", name: "Cassis Kayak", price: "13,33 € / pers.", note: "2 h · 3 kayaks triples · le meilleur ratio groupe.", href: "https://www.cassis-kayak.fr/", status: "À réserver" },
  { number: "03", name: "Karting Rognac", price: "37 € / pers.", note: "2 sessions de 10 min · offre groupe à partir de 8.", href: "https://www.karting-rognac.fr/tarifs.html", status: "À réserver" },
];

export default function Home() {
  const [scenario, setScenario] = useState<keyof typeof scenarios>("réaliste");
  const [openDay, setOpenDay] = useState(1);
  const plan = scenarios[scenario];
  const personalTotal = Number(plan.totalPerson.replace(/[^0-9]/g, ""));

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-image" />
        <nav className="nav"><a className="brand" href="#home">MAR<span>26</span></a><div className="nav-links"><a href="#programme">Programme</a><a href="#budget">Budget</a><a href="#vote">À voter</a></div><a className="nav-pill" href="#vote">Le plan ↗</a></nav>
        <div className="hero-copy">
          <p className="eyebrow">CABRIÈS · CÔTE BLEUE · CASSIS</p>
          <h1>Une semaine<br /><em>en grand bleu.</em></h1>
          <p className="hero-sub">9 amis · 9 → 16 août 2026<br />Calanques, eau salée &amp; nuits longues.</p>
          <div className="hero-actions"><a className="button primary" href="#programme">Voir le programme <b>↓</b></a><a className="button glass" href="#budget">Budget du séjour</a></div>
        </div>
        <div className="hero-stamp"><span>09</span><i>→</i><span>16</span><small>AOÛT ’26</small></div>
        <div className="scroll-cue">SCROLL POUR LE PLAN <span>↓</span></div>
      </section>

      <section className="intro section-pad">
        <p className="section-kicker">LE CONCEPT</p>
        <div className="intro-grid"><h2>Pas un planning militaire.<br /><em>Le meilleur de l’été.</em></h2><div><p className="lead">Trois vrais souvenirs à neuf. Le reste : des plages choisies au réveil, la piscine, les apéros et l’impro.</p><div className="principles"><span>✦ 3 activités</span><span>☼ 4 plages parfaites</span><span>◌ 2 nuits à Marseille</span><span>↗ 0 pression</span></div></div></div>
      </section>

      <section className="crew-section section-pad" id="crew">
        <div className="crew-heading"><p className="section-kicker">L’ÉQUIPAGE</p><h2>9 amis.<br /><em>1 équipage.</em></h2><p>Présents à Marseille, classés par ordre alphabétique.</p></div>
        <div className="crew-list">{["Arthur", "Aymeric", "Elouan", "Gaetan", "Gaspard", "Hélio", "Juliette", "Matys", "Yoel"].map((name, index) => <div key={name}><span>{String(index + 1).padStart(2, "0")}</span><b>{name}</b></div>)}</div>
        <div className="crew-tools"><div><span>À VENIR</span><h3>Comptes du groupe</h3><p>Une dépense, qui a payé, qui participe : le site calculera les remboursements sans tableur à refaire.</p></div><div><span>À VENIR</span><h3>Carnet partagé</h3><p>Les infos importantes, idées, listes de courses et décisions du groupe réunies à un seul endroit.</p></div></div>
      </section>

      <section className="activities section-pad" id="activities"><div className="section-head"><div><p className="section-kicker">LE TRIO</p><h2>Les activités<br />qui comptent.</h2></div><p>Tout le monde est inclus. Les options plus chères restent une décision perso, jamais une obligation de groupe.</p></div><div className="activity-grid">{activityLinks.map((activity) => <a className="activity-card" key={activity.number} href={activity.href} target="_blank" rel="noreferrer"><div className="card-top"><span>{activity.number}</span><b>{activity.status}</b></div><div><h3>{activity.name}</h3><strong>{activity.price}</strong><p>{activity.note}</p></div><span className="arrow">↗</span></a>)}</div><aside className="warning success"><span>✓</span><p><b>Bateau validé :</b> Bleue Évasion est le prestataire retenu, pour une sortie privée à <b>130 € par personne</b>. Le site indique notamment des bateaux de 8, 10 ou 12 places, matériel snorkeling fourni et une adaptation à la météo. Il reste à choisir le bateau / créneau exact pour 9.</p></aside></section>

      <section className="timeline-wrap" id="programme"><div className="section-pad"><p className="section-kicker on-dark">LE FILM DE LA SEMAINE</p><h2 className="light-title">Le bon rythme,<br /><em>au bon moment.</em></h2><p className="timeline-intro">Touchez une date pour voir le programme. Après chaque grosse nuit, on garde une journée douce — c’est volontaire.</p></div><div className="timeline">{days.map((item, index) => <button className={`day-card ${openDay === index ? "active" : ""}`} onClick={() => setOpenDay(index)} key={item.date + item.day}><div className="date"><small>{item.day}</small><strong>{item.date}</strong></div><div className="day-info"><span>{item.tag}</span><h3>{item.title}</h3>{openDay === index && <div className="day-detail"><p><b>MATIN</b>{item.morning}</p><p><b>APRÈS-MIDI</b>{item.afternoon}</p><p><b>CE SOIR</b>{item.night}</p></div>}</div><i>{openDay === index ? "−" : "+"}</i><em>{item.mood}</em></button>)}</div></section>

      <section className="beach-section section-pad" id="plages"><div className="section-head"><div><p className="section-kicker">SAND &amp; SEA</p><h2>La bonne plage,<br />selon l’humeur.</h2></div><p>En août, aucune n’est secrète. La différence se joue à 9 h du matin, pas à midi.</p></div><div className="beach-grid">{beaches.map((beach) => <a href={beach.link} target="_blank" rel="noreferrer" key={beach.name} className="beach-card"><div className="beach-symbol">{beach.icon}</div><p>{beach.label} <span>{beach.drive}</span></p><h3>{beach.name}</h3><p className="beach-description">{beach.description}</p><b>{beach.best} <i>↗</i></b></a>)}</div><div className="beach-note"><span>HOT TIP</span><p>Départ 8h45, glacières prêtes, parasols dans la voiture. Si le parking est saturé : Sainte-Croix → Verdon, sans discussion.</p></div></section>

      <section className="budget-section section-pad" id="budget"><div className="budget-top"><div><p className="section-kicker">VRAI BUDGET, VRAIE VIE</p><h2>On sait où<br />part l’argent.</h2></div><p>Le logement est calculé à 400 € / personne. Si le coût final est 377 € pour chacun, on baisse automatiquement le total d’environ 25 € avec marge.</p></div><div className="budget-controls"><div className="pill-tabs">{(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => <button key={key} className={scenario === key ? "selected" : ""} onClick={() => setScenario(key)}>{scenarios[key].title}</button>)}</div><div className="boat-confirmed">✓ Bateau privatisé · 130 € / pers.</div></div><div className={`budget-board ${plan.color}`}><div className="budget-main"><p>TON BUDGET ESTIMÉ</p><strong>{personalTotal.toLocaleString("fr-FR")} <small>€</small></strong><span>par personne · marge 10 % incluse</span><div className="budget-group"><b>✓ bateau Bleue Évasion à 130 € / pers.</b><p>Total du groupe : <strong>{plan.totalGroup}</strong></p></div></div><div className="budget-list">{plan.items.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div></div><p className="budget-footnote">Bouée, jet-ski, paddle et autres extras ne sont pas inclus : ils restent des « oui si le prix sur place est cool ». Le casino est une enveloppe fermée de 20, 35 ou 50 €.</p></section>

      <section className="nights section-pad"><div className="night-copy"><p className="section-kicker on-dark">APRÈS LE SOLEIL</p><h2 className="light-title">Deux nuits.<br /><em>Pas deux fois de suite.</em></h2><p>Mercredi pour le rooftop / club, vendredi pour la grosse sortie. Le samedi, casino à Cassis et aucun réveil à subir le lendemain.</p><div className="night-pills"><a href="https://carte-compass.fr/offres_marseille/r2-le-rooftop/" target="_blank" rel="noreferrer">Compass × R2 ↗</a><a href="https://www.casinosbarriere.com/cassis" target="_blank" rel="noreferrer">Casino Cassis ↗</a></div></div><div className="night-card"><span>NOTRE RÈGLE</span><h3>Un conducteur sobre.<br />Ou un retour réservé.</h3><p>Les voitures restent au parking si on boit. Le plan sympa ne devient jamais le plan dangereux.</p><div className="casino-budgets"><b>Casino</b><span>20 €</span><span>35 €</span><span>50 €</span></div></div></section>

      <section className="vote-section section-pad" id="vote"><p className="section-kicker">ON VALIDE ?</p><div className="vote-layout"><div><h2>Les 4 décisions<br /><em>à prendre maintenant.</em></h2><p>Pas besoin de tout bloquer. Les activités mer à l’impro et les bars se décident sur place.</p></div><ol className="vote-list"><li className="done"><span>✓</span><div><b>Bateau Bleue Évasion — validé</b><p>130 € par personne. Choisir rapidement le créneau / bateau exact pour neuf.</p></div></li><li><span>02</span><div><b>Kayak 2 h en 3 triples ?</b><p>120 € pour 9, soit 13,33 € chacun. Le choix recommandé.</p></div></li><li><span>03</span><div><b>Karting Rognac : 2 sessions ?</b><p>333 € groupe. Créneau vendredi 17h30 à demander.</p></div></li><li><span>04</span><div><b>Qui prend Compass ?</b><p>2,99 € le mois, utile pour R2 et les bons plans Aix.</p></div></li></ol></div></section>

      <footer><div className="footer-brand">MAR<span>26</span></div><p>Fait pour les vacances, pas pour le stress.</p><a href="#home">Retour en haut ↑</a></footer>
    </main>
  );
}
