import { auth } from "@/auth"; // your authentication function
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/jobs/[jobid]/check
export async function GET(
  _req: Request,
  { params }: { params: { jobid: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const jobId = params.jobid;

  try {
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: jobId,
        userId: userId,
      },
    });

    return NextResponse.json({
      applied: !!existingApplication,
    });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
