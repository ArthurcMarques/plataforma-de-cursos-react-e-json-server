// Model de avaliacao feita por usuario em um curso.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Avaliacao {
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idCurso: idSchema,
        nota: numberSchema,
        comentario: textSchema,
        dataAvaliacao: textSchema
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idCurso: RecordId,
        public nota: number,
        public comentario: string,
        public dataAvaliacao: string
    ) { }
}
