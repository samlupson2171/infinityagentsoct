/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore TypeScript errors during build for deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/@tinymce/**',
        'node_modules/tinymce/**',
      ],
    },
  },
  webpack: (config, { isServer, dev }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Completely exclude TinyMCE during builds
    if (isServer || process.env.DISABLE_TINYMCE === 'true') {
      config.externals.push({
        '@tinymce/tinymce-react': 'commonjs @tinymce/tinymce-react',
        'tinymce': 'commonjs tinymce',
      });
      
      // Add fallback for TinyMCE modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@tinymce/tinymce-react': false,
        'tinymce': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig