import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Aula {
    static schema = z.object({
        id: idSchema,
        idModulo: numberSchema,
        titulo: textSchema,
        tipoConteudo: z.enum(["Vídeo", "Texto", "Quiz"]),
        urlConteudo: textSchema,
        duracaoMinutos: numberSchema,
        ordem: numberSchema
    });

    constructor(
        public id: RecordId,
        public idModulo: number,
        public titulo: string,
        public tipoConteudo: "Vídeo" | "Texto" | "Quiz",
        public urlConteudo: string,
        public duracaoMinutos: number,
        public ordem: number
    ) { }
}
