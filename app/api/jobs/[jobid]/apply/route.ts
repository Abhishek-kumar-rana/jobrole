import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }:{ params: { jobid: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const { jobid } = params;

  if (!jobid) {
    return new NextResponse("Missing job ID", { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: jobid } });

  if (!job) {
    return new NextResponse("Job not found", { status: 404 });
  }

  const existing = await prisma.application.findFirst({
    where: {
      jobId: jobid,
      userId: session.user.id,
    },
  });

  if (existing) {
    return new NextResponse("Already applied", { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      jobId: jobid,
      userId: session.user.id,
      status: "PENDING",
    },
  });

  return NextResponse.json(application);
}
