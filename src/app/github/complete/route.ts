import prisma from "@/lib/db";
import { getSession } from "@/lib/sessions";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return notFound();
  }
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  });
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const { error, access_token } = await (
    await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  /* 캐럿마켓의 유저 데이터에 필요한 것들을 가져온다. */
  const { id, login, avatar_url } = await (
    await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store",
    })
  ).json();

  const user = await prisma.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect("/profile");
  }
  const userNameCheck = await prisma.user.findUnique({
    where: {
      username: login,
    },
    select: {
      username: true,
    },
  });
  const newUser = await prisma.user.create({
    data: {
      github_id: id + "",
      avatar: avatar_url,
      username: userNameCheck ? `login-${login}` : login,
    },
    select: {
      id: true,
    },
  });
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}
