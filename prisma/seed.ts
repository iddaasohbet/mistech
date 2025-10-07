import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const IMG = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-plus-teal-select-202409?wid=940&hei=1112&fmt=png-alpha&.v=eDZ4TmIwZjhkZTBEY1FWRFo2MS9LbGFmbVd6K1RXMWxjdEkrQVBucngrcDFjb0hmYnA5QjFGSnVvZmFaamExV2JjNitDN2kyNWFITm1kN1lsSUFHR1hURjI5L3dkZ1AxbDh4SlRZTlN5SGg3elJuQlNOb1hBU2ZGc01uK0d5YTU";
	await prisma.category.upsert({
		where: { slug: "telefonlar" },
		update: {},
		create: { id: "cat-phones", slug: "telefonlar", name: "Telefonlar" }
	});
	await prisma.category.upsert({
		where: { slug: "parcalar" },
		update: {},
		create: { id: "cat-parts", slug: "parcalar", name: "Telefon Parçaları" }
	});

	const iphone = await prisma.product.upsert({
		where: { slug: "iphone-14-pro-max" },
		update: { images: [IMG] },
		create: {
			slug: "iphone-14-pro-max",
			title: "iPhone 14 Pro Max",
			description: "Premium akıllı telefon",
			price: 4999900,
			brand: "Apple",
			images: [IMG],
			categoryId: "cat-phones",
			variants: {
				create: [
					{ name: "Renk: Mor / 256GB", sku: "IP14PM-MOR-256", stock: 5 },
					{ name: "Renk: Siyah / 128GB", sku: "IP14PM-SIY-128", stock: 3 }
				]
			}
		}
	});

	await prisma.product.upsert({
		where: { slug: "samsung-s24-ultra" },
		update: { images: [IMG] },
		create: {
			slug: "samsung-s24-ultra",
			title: "Samsung S24 Ultra",
			description: "Üst seviye performans",
			price: 4599900,
			brand: "Samsung",
			images: [IMG],
			categoryId: "cat-phones",
			variants: {
				create: [
					{ name: "Renk: Siyah / 256GB", sku: "S24U-SIY-256", stock: 8 }
				]
			}
		}
	});

	// Ek ürünler (toplamı 8'e tamamla)
	await prisma.product.upsert({
		where: { slug: "xiaomi-13-pro" },
		update: { images: [IMG] },
		create: {
			slug: "xiaomi-13-pro",
			title: "Xiaomi 13 Pro",
			description: "Amiral gemisi deneyimi",
			price: 3299900,
			brand: "Xiaomi",
			images: [IMG],
			categoryId: "cat-phones"
		}
	});

	await prisma.product.upsert({
		where: { slug: "huawei-p60" },
		update: { images: [IMG] },
		create: {
			slug: "huawei-p60",
			title: "Huawei P60",
			description: "Gelişmiş kamera özellikleri",
			price: 2899900,
			brand: "Huawei",
			images: [IMG],
			categoryId: "cat-phones"
		}
	});

	await prisma.product.upsert({
		where: { slug: "google-pixel-8" },
		update: { images: [IMG] },
		create: {
			slug: "google-pixel-8",
			title: "Google Pixel 8",
			description: "Saf Android",
			price: 3099900,
			brand: "Google",
			images: [IMG],
			categoryId: "cat-phones"
		}
	});

	await prisma.product.upsert({
		where: { slug: "oneplus-12" },
		update: { images: [IMG] },
		create: {
			slug: "oneplus-12",
			title: "OnePlus 12",
			description: "Hız ve performans",
			price: 2799900,
			brand: "OnePlus",
			images: [IMG],
			categoryId: "cat-phones"
		}
	});

	await prisma.product.upsert({
		where: { slug: "oppo-find-x6" },
		update: { images: [IMG] },
		create: {
			slug: "oppo-find-x6",
			title: "OPPO Find X6",
			description: "Şık tasarım",
			price: 2599900,
			brand: "OPPO",
			images: [IMG],
			categoryId: "cat-phones"
		}
	});

	await prisma.product.upsert({
		where: { slug: "realme-gt-neo" },
		update: { images: [IMG] },
		create: {
			slug: "realme-gt-neo",
			title: "realme GT Neo",
			description: "Uygun fiyatlı performans",
			price: 1999900,
			brand: "realme",
			images: [IMG],
			categoryId: "cat-phones"
		}
	});

	await prisma.blogPost.upsert({
		where: { slug: "iphone-14-incelemesi" },
		update: {},
		create: {
			slug: "iphone-14-incelemesi",
			title: "iPhone 14 İncelemesi",
			excerpt: "Kamera ve performans değerlendirmesi",
			content: "Detaylı inceleme..."
		}
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
