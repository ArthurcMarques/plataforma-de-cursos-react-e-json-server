import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Curso {
    static schema = z.object({
        id: idSchema,
        titulo: textSchema,
        descricao: textSchema,
        nivel: z.enum(["Iniciante", "Intermediário", "Avançado"]),
        idCategoria: numberSchema,
        idInstrutor: numberSchema,
        dataPublicacao: textSchema,
        totalAulas: numberSchema,
        totalHoras: numberSchema
    });

    constructor(
        public id: RecordId,
        public titulo: string,
        public descricao: string,
        public nivel: "Iniciante" | "Intermediário" | "Avançado",
        public idCategoria: number,
        public idInstrutor: number,
        public dataPublicacao: string,
        public totalAulas: number,
        public totalHoras: number
    ) { }
}
