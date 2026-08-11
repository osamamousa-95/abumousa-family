/**
 * Historical content — presented as established history.
 * Attribution for sources lives in the site footer, not inside the narrative.
 */

export interface Era {
  id: string;
  order: string;
  years: string;
  title: { ar: string; en: string };
  place: { ar: string; en: string };
  lead: { ar: string; en: string };
  body: { ar: string; en: string }[];
  quote?: { ar: string; en: string };
  accent: string;
}

export const ERAS: Era[] = [
  {
    id: 'hejaz',
    order: '١',
    years: 'قبل ١٨١٠م',
    accent: '#B8892B',
    title: { ar: 'الحجاز — ديار بني سالم', en: 'The Hejaz — Lands of Bani Salim' },
    place: { ar: 'بين مكة والمدينة وينبع', en: 'Between Mecca, Medina and Yanbu' },
    lead: {
      ar: 'في الشريط الممتد بين البحر الأحمر وجبال الحجاز نشأت الأسرة، ضمن واحدة من أكبر قبائل الجزيرة العربية.',
      en: 'The family arose in the strip between the Red Sea and the Hejaz mountains, within one of the largest tribes of Arabia.',
    },
    body: [
      {
        ar: 'قبيلة حرب من أكبر قبائل الحجاز وأوسعها انتشاراً، تمتد ديارها من المدينة المنورة شمالاً إلى القنفذة جنوباً، ومن جدة والبحر الأحمر غرباً إلى ما وراء وادي الرمة شرقاً. وتنقسم القبيلة إلى عمارتين كبيرتين: بني سالم وبني مسروح.',
        en: 'The Harb tribe is among the largest and most widely spread in the Hejaz, its lands reaching from Medina in the north to al-Qunfudhah in the south, and from Jeddah and the Red Sea eastward beyond Wadi al-Rummah. The tribe divides into two great branches: Bani Salim and Bani Masruh.',
      },
      {
        ar: 'وهذه الأسرة من بني سالم — العمارة التي تسكن شرق المدينة المنورة وجنوبها، وتضم أفخاذاً معروفة يتوزع أبناؤها اليوم بين الحجاز ونجد ومهاجر بعيدة.',
        en: 'This family belongs to Bani Salim — the branch settled east and south of Medina, comprising well-known clans whose descendants are today spread between the Hejaz, Najd, and distant places of migration.',
      },
      {
        ar: 'في مطلع القرن التاسع عشر أصاب الحجاز قحطٌ شديد. كانت المدينة المنورة تعتمد في قوتها على قوافل الميرة القادمة من مصر، فلما انقطعت بسبب الاضطرابات والحروب، اشتد الجوع حتى سجّل المؤرخون موت كثير من الأهالي. عندها بدأت هجرات جماعية نحو مصر — البلد الذي كان يأتي منه الطعام.',
        en: 'In the early nineteenth century a severe famine struck the Hejaz. Medina depended for its food on grain caravans from Egypt; when war and unrest cut them off, hunger deepened until chroniclers recorded widespread death. Mass migrations began toward Egypt — the land the food had come from.',
      },
    ],
  },
  {
    id: 'egypt',
    order: '٢',
    years: '١٨١٠ – ١٨٤٠م',
    accent: '#5E6B47',
    title: { ar: 'مصر — كفر شبين بالقليوبية', en: 'Egypt — Kafr Shubin, Qalyubia' },
    place: { ar: 'قرب شبين القناطر، دلتا النيل', en: 'Near Shibin al-Qanatir, Nile Delta' },
    lead: {
      ar: 'خرج زين الدين الحربي من الحجاز بزوجته وابنه الصغير موسى، فنزل قرية في ريف الدلتا كانت أول محطة في رحلة امتدت قرنين.',
      en: 'Zain al-Din al-Harbi left the Hejaz with his wife and young son Mousa, settling in a Delta village — the first stop on a journey that would span two centuries.',
    },
    body: [
      {
        ar: 'نزلت الأسرة قرية كفر شبين، على بعد نحو أربعة كيلومترات من شبين القناطر بمديرية القليوبية. وهي أرض زراعية خصبة في قلب الدلتا، بعيدة كل البعد عن بادية الحجاز التي جاؤوا منها.',
        en: 'The family settled in Kafr Shubin, some four kilometres from Shibin al-Qanatir in Qalyubia. It was fertile farmland in the heart of the Delta — as distant as could be from the Hejazi desert they had left.',
      },
      {
        ar: 'توفي زين الدين بعد نحو سنتين من وصوله، ودُفن في القرية. وتوفيت زوجته بعده بست سنوات فدُفنت بجواره. وبقي موسى — الابن الوحيد — يتيماً في بلد غريب، وهو الذي ستُنسب إليه العائلة كلها من بعد.',
        en: 'Zain al-Din died about two years after arriving and was buried in the village. His wife died six years later and was buried beside him. Mousa — the only son — remained an orphan in a foreign land; it is to him that the entire family would afterwards be named.',
      },
      {
        ar: 'كبر موسى وتزوّج فتاة من قبائل عربية كانت قد قدمت مع والدها من الجزيرة العربية، فأنجب ستة أولاد وبنتاً. ومن هذا البيت الواحد في قرية مصرية صغيرة تفرّعت كل بيوت العائلة اليوم.',
        en: 'Mousa grew, and married a woman of Arab tribes who had come with her father from Arabia. He fathered six sons and a daughter. From this single household in a small Egyptian village descend every branch of the family today.',
      },
    ],
  },
  {
    id: 'palestine',
    order: '٣',
    years: '١٨٤٠ – ١٩٤٨م',
    accent: '#7B2D26',
    title: { ar: 'فلسطين — وادي الشلالة وبئر السبع', en: 'Palestine — Wadi al-Shallala and Beersheba' },
    place: { ar: 'شمال النقب', en: 'Northern Negev' },
    lead: {
      ar: 'انتقلت الأسرة شرقاً إلى بادية بئر السبع، فاستقرت على أرض زراعية خصبة، وخاضت هناك حروب القبائل التي شكّلت النقب في القرن التاسع عشر.',
      en: 'The family moved east to the Beersheba steppe, settling on fertile farmland and entering the tribal wars that shaped the nineteenth-century Negev.',
    },
    body: [
      {
        ar: 'استقرّ أبناء موسى في موقع الدفنات على الضفة الشرقية لوادي الشلالة، على بعد نحو أربعة كيلومترات من قضاء بئر السبع. أرض زراعية خصبة سمحت لهم أن يجمعوا بين الزرع والرعي.',
        en: 'The sons of Mousa settled at al-Dafanat on the eastern bank of Wadi al-Shallala, some four kilometres from the district of Beersheba — fertile land that allowed them to combine farming with herding.',
      },
      {
        ar: 'كان النقب في ذلك القرن ساحة صراع متصل بين قبائله الكبرى: الترابين والتياها والعزازمة والجبارات والحناجرة. وقد خاضت الأسرة حربين: الأولى انتصرت فيها وحلفاؤها على التياها بعد أربع سنوات من القتال، وكان أشهر مقاتلي أولاد موسى فيها أكبرهم عبد العاطي.',
        en: 'The Negev in that century was a theatre of continuous conflict among its great tribes: the Tarabin, Tiyaha, Azazma, Jabarat and Hanajra. The family fought two wars: in the first, they and their allies defeated the Tiyaha after four years of fighting, and the most renowned fighter among the sons of Mousa was the eldest, Abd al-Ati.',
      },
      {
        ar: 'ثم قامت حرب ثانية مع قبيلة العزازمة، استُشهد فيها ثلاثة من أبناء موسى: حسين وإسماعيل وعبد الرحمن. ودُفنوا عند مقام الشيخ نوران في موقع يُعرف بقوز العز — سُمّي كذلك لأن المنتصرين اعتزّوا فيه بنصرهم، و«القوز» في لسان أهل النقب هو الرابية المرتفعة عمّا حولها.',
        en: 'A second war followed against the Azazma, in which three of Mousa\'s sons were killed: Hussein, Ismail and Abd al-Rahman. They were buried at the shrine of Sheikh Nuran at a place called Qawz al-Izz — named for the pride the victors took in their triumph there; a *qawz* in Negev speech being a mound rising above the land around it.',
      },
      {
        ar: 'وتوفي موسى فدُفن في الخلصة جنوب بئر السبع. وبقي من أولاده ثلاثة: عبد العاطي ومحمد وعبد النبي — وهؤلاء الثلاثة هم أصول كل بيوت العائلة القائمة اليوم.',
        en: 'Mousa died and was buried at al-Khalasa, south of Beersheba. Three of his sons survived him: Abd al-Ati, Muhammad and Abd al-Nabi — and from these three descend all the living branches of the family.',
      },
    ],
    quote: {
      ar: 'ويُسمّى بقوز العز لأنهم انتصروا فيه على أعدائهم واعتزّوا بهذا الانتصار، ويُسمّى بالقوز لأنه مرتفع عن الأراضي التي تحيط به',
      en: 'It is called Qawz al-Izz because there they overcame their enemies and took pride in that victory; and called a qawz because it rises above the lands that surround it',
    },
  },
  {
    id: 'diaspora',
    order: '٤',
    years: '١٩٤٨م – اليوم',
    accent: '#1F6FA8',
    title: { ar: 'خان يونس والشتات', en: 'Khan Younis and the Diaspora' },
    place: { ar: 'غزة، الأردن، مصر', en: 'Gaza, Jordan, Egypt' },
    lead: {
      ar: 'اقتُلعت العائلة من ديار بئر السبع سنة ١٩٤٨، فكانت الهجرة الثالثة في تاريخها — ومنها تفرّقت في أكثر من بلد.',
      en: 'Uprooted from the Beersheba lands in 1948 — the third migration in the family\'s history — from which it scattered across several countries.',
    },
    body: [
      {
        ar: 'مع نكبة عام ١٩٤٨ هُجّرت قبائل بئر السبع عن أراضيها، فلجأت فروع العائلة إلى خان يونس وعبسان الصغيرة في قطاع غزة. وتشهد على ذلك مدافن العائلة التي تنتقل في هذا الجيل من قوز العز والخلصة إلى خان يونس وعبسان.',
        en: 'With the Nakba of 1948 the tribes of Beersheba were driven from their lands, and branches of the family took refuge in Khan Younis and Abasan al-Saghira in the Gaza Strip. The family\'s burial places bear witness: in this generation they shift from Qawz al-Izz and al-Khalasa to Khan Younis and Abasan.',
      },
      {
        ar: 'ومن غزة امتدت فروع أخرى إلى الأردن وسواها، حيث تقيم اليوم أسر من العائلة في عمّان وغيرها.',
        en: 'From Gaza further branches extended to Jordan and beyond, where families now live in Amman and elsewhere.',
      },
      {
        ar: 'أما فرع عبد النبي بن موسى فلم يرحل مع إخوته إلى فلسطين، بل بقيت ذريته في مصر حيث نزل الجدّ الأول. ومدافنهم إلى اليوم في كفر شبين وشبين الكوم بالمنوفية، وأسماء أجيالهم الأخيرة مصرية خالصة — فرعٌ من العائلة عاش قرنين في البلد الذي كان محطة عبور للآخرين.',
        en: 'The branch of Abd al-Nabi, son of Mousa, did not travel with his brothers to Palestine; his descendants remained in Egypt where the first grandfather had settled. Their graves lie to this day in Kafr Shubin and Shibin al-Kawm in Monufia, and the names of their latest generations are wholly Egyptian — a branch that lived two centuries in the country that was, for the others, only a waypoint.',
      },
    ],
  },
];

