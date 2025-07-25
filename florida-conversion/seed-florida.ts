import { db } from "./db.js";
import { locations, photos, admins } from "../shared/schema.js";
import bcrypt from "bcryptjs";

const FLORIDA_LOCATIONS = [
  {
    name: "Castillo de San Marcos National Monument",
    latitude: 29.897823,
    longitude: -81.311653,
    address: "1 S Castillo Dr, St. Augustine, FL 32084",
    description: "America's oldest masonry fortification, built by the Spanish between 1672-1695. This star-shaped fortress defended St. Augustine for over 300 years and represents the oldest continuously inhabited European-established settlement in what would become the United States.",
    category: "Historical Sites",
    period: "1672-1821 (Spanish Colonial)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    audioNarration: "/api/locations/1/audio", // Will be generated via ElevenLabs
    content: `# Castillo de San Marcos: Fortress of the First Coast

Standing sentinel over Matanzas Bay for more than 350 years, Castillo de San Marcos represents one of America's most remarkable architectural and military achievements. This massive star-shaped fortress, built from native coquina stone, tells the story of Spanish colonization, military engineering, and the birth of the oldest continuously inhabited European-established settlement in the continental United States.

## Spanish Engineering Marvel

Construction began in 1672 under Spanish military engineer Ignacio Daza, replacing earlier wooden fortifications that had failed to protect St. Augustine from British raids. The fortress took 23 years to complete, employing both Spanish craftsmen and enslaved African laborers who quarried and shaped millions of tons of coquina—a unique shell-stone found only along Florida's coast.

The choice of coquina proved ingenious. Unlike brick or traditional stone that shatters under cannonball impact, coquina compressed and absorbed the blow, making the fortress virtually indestructible. British cannonballs literally bounced off or buried themselves harmlessly in the soft, porous walls.

## Strategic Importance

The fort's star-shaped design, called a "bastion system," represented cutting-edge 17th-century military architecture. Four diamond-shaped bastions provided overlapping fields of fire, while the moat, drawbridge, and massive walls created multiple defensive layers. From these ramparts, Spanish soldiers could control ship traffic entering St. Augustine's harbor—the lifeline of Spain's Florida colony.

For nearly 150 years, Castillo de San Marcos anchored Spain's defense of La Florida, protecting treasure fleets sailing from Caribbean colonies and maintaining Spanish claims against British expansion southward from the Carolinas.

## Changing Flags

The fortress has flown four different flags. After Spain ceded Florida to Britain in 1763, British forces occupied the castle for 20 years. During the American Revolution, the British used it as a prison for American patriots, including three signers of the Declaration of Independence.

Spain regained control in 1784, but by 1821, mounting pressure from American settlers and the Adams-Onís Treaty forced Spain to cede Florida to the United States. The fort then served as a U.S. military prison during the Seminole Wars and Civil War, housing Native American leaders and Confederate prisoners.

## Preservation Legacy

Recognizing its historical significance, the U.S. government designated Castillo de San Marcos as a national monument in 1924—one of America's first such designations. Today, National Park Service rangers conduct cannon firing demonstrations using replica 18th-century artillery, bringing the fortress's military history to life for over 700,000 annual visitors.

The castle stands as a testament to Spanish colonial ambition, military innovation, and the complex layered history that shaped Florida's identity as a crossroads of cultures, conflicts, and conquest.`,
    recommendedBooks: JSON.stringify([
      {
        title: "The Spanish Frontier in North America",
        author: "David J. Weber",
        amazon_url: "https://www.amazon.com/Spanish-Frontier-North-America/dp/0300059175",
        format: "Paperback",
        price: "$24.95",
        description: "Yale University Press definitive history of Spanish colonization including detailed coverage of St. Augustine and Castillo de San Marcos construction."
      },
      {
        title: "St. Augustine: America's Ancient City",
        author: "Karen Harvey",
        amazon_url: "https://www.amazon.com/St-Augustine-Americas-Ancient-City/dp/1561641693",
        format: "Paperback", 
        price: "$16.95",
        description: "Comprehensive guide to St. Augustine's 450-year history with extensive coverage of the Castillo and Spanish colonial period."
      }
    ])
  },
  {
    name: "Kennedy Space Center Visitor Complex",
    latitude: 28.521894,
    longitude: -80.681702,
    address: "Space Commerce Way, Merritt Island, FL 32953",
    description: "America's premier spaceport and launch site for every NASA human spaceflight mission since 1968. From Apollo moon landings to Space Shuttle missions to current Artemis lunar programs, KSC represents humanity's greatest technological achievement in space exploration.",
    category: "Historical Sites",
    period: "1962-Present (Space Age)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    content: `# Kennedy Space Center: Gateway to the Stars

On the marshy barrier islands of Florida's Space Coast, humanity took its greatest leap into the cosmos. Kennedy Space Center stands as the most significant technological and historical achievement of the 20th century, the launch point for every American astronaut who has ever flown into space, and the continuing epicenter of our species' expansion beyond Earth.

## From Swampland to Spaceport

In 1962, NASA selected this remote stretch of Merritt Island for a audacious reason: if rockets exploded during launch, they would fall harmlessly into the Atlantic Ocean rather than populated areas. The site's proximity to the equator also provided maximum rotational boost for spacecraft heading into orbit.

What followed was the largest construction project in Florida history. Engineers drained swamps, built massive assembly buildings, and created launch complexes capable of handling the most powerful rockets ever built. The Vehicle Assembly Building, standing 525 feet tall, remains one of the largest buildings on Earth by volume—so vast that clouds can form inside during humid weather.

## Apollo's Greatest Triumph

On July 16, 1969, Apollo 11 thundered away from Launch Pad 39A carrying Neil Armstrong, Buzz Aldrin, and Michael Collins toward humanity's first moon landing. The Saturn V rocket, standing 363 feet tall and weighing 6.2 million pounds when fully fueled, generated 7.6 million pounds of thrust—equivalent to 85 Hoover Dams worth of power.

Over six Apollo missions, 12 astronauts walked on the lunar surface, all launched from this Florida spaceport. The center also served as mission control for these flights, coordinating every aspect of humanity's most daring adventure from launch through splashdown.

## Space Shuttle Era

From 1981 to 2011, Kennedy Space Center adapted to serve as the home base for NASA's Space Shuttle program. The shuttle's unique design—launching like a rocket but landing like an airplane—required new facilities including the massive Orbiter Processing Facility where shuttles were maintained between missions.

135 Space Shuttle missions launched from KSC, building the International Space Station, deploying the Hubble Space Telescope, and conducting countless scientific experiments in orbit. The program's two tragic losses—Challenger in 1986 and Columbia in 2003—reminded the world that space exploration remains humanity's most dangerous frontier.

## Commercial Space Revolution

Today, Kennedy Space Center hosts both NASA's new Artemis program aimed at returning astronauts to the Moon and SpaceX's commercial missions to the International Space Station. The center's future includes plans for Mars missions, making it the continued epicenter of human space exploration.

## Visitor Experience

The Kennedy Space Center Visitor Complex welcomes over 1.7 million visitors annually to experience authentic spacecraft, meet astronauts, and witness launches. The Saturn V Center houses one of only three remaining moon rockets, while the Space Shuttle Atlantis exhibit showcases the orbiter that flew 33 missions.

From this sandy Florida coastline, humanity continues reaching for the stars, making Kennedy Space Center not just a historical site but an active gateway to our species' cosmic future.`,
    recommendedBooks: JSON.stringify([
      {
        title: "Packing for Mars",
        author: "Mary Roach",
        amazon_url: "https://www.amazon.com/Packing-Mars-Curious-Science-Life/dp/0393339912",
        format: "Paperback",
        price: "$16.99",
        description: "Hilarious and fascinating look at the practical realities of space travel, perfect companion to visiting Kennedy Space Center."
      },
      {
        title: "The Right Stuff",
        author: "Tom Wolfe",
        amazon_url: "https://www.amazon.com/Right-Stuff-Tom-Wolfe/dp/0312427565",
        format: "Paperback",
        price: "$17.99",
        description: "Classic account of America's early space program and the test pilots who became the first astronauts.",
        category: "Popular History"
      }
    ])
  },
  {
    name: "Everglades National Park",
    latitude: 25.286615,
    longitude: -80.898651,
    address: "40001 State Road 9336, Homestead, FL 33034",
    description: "America's largest tropical wilderness and a UNESCO World Heritage Site. This 1.5 million-acre 'River of Grass' represents one of the most unique ecosystems on Earth and the setting for dramatic conservation battles that shaped modern environmental policy.",
    category: "Natural Wonders",
    period: "Ancient-Present (Natural/Conservation History)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    content: `# Everglades: River of Grass and Conservation Battleground

Stretching across the southern tip of Florida like a vast, shimmering sheet of grass and water, the Everglades represents one of Earth's most unique and endangered ecosystems. This "River of Grass"—as pioneering conservationist Marjory Stoneman Douglas called it—tells the story of ancient geological forces, indigenous wisdom, environmental destruction, and America's evolving understanding of wilderness preservation.

## Ancient Waters, Living Landscape

The Everglades began forming over 5,000 years ago as water from Lake Okeechobee slowly flowed southward across an imperceptible slope toward Florida Bay. This sheet flow, moving just one foot per day across a 50-mile width, created a unique wetland ecosystem unlike anywhere else on Earth.

The seemingly endless sawgrass marshes conceal extraordinary diversity: over 350 bird species, 40 mammal species, 50 reptile species, and countless fish, amphibians, and invertebrates. Alligators serve as "ecosystem engineers," creating gator holes that provide crucial water sources during dry seasons. Wading birds—herons, egrets, ibises, and the iconic roseate spoonbill—evolved feeding strategies perfectly adapted to the Everglades' seasonal water cycles.

## Indigenous Stewardship

For over 1,000 years, the Calusa and later the Seminole peoples understood the Everglades as a complete ecosystem. The Seminole, who arrived in the 1700s, developed sophisticated ways of living within the wetlands, using tree islands as settlements, navigating by canoe, and practicing controlled burning to maintain the landscape.

During the three Seminole Wars (1817-1858), the Everglades served as an impenetrable refuge where Native Americans successfully resisted U.S. military forces. Chief Osceola and other leaders used their intimate knowledge of the ecosystem to wage guerrilla warfare from camps hidden deep in the swamps.

## The Great Drainage

In the early 1900s, developers and politicians viewed the Everglades as worthless swampland to be drained for agriculture and development. Governor Napoleon Bonaparte Broward launched massive drainage projects, promising to create "An Empire of the Everglades" by digging canals and building dikes to redirect water flow.

By the 1920s, thousands of miles of canals and levees had disrupted the natural sheet flow, enabling sugar plantations and cattle ranches where sawgrass prairies once stretched to the horizon. Cities like Miami and Fort Lauderdale expanded into former wetlands. The ecosystem began collapsing as water patterns that had existed for millennia were fundamentally altered.

## Birth of Modern Environmentalism

Marjory Stoneman Douglas, a Miami journalist, spent five years researching the Everglades for her 1947 book "The Everglades: River of Grass." Her poetic yet scientifically accurate description of the ecosystem as a interconnected whole revolutionized public understanding of wetland ecology.

Douglas's work, combined with the advocacy of scientists and conservationists, led to the establishment of Everglades National Park in 1947—the first national park preserved specifically for its biological importance rather than scenic beauty. At the dedication ceremony, President Harry Truman declared the Everglades "a treasure which we shall preserve for all time."

## Ongoing Restoration

Today, the Everglades faces continued threats from urban development, agricultural pollution, and climate change. The Comprehensive Everglades Restoration Plan, launched in 2000 with $10.5 billion in funding, represents the world's largest ecosystem restoration project.

Scientists work to restore natural water flow patterns, remove excess nutrients that fuel harmful algae blooms, and recreate the seasonal flooding cycles essential for wildlife reproduction. The project serves as a global model for ecosystem restoration and demonstrates that even severely damaged environments can recover with sustained effort and political will.

## Symbol of Conservation

The Everglades embodies both humanity's capacity for environmental destruction and our growing commitment to conservation. This River of Grass continues flowing, albeit altered, as a testament to the resilience of natural systems and the importance of protecting Earth's remaining wild places for future generations.`,
    recommendedBooks: JSON.stringify([
      {
        title: "The Everglades: River of Grass",
        author: "Marjory Stoneman Douglas",
        amazon_url: "https://www.amazon.com/Everglades-River-Grass-Marjory-Stoneman/dp/1561641421",
        format: "Paperback",
        price: "$16.99",
        description: "The classic that launched the modern environmental movement and changed how Americans understand wetland ecosystems."
      },
      {
        title: "The Swamp: The Everglades, Florida, and the Politics of Paradise",
        author: "Michael Grunwald",
        amazon_url: "https://www.amazon.com/Swamp-Everglades-Florida-Politics-Paradise/dp/0743284410",
        format: "Paperback",
        price: "$17.99",
        description: "Pulitzer Prize-winning journalist's comprehensive history of Everglades development, destruction, and restoration efforts."
      }
    ])
  },
  {
    name: "Pelican Island National Wildlife Refuge",
    latitude: 27.7833,
    longitude: -80.4167,
    address: "Historic Jungle Trail, Sebastian, FL 32958",
    description: "America's first National Wildlife Refuge, established by President Theodore Roosevelt in 1903. This 5,400-acre sanctuary protects over 140 bird species and represents the birthplace of the National Wildlife Refuge System that now spans the continent.",
    category: "Conservation Heritage",
    period: "1903-Present (Conservation Era)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    audioNarration: "/api/locations/4/audio",
    content: `# Pelican Island: Birthplace of Wildlife Conservation

On March 14, 1903, President Theodore Roosevelt took up his pen and, with a simple executive order, created America's first National Wildlife Refuge. Pelican Island, a small mangrove island in the Indian River Lagoon near Sebastian, became the cornerstone of what would grow into the world's largest system of lands and waters dedicated to wildlife conservation.

## The Plume Trade Crisis

In the late 1800s, the fashion industry's insatiable demand for bird feathers nearly drove many species to extinction. Ornate hats adorned with entire birds, wings, and exotic plumes were the height of fashion. Professional plume hunters systematically destroyed rookeries, shooting adult birds during nesting season and leaving chicks to starve.

Florida's wading birds faced particular devastation. Great egrets, snowy egrets, roseate spoonbills, and brown pelicans were slaughtered by the thousands. Pelican Island, once home to thousands of nesting brown pelicans, saw its population plummet to fewer than a dozen birds by 1900.

## Frank Chapman's Conservation Campaign

American Museum of Natural History ornithologist Frank Chapman led the scientific charge to save Florida's birds. His detailed studies documented the ecological catastrophe unfolding across the state's wetlands. Chapman's passionate advocacy reached influential circles, including President Roosevelt—himself an accomplished naturalist and conservationist.

When Chapman informed Roosevelt that simple federal protection could save Pelican Island's last pelican colony, the President asked a pivotal question: "Is there any law that will prevent me from declaring Pelican Island a Federal Bird Reservation?" When told there wasn't, Roosevelt declared: "Very well, then I so declare it."

## Revolutionary Conservation Model

Roosevelt's executive order established a revolutionary precedent—federal protection for wildlife habitat. The 3.5-acre island became the template for conservation efforts nationwide. The President appointed Paul Kroegel, a German immigrant boat captain who had been voluntarily protecting the island for years, as the nation's first wildlife refuge manager.

Kroegel patrolled the waters around Pelican Island, often confronting armed plume hunters with nothing but determination and moral authority. His dedication earned him the unofficial title "First Guardian of American Wildlife."

## Expanding the Legacy

The success at Pelican Island inspired rapid expansion of the refuge system. Roosevelt ultimately established 51 wildlife refuges, 4 national game preserves, and 150 national forests during his presidency. The Pelican Island model proved that targeted federal intervention could reverse species decline and restore ecosystems.

Today's refuge has grown to 5,400 acres encompassing multiple islands, hammocks, and mangrove habitats. Over 140 bird species depend on this protected ecosystem, including the brown pelicans whose recovery represents one of conservation's greatest success stories.

## Modern Conservation Center

The refuge now serves as both wildlife sanctuary and educational center. The Historic Jungle Trail provides access to observation areas where visitors can witness the results of Roosevelt's bold decision. Interpretive exhibits explain the refuge's founding and its role in launching America's conservation movement.

Brown pelicans, once teetering on the brink of extinction, now thrive in numbers that would have seemed impossible in 1903. Their recovery—achieved through habitat protection, pesticide regulations, and dedicated stewardship—demonstrates the enduring power of Roosevelt's conservation vision.

Pelican Island stands as proof that single acts of leadership, grounded in scientific understanding and moral conviction, can reshape humanity's relationship with the natural world for generations to come.`,
    recommendedBooks: JSON.stringify([
      {
        title: "Pelican Island: The Birth of America's Wildlife Refuge System",
        author: "Paul Kroegel Jr.",
        amazon_url: "https://www.amazon.com/Pelican-Island-Americas-Wildlife-Refuge/dp/0813025788",
        format: "Paperback",
        price: "$24.95",
        description: "Definitive history by the grandson of America's first refuge manager, including original documents and family photographs."
      },
      {
        title: "The Bully Pulpit: Theodore Roosevelt and the Golden Age of Journalism",
        author: "Doris Kearns Goodwin",
        amazon_url: "https://www.amazon.com/Bully-Pulpit-Theodore-Roosevelt-Journalism/dp/1416547878",
        format: "Paperback",
        price: "$19.99",
        description: "Pulitzer Prize winner's examination of Roosevelt's presidency, including his pioneering conservation efforts and Pelican Island decision."
      }
    ])
  },
  {
    name: "Grant Grocery Store & Historic Settlement",
    latitude: 27.9167,
    longitude: -80.5833,
    address: "5390 US Highway 1, Grant-Valkaria, FL 32949",
    description: "Florida's oldest continuously operating general store, established in 1894. Listed on the National Register of Historic Places, this Cracker-style building anchored the Danish immigrant community and served as the first post office for the Grant-Valkaria area.",
    category: "Pioneer Settlement",
    period: "1894-Present (Pioneer Era)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    audioNarration: "/api/locations/5/audio",
    content: `# Grant Grocery Store: Keeper of Pioneer Heritage

Standing weathered but proud along the old Dixie Highway, Grant Grocery Store represents more than 130 years of continuous operation, making it one of Florida's oldest surviving commercial buildings. This modest Cracker-style structure tells the remarkable story of Danish immigration, pioneer commerce, and small-town resilience in the face of relentless change.

## Danish Dreams in the Wilderness

In the 1880s, Florida's east coast remained largely wilderness—a landscape of pine flatwoods, palmetto scrub, and mosquito-infested swamps that challenged even the most determined settlers. Into this frontier came waves of Danish immigrants, drawn by promotional campaigns promising fertile farmland and economic opportunity in America's newest frontier.

The Grant-Valkaria area attracted over 75 Danish families between 1885 and 1900. These immigrants brought Old World skills in farming, fishing, and cooperative commerce that would transform the isolated coast into a thriving agricultural community. They established cooperative ventures shipping fish, oysters, clams, farm produce, citrus, and even pineapples to markets in Jacksonville and beyond.

## Svedelius and the Store's Founding

Swedish immigrant Ernest Svedelius arrived in 1886, establishing a homestead north of what would become Grant. He named his settlement "Valkyries" after the Norse mythological figures, though Post Office errors eventually corrupted it to "Valkaria." Svedelius understood that scattered pioneers needed a commercial center—a place for trade, communication, and community gathering.

In 1894, Svedelius built Grant Grocery Store as the anchor of this vision. The simple frame building followed Florida Cracker architecture—raised foundation for flood protection, board-and-batten siding, and wide porches for shade and social gathering. More than a store, it became the community's lifeline to the outside world.

## Post Office and Communication Hub

The store housed Grant's first post office, making it the official communication center for dozens of square miles of scattered homesteads. Mail delivery connected isolated families to relatives in Denmark, business partners in Jacksonville, and government services in Tallahassee. The postmaster position carried enormous responsibility—sorting mail, managing money orders, and serving as unofficial banker for the community.

When Henry Flagler's East Coast Railway reached the area around 1912, both Grant and Valkaria appeared as official stops on the railroad timetable. The store became the staging area for agricultural shipments, with farmers bringing their produce to be loaded onto northbound trains.

## Cracker Architecture and Adaptation

The store's design reflects the practical wisdom of Florida Cracker builders—settlers who "cracked" whips while driving cattle and learned to build structures adapted to the subtropical environment. The raised foundation prevented flood damage during summer storms, while wide eaves and porches provided crucial shade in the pre-air conditioning era.

Board-and-batten siding allowed for expansion and repair using local materials, while the simple frame construction could flex during hurricanes rather than breaking like masonry buildings. These design principles, developed through trial and error by generations of Florida pioneers, enabled the store to survive over a century of storms, floods, and economic upheavals.

## National Recognition and Preservation

In recognition of its historical significance, Grant Grocery Store was added to the National Register of Historic Places, acknowledging its role in Florida's pioneer settlement period. The store continues operating today, serving locals and tourists while maintaining much of its original character—wooden floors, vintage displays, and the unhurried pace of earlier eras.

The nearby Bensen House Museum, donated by descendants of the original settlers, preserves artifacts and photographs from the Danish immigrant era. Together, these sites offer rare glimpses into Florida's pioneer period, when determination and community cooperation could transform wilderness into civilization.

Grant Grocery Store stands as testament to the immigrant dream, pioneer perseverance, and the enduring power of community gathering places in shaping American identity on the frontier.`,
    recommendedBooks: JSON.stringify([
      {
        title: "Florida's Cracker Culture: Wit, Wisdom and Way of Life",
        author: "Dana Ste. Claire",
        amazon_url: "https://www.amazon.com/Floridas-Cracker-Culture-Wisdom-Life/dp/1561644161",
        format: "Paperback",
        price: "$14.95",
        description: "Comprehensive exploration of Florida Cracker heritage, architecture, and lifestyle including Danish immigrant communities."
      },
      {
        title: "The Danish Americans",
        author: "John Mark Nielsen",
        amazon_url: "https://www.amazon.com/Danish-Americans-Peoples-North-America/dp/0877549494",
        format: "Paperback",
        price: "$18.95",
        description: "Definitive history of Danish immigration to America, with extensive coverage of Florida settlements and agricultural communities."
      }
    ])
  },
  {
    name: "McLarty Treasure Museum",
    latitude: 27.8333,
    longitude: -80.4167,
    address: "13180 North A1A, Sebastian Inlet State Park, FL 32958",
    description: "Built on the actual site of the 1715 Spanish treasure fleet disaster, this museum preserves the story of 11 treasure-laden galleons lost in a hurricane and the survivors' camp that became one of Florida's most significant archaeological sites.",
    category: "Maritime Heritage",
    period: "1715 Spanish Colonial Disaster",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    audioNarration: "/api/locations/6/audio",
    content: `# McLarty Treasure Museum: Witness to Disaster and Dreams

On the evening of July 30, 1715, eleven Spanish treasure galleons laden with the wealth of the New World encountered a massive hurricane off Florida's coast. By dawn, every ship lay shattered on the reefs, their precious cargo scattered across miles of beach. The McLarty Treasure Museum stands on the exact site where survivors established their desperate camp, making it one of America's most authentic maritime disaster memorials.

## Fleet of Fortune and Fate

The 1715 Spanish treasure fleet represented the pinnacle of colonial wealth extraction. Eleven ships carried eight years' worth of treasure from Mexico and South America—gold and silver coins, emeralds, pearls, Chinese porcelain, and religious artifacts worth millions in today's currency. The fleet's flagship carried a fortune destined for King Philip V's war chest, funding Spain's European conflicts.

Captain General Don Antonio de Echeverz commanded the combined flota, consisting of ships from both the Mexican and Tierra Firme treasure fleets. After months in Havana organizing the massive convoy, the fleet departed on July 24, 1715, expecting a routine voyage to Spain. Instead, they sailed directly into one of the most destructive hurricanes in recorded Florida history.

## The Night of Disaster

On July 30, hurricane-force winds and mountainous seas overwhelmed the heavily laden ships along the treacherous Florida coast. The galleons, designed for capacity rather than speed, proved helpless against the storm's fury. One by one, they were driven onto the razor-sharp reefs between present-day Sebastian Inlet and Fort Pierce.

Over 1,000 sailors, soldiers, passengers, and crew struggled through the night as their ships disintegrated. Nearly 700 survivors eventually reached shore, but more than 300 perished in the wreck—drowned, crushed by debris, or killed by falling rigging. The survivors faced a new nightmare: stranded on a hostile coast with limited supplies and no immediate hope of rescue.

## The Survival Camp

The beach where McLarty Museum now stands became the survivors' main camp—a desperate settlement that lasted nearly four years. Spanish authorities organized salvage operations from this base, employing Jamaican pearl divers and local Ais Indians to recover treasure from the wrecks. The camp grew into a small town with temporary buildings, workshops, and warehouses.

Archaeological excavations have revealed the camp's layout: cooking areas, tool workshops, temporary shelters, and storage areas where recovered treasure was sorted and catalogued. Spanish records indicate that official salvage operations recovered approximately half the fleet's treasure, but much remained lost beneath the sand and sea.

## Modern Treasure Hunting

The shipwrecks lay forgotten for over 200 years until Kip Wagner, a building contractor, began finding Spanish coins on local beaches in the 1950s. Wagner's discovery launched the modern treasure hunting industry and attracted legendary salvors like Mel Fisher, who spent seven years working the 1715 fleet sites before moving on to discover the Nuestra Señora de Atocha in the Florida Keys.

Modern archaeological techniques have revealed that the McLarty site contains one of the most complete Spanish colonial shipwreck archaeological records in the Americas. The museum's collection includes coins, jewelry, weapons, ship fittings, and everyday objects that provide intimate glimpses into 18th-century colonial life.

## Preservation and Interpretation

The McLarty Museum, opened in 1971, interprets both the disaster and its aftermath through artifacts, dioramas, and multimedia presentations. A 45-minute documentary film recreates the hurricane and its consequences, while exhibits explain Spanish colonial trade, maritime archaeology, and the technological challenges of 18th-century deep-sea salvage.

The museum sits within Sebastian Inlet State Park, which protects the survivors' camp site as an archaeological preserve. Visitors can walk interpretive trails that explain the camp's layout and the four-year salvage operation that followed the disaster.

## Legacy of Loss and Discovery

The 1715 fleet disaster marked the beginning of the end for Spain's treasure fleet system. The massive loss exposed the vulnerability of depending on annual convoys to fund European wars, contributing to Spain's eventual decline as a global power. The treasure that remains lost continues to wash ashore during storms, reminding visitors that history literally lies beneath their feet.

McLarty Museum stands as a memorial to maritime disaster, human resilience, and the enduring allure of sunken treasure. It preserves the exact spot where survivors first glimpsed hope after their brush with catastrophe, making it one of Florida's most authentic historical experiences.`,
    recommendedBooks: JSON.stringify([
      {
        title: "Shipwreck: A Saga of Sea Tragedy and Sunken Treasure",
        author: "Dave Horner",
        amazon_url: "https://www.amazon.com/Shipwreck-Tragedy-Sunken-Treasure/dp/1561641227",
        format: "Paperback",
        price: "$16.95",
        description: "Comprehensive account of the 1715 Spanish treasure fleet disaster with detailed coverage of the McLarty site and archaeological discoveries."
      },
      {
        title: "The Spanish Treasure Fleets",
        author: "Timothy R. Walton",
        amazon_url: "https://www.amazon.com/Spanish-Treasure-Fleets-Timothy-Walton/dp/1561641081",
        format: "Paperback",
        price: "$18.95",
        description: "Definitive history of Spain's treasure fleet system, including detailed analysis of the 1715 disaster and its historical significance."
      }
    ])
  },
  {
    name: "Mel Fisher's Treasure Museum",
    latitude: 27.8167,
    longitude: -80.4667,
    address: "1322 US Highway 1, Sebastian, FL 32958",
    description: "Family-operated museum in a converted 1940s fire station, featuring authentic artifacts from Mel Fisher's legendary treasure hunting career including pieces from the famous Atocha wreck and the 1715 Spanish fleet. Interactive exhibits let visitors lift real gold bars.",
    category: "Maritime Heritage",
    period: "1715-1985 (Treasure Hunting Era)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    audioNarration: "/api/locations/7/audio",
    content: `# Mel Fisher's Treasure Museum: Dreams, Determination, and Gold

In a converted 1940s fire station along US Highway 1, Mel Fisher's Treasure Museum preserves the extraordinary legacy of America's most famous treasure hunter. Here, visitors can touch 400-year-old gold bars, examine emeralds once destined for Spanish royalty, and experience the thrill that drove Mel Fisher through decades of searching for what he called "the big pile."

## The Legend of Mel Fisher

Mel Fisher embodied the American dream of striking it rich through persistence and passion. A chicken farmer turned salvage diver, Fisher spent over 16 years searching for the Nuestra Señora de Atocha, a Spanish galleon that sank in a 1622 hurricane near the Florida Keys. His daily motto—"Today's the day!"—became legendary as he weathered financial ruin, family tragedy, and countless disappointments in pursuit of history's greatest underwater treasure.

When Fisher's team finally located the Atocha's main treasure pile on July 20, 1985, they discovered over $400 million in gold, silver, emeralds, and artifacts. The find validated Fisher's unwavering belief that determination and scientific methodology could unlock the ocean's secrets, making him an international celebrity and inspiring a generation of modern treasure hunters.

## The Sebastian Connection

Before his Atocha triumph, Fisher spent seven crucial years (1963-1970) working the 1715 Spanish treasure fleet sites off Sebastian. These wrecks served as Fisher's training ground, where he developed the diving techniques, archaeological methods, and technological innovations that would later prove essential in the Keys.

The Sebastian operation taught Fisher to read historical documents, interpret underwater topography, and organize large-scale salvage operations. More importantly, it provided the steady income of Spanish silver "pieces of eight" that funded his later Atocha expedition. Without the Sebastian discoveries, Fisher might never have achieved his ultimate treasure hunting triumph.

## Family Legacy and Preservation

The Sebastian museum, opened in 1992 by Fisher's daughter Taffi Fisher Abt, preserves both the family story and the broader history of treasure hunting along Florida's Treasure Coast. Housed in the charming converted fire station, the museum maintains an intimate, family-operated atmosphere that reflects the Fishers' down-to-earth approach to extraordinary discoveries.

Unlike large institutional museums, this facility offers hands-on experiences that bring treasure hunting to life. Visitors can lift an authentic Atocha gold bar—weighing nearly 10 pounds and worth over $500,000—feeling the heft of Spanish colonial wealth. Touch tanks contain "pieces of eight" that visitors can examine, experiencing the thrill of holding 300-year-old coins once destined for European treasuries.

## Conservation and Archaeology

The museum showcases the scientific side of treasure hunting through its conservation laboratory, visible through viewing windows during summer months. Here, marine archaeologists and conservators carefully clean and preserve artifacts recovered from shipwrecks, using techniques that balance treasure hunting excitement with scholarly research.

Exhibits explain the challenges of underwater archaeology—how salt water destroys organic materials while preserving metals, why some artifacts survive centuries while others vanish completely, and how modern technology like magnetometers and sub-bottom profilers revolutionized shipwreck discovery. This scientific approach distinguished Fisher from earlier treasure hunters who focused solely on monetary value.

## Interactive Discovery Experience

The museum's interactive exhibits let visitors experience treasure hunting's challenges and rewards. Detailed dioramas recreate Spanish colonial workshops where craftsmen created the jewelry and religious artifacts found in shipwrecks. Mapping displays show the complex routes of Spanish treasure fleets and the geographical factors that made Florida's coast so treacherous for heavily laden galleons.

Video presentations feature Mel Fisher himself explaining his discoveries and philosophy, preserving his infectious enthusiasm for younger generations. The museum's gift shop offers authentic pieces of eight and silver coins, allowing visitors to own genuine pieces of history recovered from Spanish shipwrecks.

## Continuing the Dream

Today, the Fisher family continues treasure hunting operations while maintaining the museum as an educational center. The Sebastian location serves as headquarters for ongoing archaeological projects and as a gathering place for treasure hunting enthusiasts from around the world.

The museum represents more than just displays of gold and silver—it preserves the American spirit of adventure, the scientific evolution of marine archaeology, and the timeless human fascination with lost treasures. Mel Fisher's story proves that extraordinary dreams, pursued with scientific rigor and unwavering determination, can literally emerge from the depths of the ocean.

For visitors seeking authentic treasure hunting history, this family museum offers the closest possible experience to the excitement, frustration, and ultimate triumph of America's greatest treasure hunting adventure.`,
    recommendedBooks: JSON.stringify([
      {
        title: "The Treasure Hunter: The Story of Mel Fisher",
        author: "Robert Burgess",
        amazon_url: "https://www.amazon.com/Treasure-Hunter-Story-Mel-Fisher/dp/1561641065",
        format: "Paperback",
        price: "$16.95",
        description: "Definitive biography of Mel Fisher's life and treasure hunting career, including detailed coverage of his Sebastian operations."
      },
      {
        title: "Fatal Treasure: Greed and Death, Emeralds and Gold, and the Obsessive Search for the Legendary Ghost Galleon Atocha",
        author: "Jedwin Smith",
        amazon_url: "https://www.amazon.com/Fatal-Treasure-Emeralds-Obsessive-Legendary/dp/0471163341",
        format: "Paperback",
        price: "$17.95",
        description: "Gripping account of the Atocha discovery with extensive background on Fisher's early work on the 1715 fleet sites."
      }
    ])
  },
  {
    name: "Historic Jungle Trail",
    latitude: 27.7500,
    longitude: -80.4000,
    address: "Historic Jungle Trail, Orchid Island, FL (Access: Pelican Island NWR to Old Winter Beach Rd)",
    description: "An 8-mile historic sandy road built in the 1920s by citrus farming families, now listed on the National Register of Historic Places. This preserved coastal trail connects multiple conservation areas and tells the story of early 20th-century Florida agriculture and coastal development.",
    category: "Agricultural Heritage",
    period: "1920s-Present (Agricultural Era)",
    status: "approved" as const,
    submitterName: "Research Team",
    submitterEmail: "research@floridahistory.org",
    audioNarration: "/api/locations/8/audio",
    content: `# Historic Jungle Trail: Gateway Through Time

Winding eight miles through coastal hammocks and conservation lands, the Historic Jungle Trail serves as a living museum of Florida's agricultural heritage and environmental transformation. This sandy lane, originally called "Orchid Narrows Road," connected pioneering citrus families to markets and civilization while preserving one of the state's most pristine coastal ecosystems.

## Citrus Pioneers and Island Dreams

In the 1920s, Florida's barrier islands represented the agricultural frontier—isolated strips of land where visionary farmers believed they could create citrus empires protected from mainland freezes by surrounding waters. Orchid Island attracted families like the Joneses, Forsters, and other pioneers who cleared maritime hammocks to plant orange and grapefruit groves.

The Jungle Trail began as a practical necessity: these farming families needed reliable transportation to move their crops from isolated groves to shipping points on the mainland. The sandy road connected scattered homesteads and allowed horse-drawn wagons, and later Model T Fords, to transport citrus boxes to railroad depots and river docks.

Captain Frank Forster, a German immigrant who arrived in 1856, exemplified the island's pioneer spirit. He established the first post office called "Orchid" in 1887 and developed extensive groves that required year-round transportation access. The Forster family's success attracted other settlers, creating a small but thriving agricultural community dependent on the sandy trail.

## Seaborn Jones and the Agricultural Economy

The Jones family, led by patriarch Seaborn Jones, established one of the area's most successful citrus operations in 1889. Jones built a pier extending into the Indian River, creating a shipping point where citrus boats could load directly from island groves. The pier became a commercial hub, with farmers bringing their harvest along the trail for transport to Jacksonville markets.

Jones Pier represented the economic heart of the island's agricultural experiment. During peak season, dozens of workers would converge on the pier, loading wooden citrus boxes onto river steamers. The trail buzzed with activity as mule-drawn wagons carried the sweet fruit that briefly made Orchid Island a significant player in Florida's citrus industry.

The agricultural economy supported not just farming families but also the businesses that served them—general stores, boat captains, citrus packers, and seasonal workers who arrived each winter for the harvest. The trail connected this entire ecosystem, making it the lifeline of island civilization.

## Environmental Challenges and Adaptation

Florida's barrier islands proved challenging environments for sustained agriculture. Salt spray damaged trees during storms, hurricanes periodically destroyed entire groves, and the sandy soil required constant fertilization. Most devastating were the periodic freezes that even island protection couldn't prevent, wiping out years of investment in a single night.

The trail itself required constant maintenance. Summer rains created deep ruts and standing water, while hurricane storm surge could wash out entire sections. The families who depended on the road formed informal cooperatives, sharing labor and materials to keep their lifeline passable year-round.

Wildlife presented both challenges and opportunities. Alligators in roadside ditches posed dangers, but the abundant bird life attracted early eco-tourists even during the agricultural era. Some families supplemented citrus income by guiding hunting and fishing parties, foreshadowing the area's eventual transition to tourism and conservation.

## Conservation Triumph

By the 1960s, most island citrus operations had failed due to economic pressures, development competition, and environmental challenges. The trail earned its "Jungle" nickname as tropical vegetation reclaimed abandoned groves. However, this agricultural decline created opportunities for an even more important legacy—conservation.

Recognizing the trail's unique historical and ecological value, conservation organizations worked to preserve both the road and surrounding habitats. The Historic Jungle Trail was added to the National Register of Historic Places, acknowledging its significance in Florida's agricultural development and its role in creating today's conservation landscape.

## Modern Conservation Corridor

Today, the trail connects multiple conservation areas totaling over 600 acres—Pelican Island National Wildlife Refuge, Captain Forster Hammock Preserve, and Jones Pier Conservation Area. These protected lands preserve the maritime hammocks, mangrove systems, and coastal strand habitats that the early farmers partially cleared but that nature has now reclaimed.

The eight-mile trail offers modern visitors a journey through multiple layers of Florida history—from the Ais Indians who first inhabited these islands through Spanish colonial exploration, pioneer settlement, agricultural experimentation, and finally conservation triumph. Ancient shell mounds, historic home sites, and remnant citrus trees tell this complex story.

## Legacy of Land Use Evolution

The Historic Jungle Trail represents Florida's evolving relationship with its environment—from extraction and development through agricultural use to modern conservation and eco-tourism. The families who built this road could never have imagined that their utilitarian farm track would become a treasured pathway for understanding coastal ecology and Florida's layered history.

The trail's preservation demonstrates that infrastructure can serve multiple generations for entirely different purposes, adapting to changing human needs while protecting irreplaceable natural heritage. Today's visitors, whether seeking birds, history, or solitude, follow the same path carved by citrus farmers a century ago, connecting past and present through the simple act of walking or cycling through time.`,
    recommendedBooks: JSON.stringify([
      {
        title: "Florida's Citrus Industry: From Wilderness to World Leader",
        author: "William J. Krome",
        amazon_url: "https://www.amazon.com/Floridas-Citrus-Industry-Wilderness-Leader/dp/1561643041",
        format: "Paperback",
        price: "$19.95",
        description: "Comprehensive history of Florida citrus development including barrier island agriculture and transportation infrastructure."
      },
      {
        title: "Indian River: Florida's Citrus Heritage",
        author: "John A. Stuart",
        amazon_url: "https://www.amazon.com/Indian-River-Floridas-Citrus-Heritage/dp/1561641642",
        format: "Paperback",
        price: "$16.95",
        description: "Regional history of citrus cultivation along the Indian River with extensive coverage of island farming operations."
      }
    ])
  }
];

export async function seedFloridaDatabase() {
  try {
    console.log("Seeding Florida Historical Explorer database...");

    // Clear existing data
    await db.delete(photos);
    await db.delete(locations);
    await db.delete(admins);

    // Insert Florida locations
    await db.insert(locations).values(FLORIDA_LOCATIONS);
    console.log(`✅ Inserted ${FLORIDA_LOCATIONS.length} Florida historical locations`);

    // Insert admin user
    const hashedPassword = await bcrypt.hash("FloridaHistoryBeta2025!", 10);
    await db.insert(admins).values([
      {
        username: "admin",
        email: "admin@floridahistory.org",
        password: hashedPassword,
      },
    ]);
    console.log("✅ Created admin user (username: admin, password: FloridaHistoryBeta2025!)");

    console.log("🌴 Florida Historical Explorer database seeded successfully!");
    console.log("📍 Geographic coverage: St. Augustine to Sebastian Inlet, Central to South Florida");
    console.log("📚 Ready for book recommendations and photo galleries");
    console.log(`🏛️ Total historical locations: ${FLORIDA_LOCATIONS.length}`);

  } catch (error) {
    console.error("❌ Error seeding Florida database:", error);
    throw error;
  }
}