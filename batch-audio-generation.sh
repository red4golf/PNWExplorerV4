#!/bin/bash

# Batch audio generation script for remaining 15 locations
# This script generates audio files using ElevenLabs API and inserts them into the database

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "❌ ELEVENLABS_API_KEY environment variable not set"
    exit 1
fi

# Function to generate audio and insert into database
generate_and_insert() {
    local location_id=$1
    local location_name=$2
    local script_text=$3
    local filename="narration-${location_name,,}"
    filename=${filename//[^a-z0-9]/-}
    
    echo "🎵 Generating audio for: $location_name"
    
    # Generate audio using ElevenLabs API
    curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" \
        -H "Accept: audio/mpeg" \
        -H "Content-Type: application/json" \
        -H "Xi-Api-Key: $ELEVENLABS_API_KEY" \
        -d "{
            \"text\": \"$script_text\",
            \"model_id\": \"eleven_monolingual_v1\",
            \"voice_settings\": {
                \"stability\": 0.5,
                \"similarity_boost\": 0.75,
                \"style\": 0.0,
                \"use_speaker_boost\": true
            }
        }" \
        --output "${filename}.mp3" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "${filename}.mp3" ]; then
        local file_size=$(wc -c < "${filename}.mp3")
        local base64_data=$(base64 -w 0 "${filename}.mp3")
        
        echo "✅ Audio generated: ${filename}.mp3 (${file_size} bytes)"
        
        # Insert into database using psql if available, otherwise create SQL file
        if command -v psql >/dev/null 2>&1; then
            psql "$DATABASE_URL" -c "
                INSERT INTO file_storage (filename, location_id, file_data, file_size, mime_type, uploaded_at)
                VALUES ('$filename', $location_id, decode('$base64_data', 'base64'), $file_size, 'audio/mpeg', NOW())
                ON CONFLICT (filename, location_id) DO UPDATE SET
                    file_data = EXCLUDED.file_data,
                    file_size = EXCLUDED.file_size,
                    uploaded_at = NOW();" >/dev/null 2>&1
            
            if [ $? -eq 0 ]; then
                echo "✅ Audio saved to database: $filename"
            else
                echo "❌ Failed to save to database: $filename"
            fi
        else
            echo "⚠️  psql not available, audio file generated but not inserted into database"
        fi
        
        # Clean up temporary file
        rm "${filename}.mp3"
        
        # Rate limiting
        sleep 1
    else
        echo "❌ Failed to generate audio for: $location_name"
    fi
}

echo "🎯 Starting batch audio generation for remaining locations..."
echo ""

# Generate audio for all remaining locations
generate_and_insert 20 "Winslow Ferry Terminal" "Winslow Ferry Terminal on Bainbridge Island serves as the vital maritime link connecting island communities to Seattle, maintaining a transportation tradition that dates back to the late 1800s. The 35-minute ferry ride offers passengers spectacular views of the Seattle skyline, Mount Rainier, and the Olympic Mountains. Washington State Ferries operates one of the largest ferry systems in the United States. The terminal embodies the maritime culture that defines Pacific Northwest life."

generate_and_insert 23 "Historic Strawberry Fields" "Historic Strawberry Fields represents the agricultural heritage that shaped the Pacific Northwest economy for over a century. These fertile fields became the foundation of Washington State's berry industry in the early 1900s. Japanese American families developed innovative farming techniques. During World War Two, many family farms were abandoned when Japanese Americans were forcibly relocated to internment camps. Today, these fields remind us of immigrant farmers who built the Pacific Northwest's agricultural legacy."

generate_and_insert 53 "Pioneer Square - Klondike Gold Rush" "Pioneer Square and the Klondike Gold Rush National Historical Park commemorate one of America's most dramatic economic transformations. In 1897, the steamship Portland arrived in Seattle with gold prospectors and over a ton of Klondike gold, transforming this Pacific Northwest city into the gateway to Alaskan riches. Seattle's population doubled in just two years. Though few prospectors struck it rich, Seattle merchants used gold rush profits to build the foundations of modern Seattle."

generate_and_insert 59 "Manzanar National Historic Site" "Manzanar National Historic Site stands as a solemn reminder of one of America's darkest chapters in civil liberties. Manzanar was one of ten concentration camps where over 110,000 Japanese Americans were forcibly relocated during World War Two. The camp housed over 10,000 people in harsh desert conditions. Many imprisoned families had deep roots in the Pacific Northwest. Today, the site serves as both a memorial and a reminder of protecting civil liberties for all Americans."

generate_and_insert 64 "Rajneeshpuram" "Rajneeshpuram represents one of the most controversial social experiments in Pacific Northwest history. Followers of Bhagwan Shree Rajneesh established a utopian city in remote eastern Oregon in 1981. The community pioneered ecological innovations but created intense conflict with neighboring communities. The situation escalated into criminal activities, including the first bioterror attack in U.S. history. The experiment raises questions about religious freedom and cultural tolerance."

