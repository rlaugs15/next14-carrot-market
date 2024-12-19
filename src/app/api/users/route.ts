import { NextRequest } from "next/server";
//get 요청
export async function GET(request: NextRequest) {
  console.log(request);
  return Response.json({
    ok: true,
  });
}

//post 요청
export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("log the user in!!!");
  return Response.json(data);
}
