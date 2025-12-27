import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";
import CommerceView from "./_components/commerce-view";

export default async function CommercePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get user's catalog with products
  const catalog = await client.productCatalog.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CommerceView slug={slug} initialCatalog={catalog} />
    </div>
  );
}
