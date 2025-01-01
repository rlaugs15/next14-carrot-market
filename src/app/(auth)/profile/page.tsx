import prisma from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { notFound, redirect } from "next/navigation";

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

export default async function Profile() {
  const user = await getUser();
  const logOut = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };
  return (
    <div>
      <h1>{user?.username}</h1>
      <form action={logOut}>
        <button>로그아웃</button>
      </form>
    </div>
  );
}
