export interface CatoChat { sessionId: string; title: string; updatedAt?: string }
export interface CatoCycle { id: number; title: string; status: string }
export interface CatoMessage { id: string; role: "user" | "assistant"; content: string; audioTranscription?: boolean; createdAt?: string }