// ─────────────────────────── Timeline ───────────────────────────

export interface TimelineEvent {
  year: string;
  yearNum: number;
  title: { ar: string; en: string };
  body: { ar: string; en: string };
  kind: 'tribe' | 'family' | 'conflict' | 'migration';
}

export const TIMELINE: TimelineEvent[] = [
  {
    year: '١٣١هـ / ٧٤٨م', yearNum: 748, kind: 'tribe',
    title: { ar: 'حرب تنزل الحجاز', en: 'Harb settles the Hejaz' },
    body: {
      ar: 'تذكر المصادر التاريخية أن قبيلة حرب انتقلت من صعدة في اليمن إلى ديار الحجاز في هذه الفترة، فاستقرت بين مكة والمدينة وينبع، وصارت من أكبر قبائل المنطقة.',
      en: 'Historical sources record that the Harb tribe moved from Sa\'da in Yemen to the Hejaz in this period, settling between Mecca, Medina and Yanbu, and becoming one of the region\'s largest tribes.',
    },
  },
  {
    year: '~١٨٠٤م', yearNum: 1804, kind: 'conflict',
    title: { ar: 'مجاعة الحجاز الكبرى', en: 'The Great Hejaz Famine' },
    body: {
      ar: 'انقطاع قوافل الميرة المصرية عن المدينة المنورة بسبب الحروب والاضطرابات، فاشتد القحط وعمّت المجاعة حتى بدأت هجرات جماعية من الحجاز.',
      en: 'Egyptian grain caravans to Medina were cut off by war and unrest. Drought deepened into famine, and mass migration out of the Hejaz began.',
    },
  },
  {
    year: '~١٨١٠م', yearNum: 1810, kind: 'migration',
    title: { ar: 'هجرة زين الدين إلى مصر', en: 'Zain al-Din migrates to Egypt' },
    body: {
      ar: 'خرج زين الدين الحربي من ديار بني سالم بزوجته وابنه الصغير موسى، ونزل قرية كفر شبين قرب شبين القناطر بالقليوبية.',
      en: 'Zain al-Din al-Harbi left the lands of Bani Salim with his wife and young son Mousa, settling in Kafr Shubin near Shibin al-Qanatir in Qalyubia.',
    },
  },
  {
    year: '~١٨١٢م', yearNum: 1812, kind: 'family',
    title: { ar: 'وفاة زين الدين', en: 'Death of Zain al-Din' },
    body: {
      ar: 'توفي الجدّ الأول بعد نحو سنتين من وصوله مصر، ودُفن في كفر شبين، تاركاً ابنه موسى صغيراً.',
      en: 'The first grandfather died about two years after reaching Egypt and was buried in Kafr Shubin, leaving his son Mousa still a child.',
    },
  },
  {
    year: '~١٨١٨م', yearNum: 1818, kind: 'family',
    title: { ar: 'وفاة زوجته ودفنها بجواره', en: 'His wife dies and is buried beside him' },
    body: {
      ar: 'توفيت بعد زوجها بست سنوات ودُفنت في القرية نفسها، فأصبح موسى وحيداً في مصر.',
      en: 'She died six years after her husband and was buried in the same village, leaving Mousa alone in Egypt.',
    },
  },
  {
    year: 'منتصف القرن ١٩', yearNum: 1850, kind: 'migration',
    title: { ar: 'الانتقال إلى بئر السبع', en: 'Move to Beersheba' },
    body: {
      ar: 'انتقلت الأسرة من مصر إلى شمال النقب، واستقرت على الضفة الشرقية لوادي الشلالة في أرض زراعية خصبة.',
      en: 'The family moved from Egypt to the northern Negev, settling on the eastern bank of Wadi al-Shallala on fertile farmland.',
    },
  },
  {
    year: 'القرن ١٩', yearNum: 1860, kind: 'conflict',
    title: { ar: 'حرب التياها', en: 'The Tiyaha War' },
    body: {
      ar: 'حرب استمرت أربع سنوات انتهت بانتصار الأسرة وحلفائها. وكان أشهر مقاتلي أولاد موسى فيها أكبرهم عبد العاطي.',
      en: 'A four-year war ending in victory for the family and its allies. The most renowned fighter among Mousa\'s sons was the eldest, Abd al-Ati.',
    },
  },
  {
    year: 'القرن ١٩', yearNum: 1870, kind: 'conflict',
    title: { ar: 'حرب العزازمة — استشهاد ثلاثة إخوة', en: 'The Azazma War — three brothers killed' },
    body: {
      ar: 'استُشهد حسين وإسماعيل وعبد الرحمن أبناء موسى، ودُفنوا عند مقام الشيخ نوران في قوز العز. وبقي من الإخوة ثلاثة هم أصول العائلة كلها.',
      en: 'Hussein, Ismail and Abd al-Rahman, sons of Mousa, were killed and buried at the shrine of Sheikh Nuran in Qawz al-Izz. Three brothers survived — the origin of every branch today.',
    },
  },
  {
    year: '١٩٣٤م', yearNum: 1934, kind: 'tribe',
    title: { ar: 'توثيق قبائل بئر السبع', en: 'Documenting the tribes of Beersheba' },
    body: {
      ar: 'صدر كتاب «تاريخ بئر السبع وقبائلها» لعارف العارف، وهو المرجع الأوسع لحروب النقب وأنساب قبائله التي عاشتها العائلة.',
      en: 'Aref al-Aref published "History of Beersheba and its Tribes", the fullest reference for the Negev wars and tribal genealogies the family lived through.',
    },
  },
  {
    year: '١٩٤٨م', yearNum: 1948, kind: 'migration',
    title: { ar: 'النكبة واللجوء إلى خان يونس', en: 'The Nakba and refuge in Khan Younis' },
    body: {
      ar: 'هُجّرت قبائل بئر السبع عن أراضيها، فلجأت فروع العائلة إلى خان يونس وعبسان الصغيرة، ومنها امتدت لاحقاً إلى الأردن وغيرها.',
      en: 'The tribes of Beersheba were driven from their lands. Branches of the family took refuge in Khan Younis and Abasan al-Saghira, later extending to Jordan and beyond.',
    },
  },
];

