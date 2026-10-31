const https = require('https');

async function fetchLeetCodeProfile(username = 'ayush7162') {
  console.log(`Fetching live profile for: ${username}...`);
  const query = JSON.stringify({
    query: `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          username
          profile {
            ranking
            userAvatar
            realName
            aboutMe
            school
            reputation
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges {
            id
            displayName
            icon
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
      }
    `,
    variables: { username }
  });

  return new Promise((resolve, reject) => {
    const req = https.request('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/',
        'Content-Length': Buffer.byteLength(query)
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.write(query);
    req.end();
  });
}

// Also test community leetcode proxy APIs like leetcode-stats-api or alfa-leetcode-api
async function fetchViaPublicRest(username = 'ayush7162') {
  const endpoints = [
    `https://leetcode-stats-api.herokuapp.com/${username}`,
    `https://alfa-leetcode-api.onrender.com/userProfile/${username}`
  ];

  for (const ep of endpoints) {
    try {
      console.log(`Trying REST endpoint: ${ep}...`);
      const res = await fetch(ep, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const json = await res.json();
        console.log(`SUCCESS from ${ep}:`, JSON.stringify(json, null, 2));
        return json;
      }
    } catch (e) {
      console.log(`Failed from ${ep}:`, e.message);
    }
  }
  return null;
}

(async () => {
  try {
    const direct = await fetchLeetCodeProfile('ayush7162');
    console.log('DIRECT GQL RESULT:', JSON.stringify(direct, null, 2));
  } catch (e) {
    console.error('DIRECT GQL ERROR:', e.message);
  }

  try {
    await fetchViaPublicRest('ayush7162');
  } catch (e) {
    console.error('REST ERROR:', e.message);
  }
})();

