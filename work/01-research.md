# 01 - Research: paper and parody (Task A)

Author: web-researcher. Single source of truth for every real-world fact on the aviva site (CLAUDE.md rule 8).

## 0. How this was researched (read first)

- **Searches:** about 85 WebSearch queries (standard and extended), covering all nine sections.
- **Full reads:** WebFetch is blocked for almost every host in this environment. Blocked (EGRESS_BLOCKED): wikipedia.org, livescience.com, slate.com, guinnessworldrecords.com, paper.gatech.edu, cl.cam.ac.uk, hypertextbook.com, mathworld.wolfram.com, britishorigami.org, loc.gov, foldnfly.com, english.news.cn, odditycentral.com, ratopati.com, fun.banyu.ai, lusion.co, landing.love, tympanus.net, gutenberg.org, nist.gov, britannica.com, arxiv.org, sciencenews.org, archive.aramcoworld.com, mentalfloss.com. I did not try to get round any block.
- **Read in full (external):** only two, both GitHub-hosted: `raw.githubusercontent.com/lusionltd/ORYZO-1/main/README.md` and `github.com/lusionltd/ORYZO-1`. Local files read in full: `work/00-mission.md`, `reference/VIDEO_NOTES.md`. So the "15 sources read in full" target was **not met**; it is impossible here.
- **Therefore every fact below comes from search-result summaries**, each tagged with a confidence level:
  - `high` = two or more independent sources agree, or a primary source (standards body, record-keeper, museum) is quoted in the result;
  - `medium` = one reputable source's summary, or several sources that agree but all secondary;
  - `low` = single weak source or a contested figure. **Do not publish `low` items as facts.**
  - `derived` = my own arithmetic from sourced numbers (maths shown; check it before use).
- Today's date is 2026-10-01. Records and prices are "as of" that date as far as the sources show.
- I could not visit oryzo.ai or the Lusion blog. ORYZO's jokes (section 7) come from `reference/VIDEO_NOTES.md`, the ORYZO-1 GitHub README (read in full) and search summaries.

---

## 1. Paper essentials

### 1.1 A4, the A series and the root-two ratio (ISO 216)

| Fact | Detail | Source | Conf. |
|---|---|---|---|
| A4 size | 210 x 297 mm | https://www.papersizes.io/a/ ; Wikipedia "Paper size" summaries via search | high |
| A0 | defined as 1 m^2 area, 841 x 1189 mm | https://en.wikipedia.org/wiki/ISO_216 (search summary); https://phomemo.com/blogs/knowledge/iso-paper-size-guide | high |
| Ratio | every A size has aspect ratio 1 : sqrt(2) (about 1 : 1.414); cutting or folding the long side in half gives two sheets of the same shape and half the area | same as above | high |
| ISO 216 date | ISO 216 and related standards were first published between 1975 and 1995; ISO 216 itself 1975 | https://en.wikipedia.org/wiki/International_standard_paper_sizes (search summary) | high |
| Number of sizes | A0 to A10 | https://llmpedia.scads.ai/deepseek/A-series.html (weak) and others | medium |
| Who does not use it | US, Canada, Mexico, Philippines, Chile, Venezuela, Colombia, Bolivia (plus Guatemala, Nicaragua) use US Letter (8.5 x 11 in) | https://fabrikbrands.com/branding-matters/dispatches/a4-vs-letter-what-is-the-difference-between-a4-and-us-letter-size/ | medium |
| C series | C4 envelope (229 x 324 mm) takes an unfolded A4; A4 folded once fits C5 (162 x 229), twice fits C6 (114 x 162). C series area is the geometric mean of A and B of the same number. ISO 269 was withdrawn in 2009 but still used nationally | https://papersizes.io/c/ ; https://papersizes.org/c-envelope-sizes.htm | high |

**Why halving keeps the shape (for the copy and the "fold" diagram).** Let the sheet be short side s and long side l, with l/s = r. Fold across the long side: the new sheet has sides l/2 and s. For it to be the same shape, s/(l/2) = l/s, so 2s^2 = l^2, so l/s = sqrt(2). Only that ratio works. Check: 297 / 210 = 1.4143; sqrt(2) = 1.41421. (derived; standard geometry, consistent with the sources above.)

**A0 = 1 m^2, so A4 = 1/16 m^2.** A0 = 841 x 1189 mm = 0.99995 m^2 (rounded to whole mm). Four halvings give A4: 2^4 = 16. Exact: 0.210 x 0.297 = 0.06237 m^2 (a bit under 1/16 = 0.0625 because ISO rounds down to whole mm). (derived)

### 1.2 Weight: the 80 gsm sheet

- gsm = grams per square metre; ISO grammage is defined on the A0 = 1 m^2 area. Source: https://en.wikipedia.org/wiki/International_standard_paper_sizes (search summary) quoting "an A4 sheet of 80 g/m^2 paper weighs 5 g (0.18 oz), as it is 1/16 of an A0 page"; also https://papersizes.org/paper-weights.htm. **high**
- **The maths:** 80 g/m^2 x 0.06237 m^2 = **4.99 g** (nominal 80 / 16 = 5.00 g). (derived)
- **A ream (500 sheets):** 500 x 4.99 g = 2.495 kg, about **2.5 kg**. (derived) A ream of A4 80 gsm is sold as "500 sheets" (see ream etymology below).
- **Ream etymology:** "ream" comes via Anglo-French and Middle English from Arabic *rizma*, "bundle". Traditional ream = 20 quires of 24 sheets = 480 sheets; modern ream = 500 sheets (quire = 25). Sources: https://www.etymonline.com/word/ream ; https://merriam-webster.com/dictionary/ream (search summaries). **high**

### 1.3 Thickness (caliper)

- 80 gsm uncoated copy paper: typical thickness about **0.097 mm (97 um)**; one product specification lists **108 +/- 3 um**. Source: https://www.qinprinting.com/paper-thickness/ and a Lazada stationery guide (search summaries). **medium**
- Safe range to print: **about 95 to 110 um, "roughly 0.1 mm"**. Thickness depends on how loosely the fibres are packed (bulk), not on gsm alone. **medium**
- Stack: 500 sheets at 0.1 mm = about 50 mm (derived).
- Mission's "0.1 mm. Our thinnest product ever." is accurate to the nearest tenth of a millimetre.

### 1.4 Whiteness and brightness

- Standard premium copy paper is sold at **CIE whiteness 160** (examples: JK CMAX 80 gsm "160 CIE"; Print24 copy paper "CIE 160"; Initiative A4 80 gsm "160 CIE"). One full spec reads: basis weight 80 gsm +/-2.5 %, CIE whiteness 160 +/-1, **ISO brightness 93 %**, **opacity 94 %**. Brightness across brands runs about 93 to 104 % ISO. Source: https://print24.com/uk/copy-paper ; Doublet/Reflection spec pages (search summary). **medium** (several retailer specs agree; no standards document read).
- Why brightness can exceed 100 %: **optical brightening agents** (fluorescent whitening agents) absorb ultraviolet and emit blue light. ISO 11475:2017 defines CIE whiteness measured under CIE D65 daylight, over the full visible range, so it can reflect OBA effects; ISO brightness is measured only in the blue region. Source: https://www.iso.org/standard/63614.html (search summary). **high** for the definition; the ">100" statement is standard industry knowledge (the figures above show 104 %).
- Comedy-usable truth: the whitest thing in the office is whitened by a chemical that glows under UV. (OBA fluorescence under a blacklight is standard; sourced via the ISO 11475 summary above.)

### 1.5 Grain direction

- Grain = the direction most fibres lie in, set by the paper machine. "Short grain" runs along the short side; "long grain" along the long side. Source: https://creativepro.com/paper-tips-going-against-the-grain/ ; https://blog.midstatelitho.com/paper-grain/ . **high**
- Three home tests: **tear** (with the grain the tear is straighter), **fold** (with the grain the fold is smoother, against it ragged), **moisture** (wet one side; it curls along the grain). Source: same. **high**
- Strength: tensile strength, stiffness and breaking length are highest in the machine direction; the cross direction is roughly half. Source: https://ijnr.ut.ac.ir/article_27870.html (search summary). **medium**
- "Breaking length" = the length of a strip that would break under its own weight when hung; tensile index = breaking length (km) x 9.81 (about). Source: https://www.paperonweb.com/paperpro.htm ; https://www.diva-portal.org/smash/get/diva2:317178/FULLTEXT01.pdf (search summaries). **medium**
- One worked example from a dissertation summary: an **offset paper of 107 g/m^2 has a machine-direction breaking length of 5.3 km** (about 52 N m/g). Fourdrinier-made papers typically have 1.5 to 2.0 times the tensile strength in machine direction vs cross direction. **medium**; this is a 107 gsm offset paper, not 80 gsm copy paper, so do not quote 5.3 km as aviva's spec. Usable idea: "a strip of paper of this kind could hang about five kilometres under its own weight before snapping" is true of that example only (**low** for transfer to 80 gsm).

### 1.6 Archival life

- **ISO 9706** specifies "permanent paper": minimum tear strength, a minimum alkaline reserve (for example calcium carbonate), a maximum kappa number (lignin / oxidisable material), and a cold-water-extract pH range. Source: https://www.boutique.afnor.org/en-gb/standard/nf-en-iso-9706/information-and-documentation-paper-for-documents-requirements-for-permanen/fa209788/447650 (search summary). **high**
- Rule of thumb in preservation literature: paper with an alkaline reserve of 2 % or more can last at least 100 years; sources claim 500 years for average and over 1,000 years for the best alkaline paper. Source: https://en.wikipedia.org/wiki/Acid-free_paper ; https://loc.gov/preservation/resources/rt/perm/pp_x3.html (search summaries). **medium** (the 500 and 1,000-year figures are projections, so say "designed to last", never "will last").
- Ordinary office copy paper is often alkaline-buffered, but whether a given ream meets ISO 9706 is product-specific; do not claim aviva does. **medium**
- Washi (traditional Japanese paper) made from kozo fibres is neutral or alkaline and slow to deteriorate; in use for more than 1,000 years; three kinds (sekishu-banshi, hon-minoshi, hosokawa-shi) were added to the UNESCO intangible heritage list in **2014**. Kozo fibres are about 1 cm long. Source: https://ich.unesco.org/en/decisions/9.COM/10.22 ; https://www.nationalgeographic.com/travel/article/unlocking-mystery-of-japans-perfect-washi-paper . **high**

### 1.7 How paper is made, and what it is made of

- Wood is pulped (mechanically, or chemically: kraft pulping dissolves the lignin that glues fibres in the wood while most cellulose stays intact), refined (fibres swollen and fibrillated), formed on a moving mesh, pressed, dried on steam-heated cans, and finished. Source: https://deskera.com/blog/paper-manufacturing-process-how-paper-is-made (summary) ; https://patents.google.com/patent/US4684440 . **medium**
- Paper is a mat of cellulose fibres; on drying, surface tension pulls wet fibres together and **hydrogen bonds between hydroxyl groups on neighbouring fibre surfaces** hold the sheet. Source: https://arxiv.org/pdf/2210.05736 (search summary). **medium**
- Typical single plant fibre: length "1 to 50 mm", diameter 10 to 50 um (broad range from a materials paper). Pulpwood fibres are shorter (about 1 to 3 mm) in common knowledge, but I could not source that figure; use only "millimetres long, a fraction of a hair wide". **low** for numbers; **medium** for the ranges.
- Papyrus is **not** paper: it is laminated strips pressed together, not a mat re-formed from a suspension of separate fibres. Source: https://bioresources.cnr.ncsu.edu/resources/from-papyrus-to-paper-evolution-of-writing-supports-in-egypt/ ; https://en.wikipedia.org/wiki/History_of_paper (summaries). **high**

---

## 2. History, with dates