// ─────────────────────────── Places ───────────────────────────

export interface PlaceInfo {
  id: string;
  name: { ar: string; en: string };
  region: { ar: string; en: string };
  lat: number;
  lng: number;
  order: number;
  era: string;
  body: { ar: string; en: string };
  isBurial?: boolean;
}

export const PLACES: PlaceInfo[] = [
  {
    id: 'hejaz', order: 1, era: 'hejaz', lat: 24.47, lng: 39.61,
    name: { ar: 'ديار بني سالم', en: 'Lands of Bani Salim' },
    region: { ar: 'الحجاز، شبه الجزيرة العربية', en: 'Hejaz, Arabian Peninsula' },
    body: {
      ar: 'الموطن الأول للعائلة ضمن قبيلة حرب، في الشريط الممتد بين مكة والمدينة وينبع. ومنه كانت الهجرة الأولى زمن القحط نحو سنة ١٨١٠م.',
      en: 'The family\'s first homeland within the Harb tribe, in the belt between Mecca, Medina and Yanbu. From here came the first migration during the famine, around 1810.',
    },
  },
  {
    id: 'kafr-shubin', order: 2, era: 'egypt', lat: 30.30, lng: 31.32, isBurial: true,
    name: { ar: 'كفر شبين', en: 'Kafr Shubin' },
    region: { ar: 'القليوبية، مصر', en: 'Qalyubia, Egypt' },
    body: {
      ar: 'قرية في ريف الدلتا قرب شبين القناطر، نزلها زين الدين الحربي فكانت أول مستقرّ للعائلة خارج الجزيرة. وفيها قبره وقبر زوجته، وفيها نشأ ابنه موسى وتزوّج وأنجب.',
      en: 'A Delta village near Shibin al-Qanatir where Zain al-Din al-Harbi settled — the family\'s first home outside Arabia. His grave and his wife\'s lie here, and here his son Mousa grew, married and had children.',
    },
  },
  {
    id: 'wadi-al-shallala', order: 3, era: 'palestine', lat: 31.32, lng: 34.55,
    name: { ar: 'وادي الشلالة — الدفنات', en: 'Wadi al-Shallala — al-Dafanat' },
    region: { ar: 'قضاء بئر السبع، فلسطين', en: 'Beersheba District, Palestine' },
    body: {
      ar: 'مستقرّ العائلة في فلسطين على الضفة الشرقية للوادي، على بعد نحو أربعة كيلومترات من بئر السبع. أرض زراعية خصبة جمعوا فيها بين الزرع والرعي حتى نكبة ١٩٤٨.',
      en: 'The family seat in Palestine on the wadi\'s eastern bank, some four kilometres from Beersheba. Fertile farmland where they combined cultivation and herding until the Nakba of 1948.',
    },
  },
  {
    id: 'qawz-al-izz', order: 4, era: 'palestine', lat: 31.29, lng: 34.42, isBurial: true,
    name: { ar: 'قوز العز — مقام الشيخ نوران', en: 'Qawz al-Izz — Shrine of Sheikh Nuran' },
    region: { ar: 'شمال غرب النقب', en: 'North-western Negev' },
    body: {
      ar: 'رابية مرتفعة عمّا حولها، سُمّيت بقوز العز لاعتزاز المنتصرين بنصرهم فيها. وفيها قبور حسين وإسماعيل وعبد الرحمن أبناء موسى الذين استُشهدوا في حرب العزازمة، ومعهم عدد كبير من أبناء الأجيال التالية.',
      en: 'A mound rising above the land around it, named for the pride the victors took in their triumph there. It holds the graves of Hussein, Ismail and Abd al-Rahman, sons of Mousa, killed in the Azazma war, together with many of the generations that followed.',
    },
  },
  {
    id: 'al-khalasa', order: 5, era: 'palestine', lat: 31.10, lng: 34.75, isBurial: true,
    name: { ar: 'الخلصة', en: 'Al-Khalasa' },
    region: { ar: 'جنوب بئر السبع', en: 'South of Beersheba' },
    body: {
      ar: 'موقع أثري قديم جنوب بئر السبع بنحو أربعين كيلومتراً، فيه قبر موسى بن زين الدين — الجدّ الذي تحمل العائلة اسمه.',
      en: 'An ancient site some forty kilometres south of Beersheba, holding the grave of Mousa son of Zain al-Din — the ancestor whose name the family carries.',
    },
  },
  {
    id: 'khan-younis', order: 6, era: 'diaspora', lat: 31.34, lng: 34.30, isBurial: true,
    name: { ar: 'خان يونس', en: 'Khan Younis' },
    region: { ar: 'قطاع غزة، فلسطين', en: 'Gaza Strip, Palestine' },
    body: {
      ar: 'إليها لجأت فروع العائلة بعد تهجير قبائل بئر السبع سنة ١٩٤٨، وفيها مدافن كثير من أبنائها منذ ذلك الجيل.',
      en: 'Refuge of the family branches after the expulsion of the Beersheba tribes in 1948, and the burial place of many of its sons from that generation onward.',
    },
  },
  {
    id: 'abasan', order: 7, era: 'diaspora', lat: 31.32, lng: 34.34, isBurial: true,
    name: { ar: 'عبسان الصغيرة', en: 'Abasan al-Saghira' },
    region: { ar: 'شرق خان يونس', en: 'East of Khan Younis' },
    body: {
      ar: 'بلدة شرق خان يونس استقر فيها فرع من العائلة بعد النكبة، وفيها مدافن من فرع محمد بن موسى.',
      en: 'A town east of Khan Younis where a branch settled after the Nakba, holding graves of the line of Muhammad son of Mousa.',
    },
  },
  {
    id: 'shibin-al-kawm', order: 8, era: 'diaspora', lat: 30.55, lng: 31.01, isBurial: true,
    name: { ar: 'شبين الكوم', en: 'Shibin al-Kawm' },
    region: { ar: 'المنوفية، مصر', en: 'Monufia, Egypt' },
    body: {
      ar: 'مدينة في دلتا مصر فيها مدافن من فرع عبد النبي بن موسى — الفرع الذي بقي في مصر ولم يرحل إلى فلسطين، وما زالت ذريته هناك.',
      en: 'A Delta city holding graves of the line of Abd al-Nabi son of Mousa — the branch that stayed in Egypt rather than moving to Palestine, whose descendants remain there still.',
    },
  },
];

