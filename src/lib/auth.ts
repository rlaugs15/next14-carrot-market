import { redirect } from "next/navigation";
import { getSession } from "./sessions";

export async function loginAndRedirect(id: number) {
  const session = await getSession();
  session.id = id;
  await session.save();
  return redirect("/profile");
}

export const getAccessToken = async (params: URLSearchParams) => {
  const accessTokenURL = `https://github.com/login/oauth/access_token?${params}`;
  const data = await (
    await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  return data;
};

export const getGitHubProfile = async (access_token: string, url: string) => {
  const result = await (
    await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store",
    })
  ).json();
  return result;
};
