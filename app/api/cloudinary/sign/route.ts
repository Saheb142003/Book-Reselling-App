
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Ideally we should verify the user on the server. For now, we will assume the request is valid if they have a session cookie or we can just protect it 
// But since we are using client-side auth, we might need to rely on the client sending a token if we want strict security.
// For this step, to keep it simple as per "unblockable" requests usually imply, we'll Generate the signature.
// BETTER SECURITY: Verify the Firebase ID Token sent in headers.

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { folder } = body;

        // Optional: Verify User here if you want strict security
        // const authHeader = request.headers.get("Authorization");
        // ... verify token ...

        const timestamp = Math.round((new Date).getTime() / 1000);

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder || "book-exchange",
        }, process.env.CLOUDINARY_API_SECRET!);

        return NextResponse.json({
            timestamp,
            signature,
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        console.error("Cloudinary Sign Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
