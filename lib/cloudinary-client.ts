
interface CloudinaryResponse {
    secure_url: string;
    // other fields...
}

export async function uploadToCloudinary(file: File, folder: string = "book-exchange"): Promise<string> {
    try {
        // 1. Get Signature
        const signRes = await fetch("/api/cloudinary/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder }),
        });
        
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        
        const { timestamp, signature, apiKey, cloudName } = await signRes.json();

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

        const data: CloudinaryResponse = await uploadRes.json();
        return data.secure_url;
    } catch (error) {
        console.error("Upload Error:", error);
        throw error;
    }
}
