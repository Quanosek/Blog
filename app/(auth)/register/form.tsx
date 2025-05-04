"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import PasswordInput from "@/components/passwordInput";
import { RegisterUserInput, registerUserSchema } from "@/lib/user-schema";

import styles from "@/styles/forms.module.scss";

export default function FormComponent() {
  const router = useRouter();

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
  });

  const { executeRecaptcha } = useGoogleReCaptcha();
  const [submitting, setSubmitting] = useState(false); // loading state

  const onSubmitHandler: SubmitHandler<RegisterUserInput> = async (values) => {
    if (!executeRecaptcha) {
      return toast.error("Wystąpił błąd podczas ładowania reCAPTCHA");
    }

    try {
      setSubmitting(true);

      // reCAPTCHA verification
      const reCaptchaToken = await executeRecaptcha("register");
      const reCaptchaResponse = await axios.post("/api/reCaptcha", {
        reCaptchaToken,
      });

      console.log("reCaptcha score:", reCaptchaResponse.data.score);

      if (!reCaptchaResponse.data.success) {
        return toast.error("Wystąpił błąd podczas weryfikacji reCAPTCHA");
      }

      // sign up API call
      axios
        .post("/api/users", values)
        .then(() => {
          toast.success("Pomyślnie utworzono nowe konto");
          router.push("/login");
        })
        .catch((err) => {
          reset({ passwordConfirm: "" });
          toast.error(err.response.data.message);
        });
    } catch (error) {
      toast.error("Wystąpił nieoczekiwany błąd, spróbuj ponownie");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className={styles.formLayout}
      onSubmit={handleSubmit(onSubmitHandler)}
    >
      <label>
        <p>Login:</p>
        <input
          {...register("username")}
          maxLength={100}
          autoComplete="username"
        />
        {errors["username"] && <span>{errors["username"].message}</span>}
      </label>

      <label>
        <p>Hasło:</p>
        <PasswordInput function={register} value="password" />
        {errors["password"] && <span>{errors["password"].message}</span>}
      </label>

      <label>
        <p>Potwierdź hasło:</p>
        <PasswordInput function={register} value="passwordConfirm" />
        {errors["passwordConfirm"] && (
          <span>{errors["passwordConfirm"].message}</span>
        )}
      </label>

      <button type="submit" className="green" disabled={submitting}>
        <p>{submitting ? "Ładowanie..." : "Zarejestruj się"}</p>
      </button>
    </form>
  );
}
