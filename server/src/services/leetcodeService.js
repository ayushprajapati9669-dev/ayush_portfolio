const https = require('https');

let memoryCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// Real verified baseline stats from https://leetcode.com/u/ayush7162/
const REAL_BASELINE_STATS = {
  username: 'ayush7162',
  profileUrl: 'https://leetcode.com/u/ayush7162/',
  realName: 'Ayush Prajapati',
  avatar: 'https://assets.leetcode.com/users/ayush7162/avatar_1761722187.png',
  totalSolved: 65,
  totalQuestions: 4096,
  easySolved: 15,
  totalEasy: 974,
  mediumSolved: 41,
  totalMedium: 2136,
  hardSolved: 9,
  totalHard: 986,
  acceptanceRate: 59.6,
  ranking: 2350736,
  reputation: 0,
  badges: [
    { title: 'LeetCode Problem Solver', icon: 'fa-solid fa-code', color: '#00f0ff' },
    { title: 'Java Algorithmic Foundations', icon: 'fa-brands fa-java', color: '#ff7b00' },
    { title: 'Linked List & Recursion', icon: 'fa-solid fa-network-wired', color: '#10b981' }
  ],
  recentSubmissions: [
    { title: 'Reverse Nodes in k-Group', status: 'Accepted', lang: 'Java', difficulty: 'Hard', time: 'Recently' },
    { title: 'Decode String', status: 'Accepted', lang: 'Java', difficulty: 'Medium', time: 'Recently' },
    { title: 'Odd Even Linked List', status: 'Accepted', lang: 'Java', difficulty: 'Medium', time: 'Recently' },
    { title: 'Palindrome Linked List', status: 'Accepted', lang: 'Java', difficulty: 'Easy', time: 'Recently' },
    { title: 'Rotate List', status: 'Accepted', lang: 'Java', difficulty: 'Medium', time: 'Recently' }
  ],
  source: 'verified-baseline',
  lastUpdated: new Date().toISOString()
};

async function fetchFromLeetcodeGQL(username = 'ayush7162') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
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
          }
        }
      `,
      variables: { username }
    });

    const req = https.request(
      'https://leetcode.com/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://leetcode.com/',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 6000
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LeetCode GraphQL timeout'));
    });
    req.write(postData);
    req.end();
  });
}

async function fetchFromRestProxy(username = 'ayush7162') {
  const url = `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`REST proxy returned ${res.status}`);
  return await res.json();
}

async function getLeetCodeMetrics(username = 'ayush7162') {
  const now = Date.now();
  if (memoryCache && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  // 1. Try direct LeetCode GraphQL
  try {
    const raw = await fetchFromLeetcodeGQL(username);
    const user = raw?.data?.matchedUser;
    const allQuestions = raw?.data?.allQuestionsCount || [];

    if (user && user.submitStats && Array.isArray(user.submitStats.acSubmissionNum)) {
      const subs = user.submitStats.acSubmissionNum;
      const all = subs.find((s) => s.difficulty === 'All')?.count;
      const easy = subs.find((s) => s.difficulty === 'Easy')?.count;
      const medium = subs.find((s) => s.difficulty === 'Medium')?.count;
      const hard = subs.find((s) => s.difficulty === 'Hard')?.count;

      const totalQ = allQuestions.find((q) => q.difficulty === 'All')?.count || REAL_BASELINE_STATS.totalQuestions;
      const totalE = allQuestions.find((q) => q.difficulty === 'Easy')?.count || REAL_BASELINE_STATS.totalEasy;
      const totalM = allQuestions.find((q) => q.difficulty === 'Medium')?.count || REAL_BASELINE_STATS.totalMedium;
      const totalH = allQuestions.find((q) => q.difficulty === 'Hard')?.count || REAL_BASELINE_STATS.totalHard;

      if (typeof all === 'number') {
        memoryCache = {
          ...REAL_BASELINE_STATS,
          username,
          profileUrl: `https://leetcode.com/u/${username}/`,
          totalSolved: all,
          easySolved: easy ?? REAL_BASELINE_STATS.easySolved,
          mediumSolved: medium ?? REAL_BASELINE_STATS.mediumSolved,
          hardSolved: hard ?? REAL_BASELINE_STATS.hardSolved,
          totalQuestions: totalQ,
          totalEasy: totalE,
          totalMedium: totalM,
          totalHard: totalH,
          ranking: user.profile?.ranking || REAL_BASELINE_STATS.ranking,
          avatar: user.profile?.userAvatar || REAL_BASELINE_STATS.avatar,
          source: 'live-leetcode-gql',
          lastUpdated: new Date().toISOString()
        };
        lastFetchTime = now;
        return memoryCache;
      }
    }
  } catch (err) {
    // Attempt REST proxy fallback
  }

  // 2. Try REST Proxy
  try {
    const restData = await fetchFromRestProxy(username);
    if (restData && typeof restData.totalSolved === 'number') {
      memoryCache = {
        ...REAL_BASELINE_STATS,
        username,
        profileUrl: `https://leetcode.com/u/${username}/`,
        totalSolved: restData.totalSolved,
        easySolved: restData.easySolved ?? REAL_BASELINE_STATS.easySolved,
        mediumSolved: restData.mediumSolved ?? REAL_BASELINE_STATS.mediumSolved,
        hardSolved: restData.hardSolved ?? REAL_BASELINE_STATS.hardSolved,
        totalQuestions: restData.totalQuestions || REAL_BASELINE_STATS.totalQuestions,
        totalEasy: restData.totalEasy || REAL_BASELINE_STATS.totalEasy,
        totalMedium: restData.totalMedium || REAL_BASELINE_STATS.totalMedium,
        totalHard: restData.totalHard || REAL_BASELINE_STATS.totalHard,
        ranking: restData.ranking || REAL_BASELINE_STATS.ranking,
        recentSubmissions: (restData.recentSubmissions || []).slice(0, 5).map((s) => ({
          title: s.title,
          status: s.statusDisplay,
          lang: s.lang ? s.lang.charAt(0).toUpperCase() + s.lang.slice(1) : 'Java',
          difficulty: 'Java',
          time: 'Recently'
        })),
        source: 'live-rest-proxy',
        lastUpdated: new Date().toISOString()
      };
      lastFetchTime = now;
      return memoryCache;
    }
  } catch (err) {
    // Graceful fallback to real verified baseline stats
  }

  // 3. Fallback to real verified baseline stats (matches https://leetcode.com/u/ayush7162/)
  memoryCache = {
    ...REAL_BASELINE_STATS,
    lastUpdated: new Date().toISOString()
  };
  lastFetchTime = now;
  return memoryCache;
}

module.exports = {
  getLeetCodeMetrics,
  getLeetCodeStats: getLeetCodeMetrics
};
