"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";

import styles from "@/styles/dashboard.module.scss";

export default function OperationButtonsComponent({
  username,
}: {
  username: string;
}) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false); // loading state

  const logoutHandler = async () => {
    if (!confirm("Czy na pewno chcesz się wylogować?")) return;

    await signOut({ redirect: false });
    toast.success("Zostałeś pomyślnie wylogowany");
    router.push("/login");
    router.refresh();
  };

  const deleteHandler = async () => {
    if (!confirm("Czy na pewno chcesz usunąć swoje konto?")) return;

    try {
      setSubmitting(true);

      // delete user account API request
      axios
        .delete("/api/users", { data: { username } })
        .then(async () => {
          await signOut({ redirect: false });
          toast.success("Twoje konto zostało pomyślnie usunięte");
          router.push("/");
          router.refresh();
        })
        .catch((err) => toast.error(err.response.data.message));
    } catch (error) {
      toast.error("Wystąpił nieoczekiwany błąd, spróbuj ponownie");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.operationButtons}>
      <button onClick={logoutHandler}>
        <p>Wyloguj się</p>
      </button>

      <button className="red" onClick={deleteHandler} disabled={submitting}>
        <p>{submitting ? "Ładowanie..." : "Usuń konto"}</p>
      </button>
    </div>
  );
}
