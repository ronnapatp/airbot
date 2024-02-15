const cities = ["bangkok", "chiangmai", "phuket"];

import FB from 'fb';
import 'dotenv/config'
// require('dotenv').config()

const cityDataArray = []; 

function getColorEmojiForAQI(aqi) {
  switch (true) {
    case aqi <= 50:
      return '🟢';
    case aqi <= 100:
      return '🟡'; 
    case aqi <= 150:
      return '🟠'; 
    case aqi <= 200:
      return '🔴';
    case aqi <= 300:
      return '🟣'; 
    default:
      return '🟤'; 
  }
}

const fetchPromises = cities.map(city => {
  const apiUrl = `http://api.waqi.info/feed/${city}/?token=${process.env.AIR_API_KEY}`;

  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for ${city}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'ok') {
        const cityData = data.data;
        const cityName = cityData.city.name;
        const aqi = cityData.aqi;
        const emoji = getColorEmojiForAQI(aqi);
        const updateTime = cityData.time.s; 

        const cityObject = {
          name: cityName,
          aqi: aqi,
          emoji: emoji,
          update: updateTime,
        };
        
        cityDataArray.push(cityObject);
      } else {
        console.error(`API returned an error for ${city}:`, data.status);
      }
    })
    .catch(error => {
      console.error(`There was a problem with the fetch operation for ${city}:`, error);
    });
});

Promise.all(fetchPromises)
  .then(() => {

    cityDataArray.sort((a, b) => {
      if (a.name === 'Bangkok') return -1;
      if (b.name === 'Bangkok') return 1;
      if (a.name === 'Chiang Mai') return -1;
      if (b.name === 'Chiang Mai') return 1;
      return a.name.localeCompare(b.name);
    });

    cityDataArray[2].name = 'Phuket';

    const formattedEntries = cityDataArray.map(entry => `${entry.name} - ${entry.aqi} ${entry.emoji}`);

    const postMessage = "คุณภาพอากาศ (AQI)\n" + formattedEntries.join('\n');

    console.log(postMessage)

      FB.setAccessToken(process.env.ACCESS_TOKEN);
      FB.api(
        `/${process.env.PAGE_ID}/feed`,
        'POST',
        { "message": postMessage },
        function (response) {
          if (response.error) {
            console.log('Error occurred: ' + response.error);
            return;
          }
          console.log('Successfully posted to page!');
        }
      );
  });
