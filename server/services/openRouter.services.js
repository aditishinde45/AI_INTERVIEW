import axios from "axios";

export const askAi = async ({ messages }) => {
    //console.log(messages);
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("messages array is empty");
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: messages
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned empty response");
        }

        return content;

    } catch (err) {
        console.log("========== OPENROUTER ERROR ==========");
        console.log("MESSAGE:", err.message);
        console.log("CODE:", err.code);
        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);

        throw err;
    }
};