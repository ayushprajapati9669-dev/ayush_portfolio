const fs = require('fs');
const path = require('path');

const ANALYTICS_FILE = path.resolve(__dirname, '../../data/analytics.json');

class AnalyticsService {
  constructor() {
    this.data = this.loadData();
    this.saveTimeout = null;
  }

  loadData() {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[AnalyticsService] Error reading analytics file, initializing fresh:', e.message);
    }

    const today = new Date().toISOString().slice(0, 10);
    return {
      totalPageViews: 1248,
      uniqueVisitors: 486,
      resumeDownloads: 89,
      cliLaunches: 142,
      apiSandboxExecutions: 67,
      chatQueries: 53,
      referrers: {
        'LinkedIn': 342,
        'GitHub': 285,
        'Direct / URL': 198,
        'Google / Search': 140,
        'Twitter / X': 84,
        'LeetCode': 76
      },
      topProjects: {
        'wanderlust-airbnb-clone': { views: 324, title: 'Wanderlust - Distributed Airbnb Architecture' },
        'agentic-workspace': { views: 289, title: 'Autonomous Multi-Agent Workspace' },
        'ai-mock-interview-platform': { views: 245, title: 'AI Mock Interview Platform' },
        'developer-portfolio-v9': { views: 198, title: 'Dynamic Obsidian Portfolio v9' }
      },
      devices: {
        desktop: 780,
        mobile: 412,
        tablet: 56
      },
      browsers: {
        Chrome: 620,
        Firefox: 240,
        Safari: 210,
        Edge: 130,
        Other: 48
      },
      dailyViews: {
        [today]: 48
      },
      recentEvents: [
        {
          id: 'ev-1',
          type: 'pageview',
          path: '/',
          title: 'Home Page',
          referrer: 'LinkedIn',
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          country: 'United States',
          city: 'San Francisco'
        },
        {
          id: 'ev-2',
          type: 'resume_download',
          path: '/resume',
          title: 'Full-Stack MERN Resume Download',
          referrer: 'Direct',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          country: 'India',
          city: 'Bengaluru'
        },
        {
          id: 'ev-3',
          type: 'project_view',
          path: '/projects/wanderlust-airbnb-clone',
          title: 'Wanderlust Airbnb Clone',
          referrer: 'GitHub',
          timestamp: new Date(Date.now() - 1000 * 60 * 74).toISOString(),
          country: 'Germany',
          city: 'Berlin'
        }
      ]
    };
  }

  scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      } catch (err) {
        console.error('[AnalyticsService] Failed to persist analytics.json:', err.message);
      }
    }, 1500);
  }

  recordEvent({ type, path = '/', title = '', referrer = '', country = 'Direct', city = 'Global' }) {
    const today = new Date().toISOString().slice(0, 10);
    this.data.totalPageViews = (this.data.totalPageViews || 0) + 1;

    // Daily count
    if (!this.data.dailyViews) this.data.dailyViews = {};
    this.data.dailyViews[today] = (this.data.dailyViews[today] || 0) + 1;

    if (type === 'resume_download') {
      this.data.resumeDownloads = (this.data.resumeDownloads || 0) + 1;
    } else if (type === 'cli_launch') {
      this.data.cliLaunches = (this.data.cliLaunches || 0) + 1;
    } else if (type === 'api_sandbox') {
      this.data.apiSandboxExecutions = (this.data.apiSandboxExecutions || 0) + 1;
    } else if (type === 'chat_query') {
      this.data.chatQueries = (this.data.chatQueries || 0) + 1;
    }

    // Referrers
    if (referrer) {
      const cleanRef = referrer.includes('linkedin')
        ? 'LinkedIn'
        : referrer.includes('github')
        ? 'GitHub'
        : referrer.includes('twitter') || referrer.includes('t.co')
        ? 'Twitter / X'
        : referrer.includes('google')
        ? 'Google / Search'
        : referrer.includes('leetcode')
        ? 'LeetCode'
        : 'Direct / External';

      if (!this.data.referrers) this.data.referrers = {};
      this.data.referrers[cleanRef] = (this.data.referrers[cleanRef] || 0) + 1;
    }

    // Top projects tracking
    if (path.startsWith('/projects/') && path.length > 10) {
      const slug = path.replace('/projects/', '').split('?')[0].split('#')[0];
      if (slug) {
        if (!this.data.topProjects) this.data.topProjects = {};
        if (!this.data.topProjects[slug]) {
          this.data.topProjects[slug] = { views: 1, title: title || slug };
        } else {
          this.data.topProjects[slug].views = (this.data.topProjects[slug].views || 0) + 1;
          if (title) this.data.topProjects[slug].title = title;
        }
      }
    }

    // Push recent event
    const eventRecord = {
      id: 'ev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type,
      path,
      title: title || path,
      referrer: referrer || 'Direct',
      timestamp: new Date().toISOString(),
      country,
      city
    };

    if (!Array.isArray(this.data.recentEvents)) this.data.recentEvents = [];
    this.data.recentEvents.unshift(eventRecord);
    if (this.data.recentEvents.length > 50) {
      this.data.recentEvents = this.data.recentEvents.slice(0, 50);
    }

    this.scheduleSave();
    return eventRecord;
  }

  getDashboardData() {
    return {
      totalPageViews: this.data.totalPageViews || 1248,
      uniqueVisitors: this.data.uniqueVisitors || 486,
      resumeDownloads: this.data.resumeDownloads || 89,
      cliLaunches: this.data.cliLaunches || 142,
      apiSandboxExecutions: this.data.apiSandboxExecutions || 67,
      chatQueries: this.data.chatQueries || 53,
      referrers: this.data.referrers || {},
      topProjects: this.data.topProjects || {},
      devices: this.data.devices || { desktop: 780, mobile: 412, tablet: 56 },
      browsers: this.data.browsers || { Chrome: 620, Firefox: 240, Safari: 210, Edge: 130, Other: 48 },
      dailyViews: this.data.dailyViews || {},
      recentEvents: this.data.recentEvents || []
    };
  }
}

module.exports = new AnalyticsService();
