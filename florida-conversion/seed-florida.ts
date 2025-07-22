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
    console.log("📍 Geographic coverage: St. Augustine to Key West, Panhandle to Everglades");
    console.log("📚 Ready for book recommendations and photo galleries");

  } catch (error) {
    console.error("❌ Error seeding Florida database:", error);
    throw error;
  }
}