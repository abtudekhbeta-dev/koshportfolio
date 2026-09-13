export type BusinessCard = {
  what: string;
  makes: string;
  cycle: string;
  products?: string;
  watch?: string[];
};

const CARDS: Record<string, BusinessCard> = {
  RELIANCE: {
    what: "Reliance Industries is India’s largest listed company, built by Dhirubhai Ambani and run by Mukesh Ambani. The group sits across energy, petrochemicals, retail and digital. Jio and Reliance Retail are the consumer engines; the Jamnagar refining and chemical complex still prints most of the cash. Investors treat it as a conglomerate: one ticker, several cycles.",
    products: "Fuels and petrochemicals from Jamnagar; Jio mobile, fibre and digital ads; Reliance Retail grocery, fashion and electronics; a growing new-energy book (solar, batteries, green hydrogen).",
    makes: "Refining cracks and petrochem spreads still fund the dividend. Jio earns on ARPU × subscribers. Retail earns on store throughput and private-label mix. New energy is still a capex story.",
    cycle: "Oil cracks and the rupee move the old businesses. Jio is about tariff hikes, capex and 5G payback. Retail follows urban consumption. Group capex is the long option.",
    watch: ["Singapore GRM / refining cracks", "Jio ARPU and net adds", "Retail like-for-like growth", "New-energy capex versus O2C cash"],
  },
  TCS: {
    what: "Tata Consultancy Services is India’s largest IT services firm and the cash engine of the Tata group. It runs software, cloud and operations for global banks, retailers and manufacturers — billed in dollars, delivered from India. A long client book and a fortress balance sheet are the franchise.",
    products: "Application development, cloud migration, consulting and operations. Banking is the largest vertical; retail and manufacturing sit next.",
    makes: "Time-and-material plus fixed-price contracts. Utilisation × rate × headcount is the P&L. Deal TCV and attrition tell you the next four quarters.",
    cycle: "US and Europe IT budgets, visa costs, and the dollar-rupee. Discretionary digital projects slow first in a US recession.",
    watch: ["Large-deal TCV and book-to-bill", "Utilisation and attrition", "BFSI spend in the US", "Constant-currency growth guidance"],
  },
  INFY: {
    what: "Infosys is a large-cap IT services firm, similar mix to TCS but a bit more digital and cloud in the pitch. Bangalore-based, listed in India and New York. A clean balance sheet and a buyback habit. Slightly more cyclical than TCS when US financials cut spend.",
    products: "Outsourcing, consulting and cloud transformation. Financial services is a large vertical.",
    makes: "Dollar contracts, India delivery. Large-deal TCV plus utilisation and offshoring.",
    cycle: "US financials spend, utilisation, wage inflation, and the rupee.",
    watch: ["Guidance and large-deal TCV", "Financial-services vertical", "Utilisation and attrition", "Buyback / capital return"],
  },
  HDFCBANK: {
    what: "HDFC Bank is India’s largest private bank by most measures — a retail deposit franchise with mortgages, cards and a huge liability book. The 2023 merger with HDFC Ltd is still being digested: loan mix, CD ratio and a hangover in the mortgage engine. It is the default quality bank name in domestic portfolios.",
    products: "Savings and current accounts, home loans, auto and personal loans, credit cards, wholesale credit, plus life, AMC and securities subsidiaries.",
    makes: "Net interest margin on loans minus deposits, plus fees on cards and third-party products. Credit costs are the swing.",
    cycle: "Credit growth versus deposit costs. NIM and slippages are what to watch. Merger integration is the 2024–26 story.",
    watch: ["Deposit growth vs loan growth", "NIM and CASA mix", "Slippages and credit cost", "Mortgage origination after the merger"],
  },
  ICICIBANK: {
    what: "ICICI Bank is the second large private bank. Retail plus corporate, with a cleaner book than a decade ago and a stack of listed subsidiaries (life, general, securities, AMC). The re-rating has been about asset quality, not just growth.",
    products: "Retail and corporate loans, deposits, cards, and a full insurance and asset-management stack.",
    makes: "Spread on loans, fees, and the value of subsidiaries. Credit costs used to dominate; they have been quieter this cycle.",
    cycle: "Credit cycle and deposit competition with HDFC and SBI. Asset quality is the re-rating.",
    watch: ["Credit cost and GNPA", "Deposit franchise vs HDFC", "NIM", "Subsidiary valuations"],
  },
  SBIN: {
    what: "State Bank of India is the public-sector giant. Every large PSU flow and a huge retail deposit base. Beta to the economy is high; the treasury book makes it a bond-yield name as well as a credit name.",
    products: "Retail and corporate loans, government business, treasury, cards, and a clutch of subsidiaries (life, cards, mutual fund).",
    makes: "Interest income on a massive loan book. Treasury and government business on the side.",
    cycle: "Bond yields (treasury), credit growth, and PSU recap politics.",
    watch: ["Credit growth vs PSU peers", "Treasury / bond yields", "Slippages in SME and agri", "Dividend"],
  },
  BHARTIARTL: {
    what: "Bharti Airtel is India’s second mobile operator, with home broadband and enterprise on the side, and Africa sitting in a listed subsidiary. After the Jio shock it re-rated on tariff hikes, coverage and a cleaner AGR leftover. It is the quality telco versus Vodafone Idea.",
    products: "Mobile (prepaid and postpaid), home fibre, enterprise connectivity, digital TV, and Airtel Payments Bank.",
    makes: "ARPU × subscribers. Tower and spectrum capex is the tax on growth. Homes and enterprise are the mix upgrade.",
    cycle: "Tariff hikes versus Jio. Capex intensity and AGR leftovers. A tariff cycle can re-rate the whole name.",
    watch: ["India mobile ARPU and tariff actions", "4G/5G mix", "Capex to sales", "Homes and enterprise growth"],
  },
  ITC: {
    what: "ITC is still a cigarette company that happens to own FMCG, hotels, paper and agri. Cigarettes print the cash; everything else is the attempt to re-rate the multiple. Hotels have been the surprise of this cycle. A defensive cash compounder with a fading government overhang.",
    products: "Cigarettes (Gold Flake, Classic), FMCG (Aashirvaad, Sunfeast, Bingo), hotels, paperboards, and agri commodities.",
    makes: "High-margin tobacco in India funds the rest. FMCG is volume × price on branded staples. Hotels follow occupancy.",
    cycle: "Excise and illicit cigarettes. Rural demand for FMCG. Occupancy for hotels. Any tax shock is the left tail.",
    watch: ["Cigarette volumes and net realisations", "FMCG EBIT margin", "Hotel occupancy", "Excise / illicit channel"],
  },
  HINDUNILVR: {
    what: "Hindustan Unilever is soaps, detergents, tea and ice cream — the urban and rural pantry. A Unilever subsidiary and the quality defensive of Indian FMCG. Premiumisation versus rural recovery is the perpetual debate.",
    products: "Surf, Wheel, Dove, Lifebuoy, Clinic Plus, Brooke Bond, Kwality Wall’s, and a long tail of homecare and personal care.",
    makes: "Volume × price on branded staples. Advertising is the reinvestment. Gross margin tracks palmolein and crude.",
    cycle: "Rural recovery, palmolein/crude input costs, and premiumisation. Defensive when risk is off.",
    watch: ["Rural versus urban volume", "Gross margin / palmolein", "Premium mix", "Advertising to sales"],
  },
  LT: {
    what: "Larsen & Toubro is engineering and construction, plus IT (LTIMindtree) and a finance arm. India’s infra proxy: order book in, revenue out, with a services overlay.",
    products: "Infra, hydrocarbons, defence, power, and heavy engineering. LTIMindtree is the IT listco; L&T Finance is the NBFC.",
    makes: "Order book converted into revenue. Services on the side. Execution and working capital are the craft.",
    cycle: "Government capex, private capex, and execution. Order inflows lead the stock by months.",
    watch: ["Order inflows and book-to-bill", "Core E&C margin", "Working capital", "LTIMindtree and finance"],
  },
  MARUTI: {
    what: "Maruti Suzuki is India’s volume car leader, still Suzuki-controlled. The mix is shifting up-market through Nexa, while the small-car heartland is slower. A high-quality auto franchise with a distribution moat.",
    products: "Alto to Brezza to Grand Vitara; Nexa premium; CNG mix; a large service and spare-parts annuity.",
    makes: "Small and mid cars, plus Nexa. Mix and realisations have mattered more than volume this cycle.",
    cycle: "Rural and first-time buyers, commodity costs, and pressure from Tata, Mahindra and Hyundai.",
    watch: ["Mix (Nexa / SUV / CNG)", "Wholesale vs retail", "Discounts", "Rural demand"],
  },
  "M&M": {
    what: "Mahindra & Mahindra is SUVs, tractors, and a farm-equipment franchise. Auto margins have been the surprise of this cycle; tractors are the monsoon business.",
    products: "XUV and Scorpio SUVs, Bolero, tractors, farm equipment, and a long list of subsidiaries.",
    makes: "XUV and Scorpio sales plus tractor volumes. Auto margins have carried the last few years.",
    cycle: "Monsoon and farm cash for tractors. SUV fashion and waitlists for auto.",
    watch: ["SUV waitlists and mix", "Tractor volumes vs monsoon", "Auto margin", "EV pipeline"],
  },
  TATAMOTORS: {
    what: "Tata Motors is India commercial vehicles and passenger cars, plus Jaguar Land Rover. JLR still dominates profit. India PV is the share-gain story versus Maruti; CV is cyclical.",
    products: "JLR (Range Rover, Defender, Jaguar), India Nexon/Punch/Harrier, and commercial vehicles.",
    makes: "JLR cash, India PV mix, and CV replacement cycles.",
    cycle: "Europe/China JLR demand, commodity costs, and India CV replacement.",
    watch: ["JLR wholesales and China", "India PV share", "CV cycle", "EV mix (Nexon EV, JLR)"],
  },
  SUNPHARMA: {
    what: "Sun Pharma is India’s largest drug maker — India branded, US generics, and specialty (Ilumya and others). India chronic is the ballast; US specialty is the upside.",
    products: "Chronic therapies in India, US specialty dermatology, and a grind of US generics.",
    makes: "India branded plus US specialty. Generics are the volume grind.",
    cycle: "US FDA, price erosion, and specialty launches.",
    watch: ["Specialty sales (Ilumya etc.)", "US FDA / plant status", "India chronic growth", "Gross margin"],
  },
  AXISBANK: {
    what: "Axis Bank is a private lender, historically wholesale-heavy, now more retail. A catch-up story versus HDFC and ICICI.",
    products: "Retail and corporate loans, deposits, cards, and a smaller subsidiary stack.",
    makes: "NIM on a mixed loan book, plus fees.",
    cycle: "Credit costs and the deposit franchise.",
    watch: ["Deposit growth", "Credit cost", "Retail mix", "CASA"],
  },
  KOTAKBANK: {
    what: "Kotak Mahindra Bank is a conservative private bank with a strong liability franchise and a large promoter. Wealth, brokerage and AMC sit around the bank.",
    products: "Loans, deposits, wealth, brokerage, AMC.",
    makes: "Spread plus the financial-services ecosystem.",
    cycle: "Growth versus conservatism. Leadership change and RBI restrictions have been stock events.",
    watch: ["Loan growth vs peers", "RBI / governance headlines", "CASA", "Wealth and AMC"],
  },
  BAJFINANCE: {
    what: "Bajaj Finance is the large-cap consumer NBFC — EMIs, cards, and consumer durables. High beta to risk appetite.",
    products: "Consumer durable loans, personal loans, cards, SME, and two-wheeler finance.",
    makes: "Spread on a granular loan book. Fees and cross-sell into the Bajaj ecosystem.",
    cycle: "Credit costs, funding costs, and RBI tightening on consumer credit.",
    watch: ["AUM growth", "Credit cost", "Funding cost / NIM", "RBI actions on consumer credit"],
  },
  BAJAJFINSV: {
    what: "Bajaj Finserv is the holding company for Bajaj Finance, Bajaj Allianz life/general, and health. Not an operating lender itself.",
    products: "A listed claim on Bajaj Finance plus insurance.",
    makes: "Value of the finance and insurance stack.",
    cycle: "Tracks Bajaj Finance plus insurance underwriting. Holding-company discount waxes and wanes.",
    watch: ["Bajaj Finance print", "Insurance VNB / combined ratio", "Holdco discount"],
  },
  NESTLEIND: {
    what: "Nestlé India is Maggi, coffee, baby food and dairy. A premium urban FMCG franchise with a Swiss parent.",
    products: "Maggi, Nescafé, Cerelac, KitKat, milk products.",
    makes: "Branded packaged food with high margins.",
    cycle: "Input costs (milk, coffee, wheat) and urban consumption. Very defensive.",
    watch: ["Volume growth", "Gross margin", "Rural recovery", "New launches"],
  },
  TITAN: {
    what: "Titan is jewellery (Tanishq), watches and eyewear. Tata-owned. Gold jewellery studded with design and trust.",
    products: "Tanishq jewellery, Titan watches, eyewear, and a growing international push.",
    makes: "Gold jewellery is the P&L. Watches and eyewear are smaller.",
    cycle: "Gold price, wedding season, and discretionary urban spend. Inventory is gold.",
    watch: ["Jewellery growth vs gold price", "Wedding season", "Studded mix", "Inventory days"],
  },
  ULTRACEMCO: {
    what: "UltraTech is India’s largest cement company, Aditya Birla group. Housing and infra in one name.",
    products: "Grey and white cement, ready-mix, building products.",
    makes: "Cement volumes × realisation minus energy and freight.",
    cycle: "Housing and infra demand, petcoke/coal, and industry utilisation.",
    watch: ["Realisations vs costs", "Capacity utilisation", "Energy costs", "Industry pricing discipline"],
  },
  ASIANPAINT: {
    what: "Asian Paints is the decorative paint leader, with a long distribution moat. A quality compounder that can de-rate on growth.",
    products: "Decorative paints, waterproofing, interiors, and a smaller industrial book.",
    makes: "Paint volumes in housing and repaint. Mix and tinting machines are the moat.",
    cycle: "Crude/TiO2 costs, housing, and new competition (Birla, JSW).",
    watch: ["Volume growth", "Gross margin", "New competitor share", "Repaint vs new housing"],
  },
  WIPRO: {
    what: "Wipro is IT services, historically more mixed than TCS/Infosys, still a top-tier outsourcer.",
    products: "IT contracts, consulting and cloud, mostly global.",
    makes: "Same services P&L — utilisation, rates, large deals.",
    cycle: "US spend, utilisation, large-deal TCV.",
    watch: ["Large-deal TCV", "Guidance", "Utilisation", "BFSI / consumer verticals"],
  },
  HCLTECH: {
    what: "HCLTech is IT services with a heavier infrastructure-management mix. Infra/cloud run-rate is stickier than discretionary digital.",
    products: "Outsourcing and engineering services. A bit less pure-play consulting than the others.",
    makes: "IT services with a stickier infra book.",
    cycle: "IT budget cycle. Infra is the ballast.",
    watch: ["Infra/cloud run-rate", "Deal TCV", "Utilisation", "Engineering services"],
  },
  TECHM: {
    what: "Tech Mahindra is IT services with a telecom-heavy heritage (Mahindra + BT roots). Turnaround has been the 2024–26 plot.",
    products: "Telecom, manufacturing and enterprise IT.",
    makes: "IT contracts. Execution on the turnaround is the story.",
    cycle: "Telco capex plus the usual IT cycle.",
    watch: ["Turnaround margins", "Telecom vertical", "Deal wins", "Attrition"],
  },
  NTPC: {
    what: "NTPC is India’s largest power generator — coal still, plus a renewables push. A defensive yield name.",
    products: "Thermal generation, a growing renewable book, and some trading.",
    makes: "Regulated returns on generation capacity. Merchant power on the margin.",
    cycle: "Coal availability, PLF, and CERC tariffs.",
    watch: ["PLF and coal stock", "Renewable capacity adds", "Regulated equity / RoE", "Dividend"],
  },
  POWERGRID: {
    what: "Power Grid is the inter-state transmission utility. The toll-road of electrons. Bond-proxy with some growth.",
    products: "Inter-state transmission assets, a regulated return.",
    makes: "Regulated return on transmission. Predictable cash.",
    cycle: "Capex pipeline and tariff orders.",
    watch: ["Capex / capitalisation", "Tariff orders", "Dividend", "Project pipeline"],
  },
  ONGC: {
    what: "ONGC is the national oil company. Upstream crude and gas, plus stakes in refiners. High operating leverage to oil.",
    products: "Crude and gas, plus HPCL and other downstream stakes.",
    makes: "Barrels × (realisation − cost). Subsidies and windfall taxes have clipped upside.",
    cycle: "Brent, gas prices, and government take.",
    watch: ["Brent", "Gas price formula", "Windfall tax", "Production volumes"],
  },
  COALINDIA: {
    what: "Coal India is the near-monopoly miner of thermal coal for Indian power. A cash-yield name.",
    products: "Thermal coal under FSA and e-auction.",
    makes: "Tonnes × e-auction/FSA realisations. Dividends are the product.",
    cycle: "Power demand, imported-coal prices, and wage boards.",
    watch: ["Offtake vs production", "E-auction premium", "Wage board", "Dividend"],
  },
  TATASTEEL: {
    what: "Tata Steel is India plus Europe steel. India is the cash cow; Europe is the swing. Deeply cyclical.",
    products: "Flat and long steel in India; European strip.",
    makes: "Steel spreads (HRC minus iron ore/coking coal). Europe has been a drag for years.",
    cycle: "China steel, European demand, and raw materials.",
    watch: ["India spreads", "Europe EBITDA", "Coking coal", "Net debt"],
  },
  JSWSTEEL: {
    what: "JSW Steel is India-focused steel, more domestic than Tata Steel. Capacity expansion has been the story.",
    products: "Flat and long steel.",
    makes: "Steel spreads into domestic construction and auto.",
    cycle: "Domestic construction and auto, iron ore, and coking coal.",
    watch: ["Domestic realisations", "Capacity utilisation", "Coking coal", "Volume growth"],
  },
  HINDALCO: {
    what: "Hindalco is aluminium in India plus Novelis (aluminium rolling) globally. Aditya Birla. Novelis is the quality bit.",
    products: "Aluminium and copper in India; beverage-can sheet at Novelis.",
    makes: "LME aluminium plus US can sheet.",
    cycle: "LME aluminium, US can sheet, and energy costs.",
    watch: ["LME aluminium", "Novelis shipments", "India energy costs", "US can-sheet spreads"],
  },
  ADANIENT: {
    what: "Adani Enterprises is the incubator for the Adani group — energy, airports, green, and new bets. Cash is lumpy; narrative is growth.",
    products: "Projects that later get listed or funded. Airports, green, and incubations.",
    makes: "Project development. Funding costs matter as much as operations.",
    cycle: "Group funding costs, project execution, and risk appetite for Adani names.",
    watch: ["Group credit spreads", "Project announcements", "Promoter pledge", "Incubation pipeline"],
  },
  ADANIPORTS: {
    what: "Adani Ports is the largest private port operator, plus logistics. EXIM trade in one name.",
    products: "Mundra and other ports, plus logistics parks.",
    makes: "Cargo volumes × realisation. Logistics on the side.",
    cycle: "EXIM trade, China/West Asia routes, and group sentiment.",
    watch: ["Cargo volumes", "Realisation per tonne", "New ports", "Group sentiment"],
  },
  BEL: {
    what: "Bharat Electronics is a defence PSU — radars, electronics, missile electronics. A multi-year capex story.",
    products: "Radars, communication, electronic warfare, missile electronics.",
    makes: "Order book from MoD and exports. High visibility once orders land.",
    cycle: "Defence budgets and order announcements.",
    watch: ["Order inflows", "Execution / revenue conversion", "Export orders", "Margin"],
  },
  CIPLA: {
    what: "Cipla is generics and respiratory (inhalers) — India, South Africa, US. Respiratory is the moat.",
    products: "Branded generics in emerging markets plus US respiratory.",
    makes: "US price erosion vs India chronic. Respiratory franchise is the ballast.",
    cycle: "US FDA and India chronic.",
    watch: ["US respiratory", "India branded growth", "US FDA", "South Africa"],
  },
  DRREDDY: {
    what: "Dr Reddy’s is generics with a US/India/Russia mix and a biologics push. Complex generics are the upside.",
    products: "US generics, India branded, API, biologics.",
    makes: "US generics plus India chronic.",
    cycle: "USFDA, gRevlimid-type cliffs, and India chronic.",
    watch: ["US launches", "India branded", "USFDA", "Biologics pipeline"],
  },
  APOLLOHOSP: {
    what: "Apollo Hospitals is a hospital chain plus diagnostics and a digital (24/7) layer. A compounder if execution holds.",
    products: "Hospitals, pharmacy, diagnostics, Apollo 24/7.",
    makes: "ARPOB × occupied beds. Pharmacy and diagnostics on the side.",
    cycle: "Elective surgeries, insurance mix, and new-hospital gestation.",
    watch: ["ARPOB and occupancy", "New-bed gestation", "Insurance mix", "Diagnostics"],
  },
  GRASIM: {
    what: "Grasim is Aditya Birla holding/operating mix — viscose, chemicals, plus UltraTech and financials stakes.",
    products: "VSF and chemicals at the opco; listed subsidiaries do the rest.",
    makes: "VSF and chemicals; a lot of value is in listed subsidiaries.",
    cycle: "VSF spreads and holding-company discount. Cement via UltraTech.",
    watch: ["VSF spreads", "Holdco discount", "UltraTech", "Chemicals"],
  },
  HDFCLIFE: {
    what: "HDFC Life is a private life insurer, bank-assurance with HDFC Bank as the engine. Rate-sensitive.",
    products: "Protection, savings, ULIPs.",
    makes: "VNB from new business. Float invested in bonds/equity.",
    cycle: "Bancassurance volumes, bond yields, persistency.",
    watch: ["VNB margin", "APE growth", "Persistency", "Bancassurance with HDFC Bank"],
  },
  SBILIFE: {
    what: "SBI Life is a life insurer with SBI’s branch machine as the distribution. A quality insurer.",
    products: "Protection, savings, ULIPs, sold through SBI branches and agency.",
    makes: "Same life-insurance economics — VNB, persistency, investment surplus.",
    cycle: "SBI branch productivity and mix (protection vs ULIP).",
    watch: ["VNB", "Protection mix", "SBI branch productivity", "Persistency"],
  },
  HEROMOTOCO: {
    what: "Hero MotoCorp is two-wheelers, still rural- and commuter-heavy. EV is the open question.",
    products: "100–125cc commuter motorcycles, a premium push, and EV experiments.",
    makes: "Heartland motorcycles. Mix is the upgrade path.",
    cycle: "Rural cash, monsoon, and Honda/TVS/Bajaj. EV is unresolved.",
    watch: ["Rural volumes", "Premium mix", "EV (Vida)", "Market share vs Honda"],
  },
  EICHERMOT: {
    what: "Eicher Motors is Royal Enfield motorcycles plus VECV (trucks with Volvo). A quality auto name.",
    products: "Royal Enfield (Classic, Hunter, Himalayan) and Volvo-Eicher commercial vehicles.",
    makes: "High-margin Enfield in India and exports. CV is cyclical.",
    cycle: "Premium two-wheeler fashion and exports.",
    watch: ["Enfield volumes and mix", "Exports", "VECV cycle", "New platforms"],
  },
  INDUSINDBK: {
    what: "IndusInd Bank is a private bank with a vehicle-finance heritage and a bumpier book. Higher beta than HDFC/ICICI.",
    products: "Retail, corporate, microfinance, vehicle finance.",
    makes: "NIM on a mixed book. Microfinance and CV have been swing factors.",
    cycle: "Asset quality events move this more than the large private banks.",
    watch: ["Asset quality headlines", "Deposit franchise", "Microfinance / CV", "Promoter / governance"],
  },
  JIOFIN: {
    what: "Jio Financial is Reliance’s financial-services listco — still being built out. Today it trades as an option on Reliance plus finance.",
    products: "Nascent lending, insurance distribution, a large cash/investment book from the demerger.",
    makes: "Not yet a real lender at scale. The option is execution.",
    cycle: "Execution on becoming a lender. Reliance group flows.",
    watch: ["Loan book build", "Insurance partnerships", "Cash utilisation", "RBI licences"],
  },
  TRENT: {
    what: "Trent is Tata retail — Westside, Zudio, and a fast fashion/value push. Zudio has been the rocket. High valuation, high expectations.",
    products: "Westside, Zudio, and other Tata retail formats.",
    makes: "Same-store growth and new stores. Zudio is the growth engine.",
    cycle: "Discretionary consumption and store expansion.",
    watch: ["Zudio store adds", "Westside like-for-like", "Valuation vs growth", "Inventory"],
  },
  TATACONSUM: {
    what: "Tata Consumer is tea, coffee, salt and packaged foods. Tata’s FMCG listco. Defensive-ish.",
    products: "Tata Tea, Tetley, Tata Salt, Sampann, and acquired foods.",
    makes: "Branded staples plus some foods. Tetley/tea is global.",
    cycle: "Tea auctions, urban FMCG, and integration of acquisitions.",
    watch: ["India volume", "Tea auction prices", "International Tetley", "Foods mix"],
  },
  ETERNAL: {
    what: "Eternal (ex Zomato) is food delivery, Blinkit quick-commerce, and going-out. Unit economics versus growth is the 2025–26 debate.",
    products: "Food delivery, Blinkit, dining-out, Hyperpure.",
    makes: "Delivery take-rate plus Blinkit’s dark-store economics. Ads on the side.",
    cycle: "Quick-commerce spend and food-delivery frequency.",
    watch: ["Blinkit GOV and contribution", "Food delivery order frequency", "Ads", "Burn vs growth"],
  },
  SHRIRAMFIN: {
    what: "Shriram Finance is CV, MSME and retail credit after the Shriram merger. A mid-cycle NBFC.",
    products: "Used-CV, small-business and other retail credit.",
    makes: "Spread on a used-CV and MSME book. Collection is the craft.",
    cycle: "CV cycle, funding costs, and credit costs.",
    watch: ["AUM growth", "Credit cost", "CV cycle", "Funding cost"],
  },
  BAJAJAUTO: {
    what: "Bajaj Auto is motorcycles and three-wheelers, heavy on exports. Triumph sits on the premium side.",
    products: "Pulsar/CT, three-wheelers, Triumph partnership, export markets.",
    makes: "Domestic mix plus Africa/LatAm exports. EV three-wheelers matter.",
    cycle: "Export markets and domestic mix.",
    watch: ["Export volumes", "Domestic mix", "Three-wheeler EV", "Margins"],
  },
  "BAJAJ-AUTO": {
    what: "Bajaj Auto is motorcycles and three-wheelers, heavy on exports. Triumph sits on the premium side.",
    products: "Pulsar/CT, three-wheelers, Triumph partnership, export markets.",
    makes: "Domestic mix plus Africa/LatAm exports.",
    cycle: "Export markets and domestic mix.",
    watch: ["Export volumes", "Domestic mix", "Three-wheeler EV", "Margins"],
  },
  DMART: {
    what: "Avenue Supermarts (DMart) is value retail — EDLP grocery and general merchandise. Thin margin, high turns. A quality retailer that de-rates if growth slips.",
    products: "Owned grocery and general-merchandise stores, cluster density.",
    makes: "Thin margin, high turns. Cluster fill is the craft.",
    cycle: "Same-store growth and new-store gestation.",
    watch: ["Like-for-like growth", "New-store adds", "Gross margin", "Inventory turns"],
  },
  PIDILITIND: {
    what: "Pidilite is Fevicol and construction chemicals. A brand moat in adhesives. A classic compounder.",
    products: "Fevicol, M-Seal, Dr. Fixit, and construction chemicals.",
    makes: "Adhesives and sealants into retail and projects.",
    cycle: "Housing/renovation and rural.",
    watch: ["Volume growth", "Gross margin", "Waterproofing", "Rural"],
  },
  GODREJCP: {
    what: "Godrej Consumer is soaps, hair colour, household insecticides (Goodknight), and overseas (Indonesia, Africa).",
    products: "Cinthol, Goodknight, HIT, hair colour, plus Indonesia/Africa.",
    makes: "India homecare plus international.",
    cycle: "Rural FMCG and currency in overseas. Insecticide seasonality.",
    watch: ["India homecare", "Indonesia", "Currency", "Insecticide season"],
  },
  BRITANNIA: {
    what: "Britannia is biscuits and dairy. A bread-and-biscuit compounder. Defensive.",
    products: "Good Day, Bourbon, Marie, bread, dairy.",
    makes: "Volume plus mix. Dairy is the stretch.",
    cycle: "Wheat/palm costs and urban snacking.",
    watch: ["Volume", "Gross margin (wheat/palm)", "Mix", "Dairy"],
  },
  DABUR: {
    what: "Dabur is Ayurvedic/FMCG — digestives, hair oil, juices, oral care. Rural-tilted. A slower compounder than HUL.",
    products: "Hajmola, Vatika, Real, Dabur Honey, oral care, plus international (MENA, Nepal).",
    makes: "Rural-tilted branded Ayurveda plus overseas.",
    cycle: "Rural recovery and honey/HPC inputs.",
    watch: ["Rural volume", "Healthcare vs HPC mix", "International", "Input costs"],
  },
  DIVISLAB: {
    what: "Divi’s Laboratories is large-scale API and custom synthesis for global pharma. Operating leverage is high. A quality chemical-pharma.",
    products: "Generic APIs plus custom manufacturing (CS).",
    makes: "API tonnes and CS contracts. Utilisation is the swing.",
    cycle: "US/EU generic API, GLP-1 adjacent talk, and utilisation.",
    watch: ["Utilisation", "CS pipeline", "Generic API prices", "US/EU demand"],
  },
  LUPIN: {
    what: "Lupin is generics with a US/India mix and an inhalation/complex-generics push. Turnaround has been the recent plot.",
    products: "US generics, India branded, APIs, inhalation.",
    makes: "US launches plus India chronic.",
    cycle: "USFDA and complex launches.",
    watch: ["US complex launches", "India branded", "USFDA", "Margins"],
  },
  AUROPHARMA: {
    what: "Aurobindo is high-volume generics and injectables, US-heavy. A workhorse generic.",
    products: "US generics, Europe, India, injectables, API.",
    makes: "US generics plus vertical integration into API.",
    cycle: "US price erosion and plant inspections.",
    watch: ["US price erosion", "Injectables", "Plant inspections", "Europe"],
  },
  TVSMOTOR: {
    what: "TVS Motor is two-wheelers, scooters and Norton. A strong execution story this cycle. EV (iQube) is live.",
    products: "Jupiter/Ntorq scooters, motorcycles, iQube EV, Norton.",
    makes: "Scooters plus a rising premium mix.",
    cycle: "Domestic two-wheeler and exports.",
    watch: ["Scooter share", "iQube", "Premium mix", "Exports"],
  },
  IRFC: {
    what: "IRFC finances Indian Railways rolling stock. A thinly-spread NBFC on sovereign-ish paper. Not an operating railroad.",
    products: "Loans to the Railways, funded by bonds.",
    makes: "Spread on Railway loans. Bond-like.",
    cycle: "Bond yields and railway capex.",
    watch: ["Bond yields", "Disbursements", "Spread", "Railway capex"],
  },
  PFC: {
    what: "Power Finance Corporation is a PSU lender to power projects, plus REC as a subsidiary. Yield plus growth.",
    products: "Loans to generation, transmission, and now infra.",
    makes: "Spread on a power-sector loan book.",
    cycle: "Power capex, asset quality, and PSU multiples.",
    watch: ["Sanctions / disbursements", "Asset quality", "NIM", "REC"],
  },
  RECLTD: {
    what: "REC is similar to PFC — power and now infra financing, PSU. Often trades as a pair with PFC.",
    products: "Power and infra loans.",
    makes: "Interest income on power/infra loans.",
    cycle: "Same as PFC.",
    watch: ["Disbursements", "Asset quality", "NIM", "Infra mix"],
  },
  LICI: {
    what: "Life Insurance Corporation is the giant. Agency army plus every PSU distribution. IPO overhang is fading.",
    products: "Life insurance across every Indian household segment.",
    makes: "VNB on a huge in-force book. Investment surplus on a mountain of assets.",
    cycle: "Bancassurance vs agency, equity markets (investment book), and IPO overhang fading.",
    watch: ["VNB", "Market share vs private", "Persistency", "Investment book"],
  },
  MAXHEALTH: {
    what: "Max Healthcare is a hospital chain, Delhi-NCR heavy, expanding. Hospital compounder set.",
    products: "Hospitals, brownfield expansion.",
    makes: "ARPOB × occupancy.",
    cycle: "Elective mix and new-bed gestation.",
    watch: ["ARPOB", "Occupancy", "New beds", "Payor mix"],
  },
  POLYCAB: {
    what: "Polycab is wires and cables, plus FMEG (fans, lights). A B2B + retail mix. Operating leverage on volume.",
    products: "Copper/aluminium cables, fans, lights, switches.",
    makes: "Cables into real estate, infra and industry. FMEG is the mix.",
    cycle: "Housing/infra capex and copper prices.",
    watch: ["Cable volume", "FMEG growth", "Copper", "Margins"],
  },
  DIXON: {
    what: "Dixon Technologies is electronics manufacturing (EMS) — mobiles, TVs, lighting for brands. PLI-led. Low margin, high growth.",
    products: "Mobile assembly, TVs, lighting, wearables — conversion for brands.",
    makes: "Conversion fees on PLI-led manufacturing. Client concentration is the risk.",
    cycle: "PLI, smartphone assembly, and client concentration.",
    watch: ["Mobile volumes", "Client mix", "PLI", "Working capital"],
  },
  PERSISTENT: {
    what: "Persistent Systems is mid-cap IT, product engineering and Salesforce/IBM-ish alliances. Mid-cap IT beta.",
    products: "Software services with a higher product-engineering mix.",
    makes: "IT services, US tech spend.",
    cycle: "US tech spend.",
    watch: ["Revenue growth", "Deal wins", "Utilisation", "Salesforce / IBM alliances"],
  },
  COFORGE: {
    what: "Coforge is mid-cap IT, travel and BFS-heavy, plus a deal engine. Large-deal TCV has been the narrative.",
    products: "IT services, travel and BFS verticals.",
    makes: "IT services. Large-deal TCV.",
    cycle: "Travel vertical and US financials.",
    watch: ["TCV", "Travel vertical", "Margins", "Organic growth"],
  },
  LTIM: {
    what: "LTIMindtree is L&T’s IT company after the Mindtree merger. Integration is largely done; growth vs TCS/Infosys is the debate.",
    products: "IT services with a manufacturing/BFSI mix.",
    makes: "IT services. Parent is L&T.",
    cycle: "Same IT cycle.",
    watch: ["Growth vs TCS/Infosys", "Deal TCV", "Utilisation", "Manufacturing vertical"],
  },
  GOLD: {
    what: "Gold on the Indian market, quoted as MCX ₹ per 10 grams. A hedge and a jewellery input. Not a company.",
    products: "Bullion. Holdings are in grams; the live print is the MCX 10g contract.",
    makes: "A hedge. Jewellery demand is seasonal.",
    cycle: "Real rates, dollar, and rupee. Wedding demand is seasonal.",
    watch: ["Real rates", "Dollar / rupee", "Wedding season", "ETF flows"],
  },
  SILVER: {
    what: "Silver on the Indian market, quoted as MCX ₹ per kilogram. Industrial (solar, electronics) plus jewellery. More volatile than gold.",
    products: "Bullion. Holdings are in grams; the live print is the MCX kg contract.",
    makes: "Industrial demand plus jewellery.",
    cycle: "Industrial demand and the gold ratio. High beta bullion.",
    watch: ["Gold-silver ratio", "Solar / industrial demand", "Dollar", "ETF flows"],
  },
};

export function businessOf(symbol: string): BusinessCard | null {
  const b = String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
  return CARDS[b] || null;
}

export function businessView(
  symbol: string,
  extra?: {
    summary?: string | null;
    wiki?: string | null;
    industry?: string | null;
    ceo?: string | null;
    founded?: string | null;
    website?: string | null;
  },
) {
  const c = businessOf(symbol);
  const summary = (extra?.summary || "").trim();
  const industry = (extra?.industry || "").trim();
  const ceo = (extra?.ceo || "").trim();
  const founded = (extra?.founded || "").trim();
  const website = (extra?.website || "").trim();
  const facts = { industry, ceo, founded, website };
  if (c) {
    return {
      about: c.what,
      products: c.products || "",
      makes: c.makes,
      cycle: c.cycle,
      watch: c.watch || [],
      known: true,
      ...facts,
    };
  }
  const about = summary.length >= 40 ? summary : "";
  return {
    about,
    products: "",
    makes: "",
    cycle: "",
    watch: [] as string[],
    known: false,
    ...facts,
  };
}
