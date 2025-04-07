import { redirect } from "next/navigation";

export async function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: "http://localhost:3000/github/complete", //Authorization callback URL (인증 콜백 URL)
    scope: "read:user,user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const fullURL = `${baseURL}?${formattedParams}`;

  return redirect(fullURL);
}
