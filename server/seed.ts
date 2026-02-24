import db from './db';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

import { SocialEvent } from '@shared/types';

const events: Partial<SocialEvent>[] = [
  { title: "Morning Coffee & Networking", description: "Start your day with fresh brew and meaningful professional connections.", location: "Central Brew Cafe", date: "2026-03-01" },
  { title: "React Performance Workshop", description: "Deep dive into useMemo, useCallback, and virtualization techniques.", location: "Tech Hub Office", date: "2026-03-02" },
  { title: "Sunset Yoga Session", description: "Relax your mind and body with a guided yoga session as the sun sets.", location: "Skyline Rooftop", date: "2026-03-03" },
  { title: "Jazz & Wine Evening", description: "Enjoy live jazz performances paired with a selection of premium local wines.", location: "The Velvet Lounge", date: "2026-03-04" },
  { title: "Startup Pitch Night", description: "Watch 5 local startups pitch their ideas to a panel of angel investors.", location: "Innovation Center", date: "2026-03-05" },
  { title: "Hiking Adventure", description: "A moderate 10km hike through the scenic trails of the Pine Forest.", location: "North Ridge Trailhead", date: "2026-03-06" },
  { title: "Gourmet Italian Cooking Class", description: "Learn to make authentic handmade pasta from scratch with Chef Marco.", location: "Culinary Studio", date: "2026-03-07" },
  { title: "Digital Art Exhibition", description: "Exploring the intersection of human creativity and artificial intelligence.", location: "Modern Art Gallery", date: "2026-03-08" },
  { title: "Code & Pizza Hackathon", description: "Build something cool in 12 hours. Pizza and energy drinks are on us!", location: "Campus Library", date: "2026-03-09" },
  { title: "Retro Disco Night", description: "Dust off your bell-bottoms and dance to the best hits of the 70s and 80s.", location: "Flashback Club", date: "2026-03-10" },
  { title: "Photography City Walk", description: "Capture the urban landscape during the golden hour with pro tips.", location: "Old Town Square", date: "2026-03-11" },
  { title: "Product Management Meetup", description: "Discussing roadmap prioritization and user-centric design patterns.", location: "Co-work Space", date: "2026-03-12" },
  { title: "Stand-up Comedy Night", description: "A lineup of the city's funniest comedians ready to make you laugh.", location: "The Laugh Factory", date: "2026-03-13" },
  { title: "Chess Tournament", description: "Open blitz tournament for players of all skill levels. Prizes for top 3.", location: "Community Hall", date: "2026-03-14" },
  { title: "Salsa Dancing Workshop", description: "Learn the basic steps and rhythm of Salsa. No partner required!", location: "Dance Academy", date: "2026-03-15" },
  { title: "Web3 & Crypto Talk", description: "Understanding the future of decentralized finance and smart contracts.", location: "Financial District", date: "2026-03-16" },
  { title: "Acoustic Garden Session", description: "Unplugged live music in a beautiful botanical garden setting.", location: "Botanical Gardens", date: "2026-03-17" },
  { title: "Board Games & Beer", description: "Catan, Ticket to Ride, and great craft beer with new friends.", location: "Hops & Boards Pub", date: "2026-03-18" },
  { title: "UX Design Critique", description: "Bring your portfolio and get honest feedback from senior designers.", location: "Creative Studio", date: "2026-03-19" },
  { title: "Charity Run 10K", description: "Run for a cause. All proceeds go to the local children's hospital.", location: "Riverside Park", date: "2026-03-20" },
  { title: "VR Gaming Experience", description: "Test the latest VR headsets and multiplayer immersive games.", location: "Cyber Arena", date: "2026-03-21" },
  { title: "Personal Finance Seminar", description: "Mastering budgeting, investing, and long-term wealth management.", location: "Grand Hotel", date: "2026-03-22" },
  { title: "Indie Movie Screening", description: "Watch a selection of award-winning short films from local directors.", location: "Cinema Paradiso", date: "2026-03-23" },
  { title: "Language Exchange Mixer", description: "Practice your English, Spanish, or French in a relaxed atmosphere.", location: "Globe Trotter Bar", date: "2026-03-24" },
  { title: "Open Mic Night", description: "Poetry, music, or storytelling. The stage is yours for 5 minutes.", location: "Bohemian Cafe", date: "2026-03-25" },
  { title: "Cybersecurity Bootcamp", description: "Essential skills for protecting your data in the digital age.", location: "University Lab", date: "2026-03-26" },
  { title: "Outdoor Movie Night", description: "A classic Hollywood movie under the stars. Bring your own blanket.", location: "Meadow Park", date: "2026-03-27" },
  { title: "Coffee Roasting Class", description: "Discover the journey of the bean from farm to your morning cup.", location: "The Roastery", date: "2026-03-28" },
  { title: "Pottery & Prosecco", description: "Get messy with clay while sipping on some bubbly Italian wine.", location: "The Art Loft", date: "2026-03-29" },
  { title: "Volunteer Day: Beach Cleanup", description: "Let's keep our coastline clean. Gloves and bags provided.", location: "Sunset Beach", date: "2026-03-30" },
  { title: "AI & Machine Learning Expo", description: "Showcasing the latest breakthroughs in generative AI models.", location: "Convention Center", date: "2026-03-31" },
  { title: "Stargazing Party", description: "Telescopes provided to observe planets and distant star clusters.", location: "Observatory Hill", date: "2026-04-01" },
  { title: "Breakfast with Founders", description: "Ask anything to successful entrepreneurs over pancakes.", location: "The Diner", date: "2026-04-02" },
  { title: "Dog Park Social", description: "A fun gathering for dogs and their humans. Treats for everyone!", location: "Greenwood Dog Park", date: "2026-04-03" },
  { title: "DIY Home Decor Workshop", description: "Create your own stylish macrame wall hanging for your home.", location: "Craft Shop", date: "2026-04-04" },
  { title: "E-sports Championship", description: "Watch the top teams compete in the League of Legends finals.", location: "Gaming Stadium", date: "2026-04-05" },
  { title: "Silent Disco", description: "Pick your channel and dance like nobody's watching.", location: "Warehouse 42", date: "2026-04-06" },
  { title: "Vegetarian Food Festival", description: "Explore the best plant-based dishes from local restaurants.", location: "Market Square", date: "2026-04-07" },
  { title: "Mindfulness Meditation", description: "A silent guided retreat to reconnect with your inner peace.", location: "Zen Center", date: "2026-04-08" },
  { title: "Business Strategy Masterclass", description: "How to scale your small business in a competitive market.", location: "Executive Suite", date: "2026-04-09" },
  { title: "Tattoo & Piercing Expo", description: "Featuring world-class artists and live tattooing sessions.", location: "Event Hall", date: "2026-04-10" },
  { title: "BBQ & Bluegrass", description: "Slow-cooked brisket and soulful American roots music.", location: "Smokehouse Grill", date: "2026-04-11" },
  { title: "App Development Seminar", description: "The pros and cons of Flutter vs React Native in 2026.", location: "IT Tower", date: "2026-04-12" },
  { title: "Retro Comic Swap", description: "Trade, buy, and sell vintage comics and collectibles.", location: "Comic Haven", date: "2026-04-13" },
  { title: "Barista Skills Workshop", description: "Master the art of latte art and espresso extraction.", location: "Caffeine Lab", date: "2026-04-14" },
  { title: "Sustainable Living Talk", description: "Practical tips for reducing your carbon footprint every day.", location: "Eco Hub", date: "2026-04-15" },
  { title: "Drum & Bass Night", description: "High-energy beats and heavy basslines all night long.", location: "Underground Club", date: "2026-04-16" },
  { title: "Street Food Tour", description: "A guided walking tour of the hidden culinary gems of the city.", location: "Downtown Plaza", date: "2026-04-17" },
  { title: "Morning Pilates", description: "Core strength and flexibility training to jumpstart your day.", location: "Wellness Studio", date: "2026-04-18" },
  { title: "Future of Space Travel", description: "An evening talk with aerospace engineers about Mars missions.", location: "Science Museum", date: "2026-04-19" }
];

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'events');