| Date | Event | Source | Conf. |
|---|---|---|---|
| 179 to 141 BCE | Earliest surviving paper fragment found at **Fangmatan**, Gansu (probably part of a map) | https://en.wikipedia.org/wiki/History_of_paper ; https://paper.gatech.edu/index.php/early-papermaking (search summaries) | high |
| 2nd century BCE | **Baqiao** find (1957): hemp paper stuck to a bronze mirror in a Han tomb | https://www.cabinet.ox.ac.uk/node/7013 (search summary) | high |
| 65 BCE and 8 BCE | Paper fragments at Dunhuang (65 BCE) and Yumen Pass (8 BCE) | same | medium |
| 105 CE | Traditional date for **Cai Lun**, Han court eunuch official, reporting a paper made of mulberry and other bast fibres, fishing nets, old rags and hemp waste. The date and the "inventor" credit were recorded long after the event; earlier finds contradict "invented in 105". Better wording: "improved and standardised", "reported to the emperor in 105 CE" | https://en.wikipedia.org/wiki/History_of_paper ; https://www.csmc.uni-hamburg.de/news/2024-08-13-smc-31.html | high |
| 751 | **Battle of Talas**: legend says captured Chinese papermakers brought the craft west to Samarkand. Disputed: paper was already known in Transoxiana before 751; no contemporary Arabic source mentions the captured papermakers; the story appears in 11th and 12th century sources | https://en.wikipedia.org/wiki/Battle_of_Talas ; https://qalam.global/en/articles/the-story-of-samarkand-paper-en | medium (the legend is stated as disputed) |
| 794 | A paper mill in **Baghdad** | https://qalam.global/en/articles/the-story-of-samarkand-paper-en ; Aramco World "The Battle of Talas" | medium |
| 868 (11 May) | **Diamond Sutra**: oldest known dated printed book, a roll about 5 m long made of joined paper panels, from the Mogao Caves near Dunhuang, now British Library. Its colophon says it was made "for universal free distribution" | https://idp.bl.uk/blog/the-diamond-sutra/ ; https://www.cabinet.ox.ac.uk/node/10866 | high |
| 1150 or 1151 | First paper mill in Europe at **Xativa**, Spain (some sources: later, with documentary proof of a water-powered mill in 1282) | https://resolve.cambridge.org/core/books/bibliography-and-modern-book-production/paper/2365077CCB6FB8EA963EFBEB885D55F9 ; https://motherbedford.com/watermarks/Watermark1B.htm | medium |
| 1264 / 1270 / 1276 | **Fabriano**, Italy: papermaking centre; sources date the mill 1264, 1270 or 1276. Known for animal gelatine sizing, the multiple-hammer mill, and the watermark; first watermark **1282** | https://fabriano.com/en/paper-making/ ; https://www.eckersleys.com.au/blogs/learn/fabriano-paper-making | medium |
| 1455 | **Gutenberg Bible**: estimates 158 to 185 copies, about three-quarters on paper, the rest vellum (one source: 340 folio sheets per copy, 51,000 sheets in total) | https://en.wikipedia.org/wiki/Gutenberg_Bible ; https://dpul.princeton.edu/gutenberg/feature/the-gutenberg-bible | medium |
| 15 Nov 1719 | **Réaumur** tells the French Academy that wasps make paper from chewed wood fibre, suggesting wood could replace rags | https://entomologytoday.org/2019/07/16/you-can-thank-insects-for-many-human-inventions/polistes-dominula-2/ ; https://engines.egr.uh.edu/episode/1052 | medium |
| 1786 (25 Oct) | **Lichtenberg** writes to Johann Beckmann: the oldest preserved written reference to a 1 : sqrt(2) paper ratio ("like the side of a square to its diagonal") | https://www.cl.cam.ac.uk/~mgk25/lichtenberg-letter.html (search summary) ; https://wordnik.com/words/Lichtenberg ratio | high |
| 1799 | **Nicolas-Louis Robert** patents the first continuous paper machine; Fourdrinier brothers improve it in **1807** | https://en.wikipedia.org/wiki/Louis-Nicolas_Robert ; https://edwardlloyd.org/paper-making.html | high |
| 1844 to 1845 | **Friedrich Keller** builds a wood-fibre grinder; sells the patent to Heinrich Voelter in 1845, so wood replaces rags | https://spmetrowire.com/column-a-brief-history-of-paper/ | medium |
| 1910 | Wilhelm Ostwald revives the sqrt(2) idea | https://paper-world.com/en/newsdetail/paper-formats-according-to-din-standard | medium |
| 1922 | **DIN 476** adopted in Germany (Walter Porstmann's system): A0 = 1 m^2 | https://paper-world.com/en/newsdetail/paper-formats-according-to-din-standard ; https://www.ub.edu/artsgrafiques/node/283 | high |
| 1975 | **ISO 216** published | https://en.wikipedia.org/wiki/International_standard_paper_sizes | high |
| 1975 | **Business Week** predicts the "paperless office": paper use "should be declining by 1980 and by 1990, most record-handling will be electronic" | https://en.wikipedia.org/wiki/Paperless_office (search summary) ; https://www.csmonitor.com/2005/1212/p13s01-wmgn.html | high |
| 1980 to 2000 | Global paper consumption **doubled**; US per-worker consumption rose 50 % from 1990 to 2000 | https://en.wikipedia.org/wiki/Paperless_office (search summary) | medium |
| 2003 | Sellen and Harper, *The Myth of the Paperless Office* (MIT Press): email in an organisation raises paper use by about 40 % on average | https://www.microsoft.com/en-us/research/publication/myth-paperless-office/ (search summary) | medium |
| 2025 | US printing-writing paper shipments down year after year (about 7 % in January 2025, 9 % in September, 14 % in October versus 2024; YTD to September -6.8 %). Office printing finally falling, driven by hybrid work, long after the prediction | https://www.action-intell.com/2025/02/19/afpa-reports-another-downturn-in-printing-writing-paper-shipments-in-january-2025/ ; https://therecycler.com/posts/us-printing-writing-paper-shipments-down-9-in-september/ | medium |

**Comedy-usable history.** The "105 AD" claim in the mission is a traditional date; the true age of paper is about 2,200 years (Fangmatan 179 to 141 BCE). "Offline since 105 AD" can stay as a parody claim, but if the page ever says it as a fact, say "since at least 105 CE" or "over two thousand years". Also the Jevons paradox: the paperless office increased paper use (the explanation given in the Wikipedia summary above). **medium**

---

## 3. Records and physics

### 3.1 Folding

- **Britney Gallivan** (Pomona, California) folded a sheet of paper in half **12 times** in 2002 as a junior in high school, using tissue paper about **1,219 m (4,000 ft, 0.75 mile)** long. Before her, 7 folds (some said 8) was "the accepted limit". Source: https://www.livescience.com/how-many-times-can-paper-be-folded ; https://guinnessworldrecords.com/world-records/494571-most-times-to-fold-a-piece-of-paper ; https://www.sciencenews.org/?p=26078 (search summaries). **high**
- Her formulas (t = thickness, n = folds, L = minimum length): single direction **L = (pi t / 6)(2^n + 4)(2^n - 1)**; alternating directions W = pi t 2^(3(n-1)/2). Source: https://www.livescience.com/how-many-times-can-paper-be-folded ; https://mathworld.wolfram.com/Folding.html (search summaries). **high**
- **Derived with her formula for an 80 gsm sheet (t = 0.1 mm = 1e-4 m):** pi t / 6 = 5.236e-5 m. For n = 7: (132)(127) = 16,764, L = 0.878 m. An A4 long side is only 0.297 m, so 7 folds in one direction are impossible with one A4 sheet; n = 6 needs (68)(63) = 4,284, L = 0.224 m (fits). So **one A4 sheet gives six one-direction folds at most** (derived; my calculation, check before use).
- Myth: "you can't fold a paper more than 7 (or 8) times". Dispelled by Gallivan: the limit depends on length and thickness, not a law. **high**
- In 2012 students at St. Mark's School (Massachusetts) claimed 13 folds with a roughly 16 km toilet-paper roll; Gallivan disputed it because the paper was taped together, not continuous. Source: https://www.paper-world.com/en/newsdetail/folding-paper-13-times-record-broken ; https://www.mathscareers.org.uk/?p=7609 (search summaries). **medium** (contested; prefer "12 folds, Gallivan 2002").
- **Moon maths:** thickness doubles per fold. 0.1 mm x 2^42 = 4.4e11 mm = about **440,000 km**, more than the Moon's average distance (**384,400 km**, NASA figure via search summary; nearest 363,300 km, farthest 405,500 km). So 42 ideal folds would reach the Moon, and even 41 folds (220,000 km) would not, but 42 passes it by at its farthest too. (derived; ideal and impossible in practice because of Gallivan's length limit). Moon distance **high**.

### 3.2 Paper planes (Guinness records, as of 1 Oct 2026)

| Record | Holder, place, date | Number | Source | Conf. |
|---|---|---|---|---|
| **Farthest flight, paper aircraft** | Liu Liwen (China), supported by Tang Shuai, Yang Shian, Huang Yizhou, Qiao Yuchen, Wang Chenghao; Shanghai Automobile Exhibition Center; **28 Dec 2025**; thrown indoors; ninth throw after eight failed | **98.43 m (322 ft 11 in)** | https://www.guinnessworldrecords.com/world-records/farthest-flight-by-a-paper-aircraft ; https://dayton247now.com/news/offbeat/paper-airplane-soars-to-new-heights-with-world-record-flight-longer-than-football-field-longest-throw-paper-plane-guinness-distance-liu-liwen | high |
| Previous distance record | Dillon Ruble with Nathaniel Erickson and Garrett Jensen (USA), Crown Point, Indiana, **2 Dec 2022**; design inspired by hypersonic vehicles | 88.31 m (289 ft 9 in) | https://paperace.com/nathan-erickson-dillon-ruble-and-garrett-jensen/ ; Guinness 2026/5 news piece | high |
| Before that | Kim Kyu Tae with Shin Moo Joon and Chee Yie Jian (Julian), Daegu, South Korea, 16 Apr 2022 | 77.134 m (252 ft 7 in); eight throws measured, shortest 71.813 m | https://www.guinnessworldrecords.com/news/2022/5/epic-paper-airplane-throw-shatters-record-in-south-korea-704368 ; https://says.com/my/news/24-year-old-msian-julian-chee-guinness-world-record-farthest-flying-paper-plane | high |
| Before that | Joe Ayoob (ex arena-football quarterback) and designer John M. Collins (USA), 26 Feb 2012 | 69.14 m (226 ft 10 in), stood a decade | https://en.wikipedia.org/wiki/Joe_Ayoob ; https://paperairplane.design/john-collins-and-joe-ayoob-paper-airplane-pioneers/ | high |
| **Longest time aloft** | Rao Chongyi, Wang Chenghao, Tang Shuai, Liu Liwen, Yang Shian, Jia Siyi, Pan Zichen (China), Kunshan, Jiangsu, **11 Feb 2026**; paper must be unmodified, commercially available **A4 or equivalent** | **31.2 s**, beating by 2 s the previous record | https://www.guinnessworldrecords.com/world-records/longest-time-flying-a-paper-aircraft ; https://english.news.cn/20260515/879f363ec6b4470c99e63681eefad401/c.html (search summaries) | high |
| Previous time record | Takuo Toda (Japan), Fukuyama City, Hiroshima, **19 Dec 2010**, "Zero Fighter" design (earlier 27.5 s in 2009); held for 15 years | 29.2 s | https://paperace.com/takuo-toda/ ; Guinness page above | high |
| Largest paper plane that flew | Italian aerospace students' "ICARUS", Bologna (WMF fair), certified **25 June 2026**: wingspan 20.04 m, length 7 m, weight 28.49 kg, flew 59 m. Beat 18.21 m (2013, TU Braunschweig) | 20.04 m span | https://www.guinnessworldrecords.com/news/commercial/2026/7/italian-students-build-largest-paper-plane-ever-spans-six-stories-and-successfully-flies ; https://newatlas.com/aircraft/icarus-guinness-world-record-65-ft-paper-plane/ | medium |

- Distance record ratio: 98.43 m is **331 x** the long side of an A4 sheet (98.43 / 0.297 = 331.4) (derived).
- Records are very sensitive to rules. Some of the earlier distance records were thrown indoors. The two 2025/26 records are by the same student group (distance on 28 Dec 2025, time on 11 Feb 2026, 45 days apart); tested over 100 types of paper for the distance attempt (local12 / Guinness coverage, **medium**).
- Space: Japanese researchers (University of Tokyo with the Japan Origami Airplane Association) tested an **8 cm** paper plane at **Mach 7** in 2008 and proposed to drop about 100 from the ISS; JAXA funded feasibility studies (up to $300,000 a year). It was a study; do not say it flew. Source: https://www.theregister.com/2008/01/22/iss_paper_plane/ ; https://en.wikipedia.org/wiki/Paper_planes_launched_from_space (summaries). **medium**
- Smallest paper airplane: folded under a microscope from paper **2.9 mm square** by a Mr Naito (Japan). Source: https://www.deseret.com/2003/9/25/19786319/paper-airplane-trivia/ . **low** (a 2003 trivia piece; not a current record claim).

