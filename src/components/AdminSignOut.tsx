"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOut() {
  return <button className="button ghost" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Sign out</button>;
}
