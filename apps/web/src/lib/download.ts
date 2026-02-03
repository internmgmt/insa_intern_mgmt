    import { toast } from "sonner";

/**
 * Downloads a file from the backend, attempting to use the filename suggested by the server.
 */
export async function downloadFile(url: string, token: string, fallbackName: string) {
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.message || `Download failed: ${res.status}`);
        }

        // Attempt to get filename from Content-Disposition
        const contentDisposition = res.headers.get("Content-Disposition");
        let filename = fallbackName;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        return true;
    } catch (error: any) {
        console.error("Download error:", error);
        toast.error(error.message || "Failed to download file");
        return false;
    }
}