### 3.3 Fire

- **Fahrenheit 451:** Bradbury wrote that 451 F (233 C) is the temperature at which book paper catches fire. Sources agree that was a figure from the era; later work places the autoignition of paper higher. Source: https://www.slate.com/articles/health_and_science/explainer/2012/06/ray_bradbury_death_does_paper_really_burn_at_451_degrees_fahrenheit_.html ; https://ftloscience.com/flash-points-autoignition-fahrenheit-451/ . **medium**
- Published figures vary widely: **842 F (450 C)** for autoignition and 662 F (350 C) flash point on one reference; NFPA 652 lists **cellulose at 260 C (500 F)**; older textbooks gave the high 440s to low 450s F, while "more recent experiments suggest about 30 degrees hotter"; standard papers quoted at **218 to 246 C (425 to 475 F)**. Source: https://hypertextbook.com/facts/2003/LewisChung.shtml ; https://ftloscience.com/flash-points-autoignition-fahrenheit-451/ ; https://en.wikipedia.org/wiki/Autoignition_temperature (search summaries). **medium** that the range is real. **Do not state a single number as fact.** Safe line: "Paper ignition temperatures quoted run from about 230 C to about 450 C depending on paper, thickness and method; 451 F (233 C) is from a novel."
- Autoignition of solids depends on composition, volume, density, shape and exposure time. Source: same. **medium**

### 3.4 Strength, and why paper cuts hurt

- **Banknotes:** US notes are 75 % cotton and 25 % linen with tiny red and blue synthetic fibres; it is said to take **4,000 double folds** to tear one. Crane & Co. has supplied the paper since 1879. Source: https://www.numismaticnews.net/collecting-101/coin-clinic-it-takes-4000-folds-to-tear-a-bank-note ; https://uscurrency.gov/currency-facts . **medium** (uscurrency.gov is a primary source for composition; the folds figure is the Bureau's commonly quoted statement).
- **Paper cuts hurt** because fingertips and lips are dense in pain receptors (nociceptors); the paper edge is microscopically jagged, so it saws rather than slices; the cut is usually too shallow to trigger clotting and scabbing, leaving nerve endings exposed; flexing the finger keeps re-opening it. Source: https://wexnermedical.osu.edu/blog/why-do-papercuts-hurt-so-much (Ohio State); https://bigthink.com/surprising-science/heres-why-paper-cuts-hurt-so-damn-much/ . **high**
- **Machine direction** is stronger than cross direction; see 1.5.

### 3.5 Recycling limits

- Fibres can be recycled about **5 to 7 times** because each cycle shortens fibres and stiffens them (**hornification**), so they bond less well. Shortening "up to 10 to 25 % per cycle" is quoted. Karlstad University (Sweden) research hopes to reach about **25 cycles**. Source: https://www.kau.se/en/news/mystery-around-hornification-about-be-solved ; https://www.thisiseco.co.uk/news/why-paper-cant-be-recycled-infinitely . **high** for 5 to 7 (several sources agree), **medium** for the 10 to 25 % per cycle, **medium** for the 25-cycle research aim.

---

## 4. Sustainability numbers (usable, with contest flags)

| Claim | Number and source | Conf. and caveat |
|---|---|---|
| EU paper recycling rate | **79.3 %** of paper and board consumed in Europe was recycled in 2023, up from 71.1 % in 2022 (European Paper Recycling Council monitoring report). Target 76 % by 2030 was set earlier, so the 2023 rate is above it. https://fefco.org/sites/default/files/EPRC-24-008_Monitoring%20Report%202023.pdf ; https://www.paperforrecycling.eu/ | medium. The jump of 8 points in a year is large; may reflect a method change. Quote with year and "EPRC says". |
| US paper recycling | AF&PA: **46 million tons** recycled in 2024; rate for paper roughly 60 to 64 % (cardboard higher, 69 to 74 %). https://www.afandpa.org/news/2025/paper-industry-announces-2024-us-paper-recycling-rates ; https://www.paperadvance.com/news/industry-news/u-s-recycled-46-million-tons-of-paper-in-2024.html | medium. Industry body; rates depend on definition. |
| Sheets per tree | "1 tree = 16.67 reams = **8,333 sheets** (of 8.5 x 11 in)" is the most-quoted figure (traced to Conservatree / Environmental Paper Network). Other estimates vary with tree size and species; one calculation for a 60 ft pine gives about 80,500 sheets. https://science.howstuffworks.com/life/botany/question16.htm ; https://yremalta.org/past-entries/how-much-paper-can-be-made-from-a-tree | **low to medium. Contested.** Do not use a sheets-per-tree number as a hard fact. Use as "estimates range from thousands to tens of thousands of sheets per tree". |
| Water per A4 sheet | Waterfootprint.org: about **10 L**; research range for printing and writing paper 300 to 2,600 m^3 per tonne = **2 to 13 L per A4 sheet**; some say 2 to 30 L. Water footprint includes rain-fed forest evapotranspiration, so it is not water "used up" at the mill. https://research.utwente.nl/en/publications/the-green-and-blue-water-footprint-of-paper-products-methodologic/ | medium. Contested; definition matters. |
| Recycled vs virgin | One tonne of recycled paper needs about 4,100 kWh less energy and about 7,000 US gallons less water than virgin; "17 trees" saved per tonne. https://www.usu.edu/facilities/recycling/facts-and-figures ; https://recycled-papers.co.uk/news-and-features/20-things | low to medium. Widely repeated, origins unclear and often disputed. Do not use "17 trees". |
| Fibre cycles | 5 to 7 (see 3.5) | high |
| "Power draw: 0 W" | A sheet of paper has no electrical load. (logical fact, no source needed; but "0 W" is a parody-metrics joke that is literally true.) | high |
| Paper vs packaging | Globally, graphic-paper production fell between 2010 and 2024 while packaging paper and board rose with e-commerce. https://www.statista.com/statistics/1089092/global-paper-consumption-by-type (summary) | medium |

| **Carbon per A4 sheet** | One peer-reviewed life-cycle study (Journal of Cleaner Production) of an **80 g/m^2 A4 sheet** found **4.64, 4.74 and 4.29 g CO2e** by ISO 14040/44, PAS 2050 and CEPI methods respectively. https://www.sciencedirect.com/science/article/abs/pii/S0959652611004409 ; https://www.researchgate.net/figure/Carbon-footprint-of-office-paper_fig2_235712203 | medium. Methodology-dependent; says "about 4.3 to 4.7 g". Comedy: a sheet that weighs 4.99 g has a footprint of about 4.6 g CO2e, almost its own weight (derived comparison). |
| FSC | FSC-certified forest area passed **171 million hectares** by end of December 2025 (+6 %, over 12 million ha in a year). https://fsc.org/en/newscentre/general-news/reflections-on-2025-and-looking-to-the-year-ahead | medium (FSC's own statement via search summary) |
| PEFC | More than **296 million hectares**, over 7 % of the world's 4.14 billion ha of forest; over 25 % of production forests. https://woodcentral.com.au/seven-per-cent-world-forests-pefc-certified-annual-review-2025/ ; https://www.pefc.org/news/cop-16-over-25-of-all-production-forests-globally-are-pefc-certified-demonstrating-sustainable-management | medium. Certification is a scheme, not a guarantee; do not claim aviva is FSC-certified. |

Remaining gaps: share of recycled fibre in office paper (no clean figure found).

---

## 5. Culture

### 5.1 Origami

