// Model de progresso de uma aula para um usuario.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class ProgressoAula {
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idAula: idSchema,
        status: z.enum(["Concluído", "Em andamento"]),
        dataConclusao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idAula: RecordId,
        public status: "Concluído" | "Em andamento",
        public dataConclusao: string
    ) { }
}
