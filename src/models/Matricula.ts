// Model de matricula de usuario em curso.
import { z } from "zod";
import { idSchema, numberSchema, textSchema, type RecordId } from "./common";

export class Matricula {
    static schema = z.object({
        id: idSchema,
        idUsuario: idSchema,
        idCurso: idSchema,
        dataMatricula: textSchema,
        dataConclusao: z.union([textSchema, z.null()])
    });

    constructor(
        public id: RecordId,
        public idUsuario: RecordId,
        public idCurso: RecordId,
        public dataMatricula: string,
        public dataConclusao: string | null
    ) { }
}
