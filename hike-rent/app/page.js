import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/server/session";
import Hero from "@/components/shared/Hero";
import Features from "@/components/shared/Features";
import HowltWorks from "@/components/shared/HowltWorks";
import CTA from "@/components/shared/CTA";

export default async function HomePage() {
  const session = await getCurrentSession();
  if (session.isAdmin) {
    redirect("/admin/dashboard");
  }

  return (
    <>
      <Hero />
      <Features />
      <HowltWorks />
      <CTA />
    </>
  );
}
