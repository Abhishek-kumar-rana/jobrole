"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplyButton({ jobId }: { jobId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [applicationStatus, setApplicationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const authenticated = session?.user?.id;

  useEffect(() => {
    if (status !== "authenticated") return;

    async function checkApplication() {
      try {
        const res = await fetch(`/api/jobs/${jobId}/check`);
        const data = await res.json();
        if (data.applied) {
          setApplicationStatus("success");
          setAlreadyApplied(true);
        }
      } catch (err) {
        console.error("Error checking application:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkApplication();
  }, [jobId, status]);

  const handleApply = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setErrorMessage("");
    setApplicationStatus("idle");

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
      });
      console.log("Response status:", response.status);
      setApplicationStatus("success");
      setAlreadyApplied(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to apply for the job");
      }
      setApplicationStatus("error");
    }
  };

  if (isLoading || status === "loading") {
    return (
      <button
        disabled
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md opacity-50 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (applicationStatus === "success") {
    return (
      <div className="text-center">
        <p className="text-green-600 font-medium mb-4">
          {alreadyApplied
            ? "You have already applied for this job."
            : "Application submitted successfully!"}
        </p>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View your applications →
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleApply}
        disabled={isLoading || alreadyApplied}
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Apply for this position
      </button>
      {applicationStatus === "error" && (
        <p className="mt-2 text-red-600 text-center">{errorMessage}</p>
      )}
    </>
  );
}