// ─────────────────────────── Tribal context ───────────────────────────

export const TRIBE_ORIGINS = [
  {
    view: { ar: 'قحطانية خولانية', en: 'Qahtani, of Khawlan' },
    detail: {
      ar: 'حرب بن سعد بن سعد بن خولان بن عمرو بن الحاف بن قضاعة، أُجليت عن صعدة إلى الحجاز سنة ١٣١هـ. وهو قول الهمداني في الإكليل، ورجّحه من المحدثين حمد الجاسر وعاتق البلادي، وعليه أكثر أهل القبيلة.',
      en: 'Harb ibn Sa\'d ibn Sa\'d ibn Khawlan ibn Amr ibn al-Haf ibn Quda\'a, displaced from Sa\'da to the Hejaz in 131 AH. This is al-Hamdani\'s account in al-Iklil, favoured by the modern scholars Hamad al-Jasir and Atiq al-Biladi, and held by most of the tribe.',
    },
    weight: 'الأرجح',
  },
  {
    view: { ar: 'عدنانية هلالية', en: 'Adnani, of Bani Hilal' },
    detail: {
      ar: 'أنها من بني هلال بن عامر بن صعصعة، وهو قول ابن حزم والقلقشندي في نهاية الأرب.',
      en: 'That the tribe descends from Bani Hilal ibn Amir ibn Sa\'sa\'a — the view of Ibn Hazm and al-Qalqashandi in Nihayat al-Arab.',
    },
    weight: 'قول ثانٍ',
  },
  {
    view: { ar: 'حلف قبائل', en: 'A confederation' },
    detail: {
      ar: 'أنها ليست قبيلة واحدة يجمعها جدّ، بل حلف قبائل تجمّعت في الحجاز، وهو قول العصامي والزركلي.',
      en: 'That it is not one tribe of common descent but a confederation gathered in the Hejaz — the view of al-Isami and al-Zirikli.',
    },
    weight: 'قول ثالث',
  },
];

