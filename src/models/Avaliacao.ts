import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Avaliacao {
    static schema = z.object({
        id: idSchema,
        idUsuario: numberSchema,
        idCurso: numberSchema,
        nota: numberSchema,
        comentario: textSchema,
        dataAvaliacao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: number,
        public idCurso: number,
        public nota: number,
        public comentario: string,
        public dataAvaliacao: string
    ) { }
}
