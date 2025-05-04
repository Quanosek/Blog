"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(10); // in seconds

  // auto redirect to home page
  useEffect(() => {
    const counter = setInterval(() => {
      setSeconds((prevSeconds: number) => prevSeconds - 1);
      if (seconds === 1) router.push("/");
    }, 1000);

    return () => clearInterval(counter);
  }, [router, seconds]);

  return (
    <main>
      <h1>Nie znaleziono strony</h1>

      <button onClick={() => router.push("/")}>
        <p>Powrót na stronę główną [{seconds}]</p>
      </button>
    </main>
  );
}