generate_and_insert 65 "Underground Seattle" "Underground Seattle reveals how a city literally raised itself from the ashes. After the Great Seattle Fire of 1889, city planners chose to raise the entire downtown area by 12 feet. As new buildings rose at the elevated level, the original street level became underground passages. These spaces preserved a unique snapshot of late 19th-century architecture and demonstrate the innovative spirit that has defined Seattle's response to challenges."

generate_and_insert 66 "Treaty Rock" "Treaty Rock on the Muckleshoot Reservation marks a sacred place where indigenous peoples gathered for centuries. This natural formation served as a neutral meeting ground where different tribes would negotiate agreements and maintain relationships. When American territorial officials arrived in the 1850s, they chose this respected gathering place to negotiate treaties. Today, Treaty Rock represents both indigenous diplomatic wisdom and the ongoing struggle for tribal rights."

generate_and_insert 69 "Shanghai Tunnels Portland" "Shanghai Tunnels beneath Portland's Old Town tell the dark tale of maritime crime in the late 1800s and early 1900s. These underground passages became notorious for shanghaiing - kidnapping men to serve as crew members on merchant ships. Victims were drugged in waterfront saloons and held in tunnels until ships departed. The tunnels reveal the lawless side of Portland's maritime economy, where human trafficking flourished."

generate_and_insert 70 "Olympic Hot Springs" "Olympic Hot Springs represents sacred waters that have drawn people to the Olympic Peninsula for thousands of years. Indigenous peoples considered these natural thermal pools sacred healing places. In the early 1900s, entrepreneurs built a resort making these waters accessible to visitors. When Olympic National Park was established in 1938, the resort was phased out to preserve wilderness character. The springs exist in their natural state accessible to hikers."

generate_and_insert 79 "Redwood National and State Parks" "Redwood National and State Parks protect the tallest trees on Earth. These ancient coast redwoods, some over 2,000 years old reaching heights of 380 feet, create cathedral-like groves. By the 1960s, 90% of old-growth redwood forests had been cut down. The establishment of Redwood National Park in 1968 saved the remaining groves. The parks demonstrate how conservation efforts can preserve irreplaceable natural treasures for future generations."

generate_and_insert 81 "Sun Valley Resort" "Sun Valley Resort revolutionized winter recreation and launched the modern ski industry in America when it opened in 1936. Railroad magnate Averell Harriman chose this Idaho location for reliable snow, sunshine, and dramatic mountain scenery. Sun Valley introduced the world's first chairlift, transforming skiing into an accessible recreational activity. The resort became a playground for Hollywood celebrities and wealthy Americans, sparking the development of ski resorts throughout the western United States."

generate_and_insert 82 "Sawtooth National Recreation Area" "Sawtooth National Recreation Area showcases the wild heart of Idaho, where jagged granite peaks rise dramatically above pristine alpine lakes. This protected landscape preserves spectacular mountain scenery with over 40 peaks exceeding 10,000 feet. The area provides critical habitat for wildlife including elk, mountain goats, and chinook salmon. The Salmon River offers challenging whitewater rafting. The Sawtooths represent untamed wilderness protected as a refuge for both wildlife and the human spirit."

generate_and_insert 83 "Lava Beds National Monument" "Lava Beds National Monument preserves both geological wonders and the site of the Modoc War. The monument's rugged landscape of lava tube caves provided a natural fortress for Captain Jack and his Modoc warriors, who resisted federal forces for months in 1872-1873. The lava tubes tell the geological story of massive volcanic eruptions that shaped the region. Today, visitors can explore the same caves where Modoc families sought refuge during this tragic conflict."

generate_and_insert 110 "Boeing Red Barn Historic Site" "Boeing's Red Barn stands as the birthplace of commercial aviation, where William Boeing's Pacific Aero Products Company began building airplanes in 1916. This humble wooden structure witnessed the creation of Boeing's first aircraft, launching what would become the world's largest aerospace company. The Red Barn represents the entrepreneurial spirit that transformed Seattle into the global center of aerospace manufacturing. Modern commercial aviation began in this simple building beside a Seattle lake."

generate_and_insert 111 "Museum of Flight" "The Museum of Flight in Seattle stands as one of the world's premier aviation museums, chronicling humanity's journey from the Wright brothers' first flight to modern space exploration. Located on the original Boeing Field, this museum occupies a site where aviation history was made. The museum houses over 175 aircraft and spacecraft. Seattle's connection to aviation runs deep, with Boeing calling this region home since 1916. The museum demonstrates how the Pacific Northwest became the epicenter of aerospace innovation."

echo ""
echo "🎯 Batch audio generation complete!"
echo "✅ All 15 remaining locations should now have audio narration"