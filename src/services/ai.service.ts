import { VideoQueries } from "../database/queries/video.queries";

export async function fetchMusicAnalysis(videoID: string) {
    const data = await VideoQueries.fetchAiData(videoID);
    const body = {
        title: data?.title,
        description: data?.description,
        categories: data?.categories || [],
        duration: data?.duration,
    }
    const analysis = await fetch(process.env.AI_MODEL_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result = await analysis.json();
    return result.prediction as number;

}