- The Japanese word **origami** (oru = fold, kami = paper) became the standard name in **1880**; before that, "orikata" (folded shapes). Scholars are unsure why. Oldest known written folding instructions: *Tsutsumi-no-ki* (Sadatake Ise, **1764**) and *Hiden senbazuru orikata* / *Sembazuru Orikata* (Akisato Rito, **1797**). Kirigami (fold and cut) took shape in the Edo period (1603 to 1868). Source: https://phpapp-1.nonfiction.ca/tip/kirigami_history ; https://www.ons.org/news-and-views/the-historic-art-of-paper-folding-can-also-enhance-healing (summaries). **medium**
- **Akira Yoshizawa** (14 Mar 1911 to 14 Mar 2005), "father of modern origami": models estimated to exceed **50,000**, only a few hundred published in 18 books. His 1954 book *Atarashii Origami Geijutsu* introduced dotted and dashed lines for mountain and valley folds; with Samuel Randlett and Robert Harbin this became the **Yoshizawa-Randlett system** (Randlett's *The Art of Origami*, 1961). Source: https://en.wikipedia.org/wiki/Akira_Yoshizawa ; https://origamiusa.org/thefold/article/evolution-notation-system ; https://www.nysun.com/article/obituaries-akira-yoshizawa-94-father-of-modern-origami . **high**
- **Senbazuru** (a thousand cranes strung together): folding 1,000 paper cranes is said to grant one wish; the crane symbolises long life ("cranes live a thousand years"). Popularised after the story of **Sadako Sasaki**, a child survivor of the Hiroshima atomic bombing who folded cranes in hospital and died on 25 Oct 1955; the oft-told "644 cranes" version is from a fictionalised telling. Source: https://en.wikipedia.org/wiki/One_thousand_origami_cranes ; https://japanupclose.web-japan.org/techculture/c20230807_3.html . **high** for the tradition. **Creative-director caution: this is a real child's death; do not joke about Sadako or Hiroshima. A "thousand cranes" gag is safe only if it is about the fold, not the story.**
- **Origami mathematics:** the **Huzita-Hatori axioms** (seven operations) show that folds can trisect an angle and double the cube, which ruler-and-compass cannot do. Source: https://www.cambridge.org/core/books/abs/geometric-folding-algorithms/geometric-constructibility/97237930B152A7105041F01133646CB0 ; https://gfalop.org/II/ (Erik Demaine, MIT). **high**
- **Origami engineering:** the **Miura fold** (Koryo Miura, 1970s): parallelogram tessellation skewed 6 to 10 degrees off a right angle; opens in one motion; deployed on Japan's **Space Flyer Unit** satellite, launched **1995**. Source: https://math4u.mendelu.cz/rwp/00038_Miura-ori/en_article.html ; https://www.gov-online.go.jp/eng/publicity/book/hlj/html/202112/202112_05_en.html . **high**
- Largest origami crane: wingspan **81.94 m (268 ft 9 in)**, made by 800 people of the Peace Piece Project, Hiroshima Shudo University, 29 Aug 2009. Source: https://www.guinnessworldrecords.com/world-records/origami-largest-paper-crane . **high**

### 5.2 Idioms (all checked in search summaries)

- **"On paper"**: in theory rather than in practice; also in writing. https://grammarist.com/idiom/look-good-on-paper/ . high
- **"Paper tiger"**: calque of Chinese *zhilaohu*; popularised by Mao (Little Red Book, 1964) but not coined by him; first recorded in English in **John F. Davis, *The Chinese*, 1836**. https://wordhistories.net/2021/01/24/paper-tiger/ ; https://www.phrases.org.uk/meanings/277650.html . high
- **"Paper trail"**: first recorded 1975 to 1980 (dictionary.com). https://www.dictionary.com/browse/paper-trail . medium
- **"Paper over the cracks"**: Bismarck used the image in a letter in **1865**. https://wordhistories.net/2018/08/14/paper-over-cracks/ . medium
- **"Paper-thin"**: gained traction about the 1920s. https://grammarist.com/idiom/paper-thin/ . medium
- Also: "paper cut" (see 3.4), "paperwork", "paper money", "paper over", "white paper" (a government or industry report; also the phrase Locke used, below).

### 5.3 The blank page (art and writing)

- **John Locke, *An Essay Concerning Human Understanding* (1689), Book II ch. 1 sect. 2:** the mind at birth is "white paper, void of all characters"; all materials of reason come from experience. (Locke also allowed an innate power of reflection.) Source: https://en.wikipedia.org/wiki/Tabula_rasa ; https://www.ebsco.com/research-starters/psychology/tabula-rasa/ . **high**. *This is the best possible origin story for a "pre-trained model": the mind as white paper before training.*
- **Robert Rauschenberg, *Erased de Kooning Drawing* (1953):** he asked Willem de Kooning for a drawing and erased it (de Kooning gave it "after a fair amount of liquor"); it took about a month; an almost blank sheet in a gilded frame, with a caption added by Jasper Johns; 64.14 x 55.25 cm; SFMOMA since 1998. Source: https://smarthistory.org/erased-dekooning-rauschenberg ; https://www.sfmoma.org/artwork/98.298/ ; https://www.sartle.com/artwork/erased-de-kooning-drawing-robert-rauschenberg . **high**
- **Rauschenberg's White Paintings (1951)** and **John Cage's 4'33" (1952)**: Cage credited the White Paintings; in a 1961 essay he called them "airports for the lights, shadows and particles". Source: https://www.moma.org/explore/inside_out/2013/10/28/silence-is-not-what-it-used-to-be-2/ ; https://interlude.hk/musicians-and-artists-john-cage-and-robert-rauschenberg/ . **high**
- **Malevich, *Suprematist Composition: White on White* (1918)**, MoMA. https://www.moma.org/collection/works/80385 . high
- **Mallarme, *Un coup de des jamais n'abolira le hasard* (1897):** the white spaces ("les blancs") carry weight; versification occupies about a third of the page. Source: https://books-on-books.com/?p=14728 (search summary quoting the Preface). **medium**
- **Hemingway, *A Moveable Feast* (published 1964):** "Do not worry. You have always written before and you will write now. All you have to do is write one true sentence. Write the truest sentence that you know." He says this to himself, looking out over the roofs of Paris, when a new story would not start. Source: https://www.goodreads.com/author_blog_posts/4862422-write-the-truest-sentence-that-you-know ; https://www.litcharts.com/lit/a-moveable-feast/quotes ; https://lorenrhoads.com/2013/09/13/write-the-truest-sentence-that-you-know/amp/ (three sources agree on the wording). **high** for wording. (He also reportedly suffered writer's block: openculture.com, **medium**.) Short quotes of this length are fine for a parody; keep the attribution.
- "Fear of the blank page" / "writer's block" is a cliche; no writer quote verified verbatim in this session beyond the Hemingway item. Gap for the creative director: if you want a named writer quote, ask me to verify it first.

### 5.4 The paperless office (see section 2)

Short version: predicted 1975; global paper consumption doubled 1980 to 2000; email raised paper use about 40 % per organisation (Sellen and Harper, 2003); US printing-writing paper shipments only fell clearly in the 2020s (down 7 to 14 % year on year in 2025). **medium**

---

## 6. Surprising facts (28, each sourced and tagged)

1. An A4 sheet of 80 gsm weighs **4.99 g**; A0 is exactly 1 m^2 by definition. (derived from ISO definitions; https://papersizes.org/paper-weights.htm) high.
2. Paper is older than Cai Lun by about two centuries: the **Fangmatan** fragment is dated 179 to 141 BCE. (https://en.wikipedia.org/wiki/History_of_paper) high.
3. The oldest dated printed book, the **Diamond Sutra (868)**, says it was made "for universal free distribution": arguably the first public-domain dedication. (https://idp.bl.uk/blog/the-diamond-sutra/) high.
4. The √2 ratio was first written down in **1786** by Lichtenberg, and forgotten until the 20th century; DIN 476 (1922); ISO 216 (1975). high.
5. **Gallivan folded paper 12 times** in 2002, using 1.2 km of tissue; the "7 folds" limit was a myth, and her formula shows the limit is about length and thickness. high.
6. Ideal doubling: **42 folds** of a 0.1 mm sheet would be about **440,000 km**, beyond the Moon. (derived) medium.
7. A single A4 sheet (0.1 mm) can only be folded **six times** in one direction (derived from Gallivan's formula). derived.
8. The farthest paper-plane flight is **98.43 m** (Shanghai, 28 Dec 2025), about 331 sheet-lengths. high / derived.
9. The longest paper-plane flight time is **31.2 s** (Kunshan, 11 Feb 2026), beating the 2010 record by 2 s after 15 years; the 2010 holder was Takuo Toda (29.2 s). high.
10. The **largest paper plane that has flown** has a 20.04 m wingspan and weighs 28.49 kg (Bologna, June 2026). medium.
11. A paper plane of 8 cm was wind-tunnel tested at **Mach 7** in 2008 for a proposed ISS drop. medium.
12. Wasps showed Europe how to make paper from wood: **Réaumur, 1719**. medium.
13. Papyrus is not paper. high.
14. The **watermark** was invented at Fabriano, Italy, about **1282**. medium.
15. A **ream** is from the Arabic for "bundle" (*rizma*). high.
16. **Paper cuts** hurt because they cut through dense nociceptors but are too shallow to clot. high.
17. US banknotes are 75 % cotton, 25 % linen, and are quoted to survive about **4,000 double folds**. medium.
18. Paper fibres survive only **5 to 7** recycling rounds because they shorten and stiffen (hornification). high.
19. **Fahrenheit 451** is the number from a novel; published ignition figures for paper run from about 220 C to 450 C. medium.
20. White office paper is whitened with optical brighteners that fluoresce under UV; brightness figures above 100 % are possible. medium (see 1.4).
21. The **Miura fold** (a paper-folding pattern) unfolded a solar array on a 1995 satellite. high.
22. **Origami can trisect an angle**, which a compass and straightedge cannot (Huzita-Hatori axioms). high.
23. **Rauschenberg spent a month erasing** a de Kooning drawing and the result hangs in SFMOMA. high.
24. **Locke (1689) described the newborn mind as "white paper"**: the first "blank-slate model". high.
25. **Yoshizawa** made an estimated 50,000+ origami models but published only a few hundred. high.
26. The **paperless office** was predicted in 1975; paper use doubled worldwide by 2000. medium.
27. Washi in **kozo** fibres about 1 cm long is used to repair rare books, and washi was added to the UNESCO list in **2014**. high.
28. **C4 envelope** is the geometric mean of A4 and B4 sizes; an A4 sheet folded in half fits a C5. high.

---

## 7. ORYZO's own jokes: what NOT to reuse

Sources: `reference/VIDEO_NOTES.md` (the user's recording), ORYZO-1 README and repo page (read in full), search summaries. I could not open oryzo.ai.

**Facts about the project (for context).** ORYZO is a self-initiated Lusion project: a cork coaster presented as an AI product. It spans the website, a GitHub open-weight page, a Product Hunt launch, a founder video and social content. It won Awwwards Site of the Day and **Site of the Month (April 2026)** and a Developer Award. It reportedly started when someone on the team picked up an IKEA cork coaster from his desk. The landing page's tagline-style description: "the world's most unnecessarily sophisticated cork coaster". Sources: https://lusion.co/projects/oryzo_ai/ ; https://x.com/awwwards/status/2043600792184099160 ; https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/ ; https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction (title seen in search results; not opened) (search summaries). **medium**

**Do not reuse any of these:**

1. Model naming and sizes: "ORYZO-1", checkpoint names `oryzo-1-26b-a0b`, `40b`, `108b`, `145b`, `168b-instruct`, `344b` "Frontier"; the "a0b" suffix (active zero billion); a parameter range of 26B to 344B. Also the "Trust me bro" quote credited to an anonymous LocalLLaMA Reddit user ("Oryzo-1 A0B is the best model out there"). Also: "open-weight 3D model in OBJ", MIT licence, "code: coming soon", `@misc{oryzo2026,...}` BibTeX shape, abstract text "table protection, perfect circularity, and passive thermal moderation under everyday beverage conditions", limitations "stemming from gravity, mugs, and human deployment". (ORYZO-1 README, read in full.)
2. The metaphor "model checkpoints" for physical object variants. Use a different frame (see Top 15).
3. From VIDEO_NOTES: green cutting-mat desk; six-fingered hand; rainbow AI-glow border; wrapper tearing; "so portable, it's wearable" and the lifestyle photos (coaster as hat, eye patch, in mouth, hoodie); the RISE magazine cover; pegboard desk with takeaway cup; "Elevate your coffee experience"; the delta-h = t formula; thermal-camera "Thermodynamic stability"; "Perfectly round, seriously / now 37.9 % more circular" and da Vinci-style sketches; "Smart flip encryption"; "Grip-locked antislip technology" with a friction coefficient; cork-bark macro and giant "sustainability" word with three cards (age at first harvest, harvest interval, power draw in use); reviewers (astronaut, pirate, influencer, minimalist, flat-earther) and star-rated review cards; claim-card gallery ("runs on the edge", "always on", "runs on RTX 3090", "drop-tested", "legacy support"); "Choose your own ORYZO" tiers with red smoky glow (ORYZO / Pro / Pro Max, stack of 1, 2 or 3 coasters); floating cork particles; "We caught your attention with a non-existent product"; "if we can sell a coaster...".
4. Structural moves ORYZO owns, which aviva should only echo as a *format*: line-drawn loader that becomes the 3D object; giant logotype that the object passes through; "scroll to continue" hint; slim nav with Intro / Features / Product / Contact.
5. Colour and type: dark brown / cork orange / cream / green, and a bold grotesk.
6. **Words to avoid because they are ORYZO's punchlines:** "wearable", "circular", "encryption", "antislip", "grip", "thermal", "runs on", "always on", "drop-tested", "legacy support", "non-existent product".

Safe to share (generic launch tropes ORYZO also used; the way aviva answers them must be different): "Powered by AI", Pro / Pro Max tiers, comparison table, academic paper with BibTeX, testimonials, sustainability.

---

## 8. Inspiration (10 sites and projects; I could not open them, descriptions are from search summaries)

| # | Project | What makes it good | Source | Conf. |
|---|---|---|---|---|
| 1 | **ORYZO** (Lusion, 2026) | A single ordinary object given a full premium-AI treatment; real-time Three.js object with inertia and weight; every micro-copy line imitates a launch page. Awwwards Site of the Month, April 2026. (Study its format, do not copy.) | https://x.com/awwwards/status/2043600792184099160 ; https://utsubo.com/blog/best-threejs-websites-2026 | medium |
| 2 | **Apple AirPods Pro page** (Awwwards Site of the Month, Jan 2020) | One continuous movement through a fixed frame, activated on scroll, in a linear narrative of how you would experience the product; used 1,600 stills with progressive loading rather than scrubbed video. | https://awwwards.com/airpods-pro-wins-site-of-the-month-january.html ; https://pxlnv.com/linklog/airpods-pro-webpage/ | medium |
| 3 | **Bruno Simon's portfolio** | A drivable physics world instead of a page; Site of the Year (Awwwards 2020), 400,000+ visits. Proof that one hard idea executed cleanly beats stacked effects. | https://www.creativebloq.com/news/3d-car-portfolio ; https://usepastel.com/blog/how-a-design-portfolio-got-the-attention-of-400-000-visitors | medium |
| 4 | **Lusion.co** | Fluid interactions and performance; the studio's own site took about a year; an industry benchmark for craft. | https://www.awwwards.com/sites/lusion ; https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html | medium |
| 5 | **Active Theory v4** | Real-time WebGL used for a coherent world rather than gimmicks; their stated view that surface-level WebGL has lost potency. | https://awwwards.com/active-theory-v4-wins-january-2018-site-of-the-month.html ; https://lbbonline.com/news/Craft-Matters-by-Active-Theory | medium |
| 6 | **IKEA BookBook** | Parody in Apple's own launch format: a catalogue presented as a tactile touch interface "with no-lag page renders and thumb-powered speed browsing". A paper product answering a tech launch is *our* exact premise. | https://www.campaignlive.co.uk/article/ikea-airbnb-five-best-brand-ad-parodies/1365488 | medium |
| 7 | **Onion News Network, "MacBook Wheel"** | Deadpan: a laptop without a keyboard, presented with straight-faced corporate language. | https://www.pcworld.com/article/535961/appleads-4.html | medium |
| 8 | **Bad Lip Reading, Apple keynote** | Mocks keynote superlatives ("Apple Hole") by changing only the words, leaving the staging intact. | https://appleinsider.com/articles/18/12/21/bad-lip-reading-skewers-apples-keynotes-in-latest-video | medium |
| 9 | **Jony Ive supercut** | Shows how repetitive launch narration is: one speaker saying suspiciously similar things for years. Useful as a list of phrases to parody. | https://fortune.com/2011/03/05/video-conan-obrien-spoofs-jony-ive | low (a 2011 piece) |
| 10 | **Scoopertino** (Ken Segall) | A fake press agency for Apple news; consistent satirical voice as the entire product. | https://en.wikipedia.org/wiki/Parody_advertisement | low |
| 11 | **Soren Iverson's "unhinged" app mockups** | A web designer known for satirical product mockups; useful for the comedic precision of fake UI. | https://en.wikipedia.org/wiki/Soren_Iverson | low |
| 12 | **2026 Three.js trend notes** | Winners pick one idea, restrain themselves, drive the whole experience from scroll, hit Lighthouse mobile 90+ and respect `prefers-reduced-motion`. | https://www.utsubo.com/blog/best-threejs-websites-2026 ; https://svilenkovic.com/3d/awwwards-2026-3d | medium |

Gap: I could not look at any of these sites (blocked); the visual-designer should treat the "what makes it good" lines as secondhand.

---

## 9. Vocabulary of paper

(General trade and craft terminology; not facts that need a source on the site. Where a term is a definition I checked, it is marked with the section number.)

**Nouns, structure:** sheet, leaf, folio, quire, ream (1.2), bale, stock, furnish, pulp, slurry, fibre, cellulose, lignin, size / sizing, filler, calcium carbonate, watermark, deckle edge, mould and deckle, laid and wove, felt side and wire side, grain (1.5), tooth, caliper, grammage / gsm, bulk, opacity, brightness, whiteness (1.4), ream wrapper, deckle, selvage, margin, gutter, bleed, crop marks, recto and verso, signature, fold line, perforation, score.

**Textures and sensations:** crisp, matte, smooth, toothy, rough, velvety, slightly waxy, cool to the touch, dry, papery, brittle, limp, supple, translucent, opaque, snowy, stark, pristine, "ream-fresh", unmarked.

**Sounds:** rustle, crinkle, snap, flick, whisper, riffle, thwip, crack (of a fold), tear (a long ripping sound).

**Verbs (physical):** fold, crease, pleat, score, tuck, flatten, burnish, dog-ear, curl, cockle, buckle, warp, roll, crumple, scrunch, crush, wad, tear, rip, shred, cut, trim, guillotine, perforate, punch, glue, staple, clip, pin, stack, collate, shuffle, riffle, fan, flutter, flick, float, glide, spiral, swoop, nosedive, stall, loop, land, drift.

**Verbs (writing, ink):** write, scribble, doodle, sketch, draw, trace, erase, smudge, blot, bleed (ink), feather (ink), wick, absorb, soak, stain, underline, strike out, annotate, sign, stamp, seal, fax, print, jam (a printer).

**Origami terms:** valley fold, mountain fold, crease pattern, squash fold, reverse fold (inside and outside), petal fold, rabbit ear, sink fold, crimp, pleat, bird base, waterbomb base, preliminary base, frog base, kami (square origami paper), wet-folding, tessellation, Miura-ori, rigid origami, kirigami, orizuru (crane), senbazuru (1,000 cranes, 5.1), bone folder.

**Printing and office terms:** DPI, bleed, kerning, leading, tracking, point size, baseline, widow and orphan, ream wrapper, "paper jam", "out of paper", "PC LOAD LETTER" (a meme), "Letter vs A4" (1.1).

**Idioms (5.2):** on paper, paper tiger, paper trail, paper over the cracks, paper-thin, white paper, paper cut, paperwork, "back of an envelope", "clean slate".

**AI-vocabulary puns available:** token (a paper token), prompt (a paper prompt card), alignment (text alignment, margins), training (training lines, a training wheel), fine-tuning (fine tip), window (a paper window / glassine window of an envelope), context (con-text), temperature (autoignition, 3.3), weights (gsm, 1.2), parameters (margin, size, ruling), layers (plies, laminate), attention (dog-ear), memory (crease memory), hallucination (seeing shapes in a blank page / pareidolia in fibres), inference, hardware (hard copy), compute (to count sheets), model (a paper model), checkpoint (a checkmark), embedding (embossing), "open weights" (open grain), "closed source" (sealed envelope), distillation (pulping), pretraining (pre-printing), "release notes" (sticky notes).

---

## 10. AI and tech-launch tropes to parody (2025 to 2026), 40 tropes

Each line: **trope** (grounding, source) then the paper's deadpan answer. Grounding facts are verifiable; the paper answers are jokes and are not facts.

1. **Version-numbered model name** (GPT-5, 7 Aug 2025; Gemini 3, 18 Nov 2025; Llama 4). Source: https://en.wikipedia.org/wiki/GPT-5 ; https://en.wikipedia.org/wiki/Gemini_3_(AI). *Paper:* "aviva-1" is a name that is already the A-series pun: A4 Pro, A3 Max; the version number is a size (A0 to A10).
2. **Giant parameter counts**: DeepSeek R1 has 671B total / 37B active (released 20 Jan 2025, MIT licence); gpt-oss-120b has 116.83B total / 5.13B active, gpt-oss-20b 20.91B / 3.61B (5 Aug 2025, Apache 2.0); Llama 4 Scout 109B total / 17B active, Maverick about 400B. Sources: https://openrouter.ai/models/deepseek/deepseek-r1 ; https://openai.com/index/introducing-gpt-oss/ ; https://www.datacamp.com/blog/llama-4 . *Paper:* "Parameters: four (the corners)." Or "Total parameters: 2 (length, width). Active parameters: 2."
3. **Mixture-of-experts "active parameters"** (see above). *Paper:* "All fibres active at all times. We do not route."
4. **Context window as headline spec**: Gemini 3 1 million tokens; Llama 4 Scout 10 million; gpt-oss 131,072. Sources: https://en.wikipedia.org/wiki/Gemini_3_(AI) ; https://www.datacamp.com/blog/llama-4 ; https://openai.com/index/introducing-gpt-oss/ . *Paper:* "Context window: 210 x 297 mm. Edge to edge. Nothing falls off the end, except the edges."
5. **Needle in a haystack test** (plant a fact in a long text, ask the model to retrieve it). Source: https://dejan.ai/concepts/needle-in-a-haystack/ . *Paper:* "Our needle test: the needle is a pencil. Recall 100 %, as long as you didn't lose the pencil."
6. **Benchmarks and "state of the art"**: "highest score in 19 of 20 benchmarks" (Gemini 3 launch coverage, Tom's Guide). Source: https://www.tomsguide.com/ai/google-gemini/gemini-3-is-here-googles-most-powerful-ai-model-yet-is-crushing-benchmarks-improving-search-and-outperforming-chatgpt . *Paper:* "Tops 19 of 19 benchmarks it was not given."
7. **"Humanity's Last Exam"** (2,500 questions; Gemini 3 Pro 37.5 %). Source: https://en.wikipedia.org/wiki/Humanity%27s_Last_Exam . *Paper:* "Humanity's first exam paper." Score is whatever you write on it.
8. **Benchmark saturation / asterisk footnotes** ("best-of-k", "with thinking"): SWE-bench Verified reported near 96 % in 2026 (a secondary report). Source: https://dailyaiworld.com/blogs/swe-bench-verified-96-benchmark-saturation-crisis-2026 (low). *Paper:* "Results marked * obtained with a pencil."
9. **Leaderboard gaming**: Meta's "experimental" Llama 4 Maverick placed second on LMArena; the released version ranked 32nd. Source: https://www.neowin.net/news/unmodified-llama-4-maverick-ranks-below-rivals-following-meta-cheating-allegations/ . *Paper:* "The sheet you tested is the sheet you receive. There is one sheet."
10. **"Open weights" / open source** (MIT, Apache 2.0). *Paper:* "Open weights: 4.99 g. Download link: a blank PDF." (repo ships a four-vertex .obj)
11. **Reasoning / "thinking" modes with effort levels** (gpt-oss: three reasoning levels). Source: https://openai.com/index/introducing-gpt-oss/ . *Paper:* "Reasoning effort: low, medium, high = pencil pressure." Or "Thinking: supplied by the user."
12. **Visible chain-of-thought**. *Paper:* "Show your working" with a printed margin: "The working goes here."
13. **"PhD-level expert in your pocket"** (GPT-5 launch, 7 Aug 2025). Sources: https://www.nbcnews.com/tech/tech-news/openai-releases-chatgpt-5-rcna223265 ; https://www.cnn.com/2025/08/14/business/chatgpt-rollout-problems . *Paper:* "A PhD-level thesis in your pocket (folded in four)."
14. **Agents / "agentic"**; Gartner: over 40 % of agentic AI projects will be cancelled by end of 2027; "agent washing" (relabelling chatbots). Source: https://www.crn.in/?p=72052 ; https://www.outlookbusiness.com/artificial-intelligence/over-40-of-agentic-ai-projects-will-be-scrapped-by-2027-says-gartner . *Paper:* "Agentic: it will do whatever you do with it, including nothing." "No agent washing. Only washing, don't."
15. **Hallucinations**: Air Canada's chatbot invented a bereavement policy and the airline lost the tribunal case (2024); Google AI Overviews told people to put glue on pizza (2024). Sources: https://ediscoverytoday.com/2024/02/21/airlines-chatbot-hallucinates-bereavement-policy-now-must-pay-artificial-intelligence-trends/ ; https://fortune.com/2024/06/12/google-ai-wrong-googlebomb-glue-pizza . *Paper:* "Zero hallucinations. Zero outputs. Whatever you see in the fibres is your own."
16. **Multimodal** (text, image, audio, video). *Paper:* "Multimodal: text, sketch, coffee ring, fold."
17. **On-device AI / NPUs / TOPS** (Copilot+ PC needs a 40 TOPS NPU). Source: https://www.qualcomm.com/news/onq/2024/06/what-on-earth-is-a-copilot-plus-pc . *Paper:* "0 TOPS. Runs entirely on-device. The device is the paper."
18. **Private / "your data stays with you"**. *Paper:* "Privacy: nothing leaves the sheet unless it is folded into a plane."
19. **AI wearables**: Humane AI Pin (raised over $230M, launched April 2024; HP bought assets for $116M and the pin stopped working on **28 Feb 2025**); Meta Ray-Ban Display ($799, unveiled 17 Sep 2025, with a live-demo glitch on a call); Friend pendant ($129, $1M subway ad campaign defaced in 2025). Sources: https://www.fortune.com/2025/02/19/hp-humane-deal-ai-pin-shutting-down ; https://www.pcworld.com/article/2913509/metas-new-ray-ban-ai-smart-glasses-are-controlled-using-gestures.html ; https://fortune.com/2025/10/01/who-is-avi-schiffmann-friend-ai-pendant-necklace . *Paper:* "Cannot be bricked, only crumpled." (Avoid "wearable": ORYZO's joke.)
20. **Live demo glitches**. *Paper:* "The only demo that cannot crash. It can only crease."
21. **Server shut-down / end-of-life** (Humane pin). *Paper:* "No servers. No end of support. Sunset: it yellows."
22. **Pro / Pro Max / Ultra tiers**: iPhone 17 Pro Max (9 Sep 2025 event, release 19 Sep); ChatGPT Pro $200/month; Claude Max $100 and $200; Google AI Ultra $249.99; SuperGrok Heavy $300. Sources: https://www.sentisight.ai/ai-price-comparison-gemini-chatgpt-claude-grok/ ; https://www.notebookcheck.net/What-AI-subscriptions-cost-in-2026-and-which-one-is-worth-it.1341432.0.html (low to medium, prices change). *Paper:* "aviva / aviva Notebook Pro / aviva Ream Pro Max (500 sheets)." "Ultra" = a pad of A3.
23. **Subscription pricing, "usage limits", "5x / 20x usage"**. *Paper:* "Usage limit: until the ream runs out. 500 refills."
24. **Keynote superlatives** ("our most advanced X ever", "the most powerful ever"). Bad Lip Reading mocked this ("Apple Hole"). *Paper:* "Our thinnest sheet ever. Our whitest ever. Same sheet."
25. **"One more thing"**. *Paper:* "One more sheet."
26. **Rolling out "over the coming weeks"**. *Paper:* "Rolling out over the coming centuries."
27. **Waitlist / early access**. *Paper:* "Join the waitlist. The waitlist is a sheet of paper. Sign here."
28. **"Trusted by" logo strips**. *Paper:* "Trusted by 8 billion people and exactly one cat."
29. **System cards, model cards, safety cards** (Anthropic publishes system cards under its Responsible Scaling Policy; ASL-3 first used for Claude Opus 4). Source: https://www.anthropic.com/transparency ; https://thezvi.substack.com/p/claude-opus-46-system-card-part-1 . *Paper:* "Safety card: the safety card is printed on the system. Known risks: paper cuts (see 3.4)."
30. **Safety levels / responsible scaling**. *Paper:* "Paper Safety Level 1: edges."
31. **Alignment**. *Paper:* "Alignment: left, right, centred, justified."
32. **Training data / pre-training**. *Paper:* "Pre-trained on trees." Or "Trained on one sheet of nothing."
33. **Fine-tuning**. *Paper:* "Fine-tuned. Tip: 0.5 mm."
34. **Tokens and per-token pricing; tokens per second**. *Paper:* "Price per token: one pencil." "Throughput: one word per second at your handwriting speed."
35. **Latency / "instant"**. *Paper:* "0 ms to first token. Infinite to the last."
36. **Scaling laws / bigger is better**. *Paper:* "Scale: stack it." A ream is 500 sheets, 2.5 kg, about 5 cm.
37. **AGI / superintelligence**. *Paper:* "Already general-purpose: plane, crane, hat, boat, envelope." (A real sheet can be folded into many forms.)
38. **Jailbreaks and prompt injection**. *Paper:* "Unjailbreakable. Can be unfolded."
39. **Prompt engineering / "vibe coding"**. *Paper:* "Prompt: a pencil. Vibe drawing."
40. **Energy and compute**. *Paper:* "Power draw: 0 W." (true; compare ORYZO's "power draw while in use" card, a different wording, so keep different framing.)
41. **Memory / personalisation**. *Paper:* "Remembers every crease. Cannot forget a fold."
42. **Retrieval (RAG)**. *Paper:* "Retrieval-augmented: it retrieves from the drawer."
43. **Quantisation / distillation**. *Paper:* "Distilled from a tree. Quantised to one sheet."
44. **Launch-page clichés** ("seamless", "scalable", "AI-powered", "unlock", "supercharge"; research found "seamless" 16 times across 50 startup homepages). Source: https://techeconomy.ng/overused-startup-buzzwords-2025-expert-warns-these-cliches-are-hurting-new-brands/ . *Paper:* "Seamless: no staples."
45. **Spec sheet, "available now", "preorder"**. *Paper:* "Available now. Available since 105 CE (traditional date)." Footer: nothing is for sale.

---

## 11. Top 15 angles for the creative director (ranked)

1. **The mind as "white paper" (Locke, 1689).** The newborn "pre-trained model" is literally described as white paper void of all characters; aviva is the original foundation model, "pre-trained since 1689", with zero training data. Funny because it is a real philosophy quote that fits an AI launch perfectly.
2. **"Context window: 210 x 297 mm."** A hard spec with a ruler: the context window is a physical rectangle, and the needle-in-a-haystack test has a pencil as the needle. Funny because the joke is also true and the units are millimetres.
3. **Fold it in half, same shape: the sqrt(2) "architecture".** The only model whose "scaling" is a halving that keeps its design (A4 to A5 to A6 to A10), with the maths (297/210 = 1.4143). Funny because nerdy precision is real and elegant.
4. **"Open weights: 4.99 g."** Weights literally weighed on a scale (80 gsm x 0.06237 m^2), and the downloadable weights are a blank PDF plus a four-vertex .obj. Funny because "open weights" has never been more literal.
5. **Zero hallucinations, because it says nothing.** Hallucination answered with a blank sheet: whatever you see in the fibres is yours (pareidolia). Funny and safe (Air Canada and the glue pizza are the real backdrop).
6. **The Gallivan "benchmark".** A real benchmark with a real hero: "folded 12 times, 2002, 1.2 km of tissue", plus the 7-fold myth busted; an A4 manages six. Funny as a fake leaderboard whose top entry is a teenager.
7. **Records as a keynote slide: 98.43 m, 31.2 s.** Paper-plane distance and time-aloft records from the 2025/26 student team, 331 sheet-lengths of range, beating Toda's 15-year-old record by 2 s. Funny as "flight performance" with hard numbers on a product with no motor.
8. **The paperless office never came.** The 1975 Business Week prediction and the doubling of paper use by 2000; aviva as "the product the paperless office was supposed to kill, now with more demand". Funny because it is the original failed tech prediction.
9. **"Offline since 105 CE" with a footnote that it is actually 179 BCE.** A launch claim corrected by archaeology: Cai Lun is the marketing; Fangmatan is the truth. Funny because the product's "founding story" is contested like a startup's.
10. **Tiers that are literally counts: Sheet / Pad / Ream (500 sheets, 2.5 kg).** Pro Max is a ream with a weight spec, and "ream" itself means "bundle" in Arabic. Funny: tiering that scales by number of sheets and shipping weight.
11. **Safety card: paper cuts, with the real science.** A solemn system card about nociceptors, microscopic jaggedness and clot failure (Ohio State). Funny because the most dangerous thing about the product is real, tiny and humiliating.
12. **Alignment, finally literal.** Left, centred, justified; "aligned to your margins"; "responsible scaling" = A0 to A10; no jailbreak, only unfold. Funny because the safety vocabulary maps cleanly to typography.
13. **"Autoignition: 233 C? 451 F? Ask a novel."** Honest uncertainty as a spec row: published values from about 220 C to 450 C; "thermal envelope: contested". Funny because it is true and cites Bradbury; careful to avoid presenting one number.
14. **Recyclable 5 to 7 times: "Retraining" is a pulping.** Fibres shorten and stiffen (hornification), so the model "degrades after five to seven retrains"; also "distillation" is literal pulping. Funny because model collapse has a real paper analogue.
15. **Origami as "general intelligence", plus Miura-fold hardware.** One sheet becomes a crane, a plane, a boat, and (Miura fold, 1995 satellite) a solar array, while origami can trisect an angle that a compass can't. Funny because "AGI" is just a fold pattern, and every claim is true. (Avoid the Sadako story.)

Runner-ups: Rauschenberg's *Erased de Kooning* as "model editing" (erased by request, a month, now in SFMOMA); the Diamond Sutra's "for universal free distribution" as the first open-source licence; "agent washing" answered by "paper washing"; washi (kozo fibres, over 1,000 years) as "legacy support" (do not use ORYZO's phrase; say "long-term support").

---

## 12. Gaps and cautions (for the lead)

- No full reads of paper-industry or standards pages were possible, so no `high` fact rests on a primary document I read myself. Check any number before it ships on the page: **thickness range, whiteness figures, EU and US recycling rates, sheets-per-tree, ignition temperature, and the 4,000 double folds.**
- No sourced tensile or breaking-length value for 80 gsm copy paper (only a 107 gsm offset example); no clean figure for recycled-fibre share of office paper.
- The pareidolia remark and the "OBA fluoresces under UV" remark are standard knowledge but not sourced from this session's search results.
- Fact 6 and 7 in section 6 use "about 0.1 mm"; with a measured 97 to 108 um the folds-to-Moon count is still 42 (it would be 42 for 0.097 mm as well: 0.097 mm x 2^42 = about 427,000 km).
- Derived numbers (4.99 g, 2.5 kg ream, 6 folds on A4, 440,000 km, 331 sheet-lengths) are my arithmetic. Please have the fact-check step re-run them.
- I could not read oryzo.ai or the Lusion blog; the ORYZO joke list comes from VIDEO_NOTES, the GitHub README and search summaries, so it may be incomplete. Ask the reference-analyst's teardown (`work/02-reference-teardown.md`) to extend section 7.

---

## 13. Additions (2026-10-02)

Added for the chosen concept. Nothing above was renumbered. Same method as before: all sources are search-result summaries (WebFetch was tried on marxists.org and sfmoma.org and was blocked, so no workaround). Where this section corrects something above, it says so; the lead should treat section 13 as the newer word.

### 13.1 ISO 216 A series, A0 to A10 (mm), with areas and 80 gsm weights

Dimensions (width x height, portrait). Source: https://www.engineeringtoolbox.com/drawings-paper-sheets-sizes-d_349.html ; https://papersizes.io/a/ ; https://paperorb.com/a/ ; ISO 216:2007 sample at https://cdn.standards.iteh.ai/samples/36631/c0883203ea25445c9992bb09343620c5/ISO-216-2007.pdf (search summaries; four sources give the identical table). The A series is "based on a constant width to length ratio of 1 : sqrt(2), rounded to the nearest millimetre"; each size is half the area of the next larger. **Confidence: high** (dimensions).

| Size | Width x height (mm) | Area (mm^2), derived w x h | Mass of one 80 gsm sheet, derived (g) | Note |
|---|---|---|---|---|
| A0 | 841 x 1189 | 999,949 | 79.996 (nominal 80) | 1 m^2 by definition; the rounded sides give 0.99995 m^2 |
| A1 | 594 x 841 | 499,554 | 39.96 (nominal 40) | |
| A2 | 420 x 594 | 249,480 | 19.96 (nominal 20) | |
| **A3** | **297 x 420** | 124,740 | **9.98** (nominal 10) | |
| **A4** | **210 x 297** | **62,370** | **4.99** (nominal 5) | |
| **A5** | **148 x 210** | 31,080 | **2.49** (nominal 2.5) | |
| **A6** | **105 x 148** | 15,540 | **1.24** (nominal 1.25) | |
| A7 | 74 x 105 | 7,770 | 0.62 (nominal 0.625) | |
| A8 | 52 x 74 | 3,848 | 0.31 | |
| A9 | 37 x 52 | 1,924 | 0.15 | |
| A10 | 26 x 37 | 962 | 0.08 | |

**Maths:** mass (g) = 80 g/m^2 x area (mm^2) / 1,000,000. Example A3: 297 x 420 = 124,740 mm^2 = 0.12474 m^2; x 80 = 9.979 g. A5: 31,080 mm^2 -> 2.486 g. A6: 15,540 mm^2 -> 1.243 g. (Computed by script, not by hand.) **Two valid ways to say it:** the "nominal" figure (80 g / 2^n: 10, 5, 2.5, 1.25 g) is the clean one for copy; the "derived from the rounded millimetre sizes" figure is 9.98, 4.99, 2.49, 1.24 g. Because sizes are rounded down to whole millimetres, each area is very slightly under the ideal 1/2^n m^2 (A4: 62,370 vs 62,500 mm^2, 0.2 % less). Safe wording on the site: "about 5 g" (A4), "about 10 g" (A3), "about 2.5 g" (A5), "about 1.25 g" (A6). If a precise figure is shown, use 4.99 g and say it is calculated, not weighed. Check with the physical weight tolerance: real 80 gsm paper is typically +/- 2.5 % (one spec, section 1.4), so 4.99 g is a calculation, not a measurement. **derived; high for the method.**

### 13.2 Re-check of derived numbers (verdicts)

Method: the Gallivan formula as quoted by Live Science and MathWorld (section 3.1): L = (pi t / 6)(2^n + 4)(2^n - 1), L = minimum length of material for n single-direction folds, t = thickness. Numbers below computed with a script.

| # | Claim | Verdict | Working |
|---|---|---|---|
| 1 | One A4 sheet manages six one-direction folds | **Correct as an ideal-case result, with caveats.** | t = 0.1 mm: n = 6 needs L = 0.224 m, n = 7 needs 0.878 m, n = 8 needs 3.47 m. The A4 long side is 0.297 m, so 6 fits, 7 does not. Sensitivity: t = 0.097 mm gives 0.218 m (n=6) and 0.851 m (n=7); t = 0.108 mm gives 0.242 m and 0.948 m; the answer stays six across the whole measured caliper range (97 to 108 um, section 1.3). Caveats: the formula is for ideal thin material folded in one direction, the length is of the starting strip, and the 7th fold of a real stiff sheet is blocked by bulk long before geometry; "six folds" is what the maths allows, not a demonstrated record. Wording: "By Gallivan's formula, a 0.1 mm sheet needs about 0.88 m of length to fold seven times, and an A4 sheet is 0.297 m long, so six folds is the ceiling." |
| 2 | 0.1 mm x 2^6 = 6.4 mm | **Correct.** | 2^6 = 64; 64 x 0.1 mm = 6.4 mm (a stack of 64 layers; ignores the real thickness added by fold radii). Real folded wads are thicker than 6.4 mm in practice because layers do not compress to zero gap. |
| 3 | 42 folds = about 440,000 km | **Correct (ideal).** | 2^42 = 4,398,046,511,104. x 0.1 mm = 4.398e11 mm = 439,805 km. For t = 0.097 mm: 426,611 km; for 0.108 mm: 474,989 km. 41 folds: 219,902 km (does not reach the Moon). Moon distance: average 384,400 km, perigee about 363,300 km, apogee about 405,500 km (section 3.1). So 42 folds exceeds even the apogee, and 41 does not reach the Moon at all. Say "about 440,000 km" or "more than the distance to the Moon"; always say "ideal" or "if it were possible". |
| 4 | A 500-sheet ream is about 2.5 kg and about 5 cm | **Correct.** | Mass: 500 x 4.9896 g = 2,494.8 g (nominal 500 x 5 g = 2.5 kg). Height: 500 x 0.1 mm = 50 mm (with 97 to 108 um: 48.5 to 54 mm). Real reams are sold at about 2.5 kg, plus the wrapper (not sourced; do not quote a retail pack weight). |
| 5 | A 50-sheet pad is about 250 g and about 5 mm | **Correct for the paper alone.** | 50 x 4.99 g = 249.5 g; 50 x 0.1 mm = 5.0 mm. A real pad adds a backing board and glued edge, so a retail pad is thicker and heavier: say "50 sheets of paper weigh about 250 g and stack about 5 mm". |
| 6 | A4 area = 62,370 mm^2 | **Correct.** | 210 x 297 = 62,370 mm^2 = 0.06237 m^2. |

### 13.3 The EU 79.3 % (2023) paper recycling rate

- **Is it real? Yes.** The European Paper Recycling Council (EPRC) Monitoring Report 2023 (published 2024) states that **79.3 %** of all paper and board consumed in Europe was recycled in 2023, up from **71.1 %** in 2022. Sources: https://www.cepi.org/wp-content/uploads/2024/11/24-4378_EPRC_2023_Singlepages.pdf ; https://www.eurosac.org/media/news/eprc-monitoring-report-2023/ ; https://fefco.org/sites/default/files/EPRC-24-008_Monitoring%20Report%202023.pdf . **high**
- **Why it jumped:** the report attributes it to a denominator effect: consumption of paper and board fell much more than recycling did (record energy prices in 2022 hit mills, and destocking followed). A later press release says 2023 was "boosted by exceptional destocking activity across several industries". The 2022 figure appears as **70.5 %** in the original EPRC press release (31 July 2023) and as **71.1 %** in the 2023 report, so the 2022 number was **revised**. Sources: https://www.cepi.org/wp-content/uploads/2023/07/EPRC-press-release_moniroting-report-2022_FINAL_31072023.pdf ; https://www.cepi.org/press-release-european-paper-recycling-council-reports-strong-recycling-rates-for-2024/ . **medium** that this is the reason (EPRC's explanation, not independent).
- **Did the method change?** I found **no statement of a methodology change.** The definition stays "recycling of used paper, including net trade of Paper for Recycling, divided by consumption of new paper and board". The jump is explained as a swing in the inputs plus a revised 2022 figure. **medium** (absence of evidence).
- **2024:** EPRC reports **75.1 %** for 2024 (down from 79.3 %), with a **three-year rolling average of 75.2 %**; 2024 recycling 53.4 million tonnes (-0.4 %), consumption 71.1 million tonnes (+5.2 %); paper packaging recycles at 83.1 %. Target: 76 % by 2030 (European Declaration on Paper Recycling 2021-2030). Sources: https://www.cepi.org/press-release-european-paper-recycling-council-reports-strong-recycling-rates-for-2024/ ; https://www.paperadvance.com/news/market-analysis/european-paper-recycling-rate-in-2024.html ; https://www.eurosac.org/fileadmin/pdf/citpa_news/EPRC-25-005.pdf . **high** (EPRC press release plus trade press).
- **Safest wording:** "The European paper industry reports that about three-quarters of the paper and board consumed in Europe is recycled (75.1 % in 2024, three-year average 75.2 %, European Paper Recycling Council)." **Do not use 79.3 % as "the" rate**: it was a one-year peak inflated by destocking. If a single number is needed, use 75.1 % (2024) with the year and source. This is a European-industry-body figure and is a different measure from the US AF&PA rate, so do not compare the two on the page. Fact in section 4 should be read with this update.

### 13.4 Carbon per A4 sheet

- **Study:** Ana Claudia Dias and Luis Arroja (University of Aveiro, Portugal), "Comparison of methodologies for estimating the carbon footprint - case study of office paper", *Journal of Cleaner Production*, vol. 24, pp. 30-35, **published March 2012**. Functional unit: one A4 sheet of office paper, **80 g/m^2**, cradle-to-customer. Results: **4.64 g CO2e** (ISO 14040/14044 limited to greenhouse gases), **4.74 g** (PAS 2050), **4.29 g** (CEPI framework). Major hot spots: eucalypt pulp and office-paper production, plus chemicals and fuel. Sources: https://www.sciencedirect.com/science/article/abs/pii/S0959652611004409 ; https://www.researchgate.net/publication/235712203_Comparison_of_methodologies_for_estimating_the_carbon_footprint_-_case_study_of_office_paper . **high** for the numbers (publisher abstract via search summary and two repositories agree). The paper is from a Portuguese eucalypt-pulp supply chain, so it describes one product, not all copy paper.
- **Range 4.3 to 4.7 g CO2e per sheet is confirmed.** Caveat: a 2012 study of one supply chain; methodologies differ; cradle-to-customer (excludes disposal).
- **Safest wording:** "One study of an 80 gsm A4 sheet (Dias and Arroja, 2012) estimated about 4.3 to 4.7 grams of CO2-equivalent per sheet, depending on the method." Comparison (derived): a sheet weighs about 5 g and carries about 4.6 g CO2e, roughly its own weight. Do not say "aviva's carbon footprint is..." as a fact; it is a parody product and a generic study.

### 13.5 Guinness rules for the paper in the plane records

Source for both: https://www.guinnessworldrecords.com/world-records/farthest-flight-by-a-paper-aircraft ; https://www.guinnessworldrecords.com/world-records/longest-time-flying-a-paper-aircraft ; https://www.foldnfly.com/lounge/world-record-paper-airplanes.php (search summaries; the two Guinness pages list the same guidelines). **medium to high** (Guinness's own guidelines quoted by search; I could not open the pages).

- **Distance (98.43 m, 28 Dec 2025):** paper must be at most **A4 size and at most 100 g/m^2**; folded **without glue, tears or cuts**; a **small piece of clear tape, 25 x 30 mm, is allowed**; thrown **indoors** from behind a starting line; measured from the line to the first point of ground contact.
- **Time aloft (31.2 s, 11 Feb 2026):** "unmodified, commercially available **A4 or equivalent** paper", maximum A4 and **100 g/m^2**; **no glue, tears or cuts**; **25 x 30 mm clear tape allowed**; thrown **indoors** behind a line; timed to the nearest hundredth of a second.
- Comedy-safe reading: both records fit an ordinary 80 gsm A4 sheet (within the 100 g/m^2 cap), with one postage-stamp piece of tape permitted. So "a sheet like ours" is eligible, but we cannot say the record planes were made from 80 gsm paper (the distance team reportedly tested over 100 paper types; their choice is not given in the sources I saw).

### 13.6 Locke's wording

- Book II ("Of Ideas"), chapter I ("Of Ideas in general, and their Original"), section 2 ("All ideas come from sensation or reflection"). The sentence in the standard text: **"Let us then suppose the mind to be, as we say, white paper, void of all characters, without any ideas: How comes it to be furnished?"** The answer that follows: "To this I answer, in one word, from EXPERIENCE. In that all our knowledge is founded; and from that it ultimately derives itself." Sources: https://www.marxists.org/reference/subject/philosophy/works/en/locke.htm ; https://constitutioncenter.org/the-constitution/historic-document-library/detail/john-lockean-essay-concerning-human-understanding-1690 ; https://faculty.fiu.edu/~hauptli/Locke'sEssayBookII.htm ; https://en.wikipedia.org/wiki/An_Essay_Concerning_Human_Understanding (search summaries; one summary prints "white paper [tabula rasa], void of all characters without any ideas"). **Verdict:** "white paper, void of all characters" is **verbatim and confirmed** in several editions (**high**). The comma/spelling differs between editions (the 1690 printing capitalises and spells "Paper", "Mind"); the modernised text above is the common one. The sentence also continues "without any ideas", so a quotation can end at "characters" only if the quote marks stop there. Year: sources disagree, because the Essay circulated in late 1689 but its title page is dated 1690 (the Constitution Center library lists it as 1690, the Wikipedia/EBSCO summaries in section 5.3 say 1689). Safest: "1689/1690", or no year. **medium** for the year (from my memory the first edition appeared in December 1689 with a 1690 title page, but I did not see that stated in this session's results).
- Correction to section 5.3 and fact 24, which give "1689" flat: write "1689/1690" there.
- Locke does not say the mind is a "blank slate" (tabula rasa is a later label); keep "white paper".

### 13.7 Rauschenberg's *Erased de Kooning Drawing*: "about a month"?

- **Rauschenberg himself, quoted in an SFMOMA-published interview: "it took me about a month, and I don't know how many erasers to do it."** Source: https://www.sfmoma.org/artwork/98.298/ ; https://www.sfmoma.org/artwork/98.298/research-materials/document/EDeK_98.298_031/ (search summary of the SFMOMA material). **medium to high**.
- **But SFMOMA's curatorial essay (Sarah Roberts, 2013) says "two months of erasing and countless spent erasers"**, and other writers repeat "two months" and "forty erasers". Sources: https://www.sfmoma.org/artwork/98.298/essay/erased-de-kooning-drawing/ ; https://d1hhug17qm51in.cloudfront.net/www-media/2018/10/03215343/SFMOMA_RRP_Erased_de_Kooning_Drawing.pdf ; https://news.artnet.com/art-world/art-bites-robert-rauschenberg-erased-de-kooning-drawing-2633307 ; https://www.arteidolia.com/forty-erasers-attack-valuable-drawing-by-sandy-kinnee/ . **medium** (the "forty erasers" detail is single-source, low).
- **Verdict:** "about a month" is **what Rauschenberg said**, and "two months" is **what the museum's essay says**. Safe wording: "Rauschenberg said it took about a month (the museum's essay says two) and many erasers." **Correct the earlier statement in 5.3 and fact 23, which said "about a month" as flat fact.** Also: de Kooning chose a drawing that would be hard to erase, made in charcoal, oil paint, pencil and crayon (so graphite was one of several media); SFMOMA used infrared scanning in 2010 to bring out faint remaining traces. Source: https://www.sfmoma.org/artwork/98.298/research-materials/document/EDeK_98.298_003/ ; https://smarthistory.org/erased-dekooning-rauschenberg/ . **medium**.

### 13.8 Pencil and eraser facts for the writing beat

1. **Pencil "lead" is graphite, not lead.** A pure graphite deposit was found at **Borrowdale, England, in 1564** (shepherds used it to mark sheep); it was called *plumbago* ("lead ore") and "black lead" because it looked like lead ore. Pencils are graphite (mixed with clay), never lead. Sources: https://en.wikipedia.org/wiki/Borrowdale_graphite ; https://theuselessgenius.substack.com/p/the-lead-pencil-lie-why-your-pencil (search summaries). **medium to high** (several sources agree on 1564 and the misnomer).
2. **Why pencil can be erased and ink can't.** Pencil marks are graphite particles that cling loosely to the surface of the paper fibres (weak physical, van der Waals forces); graphite sticks to the eraser's polymer more strongly than to paper, so the eraser lifts it. Ink is a liquid that wicks into the pores and fibres by capillary action and dyes or bonds to them, where an eraser cannot reach. Sources: https://www.scienceabc.com/eyeopeners/why-can-pencil-be-easily-erased-off-a-paper-but-ink-cant ; https://www.popsci.com/science/how-do-erasers-work/ ; https://blog.pencils.com/pencil-facts-how-erasers-work/ ; https://science.howstuffworks.com/innovation/everyday-innovations/erasers-erase.htm . **high** (consistent across several explainers; popular-science level, not a primary study). Note: ScienceABC-type articles simplify; "the real mechanism is complicated" per PopSci, so say "mostly" or "largely".
3. **The eraser ghost is real.** Erasing can disturb the paper fibres and leave changes in surface texture, thickness or reflectivity; the **pressure indentation of the original writing often remains** after the colour is gone and can be revealed by raking light, infrared or ESDA (electrostatic detection apparatus); the ESDA can detect even very light pencil impressions left several sheets below. Sources: https://hawkeyeforensic.com/can-you-erase-the-evidence-the-forensic-science-of-erased-documents/ ; https://www.aafs.org/sites/default/files/media/documents/AAFS-2016-J2.pdf ; https://www.ojp.gov/ncjrs/virtual-library/abstracts/decipherment-impressions-paper-some-methods-old-and-new . **medium** (a forensic-services blog plus abstracts). "Erased" does not mean "gone" is a strong writing beat; I would call it a "ghost" only as a figure of speech (the term "ghost lines" is used in forensic writing for impressions transferred to the sheet beneath).
4. **The rubber eraser's name.** On 15 April 1770, **Joseph Priestley** wrote that a substance sold by Edward Nairne was "excellently adapted to the purpose of wiping from paper the mark of black-lead-pencil", and suggested the material be called "rubber" for rubbing away pencil marks; in the UK erasers are still called rubbers. Source: https://en.wikipedia.org/wiki/Eraser ; https://www.madehow.com/Volume-5/Eraser.html ; https://southfloridareporter.com/the-eraser-was-discovered-in-1770-a-pencil-with-an-eraser-was-invented-in-1858/ (search summaries; the last also says a pencil with an attached eraser was patented in 1858). **medium to high** (the Priestley passage is well documented; the attribution of the first commercial eraser to Nairne is reported with a "reportedly" in the sources).
5. **The 35-mile claim.** "A single pencil can draw a line about **35 miles** (about 56 km) long, write about **45,000 words**, and survive about 17 sharpenings" is repeated by pencil retailers and trivia pages, and one source says explicitly that it "has never been tested". Sources: https://www.baltimoresun.com/1991/07/14/a-case-in-point-more-than-200-years-after-its-invention-the-pencil-is-still-something-to-write-home-about/ (a 1991 newspaper piece quoting the figure); https://blog.pencils.com/10-little-known-pencil-facts/ ; https://dustyinfo.com/a-single-pencil-can-write-45000-words/ ; https://www.pencilsdirect.co.uk/how-far-will-a-pencil-write/ . **low to medium. Widely repeated, but I found no primary measurement.** If used, write "is often said to be able to draw a line about 35 miles (56 km) long". Derived: 56 km is about 190,000 A4 sheet-lengths (35 x 1,609.34 m = 56,327 m; / 0.297 m = 189,653). Fun fit with the concept: one pencil can cover an A4 sheet's long side about 190,000 times, or fill the page itself only about one 190,000th of the way.
6. (Extra, optional, from the same sources) Faber-Castell, founded **1761** in Stein, Germany (by Kaspar Faber), makes about **2 billion pencils** a year. Source: https://en.wikipedia.org/wiki/Faber-Castell (search summary). **medium**.

### 13.9 Unverified or not confirmed in this addition

- ISO 216:2007 itself was not opened; the A0 to A10 table is a consistent four-source result (high), but the standard's tolerances (for example +/-1.5 mm for sizes up to 150 mm, +/-2 mm for 150 to 600 mm, +/-3 mm above 600 mm) are from memory and **not sourced here**; do not quote them.
- The reason for the EU 2023 spike is EPRC's own account; no independent analysis was found.
- The exact verbatim spelling of Locke's 1690 printing was not seen; the modernised wording is confirmed in several editions.
- The "forty erasers" figure and the exact length of Rauschenberg's erasing remain disputed (one month by the artist; two months by SFMOMA's essay).
- The 35-mile pencil claim is unverified (no measurement found).

### 13.10 Fact-check pass on the creative brief (2026-10-02): new and corrected facts

Full table in `work/reviews/brief-factcheck.md`. Method: WebSearch summaries only (WebFetch was blocked on every host tried). These facts correct or extend earlier sections.

1. **Gallivan, two formulas (extends 3.1 and 13.2).** The Guinness record page and MathWorld give both: single direction **L = (pi t / 6)(2^n + 4)(2^n - 1)** (minimum length of a strip) and alternate directions **W = pi t 2^(3(n-1)/2)** (minimum width of a square sheet). For t = 0.1 mm: single direction n = 6 needs 0.224 m, n = 7 needs 0.878 m; alternate n = 7 needs 160.8 mm, n = 8 needs 454.9 mm. So an A4 sheet (210 x 297 mm) stops at **six when folded the same way each time** but could reach **seven when folded alternately** (ideal case). The "six folds" line must always say "one direction". **high / derived.** Record: 27 Jan 2002, Pomona, 12 folds, 4,000 ft (1,219 m) of **tissue** paper (some say toilet paper); first person to fold 9, 10, 11 and 12 times; formula derived Dec 2001. Source: https://www.guinnessworldrecords.com/world-records/494571-most-times-to-fold-a-piece-of-paper ; https://mathworld.wolfram.com/Folding.html
2. **Gallivan's booklet.** *How to Fold Paper in Half Twelve Times: An "Impossible Challenge" Solved and Explained*, Historical Society of Pomona Valley, 2002, about 40 pages. **high** (title, publisher). Source: https://www.livescience.com/how-many-times-can-paper-be-folded ; https://www.mentalfloss.com/article/62865/how-many-times-can-you-fold-piece-paper ; https://www.damninteresting.com/retired/never-say-never
3. **1975 Business Week.** "The Office of the Future", issue of 30 June 1975. The "paperless" prediction is Vincent E. Giuliano's (Arthur D. Little), quoted: paper use for records "should be declining by 1980, and by 1990, most record-handling will be electronic". George Pake (Xerox PARC) said his 1995 office would have a display terminal. Title high; date med-high; page range not confirmed. Source: https://en.wikipedia.org/wiki/Paperless_office ; https://en.wikipedia.org/wiki/Office_of_the_future (search summaries)
4. **"Doubled 1980 to 2000" (corrects 2 and 5.4).** World paper and paperboard **production** was **171 million tonnes in 1980 and 324 million tonnes in 2000** (ratio 1.89: "nearly doubled"). Wikipedia's sentence is about *office* paper ("more than doubled", one estimate). Do not mix the two. **med.** Source: BIR 2010 / FAO series via https://fao.org/docrep/pdf/010/a0964m/a0964m08.pdf (search summary)
5. **Sellen and Harper (corrects 2).** *The Myth of the Paperless Office*, MIT Press, **2002** (hardcover); paperback 28 Feb 2003. The email-raises-paper-use-by-40 % finding is from the book. **high.** Source: https://www.ggarchives.com/Books/Reference/TheMythOfThePaperlessOffice-2002.html ; https://www.readings.com.au/product/9780262692830
6. **Priestley and "rubber" (corrects 13.8 item 4).** Source work: *A Familiar Introduction to the Theory and Practice of Perspective*, London, printed for J. Johnson and J. Payne, 1770 (footnote after the preface, dated 15 April 1770 in secondary sources). He **recommended** a substance sold by Edward Nairne as "excellently adapted to the purpose of wiping from paper the mark of black-lead pencil"; "rubber" was already a general word for anything used for rubbing and became attached to the material between 1770 and 1778. **Do not write that Priestley "named" it.** **med.** Source: https://www.grubstreetproject.net/publications/T3137 ; https://en.wikipedia.org/wiki/Eraser ; https://itotd.com/?p=929 (search summaries)
7. **ISO 216 citation.** ISO 216:2007, "Writing paper and certain classes of printed matter - Trimmed sizes - A and B series, and indication of machine direction", published Aug 2007, replaces ISO 216:1975 (May 1975), confirmed Sept 2021. Edition number inconsistent across listings, so cite by year. **high.** Source: https://www.boutique.afnor.org/en-gb/standard/iso-2162007/writing-paper-and-certain-classes-of-printed-matter-trimmed-sizes-a-and-b-s/xs019968/114019 ; https://ccn-scc.ca/standardsdb/standards/8117979 ; https://webstore.ansi.org/standards/iso/iso2162007
8. **C5 (13.1 and 1.1).** C5 = 162 x 229 mm takes A5 flat or A4 folded once; A3 folded twice (148.5 x 210 mm) also fits (derived). **high / derived.** Source: https://papersizes.io/c/ ; https://papersizes.org/c-envelope-sizes.htm ; https://www.dimensions.com/element/c5-envelope-paper
9. **Fibre recycling count (extends 3.5).** "Five to seven times" is the long-repeated figure; Karlstad University and the industry now speak of "up to 25 cycles" and call 5-7 the old claim. Say "usually said to be five to seven". **high** (mechanism) / **med** (numbers). Source: https://www.kau.se/en/news/mystery-around-hornification-about-be-solved ; https://idw-online.de/de/news828570
10. **Grammage and caliper of 80 gsm copy paper (extends 1.2, 1.3, 1.4).** Datasheets (ISO 536 / ISO 534): grammage tolerance **80 +/- 3.0 g/m2** or **+/- 4 %** (not +/- 2.5 %); caliper **102 to 109 um** (106 +/- 3, 104 +/- 3, 109, 103, 102). **med.** Source: https://cdn.lomax.dk/image/upload/dokumenter/1515200_4.pdf ; https://assets.ccntr.pbsnetwork.eu/assets/5790002616839/27-5557-sky-copy-80g-s-en1.pdf (search summaries)
11. **What holds copy paper together (extends 1.7).** Fibre-fibre hydrogen bonding is the main mechanism, but copy paper also contains mineral filler (precipitated calcium carbonate, clay), starch (size-press coating about 20 to 40 kg per tonne; wet-end starch) and AKD sizing. So "no glue, nothing else holds it" is not literally true. **med-high.** Source: patents.justia.com/patent/5514212 ; EPO EP1704282 (search summaries)
12. **Cai Lun (extends 2).** Hou Hanshu vol. 78: made paper from **tree bark, hemp remnants, rags of cloth and fishing nets** and submitted it in the first year of Yuanxing (105). "Mulberry" is a later gloss in some modern accounts. **high** (list) / traditional (date). Source: https://en.wikipedia.org/wiki/Cai_Lun ; https://loongese.com/blog/pantheon/Cai_Lun (search summaries)
13. **Fangmatan (extends 2).** The 5.6 x 2.6 cm fragment bears an **ink-drawn map** (tomb dated 179-141 BCE); Baqiao (2nd century BCE, unwritten) is a later or comparable find. **med-high.** Source: https://en.wikipedia.org/wiki/Fangmatan (search summary)
14. **Diamond Sutra wording.** British Library's colophon translation: "Reverently made for universal free distribution by Wang Jie on behalf of his two parents", 11 May 868; other translations: "for universal distribution". Oldest *surviving* complete dated printed book. **high** (date) / **med** ("free"). Source: https://www.cabinet.ox.ac.uk/worlds-earliest-dated-printed-book-diamond-sutra-868-ce ; https://idp.bl.uk/blog/the-diamond-sutra/
15. **Locke publication (upgrades 13.6).** Published December 1689, title page dated 1690. "1689/1690" is correct. **high.** Source: https://timeline.remnanttrust.org/project/an-essay-concerning-humane-understanding/ ; https://projectvox.org/?p=149
16. **Dias and Arroja (13.4).** DOI 10.1016/j.jclepro.2011.11.005; *J. Cleaner Production* 24, 30-35 (2012); 4.64 / 4.74 / 4.29 g CO2 eq per A4 sheet, cradle-to-customer. The "80 g/m2" detail was not re-confirmed. **high** (numbers). Source: https://www.sciencedirect.com/science/article/abs/pii/S0959652611004409 (search summary)
17. **Paper-cut sources (extends 3.4).** The Ohio State Wexner article (Dr Jayesh Vallabh, 9 May 2025) supports the nerve-density explanation; the "jagged edge saws rather than slices" and "too shallow to clot" statements come from Big Think and ScienceAlert. Cite both. **med.** Source: https://wexnermedical.osu.edu/blog/why-do-papercuts-hurt-so-much ; https://bigthink.com/surprising-science/heres-why-paper-cuts-hurt-so-damn-much/
18. **Guinness paper rules (extends 13.5).** Distance guidelines as reported: one sheet of A4 weighing under 100 gsm, tape up to 2.5 x 3 cm, indoors, run-up up to 3.04 m; one summary says "can be cut but not spliced", which contradicts 13.5's "no cuts": treat the cut/tear rule as **unconfirmed** and do not quote it. Time record: "unmodified, commercially available A4 or equivalent". **med.** Source: https://www.guinnessworldrecords.com/world-records/longest-time-flying-a-paper-aircraft ; https://www.guinnessworldrecords.es/world-records/farthest-flight-by-a-paper-aircraft
