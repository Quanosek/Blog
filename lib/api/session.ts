import { NextResponse } from "next/server";

import { auth } from "../auth";
import db from "../db";

export default async function Session() {
  const session = await auth();
  const id = session?.user?.id;
  const user = await db.users.findUnique({ where: { id } });

  //   logged in user with active session check
  if (!(session && user)) {
    return NextResponse.json(
      { message: "Nieuprawniony dostęp" },
      { status: 401 }
    );
  }
}
