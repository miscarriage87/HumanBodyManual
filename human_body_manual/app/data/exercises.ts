
export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Anfänger' | 'Fortgeschritten' | 'Experte';
  duration: string;
  instructions: string[];
  benefits: string[];
  tips: string[];
  warnings?: string[];
  hasTimer?: boolean;
  timerConfig?: {
    inhale: number;
    hold: number;
    exhale: number;
    cycles: number;
  };
  scientificBackground?: string;
  icon: string;
  slug: string;
}

export const exercises: Exercise[] = [
  // Nervensystem & Vagusnerv
  {
    id: 'vagus-atem-1',
    title: '4-7-8 Atemtechnik',
    description: 'Eine kraftvolle Atemübung zur sofortigen Beruhigung des Nervensystems',
    category: 'nervensystem',
    difficulty: 'Anfänger',
    duration: '5-10 Minuten',
    hasTimer: true,
    timerConfig: { inhale: 4, hold: 7, exhale: 8, cycles: 4 },
    instructions: [
      'Setze dich bequem hin oder lege dich entspannt auf den Rücken',
      'Lege eine Hand auf die Brust, die andere auf den Bauch',
      'Atme vollständig durch den Mund aus, dabei sollte ein zischendes Geräusch entstehen',
      'Schließe den Mund und atme 4 Sekunden lang ruhig durch die Nase ein',
      'Halte den Atem für 7 Sekunden an',
      'Atme 8 Sekunden lang vollständig durch den Mund aus',
      'Wiederhole diesen Zyklus 4 mal zu Beginn, steigere dich langsam auf 8 Zyklen'
    ],
    benefits: [
      'Aktiviert das parasympathische Nervensystem',
      'Senkt Herzfrequenz und Blutdruck',
      'Reduziert Stress und Angst binnen Minuten',
      'Verbessert die Schlafqualität',
      'Stärkt die Konzentrationsfähigkeit'
    ],
    tips: [
      'Übe zuerst ohne Timer, um ein Gefühl für den Rhythmus zu entwickeln',
      'Die Zungenspitze sollte hinter den oberen Schneidezähnen ruhen',
      'Falls Schwindel auftritt, pausiere und atme normal weiter',
      'Praktiziere idealerweise zur gleichen Tageszeit für bessere Gewöhnung'
    ],
    warnings: [
      'Bei Herzproblemen oder Atemwegserkrankungen vorher ärztlich abklären',
      'Nicht während der Schwangerschaft ohne ärztliche Beratung anwenden',
      'Bei Schwindel oder Unwohlsein sofort stoppen'
    ],
    scientificBackground: 'Die 4-7-8 Technik wurde von Dr. Andrew Weil entwickelt und basiert auf jahrtausendealten Pranayama-Praktiken. Studien zeigen, dass verlängerte Ausatmung den Vagusnerv stimuliert und den Parasympathikus aktiviert, was zu messbar niedrigeren Cortisol- und Adrenalinspiegeln führt.',
    icon: 'Wind',
    slug: '4-7-8-atemtechnik'
  },
  {
    id: 'vagus-kaelte-1',
    title: 'Kaltwasser-Gesichtstauchung',
    description: 'Aktiviere den Tauchreflex für sofortige Vagusnerv-Stimulation',
    category: 'nervensystem',
    difficulty: 'Anfänger',
    duration: '2-3 Minuten',
    instructions: [
      'Fülle eine große Schüssel mit kaltem Wasser (15-18°C)',
      'Atme drei Mal tief ein und aus zur Vorbereitung',
      'Halte den Atem an und tauche dein Gesicht für 15-30 Sekunden ein',
      'Konzentriere dich dabei auf die Kälte um Augen, Nase und obere Wangen',
      'Komme langsam hoch und atme ruhig weiter',
      'Wiederhole 2-3 mal mit kurzen Pausen dazwischen'
    ],
    benefits: [
      'Aktiviert sofort den Tauchreflex über den Vagusnerv',
      'Senkt Herzfrequenz um 10-25%',
      'Reduziert akuten Stress und Panik',
      'Verbessert emotionale Regulation',
      'Stärkt das Immunsystem'
    ],
    tips: [
      'Beginne mit weniger kaltem Wasser und steigere dich langsam',
      'Die Temperatur sollte deutlich spürbar, aber nicht schmerzhaft sein',
      'Ein kalter Waschlappen auf Augen und Wangen wirkt ähnlich',
      'Besonders wirksam bei akutem Stress oder Panikattacken'
    ],
    warnings: [
      'Nicht bei Herzrhythmusstörungen ohne ärztliche Absprache',
      'Vorsicht bei sehr niedrigen Außentemperaturen',
      'Bei Unterzuckerung oder extremer Schwäche vermeiden'
    ],
    scientificBackground: 'Der Tauchreflex ist ein uralter physiologischer Mechanismus, der über spezialisierte Kälterezeptoren im Gesicht den Vagusnerv stimuliert. Dies führt zu einer sofortigen parasympathischen Antwort mit Bradykardie (verlangsamter Herzschlag) und peripherer Vasokonstriktion.',
    icon: 'Waves',
    slug: 'kaltwasser-gesichtstauchung'
  },
  {
    id: 'vagus-summen-1',
    title: 'Therapeutisches Summen & Tönen',
    description: 'Nutze die Kraft der Vibration für tiefe Vagusnerv-Aktivierung',
    category: 'nervensystem',
    difficulty: 'Anfänger',
    duration: '5-15 Minuten',
    instructions: [
      'Setze dich aufrecht hin und schließe deine Augen',
      'Atme tief ein und beginne beim Ausatmen zu summen (Mmmmm)',
      'Spüre die Vibrationen in Brust, Hals und Kopf',
      'Experimentiere mit verschiedenen Tonhöhen - tiefe Töne sind besonders wirksam',
      'Summe das "OM" (Aum) für 30 Sekunden am Stück',
      'Variiere zwischen Summen, "Ahhhh" und "Ooooo" Lauten',
      'Beende mit stillem Nachspüren der Vibrationen'
    ],
    benefits: [
      'Stimuliert Vagusnerv durch Kehlkopfvibrationen',
      'Aktiviert parasympathisches Nervensystem',
      'Verbessert Herzratenvariabilität (HRV)',
      'Löst Verspannungen im Kiefer- und Nackenbereich',
      'Fördert meditative Zustände'
    ],
    tips: [
      'Lege eine Hand auf die Brust, um die Vibrationen zu spüren',
      'Tiefe Töne sind wirksamer als hohe',
      'Übe vor dem Spiegel, um Kiefer- und Gesichtsspannungen zu erkennen',
      'Kombiniere mit bewusster Bauchatmung für verstärkte Wirkung'
    ],
    scientificBackground: 'Vokalisierung aktiviert die Kehlkopfmuskeln, die direkt mit dem Vagusnerv verbunden sind. Die entstehenden Vibrationen stimulieren mechanische Rezeptoren und fördern die Freisetzung von Oxytocin und anderen beruhigenden Neurotransmittern.',
    icon: 'Music',
    slug: 'therapeutisches-summen'
  },

  // Hormonelle Balance
  {
    id: 'hormon-kraft-1',
    title: 'Testosteron-Boost Krafttraining',
    description: 'Wissenschaftlich optimiertes Krafttraining für natürliche Hormonoptimierung',
    category: 'hormone',
    difficulty: 'Fortgeschritten',
    duration: '45-60 Minuten',
    instructions: [
      'Aufwärmen: 10 Minuten dynamische Bewegungen',
      'Führe 3-4 Grundübungen aus: Kniebeugen, Kreuzheben, Bankdrücken, Klimmzüge',
      'Arbeite mit 75-85% deiner Maximalkraft (1RM)',
      '3-5 Sätze á 3-6 Wiederholungen mit 2-3 Minuten Pause',
      'Konzentriere dich auf explosive Bewegungen in der konzentrischen Phase',
      'Pausiere 48-72 Stunden zwischen intensiven Trainingseinheiten',
      'Cool-down: 10 Minuten leichte Bewegung und Dehnung'
    ],
    benefits: [
      'Steigert Testosteronproduktion um 15-40%',
      'Verbessert Insulinsensitivität',
      'Reduziert Cortisol-zu-Testosteron Verhältnis',
      'Fördert Wachstumshormon-Freisetzung',
      'Stärkt Knochendichte und Muskelmasse'
    ],
    tips: [
      'Timing: Vormittags trainieren für optimale Hormonwirkung',
      'Vermeide Übertraining - Qualität vor Quantität',
      'Achte auf ausreichend Schlaf für Regeneration',
      'Kombiniere mit protein- und fettreicher Ernährung'
    ],
    warnings: [
      'Bei Vorerkrankungen ärztliche Freigabe einholen',
      'Korrekte Technik ist wichtiger als schweres Gewicht',
      'Symptome von Übertraining beachten (Müdigkeit, Leistungsabfall)'
    ],
    scientificBackground: 'Schweres Krafttraining mit großen Muskelgruppen führt zu akuter Testosteronfreisetzung und langfristiger Optimierung der Hypothalamus-Hypophysen-Gonaden-Achse. Die mechanische Belastung stimuliert Leydig-Zellen und verbessert die Hormonrezeptor-Sensitivität.',
    icon: 'Dumbbell',
    slug: 'testosteron-boost-krafttraining'
  },
  {
    id: 'hormon-adaptogen-1',
    title: 'Ashwagandha Cortisol-Reset',
    description: 'Nutze das kraftvolle Adaptogen für hormonelles Gleichgewicht',
    category: 'hormone',
    difficulty: 'Anfänger',
    duration: 'Täglich, 4-8 Wochen',
    instructions: [
      'Wähle ein hochwertiges Ashwagandha-Extrakt (KSM-66 oder Sensoril)',
      'Beginne mit 300mg täglich, idealerweise am Abend',
      'Nimm es mit einer fetthaltigen Mahlzeit für bessere Absorption',
      'Steigere nach einer Woche auf 600mg, falls gut vertragen',
      'Beobachte Schlafqualität, Stress-Level und Energie über 4 Wochen',
      'Mache nach 8 Wochen eine 2-wöchige Pause',
      'Dokumentiere Veränderungen in einem Gesundheitstagebuch'
    ],
    benefits: [
      'Senkt Cortisol um bis zu 30%',
      'Erhöht Testosteron bei Männern um 10-22%',
      'Verbessert Stressresilienz und Adaptation',
      'Fördert tiefen, erholsamen Schlaf',
      'Stabilisiert Blutzucker und Insulin'
    ],
    tips: [
      'Kaufe nur standardisierte Extrakte von vertrauenswürdigen Herstellern',
      'Kombiniere mit Meditation für verstärkte Anti-Stress-Wirkung',
      'Bei Schlafproblemen abends nehmen, bei Energie-Mangel morgens',
      'Führe ein Symptom-Tagebuch für objektive Bewertung'
    ],
    warnings: [
      'Nicht bei Autoimmunerkrankungen ohne ärztliche Beratung',
      'Kann mit Schilddrüsenmedikamenten interagieren',
      'In Schwangerschaft und Stillzeit vermeiden',
      'Bei Diabetes Blutzucker engmaschig kontrollieren'
    ],
    scientificBackground: 'Ashwagandha (Withania somnifera) enthält Withanolide, die als natürliche Adaptogene die Hypothalamus-Hypophysen-Nebennieren-Achse modulieren. Klinische Studien zeigen signifikante Reduktionen der Cortisol-Spiegel und Verbesserungen der Hormonbalance.',
    icon: 'Leaf',
    slug: 'ashwagandha-cortisol-reset'
  },

  // Zirkadianer Rhythmus
  {
    id: 'zirkadian-licht-1',
    title: 'Morgendliche Lichtdusche',
    description: 'Synchronisiere deinen Circadianen Rhythmus mit natürlichem Licht',
    category: 'zirkadian',
    difficulty: 'Anfänger',
    duration: '15-30 Minuten',
    instructions: [
      'Gehe binnen 30 Minuten nach dem Aufwachen nach draußen',
      'Schaue in Richtung Himmel (nicht direkt in die Sonne!)',
      'Keine Sonnenbrille oder Fenster zwischen dir und dem Licht',
      'Bei bewölktem Himmel: 20-30 Minuten, bei klarem Himmel: 15-20 Minuten',
      'Kombiniere mit leichter Bewegung wie Spazieren oder Dehnen',
      'Bei schlechtem Wetter: 10.000 Lux Lichttherapie-Lampe für 20-30 Minuten',
      'Praktiziere täglich zur gleichen Zeit für beste Ergebnisse'
    ],
    benefits: [
      'Stellt die innere Uhr optimal ein',
      'Unterdrückt Melatonin-Produktion am Morgen',
      'Steigert Cortisol-Aufwachreaktion',
      'Verbessert Schlafqualität am Abend',
      'Erhöht Vitamin D Synthese',
      'Stabilisiert Stimmung und reduziert Winterdepression'
    ],
    tips: [
      'Je früher nach dem Aufwachen, desto wirksamer',
      'Bei Schichtarbeit: Anpassung der "künstlichen Morgenzeit"',
      'Kombiniere mit Koffein für synergistische Wirkung',
      'Dokumentiere Schlafqualität über 2 Wochen'
    ],
    scientificBackground: 'Natürliches Morgenlicht enthält ca. 10.000-100.000 Lux und aktiviert spezielle Melanopsin-Ganglienzellen in der Retina. Diese senden direkte Signale an den suprachiasmatischen Nucleus, der als Haupt-Taktgeber alle circadianen Rhythmen koordiniert.',
    icon: 'Sunrise',
    slug: 'morgendliche-lichtdusche'
  },
  {
    id: 'zirkadian-blaublock-1',
    title: 'Abendliche Blaulicht-Blockierung',
    description: 'Schütze deine Melatonin-Produktion vor künstlichem Licht',
    category: 'zirkadian',
    difficulty: 'Anfänger',
    duration: '2-3 Stunden vor Schlafenszeit',
    instructions: [
      'Setze 2-3 Stunden vor dem Schlafengehen eine Blaulicht-Filterbrille auf',
      'Dimme alle Lichter auf unter 50 Lux (warmes, rötliches Licht)',
      'Verwende f.lux oder Night Shift auf allen Bildschirmen',
      'Tausche LED-Lampen gegen warme Glühbirnen (2700K oder weniger)',
      'Nutze Kerzenlicht oder Salzlampen für Abendstimmung',
      'Vermeide grelle Badezimmerbeleuchtung - nutze schwaches Rotlicht',
      'Schaffe eine konsistente "Licht-Hygiene" Routine'
    ],
    benefits: [
      'Erhält natürliche Melatonin-Produktion',
      'Verbessert Einschlafzeit um 23-58 Minuten',
      'Steigert Tiefschlaf-Phasen',
      'Reduziert digitale Augenbelastung',
      'Stabilisiert circadiane Hormonrhythmen',
      'Verbessert morgendliche Wachheit'
    ],
    tips: [
      'Wähle Brillen mit Orange- oder Rotglas für maximale Blockierung',
      'Smartphone auf "Nicht stören" und Wecker außerhalb des Schlafzimmers',
      'Partner sollten ebenfalls mitmachen für optimale Schlafumgebung',
      'Bei Schichtarbeit: Blaulicht-Blocking nach der Schicht'
    ],
    scientificBackground: 'Blaues Licht (480nm) supprimiert Melatonin-Sekretion der Zirbeldrüse um bis zu 99%. Bereits 13 Lux am Abend können circadiane Rhythmen stören. Blaulicht-Filterung erhält die natürliche Melatonin-Kurve und verbessert Schlafarchitektur messbar.',
    icon: 'Moon',
    slug: 'blaulicht-blockierung'
  },

  // Mikrobiom & Darm-Hirn-Achse  
  {
    id: 'mikrobiom-ferment-1',
    title: 'Mikrobiom-Boost durch Fermentation',
    description: 'Kultiviere beneficial Bakterien für optimale Darmgesundheit',
    category: 'mikrobiom',
    difficulty: 'Fortgeschritten',
    duration: '7-14 Tage Fermentationszeit',
    instructions: [
      'Starte mit einfachem Sauerkraut: 1kg Weißkohl fein hobeln',
      'Mische mit 20g Meersalz (2% des Kohlgewichts)',
      'Knete kräftig bis Flüssigkeit austritt (10-15 Minuten)',
      'Fülle in sterile Gläser, Gemüse muss unter der Lake stehen',
      'Fermentiere 3-7 Tage bei Raumtemperatur, dann kühl stellen',
      'Beginne mit 1 EL täglich, steigere auf 50-100g',
      'Experimentiere mit Kimchi, Kefir oder Kombucha als Variation'
    ],
    benefits: [
      'Erhöht beneficial Bakterien-Diversität',
      'Stärkt Darmbarriere und reduziert "Leaky Gut"',
      'Verbessert Neurotransmitter-Produktion (Serotonin, GABA)',
      'Moduliert Immunsystem und reduziert Entzündungen',
      'Unterstützt Vitamin-Synthese (B12, K2)',
      'Stabilisiert Blutzucker und Insulinresistenz'
    ],
    tips: [
      'Verwende nur chlorfreies Wasser und unraffiniertes Salz',
      'Halte Fermentationsgefäße sauber aber nicht steril',
      'Taste täglich - die Säure sollte angenehm und nicht faulig sein',
      'Beginne langsam um Verdauungsprobleme zu vermeiden'
    ],
    warnings: [
      'Bei Histamin-Intoleranz vorsichtig beginnen',
      'SIBO-Patienten sollten vorher ärztlich abklären',
      'Schimmelbildung bedeutet Neubeginn - nicht konsumieren'
    ],
    scientificBackground: 'Fermentierte Lebensmittel enthalten lebende Probiotika (10^8-10^9 KBE/g) sowie Präbiotika, Enzyme und bioaktive Metaboliten. Sie modulieren die Darm-Hirn-Achse über Vagusnerv, Immunsystem und Neurotransmitter-Synthese direkt im Darm.',
    icon: 'TestTube',
    slug: 'mikrobiom-fermentation'
  },

  // Bewegung & Faszientraining
  {
    id: 'faszien-rolle-1',
    title: 'Intelligentes Faszienrollen',
    description: 'Löse Verklebungen und optimiere dein Bindegewebe-Netzwerk',
    category: 'bewegung',
    difficulty: 'Anfänger',
    duration: '15-20 Minuten',
    instructions: [
      'Beginne mit einer mittelharten Faszienrolle (nicht zu hart!)',
      'Rolle langsam mit 1-2cm pro Sekunde über die Muskeln',
      'Bei schmerzhaften Punkten: 30-60 Sekunden sanft verweilen',
      'Atme tief und entspannt - niemals den Atem anhalten',
      'Vermeide Rollen über Gelenke, Knochen oder akute Verletzungen',
      'Folge: Waden → Oberschenkel → Gesäß → Rücken → Schultern',
      'Beende mit sanften Dehnungen der behandelten Bereiche'
    ],
    benefits: [
      'Verbessert Faszien-Elastizität und Gleitfähigkeit',
      'Reduziert muskuläre Spannungen und Trigger Points',
      'Steigert Durchblutung und Lymphdrainage',
      'Erhöht Beweglichkeit und Gelenkamplitude',
      'Beschleunigt Regeneration nach Training',
      'Verbessert Propriozeption und Körperwahrnehmung'
    ],
    tips: [
      'Weniger Druck ist oft mehr - höre auf deinen Körper',
      'Trinke nach dem Rollen viel Wasser für bessere Entgiftung',
      'Kombiniere mit aktiven Bewegungen für optimale Wirkung',
      'Verschiedene Rollenformen für unterschiedliche Körperbereiche nutzen'
    ],
    warnings: [
      'Nicht bei akuten Entzündungen oder Verletzungen anwenden',
      'Vorsicht bei Blutverdünnern oder Gerinnungsstörungen',
      'Bei starken Schmerzen oder Verschlechterung pausieren'
    ],
    scientificBackground: 'Faszienrollen stimuliert Mechanorezeptoren im Bindegewebe und moduliert das autonome Nervensystem. Studien zeigen Verbesserungen der Gelenkbeweglichkeit um 10-40% sowie Reduktionen von Muskelsteifigkeit durch verbesserte viskoelastische Eigenschaften.',
    icon: 'RotateCcw',
    slug: 'faszienrollen'
  },

  // Fasten & Autophagie
  {
    id: 'fasten-16-8-1',
    title: '16:8 Intervallfasten',
    description: 'Aktiviere Autophagie und metabolische Flexibilität',
    category: 'fasten',
    difficulty: 'Anfänger',
    duration: 'Täglich, 4+ Wochen',
    instructions: [
      'Wähle dein 8-Stunden Essensfenster (z.B. 12:00-20:00 Uhr)',
      'Trinke außerhalb nur Wasser, ungesüßten Tee oder schwarzen Kaffee',
      'Beginne mit 12:12, steigere über 2 Wochen auf 16:8',
      'Esse in der Essenszeit nährstoffdichte, vollwertige Mahlzeiten',
      'Höre auf deine Hunger- und Sättigungssignale',
      'Halte Elektrolyte aufrecht: Salz, Magnesium, Kalium',
      'Dokumentiere Energie, Schlaf und Verdauung über 4 Wochen'
    ],
    benefits: [
      'Aktiviert zelluläre Autophagie nach 12-16 Stunden',
      'Verbessert Insulinsensitivität und Blutzucker',
      'Fördert Fettverbrennung und metabolische Flexibilität',
      'Steigert Wachstumshormon-Ausschüttung',
      'Reduziert Entzündungsmarker (CRP, IL-6)',
      'Unterstützt Neuroplastizität und BDNF-Produktion'
    ],
    tips: [
      'Starte langsam - der Körper braucht 2-4 Wochen zur Adaptation',
      'Bei Unterzucker: unterbreche das Fasten',
      'Frauen: passe an Zyklus an, pausiere bei Stress',
      'Koffein kann anfänglichen Hunger dämpfen'
    ],
    warnings: [
      'Nicht bei Essstörungen, Diabetes Typ 1 oder Schwangerschaft',
      'Bei Medikamenten-Einnahme ärztlich abklären',
      'Symptome wie Schwäche, Schwindel ernst nehmen'
    ],
    scientificBackground: 'Intervallfasten aktiviert den mTOR-Pfad und induziert Autophagie - den zellulären Recycling-Prozess. Nach 12-16 Stunden ohne Nahrung wechselt der Stoffwechsel in Ketose und beginnt, beschädigte Zellorganellen abzubauen und zu erneuern.',
    icon: 'Clock',
    slug: '16-8-intervallfasten'
  },

  // Kältetherapie
  {
    id: 'kaelte-dusche-1',
    title: 'Progressives Kälte-Protokoll',
    description: 'Baue Kälte-Resistenz auf für Immunstärkung und mentale Klarheit',
    category: 'kaelte',
    difficulty: 'Fortgeschritten',
    duration: '2-5 Minuten täglich',
    instructions: [
      'Woche 1: Beende normale Dusche mit 30 Sekunden kaltem Wasser',
      'Woche 2: Steigere auf 60 Sekunden, konzentriere dich auf ruhige Atmung',
      'Woche 3: 90 Sekunden kalt, beginne mit kaltem Wasser',
      'Woche 4+: 2-5 Minuten komplett kalt (10-15°C)',
      'Atme während der Kälte tief und kontrolliert',
      'Bewege dich nicht hektisch - stehe ruhig im Wasserstrahl',
      'Nach der Dusche: nicht sofort aufwärmen, Körper arbeiten lassen'
    ],
    benefits: [
      'Aktiviert braunes Fettgewebe und Thermogenese',
      'Stärkt Immunsystem durch Kälteschock-Proteine',
      'Erhöht Noradrenalin um 200-300%',
      'Verbessert Stressresilienz und mentale Härte',
      'Reduziert Entzündungen und oxidativen Stress',
      'Steigert Dopamin-Spiegel langfristig'
    ],
    tips: [
      'Beginne langsam - Adaptation braucht Zeit',
      'Atme nie hyperventilierend, sondern ruhig und tief',
      'Bewegung nach der Kälte verstärkt den Wärmeschock',
      'Kombiniere mit Wim Hof Atemtechnik für verstärkte Wirkung'
    ],
    warnings: [
      'Nicht bei Herzproblemen ohne ärztliche Freigabe',
      'Bei extremer Kälte-Reaktion langsamer steigern',
      'Schwangerschaft: nur nach ärztlicher Beratung'
    ],
    scientificBackground: 'Kälteexposition aktiviert das sympathische Nervensystem und führt zur Freisetzung von Noradrenalin, Kälteschock-Proteinen und Anti-inflammatorischen Zytokinen. Brown Adipose Tissue (BAT) wird aktiviert und verbrennt Glucose/Fette für Wärmeproduktion.',
    icon: 'Thermometer',
    slug: 'progressives-kaelte-protokoll'
  },

  // Lichttherapie
  {
    id: 'licht-rotlicht-1',
    title: 'Rotlicht-Photobiomodulation',
    description: 'Nutze heilende Lichtfrequenzen für mitochondriale Regeneration',
    category: 'licht',
    difficulty: 'Anfänger',
    duration: '10-20 Minuten täglich',
    instructions: [
      'Verwende LED-Panel mit 660nm (rot) und 850nm (nahinfrarot)',
      'Positioniere dich 15-30cm vom Gerät entfernt',
      'Beginne mit 10 Minuten, steigere auf maximal 20 Minuten',
      'Ideal am Morgen oder vor dem Training für Energiesteigerung',
      'Bestrahle verschiedene Körperbereiche: Gesicht, Brust, Rücken',
      'Nutze Schutzbrille oder schließe Augen bei Gesichtsbehandlung',
      'Sei konsistent - tägliche Anwendung für 4-8 Wochen'
    ],
    benefits: [
      'Stimuliert mitochondriale ATP-Produktion',
      'Beschleunigt Wundheilung und Geweberegeneration',
      'Reduziert Entzündungen und oxidativen Stress',
      'Verbessert Hautqualität und Kollagenproduktion',
      'Steigert zelluläre Energie und Vitalität',
      'Unterstützt Muskelregeneration nach Training'
    ],
    tips: [
      'Investiere in qualitativ hochwertige LED-Panels',
      'Kombiniere rotes (660nm) und nahinfrarotes (850nm) Licht',
      'Nackte Haut für optimale Lichtpenetration',
      'Führe Foto-Dokumentation bei Hautverbesserungen'
    ],
    warnings: [
      'Nicht bei Schwangerschaft auf Bauch/Beckenbereich',
      'Vorsicht bei Medikamenten, die Lichtempfindlichkeit erhöhen',
      'Bei Hautkrebs oder verdächtigen Muttermalen ärztlich abklären'
    ],
    scientificBackground: 'Rotes und nahinfrarotes Licht wird von Cytochrom C Oxidase in den Mitochondrien absorbiert, was die ATP-Synthese stimuliert. Dies führt zu verbesserter zellulärer Funktion, reduzierter Inflammation und beschleunigter Heilung durch erhöhte Kollagensynthese.',
    icon: 'Zap',
    slug: 'rotlicht-photobiomodulation'
  }
];

export const getExercisesByCategory = (category: string): Exercise[] => {
  return exercises.filter(exercise => exercise.category === category);
};

export const getExerciseBySlug = (slug: string): Exercise | undefined => {
  return exercises.find(exercise => exercise.slug === slug);
};

export const getAllExerciseSlugs = (): string[] => {
  return exercises.map(exercise => exercise.slug);
};

export const getExercisesByDifficulty = (difficulty: Exercise['difficulty']): Exercise[] => {
  return exercises.filter(exercise => exercise.difficulty === difficulty);
};
