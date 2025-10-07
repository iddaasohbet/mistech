export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loadAllImports, buildImportedSlug, slugify } from "@/lib/imports";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First try database
    const product = await (prisma as any).product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: { select: { orderItems: true, favorites: true } }
      }
    });

    if (product) {
      return NextResponse.json({ product });
    }

    // Try imported products
    const allImports = await loadAllImports();
    for (const { source, categories } of allImports) {
      for (const category of categories) {
        for (const item of category.items || []) {
          const itemId = String(item.id || item.url || item.title);
          if (itemId === id) {
            return NextResponse.json({
              product: {
                id: itemId,
                title: item.title,
                brand: item.brand || source,
                price: item.price || 0,
                slug: buildImportedSlug(item),
                images: item.image ? [item.image] : [],
                description: item.description || "",
                category: { name: category.category },
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete related records first
    await (prisma as any).productVariant.deleteMany({ where: { productId: id } });
    await (prisma as any).review.deleteMany({ where: { productId: id } });
    await (prisma as any).favorite.deleteMany({ where: { productId: id } });
    
    // Delete the product
    await (prisma as any).product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { title, description, price, brand, images } = body;

    // Check if product exists in database
    const existingProduct = await (prisma as any).product.findUnique({
      where: { id }
    });

    if (existingProduct) {
      // Update existing database product
      const product = await (prisma as any).product.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(price !== undefined && { price: parseInt(price) }),
          ...(brand && { brand }),
          ...(images && { images })
        },
        include: {
          category: true,
          variants: true
        }
      });
      return NextResponse.json({ product });
    } else {
      // For imported products, we'll create a new database entry
      // First, find a default category or create one
      let category = await (prisma as any).category.findFirst({
        where: { slug: "genel" }
      });

      if (!category) {
        category = await (prisma as any).category.create({
          data: {
            slug: "genel",
            name: "Genel"
          }
        });
      }

      const slug = slugify(title) + "-" + id.substring(0, 6);

      // Create new product in database
      const product = await (prisma as any).product.create({
        data: {
          id,
          title,
          description: description || "",
          price: parseInt(price) || 0,
          brand: brand || "",
          slug,
          images: images || [],
          categoryId: category.id
        },
        include: {
          category: true
        }
      });

      return NextResponse.json({ product });
    }
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

