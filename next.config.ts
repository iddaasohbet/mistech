import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDemoExport = process.env.DEMO_EXPORT === "1";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "cdn.simpleicons.org" },
			{ protocol: "https", hostname: "images.techeblog.com" },
			{ protocol: "https", hostname: "store.storeimages.cdn-apple.com" },
			{ protocol: "https", hostname: "as-images.apple.com" },
			{ protocol: "https", hostname: "mistech.de" },
			{ protocol: "https", hostname: "upload.wikimedia.org" },
			{ protocol: "https", hostname: "euromobilecompany.de" },
			{ protocol: "https", hostname: "www.euromobilecompany.de" },
			{ protocol: "https", hostname: "euromobilecompany.nl" },
			{ protocol: "https", hostname: "www.euromobilecompany.nl" },
			{ protocol: "https", hostname: "hizliresimle.com" }
		],
		// Demo statik exportta optimize edilmesin
		unoptimized: isDemoExport,
	},
	// Ana kökten varsayılan dili (tr) alt yoluna yönlendir
	async redirects() {
		return [
			{ source: '/', destination: '/tr', permanent: true },
		];
	},
	eslint: { ignoreDuringBuilds: true },
	typescript: isDemoExport ? { ignoreBuildErrors: true } as any : undefined,
	// Demo modunda static export al
	...(isDemoExport ? { 
		output: "export" as const,
		// Force inline RSC payloads to avoid server corruption
		experimental: {
			inlineCss: true,
		},
		// Disable RSC streaming to prevent .txt file corruption
		trailingSlash: false,
		distDir: 'out'
	} : {}),
};

export default withNextIntl(nextConfig);