export const BANI_SALIM_CLANS = {
  marwah: {
    name: { ar: 'مَرَوّح', en: 'Marwah' },
    clans: ['البلايجة', 'الحوازم', 'الحُجَلة', 'الحنانية', 'الجلادية', 'الحنيطات', 'الردادة', 'الظواهرة', 'مزينة'],
  },
  maymun: {
    name: { ar: 'ميمون', en: 'Maymun' },
    clans: ['الأحامدة', 'الثوابت', 'الجُمَلاء', 'الحيادرة', 'الرُّحَلة', 'الرُّوثان', 'السُّرَحَة', 'صُبح', 'بنو عمرو', 'الغربان', 'القوّاد', 'المحاميد', 'ولد محمد', 'الموارعة', 'الوسَدة', 'بنو يحيى'],
  },
};

export interface RelatedFamily {
  country: { ar: string; en: string };
  flag: string;
  families: string;
  note: { ar: string; en: string };
}

export const RELATED_FAMILIES: RelatedFamily[] = [
  {
    country: { ar: 'فلسطين والأردن', en: 'Palestine & Jordan' }, flag: '🇵🇸',
    families: 'عشيرة السطرية',
    note: {
      ar: 'من فرع الشراري بحرب؛ مرّت بمصر ثم نزلت خان يونس أولاً — مسارٌ يكاد يطابق مسار هذه العائلة، من فخذ مختلف.',
      en: 'Of the Sharari branch of Harb; passed through Egypt then settled first in Khan Younis — a route nearly identical to this family\'s, from a different clan.',
    },
  },
  {
    country: { ar: 'بئر السبع وجنوب الأردن', en: 'Beersheba & southern Jordan' }, flag: '🇯🇴',
    families: 'المحمديون · المحاميد',
    note: {
      ar: 'فخذ من حرب تحالف مع العزازمة في النقب، وأبناء عمومتهم «المحاميد بني سالم» في جنوب الأردن اليوم.',
      en: 'A Harb clan allied with the Azazma in the Negev; their cousins, the Mahamid of Bani Salim, live in southern Jordan today.',
    },
  },
  {
    country: { ar: 'العراق', en: 'Iraq' }, flag: '🇮🇶',
    families: 'الزوينات · آل عِسم · آل السَّفر · آل الحارث · البو رقة',
    note: {
      ar: 'فروع نزحت من الحجاز قديماً واستقرت قرب الأخيضر بمنطقة الشامية.',
      en: 'Branches that migrated from the Hejaz long ago and settled near al-Ukhaidir in the Shamiya region.',
    },
  },
  {
    country: { ar: 'الكويت', en: 'Kuwait' }, flag: '🇰🇼',
    families: 'العتيقي · البغلي · المزيني · الجار الله',
    note: {
      ar: 'العتيقي من الحوازم — أحد أفخاذ بني سالم — ومستقرون في الكويت منذ أكثر من ٢٥٠ سنة.',
      en: 'The Otaiqi are of the Hawazim — one of the Bani Salim clans — settled in Kuwait for over 250 years.',
    },
  },
];
