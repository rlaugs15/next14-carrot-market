import { getAccessToken, getGitHubProfile, loginAndRedirect } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
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
  const { error, access_token } = await getAccessToken(accessTokenParams);
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  /* 캐럿마켓의 유저 데이터에 필요한 것들을 가져온다. */
  const { id, login, avatar_url } = await getGitHubProfile(
    access_token,
    "https://api.github.com/user"
  );
  const [{ email }] = await getGitHubProfile(access_token, "https://api.github.com/user/emails");
  const user = await prisma.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    loginAndRedirect(user.id);
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
      email,
    },
    select: {
      id: true,
    },
  });
  loginAndRedirect(newUser.id);
}
