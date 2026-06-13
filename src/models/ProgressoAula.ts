// Model de progresso de uma aula para um usuario.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class ProgressoAula {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idAula: numberSchema,
        status: z.enum(["Concluído", "Em andamento"]),
        dataConclusao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idAula: number,
        public status: "Concluído" | "Em andamento",
        public dataConclusao: string
    ) { }
}
