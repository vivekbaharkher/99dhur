"use client";
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Validate essential environment variables
const validateEnvironment = () => {
  const requiredVars = [
    'NEXT_PUBLIC_WEB_URL',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_END_POINT'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_WEB_URL);
    new URL(process.env.NEXT_PUBLIC_API_URL);
  } catch (error) {
    throw new Error(`Invalid URL format in environment variables: ${error.message}`);
  }
}

// Array of static routes that can be easily modified based on the project structure
const staticRoutes = [
  '/',
  '/about-us',
  '/contact-us',
  '/privacy-policy',
  '/terms-and-conditions',
  '/faqs',
  '/search',
  '/subscription-plan',
  '/all/categories',
  '/all/agents',
  '/all/articles',
  '/projects',
  '/properties'
];

// This will be set after fetching settings
let defaultLanguageCode = '';
let defaultLanguageId = '';

const generateUrlEntry = (path, priority) => {
  // Add language code to path, but not for the root path which should remain as just the language code
  const pathWithLang = path ? `${defaultLanguageCode}/${path}` : defaultLanguageCode;
  // Add trailing slash to URL paths since trailingSlash: true is being used
  const url = pathWithLang ? `${process.env.NEXT_PUBLIC_WEB_URL}/${pathWithLang}/` : `${process.env.NEXT_PUBLIC_WEB_URL}/`;
  return `<url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const fetchSettings = async () => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}web-settings`;
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }
}

// Function to fetch dynamic routes from APIs
const fetchDynamicRoutes = async () => {
  try {
    let allDynamicRoutes = [];

    // Configuration for dynamic routes and their corresponding APIs
    const dynamicRouteConfigs = [
      {
        route: "/property-details/[slug]",
        apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-property-list`,
        pathExtractor: (data) => data?.slug_id,
        params: { limit: 12, offset: 0 },
        dataLocation: 'data',
        headers: {
          'Content-Language': defaultLanguageCode
        },
        apiRequestType: "get"
      },
      {
        route: "/project-details/[slug]",
        apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-projects`,
        pathExtractor: (data) => data?.slug_id,
        params: { limit: 12, offset: 0 },
        dataLocation: 'data',
        headers: {
          'Content-Language': defaultLanguageCode
        },
        apiRequestType: "get"
      },
      {
        route: "/article-details/[slug]",
        apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get_articles`,
        pathExtractor: (data) => data?.slug_id,
        params: { limit: 12, offset: 0 },
        dataLocation: 'data',
        headers: {
          'Content-Language': defaultLanguageCode
        },
        apiRequestType: "get"
      },
      {
        route: "/agent-details/[slug]",
        apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}agent-list`,
        pathExtractor: (data) => data?.slug_id,  // For agents, use ID as slug
        params: { limit: 12, offset: 0 },
        dataLocation: 'data',
        headers: {
          'Content-Language': defaultLanguageCode
        },
        apiRequestType: "get"
      }
    ];

    // Process each dynamic route configuration
    for (const config of dynamicRouteConfigs) {
      try {
        const response = await axios.get(config.apiEndpoint, { params: config.params, headers: config.headers || {} });

        // Extract parameter name from route pattern
        const paramMatch = config.route.match(/\[(.*?)\]/);
        if (!paramMatch) {
          console.warn(`Invalid route pattern: ${config.route}`);
          continue;
        }
        const paramName = paramMatch[1];

        // Map API response to route paths
        if (response.data && typeof response.data === 'object') {
          // Navigate to the correct data array location
          let dataArray = response.data;

          // Check if dataLocation is specified and extract the data
          if (config.dataLocation && dataArray[config.dataLocation]) {
            dataArray = dataArray[config.dataLocation];
          }

          if (Array.isArray(dataArray)) {
            const routes = dataArray
              .filter(item => {
                const path = config.pathExtractor(item);
                return path && typeof path === 'string' && path.trim() !== '';
              })
              .map(item => {
                const paramValue = config.pathExtractor(item);
                const actualPath = config.route.replace(`[${paramName}]`, paramValue);
                return {
                  route: config.route,
                  path: actualPath.startsWith('/') ? actualPath.slice(1) : actualPath
                };
              });
            allDynamicRoutes = [...allDynamicRoutes, ...routes];
          } else {
            console.warn(`Expected array but got ${typeof dataArray} for ${config.route}`);
          }
        } else {
          console.warn(`Invalid response data for ${config.route}`);
        }
      } catch (error) {
        console.error(`Error fetching data for ${config.route}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
        }
      }
    }

    return allDynamicRoutes;
  } catch (error) {
    console.error('Error in fetchDynamicRoutes:', error.message);
    return [];
  }
};

const generateSitemap = async () => {
  try {
    // First validate environment variables
    validateEnvironment();
    // First, fetch settings to get the language code
    const settings = await fetchSettings();
    if (!settings || !settings.data) {
      console.error('Failed to fetch settings or invalid settings data');
      return;
    }

    // Set global defaultLanguageCode for use in URL generation
    defaultLanguageCode = settings.data?.default_language || 'en-new';
    defaultLanguageId = settings.data?.languages?.find(lang => lang.code === defaultLanguageCode)?.id;

    if (!defaultLanguageCode || !defaultLanguageId) {
      console.error('No default language code or ID found in settings');
      return;
    }


    // Initialize the sitemap entries array
    let sitemapEntries = [];

    // Add static routes
    staticRoutes.forEach(route => {
      const normalizedRoute = route === '/' ? '' : route.startsWith('/') ? route.slice(1) : route;
      sitemapEntries.push(generateUrlEntry(normalizedRoute, 0.9));
    });

    // Fetch and add dynamic routes from APIs
    const dynamicRoutes = await fetchDynamicRoutes();
    if (dynamicRoutes.length === 0) {
      console.warn('No dynamic routes were found or returned from the APIs');
    }

    dynamicRoutes.forEach(({ path }) => {
      const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
      sitemapEntries.push(generateUrlEntry(normalizedPath, 0.8)); // Lower priority for dynamic routes
    });


    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>`;

    // Make sure the public directory exists
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }

    fs.writeFileSync('public/sitemap.xml', sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error.message);
    process.exit(1);
  }
}

generateSitemap();