async function downloadImage(url: string,filepath:string) : Promise<void>{
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    if(!fs.existsSync(UPLOAD_DIR)){
        fs.mkdirSync(UPLOAD_DIR,{recursive:true});
    }

    return new Promise((resolve,reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish',resolve);
        writer.on('error',reject);
    });
}

async function seedDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(async() => {
            db.run("DELETE FROM events");

            const stmt = db.prepare(`
                INSERT INTO events (name, description, location, date, creator_id, image) 
                VALUES (?, ?, ?, ?, ?, ?)
            `);

           for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const categories = ['nature', 'city', 'technology', 'food', 'party', 'people'];
                const category = categories[i % categories.length];
                
               //imitating the filename like it is in multer
                const fileName = `eventImage-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
                const filePath = path.join(UPLOAD_DIR, fileName);
                const sourceUrl = `https://picsum.photos/seed/${category} -${i}/800/600`;

                try {
                    //downloading image
                    await downloadImage(sourceUrl, filePath);
                    
                    // Storing only the name of the file in the database, not the full path
                    stmt.run(
                        event.title,
                        event.description,
                        event.location,
                        event.date,
                        1,
                        fileName, // String that looks like 'eventImage-123.jpg'
                        (err: Error | null) => {
                            if (err) console.error(`❌ DB Error on index ${i}:`, err.message);
                        }
                    );
                    console.log(`📸 [${i+1}/50] Downloaded: ${fileName}`);
                } catch (error) {
                    console.error(`❌ Failed to download image for event ${i}:`, error);
                }
            }

            stmt.finalize((err) => {
                if (err) {
                    console.error("❌ Finalization error:", err);
                    reject(err);
                } else {
                    console.log("✅ 50 events successfully added to SQLite!");
                    resolve();
                }
            });
        });
    });
}

seedDatabase()
    .then(() => {
        console.log("Database seeded successfully.");
    })
    .catch((err) => {
        console.error("Seeding failed:", err);
    })
    .finally(() => {
        //closing the database when the seeding is done
        db.close((err) => {
            if (err) console.error("Error closing DB:", err.message);
            else console.log("Database connection closed.");
        });
    });